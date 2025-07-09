function query(sql, params = []) {
  let paramIndex = 0;

  const tokens = [];
  let i = 0;
  while (i < sql.length) {
    if (sql[i] === '?') {
      tokens.push({ type: 'param', index: paramIndex, value: params[paramIndex++] });
      i++;
    } else {
      let chunk = '';
      while (i < sql.length && sql[i] !== '?') {
        chunk += sql[i++];
      }
      tokens.push({ type: 'sql', value: chunk });
    }
  }

  const data = params.find(p => Array.isArray(p));

  const substitutedSql = tokens.map(t => {
    if (t.type === 'sql') return t.value;
    if (typeof t.value === 'string') return `'${t.value}'`;
    if (typeof t.value === 'object' && Array.isArray(t.value)) return '?';
    return String(t.value);
  }).join('').replace(/\s+/g, ' ').trim();

  function parseValue(v) {
    const clean = v.trim().replace(/^['"]|['"]$/g, '');
    return /^\d+(\.\d+)?$/.test(clean) ? Number(clean) : clean;
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
      default: return false;
    }
  }

  function tokenizeWhereClause(clause) {
    const regex = /([a-zA-Z_][\w]*)\s*(>=|<=|!=|=|>|<)\s*('[^']*'|"[^"]*"|\S+)/g;
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
      tokens.push(`${match[1]}${match[2]}${match[3]}`);
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
        const match = token.match(/(\w+)(>=|<=|!=|=|>|<)(.+)/);
        if (match) {
          const [, key, op, val] = match;
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

    const fieldsRaw = selectMatch ? selectMatch[1] : '*';
    const fields = fieldsRaw.split(',').map(f => f.trim());

    const paramQueue = [...params];
    const dataArray = paramQueue.find(p => Array.isArray(p));
    paramQueue.splice(paramQueue.indexOf(dataArray), 1);

    let rows = [...dataArray];

    if (whereMatch) {
      const raw = whereMatch[1];
      const clause = raw.replace(/\?/g, () => {
        const val = paramQueue.shift();
        return typeof val === 'string' ? `'${val}'` : String(val);
      });
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
        for (const field of fields) {
          if (/count\(\*\)/i.test(field)) result['count'] = group.length;
          else if (/sum\((\w+)\)/i.test(field)) {
            const col = field.match(/sum\((\w+)\)/i)[1];
            result[`sum_${col}`] = group.reduce((a, b) => a + Number(b[col] || 0), 0);
          }
          else if (/avg\((\w+)\)/i.test(field)) {
            const col = field.match(/avg\((\w+)\)/i)[1];
            result[`avg_${col}`] = group.reduce((a, b) => a + Number(b[col] || 0), 0) / group.length;
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

    if (fields.includes('*')) return rows;

    return rows.map(row => Object.fromEntries(
      fields.map(f => [f, row[f]])
    ));
  }

  throw new Error('Unsupported SQL operation.');
}
