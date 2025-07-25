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

// SecureLS integration (private function)
(function() {
  const SecureLS = (function() {
    // SecureLS code from SecureLS.js
    !function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define("SecureLS",[],e):"object"==typeof exports?exports.SecureLS=e():t.SecureLS=e()}(this,function(){return function(t){function e(i){if(r[i])return r[i].exports;var n=r[i]={exports:{},id:i,loaded:!1};return t[i].call(n.exports,n,n.exports,e),n.loaded=!0,n.exports}var r={};return e.m=t,e.c=r,e.p="",e(0)}([function(t,e,r){"use strict";function i(t){return t&&t.__esModule?t:{"default":t}}function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(e,"__esModule",{value:!0});var s=function(){function t(t,e){for(var r=0;r<e.length;r++){var i=e[r];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i)}}return function(e,r,i){return r&&t(e.prototype,r),i&&t(e,i),e}}(),o=r(1),a=i(o),c=r(2),u=i(c),h=r(8),f=i(h),l=r(9),p=i(l),d=r(10),y=i(d),v=r(11),_=i(v),g=r(16),S=i(g),m=r(17),k=i(m),B=r(18),E=i(B),C=function(){function t(e){n(this,t),e=e||{},this._name="secure-ls",this.utils=a["default"],this.constants=u["default"],this.Base64=p["default"],this.LZString=y["default"],this.AES=_["default"],this.DES=S["default"],this.RABBIT=k["default"],this.RC4=E["default"],this.enc=f["default"],this.config={isCompression:!0,encodingType:u["default"].EncrytionTypes.BASE64},this.config.isCompression="undefined"==typeof e.isCompression||e.isCompression,this.config.encodingType="undefined"!=typeof e.encodingType||""===e.encodingType?e.encodingType.toLowerCase():u["default"].EncrytionTypes.BASE64,this.config.encryptionSecret=e.encryptionSecret,this.ls=localStorage,this.init()}return s(t,[{key:"init",value:function(){var t=this.getMetaData()||{};this.WarningEnum=this.constants.WarningEnum,this.WarningTypes=this.constants.WarningTypes,this.EncrytionTypes=this.constants.EncrytionTypes,this._isBase64=this._isBase64EncryptionType(),this._isAES=this._isAESEncryptionType(),this._isDES=this._isDESEncryptionType(),this._isRabbit=this._isRabbitEncryptionType(),this._isRC4=this._isRC4EncryptionType(),this._isCompression=this._isDataCompressionEnabled(),this.utils.allKeys=t.keys||this.resetAllKeys()}},{key:"_isBase64EncryptionType",value:function(){return p["default"]&&("undefined"==typeof this.config.encodingType||this.config.encodingType===this.constants.EncrytionTypes.BASE64)}},{key:"_isAESEncryptionType",value:function(){return _["default"]&&this.config.encodingType===this.constants.EncrytionTypes.AES}},{key:"_isDESEncryptionType",value:function(){return S["default"]&&this.config.encodingType===this.constants.EncrytionTypes.DES}},{key:"_isRabbitEncryptionType",value:function(){return k["default"]&&this.config.encodingType===this.constants.EncrytionTypes.RABBIT}},{key:"_isRC4EncryptionType",value:function(){return E["default"]&&this.config.encodingType===this.constants.EncrytionTypes.RC4}},{key:"_isDataCompressionEnabled",value:function(){return this.config.isCompression}},{key:"getEncyptionSecret",value:function(t){var e=this.getMetaData()||{},r=this.utils.getObjectFromKey(e.keys,t);r&&(this._isAES||this._isDES||this._isRabbit||this._isRC4)&&("undefined"==typeof this.config.encryptionSecret?(this.utils.encryptionSecret=r.s,this.utils.encryptionSecret||(this.utils.encryptionSecret=this.utils.generateSecretKey(),this.setMetaData())):this.utils.encryptionSecret=this.config.encryptionSecret||r.s||"")}},{key:"get",value:function(t,e){var r="",i="",n=void 0,s=void 0,o=void 0;if(!this.utils.is(t))return this.utils.warn(this.WarningEnum.KEY_NOT_PROVIDED),i;if(o=this.getDataFromLocalStorage(t),!o)return i;n=o,(this._isCompression||e)&&(n=y["default"].decompress(o)),r=n,this._isBase64||e?r=p["default"].decode(n):(this.getEncyptionSecret(t),this._isAES?s=_["default"].decrypt(n.toString(),this.utils.encryptionSecret):this._isDES?s=S["default"].decrypt(n.toString(),this.utils.encryptionSecret):this._isRabbit?s=k["default"].decrypt(n.toString(),this.utils.encryptionSecret):this._isRC4&&(s=E["default"].decrypt(n.toString(),this.utils.encryptionSecret)),s&&(r=s.toString(f["default"]._Utf8)));try{i=JSON.parse(r)}catch(a){throw new Error("Could not parse JSON")}return i}},{key:"getDataFromLocalStorage",value:function(t){return this.ls.getItem(t,!0)}},{key:"getAllKeys",value:function(){var t=this.getMetaData();return this.utils.extractKeyNames(t)||[]}},{key:"set",value:function(t,e){var r="";return this.utils.is(t)?(this.getEncyptionSecret(t),String(t)!==String(this.utils.metaKey)&&(this.utils.isKeyPresent(t)||(this.utils.addToKeysList(t),this.setMetaData())),r=this.processData(e),void this.setDataToLocalStorage(t,r)):void this.utils.warn(this.WarningEnum.KEY_NOT_PROVIDED)}},{key:"setDataToLocalStorage",value:function(t,e){this.ls.setItem(t,e)}},{key:"remove",value:function(t){return this.utils.is(t)?t===this.utils.metaKey&&this.getAllKeys().length?void this.utils.warn(this.WarningEnum.META_KEY_REMOVE):(this.utils.isKeyPresent(t)&&(this.utils.removeFromKeysList(t),this.setMetaData()),void this.ls.removeItem(t)):void this.utils.warn(this.WarningEnum.KEY_NOT_PROVIDED)}},{key:"removeAll",value:function(){var t=void 0,e=void 0;for(t=this.getAllKeys(),e=0;e<t.length;e++)this.ls.removeItem(t[e]);this.ls.removeItem(this.utils.metaKey),this.resetAllKeys()}},{key:"clear",value:function(){this.ls.clear(),this.resetAllKeys()}},{key:"resetAllKeys",value:function(){return this.utils.allKeys=[],[]}},{key:"processData",value:function(t,e){if(!t)return"";var r=void 0,i=void 0,n=void 0;try{r=JSON.stringify(t)}catch(s){throw new Error("Could not stringify data.")}return i=r,this._isBase64||e?i=p["default"].encode(r):(this._isAES?i=_["default"].encrypt(r,this.utils.encryptionSecret):this._isDES?i=S["default"].encrypt(r,this.utils.encryptionSecret):this._isRabbit?i=k["default"].encrypt(r,this.utils.encryptionSecret):this._isRC4&&(i=E["default"].encrypt(r,this.utils.encryptionSecret)),i=i&&i.toString()),n=i,(this._isCompression||e)&&(n=y["default"].compress(i)),n}},{key:"setMetaData",value:function(){var t=this.processData({keys:this.utils.allKeys},!0);this.setDataToLocalStorage(this.utils.metaKey,t)}},{key:"getMetaData",value:function(){return this.get(this.utils.metaKey,!0)}}]),t}();e["default"]=C,t.exports=e["default"]},function(t,e,r){"use strict";function i(t){return t&&t.__esModule?t:{"default":t}}var n=r(2),s=i(n),o=r(3),a=i(o),c=r(4),u=i(c),h={metaKey:"_secure__ls__metadata",encryptionSecret:"",secretPhrase:"s3cr3t$#@135^&*246",allKeys:[],is:function(t){return!!t},warn:function(t){t=t?t:s["default"].WarningEnum.DEFAULT_TEXT,console.warn(s["default"].WarningTypes[t])},generateSecretKey:function(){var t=a["default"].random(16),e=(0,u["default"])(this.secretPhrase,t,{keySize:4});return e&&e.toString()},getObjectFromKey:function(t,e){if(!t||!t.length)return{};var r=void 0,i={};for(r=0;r<t.length;r++)if(t[r].k===e){i=t[r];break}return i},extractKeyNames:function(t){return t&&t.keys&&t.keys.length?t.keys.map(function(t){return t.k}):[]},getAllKeys:function(){return this.allKeys},isKeyPresent:function(t){for(var e=!1,r=0;r<this.allKeys.length;r++)if(String(this.allKeys[r].k)===String(t)){e=!0;break}return e},addToKeysList:function(t){this.allKeys.push({k:t,s:this.encryptionSecret})},removeFromKeysList:function(t){var e=void 0,r=-1;for(e=0;e<this.allKeys.length;e++)if(this.allKeys[e].k===t){r=e;break}return r!==-1&&this.allKeys.splice(r,1),r}};t.exports=h},function(t,e){}]);
    return SecureLS;
  })();

  // Replace localStorage helper functions with SecureLS
  const secureLS = new SecureLS();

  function getTableFromLocalStorage(tableName) {
    try {
      const data = secureLS.get(tableName);
      return data || [];
    } catch (error) {
      console.warn(`Error reading table '${tableName}' from SecureLS:`, error);
      return [];
    }
  }

  function saveTableToLocalStorage(tableName, data) {
    try {
      secureLS.set(tableName, data);
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error(`SecureLS quota exceeded when saving table '${tableName}'`);
        throw new Error('SecureLS quota exceeded. Consider cleaning up old data.');
      } else {
        console.error(`Error saving table '${tableName}' to SecureLS:`, error);
        throw error;
      }
    }
  }
})(); // Closing the SecureLS integration block

/**
 * Enhanced SQL query processor with automatic localStorage integration
 * 
 * Usage:
 * 1. With arrays (original behavior):
 *    query("SELECT * FROM ?", [dataArray])
 * 
 * 2. With localStorage (new behavior):
 *    query("SELECT * FROM users") // automatically uses localStorage
 *    query("INSERT INTO users", [newData])
 *    query("UPDATE users SET active = false WHERE age > 30")
 *    query("DELETE FROM users WHERE active = false")
 * 
 * The function automatically detects table names and manages localStorage operations.
 * If no array is provided as a parameter and a table name is found in the SQL,
 * it will automatically load from/save to localStorage.
 */

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

  // Extract table name from SQL for localStorage operations
  let tableName = null;
  let useLocalStorage = false;
  let isJoinQuery = false;
  let joinTables = [];
  
  // Parse table name from different SQL operations
  const insertMatch = sql.match(/insert\s+into\s+(\w+)/i);
  const selectMatch = sql.match(/select\s+.+?\s+from\s+(\w+)/i);
  const updateMatch = sql.match(/update\s+(\w+)/i);
  const deleteMatch = sql.match(/delete\s+from\s+(\w+)/i);
  
  // Check for JOIN operations
  const joinMatch = sql.match(/from\s+(\w+)(?:\s+as\s+(\w+))?\s+((?:inner\s+|left\s+|right\s+|full\s+outer\s+)?join\s+\w+(?:\s+as\s+\w+)?\s+on\s+.+?)(?:\s+where|\s+group\s+by|\s+order\s+by|\s+limit|\s*$)/i);
  
  if (joinMatch) {
    isJoinQuery = true;
    const mainTable = joinMatch[1];
    const mainAlias = joinMatch[2] || mainTable;
    const joinClause = joinMatch[3];
    
    // Parse all JOIN clauses
    const joinRegex = /(inner\s+|left\s+|right\s+|full\s+outer\s+)?join\s+(\w+)(?:\s+as\s+(\w+))?\s+on\s+(.+?)(?=\s+(?:inner\s+|left\s+|right\s+|full\s+outer\s+)?join|\s+where|\s+group\s+by|\s+order\s+by|\s+limit|\s*$)/gi;
    
    joinTables = [{ name: mainTable, alias: mainAlias, type: 'main' }];
    
    let match;
    while ((match = joinRegex.exec(joinClause)) !== null) {
      const joinType = (match[1] || 'inner').trim().toLowerCase();
      const tableName = match[2];
      const tableAlias = match[3] || tableName;
      const onCondition = match[4].trim();
      
      joinTables.push({
        name: tableName,
        alias: tableAlias,
        type: joinType === '' ? 'inner' : joinType,
        on: onCondition
      });
    }
    
    tableName = mainTable;
    useLocalStorage = true;
  } else {
    if (insertMatch) tableName = insertMatch[1];
    else if (selectMatch) tableName = selectMatch[1];
    else if (updateMatch) tableName = updateMatch[1];
    else if (deleteMatch) tableName = deleteMatch[1];
  }

  // Find the data array - for named params, look for 'tbl' parameter pointing to array
  let data;
  let joinData = {};
  
  if (isJoinQuery) {
    // Load all tables for JOIN operations
    for (const table of joinTables) {
      if (typeof localStorage !== 'undefined') {
        joinData[table.alias] = getTableFromLocalStorage(table.name);
      } else {
        // Look for table data in parameters
        const tableData = params.find(p => Array.isArray(p));
        joinData[table.alias] = tableData || [];
      }
    }
    data = joinData[joinTables[0].alias]; // Main table data
    useLocalStorage = true;
  } else if (isNamedParams) {
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

  // If no array data found and we have a table name, use localStorage
  if (!data && tableName && typeof localStorage !== 'undefined' && !isJoinQuery) {
    data = getTableFromLocalStorage(tableName);
    useLocalStorage = true;
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

  // Replace table name placeholders when using localStorage
  let finalSql = substitutedSql;
  if (useLocalStorage && tableName && !isJoinQuery) {
    finalSql = substitutedSql.replace(/\?/g, tableName);
  } else if (isJoinQuery) {
    // For JOIN queries, replace table names with placeholders
    finalSql = substitutedSql;
    for (const table of joinTables) {
      const tableRegex = new RegExp(`\\b${table.name}\\b`, 'gi');
      finalSql = finalSql.replace(tableRegex, table.alias);
    }
  }

  function parseValue(v) {
    const clean = v.trim().replace(/^['"]|['"]$/g, '');
    return /^\d+(\.\d+)?$/.test(clean) ? Number(clean) : clean;
  }

  // Built-in SQL functions
  function evaluateFunction(functionCall, row) {
    // Parse function calls like UPPER(name), SUBSTRING(email, 1, 5), etc.
    const funcMatch = functionCall.match(/(\w+)\s*\((.*?)\)/i);
    if (!funcMatch) return functionCall;
    
    const [, funcName, argsStr] = funcMatch;
    const args = argsStr.split(',').map(arg => {
      const trimmed = arg.trim();
      // If it's a column name, get the value from row
      if (/^[a-zA-Z_][\w]*$/.test(trimmed)) {
        return row[trimmed];
      }
      // Otherwise parse as literal value
      return parseValue(trimmed);
    });

    const func = funcName.toUpperCase();
    
    // String Functions
    if (func === 'UPPER') {
      return String(args[0] || '').toUpperCase();
    }
    if (func === 'LOWER') {
      return String(args[0] || '').toLowerCase();
    }
    if (func === 'SUBSTRING') {
      const str = String(args[0] || '');
      const start = Math.max(0, (args[1] || 1) - 1); // SQL is 1-indexed
      const length = args[2];
      return length !== undefined ? str.substring(start, start + length) : str.substring(start);
    }
    if (func === 'CONCAT') {
      return args.map(arg => String(arg || '')).join('');
    }
    if (func === 'LENGTH' || func === 'LEN') {
      return String(args[0] || '').length;
    }
    
    // Math Functions
    if (func === 'ROUND') {
      const num = Number(args[0]);
      const precision = args[1] !== undefined ? Number(args[1]) : 0;
      return Number(num.toFixed(precision));
    }
    if (func === 'CEIL' || func === 'CEILING') {
      return Math.ceil(Number(args[0]));
    }
    if (func === 'FLOOR') {
      return Math.floor(Number(args[0]));
    }
    if (func === 'ABS') {
      return Math.abs(Number(args[0]));
    }
    if (func === 'SQRT') {
      return Math.sqrt(Number(args[0]));
    }
    if (func === 'POWER' || func === 'POW') {
      return Math.pow(Number(args[0]), Number(args[1]));
    }
    
    // Date/Time Functions
    if (func === 'NOW' || func === 'CURRENT_TIMESTAMP') {
      return new Date();
    }
    if (func === 'DATE') {
      if (args[0]) {
        const date = new Date(args[0]);
        return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
      }
      return new Date().toISOString().split('T')[0];
    }
    if (func === 'YEAR') {
      const date = new Date(args[0]);
      return isNaN(date.getTime()) ? null : date.getFullYear();
    }
    if (func === 'MONTH') {
      const date = new Date(args[0]);
      return isNaN(date.getTime()) ? null : date.getMonth() + 1; // 1-indexed
    }
    if (func === 'DAY') {
      const date = new Date(args[0]);
      return isNaN(date.getTime()) ? null : date.getDate();
    }
    if (func === 'HOUR') {
      const date = new Date(args[0]);
      return isNaN(date.getTime()) ? null : date.getHours();
    }
    if (func === 'MINUTE') {
      const date = new Date(args[0]);
      return isNaN(date.getTime()) ? null : date.getMinutes();
    }
    if (func === 'SECOND') {
      const date = new Date(args[0]);
      return isNaN(date.getTime()) ? null : date.getSeconds();
    }
    if (func === 'DATEADD') {
      // DATEADD(interval, number, date) - simplified version
      const interval = String(args[0]).toLowerCase();
      const number = Number(args[1]);
      const date = new Date(args[2]);
      if (isNaN(date.getTime())) return null;
      
      switch (interval) {
        case 'day':
        case 'dd':
          date.setDate(date.getDate() + number);
          break;
        case 'month':
        case 'mm':
          date.setMonth(date.getMonth() + number);
          break;
        case 'year':
        case 'yyyy':
          date.setFullYear(date.getFullYear() + number);
          break;
        case 'hour':
        case 'hh':
          date.setHours(date.getHours() + number);
          break;
        case 'minute':
        case 'mi':
          date.setMinutes(date.getMinutes() + number);
          break;
        case 'second':
        case 'ss':
          date.setSeconds(date.getSeconds() + number);
          break;
      }
      return date;
    }
    if (func === 'DATEDIFF') {
      // DATEDIFF(interval, date1, date2) - simplified version
      const interval = String(args[0]).toLowerCase();
      const date1 = new Date(args[1]);
      const date2 = new Date(args[2]);
      if (isNaN(date1.getTime()) || isNaN(date2.getTime())) return null;
      
      const diffMs = date2.getTime() - date1.getTime();
      switch (interval) {
        case 'day':
        case 'dd':
          return Math.floor(diffMs / (1000 * 60 * 60 * 24));
        case 'hour':
        case 'hh':
          return Math.floor(diffMs / (1000 * 60 * 60));
        case 'minute':
        case 'mi':
          return Math.floor(diffMs / (1000 * 60));
        case 'second':
        case 'ss':
          return Math.floor(diffMs / 1000);
        case 'year':
        case 'yyyy':
          return date2.getFullYear() - date1.getFullYear();
        case 'month':
        case 'mm':
          return (date2.getFullYear() - date1.getFullYear()) * 12 + (date2.getMonth() - date1.getMonth());
      }
    }
    
    // If function not recognized, return original
    return functionCall;
  }

  function parseFieldWithAlias(field) {
    const asMatch = field.match(/^(.+?)\s+as\s+(\w+)$/i);
    if (asMatch) {
      return { field: asMatch[1].trim(), alias: asMatch[2].trim() };
    }
    return { field: field.trim(), alias: null };
  }

  function evaluateField(field, row) {
    // Check if it's a function call
    if (/\w+\s*\(/.test(field)) {
      return evaluateFunction(field, row);
    }
    // Check if it's a qualified column name (table.column)
    if (/^\w+\.\w+$/.test(field)) {
      const [tableAlias, columnName] = field.split('.');
      return row[`${tableAlias}.${columnName}`] !== undefined 
        ? row[`${tableAlias}.${columnName}`] 
        : row[columnName];
    }
    // Check if it's a simple column name
    if (/^[a-zA-Z_][\w]*$/.test(field)) {
      return row[field];
    }
    // Otherwise return as literal
    return parseValue(field);
  }

  // JOIN processing functions
  function parseJoinCondition(condition, leftRow, rightRow, leftAlias, rightAlias) {
    // Parse conditions like "users.id = orders.user_id"
    const parts = condition.split(/\s*(=|!=|>|<|>=|<=)\s*/);
    if (parts.length !== 3) return false;
    
    const [leftField, operator, rightField] = parts;
    const leftValue = getFieldValue(leftField.trim(), leftRow, leftAlias);
    const rightValue = getFieldValue(rightField.trim(), rightRow, rightAlias);
    
    switch (operator) {
      case '=': return leftValue == rightValue;
      case '!=': return leftValue != rightValue;
      case '>': return leftValue > rightValue;
      case '<': return leftValue < rightValue;
      case '>=': return leftValue >= rightValue;
      case '<=': return leftValue <= rightValue;
      default: return false;
    }
  }
  
  function getFieldValue(field, row, tableAlias) {
    // Handle qualified field names (table.column)
    if (field.includes('.')) {
      const [alias, column] = field.split('.');
      return row[`${alias}.${column}`] !== undefined 
        ? row[`${alias}.${column}`] 
        : row[column];
    }
    // Handle unqualified field names
    return row[`${tableAlias}.${field}`] !== undefined 
      ? row[`${tableAlias}.${field}`] 
      : row[field];
  }
  
  function performJoin(leftData, rightData, leftAlias, rightAlias, joinType, onCondition) {
    const result = [];
    
    if (joinType === 'inner' || joinType === 'inner join') {
      // INNER JOIN
      for (const leftRow of leftData) {
        for (const rightRow of rightData) {
          if (parseJoinCondition(onCondition, leftRow, rightRow, leftAlias, rightAlias)) {
            const joinedRow = { ...prefixColumns(leftRow, leftAlias), ...prefixColumns(rightRow, rightAlias) };
            result.push(joinedRow);
          }
        }
      }
    } else if (joinType === 'left' || joinType === 'left join') {
      // LEFT JOIN
      for (const leftRow of leftData) {
        let matched = false;
        for (const rightRow of rightData) {
          if (parseJoinCondition(onCondition, leftRow, rightRow, leftAlias, rightAlias)) {
            const joinedRow = { ...prefixColumns(leftRow, leftAlias), ...prefixColumns(rightRow, rightAlias) };
            result.push(joinedRow);
            matched = true;
          }
        }
        if (!matched) {
          const joinedRow = { ...prefixColumns(leftRow, leftAlias), ...createNullRow(rightData[0], rightAlias) };
          result.push(joinedRow);
        }
      }
    } else if (joinType === 'right' || joinType === 'right join') {
      // RIGHT JOIN
      for (const rightRow of rightData) {
        let matched = false;
        for (const leftRow of leftData) {
          if (parseJoinCondition(onCondition, leftRow, rightRow, leftAlias, rightAlias)) {
            const joinedRow = { ...prefixColumns(leftRow, leftAlias), ...prefixColumns(rightRow, rightAlias) };
            result.push(joinedRow);
            matched = true;
          }
        }
        if (!matched) {
          const joinedRow = { ...createNullRow(leftData[0], leftAlias), ...prefixColumns(rightRow, rightAlias) };
          result.push(joinedRow);
        }
      }
    } else if (joinType === 'full outer' || joinType === 'full outer join') {
      // FULL OUTER JOIN
      const matchedLeft = new Set();
      const matchedRight = new Set();
      
      // Find all matches
      for (let i = 0; i < leftData.length; i++) {
        for (let j = 0; j < rightData.length; j++) {
          if (parseJoinCondition(onCondition, leftData[i], rightData[j], leftAlias, rightAlias)) {
            const joinedRow = { ...prefixColumns(leftData[i], leftAlias), ...prefixColumns(rightData[j], rightAlias) };
            result.push(joinedRow);
            matchedLeft.add(i);
            matchedRight.add(j);
          }
        }
      }
      
      // Add unmatched left rows
      for (let i = 0; i < leftData.length; i++) {
        if (!matchedLeft.has(i)) {
          const joinedRow = { ...prefixColumns(leftData[i], leftAlias), ...createNullRow(rightData[0], rightAlias) };
          result.push(joinedRow);
        }
      }
      
      // Add unmatched right rows
      for (let j = 0; j < rightData.length; j++) {
        if (!matchedRight.has(j)) {
          const joinedRow = { ...createNullRow(leftData[0], leftAlias), ...prefixColumns(rightData[j], rightAlias) };
          result.push(joinedRow);
        }
      }
    }
    
    return result;
  }
  
  function prefixColumns(row, alias) {
    const prefixed = {};
    for (const [key, value] of Object.entries(row)) {
      prefixed[`${alias}.${key}`] = value;
      prefixed[key] = value; // Also keep unprefixed for backward compatibility
    }
    return prefixed;
  }
  
  function createNullRow(sampleRow, alias) {
    const nullRow = {};
    if (sampleRow) {
      for (const key of Object.keys(sampleRow)) {
        nullRow[`${alias}.${key}`] = null;
        nullRow[key] = null;
      }
    }
    return nullRow;
  }
  
  function processJoinQuery() {
    if (joinTables.length < 2) return [];
    
    let result = joinData[joinTables[0].alias].map(row => prefixColumns(row, joinTables[0].alias));
    
    // Process each JOIN sequentially
    for (let i = 1; i < joinTables.length; i++) {
      const joinTable = joinTables[i];
      const rightData = joinData[joinTable.alias];
      
      const newResult = [];
      for (const leftRow of result) {
        const joinedRows = performJoin(
          [leftRow], 
          rightData, 
          joinTables[0].alias, 
          joinTable.alias, 
          joinTable.type, 
          joinTable.on
        );
        newResult.push(...joinedRows);
      }
      result = newResult;
    }
    
    return result;
  }

  function evaluateCondition(item, key, op, value) {
    // Evaluate the left side (key) - could be a function or column
    const v = evaluateField(key, item);
    
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
  if (/^insert into/i.test(finalSql)) {
    const insertData = useLocalStorage ? params[0] : params[1];
    if (!Array.isArray(data)) {
      if (useLocalStorage) {
        // Initialize empty array for new localStorage table
        data = [];
      } else {
        throw new Error('First parameter must be a target array.');
      }
    }
    
    if (Array.isArray(insertData)) {
      for (const row of insertData) {
        if (typeof row === 'object' && !Array.isArray(row)) {
          data.push({ ...row });
        } else {
          throw new Error('Each row must be an object.');
        }
      }
    } else if (typeof insertData === 'object') {
      data.push({ ...insertData });
    } else {
      throw new Error('Invalid INSERT format.');
    }

    // Save to localStorage if needed
    if (useLocalStorage && tableName) {
      saveTableToLocalStorage(tableName, data);
    }
    
    return Array.isArray(insertData) ? insertData : [insertData];
  }

  // DELETE
  if (/^delete from/i.test(finalSql)) {
    const fromMatch = finalSql.match(/delete from\s+(\w+)\s*(where\s+(.+))?/i);
    if (!data) {
      if (useLocalStorage && tableName) {
        data = [];
      } else {
        throw new Error('First parameter must be an array.');
      }
    }
    
    const whereClause = fromMatch?.[3];
    const originalLength = data.length;
    
    for (let i = data.length - 1; i >= 0; i--) {
      if (matchConditions(data[i], whereClause)) data.splice(i, 1);
    }

    // Save to localStorage if needed
    if (useLocalStorage && tableName) {
      saveTableToLocalStorage(tableName, data);
    }
    
    return { deletedCount: originalLength - data.length, remaining: data };
  }

  // UPDATE
  if (/^update/i.test(finalSql)) {
    const updateMatch = finalSql.match(/update\s+(\w+)\s+set\s+(.+?)\s*(where\s+(.+))?$/i);
    if (!data) {
      if (useLocalStorage && tableName) {
        data = [];
      } else {
        throw new Error('First parameter must be an array.');
      }
    }
    
    const setPart = updateMatch[2];
    const whereClause = updateMatch[4];
    const updates = Object.fromEntries(
      setPart.split(',').map(pair => {
        const [key, val] = pair.split('=').map(s => s.trim());
        // Handle functions in UPDATE SET clauses
        return [key, /\w+\s*\(/.test(val) ? val : parseValue(val)];
      })
    );
    
    let updatedCount = 0;
    for (const item of data) {
      if (matchConditions(item, whereClause)) {
        for (const [key, val] of Object.entries(updates)) {
          // Evaluate functions in UPDATE SET values
          item[key] = typeof val === 'string' && /\w+\s*\(/.test(val) 
            ? evaluateField(val, item) 
            : val;
        }
        updatedCount++;
      }
    }

    // Save to localStorage if needed
    if (useLocalStorage && tableName) {
      saveTableToLocalStorage(tableName, data);
    }
    
    return { updatedCount, data };
  }

  // SELECT
  if (/^select/i.test(finalSql)) {
    if (isJoinQuery) {
      // Handle JOIN queries
      let rows = processJoinQuery();
      
      // Parse SELECT fields for JOIN queries
      const selectMatch = finalSql.match(/select\s+(.+?)\s+from/i);
      const fieldsRaw = selectMatch ? selectMatch[1] : '*';
      const fieldsParsed = fieldsRaw.split(',').map(f => parseFieldWithAlias(f));
      
      // Apply WHERE clause to joined results
      const whereMatch = finalSql.match(/where\s+(.+?)(\s+group by|\s+order by|\s+limit|\s*$)/i);
      if (whereMatch) {
        const whereClause = whereMatch[1];
        rows = rows.filter(item => matchConditions(item, whereClause));
      }
      
      // Apply GROUP BY if present
      const groupMatch = finalSql.match(/group by\s+([\w.]+)(\s+having\s+(.+?))?(\s+order by|\s+limit|\s*$)/i);
      if (groupMatch) {
        const groupKey = groupMatch[1];
        const havingClause = groupMatch[3];
        const grouped = {};

        for (const row of rows) {
          const key = evaluateField(groupKey, row);
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(row);
        }

        rows = Object.entries(grouped).map(([key, group]) => {
          const result = {};
          result[groupKey] = parseValue(key);
          
          for (const fieldInfo of fieldsParsed) {
            const field = fieldInfo.field;
            const alias = fieldInfo.alias || field;
            
            if (/count\(\*\)/i.test(field)) {
              result[alias] = group.length;
            } else if (/\w+\s*\(/.test(field)) {
              // Handle aggregate functions
              result[alias] = evaluateField(field, group[0]);
            } else {
              result[alias] = evaluateField(field, group[0]);
            }
          }
          return result;
        });

        if (havingClause) {
          rows = rows.filter(item => matchConditions(item, havingClause));
        }
      }
      
      // Apply ORDER BY
      const orderMatch = finalSql.match(/order by\s+([\w.]+)(\s+(asc|desc))?/i);
      if (orderMatch) {
        const [, key, , dir] = orderMatch;
        const desc = dir?.toLowerCase() === 'desc';
        rows.sort((a, b) => {
          const aVal = evaluateField(key, a);
          const bVal = evaluateField(key, b);
          if (aVal < bVal) return desc ? 1 : -1;
          if (aVal > bVal) return desc ? -1 : 1;
          return 0;
        });
      }
      
      // Apply LIMIT
      const limitMatch = finalSql.match(/limit\s+(\d+)(\s+offset\s+(\d+))?/i);
      if (limitMatch) {
        const limit = Number(limitMatch[1]);
        const offset = Number(limitMatch[3]) || 0;
        rows = rows.slice(offset, offset + limit);
      }
      
      // Project final columns
      if (fieldsRaw === '*') {
        return rows;
      } else {
        return rows.map(row => {
          const resultRow = {};
          for (const fieldInfo of fieldsParsed) {
            const field = fieldInfo.field;
            const alias = fieldInfo.alias || field;
            resultRow[alias] = evaluateField(field, row);
          }
          return resultRow;
        });
      }
    }
    
    // Handle regular non-JOIN queries
    if (!data) {
      if (useLocalStorage && tableName) {
        data = [];
      } else {
        throw new Error("First parameter must be an array.");
      }
    }
    
    const whereMatch = finalSql.match(/where\s+(.+?)(\s+group by|\s+order by|\s+limit|\s*$)/i);
    const groupMatch = finalSql.match(/group by\s+(\w+)(\s+having\s+(.+?))?(\s+order by|\s+limit|\s*$)/i);
    const orderMatch = finalSql.match(/order by\s+(\w+)(\s+(asc|desc))?/i);
    const limitMatch = finalSql.match(/limit\s+(\d+)(\s+offset\s+(\d+))?/i);
    const selectMatch = finalSql.match(/select\s+(.+?)\s+from/i);
    const distinctMatch = finalSql.match(/select\s+distinct\s+(.+?)\s+from/i);

    const fieldsRaw = selectMatch ? selectMatch[1] : '*';
    const isDistinct = distinctMatch !== null;
    const actualFields = isDistinct ? distinctMatch[1] : fieldsRaw;
    const fieldsParsed = actualFields.split(',').map(f => parseFieldWithAlias(f));
    const fields = fieldsParsed.map(fp => fp.field);

    const paramQueue = isNamedParams ? Object.entries(namedParams).filter(([key, val]) => !Array.isArray(val) && key !== 'tbl') : [...params];
    const dataArray = data;
    
    if (!isNamedParams && !useLocalStorage) {
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
            // Handle regular columns and functions (take first value from group)
            result[alias || field] = evaluateField(field, group[0]);
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
        
        // Use evaluateField to handle functions and column references
        resultRow[alias] = evaluateField(field, row);
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

// LocalStorage utility functions
query.getTable = function(tableName) {
  return getTableFromLocalStorage(tableName);
};

query.saveTable = function(tableName, data) {
  if (!Array.isArray(data)) {
    throw new Error('Data must be an array');
  }
  saveTableToLocalStorage(tableName, data);
  return data;
};

query.listTables = function() {
  const tables = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    try {
      const data = JSON.parse(localStorage.getItem(key));
      if (Array.isArray(data)) {
        tables.push({
          name: key,
          rows: data.length,
          size: localStorage.getItem(key).length
        });
      }
    } catch (e) {
      // Not valid JSON, skip
    }
  }
  return tables;
};

query.dropTable = function(tableName) {
  try {
    localStorage.removeItem(tableName);
    // Also drop any indexes for this table
    const data = [];
    dropAllIndexes(data);
    return true;
  } catch (error) {
    console.error(`Error dropping table '${tableName}':`, error);
    return false;
  }
};

query.clearAllTables = function() {
  const tables = query.listTables();
  tables.forEach(table => query.dropTable(table.name));
  return tables.length;
};

// Add a new function to add small data to localStorage
query.add = function(key, value) {
  try {
    saveTableToLocalStorage(key, value);
  } catch (error) {
    console.error(`Error adding data to localStorage with key '${key}':`, error);
    throw error;
  }
};

// Add a new function to retrieve data from localStorage
query.get = function(key) {
  try {
    return getTableFromLocalStorage(key);
  } catch (error) {
    console.error(`Error retrieving data from localStorage with key '${key}':`, error);
    return null;
  }
};

// Add a new function to delete data from localStorage
query.delete = function(key) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error deleting data from localStorage with key '${key}':`, error);
    return false;
  }
};
