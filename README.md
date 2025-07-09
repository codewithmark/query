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
  { id: 1, name: 'John', age: 30 },
  { id: 2, name: 'Alice', age: 25 }
];

// 🔸 INSERT multiple users
query("INSERT INTO ?", [users, [
  { id: 3, name: 'Bob', age: 35 },
  { id: 4, name: 'Eve', age: 40 }
]]);

// 🔹 SELECT adults
const adults = query("SELECT id, name FROM ? WHERE age >= ?", [users, 30]);

// 🔸 UPDATE a user's age
query("UPDATE ? SET age = ? WHERE name = ?", [users, 45, 'Eve']);

// 🔸 DELETE a user
query("DELETE FROM ? WHERE name = ?", [users, 'Alice']);

// 🔹 GROUP BY + HAVING
const grouped = query("SELECT name, COUNT(id) FROM ? GROUP BY name HAVING COUNT(id) > 0", [users]);

console.log({ adults, grouped, users });
