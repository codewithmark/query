// Index management system
const indexes = new Map(); // Map of dataArray -> Map of column -> index

function createIndex(dataArray, column, type = 'hash') {
  const arrayKey = dataArray;
  if (!indexes.has(arrayKey)) {
    indexes.set(arrayKey, new Map());
  }
  
  const arrayIndexes = indexes.get(arrayKey);
  
  if (type === 'hash') {
    // Hash index for equality lookups
    const hashIndex = new Map();
    dataArray.forEach((row, rowIndex) => {
      const value = row[column];
      if (!hashIndex.has(value)) {
        hashIndex.set(value, []);
      }
      hashIndex.get(value).push(rowIndex);
    });
    arrayIndexes.set(`${column}_hash`, hashIndex);
  } else if (type === 'sorted') {
    // Sorted index for range queries and ORDER BY
    const sortedIndex = dataArray
      .map((row, index) => ({ value: row[column], index }))
      .sort((a, b) => {
        if (a.value < b.value) return -1;
        if (a.value > b.value) return 1;
        return 0;
      });
    arrayIndexes.set(`${column}_sorted`, sortedIndex);
  }
}

function getIndex(dataArray, column, type = 'hash') {
  const arrayKey = dataArray;
  const arrayIndexes = indexes.get(arrayKey);
  if (!arrayIndexes) return null;
  return arrayIndexes.get(`${column}_${type}`) || null;
}

function dropIndex(dataArray, column, type = 'hash') {
  const arrayKey = dataArray;
  const arrayIndexes = indexes.get(arrayKey);
  if (arrayIndexes) {
    arrayIndexes.delete(`${column}_${type}`);
  }
}

function dropAllIndexes(dataArray) {
  const arrayKey = dataArray;
  indexes.delete(arrayKey);
}

// Auto-index creation for frequently queried columns
function autoCreateIndex(dataArray, column, operator) {
  if (dataArray.length < 100) return; // Skip for small datasets
  
  const shouldCreateHash = ['=', '!='].includes(operator);
  const shouldCreateSorted = ['>', '<', '>=', '<=', 'BETWEEN'].includes(operator);
  
  if (shouldCreateHash && !getIndex(dataArray, column, 'hash')) {
    createIndex(dataArray, column, 'hash');
  }
  if (shouldCreateSorted && !getIndex(dataArray, column, 'sorted')) {
    createIndex(dataArray, column, 'sorted');
  }
}

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

  // Optimized filtering using indexes
  function filterWithIndex(dataArray, conditions) {
    if (!conditions || conditions.length === 0) return [...dataArray];
    
    let candidateIndexes = null;
    
    // Try to use indexes for simple conditions
    for (const condition of conditions) {
      if (condition.type === 'condition') {
        const { key, op, value } = condition;
        autoCreateIndex(dataArray, key, op);
        
        if (op === '=' && candidateIndexes === null) {
          const hashIndex = getIndex(dataArray, key, 'hash');
          if (hashIndex && hashIndex.has(value)) {
            candidateIndexes = new Set(hashIndex.get(value));
          }
        } else if (['>', '<', '>=', '<='].includes(op) && candidateIndexes === null) {
          const sortedIndex = getIndex(dataArray, key, 'sorted');
          if (sortedIndex) {
            const matchingIndexes = [];
            for (const item of sortedIndex) {
              if (evaluateCondition({ [key]: item.value }, key, op, value)) {
                matchingIndexes.push(item.index);
              }
            }
            candidateIndexes = new Set(matchingIndexes);
          }
        }
      }
    }
    
    // If we have candidate indexes, filter from those; otherwise, filter all
    if (candidateIndexes) {
      return Array.from(candidateIndexes)
        .map(index => dataArray[index])
        .filter(item => matchConditions(item, null, conditions));
    }
    
    return dataArray.filter(item => matchConditions(item, null, conditions));
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

  function matchConditions(item, clause, parsedConditions = null) {
    if (!clause && !parsedConditions) return true;
    
    if (parsedConditions) {
      // Use pre-parsed conditions for index optimization
      return evaluateParsedConditions(item, parsedConditions);
    }
    
    const tokens = tokenizeWhereClause(clause);
    const evaluator = parseCondition(tokens);
    return evaluator(item);
  }
  
  function evaluateParsedConditions(item, conditions) {
    // Simple evaluation for now - can be optimized further
    for (const condition of conditions) {
      if (condition.type === 'condition') {
        if (!evaluateCondition(item, condition.key, condition.op, condition.value)) {
          return false;
        }
      }
    }
    return true;
  }

  // Enhanced ORDER BY with index support
  function sortWithIndex(dataArray, sortKey, desc = false) {
    const sortedIndex = getIndex(dataArray, sortKey, 'sorted');
    
    if (sortedIndex) {
      // Use existing sorted index
      const sortedData = sortedIndex.map(item => dataArray[item.index]);
      return desc ? sortedData.reverse() : sortedData;
    }
    
    // Fall back to regular sorting
    return dataArray.sort((a, b) => {
      if (a[sortKey] < b[sortKey]) return desc ? 1 : -1;
      if (a[sortKey] > b[sortKey]) return desc ? -1 : 1;
      return 0;
    });
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
      rows = sortWithIndex([...rows], key, desc);
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

// Public API for index management
query.createIndex = createIndex;
query.dropIndex = dropIndex;
query.dropAllIndexes = dropAllIndexes;
query.getIndexInfo = function(dataArray) {
  const arrayKey = dataArray;
  const arrayIndexes = indexes.get(arrayKey);
  if (!arrayIndexes) return {};
  
  const info = {};
  for (const [key, index] of arrayIndexes) {
    const [column, type] = key.split('_');
    if (!info[column]) info[column] = [];
    info[column].push({
      type,
      size: index instanceof Map ? index.size : index.length,
      memory: JSON.stringify(index).length // Rough memory estimate
    });
  }
  return info;
};
