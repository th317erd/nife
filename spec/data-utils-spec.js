const Nife = require('../src');

describe("DataUtils", function() {
  describe('coerceValue', function() {
    it('should be able to coerce to boolean (without type)', function() {
      expect(Nife.coerceValue(undefined)).toBe(undefined);
      expect(Nife.coerceValue(null)).toBe(null);
      expect(Nife.coerceValue(true)).toBe(true);
      expect(Nife.coerceValue(false)).toBe(false);
      expect(Nife.coerceValue('True')).toBe(true);
      expect(Nife.coerceValue('true')).toBe(true);
      expect(Nife.coerceValue('"TRUE"')).toBe(true);
      expect(Nife.coerceValue('"true"')).toBe(true);
      expect(Nife.coerceValue("'true'")).toBe(true);
      expect(Nife.coerceValue('false')).toBe(false);
      expect(Nife.coerceValue('False')).toBe(false);
      expect(Nife.coerceValue('"false"')).toBe(false);
      expect(Nife.coerceValue('"FALSE"')).toBe(false);
      expect(Nife.coerceValue("'false'")).toBe(false);
    });

    it('should be able to coerce to boolean (with type)', function() {
      expect(Nife.coerceValue(undefined, 'boolean')).toBe(false);
      expect(Nife.coerceValue(null, 'boolean')).toBe(false);
      expect(Nife.coerceValue(true, 'boolean')).toBe(true);
      expect(Nife.coerceValue(false, 'boolean')).toBe(false);
      expect(Nife.coerceValue(0, 'boolean')).toBe(false);
      expect(Nife.coerceValue(1, 'boolean')).toBe(true);
      expect(Nife.coerceValue(-1, 'boolean')).toBe(true);
      expect(Nife.coerceValue(NaN, 'boolean')).toBe(false);
      expect(Nife.coerceValue(Infinity, 'boolean')).toBe(true);
      expect(Nife.coerceValue(BigInt(0), 'boolean')).toBe(false);
      expect(Nife.coerceValue(BigInt(1), 'boolean')).toBe(true);
      expect(Nife.coerceValue(BigInt(-1), 'boolean')).toBe(true);
      expect(Nife.coerceValue('True', 'boolean')).toBe(true);
      expect(Nife.coerceValue('true', 'boolean')).toBe(true);
      expect(Nife.coerceValue('"TRUE"', 'boolean')).toBe(true);
      expect(Nife.coerceValue('"true"', 'boolean')).toBe(true);
      expect(Nife.coerceValue("'true'", 'boolean')).toBe(true);
      expect(Nife.coerceValue('false', 'boolean')).toBe(false);
      expect(Nife.coerceValue('False', 'boolean')).toBe(false);
      expect(Nife.coerceValue('"false"', 'boolean')).toBe(false);
      expect(Nife.coerceValue('"FALSE"', 'boolean')).toBe(false);
      expect(Nife.coerceValue("'false'", 'boolean')).toBe(false);
    });

    it('should be able to coerce to number (without type)', function() {
      expect(Nife.coerceValue(undefined)).toBe(undefined);
      expect(Nife.coerceValue(null)).toBe(null);
      expect(Nife.coerceValue(0)).toBe(0);
      expect(Nife.coerceValue(10)).toBe(10);
      expect(Nife.coerceValue('0')).toBe(0);
      expect(Nife.coerceValue('5')).toBe(5);
      expect(Nife.coerceValue('15.5')).toBe(15.5);
      expect(Nife.coerceValue("'15.5'")).toBe('15.5');
      expect(Nife.coerceValue('"10.52:234"')).toBe('10.52:234');
    });

    it('should be able to coerce to number (with type)', function() {
      expect(Nife.coerceValue(undefined, 'integer')).toBe(0);
      expect(Nife.coerceValue(null, 'integer')).toBe(0);
      expect(Nife.coerceValue(0, 'integer')).toBe(0);
      expect(Nife.coerceValue(10, 'integer')).toBe(10);
      expect(Nife.coerceValue(10.4, 'integer')).toBe(10);
      expect(Nife.coerceValue(10.6, 'integer')).toBe(11);
      expect(Nife.coerceValue('0', 'integer')).toBe(0);
      expect(Nife.coerceValue('5', 'integer')).toBe(5);
      expect(Nife.coerceValue('15.5', 'integer')).toBe(16);
      expect(Nife.coerceValue("'15.4'", 'integer')).toBe(15);
      expect(Nife.coerceValue('"10.52:234"', 'integer')).toBe(11);

      expect(Nife.coerceValue('10.4', 'number')).toBe(10.4);
      expect(Nife.coerceValue('10.6', 'number')).toBe(10.6);
      expect(Nife.coerceValue('"10.6"', 'number')).toBe(10.6);
      expect(Nife.coerceValue("'10.6'", 'number')).toBe(10.6);
      expect(Nife.coerceValue("'10.6:234.3'", 'number')).toBe(10.6);
      expect(Nife.coerceValue("1e-7", 'number')).toEqual(1/10000000);

      expect(Nife.coerceValue('0', 'bigint')).toEqual(BigInt(0));
      expect(Nife.coerceValue('1', 'bigint')).toEqual(BigInt(1));
      expect(Nife.coerceValue('1.1', 'bigint')).toEqual(BigInt(1));
      expect(Nife.coerceValue('1.5', 'bigint')).toEqual(BigInt(2));
      expect(Nife.coerceValue('"1.5"', 'bigint')).toEqual(BigInt(2));
      expect(Nife.coerceValue('"1.5:5.6"', 'bigint')).toEqual(BigInt(2));
    });

    it('should be able to coerce to string (without type)', function() {
      var func = () => {};
      var array = [];
      var obj = {};

      expect(Nife.coerceValue(undefined)).toBe(undefined);
      expect(Nife.coerceValue(null)).toBe(null);
      expect(Nife.coerceValue(true)).toBe(true);
      expect(Nife.coerceValue(false)).toBe(false);
      expect(Nife.coerceValue(10)).toBe(10);
      expect(Nife.coerceValue(func)).toBe(func);
      expect(Nife.coerceValue(array)).toBe(array);
      expect(Nife.coerceValue(obj)).toBe(obj);
      expect(Nife.coerceValue('derp')).toBe('derp');
      expect(Nife.coerceValue('"hello"')).toBe("hello");
      expect(Nife.coerceValue('""hello""')).toBe('"hello"');
    });

    it('should be able to coerce to string (with type)', function() {
      expect(Nife.coerceValue(undefined, 'string')).toBe('');
      expect(Nife.coerceValue(null, 'string')).toBe('');
      expect(Nife.coerceValue(() => {}, 'string')).toBe('');
      expect(Nife.coerceValue([], 'string')).toBe('');
      expect(Nife.coerceValue({}, 'string')).toBe('');
      expect(Nife.coerceValue(true, 'string')).toBe('true');
      expect(Nife.coerceValue(false, 'string')).toBe('false');
      expect(Nife.coerceValue(10, 'string')).toBe('10');
      expect(Nife.coerceValue(BigInt(10), 'string')).toBe('10');
      expect(Nife.coerceValue('derp', 'string')).toBe('derp');
      expect(Nife.coerceValue('"hello"', 'string')).toBe("hello");
      expect(Nife.coerceValue('""hello""', 'string')).toBe('"hello"');
      expect(Nife.coerceValue('true', 'boolean')).toBe(true);
      expect(Nife.coerceValue('TRUE', 'boolean')).toBe(true);
      expect(Nife.coerceValue('1', 'boolean')).toBe(true);
      expect(Nife.coerceValue('-1', 'boolean')).toBe(true);
      expect(Nife.coerceValue('false', 'boolean')).toBe(false);
      expect(Nife.coerceValue('FALSE', 'boolean')).toBe(false);
      expect(Nife.coerceValue('0', 'boolean')).toBe(false);
      expect(Nife.coerceValue('NaN', 'boolean')).toBe(undefined);
      expect(Nife.coerceValue('Infinity', 'boolean')).toBe(undefined);
    });

    it('should be able to work with default values', function() {
      var func = () => {};
      var array = [];
      var obj = {};

      expect(Nife.coerceValue(undefined, undefined, 'test')).toBe('test');
      expect(Nife.coerceValue(null, undefined, 'test')).toBe('test');
      expect(Nife.coerceValue('derp', 'boolean', 'test')).toBe('test');
      expect(Nife.coerceValue(undefined, 'integer', 'test')).toBe('test');
      expect(Nife.coerceValue(null, 'integer', 'test')).toBe('test');
      expect(Nife.coerceValue('derp', 'integer', 'test')).toBe('test');
      expect(Nife.coerceValue(func, 'integer', 'test')).toBe('test');
      expect(Nife.coerceValue(array, 'integer', 'test')).toBe('test');
      expect(Nife.coerceValue(obj, 'integer', 'test')).toBe('test');
      expect(Nife.coerceValue(undefined, 'bigint', 'test')).toBe('test');
      expect(Nife.coerceValue(null, 'bigint', 'test')).toBe('test');
      expect(Nife.coerceValue('derp', 'bigint', 'test')).toBe('test');
      expect(Nife.coerceValue(func, 'bigint', 'test')).toBe('test');
      expect(Nife.coerceValue(array, 'bigint', 'test')).toBe('test');
      expect(Nife.coerceValue(obj, 'bigint', 'test')).toBe('test');
      expect(Nife.coerceValue(undefined, 'string', 'test')).toBe('test');
      expect(Nife.coerceValue(null, 'string', 'test')).toBe('test');
      expect(Nife.coerceValue(func, 'string', 'test')).toBe('test');
      expect(Nife.coerceValue(array, 'string', 'test')).toBe('test');
      expect(Nife.coerceValue(obj, 'string', 'test')).toBe('test');
    });
  });

  describe('extend', function() {
    it('should be able to merge objects (shallow)', function() {
      var obj1 = { 'test1': 1 };
      var obj2 = Nife.extend(obj1, { 'test2': 2 });

      expect(obj2).toBe(obj1);
      expect(obj2).toEqual({ 'test1': 1, 'test2': 2 });

      var obj3 = Nife.extend({}, obj2);
      expect(obj3).not.toBe(obj2);
      expect(obj3).toEqual({ 'test1': 1, 'test2': 2 });

      var b = Symbol.for('test1');
      var c = Symbol.for('test2');

      var obj4 = Nife.extend({}, { [b]: 'derp', [c]: true });
      expect(obj4[b]).toEqual('derp');
      expect(obj4[c]).toEqual(true);

      var obj5 = Nife.extend(Nife.extend.NO_SYMBOLS, {}, { [b]: 'derp', [c]: true, 'test': 1 });
      expect(obj5[b]).toEqual(undefined);
      expect(obj5[c]).toEqual(undefined);
      expect(obj5['test']).toEqual(1);
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
  });

  describe('pluck', function() {
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
  });

  describe('toLookup', function() {
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
  });

  describe('uniq', function() {
    it('should be able to get unique items of array', function() {
      expect(Nife.uniq([ 1, 1, 2, 2, 3, 4, 5 ])).toEqual([ 1, 2, 3, 4, 5 ]);

      var obj = {};
      expect(Nife.uniq([ 1, 1, obj, obj, 3, 4, 5 ])).toEqual([ 1, obj, 3, 4, 5 ]);

      expect(Nife.uniq([ 1, 'derp', obj, obj, 3, 4, 'derp' ])).toEqual([ 1, 'derp', obj, 3, 4 ]);

      var a = Symbol.for('test1');
      var b = Symbol.for('test2');

      expect(Nife.uniq([ b, 1, 'derp', a, a, b ])).toEqual([ b, 1, 'derp', a ]);
    });
  });

  describe('propsDiffer', function() {
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

    it('should be able to check if objects differ (specifying specific keys)', function() {
      var obj = {};
      var a   = { 'derp': true, 'test': 1, 'hello': null, 'object': obj, 'differ': undefined };
      var b   = { 'derp': true, 'test': 1, 'hello': null, 'object': obj, 'differ': 0 };

      expect(Nife.propsDiffer(a, b)).toBe(true);
      expect(Nife.propsDiffer(a, b, [ 'derp', 'test', 'hello', 'object' ])).toBe(false);
    });
  });

  describe('toArray', function() {
    it('should be able to convert anything to an array of anything', function() {
      var a = [ 'test' ];
      var b = [ [ 'test' ] ];

      expect(Nife.toArray(a)).toBe(a);
      expect(Nife.toArray(b)).toBe(b);
      expect(Nife.toArray('derp')).toEqual([ 'derp' ]);
      expect(Nife.toArray(null)).toEqual([ null ]);
      expect(Nife.toArray(undefined)).toEqual([ undefined ]);
    });
  });

  describe('subtractFromArray', function() {
    it('should be able to subtract items from an array', function() {
      var a = [ 'one', 'two', 'three', 'four' ];

      var b = Symbol.for('test1');
      var c = Symbol.for('test2');

      expect(Nife.subtractFromArray(a)).not.toBe(a);
      expect(Nife.subtractFromArray(a, 'one')).not.toBe(a);
      expect(Nife.subtractFromArray(a, 'one')).toEqual([ 'two', 'three', 'four' ]);
      expect(Nife.subtractFromArray(a, [ 'two', 'three' ])).toEqual([ 'one', 'four' ]);
      expect(Nife.subtractFromArray([ null, 1, 2, null ], [ null ])).toEqual([ 1, 2 ]);
      expect(Nife.subtractFromArray([ undefined, 1, 2, null ], [ null ])).toEqual([ undefined, 1, 2 ]);
      expect(Nife.subtractFromArray([ b, c ], [ b ])).toEqual([ c ]);
    });
  });

  describe('arrayUnion', function() {
    it('should be able to union multiple arrays', function() {
      var a = [ 'one', 'two', 'three', 'four' ];

      var b = Symbol.for('test1');
      var c = Symbol.for('test2');

      expect(Nife.arrayUnion(a)).not.toBe(a);
      expect(Nife.arrayUnion(a, 'one')).toEqual(a);
      expect(Nife.arrayUnion(a, [ 'one', 'two' ])).toEqual(a);
      expect(Nife.arrayUnion(a, [ 'one', 'two' ], [ 'three' ])).toEqual(a);
      expect(Nife.arrayUnion(a, [ 'one', 'two' ], [ 'five' ])).toEqual([ 'one', 'two', 'three', 'four', 'five' ]);
      expect(Nife.arrayUnion([ null, undefined ], [ 1, 'two' ], [ true ])).toEqual([ null, undefined, 1, 'two', true ]);

      expect(Nife.arrayUnion([ null, undefined ], [ b, c ], [ true, c ])).toEqual([ null, undefined, b, c, true ]);
    });
  });

  describe('arraySubtract', function() {
    it('should be able to subtract multiple arrays', function() {
      var a = [ 'one', 'two', 'three', 'four' ];

      var b = Symbol.for('test1');
      var c = Symbol.for('test2');

      expect(Nife.arraySubtract(a)).not.toBe(a);
      expect(Nife.arraySubtract(a, 'one')).toEqual([ 'two', 'three', 'four' ]);
      expect(Nife.arraySubtract(a, [ 'one', 'two' ])).toEqual([ 'three', 'four' ]);
      expect(Nife.arraySubtract(a, [ 'one', 'two' ], [ 'three' ])).toEqual([ 'four' ]);
      expect(Nife.arraySubtract(a, [ 'one', 'two' ], 'four')).toEqual([ 'three' ]);
      expect(Nife.arraySubtract([ null, undefined ], [ 1, 'two' ], [ true ])).toEqual([ null, undefined ]);
      expect(Nife.arraySubtract([ null, undefined, b, c ], [ c ])).toEqual([ null, undefined, b ]);
    });
  });
});
