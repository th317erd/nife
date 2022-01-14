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

  var prop,
      fullPath = '' + arguments[argStartIndex],
      nextIsArray,
      parts = [];

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
      var part = parts[i],
          isLast = (i2 >= il),
          isArrayIndex = (part.charAt(0) === '[');

      //Is this an array index
      if (isArrayIndex)
        part = part.substring(1, part.length - 1);

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

        if (part)
          finalPath.push((isArrayIndex) ? ('[' + part + ']') : part);
      } else {
        if (prop === undefined || prop === null || ((typeof prop === 'number' || prop instanceof Number) && (isNaN(prop) || !isFinite(prop))))
          return (argStartIndexOne >= arguments.length) ? prop : arguments[argStartIndexOne];
        context = prop;
      }
    }
  } else {
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

function instanceOf(obj) {
  function testType(obj, _val) {
    function isDeferredType(obj) {
      if (obj instanceof Promise)
        return true;

      if (typeof obj.then === 'function')
        return true;

      return false;
    }

    var val     = _val,
        typeOf  = (typeof obj);

    if (val === String)
      val = 'string';
    else if (val === Number)
      val = 'number';
    else if (val === Boolean)
      val = 'boolean';
    else if (val === Function)
      val = 'function';
    else if (val === Array)
      val = 'array';
    else if (val === Object)
      val = 'object';
    else if (val === Promise)
      val = 'promise';
    else if (val === BigInt)
      val = 'bigint';

    if (val === 'object' && obj.constructor === Object.prototype.constructor)
      return true;

    if ((val === 'promise' || val === 'deferred') && isDeferredType(obj))
      return true;

    if (val !== 'object' && val === typeOf)
      return true;

    if (val === 'number' && (typeof obj === 'number' || (obj instanceof Number)) && !isFinite(obj))
      return false;

    if (val === 'number' && obj instanceof Number)
      return true;

    if (val === 'string' && obj instanceof String)
      return true;

    if (val === 'boolean' && obj instanceof Boolean)
      return true;

    if (val === 'function' && typeOf === 'function')
      return true;

    if (val === 'array' && obj instanceof Array)
      return true;

    if (typeof val === 'function' && obj instanceof val)
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

  if (obj.constructor === Object.prototype.constructor)
    return Object.keys(obj).length;

  return 0;
}

function isEmpty() {
  for (var i = 0, len = arguments.length; i < len; i++) {
    var value = arguments[i];
    if (value == null)
      return true;

    if (value === Infinity)
      continue;

    if (instanceOf(value, 'string'))
      return !value.match(/\S/);
    else if (instanceOf(value, 'number') && isFinite(value))
      continue;
    else if (!instanceOf(value, 'boolean', 'bigint', 'function') && sizeOf(value) == 0)
      return true;
  }

  return false;
}

function isNotEmpty() {
  return !isEmpty.apply(this, arguments);
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
  now,
  instanceOf,
  sizeOf,
  isEmpty,
  isNotEmpty,
  capitalize,
  firstValue,
  lastValue,
  createResolvable,
  get,
  set,
  remove,
  getMeta,
  setMeta,
  removeMeta,
  getMetaNS,
  setMetaNS,
  removeMetaNS,
};