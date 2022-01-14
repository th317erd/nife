// Safely serialize possibly cyclic JSON
function safeJSONStringify(obj, formatter, space) {
  function safeCloneObj(key, _value, _alreadyVisited) {
    var value = _value;
    if (value == null)
      return value;

    var typeOf = typeof value;

    if (
      typeOf === 'string'   || value instanceof String ||
      typeOf === 'number'   || value instanceof Number ||
      typeOf === 'boolean'  || value instanceof Boolean
    ) {
      return value.valueOf();
    }

    if (typeOf === 'bigint')
      return value;

    var alreadyVisited  = _alreadyVisited || [];
    var index           = alreadyVisited.findIndex((obj) => (obj.oldValue === value));

    // Has this value already been stored (cyclic)?
    if (index >= 0)
      return `::@${index}@::`;

    if (typeof value.toJSON === 'function')
      value = value.toJSON.call(value, '');

    var keys      = Object.keys(value);
    var isArray   = (value instanceof Array);
    var valueCopy = (isArray) ? new Array(value.length) : {};

    index = alreadyVisited.length;
    alreadyVisited.push({
      referenced: false,
      newValue: valueCopy,
      oldValue: value
    });

    for (var i = 0, il = keys.length; i < il; i++) {
      var key       = keys[i];
      var thisValue = value[key];

      if (thisValue === undefined) {
        if (isArray)
          thisValue = null;
        else
          continue;
      }

      if (thisValue && typeof thisValue.toJSON === 'function')
        thisValue = thisValue.toJSON(key);

      if (thisValue !== null)
        thisValue = safeCloneObj(key, thisValue, alreadyVisited);

      valueCopy[key] = thisValue;
    }

    return {
      '::@id@::': index,
      value:      valueCopy,
    };
  }

  var alreadyVisited  = [],
      newObj          = safeCloneObj(null, obj, alreadyVisited);

  return JSON.stringify(newObj, formatter, space);
}

// Safely parse possibly cyclic JSON
function safeJSONParse(data) {
  // Build references to all objects... later to be used to rebuild cyclic object
  function buildRefs(key, obj, _refs) {
    if (!obj)
      return obj;

    if (!obj.hasOwnProperty('::@id@::'))
      return obj;

    var refs    = _refs || {};
    var id      = obj['::@id@::'];
    var value   = obj.value;
    var keys    = Object.keys(value);
    var newObj  = (value instanceof Array) ? new Array(value.length) : {};

    refs[id] = newObj;
    for (var i = 0, il = keys.length; i < il; i++) {
      var key = keys[i];
      if (key.match(/::@(id|\d+)@::/))
        continue;

      var thisValue = buildRefs(key, value[key], refs);
      newObj[key] = thisValue;
    }

    return newObj;
  }

  // Reconstruct cyclic object
  function unwindData(key, obj, refs) {
    if (!obj)
      return obj;

    if (typeof obj === 'string') {
      var p = obj.match(/::@(\d)+@::/);
      if (!p)
        return obj;

      var index = p[1];
      return unwindData(key, refs[index], refs);
    }

    if (!obj.hasOwnProperty('::@id@::'))
      return obj;

    var id      = obj['::@id@::'];
    var value   = obj.value;
    var keys    = Object.keys(value);
    var newObj  = refs[id];

    for (var i = 0, il = keys.length; i < il; i++) {
      var key = keys[i];
      if (key.match(/::@(id|\d+)@::/))
        continue;

      var thisValue = unwindData(key, value[key], refs);
      newObj[key] = thisValue;
    }

    return newObj;
  }

  // Safety checks
  if (data === undefined || data === '')
    return;

  if (data === "null" || data === null)
    return null;

  try {
    // Parse JSON
    var obj = JSON.parse(data);

    // If it is simple, just return the value
    if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean' || obj instanceof Array)
      return obj;

    if (data.indexOf('::@id@::') < 0)
      return obj;

    // Build object reference table
    var refs = {};
    buildRefs(null, obj, refs);

    // Reconstruct data
    return unwindData(null, obj, refs);
  } catch (e) {
    return;
  }
}

module.exports = {
  safeJSONStringify,
  safeJSONParse,
};
