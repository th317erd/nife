const Utils = require('./utils');

function extend() {
  function _extend(parentKey, parentObj, depth, dst) {
    var startIndex = 4;
    var val;

    if (isDeep) {
      for (var i = startIndex, len = arguments.length; i < len; i++) {
        var thisArg = arguments[i];
        if (!thisArg)
          continue;

        if (!(thisArg instanceof Object))
          continue;

        var keys = Object.keys(thisArg);
        if (!noSymbols)
          keys = keys.concat(Object.getOwnPropertySymbols(thisArg));

        for (var j = 0, jLen = keys.length; j < jLen; j++) {
          var key = keys[j];
          if (key === '__proto__' || key === 'constructor' || key === 'prototype')
            continue;

          if (allowOverwrite !== true && dst.hasOwnProperty(key))
            continue;

          val = thisArg[key];
          var dstVal = dst[key];

          if (filterFunc && filterFunc(key, val, thisArg, dstVal, dst, depth, parentKey, parentObj) === false)
            continue;

          if (val && typeof val === 'object' && !(val instanceof String) && !(val instanceof Number) &&
              (val.constructor === Object.prototype.constructor || val.constructor === Array.prototype.constructor)) {
            var isArray = (val instanceof Array);

            if (!dstVal)
              dstVal = (isArray) ? [] : {};

            val = _extend(key, thisArg, depth + 1, (isArray) ? [] : {}, dstVal, val);
          }

          dst[key] = val;
        }
      }
    } else {
      for (var i = startIndex, len = arguments.length; i < len; i++) {
        var thisArg = arguments[i];
        if (!thisArg)
          continue;

        if (!(thisArg instanceof Object))
          continue;

        var keys = Object.keys(thisArg);
        if (!noSymbols)
          keys = keys.concat(Object.getOwnPropertySymbols(thisArg));

        for (var j = 0, jLen = keys.length; j < jLen; j++) {
          var key = keys[j];
          if (key === '__proto__' || key === 'constructor' || key === 'prototype')
            continue;

          if (allowOverwrite !== true && dst.hasOwnProperty(key))
            continue;

          val = thisArg[key];
          if (filterFunc) {
            var dstVal = dst[key];
            if (filterFunc(key, val, thisArg, dstVal, dst, depth, parentKey, parentObj) === false)
              continue;
          }

          dst[key] = val;
        }
      }
    }

    if (dst._audit) {
      var b = dst._audit.base;
      b.modified = Utils.now();
      b.updateCount++;
    }

    return dst;
  };

  if (arguments.length === 0)
    return;

  if (arguments.length === 1)
    return arguments[0];

  var isDeep          = false;
  var noSymbols       = false;
  var allowOverwrite  = true;
  var startIndex      = 0;
  var dst             = arguments[0];
  var filterFunc;

  if (typeof dst === 'boolean') {
    isDeep = dst;
    startIndex++;
  } else if (typeof dst === 'number') {
    isDeep = (dst & extend.DEEP);
    noSymbols = (dst & extend.NO_SYMBOLS);
    allowOverwrite = !(dst & extend.NO_OVERWRITE);
    startIndex++;
    filterFunc = (dst & extend.FILTER) ? arguments[startIndex++] : undefined;
  }

  //Destination object
  dst = arguments[startIndex++];
  if (!dst)
    dst = {};

  var args = [ null, null, 0, dst ];
  for (var i = startIndex, il = arguments.length; i < il; i++)
    args.push(arguments[i]);

  return _extend.apply(this, args);
}

(function extend_const(base) {
  base.DEEP         = 0x01;
  base.NO_OVERWRITE = 0x02;
  base.FILTER       = 0x04;
  base.NO_SYMBOLS   = 0x08;
})(extend);

function pluck(keys) {
  var thisArray   = [];
  var isMultiple  = (keys instanceof Array);

  for (var i = 1, len = arguments.length; i < len; i++) {
    var bucket = arguments[i];
    if (!bucket)
      continue;

    var indexNames = Object.keys(bucket);
    for (var k = 0, kl = indexNames.length; k < kl; k++) {
      var item = bucket[k];
      var value;

      if (isMultiple) {
        value = new Array(keys.length);

        for (var j = 0, jl = keys.length; j < jl; j++) {
          var key = keys[j];
          value[j] = Utils.get(item, key);
        }
      } else {
        value = Utils.get(item, keys);
      }

      thisArray.push(value);
    }
  }

  return thisArray;
}

function toLookup(pluckKey, data) {
  if (!data)
    return {};

  var obj   = {};
  var keys  = Object.keys(data);

  for (var i = 0, il = keys.length; i < il; i++) {
    var key   = keys[i];
    var value = data[key];
    var id    = Utils.get(value, pluckKey);

    if (id == null)
      continue;

    obj[('' + id)] = value;
  }

  return obj;
}

function propsDiffer(props1, props2, _keys, symbols = false) {
  if (props1 === props2)
    return false;

  if (typeof props1 !== typeof props2)
    return true;

  if (props1 == null || props2 == null)
    return (props1 !== props2);

  if (
    typeof props1 === 'string' || props1 instanceof String ||
    typeof props1 === 'number' || props1 instanceof Number ||
    typeof props1 === 'boolean' || props1 instanceof Boolean ||
    typeof props1 === 'bigint' || props1 instanceof BigInt
  ) {
    return (props1.valueOf() !== props2.valueOf());
  }

  var allKeys;

  if (_keys instanceof Array) {
    allKeys = _keys;
  } else {
    var keys1 = Object.keys(props1);
    var keys2 = Object.keys(props2);

    if (symbols) {
      keys1 = keys1.concat(Object.getOwnPropertySymbols(props1));
      keys2 = keys2.concat(Object.getOwnPropertySymbols(props2));
    }

    if (keys1.length !== keys2.length)
      return true;

    allKeys = arrayUnion(keys1, keys2);
  }

  for (var i = 0, il = allKeys.length; i < il; i++) {
    var key     = allKeys[i];
    var value1  = props1[key];
    var value2  = props2[key];

    if (value1 !== value2)
      return true;
  }

  return false;
}

function uniq(items) {
  var finalItems = new Map();

  for (var i = 0, il = items.length; i < il; i++) {
    var item = items[i];
    finalItems.set(item, true);
  }

  return Array.from(finalItems.keys());
}

function coerceValue(_value, _type, defaultValue) {
  var value           = _value;
  var type            = (_type) ? _type.toLowerCase() : _type;
  var hasDefaultValue = (arguments.length > 2);

  const parseBoolean = (value, strict) => {
    if (value == null)
      return (strict) ? undefined : false;

    var typeOf = typeof value;

    if (typeOf === 'boolean' || value instanceof Boolean)
      return (typeof value.valueOf === 'function') ? value.valueOf() : value;

    if (!strict && (typeOf === 'number' || typeOf === 'bigint' || value instanceof Number)) {
      if (typeOf === 'bigint')
        return !!value;

      if (!isFinite(value)) {
        if (strict)
          return;

        if (isNaN(value))
          return false;

        return true;
      }

      return !!value;
    }

    if (!(typeOf === 'string' || value instanceof String))
      return (strict) ? undefined : !!value;

    if (!strict) {
      var number = parseNumber(value, true);
      if (typeof number === 'number')
        return !!number;
    }

    if (('' + value).match(/^['"]*true['"]*$/i))
      return true;

    if (('' + value).match(/^['"]*false['"]*$/i))
      return false;
  };

  const parseNumber = (value, strict) => {
    if (value == null)
      return;

    var typeOf = typeof value;

    if (typeOf === 'bigint')
      return parseFloat(value);

    if (typeOf === 'number' || value instanceof Number) {
      var val = (value instanceof Number) ? value.valueOf() : value;
      if (!isFinite(val))
        return (strict) ? undefined : 0;

      return val;
    }

    if (!strict && (typeOf === 'boolean' || value instanceof Boolean))
      return (value) ? 1 : 0;

    if (!(typeOf === 'string' || value instanceof String))
      return;

    if (strict && value.match(/[^\d.e-]/))
      return;

    var parts     = value.split(/[^\d.e-]+/g).map((part) => part.replace(/[^\d.e-]+/g, '')).filter(Boolean);
    var firstPart = parts[0];
    if (!firstPart)
      return;

    var val = parseFloat(firstPart);
    if (!isFinite(val))
      return;

    return val;
  };

  const parseString = (value, strict) => {
    if (value == null)
      return;

    var typeOf = typeof value;

    if (typeOf === 'number' || value instanceof Number)
      return (isFinite(value)) ? ('' + value) : undefined;

    if ((typeOf === 'boolean' || value instanceof Boolean) || typeOf === 'bigint')
      return ('' + value);

    if (!(typeOf === 'string' || value instanceof String))
      return (strict) ? value : undefined;

    return ('' + value).replace(/^(['"])(.*)\1$/, '$2');
  };

  if (!type) {
    if (value == null)
      return (hasDefaultValue) ? defaultValue : value;

    var val = parseBoolean(value, true);
    if (typeof val === 'boolean')
      return val;

    val = parseNumber(value, true);
    if (typeof val === 'number')
      return val;

    if (!(typeof value === 'string' || value instanceof String))
      return value;

    val = parseString(value, true);
    if (val == null)
      return (hasDefaultValue) ? defaultValue : '';

    return val;
  } else {
    if (type === 'integer' || type === 'int' || type === 'number' || type === 'bigint') {
      var coercer;
      if (type === 'integer' || type === 'int')
        coercer = Math.round;
      else if (type === 'bigint')
        coercer = (val) => BigInt(Math.round(val));

      var val = parseNumber(value);
      if (val == null)
        return (hasDefaultValue) ? defaultValue : 0;

      return (coercer) ? coercer(val) : val;
    } else if (type === 'bool' || type === 'boolean') {
      val = parseBoolean(value);
      if (val == null)
        return (hasDefaultValue) ? defaultValue : val;

      return val;
    } else {
      val = parseString(value);
      if (val == null)
        return (hasDefaultValue) ? defaultValue : '';

      return val;
    }
  }
}

function toArray(item) {
  if (item instanceof Array)
    return item;

  return [ item ];
}

function subtractFromArray(sourceArray, _itemsToSubtract) {
  if (arguments.length < 2)
    return sourceArray.slice();

  var itemsToSubtract = toArray(_itemsToSubtract);
  return sourceArray.filter((item) => {
    if (itemsToSubtract.indexOf(item) >= 0)
      return false;

    return true;
  });
}

function arrayUnion(...args) {
  var map = new Map();
  for (var i = 0, il = args.length; i < il; i++) {
    var arg = args[i];

    if (arg instanceof Array) {
      for (var j = 0, jl = arg.length; j < jl; j++) {
        var item = arg[j];
        map.set(item, item);
      }
    } else {
      map.set(arg, arg);
    }
  }

  return Array.from(map.values());
}

module.exports = {
  arrayUnion,
  coerceValue,
  extend,
  pluck,
  propsDiffer,
  subtractFromArray,
  toArray,
  toLookup,
  uniq,
};
