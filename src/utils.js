const now = (function() {
	if (typeof performance !== 'undefined' && performance.now)
		return performance.now.bind(performance);

  if (typeof process !== 'undefined' && process.hrtime) {
    return function() {
      var hrTime = process.hrtime();
      return (hrTime[0] * 1000) + (hrTime[1] / 1000000);
    };
  } else if (typeof preciseTime !== 'undefined') {
    return preciseTime;
  } else if (typeof Date.now === 'function')
    return Date.now.bind(Date);

  return function() {
    return (new Date()).getTime() / 1000.0;
  };
})();

function initAudit(node) {
  if (node && (!Object.isExtensible(node) || Object.isFrozen(node)))
    return;

  var timeCreated = now();

  Object.defineProperty(node, '_audit', {
    writable: true,
    enumerable: false,
    configurable: true,
    value: {
      'base':   { created: timeCreated, modified: timeCreated, updateCount: 0 },
      '_meta':  { created: timeCreated, modified: timeCreated, updateCount: 0 },
    },
  });
}

//This function is deliberately large and confusing in order to squeeze
//every ounce of speed out of it
function prop(cmd, _node, namespace) {
  var node = _node,
      GET = 0x01,
      SET = 0x02,
      REMOVE = 0x04,
      c,
      isMeta = false,
      argStartIndex,
      argStartIndexOne,
      context,
      op = ((c = cmd.charAt(0)) === 'g') ? GET : (c === 's') ? SET : REMOVE,
      finalPath = [];

  switch(cmd) {
    case 'getMetaNS':
    case 'setMetaNS':
    case 'removeMetaNS':
      argStartIndex = 3;
      argStartIndexOne = 4;

      if (!node.hasOwnProperty('_meta') || !node._meta.hasOwnProperty(namespace))
        context = initMeta(node, namespace);
      else
        context = node._meta[namespace];

      finalPath = ['_meta', namespace];

      break;
    case 'getMeta':
    case 'setMeta':
    case 'removeMeta':
      isMeta = true;
      argStartIndex = 2;
      argStartIndexOne = 3;

      if (!node.hasOwnProperty('_meta'))
        context = initMeta(node);
      else
        context = node._meta;

      finalPath = ['_meta'];

      break;
    default:
      argStartIndex = 2;
      argStartIndexOne = 3;
      context = node;
      break;
  }

  //Do we need to return the default value?
  if (!context || !(context instanceof Object) || (
      typeof context === 'string' || typeof context === 'number' || typeof context === 'boolean' ||
      context instanceof String || context instanceof Number || context instanceof Boolean))
  {
    if (op & (GET | REMOVE))
      return arguments[argStartIndexOne];

    throw new Error('Attempt to set on and empty context');
  }

  var prop;
  var fullPath = '' + arguments[argStartIndex];
  var nextIsArray;
  var parts = [];

  //No path
  if (!fullPath) {
    if (op & SET)
      return '';

    if (op & REMOVE)
      return;

    return arguments[argStartIndexOne];
  }

  //Are there any parts to handle?
  if (fullPath.indexOf('.') > -1 || fullPath.indexOf('[') > -1) {
    if (fullPath.indexOf('\\') > -1)
      //If we have character escapes, take the long and slow route
      parts = fullPath.replace(/([^\\])\[/g,'$1.[').replace(/([^\\])\./g,'$1..').replace(/\\([.\[])/g,'$1').split('..');
    else
      //Fast route
      parts = fullPath.replace(/\[/g,'.[').split('.');

    for (var i = 0, i2 = 1, il = parts.length; i < il; i++, i2++) {
      var part          = parts[i];
      var isLast        = (i2 >= il);
      var isArrayIndex  = (part.charAt(0) === '[');

      //Is this an array index
      if (isArrayIndex)
        part = part.substring(1, part.length - 1);

      if (context && !context.hasOwnProperty(part) && context.hasOwnProperty(Symbol.for(part)))
        part = Symbol.for(part);

      //Get prop
      prop = context[part];

      if (op & REMOVE && isLast) {
        //If this is the final part, and we are to remove the item...
        if (context && (!Object.isExtensible(context) || Object.isFrozen(context)))
          return prop;

        if (arguments[argStartIndexOne] === true)
          //ACTUALLY delete it if the user forces a delete
          delete context[part];
        else
          //Otherwise do it the performant way by setting the value to undefined
          context[part] = undefined;

        //Return whatever the value was
        return prop;
      } else if (op & SET) {
        //Are we setting the value?

        //If this is the last part, or the value isn't set,
        //or it is set but the path continues and it
        //needs to be overwritten
        if (isLast || (prop === undefined || prop === null || (!isLast && (!(prop instanceof Object) || prop instanceof Number || prop instanceof String || prop instanceof Boolean)))) {
          //If the next part is an array, make sure to create an array
          nextIsArray = (!isLast && parts[i2].charAt(0) === '[');

          //What is our new value?
          prop = (isLast) ? arguments[argStartIndexOne] : (nextIsArray) ? [] : {};

          //Update context accordingly
          if (context instanceof Array && !part) {
            isArrayIndex = true;
            if (context && Object.isExtensible(context) && !Object.isFrozen(context)) {
              part = '' + (context.push(prop) - 1);
              context = prop;
            }
          } else if (part) {
            if (context && Object.isExtensible(context) && !Object.isFrozen(context))
              context[part] = prop;
            context = prop;
          }
        } else {
          context = prop;
        }

        if (part) {
          if (typeof part === 'symbol') {
            var partStr = part.toString();
            part = partStr.substring(7, partStr.length - 1);
          }

          finalPath.push((isArrayIndex) ? ('[' + part + ']') : part);
        }
      } else {
        if (prop === undefined || prop === null || ((typeof prop === 'number' || prop instanceof Number) && (isNaN(prop) || !isFinite(prop))))
          return (argStartIndexOne >= arguments.length) ? prop : arguments[argStartIndexOne];
        context = prop;
      }
    }
  } else {
    if (context && !context.hasOwnProperty(fullPath) && context.hasOwnProperty(Symbol.for(fullPath)))
      fullPath = Symbol.for(fullPath);

    if (op & REMOVE) {
      if (context && (!Object.isExtensible(context) || Object.isFrozen(context)))
        return prop;

      prop = context[fullPath];

      if (arguments[argStartIndexOne] === true) {
        //ACTUALLY delete it if the user forces a delete
        delete context[fullPath];
      } else {
        //Otherwise do it the performant way by setting the value to undefined
        context[fullPath] = undefined;
      }

      //Return whatever the value was
      return prop;
    } else if (op & SET) {
      if (context && Object.isExtensible(context) && !Object.isFrozen(context))
        context[fullPath] = arguments[argStartIndexOne];

      return fullPath;
    }

    prop = context[fullPath];
  }

  if (op & GET) {
    //Do we need to return the default value?
    if (prop === undefined || prop === null || ((typeof prop === 'number' || prop instanceof Number) && (isNaN(prop) || !isFinite(prop))))
      return (argStartIndexOne >= arguments.length) ? prop : arguments[argStartIndexOne];
    return prop;
  }

  if (!node.hasOwnProperty('_audit'))
    initAudit(node);

  var lastUpdated = now();
  if (isMeta && node._audit) {
    var m = node._audit.meta;
    m.modified = lastUpdated;
    m.updateCount++;
  } else if (node._audit) {
    var b = node._audit.base;
    b.modified = lastUpdated;
    b.updateCount++;
  }

  return (op & SET) ? finalPath.join('.').replace(/\.\[/g, '[') : prop;
}

const globalScope = (typeof global !== 'undefined') ? global : (typeof window !== undefined) ? window : this;

function instanceOf(obj) {
  function testType(obj, _val) {
    function isDeferredType(obj) {
      if (obj instanceof Promise || (obj.constructor && object.constructor.name === 'Promise'))
        return true;

      // Quack quack...
      if (typeof obj.then === 'function' && typeof obj.catch === 'function')
        return true;

      return false;
    }

    var val     = _val,
        typeOf  = (typeof obj);

    if (val === globalScope.String)
      val = 'string';
    else if (val === globalScope.Number)
      val = 'number';
    else if (val === globalScope.Boolean)
      val = 'boolean';
    else if (val === globalScope.Function)
      val = 'function';
    else if (val === globalScope.Array)
      val = 'array';
    else if (val === globalScope.Object)
      val = 'object';
    else if (val === globalScope.Promise)
      val = 'promise';
    else if (val === globalScope.BigInt)
      val = 'bigint';
    else if (val === globalScope.Map)
      val = 'map';
    else if (val === globalScope.WeakMap)
      val = 'weakmap';
    else if (val === globalScope.Set)
      val = 'map';

    if (val === 'number' && (typeOf === 'number' || obj instanceof Number || (obj.constructor && obj.constructor.name === 'Number'))) {
      if (!isFinite(obj))
        return false;

      return true;
    }

    if (val !== 'object' && val === typeOf)
      return true;

    if (val === 'object') {
      if ((obj.constructor === Object.prototype.constructor || (obj.constructor && obj.constructor.name === 'Object')))
        return true;

      return false;
    }

    if (val === 'array' && (Array.isArray(obj) || obj instanceof Array || (obj.constructor && obj.constructor.name === 'Array')))
      return true;

    if ((val === 'promise' || val === 'deferred') && isDeferredType(obj))
      return true;

    if (val === 'string' && (obj instanceof globalScope.String || (obj.constructor && obj.constructor.name === 'String')))
      return true;

    if (val === 'boolean' && (obj instanceof globalScope.Boolean || (obj.constructor && obj.constructor.name === 'Boolean')))
      return true;

    if (val === 'map' && (obj instanceof globalScope.Map || (obj.constructor && obj.constructor.name === 'Map')))
      return true;

    if (val === 'weakmap' && (obj instanceof globalScope.WeakMap || (obj.constructor && obj.constructor.name === 'WeakMap')))
      return true;

    if (val === 'set' && (obj instanceof globalScope.Set || (obj.constructor && obj.constructor.name === 'Set')))
      return true;

    if (val === 'function' && typeOf === 'function')
      return true;

    if (typeof val === 'function' && obj instanceof val)
      return true;

    if (typeof val === 'string' && obj.constructor && obj.constructor.name === val)
      return true;

    return false;
  }

  if (obj == null)
    return false;

  for (var i = 1, len = arguments.length; i < len; i++) {
    if (testType(obj, arguments[i]) === true)
      return true;
  }

  return false;
}

function sizeOf(obj) {
  if (obj == null)
    return 0;

  if ((typeof obj.length === 'number' || obj.length instanceof Number) && isFinite(obj.length))
    return obj.length;

  if (obj.constructor === Object.prototype.constructor || (obj.constructor && obj.constructor.name === 'Object'))
    return (Object.keys(obj).length + Object.getOwnPropertySymbols(obj).length);

  if (typeof obj.size === 'number')
    return obj.size;

  return 0;
}

const EMPTY_STRING_RE = (/\S/);

function isEmpty(value) {
  if (value == null)
    return true;

  if (Object.is(value, Infinity))
    return false;

  if (Object.is(value, NaN))
    return true;

  if (instanceOf(value, 'string'))
    return !EMPTY_STRING_RE.test(value);
  else if (instanceOf(value, 'number') && isFinite(value))
    return false;
  else if (!instanceOf(value, 'boolean', 'bigint', 'function') && sizeOf(value) == 0)
    return true;

  return false;
}

function isNotEmpty(value) {
  return !isEmpty.call(this, value);
}

function firstValue(value, defaultValue) {
  if (!value || !value.length)
    return defaultValue;

  var fetchValue = value[0];
  return (fetchValue == null && arguments.length > 1) ? defaultValue : fetchValue;
}

function lastValue(value, defaultValue) {
  if (!value || !value.length)
    return defaultValue;

  var fetchValue = value[value.length - 1];
  return (fetchValue == null && arguments.length > 1) ? defaultValue : fetchValue;
}

function capitalize(_tempStr, allWords) {
  var tempStr = _tempStr;
  if (isEmpty(tempStr))
    return tempStr;

  return ('' + tempStr).replace((allWords) ? /(^|\s)(\S)/gi : /^(\s*)(\S)/i, function(m, s, x) {
    return s + (x.toLocaleUpperCase());
  });
}

function uncapitalize(_tempStr) {
  var tempStr = _tempStr;
  if (isEmpty(tempStr))
    return tempStr;

  return tempStr.replace(/^./, (m) => m.toLocaleLowerCase());
}

function camelCaseToSnakeCase(str) {
  if (!str)
    return str;

  var parts       = str.replace(/([A-Z])/g, '@@@$1@@@').split('@@@').filter(Boolean);
  var finalParts  = [];

  for (var i = 0, il = parts.length; i < il;) {
    var part        = parts[i];
    var partPlusOne = parts[i + 1];
    var lastPart    = lastValue(finalParts, '');

    if (part.match(/^[A-Z]/)) {
      if (partPlusOne && partPlusOne.match(/^[^A-Z]/)) {
        finalParts.push((part + partPlusOne));
        i += 2;
        continue;
      } else if (lastPart.match(/^[^A-Z]/)) {
        finalParts.push(part);
      } else {
        if (!finalParts.length)
          finalParts.push('');

        finalParts[finalParts.length - 1] = (lastPart + part);
      }
    } else {
      finalParts.push(part);
    }

    i++;
  }

  return finalParts.join('_').toLowerCase();
}

function snakeCaseToCamelCase(_str, capitalizeFirst) {
  var str = _str;
  if (!str)
    return str;

  str = str.replace(/_(.)/g, (m, p) => p.toLocaleUpperCase()).replace(/_+$/g, '');
  if (capitalizeFirst != null) {
    if (!capitalizeFirst)
      str = uncapitalize(str);
    else
      str = capitalize(str);
  }

  return str;
}

function createResolvable() {
  var status = 'pending';
  var resolve;
  var reject;

  var promise = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });

  promise.resolve = (result) => {
    status = 'resolved';
    return resolve(result);
  };

  promise.reject = (result) => {
    status = 'rejected';
    return reject(result);
  };

  promise.status = () => {
    return status;
  };

  return promise;
}

function splitBy(str, _patterns, simple) {
  var patterns = _patterns;
  if (!patterns)
    return [ str ];

  if (!(patterns instanceof Array))
    patterns = [ patterns ];

  var hasNamedPattern = false;

  const cloneRegExp = (regexp) => {
    // Clone regexp and ensure it has the global flag set
    var flags;
    regexp = regexp.toString().substring(1).replace(/\/(\w*)$/, (m, f) => {
      flags = (flags || '').replace(/g/gi, '');
      return '';
    });

    return new RegExp(regexp, flags + 'g');
  };

  const collectPatterns = (patterns) => {
    var finalPatterns = [];

    for (var i = 0, il = patterns.length; i < il; i++) {
      var pattern = patterns[i];
      if (!pattern)
        continue;

      var name      = null;
      var process   = null;
      var condition = null;

      if (pattern.constructor === Object.prototype.constructor && pattern.pattern) {
        if (pattern.name) {
          hasNamedPattern = true;
          name = ('' + pattern.name);
        } else {
          name = ('' + i);
        }

        condition = pattern.condition;
        process   = pattern.process;
        pattern   = pattern.pattern;
      }

      if (!name)
        name = ('' + i);

      if (pattern instanceof RegExp) {
        pattern = cloneRegExp(pattern);
      } else if (typeof pattern === 'string' || pattern instanceof String) {
        pattern = ('' + pattern);
      }

      if (!pattern)
        continue;

      finalPatterns.push({ name, pattern, index: i, process, condition });
    }

    return finalPatterns;
  };

  const matchPattern = (str, pattern, index) => {
    var match;
    if (pattern instanceof RegExp) {
      pattern.lastIndex = index;
      match = pattern.exec(str);
      if (!match)
        return;

      return { match: match[0], offset: pattern.lastIndex - match[0].length };
    } else {
      var offset = str.indexOf(pattern, index);
      if (offset < 0)
        return;

      return { match: str.substring(offset, offset + pattern.length), offset };
    }
  };

  const findNextMatch = (str, index) => {
    for (var i = 0, il = patterns.length; i < il; i++) {
      var thisPattern = patterns[i];
      var pattern     = thisPattern.pattern;
      var condition   = thisPattern.condition;
      var match       = matchPattern(str, pattern, index);

      if (typeof condition === 'function' && !condition({ parts: finalParts, pattern: thisPattern, chunk: match }))
        continue;

      if (match)
        return { match, pattern: thisPattern };
    }
  }

  patterns = collectPatterns(patterns);

  var finalParts = [];
  var lastOffset = 0;
  var result;
  var found;
  var match;
  var offset;
  var pattern;
  var part;

  while (result = findNextMatch(str, lastOffset)) {
    found     = result.match;
    offset    = found.offset;
    match     = found.match;
    pattern   = result.pattern;

    if (match.length) {
      if (lastOffset < offset) {
        part = str.substring(lastOffset, offset);
        finalParts.push({ source: str, part, processed: part, start: lastOffset, end: offset, name: '_chunk' });
      }

      var context = {
        source: str,
        part:   match,
        start:  lastOffset,
        end:    offset,
        name:   pattern.name,
      };

      finalParts.push(context);

      context.processed = (typeof pattern.process === 'function') ? pattern.process(match, context) : match;

      lastOffset = offset + match.length;
    } else {
      lastOffset++;
    }
  }

  if (lastOffset < str.length) {
    var part = str.substring(lastOffset);
    finalParts.push({ source: str, part, processed: part, start: lastOffset, end: str.length, name: '_tail' });
  }

  if (simple === true || !(_patterns instanceof Array))
    return finalParts.map((finalPart) => finalPart.part);

  if (hasNamedPattern) {
    finalParts = finalParts.reduce((obj, part) => {
      var name = part.name;

      if (obj.hasOwnProperty(name)) {
        if (!(obj[name] instanceof Array))
          obj[name] = [ obj[name], part.processed ];
        else
          obj[name].push(part.processed);
      } else {
        obj[name] = part.processed;
      }

      return obj;
    }, {});
  }

  return finalParts;
}

function regexpEscape(str) {
  if (!str)
    return str;
  return str.replace(/[-[\]{}()*+!<=:?./\\^$|#\s,]/g, '\\$&');
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms || 0);
  });
}

function iterate(obj, callback, context) {
  if (!obj)
    return context;

  let _stop = false;
  let stop  = () => _stop = true;
  let scope = { stop, context, collection: obj };

  if (Array.isArray(obj)) {
    scope.type = 'Array';

    for (let i = 0, il = obj.length; i < il; i++) {
      scope.value = obj[i];
      scope.index = scope.key = i;

      callback.call(this, scope);

      if (_stop)
        break;
    }
  } else if (typeof obj.entries === 'function') {
    if (obj instanceof Set || obj.constructor.name === 'Set') {
      scope.type = 'Set';

      let index = 0;
      for (let item of obj.values()) {
        scope.value = item;
        scope.key = item;
        scope.index = index++;
        scope.collection = obj;

        callback.call(this, scope);

        if (_stop)
          break;
      }
    } else {
      scope.type = obj.constructor.name;

      let index = 0;
      for (let [ key, value ] of obj.entries()) {
        scope.value = value;
        scope.key = key;
        scope.index = index++;
        scope.collection = obj;

        callback.call(this, scope);

        if (_stop)
          break;
      }
    }
  } else {
    if (instanceOf(obj, 'boolean', 'number', 'bigint', 'function'))
      return context;

    scope.type = (obj.constructor) ? obj.constructor.name : 'Object';

    let keys = Object.keys(obj);
    for (let i = 0, il = keys.length; i < il; i++) {
      let key   = keys[i];
      let value = obj[key];

      scope.value = value;
      scope.key = key;
      scope.index = i;

      callback.call(this, scope);

      if (_stop)
        break;
    }
  }

  return context;
}

const get           = prop.bind(this, 'get');
const set           = prop.bind(this, 'set');
const remove        = prop.bind(this, 'remove');
const getMeta       = prop.bind(this, 'getMeta');
const setMeta       = prop.bind(this, 'setMeta');
const removeMeta    = prop.bind(this, 'removeMeta');
const getMetaNS     = prop.bind(this, 'getMetaNS');
const setMetaNS     = prop.bind(this, 'setMetaNS');
const removeMetaNS  = prop.bind(this, 'removeMetaNS');

module.exports = {
  camelCaseToSnakeCase,
  capitalize,
  createResolvable,
  firstValue,
  instanceOf,
  isEmpty,
  isNotEmpty,
  lastValue,
  now,
  regexpEscape,
  sizeOf,
  sleep,
  snakeCaseToCamelCase,
  splitBy,
  uncapitalize,
  get,
  set,
  remove,
  getMeta,
  setMeta,
  removeMeta,
  getMetaNS,
  setMetaNS,
  removeMetaNS,
  iterate,
};
