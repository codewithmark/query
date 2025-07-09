function query(sql, params = []) {
  let paramIndex = 0;

  // Substitute ? placeholders with provided params
  const tokens = [];
  let i = 0;
  while (i < sql.length) {
    if (sql[i] === '?') {
      tokens.push({ type: 'param', value: params[paramIndex++] });
      i++;
    } else {
      let chunk = '';
      while (i < sql.length && sql[i] !== '?') {
        chunk += sql[i++];
      }
      tokens.push({ type: 'sql', value: chunk });
    }
  }

  const substitutedSql = tokens.map(t =>
    t.type === 'sql' ? t.value : JSON.stringify(t.value)
  ).join('').replace(/\s+/g, ' ').trim();

  // INSERT
  if (/^insert into/i.test(substitutedSql)) {
    const data = params[0];
    const insertData = params[1];

    if (!Array.isArray(data)) throw new Error('First parameter must be a target array.');

    // Bulk insert: INSERT INTO ?, [data, array of objects]
    if (Array.isArray(insertData)) {
      for (const row of insertData) {
        if (typeof row === 'object' && !Array.isArray(row)) {
          data.push({ ...row });
        } else {
          throw new Error('Each row to insert must be an object.');
        }
      }
      return insertData;
    }

    // Single object insert
    if (typeof insertData === 'object') {
      data.push({ ...insertData });
      return insertData;
    }

    // INSERT INTO ? (col1, col2) VALUES (val1, val2)
    const insertMatch = substitutedSql.match(/insert into\s+\?\s*\((.+?)\)\s*values\s*\((.+?)\)/i);
    if (insertMatch) {
      const keys = insertMatch[1].split(',').map(k => k.trim());
      const rawValues = insertMatch[2].split(',').map(v => JSON.parse(v.trim()));
      if (keys.length !== rawValues.length) throw new Error('Key/value mismatch in INSERT VALUES.');
      const newRow = Object.fromEntries(keys.map((k, i) => [k, rawValues[i]]));
      data.push(newRow);
      return newRow;
    }

    throw new Error('Invalid INSERT format.');
  }

  // DELETE
  if (/^delete from/i.test(substitutedSql)) {
    const fromMatch = substitutedSql.match(/delete from\s+\?\s*(where\s+(.+))?/i);
    const data = params.find(p => Array.isArray(p));
    if (!data) throw new Error('First parameter must be an array.');

    const whereClause = fromMatch?.[2];
    const matches = (item) => {
      if (!whereClause) return true;
      const match = whereClause.match(/(\w+)\s*(=|!=|>|<|>=|<=)\s*(.+)/);
      if (!match) throw new Error('Invalid WHERE clause.');
      const [, key, op, rawVal] = match;
      const value = JSON.parse(rawVal);
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
    };

    for (let i = data.length - 1; i >= 0; i--) {
      if (matches(data[i])) data.splice(i, 1);
    }

    return data;
  }

  // UPDATE
  if (/^update/i.test(substitutedSql)) {
    const updateMatch = substitutedSql.match(/update\s+\?\s+set\s+(.+?)\s*(where\s+(.+))?$/i);
    const data = params.find(p => Array.isArray(p));
    if (!data) throw new Error('First parameter must be an array.');

    const setPart = updateMatch[1];
    const whereClause = updateMatch[3];

    const updates = Object.fromEntries(
      setPart.split(',').map(pair => {
        const [key, val] = pair.split('=').map(s => s.trim());
        return [key, JSON.parse(val)];
      })
    );

    const matches = (item) => {
      if (!whereClause) return true;
      const match = whereClause.match(/(\w+)\s*(=|!=|>|<|>=|<=)\s*(.+)/);
      if (!match) throw new Error('Invalid WHERE clause.');
      const [, key, op, rawVal] = match;
      const value = JSON.parse(rawVal);
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
    };

    for (const item of data) {
      if (matches(item)) {
        for (const [key, val] of Object.entries(updates)) {
          item[key] = val;
        }
      }
    }

    return data;
  }

  // SELECT (minimal fallback for now)
  if (/^select/i.test(substitutedSql)) {
    // You can plug in your full SELECT implementation here,
    // as built earlier with WHERE, GROUP BY, HAVING, etc.
    throw new Error('SELECT is not implemented in this snippet. Use previous SELECT-enabled version.');
  }

  throw new Error('Unsupported SQL operation.');
}
