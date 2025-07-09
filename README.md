## 🚀 One Function. Full SQL Power on JSON Arrays

`query(sql, [data, ...params])` brings SQL-style operations to your plain JavaScript arrays — no database, no ORM, no dependencies.

### ✅ Supported SQL Features

- `SELECT col1, col2 FROM ? WHERE ...`
- Logical operators: `AND`, `OR`
- Comparison operators: `=`, `!=`, `<`, `>`, `<=`, `>=`
- `ORDER BY column ASC|DESC`
- Aggregates: `COUNT()`, `SUM()`, `AVG()`
- `GROUP BY` and `HAVING`
- `LIMIT` and `OFFSET`
- `INSERT INTO ?` — single or multiple rows
- `UPDATE ? SET col = val WHERE ...`
- `DELETE FROM ? WHERE ...`
- `?` parameter binding for safety and clarity

---

### 🧪 Full CRUD Example

```js
const users = [
  { id: 1, name: 'Alice', age: 25, score: 80 },
  { id: 2, name: 'Bob', age: 30, score: 90 },
  { id: 3, name: 'Carol', age: 35, score: 85 },
  { id: 4, name: 'Dan', age: 40, score: 70 },
  { id: 5, name: 'Eve', age: 30, score: 100 }
]; 
console.log('SELECT All',users);


// INSERT multiple users  
query("INSERT INTO ?", [users, [
  { id: 6, name: 'Grace', age: 28,score: 100  },
  { id: 7, name: 'Hank', age: 33, score: 85  }
]]);



// SELECT WHERE
const result1 = query("SELECT id, name FROM ? WHERE age >= ? AND score < ?", [users, 30, 90]);
console.log('SELECT WHERE',result1);

// ORDER BY
const result2 = query("SELECT id, name, score FROM ? ORDER BY score DESC", [users]);
console.log('ORDER BY',result2);


// UPDATE
query("UPDATE ? SET score = 95 WHERE name = ?", [users, 'Alice']);
const result2b = query("SELECT * FROM ? WHERE name = ?", [users , 'Alice'])[0];
console.log('UPDATE',result2b ); 

// DELETE
query("DELETE FROM ? WHERE age < ?", [users, 30]);
const result2c = query("SELECT * FROM ? WHERE age >", [users , 30]);
console.log('DELETE', result2c);
console.log('DELETE', users);


// COUNT + GROUP BY
const result3 = query("SELECT age, COUNT(*) FROM ? GROUP BY age", [users]);
console.log('COUNT + GROUP BY',result3 );

// SUM + HAVING
const result4 = query("SELECT age, SUM(score) FROM ? GROUP BY age HAVING age >= 30", [users]);
console.log('SUM + HAVING',result4);

// AVG + LIMIT
const result5 = query("SELECT AVG(score) FROM ? WHERE age >= ?", [users, 30]);
console.log('AVG + LIMIT', result5);

// LIMIT + OFFSET
const result6 = query("SELECT name FROM ? ORDER BY score DESC LIMIT 2 OFFSET 1", [users]);
console.log('LIMIT + OFFSET', result6);

