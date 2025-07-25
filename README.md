# Query.js - Advanced SQL-like JavaScript Library

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![SecureLS](https://img.shields.io/badge/SecureLS-Integrated-green.svg)](https://github.com/softvar/secure-ls)

**Query.js** is a powerful, lightweight JavaScript library that brings SQL-like functionality to your client-side applications. It supports complex queries, joins, aggregations, built-in functions, automatic indexing for performance optimization, and secure localStorage integration with encryption.

## 🚀 Features

- ✅ **SQL-like Syntax**: SELECT, INSERT, UPDATE, DELETE operations
- ✅ **Complex Joins**: INNER, LEFT, RIGHT, FULL OUTER joins
- ✅ **Advanced Filtering**: WHERE clauses with AND/OR logic
- ✅ **Aggregation Functions**: COUNT, SUM, AVG, MIN, MAX
- ✅ **Built-in SQL Functions**: String, Math, and Date functions
- ✅ **Automatic Indexing**: Hash and sorted indexes for performance
- ✅ **Secure localStorage**: Encrypted data storage with SecureLS
- ✅ **Grouping & Sorting**: GROUP BY, ORDER BY, HAVING clauses
- ✅ **Pagination**: LIMIT and OFFSET support
- ✅ **Named Parameters**: Clean parameterized queries

## 📦 Installation

Include the library in your HTML file:

```html
<script src="query.js"></script>
```

## 🎯 Quick Start

### Basic Data Operations

```javascript
// Simple data storage and retrieval
query.add("user_token", "abc123");
query.add("user_data", {id: 1, name: "John", email: "john@example.com"});

// Retrieve data
const token = query.get("user_token"); // Returns: "abc123"
const user = query.get("user_data");   // Returns: {id: 1, name: "John", email: "john@example.com"}

// Delete data
query.delete("user_token");  // Removes the token from storage
query.delete("user_data");   // Removes the user data from storage
```

### Working with Arrays

```javascript
const users = [
  {id: 1, name: "John", age: 25, department: "IT"},
  {id: 2, name: "Jane", age: 30, department: "HR"},
  {id: 3, name: "Bob", age: 35, department: "IT"}
];

// SELECT all users
const allUsers = query("SELECT * FROM ?", [users]);

// SELECT with conditions
const itUsers = query("SELECT * FROM ? WHERE department = ?", [users, "IT"]);

// SELECT specific columns
const names = query("SELECT name, age FROM ?", [users]);
```

## 📚 Complete Documentation

### 1. Data Storage Functions

#### `query.add(key, value)`
Stores data securely in localStorage with encryption.

```javascript
// Store simple values
query.add("app_version", "1.0.0");
query.add("user_preferences", {theme: "dark", language: "en"});

// Store arrays
query.add("shopping_cart", [
  {id: 1, product: "Laptop", price: 999},
  {id: 2, product: "Mouse", price: 25}
]);
```

#### `query.get(key)`
Retrieves data from secure localStorage.

```javascript
const version = query.get("app_version");
const preferences = query.get("user_preferences");
const cart = query.get("shopping_cart");
```

#### `query.delete(key)`
Removes data from secure localStorage.

```javascript
// Delete specific data
query.delete("user_token");
query.delete("user_preferences");
query.delete("shopping_cart");

// Example: Logout function
function logout() {
  query.delete("auth_token");
  query.delete("user_data");
  query.delete("user_preferences");
  console.log("User logged out successfully");
}
```

### 2. Table Management

#### `query.saveTable(tableName, data)`
Saves an array as a table in localStorage.

```javascript
const employees = [
  {id: 1, name: "Alice", salary: 60000, department: "Engineering"},
  {id: 2, name: "Bob", salary: 55000, department: "Marketing"},
  {id: 3, name: "Carol", salary: 70000, department: "Engineering"}
];

query.saveTable("employees", employees);
```

#### `query.getTable(tableName)`
Retrieves a table from localStorage.

```javascript
const employees = query.getTable("employees");
```

#### `query.listTables()`
Lists all available tables.

```javascript
const tables = query.listTables();
console.log(tables);
// Output: [{name: "employees", rows: 3, size: 245}, ...]
```

#### `query.dropTable(tableName)`
Deletes a table from localStorage.

```javascript
query.dropTable("employees");
```

### 3. Basic SQL Operations

#### SELECT Queries

```javascript
// Basic SELECT
const results = query("SELECT * FROM employees");

// SELECT with WHERE clause
const highEarners = query("SELECT * FROM employees WHERE salary > 60000");

// SELECT specific columns
const names = query("SELECT name, department FROM employees");

// SELECT with multiple conditions
const seniorEngineers = query(`
  SELECT name, salary 
  FROM employees 
  WHERE department = 'Engineering' AND salary > 65000
`);
```

#### INSERT Operations

```javascript
// Insert single record
query("INSERT INTO employees", [{
  id: 4, 
  name: "David", 
  salary: 75000, 
  department: "Engineering"
}]);

// Insert multiple records
query("INSERT INTO employees", [
  {id: 5, name: "Eva", salary: 68000, department: "Design"},
  {id: 6, name: "Frank", salary: 52000, department: "Sales"}
]);
```

#### UPDATE Operations

```javascript
// Update with WHERE clause
query("UPDATE employees SET salary = 80000 WHERE name = 'Alice'");

// Update multiple fields
query("UPDATE employees SET salary = 65000, department = 'Senior Engineering' WHERE id = 1");

// Update with functions
query("UPDATE employees SET salary = ROUND(salary * 1.1) WHERE department = 'Engineering'");
```

#### DELETE Operations

```javascript
// Delete with condition
query("DELETE FROM employees WHERE salary < 55000");

// Delete all records
query("DELETE FROM employees");
```

### 4. Advanced Querying

#### GROUP BY and Aggregations

```javascript
// Count employees by department
const deptCounts = query(`
  SELECT department, COUNT(*) as employee_count 
  FROM employees 
  GROUP BY department
`);

// Average salary by department
const avgSalaries = query(`
  SELECT department, AVG(salary) as avg_salary 
  FROM employees 
  GROUP BY department
`);

// Multiple aggregations
const deptStats = query(`
  SELECT 
    department,
    COUNT(*) as count,
    AVG(salary) as avg_salary,
    MIN(salary) as min_salary,
    MAX(salary) as max_salary
  FROM employees 
  GROUP BY department
`);
```

#### ORDER BY and LIMIT

```javascript
// Sort by salary (descending)
const topEarners = query(`
  SELECT name, salary 
  FROM employees 
  ORDER BY salary DESC
`);

// Pagination with LIMIT and OFFSET
const page1 = query(`
  SELECT * 
  FROM employees 
  ORDER BY name 
  LIMIT 5
`);

const page2 = query(`
  SELECT * 
  FROM employees 
  ORDER BY name 
  LIMIT 5 OFFSET 5
`);
```

#### DISTINCT Values

```javascript
// Get unique departments
const departments = query("SELECT DISTINCT department FROM employees");
```

### 5. JOIN Operations

#### Setting up Sample Data

```javascript
// Employees table
const employees = [
  {id: 1, name: "Alice", department_id: 1},
  {id: 2, name: "Bob", department_id: 2},
  {id: 3, name: "Carol", department_id: 1}
];

// Departments table
const departments = [
  {id: 1, name: "Engineering", budget: 500000},
  {id: 2, name: "Marketing", budget: 300000}
];

query.saveTable("employees", employees);
query.saveTable("departments", departments);
```

#### INNER JOIN

```javascript
const employeeDetails = query(`
  SELECT e.name, d.name as department_name, d.budget
  FROM employees e
  INNER JOIN departments d ON e.department_id = d.id
`);
```

#### LEFT JOIN

```javascript
const allEmployees = query(`
  SELECT e.name, d.name as department_name
  FROM employees e
  LEFT JOIN departments d ON e.department_id = d.id
`);
```

#### Complex JOIN with WHERE

```javascript
const engineeringTeam = query(`
  SELECT e.name, d.name as department, d.budget
  FROM employees e
  INNER JOIN departments d ON e.department_id = d.id
  WHERE d.name = 'Engineering'
`);
```

### 6. Built-in SQL Functions

#### String Functions

```javascript
const stringExamples = query(`
  SELECT 
    name,
    UPPER(name) as upper_name,
    LOWER(name) as lower_name,
    LENGTH(name) as name_length,
    SUBSTRING(name, 1, 3) as first_three,
    CONCAT(name, ' - Employee') as full_title
  FROM employees
`);
```

#### Math Functions

```javascript
const mathExamples = query(`
  SELECT 
    salary,
    ROUND(salary / 12) as monthly_salary,
    CEIL(salary / 1000) as salary_thousands_ceil,
    FLOOR(salary / 1000) as salary_thousands_floor,
    ABS(salary - 60000) as salary_diff,
    POWER(salary / 1000, 2) as salary_squared
  FROM employees
`);
```

#### Date Functions

```javascript
// Add date fields to employees
query("UPDATE employees SET hire_date = '2023-01-15' WHERE id = 1");
query("UPDATE employees SET hire_date = '2022-06-20' WHERE id = 2");

const dateExamples = query(`
  SELECT 
    name,
    hire_date,
    YEAR(hire_date) as hire_year,
    MONTH(hire_date) as hire_month,
    DAY(hire_date) as hire_day,
    DATEDIFF('day', hire_date, NOW()) as days_employed
  FROM employees
`);
```

### 7. Named Parameters

```javascript
// Using named parameters for cleaner queries
const searchCriteria = {
  minSalary: 60000,
  dept: "Engineering"
};

const results = query(`
  SELECT name, salary, department 
  FROM employees 
  WHERE salary > :minSalary AND department = :dept
`, [searchCriteria]);
```

### 8. Performance Optimization with Indexes

#### Creating Indexes

```javascript
const largeDataset = [/* ... large array of objects ... */];

// Create hash index for equality searches
query.createIndex(largeDataset, 'department', 'hash');

// Create sorted index for range queries
query.createIndex(largeDataset, 'salary', 'sorted');
```

#### Index Information

```javascript
// Get index information
const indexInfo = query.getIndexInfo(largeDataset);
console.log(indexInfo);

// Drop specific index
query.dropIndex(largeDataset, 'department', 'hash');

// Drop all indexes
query.dropAllIndexes(largeDataset);
```

### 9. Complex Real-World Examples

#### E-commerce Order Analysis

```javascript
// Sample e-commerce data
const orders = [
  {id: 1, customer_id: 1, product: "Laptop", amount: 999, date: "2024-01-15"},
  {id: 2, customer_id: 2, product: "Mouse", amount: 25, date: "2024-01-16"},
  {id: 3, customer_id: 1, product: "Keyboard", amount: 75, date: "2024-01-17"}
];

const customers = [
  {id: 1, name: "John Doe", email: "john@example.com", city: "New York"},
  {id: 2, name: "Jane Smith", email: "jane@example.com", city: "Los Angeles"}
];

query.saveTable("orders", orders);
query.saveTable("customers", customers);

// Monthly sales report
const monthlySales = query(`
  SELECT 
    MONTH(date) as month,
    COUNT(*) as order_count,
    SUM(amount) as total_revenue,
    AVG(amount) as avg_order_value
  FROM orders 
  GROUP BY MONTH(date)
  ORDER BY month
`);

// Customer order summary
const customerSummary = query(`
  SELECT 
    c.name,
    c.city,
    COUNT(o.id) as order_count,
    SUM(o.amount) as total_spent,
    AVG(o.amount) as avg_order
  FROM customers c
  LEFT JOIN orders o ON c.id = o.customer_id
  GROUP BY c.id, c.name, c.city
  ORDER BY total_spent DESC
`);
```

#### Inventory Management

```javascript
const inventory = [
  {id: 1, product: "Laptop", category: "Electronics", stock: 50, price: 999},
  {id: 2, product: "Mouse", category: "Electronics", stock: 200, price: 25},
  {id: 3, product: "Desk", category: "Furniture", stock: 15, price: 299}
];

query.saveTable("inventory", inventory);

// Low stock alerts
const lowStock = query(`
  SELECT product, stock, price, (stock * price) as stock_value
  FROM inventory 
  WHERE stock < 20
  ORDER BY stock_value DESC
`);

// Category analysis
const categoryStats = query(`
  SELECT 
    category,
    COUNT(*) as product_count,
    SUM(stock) as total_stock,
    AVG(price) as avg_price,
    SUM(stock * price) as total_value
  FROM inventory
  GROUP BY category
`);
```

#### User Analytics Dashboard

```javascript
const userSessions = [
  {user_id: 1, session_date: "2024-01-15", page_views: 15, duration: 1200},
  {user_id: 2, session_date: "2024-01-15", page_views: 8, duration: 600},
  {user_id: 1, session_date: "2024-01-16", page_views: 22, duration: 1800}
];

query.saveTable("user_sessions", userSessions);

// Daily engagement metrics
const dailyMetrics = query(`
  SELECT 
    session_date,
    COUNT(DISTINCT user_id) as unique_users,
    SUM(page_views) as total_page_views,
    AVG(page_views) as avg_page_views,
    SUM(duration) as total_duration,
    AVG(duration) as avg_session_duration
  FROM user_sessions
  GROUP BY session_date
  ORDER BY session_date
`);

// Power users (high engagement)
const powerUsers = query(`
  SELECT 
    user_id,
    COUNT(*) as session_count,
    SUM(page_views) as total_page_views,
    AVG(duration) as avg_duration
  FROM user_sessions
  GROUP BY user_id
  HAVING SUM(page_views) > 20
  ORDER BY total_page_views DESC
`);
```

### 10. Error Handling

```javascript
try {
  const result = query("SELECT * FROM nonexistent_table");
} catch (error) {
  console.error("Query error:", error.message);
}

// Check if table exists before querying
const tables = query.listTables();
const tableExists = tables.some(table => table.name === "employees");

if (tableExists) {
  const employees = query("SELECT * FROM employees");
} else {
  console.log("Employees table not found");
}
```

### 11. Best Practices

#### 1. Use Indexes for Large Datasets

```javascript
// For datasets > 100 records, create indexes
if (employees.length > 100) {
  query.createIndex(employees, 'department', 'hash');
  query.createIndex(employees, 'salary', 'sorted');
}
```

#### 2. Named Parameters for Dynamic Queries

```javascript
function searchEmployees(filters) {
  const conditions = [];
  const params = {};
  
  if (filters.department) {
    conditions.push("department = :dept");
    params.dept = filters.department;
  }
  
  if (filters.minSalary) {
    conditions.push("salary >= :minSal");
    params.minSal = filters.minSalary;
  }
  
  const whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";
  
  return query(`SELECT * FROM employees ${whereClause}`, [params]);
}
```

#### 3. Efficient Data Updates

```javascript
// Batch operations are more efficient
const updates = [
  {id: 1, salary: 75000},
  {id: 2, salary: 65000}
];

// Instead of multiple UPDATE queries, use this approach:
updates.forEach(update => {
  query("UPDATE employees SET salary = ? WHERE id = ?", [update.salary, update.id]);
});
```

## 🔧 Configuration

### SecureLS Options

The library uses SecureLS for encrypted localStorage. You can configure encryption options:

```javascript
// The library automatically handles encryption, but you can access SecureLS features
// through the secure storage functions
```

## 📊 Performance Tips

1. **Use Indexes**: Create indexes for frequently queried columns
2. **Limit Results**: Use LIMIT for large datasets
3. **Efficient JOINs**: Index columns used in JOIN conditions
4. **Batch Operations**: Group multiple operations when possible

## 🐛 Troubleshooting

### Common Issues

1. **"First parameter must be an array" error**
   - Ensure you're passing data as the second parameter: `query("SELECT * FROM ?", [data])`

2. **localStorage quota exceeded**
   - Clear unused tables: `query.dropTable("unused_table")`
   - Or clear all: `query.clearAllTables()`

3. **JOIN queries not working**
   - Ensure table names in JOIN queries exist in localStorage
   - Check that JOIN conditions reference correct column names

## 📝 License

MIT License - feel free to use in your projects!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## 📞 Support

If you encounter any issues or have questions, please file an issue on the GitHub repository.

---

**Query.js** - Bringing the power of SQL to your JavaScript applications! 🚀

// SELECT - Automatically reads from localStorage
const allUsers = query("SELECT * FROM users");
const activeUsers = query("SELECT * FROM users WHERE active = true");

// UPDATE - Modifies data in localStorage
query("UPDATE users SET active = false WHERE age > 30");

// DELETE - Removes data from localStorage
query("DELETE FROM users WHERE active = false");
```

## 📦 Installation

### Option 1: Direct Download
Download `query.js` and include it in your HTML:

```html
<script src="query.js"></script>
```


## 📚 Documentation

### Core Operations

#### SELECT Queries

```javascript
// Basic SELECT
query("SELECT * FROM users");
query("SELECT name, age FROM users");

// WHERE conditions
query("SELECT * FROM users WHERE age > 25");
query("SELECT * FROM users WHERE name LIKE 'John%'");
query("SELECT * FROM users WHERE age BETWEEN 25 AND 35");

// ORDER BY
query("SELECT * FROM users ORDER BY age DESC");
query("SELECT * FROM users ORDER BY name ASC");

// LIMIT and OFFSET
query("SELECT * FROM users LIMIT 10");
query("SELECT * FROM users LIMIT 10 OFFSET 20");

// DISTINCT
query("SELECT DISTINCT department FROM users");
```

#### Aggregations and GROUP BY

```javascript
// Aggregation functions
query("SELECT COUNT(*) as total FROM users");
query("SELECT AVG(age) as average_age FROM users");
query("SELECT MIN(age) as youngest, MAX(age) as oldest FROM users");

// GROUP BY
query("SELECT department, COUNT(*) as count FROM users GROUP BY department");
query("SELECT department, AVG(salary) as avg_salary FROM users GROUP BY department HAVING avg_salary > 50000");
```

#### INSERT Operations

```javascript
// Insert single record
query("INSERT INTO users", [{ id: 1, name: 'John', age: 30 }]);

// Insert multiple records
query("INSERT INTO users", [
  { id: 2, name: 'Jane', age: 25 },
  { id: 3, name: 'Bob', age: 35 }
]);
```

#### UPDATE Operations

```javascript
// Update with WHERE clause
query("UPDATE users SET active = false WHERE age > 65");
query("UPDATE users SET department = 'Engineering', salary = 75000 WHERE id = 1");

// Update multiple fields
query("UPDATE users SET active = true, last_login = '2024-01-01' WHERE department = 'Sales'");
```

#### DELETE Operations

```javascript
// Delete with conditions
query("DELETE FROM users WHERE active = false");
query("DELETE FROM users WHERE age < 18");

// Delete all records
query("DELETE FROM users");
```

### Advanced Features

#### Named Parameters

```javascript
const params = {
  tbl: 'users',
  minAge: 25,
  department: 'Engineering'
};

query("SELECT * FROM :tbl WHERE age > :minAge AND department = :department", [params]);
```

#### Complex WHERE Conditions

```javascript
// Multiple conditions
query("SELECT * FROM users WHERE (age > 25 AND department = 'Engineering') OR (age > 30 AND department = 'Sales')");

// NULL checks
query("SELECT * FROM users WHERE email IS NOT NULL");
query("SELECT * FROM users WHERE phone IS NULL");

// LIKE patterns
query("SELECT * FROM users WHERE email LIKE '%@company.com'");
query("SELECT * FROM users WHERE name LIKE 'John_'"); // _ matches single character
```

### LocalStorage Utilities

```javascript
// Get table data
const users = query.getTable('users');

// Save array to localStorage
query.saveTable('products', productsArray);

// List all localStorage tables
const tables = query.listTables();
console.log(tables);
// Output: [{ name: 'users', rows: 150, size: 25600 }, ...]

// Drop a table
query.dropTable('old_data');

// Clear all tables
const deletedCount = query.clearAllTables();
```

### Performance Optimization

#### Indexing

```javascript
// Create indexes for better performance
query.createIndex(dataArray, 'email', 'hash');     // For equality lookups
query.createIndex(dataArray, 'age', 'sorted');     // For range queries

// Auto-indexing (automatically creates indexes for large datasets)
// Happens automatically when querying datasets > 100 rows

// Get index information
const indexInfo = query.getIndexInfo(dataArray);

// Drop indexes
query.dropIndex(dataArray, 'email', 'hash');
query.dropAllIndexes(dataArray);
```

## 🎯 Use Cases

### 1. Client-Side Data Management
```javascript
// Store user preferences
query("INSERT INTO preferences", [{ theme: 'dark', language: 'en', notifications: true }]);

// Retrieve settings
const settings = query("SELECT * FROM preferences LIMIT 1")[0];
```

### 2. Offline-First Applications
```javascript
// Cache API responses
query("INSERT INTO cache", apiResponse.data);

// Query cached data
const cachedResults = query("SELECT * FROM cache WHERE timestamp > '2024-01-01'");
```

### 3. Form Data Management
```javascript
// Save form drafts
query("INSERT INTO drafts", [{ formId: 'contact', data: formData, savedAt: new Date() }]);

// Load latest draft
const draft = query("SELECT * FROM drafts WHERE formId = 'contact' ORDER BY savedAt DESC LIMIT 1")[0];
```

### 4. Analytics and Reporting
```javascript
// Track user interactions
query("INSERT INTO analytics", [{ 
  event: 'page_view', 
  page: '/dashboard', 
  timestamp: Date.now(),
  userId: currentUser.id 
}]);

// Generate reports
const pageViews = query(`
  SELECT page, COUNT(*) as views 
  FROM analytics 
  WHERE event = 'page_view' 
  GROUP BY page 
  ORDER BY views DESC
`);
```

## 🔧 API Reference

### Core Function

#### `query(sql, params = [])`
Executes a SQL-like query on data.

**Parameters:**
- `sql` (string): SQL query string
- `params` (array): Parameters for the query

**Returns:** Query results (array for SELECT, object for UPDATE/DELETE, array for INSERT)

### Utility Functions

#### `query.getTable(tableName)`
Retrieves table data from localStorage.

#### `query.saveTable(tableName, data)`
Saves array data to localStorage.

#### `query.listTables()`
Returns list of all localStorage tables with metadata.

#### `query.dropTable(tableName)`
Removes a table from localStorage.

#### `query.clearAllTables()`
Removes all tables from localStorage.

### Index Management

#### `query.createIndex(dataArray, column, type)`
Creates an index on a column.

#### `query.dropIndex(dataArray, column, type)`
Removes an index.

#### `query.getIndexInfo(dataArray)`
Returns information about existing indexes.

## ⚡ Performance Tips

1. **Use Indexes**: Create indexes on frequently queried columns
2. **Limit Results**: Use LIMIT for large datasets
3. **Specific Selects**: Select only needed columns instead of using `*`
4. **Batch Operations**: Insert multiple records in single operation
5. **Cache Results**: Store frequently accessed query results

## 🐛 Error Handling

```javascript
try {
  const result = query("SELECT * FROM users WHERE invalid_syntax");
} catch (error) {
  console.error('Query failed:', error.message);
}

// Handle localStorage quota exceeded
try {
  query("INSERT INTO large_table", massiveDataArray);
} catch (error) {
  if (error.message.includes('quota exceeded')) {
    // Handle storage limit
    query.clearAllTables(); // or implement cleanup strategy
  }
}
```

## 🔒 Browser Compatibility

- **Modern Browsers**: Chrome 45+, Firefox 40+, Safari 10+, Edge 12+
- **LocalStorage**: All modern browsers (IE 8+)
- **ES6 Features**: Uses Map, Set, arrow functions (transpile for older browsers if needed)



## Legacy Documentation

### Original Features (Still Supported)
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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by SQL standards and modern JavaScript practices
- Built for developers who need powerful client-side data querying
- Designed with performance and usability in mind

---

**Star ⭐ this repository if you find it useful!**
