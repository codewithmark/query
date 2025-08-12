/*!
* Query v1.0.0
* URL: https://github.com/codewithmark/query
* Released under the MIT License.
*/
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

!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define("SecureLS",[],e):"object"==typeof exports?exports.SecureLS=e():t.SecureLS=e()}(this,function(){return function(t){function e(i){if(r[i])return r[i].exports;var n=r[i]={exports:{},id:i,loaded:!1};return t[i].call(n.exports,n,n.exports,e),n.loaded=!0,n.exports}var r={};return e.m=t,e.c=r,e.p="",e(0)}([function(t,e,r){"use strict";function i(t){return t&&t.__esModule?t:{"default":t}}function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(e,"__esModule",{value:!0});var s=function(){function t(t,e){for(var r=0;r<e.length;r++){var i=e[r];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i)}}return function(e,r,i){return r&&t(e.prototype,r),i&&t(e,i),e}}(),o=r(1),a=i(o),c=r(2),u=i(c),h=r(8),f=i(h),l=r(9),p=i(l),d=r(10),y=i(d),v=r(11),_=i(v),g=r(16),S=i(g),m=r(17),k=i(m),B=r(18),E=i(B),C=function(){function t(e){n(this,t),e=e||{},this._name="secure-ls",this.utils=a["default"],this.constants=u["default"],this.Base64=p["default"],this.LZString=y["default"],this.AES=_["default"],this.DES=S["default"],this.RABBIT=k["default"],this.RC4=E["default"],this.enc=f["default"],this.config={isCompression:!0,encodingType:u["default"].EncrytionTypes.BASE64},this.config.isCompression="undefined"==typeof e.isCompression||e.isCompression,this.config.encodingType="undefined"!=typeof e.encodingType||""===e.encodingType?e.encodingType.toLowerCase():u["default"].EncrytionTypes.BASE64,this.config.encryptionSecret=e.encryptionSecret,this.ls=localStorage,this.init()}return s(t,[{key:"init",value:function(){var t=this.getMetaData()||{};this.WarningEnum=this.constants.WarningEnum,this.WarningTypes=this.constants.WarningTypes,this.EncrytionTypes=this.constants.EncrytionTypes,this._isBase64=this._isBase64EncryptionType(),this._isAES=this._isAESEncryptionType(),this._isDES=this._isDESEncryptionType(),this._isRabbit=this._isRabbitEncryptionType(),this._isRC4=this._isRC4EncryptionType(),this._isCompression=this._isDataCompressionEnabled(),this.utils.allKeys=t.keys||this.resetAllKeys()}},{key:"_isBase64EncryptionType",value:function(){return p["default"]&&("undefined"==typeof this.config.encodingType||this.config.encodingType===this.constants.EncrytionTypes.BASE64)}},{key:"_isAESEncryptionType",value:function(){return _["default"]&&this.config.encodingType===this.constants.EncrytionTypes.AES}},{key:"_isDESEncryptionType",value:function(){return S["default"]&&this.config.encodingType===this.constants.EncrytionTypes.DES}},{key:"_isRabbitEncryptionType",value:function(){return k["default"]&&this.config.encodingType===this.constants.EncrytionTypes.RABBIT}},{key:"_isRC4EncryptionType",value:function(){return E["default"]&&this.config.encodingType===this.constants.EncrytionTypes.RC4}},{key:"_isDataCompressionEnabled",value:function(){return this.config.isCompression}},{key:"getEncyptionSecret",value:function(t){var e=this.getMetaData()||{},r=this.utils.getObjectFromKey(e.keys,t);r&&(this._isAES||this._isDES||this._isRabbit||this._isRC4)&&("undefined"==typeof this.config.encryptionSecret?(this.utils.encryptionSecret=r.s,this.utils.encryptionSecret||(this.utils.encryptionSecret=this.utils.generateSecretKey(),this.setMetaData())):this.utils.encryptionSecret=this.config.encryptionSecret||r.s||"")}},{key:"get",value:function(t,e){var r="",i="",n=void 0,s=void 0,o=void 0;if(!this.utils.is(t))return this.utils.warn(this.WarningEnum.KEY_NOT_PROVIDED),i;if(o=this.getDataFromLocalStorage(t),!o)return i;n=o,(this._isCompression||e)&&(n=y["default"].decompress(o)),r=n,this._isBase64||e?r=p["default"].decode(n):(this.getEncyptionSecret(t),this._isAES?s=_["default"].decrypt(n.toString(),this.utils.encryptionSecret):this._isDES?s=S["default"].decrypt(n.toString(),this.utils.encryptionSecret):this._isRabbit?s=k["default"].decrypt(n.toString(),this.utils.encryptionSecret):this._isRC4&&(s=E["default"].decrypt(n.toString(),this.utils.encryptionSecret)),s&&(r=s.toString(f["default"]._Utf8)));try{i=JSON.parse(r)}catch(a){throw new Error("Could not parse JSON")}return i}},{key:"getDataFromLocalStorage",value:function(t){return this.ls.getItem(t,!0)}},{key:"getAllKeys",value:function(){var t=this.getMetaData();return this.utils.extractKeyNames(t)||[]}},{key:"set",value:function(t,e){var r="";return this.utils.is(t)?(this.getEncyptionSecret(t),String(t)!==String(this.utils.metaKey)&&(this.utils.isKeyPresent(t)||(this.utils.addToKeysList(t),this.setMetaData())),r=this.processData(e),void this.setDataToLocalStorage(t,r)):void this.utils.warn(this.WarningEnum.KEY_NOT_PROVIDED)}},{key:"setDataToLocalStorage",value:function(t,e){this.ls.setItem(t,e)}},{key:"remove",value:function(t){return this.utils.is(t)?t===this.utils.metaKey&&this.getAllKeys().length?void this.utils.warn(this.WarningEnum.META_KEY_REMOVE):(this.utils.isKeyPresent(t)&&(this.utils.removeFromKeysList(t),this.setMetaData()),void this.ls.removeItem(t)):void this.utils.warn(this.WarningEnum.KEY_NOT_PROVIDED)}},{key:"removeAll",value:function(){var t=void 0,e=void 0;for(t=this.getAllKeys(),e=0;e<t.length;e++)this.ls.removeItem(t[e]);this.ls.removeItem(this.utils.metaKey),this.resetAllKeys()}},{key:"clear",value:function(){this.ls.clear(),this.resetAllKeys()}},{key:"resetAllKeys",value:function(){return this.utils.allKeys=[],[]}},{key:"processData",value:function(t,e){if(!t)return"";var r=void 0,i=void 0,n=void 0;try{r=JSON.stringify(t)}catch(s){throw new Error("Could not stringify data.")}return i=r,this._isBase64||e?i=p["default"].encode(r):(this._isAES?i=_["default"].encrypt(r,this.utils.encryptionSecret):this._isDES?i=S["default"].encrypt(r,this.utils.encryptionSecret):this._isRabbit?i=k["default"].encrypt(r,this.utils.encryptionSecret):this._isRC4&&(i=E["default"].encrypt(r,this.utils.encryptionSecret)),i=i&&i.toString()),n=i,(this._isCompression||e)&&(n=y["default"].compress(i)),n}},{key:"setMetaData",value:function(){var t=this.processData({keys:this.utils.allKeys},!0);this.setDataToLocalStorage(this.utils.metaKey,t)}},{key:"getMetaData",value:function(){return this.get(this.utils.metaKey,!0)}}]),t}();e["default"]=C,t.exports=e["default"]},function(t,e,r){"use strict";function i(t){return t&&t.__esModule?t:{"default":t}}var n=r(2),s=i(n),o=r(3),a=i(o),c=r(4),u=i(c),h={metaKey:"_secure__ls__metadata",encryptionSecret:"",secretPhrase:"s3cr3t$#@135^&*246",allKeys:[],is:function(t){return!!t},warn:function(t){t=t?t:s["default"].WarningEnum.DEFAULT_TEXT,console.warn(s["default"].WarningTypes[t])},generateSecretKey:function(){var t=a["default"].random(16),e=(0,u["default"])(this.secretPhrase,t,{keySize:4});return e&&e.toString()},getObjectFromKey:function(t,e){if(!t||!t.length)return{};var r=void 0,i={};for(r=0;r<t.length;r++)if(t[r].k===e){i=t[r];break}return i},extractKeyNames:function(t){return t&&t.keys&&t.keys.length?t.keys.map(function(t){return t.k}):[]},getAllKeys:function(){return this.allKeys},isKeyPresent:function(t){for(var e=!1,r=0;r<this.allKeys.length;r++)if(String(this.allKeys[r].k)===String(t)){e=!0;break}return e},addToKeysList:function(t){this.allKeys.push({k:t,s:this.encryptionSecret})},removeFromKeysList:function(t){var e=void 0,r=-1;for(e=0;e<this.allKeys.length;e++)if(this.allKeys[e].k===t){r=e;break}return r!==-1&&this.allKeys.splice(r,1),r}};t.exports=h},function(t,e){"use strict";var r={KEY_NOT_PROVIDED:"keyNotProvided",META_KEY_REMOVE:"metaKeyRemove",DEFAULT_TEXT:"defaultText"},i={};i[r.KEY_NOT_PROVIDED]="Secure LS: Key not provided. Aborting operation!",i[r.META_KEY_REMOVE]="Secure LS: Meta key can not be removed\nunless all keys created by Secure LS are removed!",i[r.DEFAULT_TEXT]="Unexpected output";var n={WarningEnum:r,WarningTypes:i,EncrytionTypes:{BASE64:"base64",AES:"aes",DES:"des",RABBIT:"rabbit",RC4:"rc4"}};t.exports=n},function(t,e){"use strict";var r={};r.random=function(t){for(var e,r=[],i=function(t){var e=987654321,r=4294967295;return function(){e=36969*(65535&e)+(e>>16)&r,t=18e3*(65535&t)+(t>>16)&r;var i=(e<<16)+t&r;return i/=4294967296,i+=.5,i*(Math.random()>.5?1:-1)}},n=0;n<t;n+=4){var s=i(4294967296*(e||Math.random()));e=987654071*s(),r.push(4294967296*s()|0)}return new this.Set(r,t)},r.Set=function(t,e){t=this.words=t||[],void 0!==e?this.sigBytes=e:this.sigBytes=8*t.length},t.exports=r},function(t,e,r){!function(i,n,s){t.exports=e=n(r(5),r(6),r(7))}(this,function(t){return function(){var e=t,r=e.lib,i=r.Base,n=r.WordArray,s=e.algo,o=s.SHA1,a=s.HMAC,c=s.PBKDF2=i.extend({cfg:i.extend({keySize:4,hasher:o,iterations:1}),init:function(t){this.cfg=this.cfg.extend(t)},compute:function(t,e){for(var r=this.cfg,i=a.create(r.hasher,t),s=n.create(),o=n.create([1]),c=s.words,u=o.words,h=r.keySize,f=r.iterations;c.length<h;){var l=i.update(e).finalize(o);i.reset();for(var p=l.words,d=p.length,y=l,v=1;v<f;v++){y=i.finalize(y),i.reset();for(var _=y.words,g=0;g<d;g++)p[g]^=_[g]}s.concat(l),u[0]++}return s.sigBytes=4*h,s}});e.PBKDF2=function(t,e,r){return c.create(r).compute(t,e)}}(),t.PBKDF2})},function(t,e,r){!function(r,i){t.exports=e=i()}(this,function(){var t=t||function(t,e){var r={},i=r.lib={},n=i.Base=function(){function t(){}return{extend:function(e){t.prototype=this;var r=new t;return e&&r.mixIn(e),r.hasOwnProperty("init")||(r.init=function(){r.$super.init.apply(this,arguments)}),r.init.prototype=r,r.$super=this,r},create:function(){var t=this.extend();return t.init.apply(t,arguments),t},init:function(){},mixIn:function(t){for(var e in t)t.hasOwnProperty(e)&&(this[e]=t[e]);t.hasOwnProperty("toString")&&(this.toString=t.toString)},clone:function(){return this.init.prototype.extend(this)}}}(),s=i.WordArray=n.extend({init:function(t,r){t=this.words=t||[],r!=e?this.sigBytes=r:this.sigBytes=4*t.length},toString:function(t){return(t||a).stringify(this)},concat:function(t){var e=this.words,r=t.words,i=this.sigBytes,n=t.sigBytes;if(this.clamp(),i%4)for(var s=0;s<n;s++){var o=r[s>>>2]>>>24-s%4*8&255;e[i+s>>>2]|=o<<24-(i+s)%4*8}else for(var s=0;s<n;s+=4)e[i+s>>>2]=r[s>>>2];return this.sigBytes+=n,this},clamp:function(){var e=this.words,r=this.sigBytes;e[r>>>2]&=4294967295<<32-r%4*8,e.length=t.ceil(r/4)},clone:function(){var t=n.clone.call(this);return t.words=this.words.slice(0),t},random:function(e){for(var r,i=[],n=function(e){var e=e,r=987654321,i=4294967295;return function(){r=36969*(65535&r)+(r>>16)&i,e=18e3*(65535&e)+(e>>16)&i;var n=(r<<16)+e&i;return n/=4294967296,n+=.5,n*(t.random()>.5?1:-1)}},o=0;o<e;o+=4){var a=n(4294967296*(r||t.random()));r=987654071*a(),i.push(4294967296*a()|0)}return new s.init(i,e)}}),o=r.enc={},a=o.Hex={stringify:function(t){for(var e=t.words,r=t.sigBytes,i=[],n=0;n<r;n++){var s=e[n>>>2]>>>24-n%4*8&255;i.push((s>>>4).toString(16)),i.push((15&s).toString(16))}return i.join("")},parse:function(t){for(var e=t.length,r=[],i=0;i<e;i+=2)r[i>>>3]|=parseInt(t.substr(i,2),16)<<24-i%8*4;return new s.init(r,e/2)}},c=o.Latin1={stringify:function(t){for(var e=t.words,r=t.sigBytes,i=[],n=0;n<r;n++){var s=e[n>>>2]>>>24-n%4*8&255;i.push(String.fromCharCode(s))}return i.join("")},parse:function(t){for(var e=t.length,r=[],i=0;i<e;i++)r[i>>>2]|=(255&t.charCodeAt(i))<<24-i%4*8;return new s.init(r,e)}},u=o.Utf8={stringify:function(t){try{return decodeURIComponent(escape(c.stringify(t)))}catch(e){throw new Error("Malformed UTF-8 data")}},parse:function(t){return c.parse(unescape(encodeURIComponent(t)))}},h=i.BufferedBlockAlgorithm=n.extend({reset:function(){this._data=new s.init,this._nDataBytes=0},_append:function(t){"string"==typeof t&&(t=u.parse(t)),this._data.concat(t),this._nDataBytes+=t.sigBytes},_process:function(e){var r=this._data,i=r.words,n=r.sigBytes,o=this.blockSize,a=4*o,c=n/a;c=e?t.ceil(c):t.max((0|c)-this._minBufferSize,0);var u=c*o,h=t.min(4*u,n);if(u){for(var f=0;f<u;f+=o)this._doProcessBlock(i,f);var l=i.splice(0,u);r.sigBytes-=h}return new s.init(l,h)},clone:function(){var t=n.clone.call(this);return t._data=this._data.clone(),t},_minBufferSize:0}),f=(i.Hasher=h.extend({cfg:n.extend(),init:function(t){this.cfg=this.cfg.extend(t),this.reset()},reset:function(){h.reset.call(this),this._doReset()},update:function(t){return this._append(t),this._process(),this},finalize:function(t){t&&this._append(t);var e=this._doFinalize();return e},blockSize:16,_createHelper:function(t){return function(e,r){return new t.init(r).finalize(e)}},_createHmacHelper:function(t){return function(e,r){return new f.HMAC.init(t,r).finalize(e)}}}),r.algo={});return r}(Math);return t})},function(t,e,r){!function(i,n){t.exports=e=n(r(5))}(this,function(t){return function(){var e=t,r=e.lib,i=r.WordArray,n=r.Hasher,s=e.algo,o=[],a=s.SHA1=n.extend({_doReset:function(){this._hash=new i.init([1732584193,4023233417,2562383102,271733878,3285377520])},_doProcessBlock:function(t,e){for(var r=this._hash.words,i=r[0],n=r[1],s=r[2],a=r[3],c=r[4],u=0;u<80;u++){if(u<16)o[u]=0|t[e+u];else{var h=o[u-3]^o[u-8]^o[u-14]^o[u-16];o[u]=h<<1|h>>>31}var f=(i<<5|i>>>27)+c+o[u];f+=u<20?(n&s|~n&a)+1518500249:u<40?(n^s^a)+1859775393:u<60?(n&s|n&a|s&a)-1894007588:(n^s^a)-899497514,c=a,a=s,s=n<<30|n>>>2,n=i,i=f}r[0]=r[0]+i|0,r[1]=r[1]+n|0,r[2]=r[2]+s|0,r[3]=r[3]+a|0,r[4]=r[4]+c|0},_doFinalize:function(){var t=this._data,e=t.words,r=8*this._nDataBytes,i=8*t.sigBytes;return e[i>>>5]|=128<<24-i%32,e[(i+64>>>9<<4)+14]=Math.floor(r/4294967296),e[(i+64>>>9<<4)+15]=r,t.sigBytes=4*e.length,this._process(),this._hash},clone:function(){var t=n.clone.call(this);return t._hash=this._hash.clone(),t}});e.SHA1=n._createHelper(a),e.HmacSHA1=n._createHmacHelper(a)}(),t.SHA1})},function(t,e,r){!function(i,n){t.exports=e=n(r(5))}(this,function(t){!function(){var e=t,r=e.lib,i=r.Base,n=e.enc,s=n.Utf8,o=e.algo;o.HMAC=i.extend({init:function(t,e){t=this._hasher=new t.init,"string"==typeof e&&(e=s.parse(e));var r=t.blockSize,i=4*r;e.sigBytes>i&&(e=t.finalize(e)),e.clamp();for(var n=this._oKey=e.clone(),o=this._iKey=e.clone(),a=n.words,c=o.words,u=0;u<r;u++)a[u]^=1549556828,c[u]^=909522486;n.sigBytes=o.sigBytes=i,this.reset()},reset:function(){var t=this._hasher;t.reset(),t.update(this._iKey)},update:function(t){return this._hasher.update(t),this},finalize:function(t){var e=this._hasher,r=e.finalize(t);e.reset();var i=e.finalize(this._oKey.clone().concat(r));return i}})}()})},function(t,e){"use strict";var r={};r.Latin1={stringify:function(t){var e=t.words,r=t.sigBytes,i=[],n=void 0,s=void 0;for(n=0;n<r;n++)s=e[n>>>2]>>>24-n%4*8&255,i.push(String.fromCharCode(s));return i.join("")}},r._Utf8={stringify:function(t){try{return decodeURIComponent(escape(r.Latin1.stringify(t)))}catch(e){throw new Error("Malformed UTF-8 data")}}},t.exports=r},function(t,e){"use strict";var r={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(t){var e="",i=void 0,n=void 0,s=void 0,o=void 0,a=void 0,c=void 0,u=void 0,h=0;for(t=r._utf8Encode(t);h<t.length;)i=t.charCodeAt(h++),n=t.charCodeAt(h++),s=t.charCodeAt(h++),o=i>>2,a=(3&i)<<4|n>>4,c=(15&n)<<2|s>>6,u=63&s,isNaN(n)?c=u=64:isNaN(s)&&(u=64),e=e+this._keyStr.charAt(o)+this._keyStr.charAt(a)+this._keyStr.charAt(c)+this._keyStr.charAt(u);return e},decode:function(t){var e="",i=void 0,n=void 0,s=void 0,o=void 0,a=void 0,c=void 0,u=void 0,h=0;for(t=t.replace(/[^A-Za-z0-9\+\/\=]/g,"");h<t.length;)o=this._keyStr.indexOf(t.charAt(h++)),a=this._keyStr.indexOf(t.charAt(h++)),c=this._keyStr.indexOf(t.charAt(h++)),u=this._keyStr.indexOf(t.charAt(h++)),i=o<<2|a>>4,n=(15&a)<<4|c>>2,s=(3&c)<<6|u,e+=String.fromCharCode(i),64!==c&&(e+=String.fromCharCode(n)),64!==u&&(e+=String.fromCharCode(s));return e=r._utf8Decode(e)},_utf8Encode:function(t){t=t.replace(/\r\n/g,"\n");for(var e="",r=0;r<t.length;r++){var i=t.charCodeAt(r);i<128?e+=String.fromCharCode(i):i>127&&i<2048?(e+=String.fromCharCode(i>>6|192),e+=String.fromCharCode(63&i|128)):(e+=String.fromCharCode(i>>12|224),e+=String.fromCharCode(i>>6&63|128),e+=String.fromCharCode(63&i|128))}return e},_utf8Decode:function(t){var e="",r=0,i=void 0,n=void 0,s=void 0;for(i=n=0;r<t.length;)i=t.charCodeAt(r),i<128?(e+=String.fromCharCode(i),r++):i>191&&i<224?(n=t.charCodeAt(r+1),e+=String.fromCharCode((31&i)<<6|63&n),r+=2):(n=t.charCodeAt(r+1),s=t.charCodeAt(r+2),e+=String.fromCharCode((15&i)<<12|(63&n)<<6|63&s),r+=3);return e}};t.exports=r},function(t,e,r){var i,n=function(){function t(t,e){if(!n[t]){n[t]={};for(var r=0;r<t.length;r++)n[t][t.charAt(r)]=r}return n[t][e]}var e=String.fromCharCode,r="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",i="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$",n={},s={compressToBase64:function(t){if(null==t)return"";var e=s._compress(t,6,function(t){return r.charAt(t)});switch(e.length%4){default:case 0:return e;case 1:return e+"===";case 2:return e+"==";case 3:return e+"="}},decompressFromBase64:function(e){return null==e?"":""==e?null:s._decompress(e.length,32,function(i){return t(r,e.charAt(i))})},compressToUTF16:function(t){return null==t?"":s._compress(t,15,function(t){return e(t+32)})+" "},decompressFromUTF16:function(t){return null==t?"":""==t?null:s._decompress(t.length,16384,function(e){return t.charCodeAt(e)-32})},compressToUint8Array:function(t){for(var e=s.compress(t),r=new Uint8Array(2*e.length),i=0,n=e.length;i<n;i++){var o=e.charCodeAt(i);r[2*i]=o>>>8,r[2*i+1]=o%256}return r},decompressFromUint8Array:function(t){if(null===t||void 0===t)return s.decompress(t);for(var r=new Array(t.length/2),i=0,n=r.length;i<n;i++)r[i]=256*t[2*i]+t[2*i+1];var o=[];return r.forEach(function(t){o.push(e(t))}),s.decompress(o.join(""))},compressToEncodedURIComponent:function(t){return null==t?"":s._compress(t,6,function(t){return i.charAt(t)})},decompressFromEncodedURIComponent:function(e){return null==e?"":""==e?null:(e=e.replace(/ /g,"+"),s._decompress(e.length,32,function(r){return t(i,e.charAt(r))}))},compress:function(t){return s._compress(t,16,function(t){return e(t)})},_compress:function(t,e,r){if(null==t)return"";var i,n,s,o={},a={},c="",u="",h="",f=2,l=3,p=2,d=[],y=0,v=0;for(s=0;s<t.length;s+=1)if(c=t.charAt(s),Object.prototype.hasOwnProperty.call(o,c)||(o[c]=l++,a[c]=!0),u=h+c,Object.prototype.hasOwnProperty.call(o,u))h=u;else{if(Object.prototype.hasOwnProperty.call(a,h)){if(h.charCodeAt(0)<256){for(i=0;i<p;i++)y<<=1,v==e-1?(v=0,d.push(r(y)),y=0):v++;for(n=h.charCodeAt(0),i=0;i<8;i++)y=y<<1|1&n,v==e-1?(v=0,d.push(r(y)),y=0):v++,n>>=1}else{for(n=1,i=0;i<p;i++)y=y<<1|n,v==e-1?(v=0,d.push(r(y)),y=0):v++,n=0;for(n=h.charCodeAt(0),i=0;i<16;i++)y=y<<1|1&n,v==e-1?(v=0,d.push(r(y)),y=0):v++,n>>=1}f--,0==f&&(f=Math.pow(2,p),p++),delete a[h]}else for(n=o[h],i=0;i<p;i++)y=y<<1|1&n,v==e-1?(v=0,d.push(r(y)),y=0):v++,n>>=1;f--,0==f&&(f=Math.pow(2,p),p++),o[u]=l++,h=String(c)}if(""!==h){if(Object.prototype.hasOwnProperty.call(a,h)){if(h.charCodeAt(0)<256){for(i=0;i<p;i++)y<<=1,v==e-1?(v=0,d.push(r(y)),y=0):v++;for(n=h.charCodeAt(0),i=0;i<8;i++)y=y<<1|1&n,v==e-1?(v=0,d.push(r(y)),y=0):v++,n>>=1}else{for(n=1,i=0;i<p;i++)y=y<<1|n,v==e-1?(v=0,d.push(r(y)),y=0):v++,n=0;for(n=h.charCodeAt(0),i=0;i<16;i++)y=y<<1|1&n,v==e-1?(v=0,d.push(r(y)),y=0):v++,n>>=1}f--,0==f&&(f=Math.pow(2,p),p++),delete a[h]}else for(n=o[h],i=0;i<p;i++)y=y<<1|1&n,v==e-1?(v=0,d.push(r(y)),y=0):v++,n>>=1;f--,0==f&&(f=Math.pow(2,p),p++)}for(n=2,i=0;i<p;i++)y=y<<1|1&n,v==e-1?(v=0,d.push(r(y)),y=0):v++,n>>=1;for(;;){if(y<<=1,v==e-1){d.push(r(y));break}v++}return d.join("")},decompress:function(t){return null==t?"":""==t?null:s._decompress(t.length,32768,function(e){return t.charCodeAt(e)})},_decompress:function(t,r,i){var n,s,o,a,c,u,h,f,l=[],p=4,d=4,y=3,v="",_=[],g={val:i(0),position:r,index:1};for(s=0;s<3;s+=1)l[s]=s;for(a=0,u=Math.pow(2,2),h=1;h!=u;)c=g.val&g.position,g.position>>=1,0==g.position&&(g.position=r,g.val=i(g.index++)),a|=(c>0?1:0)*h,h<<=1;switch(n=a){case 0:for(a=0,u=Math.pow(2,8),h=1;h!=u;)c=g.val&g.position,g.position>>=1,0==g.position&&(g.position=r,g.val=i(g.index++)),a|=(c>0?1:0)*h,h<<=1;f=e(a);break;case 1:for(a=0,u=Math.pow(2,16),h=1;h!=u;)c=g.val&g.position,g.position>>=1,0==g.position&&(g.position=r,g.val=i(g.index++)),a|=(c>0?1:0)*h,h<<=1;f=e(a);break;case 2:return""}for(l[3]=f,o=f,_.push(f);;){if(g.index>t)return"";for(a=0,u=Math.pow(2,y),h=1;h!=u;)c=g.val&g.position,g.position>>=1,0==g.position&&(g.position=r,g.val=i(g.index++)),a|=(c>0?1:0)*h,h<<=1;switch(f=a){case 0:for(a=0,u=Math.pow(2,8),h=1;h!=u;)c=g.val&g.position,g.position>>=1,0==g.position&&(g.position=r,g.val=i(g.index++)),a|=(c>0?1:0)*h,h<<=1;l[d++]=e(a),f=d-1,p--;break;case 1:for(a=0,u=Math.pow(2,16),h=1;h!=u;)c=g.val&g.position,g.position>>=1,0==g.position&&(g.position=r,g.val=i(g.index++)),a|=(c>0?1:0)*h,h<<=1;l[d++]=e(a),f=d-1,p--;break;case 2:return _.join("")}if(0==p&&(p=Math.pow(2,y),y++),l[f])v=l[f];else{if(f!==d)return null;v=o+o.charAt(0)}_.push(v),l[d++]=o+v.charAt(0),p--,o=v,0==p&&(p=Math.pow(2,y),y++)}}};return s}();i=function(){return n}.call(e,r,e,t),!(void 0!==i&&(t.exports=i))},function(t,e,r){!function(i,n,s){t.exports=e=n(r(5),r(12),r(13),r(14),r(15))}(this,function(t){return function(){var e=t,r=e.lib,i=r.BlockCipher,n=e.algo,s=[],o=[],a=[],c=[],u=[],h=[],f=[],l=[],p=[],d=[];!function(){for(var t=[],e=0;e<256;e++)e<128?t[e]=e<<1:t[e]=e<<1^283;for(var r=0,i=0,e=0;e<256;e++){var n=i^i<<1^i<<2^i<<3^i<<4;n=n>>>8^255&n^99,s[r]=n,o[n]=r;var y=t[r],v=t[y],_=t[v],g=257*t[n]^16843008*n;a[r]=g<<24|g>>>8,c[r]=g<<16|g>>>16,u[r]=g<<8|g>>>24,h[r]=g;var g=16843009*_^65537*v^257*y^16843008*r;f[n]=g<<24|g>>>8,l[n]=g<<16|g>>>16,p[n]=g<<8|g>>>24,d[n]=g,r?(r=y^t[t[t[_^y]]],i^=t[t[i]]):r=i=1}}();var y=[0,1,2,4,8,16,32,64,128,27,54],v=n.AES=i.extend({_doReset:function(){for(var t=this._key,e=t.words,r=t.sigBytes/4,i=this._nRounds=r+6,n=4*(i+1),o=this._keySchedule=[],a=0;a<n;a++)if(a<r)o[a]=e[a];else{var c=o[a-1];a%r?r>6&&a%r==4&&(c=s[c>>>24]<<24|s[c>>>16&255]<<16|s[c>>>8&255]<<8|s[255&c]):(c=c<<8|c>>>24,c=s[c>>>24]<<24|s[c>>>16&255]<<16|s[c>>>8&255]<<8|s[255&c],c^=y[a/r|0]<<24),o[a]=o[a-r]^c}for(var u=this._invKeySchedule=[],h=0;h<n;h++){var a=n-h;if(h%4)var c=o[a];else var c=o[a-4];h<4||a<=4?u[h]=c:u[h]=f[s[c>>>24]]^l[s[c>>>16&255]]^p[s[c>>>8&255]]^d[s[255&c]]}},encryptBlock:function(t,e){this._doCryptBlock(t,e,this._keySchedule,a,c,u,h,s)},decryptBlock:function(t,e){var r=t[e+1];t[e+1]=t[e+3],t[e+3]=r,this._doCryptBlock(t,e,this._invKeySchedule,f,l,p,d,o);var r=t[e+1];t[e+1]=t[e+3],t[e+3]=r},_doCryptBlock:function(t,e,r,i,n,s,o,a){for(var c=this._nRounds,u=t[e]^r[0],h=t[e+1]^r[1],f=t[e+2]^r[2],l=t[e+3]^r[3],p=4,d=1;d<c;d++){var y=i[u>>>24]^n[h>>>16&255]^s[f>>>8&255]^o[255&l]^r[p++],v=i[h>>>24]^n[f>>>16&255]^s[l>>>8&255]^o[255&u]^r[p++],_=i[f>>>24]^n[l>>>16&255]^s[u>>>8&255]^o[255&h]^r[p++],g=i[l>>>24]^n[u>>>16&255]^s[h>>>8&255]^o[255&f]^r[p++];u=y,h=v,f=_,l=g}var y=(a[u>>>24]<<24|a[h>>>16&255]<<16|a[f>>>8&255]<<8|a[255&l])^r[p++],v=(a[h>>>24]<<24|a[f>>>16&255]<<16|a[l>>>8&255]<<8|a[255&u])^r[p++],_=(a[f>>>24]<<24|a[l>>>16&255]<<16|a[u>>>8&255]<<8|a[255&h])^r[p++],g=(a[l>>>24]<<24|a[u>>>16&255]<<16|a[h>>>8&255]<<8|a[255&f])^r[p++];t[e]=y,t[e+1]=v,t[e+2]=_,t[e+3]=g},keySize:8});e.AES=i._createHelper(v)}(),t.AES})},function(t,e,r){!function(i,n){t.exports=e=n(r(5))}(this,function(t){return function(){var e=t,r=e.lib,i=r.WordArray,n=e.enc;n.Base64={stringify:function(t){var e=t.words,r=t.sigBytes,i=this._map;t.clamp();for(var n=[],s=0;s<r;s+=3)for(var o=e[s>>>2]>>>24-s%4*8&255,a=e[s+1>>>2]>>>24-(s+1)%4*8&255,c=e[s+2>>>2]>>>24-(s+2)%4*8&255,u=o<<16|a<<8|c,h=0;h<4&&s+.75*h<r;h++)n.push(i.charAt(u>>>6*(3-h)&63));var f=i.charAt(64);if(f)for(;n.length%4;)n.push(f);return n.join("")},parse:function(t){var e=t.length,r=this._map,n=r.charAt(64);if(n){var s=t.indexOf(n);s!=-1&&(e=s)}for(var o=[],a=0,c=0;c<e;c++)if(c%4){var u=r.indexOf(t.charAt(c-1))<<c%4*2,h=r.indexOf(t.charAt(c))>>>6-c%4*2,f=u|h;o[a>>>2]|=f<<24-a%4*8,a++}return i.create(o,a)},_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="}}(),t.enc.Base64})},function(t,e,r){!function(i,n){t.exports=e=n(r(5))}(this,function(t){return function(e){function r(t,e,r,i,n,s,o){var a=t+(e&r|~e&i)+n+o;return(a<<s|a>>>32-s)+e}function i(t,e,r,i,n,s,o){var a=t+(e&i|r&~i)+n+o;return(a<<s|a>>>32-s)+e}function n(t,e,r,i,n,s,o){var a=t+(e^r^i)+n+o;return(a<<s|a>>>32-s)+e}function s(t,e,r,i,n,s,o){var a=t+(r^(e|~i))+n+o;return(a<<s|a>>>32-s)+e}var o=t,a=o.lib,c=a.WordArray,u=a.Hasher,h=o.algo,f=[];!function(){for(var t=0;t<64;t++)f[t]=4294967296*e.abs(e.sin(t+1))|0}();var l=h.MD5=u.extend({_doReset:function(){this._hash=new c.init([1732584193,4023233417,2562383102,271733878])},_doProcessBlock:function(t,e){for(var o=0;o<16;o++){var a=e+o,c=t[a];t[a]=16711935&(c<<8|c>>>24)|4278255360&(c<<24|c>>>8)}var u=this._hash.words,h=t[e+0],l=t[e+1],p=t[e+2],d=t[e+3],y=t[e+4],v=t[e+5],_=t[e+6],g=t[e+7],S=t[e+8],m=t[e+9],k=t[e+10],B=t[e+11],E=t[e+12],C=t[e+13],x=t[e+14],A=t[e+15],w=u[0],b=u[1],D=u[2],T=u[3];w=r(w,b,D,T,h,7,f[0]),T=r(T,w,b,D,l,12,f[1]),D=r(D,T,w,b,p,17,f[2]),b=r(b,D,T,w,d,22,f[3]),w=r(w,b,D,T,y,7,f[4]),T=r(T,w,b,D,v,12,f[5]),D=r(D,T,w,b,_,17,f[6]),b=r(b,D,T,w,g,22,f[7]),w=r(w,b,D,T,S,7,f[8]),T=r(T,w,b,D,m,12,f[9]),D=r(D,T,w,b,k,17,f[10]),b=r(b,D,T,w,B,22,f[11]),w=r(w,b,D,T,E,7,f[12]),T=r(T,w,b,D,C,12,f[13]),D=r(D,T,w,b,x,17,f[14]),b=r(b,D,T,w,A,22,f[15]),w=i(w,b,D,T,l,5,f[16]),T=i(T,w,b,D,_,9,f[17]),D=i(D,T,w,b,B,14,f[18]),b=i(b,D,T,w,h,20,f[19]),w=i(w,b,D,T,v,5,f[20]),T=i(T,w,b,D,k,9,f[21]),D=i(D,T,w,b,A,14,f[22]),b=i(b,D,T,w,y,20,f[23]),w=i(w,b,D,T,m,5,f[24]),T=i(T,w,b,D,x,9,f[25]),D=i(D,T,w,b,d,14,f[26]),b=i(b,D,T,w,S,20,f[27]),w=i(w,b,D,T,C,5,f[28]),T=i(T,w,b,D,p,9,f[29]),D=i(D,T,w,b,g,14,f[30]),b=i(b,D,T,w,E,20,f[31]),w=n(w,b,D,T,v,4,f[32]),T=n(T,w,b,D,S,11,f[33]),D=n(D,T,w,b,B,16,f[34]),b=n(b,D,T,w,x,23,f[35]),w=n(w,b,D,T,l,4,f[36]),T=n(T,w,b,D,y,11,f[37]),D=n(D,T,w,b,g,16,f[38]),b=n(b,D,T,w,k,23,f[39]),w=n(w,b,D,T,C,4,f[40]),T=n(T,w,b,D,h,11,f[41]),D=n(D,T,w,b,d,16,f[42]),b=n(b,D,T,w,_,23,f[43]),w=n(w,b,D,T,m,4,f[44]),T=n(T,w,b,D,E,11,f[45]),D=n(D,T,w,b,A,16,f[46]),b=n(b,D,T,w,p,23,f[47]),w=s(w,b,D,T,h,6,f[48]),T=s(T,w,b,D,g,10,f[49]),D=s(D,T,w,b,x,15,f[50]),b=s(b,D,T,w,v,21,f[51]),w=s(w,b,D,T,E,6,f[52]),T=s(T,w,b,D,d,10,f[53]),D=s(D,T,w,b,k,15,f[54]),b=s(b,D,T,w,l,21,f[55]),w=s(w,b,D,T,S,6,f[56]),T=s(T,w,b,D,A,10,f[57]),D=s(D,T,w,b,_,15,f[58]),b=s(b,D,T,w,C,21,f[59]),w=s(w,b,D,T,y,6,f[60]),T=s(T,w,b,D,B,10,f[61]),D=s(D,T,w,b,p,15,f[62]),b=s(b,D,T,w,m,21,f[63]),u[0]=u[0]+w|0,u[1]=u[1]+b|0,u[2]=u[2]+D|0,u[3]=u[3]+T|0},_doFinalize:function(){var t=this._data,r=t.words,i=8*this._nDataBytes,n=8*t.sigBytes;r[n>>>5]|=128<<24-n%32;var s=e.floor(i/4294967296),o=i;r[(n+64>>>9<<4)+15]=16711935&(s<<8|s>>>24)|4278255360&(s<<24|s>>>8),r[(n+64>>>9<<4)+14]=16711935&(o<<8|o>>>24)|4278255360&(o<<24|o>>>8),t.sigBytes=4*(r.length+1),this._process();for(var a=this._hash,c=a.words,u=0;u<4;u++){var h=c[u];c[u]=16711935&(h<<8|h>>>24)|4278255360&(h<<24|h>>>8)}return a},clone:function(){var t=u.clone.call(this);return t._hash=this._hash.clone(),t}});o.MD5=u._createHelper(l),o.HmacMD5=u._createHmacHelper(l)}(Math),t.MD5})},function(t,e,r){!function(i,n,s){t.exports=e=n(r(5),r(6),r(7))}(this,function(t){return function(){var e=t,r=e.lib,i=r.Base,n=r.WordArray,s=e.algo,o=s.MD5,a=s.EvpKDF=i.extend({cfg:i.extend({keySize:4,hasher:o,iterations:1}),init:function(t){this.cfg=this.cfg.extend(t)},compute:function(t,e){for(var r=this.cfg,i=r.hasher.create(),s=n.create(),o=s.words,a=r.keySize,c=r.iterations;o.length<a;){u&&i.update(u);var u=i.update(t).finalize(e);i.reset();for(var h=1;h<c;h++)u=i.finalize(u),i.reset();s.concat(u)}return s.sigBytes=4*a,s}});e.EvpKDF=function(t,e,r){return a.create(r).compute(t,e)}}(),t.EvpKDF})},function(t,e,r){!function(i,n){t.exports=e=n(r(5))}(this,function(t){t.lib.Cipher||function(e){var r=t,i=r.lib,n=i.Base,s=i.WordArray,o=i.BufferedBlockAlgorithm,a=r.enc,c=(a.Utf8,a.Base64),u=r.algo,h=u.EvpKDF,f=i.Cipher=o.extend({cfg:n.extend(),createEncryptor:function(t,e){return this.create(this._ENC_XFORM_MODE,t,e)},createDecryptor:function(t,e){return this.create(this._DEC_XFORM_MODE,t,e)},init:function(t,e,r){this.cfg=this.cfg.extend(r),this._xformMode=t,this._key=e,this.reset()},reset:function(){o.reset.call(this),this._doReset()},process:function(t){return this._append(t),this._process()},finalize:function(t){t&&this._append(t);var e=this._doFinalize();return e},keySize:4,ivSize:4,_ENC_XFORM_MODE:1,_DEC_XFORM_MODE:2,_createHelper:function(){function t(t){return"string"==typeof t?E:m}return function(e){return{encrypt:function(r,i,n){return t(i).encrypt(e,r,i,n)},decrypt:function(r,i,n){return t(i).decrypt(e,r,i,n)}}}}()}),l=(i.StreamCipher=f.extend({_doFinalize:function(){var t=this._process(!0);return t},blockSize:1}),r.mode={}),p=i.BlockCipherMode=n.extend({createEncryptor:function(t,e){return this.Encryptor.create(t,e)},createDecryptor:function(t,e){return this.Decryptor.create(t,e)},init:function(t,e){this._cipher=t,this._iv=e}}),d=l.CBC=function(){function t(t,r,i){var n=this._iv;if(n){var s=n;this._iv=e}else var s=this._prevBlock;for(var o=0;o<i;o++)t[r+o]^=s[o]}var r=p.extend();return r.Encryptor=r.extend({processBlock:function(e,r){var i=this._cipher,n=i.blockSize;t.call(this,e,r,n),i.encryptBlock(e,r),this._prevBlock=e.slice(r,r+n)}}),r.Decryptor=r.extend({processBlock:function(e,r){var i=this._cipher,n=i.blockSize,s=e.slice(r,r+n);i.decryptBlock(e,r),t.call(this,e,r,n),this._prevBlock=s}}),r}(),y=r.pad={},v=y.Pkcs7={pad:function(t,e){for(var r=4*e,i=r-t.sigBytes%r,n=i<<24|i<<16|i<<8|i,o=[],a=0;a<i;a+=4)o.push(n);var c=s.create(o,i);t.concat(c)},unpad:function(t){var e=255&t.words[t.sigBytes-1>>>2];t.sigBytes-=e}},_=(i.BlockCipher=f.extend({cfg:f.cfg.extend({mode:d,padding:v}),reset:function(){f.reset.call(this);var t=this.cfg,e=t.iv,r=t.mode;if(this._xformMode==this._ENC_XFORM_MODE)var i=r.createEncryptor;else{var i=r.createDecryptor;this._minBufferSize=1}this._mode=i.call(r,this,e&&e.words)},_doProcessBlock:function(t,e){this._mode.processBlock(t,e)},_doFinalize:function(){var t=this.cfg.padding;if(this._xformMode==this._ENC_XFORM_MODE){t.pad(this._data,this.blockSize);var e=this._process(!0)}else{var e=this._process(!0);t.unpad(e)}return e},blockSize:4}),i.CipherParams=n.extend({init:function(t){this.mixIn(t)},toString:function(t){return(t||this.formatter).stringify(this)}})),g=r.format={},S=g.OpenSSL={stringify:function(t){var e=t.ciphertext,r=t.salt;if(r)var i=s.create([1398893684,1701076831]).concat(r).concat(e);else var i=e;return i.toString(c)},parse:function(t){var e=c.parse(t),r=e.words;if(1398893684==r[0]&&1701076831==r[1]){var i=s.create(r.slice(2,4));r.splice(0,4),e.sigBytes-=16}return _.create({ciphertext:e,salt:i})}},m=i.SerializableCipher=n.extend({cfg:n.extend({format:S}),encrypt:function(t,e,r,i){i=this.cfg.extend(i);var n=t.createEncryptor(r,i),s=n.finalize(e),o=n.cfg;return _.create({ciphertext:s,key:r,iv:o.iv,algorithm:t,mode:o.mode,padding:o.padding,blockSize:t.blockSize,formatter:i.format})},decrypt:function(t,e,r,i){i=this.cfg.extend(i),e=this._parse(e,i.format);var n=t.createDecryptor(r,i).finalize(e.ciphertext);return n},_parse:function(t,e){return"string"==typeof t?e.parse(t,this):t}}),k=r.kdf={},B=k.OpenSSL={execute:function(t,e,r,i){i||(i=s.random(8));var n=h.create({keySize:e+r}).compute(t,i),o=s.create(n.words.slice(e),4*r);return n.sigBytes=4*e,_.create({key:n,iv:o,salt:i})}},E=i.PasswordBasedCipher=m.extend({cfg:m.cfg.extend({kdf:B}),encrypt:function(t,e,r,i){i=this.cfg.extend(i);var n=i.kdf.execute(r,t.keySize,t.ivSize);i.iv=n.iv;var s=m.encrypt.call(this,t,e,n.key,i);return s.mixIn(n),s},decrypt:function(t,e,r,i){i=this.cfg.extend(i),e=this._parse(e,i.format);var n=i.kdf.execute(r,t.keySize,t.ivSize,e.salt);i.iv=n.iv;var s=m.decrypt.call(this,t,e,n.key,i);return s}})}()})},function(t,e,r){!function(i,n,s){t.exports=e=n(r(5),r(12),r(13),r(14),r(15))}(this,function(t){return function(){function e(t,e){var r=(this._lBlock>>>t^this._rBlock)&e;this._rBlock^=r,this._lBlock^=r<<t}function r(t,e){var r=(this._rBlock>>>t^this._lBlock)&e;this._lBlock^=r,this._rBlock^=r<<t}var i=t,n=i.lib,s=n.WordArray,o=n.BlockCipher,a=i.algo,c=[57,49,41,33,25,17,9,1,58,50,42,34,26,18,10,2,59,51,43,35,27,19,11,3,60,52,44,36,63,55,47,39,31,23,15,7,62,54,46,38,30,22,14,6,61,53,45,37,29,21,13,5,28,20,12,4],u=[14,17,11,24,1,5,3,28,15,6,21,10,23,19,12,4,26,8,16,7,27,20,13,2,41,52,31,37,47,55,30,40,51,45,33,48,44,49,39,56,34,53,46,42,50,36,29,32],h=[1,2,4,6,8,10,12,14,15,17,19,21,23,25,27,28],f=[{0:8421888,268435456:32768,536870912:8421378,805306368:2,1073741824:512,1342177280:8421890,1610612736:8389122,1879048192:8388608,2147483648:514,2415919104:8389120,2684354560:33280,2952790016:8421376,3221225472:32770,3489660928:8388610,3758096384:0,4026531840:33282,134217728:0,402653184:8421890,671088640:33282,939524096:32768,1207959552:8421888,1476395008:512,1744830464:8421378,2013265920:2,2281701376:8389120,2550136832:33280,2818572288:8421376,3087007744:8389122,3355443200:8388610,3623878656:32770,3892314112:514,4160749568:8388608,1:32768,268435457:2,536870913:8421888,805306369:8388608,1073741825:8421378,1342177281:33280,1610612737:512,1879048193:8389122,2147483649:8421890,2415919105:8421376,2684354561:8388610,2952790017:33282,3221225473:514,3489660929:8389120,3758096385:32770,4026531841:0,134217729:8421890,402653185:8421376,671088641:8388608,939524097:512,1207959553:32768,1476395009:8388610,1744830465:2,2013265921:33282,2281701377:32770,2550136833:8389122,2818572289:514,3087007745:8421888,3355443201:8389120,3623878657:0,3892314113:33280,4160749569:8421378},{0:1074282512,16777216:16384,33554432:524288,50331648:1074266128,67108864:1073741840,83886080:1074282496,100663296:1073758208,117440512:16,134217728:540672,150994944:1073758224,167772160:1073741824,184549376:540688,201326592:524304,218103808:0,234881024:16400,251658240:1074266112,8388608:1073758208,25165824:540688,41943040:16,58720256:1073758224,75497472:1074282512,92274688:1073741824,109051904:524288,125829120:1074266128,142606336:524304,159383552:0,176160768:16384,192937984:1074266112,209715200:1073741840,226492416:540672,243269632:1074282496,260046848:16400,268435456:0,285212672:1074266128,301989888:1073758224,318767104:1074282496,335544320:1074266112,352321536:16,369098752:540688,385875968:16384,402653184:16400,419430400:524288,436207616:524304,452984832:1073741840,469762048:540672,486539264:1073758208,503316480:1073741824,520093696:1074282512,276824064:540688,293601280:524288,310378496:1074266112,327155712:16384,343932928:1073758208,360710144:1074282512,377487360:16,394264576:1073741824,411041792:1074282496,427819008:1073741840,444596224:1073758224,461373440:524304,478150656:0,494927872:16400,511705088:1074266128,528482304:540672},{0:260,1048576:0,2097152:67109120,3145728:65796,4194304:65540,5242880:67108868,6291456:67174660,7340032:67174400,8388608:67108864,9437184:67174656,10485760:65792,11534336:67174404,12582912:67109124,13631488:65536,14680064:4,15728640:256,524288:67174656,1572864:67174404,2621440:0,3670016:67109120,4718592:67108868,5767168:65536,6815744:65540,7864320:260,8912896:4,9961472:256,11010048:67174400,12058624:65796,13107200:65792,14155776:67109124,15204352:67174660,16252928:67108864,16777216:67174656,17825792:65540,18874368:65536,19922944:67109120,20971520:256,22020096:67174660,23068672:67108868,24117248:0,25165824:67109124,26214400:67108864,27262976:4,28311552:65792,29360128:67174400,30408704:260,31457280:65796,32505856:67174404,17301504:67108864,18350080:260,19398656:67174656,20447232:0,21495808:65540,22544384:67109120,23592960:256,24641536:67174404,25690112:65536,26738688:67174660,27787264:65796,28835840:67108868,29884416:67109124,30932992:67174400,31981568:4,33030144:65792},{0:2151682048,65536:2147487808,131072:4198464,196608:2151677952,262144:0,327680:4198400,393216:2147483712,458752:4194368,524288:2147483648,589824:4194304,655360:64,720896:2147487744,786432:2151678016,851968:4160,917504:4096,983040:2151682112,32768:2147487808,98304:64,163840:2151678016,229376:2147487744,294912:4198400,360448:2151682112,425984:0,491520:2151677952,557056:4096,622592:2151682048,688128:4194304,753664:4160,819200:2147483648,884736:4194368,950272:4198464,1015808:2147483712,1048576:4194368,1114112:4198400,1179648:2147483712,1245184:0,1310720:4160,1376256:2151678016,1441792:2151682048,1507328:2147487808,1572864:2151682112,1638400:2147483648,1703936:2151677952,1769472:4198464,1835008:2147487744,1900544:4194304,1966080:64,2031616:4096,1081344:2151677952,1146880:2151682112,1212416:0,1277952:4198400,1343488:4194368,1409024:2147483648,1474560:2147487808,1540096:64,1605632:2147483712,1671168:4096,1736704:2147487744,1802240:2151678016,1867776:4160,1933312:2151682048,1998848:4194304,2064384:4198464},{0:128,4096:17039360,8192:262144,12288:536870912,16384:537133184,20480:16777344,24576:553648256,28672:262272,32768:16777216,36864:537133056,40960:536871040,45056:553910400,49152:553910272,53248:0,57344:17039488,61440:553648128,2048:17039488,6144:553648256,10240:128,14336:17039360,18432:262144,22528:537133184,26624:553910272,30720:536870912,34816:537133056,38912:0,43008:553910400,47104:16777344,51200:536871040,55296:553648128,59392:16777216,63488:262272,65536:262144,69632:128,73728:536870912,77824:553648256,81920:16777344,86016:553910272,90112:537133184,94208:16777216,98304:553910400,102400:553648128,106496:17039360,110592:537133056,114688:262272,118784:536871040,122880:0,126976:17039488,67584:553648256,71680:16777216,75776:17039360,79872:537133184,83968:536870912,88064:17039488,92160:128,96256:553910272,100352:262272,104448:553910400,108544:0,112640:553648128,116736:16777344,120832:262144,124928:537133056,129024:536871040},{0:268435464,256:8192,512:270532608,768:270540808,1024:268443648,1280:2097152,1536:2097160,1792:268435456,2048:0,2304:268443656,2560:2105344,2816:8,3072:270532616,3328:2105352,3584:8200,3840:270540800,128:270532608,384:270540808,640:8,896:2097152,1152:2105352,1408:268435464,1664:268443648,1920:8200,2176:2097160,2432:8192,2688:268443656,2944:270532616,3200:0,3456:270540800,3712:2105344,3968:268435456,4096:268443648,4352:270532616,4608:270540808,4864:8200,5120:2097152,5376:268435456,5632:268435464,5888:2105344,6144:2105352,6400:0,6656:8,6912:270532608,7168:8192,7424:268443656,7680:270540800,7936:2097160,4224:8,4480:2105344,4736:2097152,4992:268435464,5248:268443648,5504:8200,5760:270540808,6016:270532608,6272:270540800,6528:270532616,6784:8192,7040:2105352,7296:2097160,7552:0,7808:268435456,8064:268443656},{0:1048576,16:33555457,32:1024,48:1049601,64:34604033,80:0,96:1,112:34603009,128:33555456,144:1048577,160:33554433,176:34604032,192:34603008,208:1025,224:1049600,240:33554432,8:34603009,24:0,40:33555457,56:34604032,72:1048576,88:33554433,104:33554432,120:1025,136:1049601,152:33555456,168:34603008,184:1048577,200:1024,216:34604033,232:1,248:1049600,256:33554432,272:1048576,288:33555457,304:34603009,320:1048577,336:33555456,352:34604032,368:1049601,384:1025,400:34604033,416:1049600,432:1,448:0,464:34603008,480:33554433,496:1024,264:1049600,280:33555457,296:34603009,312:1,328:33554432,344:1048576,360:1025,376:34604032,392:33554433,408:34603008,424:0,440:34604033,456:1049601,472:1024,488:33555456,504:1048577},{0:134219808,1:131072,2:134217728,3:32,4:131104,5:134350880,6:134350848,7:2048,8:134348800,9:134219776,10:133120,11:134348832,12:2080,13:0,14:134217760,15:133152,2147483648:2048,2147483649:134350880,2147483650:134219808,2147483651:134217728,2147483652:134348800,2147483653:133120,2147483654:133152,2147483655:32,2147483656:134217760,2147483657:2080,2147483658:131104,2147483659:134350848,2147483660:0,2147483661:134348832,2147483662:134219776,2147483663:131072,16:133152,17:134350848,18:32,19:2048,20:134219776,21:134217760,22:134348832,23:131072,24:0,25:131104,26:134348800,27:134219808,28:134350880,29:133120,30:2080,31:134217728,2147483664:131072,2147483665:2048,2147483666:134348832,2147483667:133152,2147483668:32,2147483669:134348800,2147483670:134217728,2147483671:134219808,2147483672:134350880,2147483673:134217760,2147483674:134219776,2147483675:0,2147483676:133120,2147483677:2080,2147483678:131104,2147483679:134350848}],l=[4160749569,528482304,33030144,2064384,129024,8064,504,2147483679],p=a.DES=o.extend({_doReset:function(){for(var t=this._key,e=t.words,r=[],i=0;i<56;i++){var n=c[i]-1;r[i]=e[n>>>5]>>>31-n%32&1}for(var s=this._subKeys=[],o=0;o<16;o++){for(var a=s[o]=[],f=h[o],i=0;i<24;i++)a[i/6|0]|=r[(u[i]-1+f)%28]<<31-i%6,a[4+(i/6|0)]|=r[28+(u[i+24]-1+f)%28]<<31-i%6;a[0]=a[0]<<1|a[0]>>>31;for(var i=1;i<7;i++)a[i]=a[i]>>>4*(i-1)+3;a[7]=a[7]<<5|a[7]>>>27}for(var l=this._invSubKeys=[],i=0;i<16;i++)l[i]=s[15-i]},encryptBlock:function(t,e){this._doCryptBlock(t,e,this._subKeys)},decryptBlock:function(t,e){this._doCryptBlock(t,e,this._invSubKeys)},_doCryptBlock:function(t,i,n){this._lBlock=t[i],this._rBlock=t[i+1],e.call(this,4,252645135),e.call(this,16,65535),r.call(this,2,858993459),r.call(this,8,16711935),e.call(this,1,1431655765);for(var s=0;s<16;s++){for(var o=n[s],a=this._lBlock,c=this._rBlock,u=0,h=0;h<8;h++)u|=f[h][((c^o[h])&l[h])>>>0];this._lBlock=c,this._rBlock=a^u}var p=this._lBlock;this._lBlock=this._rBlock,this._rBlock=p,e.call(this,1,1431655765),r.call(this,8,16711935),r.call(this,2,858993459),e.call(this,16,65535),e.call(this,4,252645135),t[i]=this._lBlock,t[i+1]=this._rBlock},keySize:2,ivSize:2,blockSize:2});i.DES=o._createHelper(p);var d=a.TripleDES=o.extend({_doReset:function(){var t=this._key,e=t.words;this._des1=p.createEncryptor(s.create(e.slice(0,2))),this._des2=p.createEncryptor(s.create(e.slice(2,4))),this._des3=p.createEncryptor(s.create(e.slice(4,6)))},encryptBlock:function(t,e){this._des1.encryptBlock(t,e),this._des2.decryptBlock(t,e),this._des3.encryptBlock(t,e)},decryptBlock:function(t,e){this._des3.decryptBlock(t,e),this._des2.encryptBlock(t,e),this._des1.decryptBlock(t,e)},keySize:6,ivSize:2,blockSize:2});i.TripleDES=o._createHelper(d)}(),t.TripleDES})},function(t,e,r){!function(i,n,s){t.exports=e=n(r(5),r(12),r(13),r(14),r(15))}(this,function(t){return function(){function e(){for(var t=this._X,e=this._C,r=0;r<8;r++)a[r]=e[r];e[0]=e[0]+1295307597+this._b|0,e[1]=e[1]+3545052371+(e[0]>>>0<a[0]>>>0?1:0)|0,e[2]=e[2]+886263092+(e[1]>>>0<a[1]>>>0?1:0)|0,e[3]=e[3]+1295307597+(e[2]>>>0<a[2]>>>0?1:0)|0,e[4]=e[4]+3545052371+(e[3]>>>0<a[3]>>>0?1:0)|0,e[5]=e[5]+886263092+(e[4]>>>0<a[4]>>>0?1:0)|0,e[6]=e[6]+1295307597+(e[5]>>>0<a[5]>>>0?1:0)|0,e[7]=e[7]+3545052371+(e[6]>>>0<a[6]>>>0?1:0)|0,this._b=e[7]>>>0<a[7]>>>0?1:0;for(var r=0;r<8;r++){var i=t[r]+e[r],n=65535&i,s=i>>>16,o=((n*n>>>17)+n*s>>>15)+s*s,u=((4294901760&i)*i|0)+((65535&i)*i|0);c[r]=o^u}t[0]=c[0]+(c[7]<<16|c[7]>>>16)+(c[6]<<16|c[6]>>>16)|0,t[1]=c[1]+(c[0]<<8|c[0]>>>24)+c[7]|0,t[2]=c[2]+(c[1]<<16|c[1]>>>16)+(c[0]<<16|c[0]>>>16)|0,t[3]=c[3]+(c[2]<<8|c[2]>>>24)+c[1]|0,t[4]=c[4]+(c[3]<<16|c[3]>>>16)+(c[2]<<16|c[2]>>>16)|0,t[5]=c[5]+(c[4]<<8|c[4]>>>24)+c[3]|0,t[6]=c[6]+(c[5]<<16|c[5]>>>16)+(c[4]<<16|c[4]>>>16)|0,t[7]=c[7]+(c[6]<<8|c[6]>>>24)+c[5]|0}var r=t,i=r.lib,n=i.StreamCipher,s=r.algo,o=[],a=[],c=[],u=s.Rabbit=n.extend({_doReset:function(){for(var t=this._key.words,r=this.cfg.iv,i=0;i<4;i++)t[i]=16711935&(t[i]<<8|t[i]>>>24)|4278255360&(t[i]<<24|t[i]>>>8);var n=this._X=[t[0],t[3]<<16|t[2]>>>16,t[1],t[0]<<16|t[3]>>>16,t[2],t[1]<<16|t[0]>>>16,t[3],t[2]<<16|t[1]>>>16],s=this._C=[t[2]<<16|t[2]>>>16,4294901760&t[0]|65535&t[1],t[3]<<16|t[3]>>>16,4294901760&t[1]|65535&t[2],t[0]<<16|t[0]>>>16,4294901760&t[2]|65535&t[3],t[1]<<16|t[1]>>>16,4294901760&t[3]|65535&t[0]];this._b=0;for(var i=0;i<4;i++)e.call(this);for(var i=0;i<8;i++)s[i]^=n[i+4&7];if(r){var o=r.words,a=o[0],c=o[1],u=16711935&(a<<8|a>>>24)|4278255360&(a<<24|a>>>8),h=16711935&(c<<8|c>>>24)|4278255360&(c<<24|c>>>8),f=u>>>16|4294901760&h,l=h<<16|65535&u;s[0]^=u,s[1]^=f,s[2]^=h,s[3]^=l,s[4]^=u,s[5]^=f,s[6]^=h,s[7]^=l;for(var i=0;i<4;i++)e.call(this)}},_doProcessBlock:function(t,r){var i=this._X;e.call(this),o[0]=i[0]^i[5]>>>16^i[3]<<16,o[1]=i[2]^i[7]>>>16^i[5]<<16,o[2]=i[4]^i[1]>>>16^i[7]<<16,o[3]=i[6]^i[3]>>>16^i[1]<<16;for(var n=0;n<4;n++)o[n]=16711935&(o[n]<<8|o[n]>>>24)|4278255360&(o[n]<<24|o[n]>>>8),t[r+n]^=o[n]},blockSize:4,ivSize:2});r.Rabbit=n._createHelper(u)}(),t.Rabbit})},function(t,e,r){!function(i,n,s){t.exports=e=n(r(5),r(12),r(13),r(14),r(15))}(this,function(t){return function(){function e(){for(var t=this._S,e=this._i,r=this._j,i=0,n=0;n<4;n++){e=(e+1)%256,r=(r+t[e])%256;var s=t[e];t[e]=t[r],t[r]=s,i|=t[(t[e]+t[r])%256]<<24-8*n}return this._i=e,this._j=r,i}var r=t,i=r.lib,n=i.StreamCipher,s=r.algo,o=s.RC4=n.extend({_doReset:function(){for(var t=this._key,e=t.words,r=t.sigBytes,i=this._S=[],n=0;n<256;n++)i[n]=n;for(var n=0,s=0;n<256;n++){var o=n%r,a=e[o>>>2]>>>24-o%4*8&255;s=(s+i[n]+a)%256;var c=i[n];i[n]=i[s],i[s]=c}this._i=this._j=0},_doProcessBlock:function(t,r){t[r]^=e.call(this)},keySize:8,ivSize:0});r.RC4=n._createHelper(o);var a=s.RC4Drop=o.extend({cfg:o.cfg.extend({drop:192}),_doReset:function(){o._doReset.call(this);for(var t=this.cfg.drop;t>0;t--)e.call(this)}});r.RC4Drop=n._createHelper(a)}(),t.RC4})}])});

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

    let updates = {};
    let whereClause = updateMatch ? updateMatch[4] : undefined;

    // Support SET ? syntax: if params[0] is an object or array of objects, use it/them as updates
    let updateObjects = [];
    if (params.length && typeof params[0] === 'object') {
      if (Array.isArray(params[0])) {
        updateObjects = params[0].filter(obj => typeof obj === 'object' && !Array.isArray(obj));
      } else {
        updateObjects = [params[0]];
      }
    }
    else if (updateMatch && updateMatch[2] !== '?') {
      // Fallback to parsing SET clause as before
      const setPart = updateMatch[2];
      const parsedUpdates = Object.fromEntries(
        setPart.split(',').map(pair => {
          const [key, val] = pair.split('=').map(s => s.trim());
          // Handle functions in UPDATE SET clauses
          return [key, /\w+\s*\(/.test(val) ? val : parseValue(val)];
        })
      );
      updateObjects = [parsedUpdates];
    }

    let updatedCount = 0;
    if (updateObjects.length > 0) {
      for (const updates of updateObjects) {
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
