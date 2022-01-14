const Nife = require('../src');

describe("DataUtils", function() {
  it('should be able to merge objects (shallow)', function() {
    var obj1 = { 'test1': 1 };
    var obj2 = Nife.extend(obj1, { 'test2': 2 });

    expect(obj2).toBe(obj1);
    expect(obj2).toEqual({ 'test1': 1, 'test2': 2 });

    var obj3 = Nife.extend({}, obj2);
    expect(obj3).not.toBe(obj2);
    expect(obj3).toEqual({ 'test1': 1, 'test2': 2 });
  });

  it('should be able to merge objects (deep)', function() {
    var obj1 = { 'test1': 1, 'array': [ 1, 2, 3 ], 'object': { 'key1': true } };
    var obj2 = Nife.extend(true, obj1, { 'test2': 2, 'array': [ 4, 5 ], 'object': { 'key2': false } });

    expect(obj2).toBe(obj1);
    expect(obj2).toEqual({ 'test1': 1, 'test2': 2, 'array': [ 4, 5, 3 ], 'object': { 'key1': true, 'key2': false } });

    var obj3 = Nife.extend(true, {}, obj2);
    expect(obj3).not.toBe(obj2);
    expect(obj3).toEqual({ 'test1': 1, 'test2': 2, 'array': [ 4, 5, 3 ], 'object': { 'key1': true, 'key2': false } });
  });

  it('should be able to merge objects (filtering)', function() {
    var obj1 = { 'test1': 1, 'derp': 'something', 'array': [ 1, 2, 3 ], 'object': { 'key1': true, 'key2': false } };
    var obj2 = Nife.extend(Nife.extend.FILTER, (key, value) => {
      if (key === 'key2')
        return false;

      if (value === 'something')
        return false;

      return true;
    }, {}, obj1);

    expect(obj2).not.toBe(obj1);
    expect(obj2).toEqual({ 'test1': 1, 'array': [ 1, 2, 3 ], 'object': { 'key1': true, 'key2': false } });

    obj2 = Nife.extend(Nife.extend.FILTER|Nife.extend.DEEP, (key, value) => {
      if (key === 'key2')
        return false;

      if (value === 'something')
        return false;

      return true;
    }, {}, obj1);

    expect(obj2).toEqual({ 'test1': 1, 'array': [ 1, 2, 3 ], 'object': { 'key1': true } });
  });

  it('should be able to pluck values', function() {
    var data = [
      { id: 1, value: 'one',    scope: { name: 'test1' } },
      { id: 2, value: 'two',    scope: { name: 'test2' } },
      { id: 3, value: 'three',  scope: { name: 'test3' } },
      { id: 4, value: 'four',   scope: { name: 'test4' } },
    ];

    expect(Nife.pluck('id', data)).toEqual([ 1, 2, 3, 4 ]);
    expect(Nife.pluck([ 'id', 'value' ], data)).toEqual([ [ 1, 'one' ], [ 2, 'two' ], [ 3, 'three' ], [ 4, 'four' ] ]);
    expect(Nife.pluck([ 'id', 'scope.name' ], data)).toEqual([ [ 1, 'test1' ], [ 2, 'test2' ], [ 3, 'test3' ], [ 4, 'test4' ] ]);
  });

  it('should be able to convert to a lookup map', function() {
    var data = [
      { id: 1, value: 'one',    scope: { name: 'test1' } },
      { id: 2, value: 'two',    scope: { name: 'test2' } },
      { id: 3, value: 'three',  scope: { name: 'test3' } },
      { id: 4, value: 'four',   scope: { name: 'test4' } },
    ];

    var map = Nife.toLookup('id', data);
    expect(map['1']).toBe(data[0]);
    expect(map['2']).toBe(data[1]);
    expect(map['3']).toBe(data[2]);
    expect(map['4']).toBe(data[3]);

    var map = Nife.toLookup('value', data);
    expect(map['one']).toBe(data[0]);
    expect(map['two']).toBe(data[1]);
    expect(map['three']).toBe(data[2]);
    expect(map['four']).toBe(data[3]);
  });

  it('should be able to get unique items of array', function() {
    expect(Nife.uniq([ 1, 1, 2, 2, 3, 4, 5 ])).toEqual([ 1, 2, 3, 4, 5 ]);

    var obj = {};
    expect(Nife.uniq([ 1, 1, obj, obj, 3, 4, 5 ])).toEqual([ 1, obj, 3, 4, 5 ]);

    expect(Nife.uniq([ 1, 'derp', obj, obj, 3, 4, 'derp' ])).toEqual([ 1, 'derp', obj, 3, 4 ]);
  });

  it('should be able to check if objects differ', function() {
    expect(Nife.propsDiffer(null, null)).toBe(false);
    expect(Nife.propsDiffer(undefined, undefined)).toBe(false);
    expect(Nife.propsDiffer(1, 1)).toBe(false);
    expect(Nife.propsDiffer('derp', 'derp')).toBe(false);
    expect(Nife.propsDiffer(true, true)).toBe(false);
    expect(Nife.propsDiffer(false, false)).toBe(false);

    expect(Nife.propsDiffer(null, undefined)).toBe(true);
    expect(Nife.propsDiffer(0, 1)).toBe(true);
    expect(Nife.propsDiffer('derpy', 'derp')).toBe(true);
    expect(Nife.propsDiffer(true, false)).toBe(true);

    expect(Nife.propsDiffer([ 1, 2 ], [ 1, 2])).toBe(false);

    var obj = { 'hello': true };
    expect(Nife.propsDiffer([ 1, 2, obj ], [ 1, 2, { 'hello': true } ])).toBe(true);
    expect(Nife.propsDiffer([ 1, 2, obj ], [ 1, 2, obj ])).toBe(false);

    expect(Nife.propsDiffer({ 'hello': 'world' }, { 'hello': 'world' })).toBe(false);
    expect(Nife.propsDiffer({ 'hello': 'world' }, { 'hello': 'worldy' })).toBe(true);
  });
});
