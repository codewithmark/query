function query(sql, params = []) {
  let paramIndex = 0;

  // Check if we're using named parameters (object) vs positional parameters (array)
  const isNamedParams = params.length === 1 && typeof params[0] === 'object' && !Array.isArray(params[0]);
  const namedParams = isNamedParams ? params[0] : {};

  const tokens = [];
  let i = 0;
  while (i < sql.length) {
    if (sql[i] === '?' && !isNamedParams) {
      tokens.push({ type: 'param', index: paramIndex, value: params[paramIndex++] });
      i++;
    } else if (sql[i] === ':' && isNamedParams) {
      // Handle named parameters like :id, :email, :tbl
      i++; // skip the ':'
      let paramName = '';
      while (i < sql.length && /[a-zA-Z0-9_]/.test(sql[i])) {
        paramName += sql[i++];
      }
      if (paramName) {
        tokens.push({ type: 'namedParam', name: paramName, value: namedParams[paramName] });
      }
    } else {
      let chunk = '';
      while (i < sql.length && sql[i] !== '?' && sql[i] !== ':') {
        chunk += sql[i++];
      }
      if (chunk) {
        tokens.push({ type: 'sql', value: chunk });
      }
    }
  }

  // Find the data array - for named params, look for 'tbl' parameter pointing to array
  let data;
  if (isNamedParams) {
    const tblName = namedParams.tbl;
    if (tblName && Array.isArray(namedParams[tblName])) {
      data = namedParams[tblName];
    } else {
      // Look for any array in the named params
      data = Object.values(namedParams).find(v => Array.isArray(v));
    }
  } else {
    data = params.find(p => Array.isArray(p));
  }

  const substitutedSql = tokens.map(t => {
    if (t.type === 'sql') return t.value;
    if (t.type === 'namedParam') {
      if (t.name === 'tbl' && Array.isArray(t.value)) return '?';
      if (typeof t.value === 'string') return `'${t.value}'`;
      return String(t.value);
    }
    if (t.type === 'param') {
      if (typeof t.value === 'string') return `'${t.value}'`;
      if (typeof t.value === 'object' && Array.isArray(t.value)) return '?';
      return String(t.value);
    }
    return '';
  }).join('').replace(/\s+/g, ' ').trim();

  function parseValue(v) {
    const clean = v.trim().replace(/^['"]|['"]$/g, '');
    return /^\d+(\.\d+)?$/.test(clean) ? Number(clean) : clean;
  }

  function parseFieldWithAlias(field) {
    const asMatch = field.match(/^(.+?)\s+as\s+(\w+)$/i);
    if (asMatch) {
      return { field: asMatch[1].trim(), alias: asMatch[2].trim() };
    }
    return { field: field.trim(), alias: null };
  }

  function evaluateCondition(item, key, op, value) {
    const v = item[key];
    switch (op) {
      case '=': return v == value;
      case '!=': return v != value;
      case '>': return v > value;
      case '<': return v < value;
      case '>=': return v >= value;
      case '<=': return v <= value;
      case 'LIKE': 
        if (typeof v !== 'string') return false;
        const pattern = value.replace(/%/g, '.*').replace(/_/g, '.');
        return new RegExp(`^${pattern}$`, 'i').test(v);
      case 'BETWEEN':
        const [min, max] = value;
        return v >= min && v <= max;
      case 'IS NULL': return v == null;
      case 'IS NOT NULL': return v != null;
      default: return false;
    }
  }

  function tokenizeWhereClause(clause) {
    const regex = /([a-zA-Z_][\w]*)\s*(>=|<=|!=|=|>|<|LIKE|BETWEEN|IS\s+NULL|IS\s+NOT\s+NULL)\s*('[^']*'|"[^"]*"|\S+(?:\s+AND\s+\S+)?)/gi;
    const logicRegex = /\b(and|or)\b/gi;
    const tokens = [];

    let match;
    let lastIndex = 0;

    while ((match = regex.exec(clause)) !== null) {
      if (regex.lastIndex > lastIndex) {
        const between = clause.slice(lastIndex, match.index).trim();
        if (between) {
          const logicTokens = between.match(logicRegex);
          if (logicTokens) tokens.push(...logicTokens.map(t => t.toUpperCase()));
        }
      }
      tokens.push(`${match[1]}${match[2]}${match[3] || ''}`);
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < clause.length) {
      const remaining = clause.slice(lastIndex).trim();
      const logicTokens = remaining.match(logicRegex);
      if (logicTokens) tokens.push(...logicTokens.map(t => t.toUpperCase()));
    }

    return tokens;
  }

  function parseCondition(tokens) {
    const stack = [];
    function evalExpr() {
      let left = stack.pop();
      if (typeof left === 'function') return left;
      const op = stack.pop();
      const right = stack.pop();
      if (op === 'AND') return item => left(item) && right(item);
      if (op === 'OR') return item => left(item) || right(item);
      return () => true;
    }

    const output = [];
    const ops = [];
    const precedence = { OR: 1, AND: 2 };

    while (tokens.length) {
      const token = tokens.shift();
      if (token === '(') {
        ops.push(token);
      } else if (token === ')') {
        while (ops.length && ops[ops.length - 1] !== '(') {
          output.push(ops.pop());
        }
        ops.pop();
      } else if (/^(AND|OR)$/i.test(token)) {
        const o1 = token.toUpperCase();
        while (ops.length && precedence[ops[ops.length - 1]] >= precedence[o1]) {
          output.push(ops.pop());
        }
        ops.push(o1);
      } else {
        const betweenMatch = token.match(/(\w+)BETWEEN(.+)/i);
        const likeMatch = token.match(/(\w+)LIKE(.+)/i);
        const isNullMatch = token.match(/(\w+)IS\s+NULL/i);
        const isNotNullMatch = token.match(/(\w+)IS\s+NOT\s+NULL/i);
        const standardMatch = token.match(/(\w+)(>=|<=|!=|=|>|<)(.+)/);
        
        if (betweenMatch) {
          const [, key, values] = betweenMatch;
          const parts = values.trim().split(/\s+AND\s+/i);
          if (parts.length === 2) {
            const min = parseValue(parts[0]);
            const max = parseValue(parts[1]);
            output.push(item => evaluateCondition(item, key, 'BETWEEN', [min, max]));
          }
        } else if (likeMatch) {
          const [, key, val] = likeMatch;
          const parsed = parseValue(val);
          output.push(item => evaluateCondition(item, key, 'LIKE', parsed));
        } else if (isNullMatch) {
          const [, key] = isNullMatch;
          output.push(item => evaluateCondition(item, key, 'IS NULL', null));
        } else if (isNotNullMatch) {
          const [, key] = isNotNullMatch;
          output.push(item => evaluateCondition(item, key, 'IS NOT NULL', null));
        } else if (standardMatch) {
          const [, key, op, val] = standardMatch;
          const parsed = parseValue(val);
          output.push(item => evaluateCondition(item, key, op, parsed));
        }
      }
    }

    while (ops.length) output.push(ops.pop());

    for (const token of output) stack.push(token);
    return evalExpr();
  }

  function matchConditions(item, clause) {
    if (!clause) return true;
    const tokens = tokenizeWhereClause(clause);
    const evaluator = parseCondition(tokens);
    return evaluator(item);
  }

  // INSERT
  if (/^insert into/i.test(substitutedSql)) {
    const insertData = params[1];
    if (!Array.isArray(data)) throw new Error('First parameter must be a target array.');
    if (Array.isArray(insertData)) {
      for (const row of insertData) {
        if (typeof row === 'object' && !Array.isArray(row)) {
          data.push({ ...row });
        } else {
          throw new Error('Each row must be an object.');
        }
      }
      return insertData;
    }
    if (typeof insertData === 'object') {
      data.push({ ...insertData });
      return insertData;
    }
    throw new Error('Invalid INSERT format.');
  }

  // DELETE
  if (/^delete from/i.test(substitutedSql)) {
    const fromMatch = substitutedSql.match(/delete from\s+\?\s*(where\s+(.+))?/i);
    if (!data) throw new Error('First parameter must be an array.');
    const whereClause = fromMatch?.[2];
    for (let i = data.length - 1; i >= 0; i--) {
      if (matchConditions(data[i], whereClause)) data.splice(i, 1);
    }
    return data;
  }

  // UPDATE
  if (/^update/i.test(substitutedSql)) {
    const updateMatch = substitutedSql.match(/update\s+\?\s+set\s+(.+?)\s*(where\s+(.+))?$/i);
    if (!data) throw new Error('First parameter must be an array.');
    const setPart = updateMatch[1];
    const whereClause = updateMatch[3];
    const updates = Object.fromEntries(
      setPart.split(',').map(pair => {
        const [key, val] = pair.split('=').map(s => s.trim());
        return [key, parseValue(val)];
      })
    );
    for (const item of data) {
      if (matchConditions(item, whereClause)) {
        for (const [key, val] of Object.entries(updates)) {
          item[key] = val;
        }
      }
    }
    return data;
  }

  // SELECT
  if (/^select/i.test(substitutedSql)) {
    if (!data) throw new Error("First parameter must be an array.");
    const whereMatch = substitutedSql.match(/where\s+(.+?)(\s+group by|\s+order by|\s+limit|\s*$)/i);
    const groupMatch = substitutedSql.match(/group by\s+(\w+)(\s+having\s+(.+?))?(\s+order by|\s+limit|\s*$)/i);
    const orderMatch = substitutedSql.match(/order by\s+(\w+)(\s+(asc|desc))?/i);
    const limitMatch = substitutedSql.match(/limit\s+(\d+)(\s+offset\s+(\d+))?/i);
    const selectMatch = substitutedSql.match(/select\s+(.+?)\s+from/i);
    const distinctMatch = substitutedSql.match(/select\s+distinct\s+(.+?)\s+from/i);

    const fieldsRaw = selectMatch ? selectMatch[1] : '*';
    const isDistinct = distinctMatch !== null;
    const actualFields = isDistinct ? distinctMatch[1] : fieldsRaw;
    const fieldsParsed = actualFields.split(',').map(f => parseFieldWithAlias(f));
    const fields = fieldsParsed.map(fp => fp.field);

    const paramQueue = isNamedParams ? Object.entries(namedParams).filter(([key, val]) => !Array.isArray(val) && key !== 'tbl') : [...params];
    const dataArray = data;
    if (!isNamedParams) {
      const dataIndex = paramQueue.findIndex(p => Array.isArray(p));
      if (dataIndex >= 0) paramQueue.splice(dataIndex, 1);
    }

    let rows = [...dataArray];

    if (whereMatch) {
      const raw = whereMatch[1];
      let clause;
      if (isNamedParams) {
        // Replace named parameters in WHERE clause
        clause = raw.replace(/:(\w+)/g, (match, paramName) => {
          const val = namedParams[paramName];
          return typeof val === 'string' ? `'${val}'` : String(val);
        });
      } else {
        clause = raw.replace(/\?/g, () => {
          const val = paramQueue.shift();
          return typeof val === 'string' ? `'${val}'` : String(val);
        });
      }
      rows = rows.filter(item => matchConditions(item, clause));
    }

    if (groupMatch) {
      const groupKey = groupMatch[1];
      const havingClause = groupMatch[3];
      const grouped = {};

      for (const row of rows) {
        const key = row[groupKey];
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(row);
      }

      rows = Object.entries(grouped).map(([key, group]) => {
        const result = { [groupKey]: parseValue(key) };
        for (let i = 0; i < fields.length; i++) {
          const field = fields[i];
          const fieldInfo = fieldsParsed[i];
          const alias = fieldInfo.alias;
          
          if (/count\(\*\)/i.test(field)) {
            result[alias || 'count'] = group.length;
          }
          else if (/count\((\w+)\)/i.test(field)) {
            const col = field.match(/count\((\w+)\)/i)[1];
            result[alias || `count_${col}`] = group.filter(row => row[col] != null).length;
          }
          else if (/sum\((\w+)\)/i.test(field)) {
            const col = field.match(/sum\((\w+)\)/i)[1];
            result[alias || `sum_${col}`] = group.reduce((a, b) => a + Number(b[col] || 0), 0);
          }
          else if (/avg\((\w+)\)/i.test(field)) {
            const col = field.match(/avg\((\w+)\)/i)[1];
            result[alias || `avg_${col}`] = group.reduce((a, b) => a + Number(b[col] || 0), 0) / group.length;
          }
          else if (/min\((\w+)\)/i.test(field)) {
            const col = field.match(/min\((\w+)\)/i)[1];
            const values = group.map(row => row[col]).filter(v => v != null);
            result[alias || `min_${col}`] = values.length > 0 ? Math.min(...values) : null;
          }
          else if (/max\((\w+)\)/i.test(field)) {
            const col = field.match(/max\((\w+)\)/i)[1];
            const values = group.map(row => row[col]).filter(v => v != null);
            result[alias || `max_${col}`] = values.length > 0 ? Math.max(...values) : null;
          }
          else if (field !== groupKey) {
            // Handle regular columns (take first value from group)
            result[alias || field] = group[0][field];
          }
        }
        return result;
      });

      if (havingClause) {
        rows = rows.filter(item => matchConditions(item, havingClause));
      }
    }

    if (orderMatch) {
      const [, key, , dir] = orderMatch;
      const desc = dir?.toLowerCase() === 'desc';
      rows.sort((a, b) => {
        if (a[key] < b[key]) return desc ? 1 : -1;
        if (a[key] > b[key]) return desc ? -1 : 1;
        return 0;
      });
    }

    if (limitMatch) {
      const limit = Number(limitMatch[1]);
      const offset = Number(limitMatch[3]) || 0;
      rows = rows.slice(offset, offset + limit);
    }

    if (fields.includes('*')) {
      if (isDistinct) {
        // Remove duplicates for * queries
        const seen = new Set();
        rows = rows.filter(row => {
          const key = JSON.stringify(row);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      }
      return rows;
    }

    let result = rows.map(row => {
      const resultRow = {};
      for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        const fieldInfo = fieldsParsed[i];
        const alias = fieldInfo.alias || field;
        resultRow[alias] = row[field];
      }
      return resultRow;
    });

    if (isDistinct) {
      // Remove duplicates based on selected fields
      const seen = new Set();
      result = result.filter(row => {
        const key = JSON.stringify(row);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    return result;
  }

  throw new Error('Unsupported SQL operation.');
}
