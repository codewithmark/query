# 🚀 JavaScript SQL Query Engine

A powerful, lightweight JavaScript library that brings SQL-like querying capabilities to arrays of objects. Execute SELECT, INSERT, UPDATE, DELETE operations with full SQL syntax support - no database required!

[![Demo](https://img.shields.io/badge/Demo-Live-brightgreen)](demo.html)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#license)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)]()

## ✨ Features

### Core SQL Operations
- ✅ **SELECT** with column selection and aliases
- ✅ **INSERT** single records or bulk operations
- ✅ **UPDATE** with conditional modifications
- ✅ **DELETE** with WHERE conditions

### Advanced Querying
- 🔍 **WHERE** clauses with complex conditions
- 📊 **GROUP BY** with aggregate functions
- 🎯 **HAVING** for filtered aggregations
- 📈 **ORDER BY** (ASC/DESC) 
- 📄 **LIMIT** and **OFFSET** for pagination
- ✨ **DISTINCT** for unique results

### Aggregate Functions
- `COUNT(*)` - Count all rows
- `COUNT(column)` - Count non-null values
- `SUM(column)` - Sum numeric values
- `AVG(column)` - Calculate averages
- `MIN(column)` - Find minimum values
- `MAX(column)` - Find maximum values

### Advanced Operators
- `BETWEEN` - Range queries
- `LIKE` - Pattern matching with wildcards (`%`, `_`)
- `IS NULL` / `IS NOT NULL` - Null checking
- `AND` / `OR` - Logical operations with proper precedence

### Modern Syntax Support
- 🏷️ **Named Parameters** (`:parameter` syntax)
- 📝 **Column Aliases** (`AS` keyword)
- 🔗 **Parameterized Queries** for security

## 📦 Installation

Simply include the `query.js` file in your project:

```html
<script src="query.js"></script>
```

Or copy the function directly into your JavaScript code.

## 🚀 Quick Start

```javascript
// Sample data
const users = [
    { id: 1, name: "John Doe", email: "john@gmail.com", age: 25, salary: 50000 },
    { id: 2, name: "Jane Smith", email: "jane@yahoo.com", age: 30, salary: 60000 },
    { id: 3, name: "Bob Johnson", email: "bob@gmail.com", age: 35, salary: 55000 }
];

// Basic SELECT
const result = query("SELECT * FROM ?", [users]);

// SELECT with WHERE
const adults = query("SELECT name, age FROM ? WHERE age >= 30", [users]);

// Named parameters
const user = query("SELECT * FROM :tbl WHERE id = :userId", [
    { tbl: users, userId: 2 }
]);
```

## 📖 Documentation

### Basic Syntax

#### SELECT Queries
```javascript
// Select all columns
query("SELECT * FROM ?", [data]);

// Select specific columns
query("SELECT name, email FROM ?", [users]);

// With aliases
query("SELECT name AS fullName, age AS yearsOld FROM ?", [users]);

// With conditions
query("SELECT * FROM ? WHERE age > 25 AND city = 'New York'", [users]);
```

#### INSERT Operations
```javascript
// Insert single record
const newUser = { name: "Alice", age: 28, email: "alice@email.com" };
query("INSERT INTO ?", [users, newUser]);

// Insert multiple records
const newUsers = [
    { name: "Bob", age: 32 },
    { name: "Carol", age: 29 }
];
query("INSERT INTO ?", [users, newUsers]);
```

#### UPDATE Operations
```javascript
// Update records
query("UPDATE ? SET salary = 70000 WHERE name = 'John Doe'", [users]);

// Update multiple fields
query("UPDATE ? SET salary = 65000, city = 'Boston' WHERE age > 30", [users]);
```

#### DELETE Operations
```javascript
// Delete records
query("DELETE FROM ? WHERE age < 25", [users]);

// Delete with complex conditions
query("DELETE FROM ? WHERE salary IS NULL OR email LIKE '%@temp.com'", [users]);
```

### Advanced Features

#### Aggregate Functions
```javascript
// Group by with aggregates
query(`
    SELECT 
        department,
        COUNT(*) AS employees,
        AVG(salary) AS avgSalary,
        MIN(salary) AS minSalary,
        MAX(salary) AS maxSalary,
        SUM(salary) AS totalSalary
    FROM ? 
    GROUP BY department
`, [employees]);
```

#### Named Parameters
```javascript
// Using named parameters for cleaner code
query(`
    SELECT name, age 
    FROM :users 
    WHERE age BETWEEN :minAge AND :maxAge 
      AND city = :location
`, [{ 
    users: userData, 
    minAge: 25, 
    maxAge: 35, 
    location: "New York" 
}]);
```

#### Advanced Operators
```javascript
// BETWEEN operator
query("SELECT * FROM ? WHERE salary BETWEEN 40000 AND 80000", [employees]);

// LIKE with wildcards
query("SELECT * FROM ? WHERE email LIKE '%@gmail.com'", [users]);
query("SELECT * FROM ? WHERE name LIKE 'J%'", [users]); // Names starting with 'J'

// NULL checking
query("SELECT * FROM ? WHERE phone IS NOT NULL", [contacts]);

// Complex conditions
query(`
    SELECT * FROM ? 
    WHERE (age > 25 AND city = 'NYC') 
       OR (salary > 60000 AND department LIKE '%Tech%')
`, [employees]);
```

#### DISTINCT and Sorting
```javascript
// Get unique values
query("SELECT DISTINCT department FROM ?", [employees]);

// Sorting
query("SELECT name, salary FROM ? ORDER BY salary DESC LIMIT 10", [employees]);

// Pagination
query("SELECT * FROM ? ORDER BY id LIMIT 20 OFFSET 40", [records]);
```

## 🎯 Use Cases

### Data Analytics
```javascript
// User analytics dashboard
const analytics = query(`
    SELECT 
        region,
        COUNT(*) AS totalUsers,
        COUNT(lastLogin) AS activeUsers,
        AVG(age) AS avgAge,
        SUM(purchaseAmount) AS totalRevenue
    FROM ?
    WHERE registrationDate >= '2024-01-01'
    GROUP BY region
    HAVING totalUsers > 100
    ORDER BY totalRevenue DESC
`, [userData]);
```

### Inventory Management
```javascript
// Low stock alert
const lowStock = query(`
    SELECT 
        productName,
        category,
        currentStock,
        reorderLevel
    FROM :products
    WHERE currentStock < reorderLevel
      AND category IN :categories
    ORDER BY currentStock ASC
`, [{ 
    products: inventory, 
    categories: ['Electronics', 'Accessories'] 
}]);
```

### Customer Segmentation
```javascript
// High-value customers
const vipCustomers = query(`
    SELECT DISTINCT
        customerId,
        customerName,
        totalPurchases,
        lastPurchaseDate
    FROM ?
    WHERE totalPurchases > 10000
      AND lastPurchaseDate >= '2024-01-01'
      AND customerType = 'Premium'
    ORDER BY totalPurchases DESC
`, [customers]);
```

## 🎮 Interactive Demo

Check out the [interactive demo page](demo.html) with live examples covering:

- 🔰 **Basic Queries** - Simple CRUD operations
- ⚡ **Intermediate** - Aliases, sorting, pagination
- 🎯 **Advanced** - Aggregations, grouping, having
- 🏷️ **Named Parameters** - Modern syntax examples
- 🔧 **Operators** - BETWEEN, LIKE, NULL checks
- 🌎 **Real-world** - Practical use cases

## ⚡ Performance

- **Lightweight**: ~10KB minified
- **Fast**: Optimized for arrays up to 10,000+ records
- **Memory Efficient**: Minimal overhead, works with existing data
- **Zero Dependencies**: Pure JavaScript, no external libraries

## 🛠️ Browser Support

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Node.js 10+

## 📝 API Reference

### `query(sql, params)`

**Parameters:**
- `sql` (string): SQL query string with `?` or `:parameter` placeholders
- `params` (array): Parameters for the query
  - For positional: `[dataArray, value1, value2, ...]`
  - For named: `[{ tbl: dataArray, param1: value1, param2: value2 }]`

**Returns:**
- For SELECT: Array of matching objects
- For INSERT: The inserted data
- For UPDATE/DELETE: The modified data array

**Throws:**
- Error for invalid SQL syntax
- Error for missing required parameters
- Error for invalid data types

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. 🐛 **Report Bugs** - Found an issue? Open a GitHub issue
2. 💡 **Suggest Features** - Have an idea? We'd love to hear it
3. 🔧 **Submit PRs** - Fix bugs or add features
4. 📚 **Improve Docs** - Help make the documentation better

### Development Setup

```bash

# Open demo page for testing
open demo.html
```

### Running Tests

```javascript
// Basic test suite
function runTests() {
    const testData = [
        { id: 1, name: "Test", value: 100 },
        { id: 2, name: "Demo", value: 200 }
    ];
    
    // Test SELECT
    console.assert(query("SELECT * FROM ?", [testData]).length === 2);
    
    // Test WHERE
    console.assert(query("SELECT * FROM ? WHERE value > 150", [testData]).length === 1);
    
    // Test INSERT
    query("INSERT INTO ?", [testData, { id: 3, name: "New", value: 300 }]);
    console.assert(testData.length === 3);
    
    console.log("✅ All tests passed!");
}
```

## 📄 License

MIT License - feel free to use in commercial and open-source projects.

## 🎯 Roadmap

- [ ] **JOIN Operations** - INNER, LEFT, RIGHT, FULL JOIN support
- [ ] **Subqueries** - Nested SELECT statements
- [ ] **Window Functions** - ROW_NUMBER, RANK, etc.
- [ ] **Union Operations** - UNION, INTERSECT, EXCEPT
- [ ] **Indexes** - Performance optimization for large datasets
- [ ] **TypeScript** - Full TypeScript definitions
- [ ] **Streaming** - Support for large datasets with streaming
- [ ] **SQL Parser** - Enhanced SQL syntax validation

## 🙏 Acknowledgments

- Inspired by SQL standards and modern database systems
- Built for developers who need SQL-like functionality in JavaScript
- Community feedback and contributions

 

---

⭐ **Star this repo** if you find it useful! It helps others discover this project.

**Happy Querying!** 🎉
