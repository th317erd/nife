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
  var allowOverwrite  = true;
  var startIndex      = 0;
  var dst             = arguments[0];
  var filterFunc;

  if (typeof dst === 'boolean') {
    isDeep = dst;
    startIndex++;
  } else if (typeof dst === 'number') {
    isDeep = (dst & extend.DEEP);
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

function propsDiffer(props1, props2) {
  if (props1 === props2)
    return false;

  if (typeof props1 !== typeof props2)
    return true;

  if (props1 instanceof Object && props2 instanceof Object) {
    var keys1 = Object.keys(props1);
    var keys2 = Object.keys(props2);

    if (keys1.length !== keys2.length)
      return true;

    var allKeys = Object.keys(keys1.concat(keys2).reduce((obj, key) => obj[key] = obj, {}));
    for (var i = 0, il = allKeys.length; i < il; i++) {
      var key     = allKeys[i];
      var value1  = props1[key];
      var value2  = props2[key];

      if (value1 !== value2)
        return true;
    }

    return false;
  }

  return (props1 !== props2);
}

function uniq(items) {
  var finalItems = new Map();

  for (var i = 0, il = items.length; i < il; i++) {
    var item = items[i];
    finalItems.set(item, true);
  }

  return Array.from(finalItems.keys());
}

module.exports = {
  extend,
  pluck,
  toLookup,
  propsDiffer,
  uniq,
};
