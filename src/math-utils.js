function lerp(start, end, ratio) {
  var range = end - start;
  return (range * ratio) + start;
}

function clamp(value, _min, _max) {
  var min = (_min < _max) ? _min : _max;
  var max = (_max < _min) ? _min : _max;

  if (value < min)
    return min;

  if (value > max)
    return max;

  return value;
}

function snapToGrid(num, segmentSize, _func, _offset, _scalar) {
  var func = _func;
  var offset = _offset || 0;
  var scalar = _scalar || 1000;

  if (!func)
    func = Math.round;

  if (typeof func === 'string' && typeof Math[func] === 'function')
    func = Math[func];

  return (func((segmentSize * scalar) * func(((offset + num) * scalar) / (segmentSize * scalar))) - (offset * scalar)) / scalar;
}

module.exports = {
  lerp,
  clamp,
  snapToGrid,
};
