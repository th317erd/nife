const Nife = require('../src');

describe("Utils", function() {
  var obj;

  beforeEach(function() {
    obj = {
      hello: 'World',
      nullKey: null,
      deep: {
        list: [
          'first',
          'second',
          {
            more: 'yes, more'
          }
        ],
        parent: 'deep'
      },
      bool: true,
      number: 5
    };
  });

  it('should be able to escape regular expressions', function() {
    expect(Nife.regexpEscape('[.*]{}^$')).toEqual('\\[\\.\\*\\]\\{\\}\\^\\$');
  });

  it('should be able to split by parts', function() {
    var parts = Nife.splitBy('!$#@ derp word 1234 stuff ....', /\w+/);
    expect(parts).toEqual([ "!$#@ ","derp"," ","word"," ","1234"," ","stuff"," ...." ]);

    var parts = Nife.splitBy('!$#@ derp word 1234 stuff ....', [ 'er', 'or', 'uf' ], true);
    expect(parts).toEqual([ "!$#@ d","er","p w","or","d 1234 st","uf","f ...." ]);
  });

  it('should be able to properly identify types', function() {
    class TestClass {};

    expect(Nife.instanceOf(new TestClass(), 'object')).toBe(false);
    expect(Nife.instanceOf(new TestClass(), TestClass)).toBe(true);
    expect(Nife.instanceOf({}, 'object')).toBe(true);
    expect(Nife.instanceOf(new String('test'), 'object')).toBe(false);
    expect(Nife.instanceOf(new String('test'), 'string')).toBe(true);
    expect(Nife.instanceOf('test', 'string')).toBe(true);
    expect(Nife.instanceOf(5, 'string')).toBe(false);
    expect(Nife.instanceOf(BigInt(2), 'number')).toBe(false);
    expect(Nife.instanceOf(BigInt(2), 'bigint')).toBe(true);
    expect(Nife.instanceOf(() => {}, 'function')).toBe(true);
    expect(Nife.instanceOf([], 'array')).toBe(true);
    expect(Nife.instanceOf([], 'object')).toBe(false);
    expect(Nife.instanceOf(Symbol.for('test'), 'symbol')).toBe(true);
    expect(Nife.instanceOf(Symbol.for('test'), 'object')).toBe(false);
    expect(Nife.instanceOf(Symbol.for('test'), 'array')).toBe(false);
    expect(Nife.instanceOf(Symbol.for('test'), 'number')).toBe(false);
    expect(Nife.instanceOf(Symbol.for('test'), 'string')).toBe(false);
  });

  it('should be able to get a property', function() {
    expect(Nife.get(undefined, 'hello', 'other')).toBe('other');
    expect(Nife.get(null, 'hello', 'other')).toBe('other');
    expect(Nife.get(0, 'hello', 'other')).toBe('other');
    expect(Nife.get('bad', 'hello', 'other')).toBe('other');
    expect(Nife.get(false, 'hello', 'other')).toBe('other');
    expect(Nife.get(true, 'hello', 'other')).toBe('other');
    expect(Nife.get(obj, 'hello')).toBe('World');
    expect(Nife.get(obj, 'bool')).toBe(true);
    expect(Nife.get(obj, 'number')).toBe(5);
    expect(Nife.get(obj, 'deep.parent')).toBe('deep');
    expect(Nife.get(obj, 'deep.list')).toEqual(jasmine.any(Array));
    expect(Nife.get(obj, 'deep.list[0]')).toBe('first');
    expect(Nife.get(obj, 'deep.list[1]')).toBe('second');
    expect(Nife.get(obj, 'deep.list[2].more')).toBe('yes, more');
    expect(Nife.get(obj, 'nullKey')).toBe(null);
    expect(Nife.get(obj, 'nullKey', undefined)).toBe(undefined);

    var obj2 = { [Symbol.for('test')]: { 'stuff': true } };
    expect(Nife.get(obj2, 'test.stuff')).toEqual(true);
  });

  it('should be able to set a property', function() {
    expect(() => Nife.set(undefined, 'hello', 'Other World')).toThrow(new Error('Attempt to set on and empty context'));

    Nife.set(obj, 'hello', 'Other World');
    Nife.set(obj, 'bool', false);
    Nife.set(obj, 'number', 12);
    Nife.set(obj, 'deep.parent', 'not deep');
    Nife.set(obj, 'deep.list[0]', 'FIRST');
    Nife.set(obj, 'deep.list[1]', 'SECOND');
    Nife.set(obj, 'deep.list[2].more', 'HOLY MOLY!');

    var a = Symbol.for('wow');
    var obj2 = { [a]: { test: 2 } };
    var path = Nife.set(obj2, 'wow.test', 4);
    expect(path).toEqual('wow.test');
    expect(Nife.get(obj2, 'wow.test')).toEqual(4);

    expect(Nife.get(obj, 'hello')).toBe('Other World');
    expect(Nife.get(obj, 'bool')).toBe(false);
    expect(Nife.get(obj, 'number')).toBe(12);
    expect(Nife.get(obj, 'deep.parent')).toBe('not deep');
    expect(Nife.get(obj, 'deep.list')).toEqual(jasmine.any(Array));
    expect(Nife.get(obj, 'deep.list[0]')).toBe('FIRST');
    expect(Nife.get(obj, 'deep.list[1]')).toBe('SECOND');
    expect(Nife.get(obj, 'deep.list[2].more')).toBe('HOLY MOLY!');
  });

  it('should be able to remove a property', function() {
    Nife.set(obj, 'hello', 'Other World');

    expect(obj.hello).toBe('Other World');
    expect(Nife.remove(obj, 'hello')).toBe('Other World');
    expect(obj.hasOwnProperty('hello')).toBe(true);
    expect(obj.hello).toBe(undefined);
    expect(Nife.remove(obj, 'hello', true)).toBe(undefined);
    expect(obj.hasOwnProperty('hello')).toBe(false);

    expect(Nife.remove(obj, 'deep.parent', true)).toBe('deep');
    expect(obj.deep.hasOwnProperty('parent')).toBe(false);
  });

  it('should be able to check empty', function() {
    expect(Nife.isEmpty(null)).toBe(true);
    expect(Nife.isEmpty(undefined)).toBe(true);
    expect(Nife.isEmpty(NaN)).toBe(true);
    expect(Nife.isEmpty("   ")).toBe(true);
    expect(Nife.isEmpty("\t   \n")).toBe(true);
    expect(Nife.isEmpty('')).toBe(true);
    expect(Nife.isEmpty([])).toBe(true);
    expect(Nife.isEmpty({})).toBe(true);
    expect(Nife.isEmpty({ [Symbol.for('test')]: 1 })).toBe(false);

    expect(Nife.isEmpty(Infinity)).toBe(false);
    expect(Nife.isEmpty([ null ])).toBe(false);
    expect(Nife.isEmpty({ 'something': true })).toBe(false);
    expect(Nife.isEmpty(0)).toBe(false);
    expect(Nife.isEmpty(1)).toBe(false);
    expect(Nife.isEmpty(-1)).toBe(false);
    expect(Nife.isEmpty(true)).toBe(false);
    expect(Nife.isEmpty(false)).toBe(false);
    expect(Nife.isEmpty('   s')).toBe(false);
    expect(Nife.isEmpty(BigInt(1))).toBe(false);
  });

  it('should be able to check not empty', function() {
    expect(Nife.isNotEmpty(null)).toBe(false);
    expect(Nife.isNotEmpty(undefined)).toBe(false);
    expect(Nife.isNotEmpty(NaN)).toBe(false);
    expect(Nife.isNotEmpty("   ")).toBe(false);
    expect(Nife.isNotEmpty("\t   \n")).toBe(false);
    expect(Nife.isNotEmpty('')).toBe(false);
    expect(Nife.isNotEmpty([])).toBe(false);
    expect(Nife.isNotEmpty({})).toBe(false);

    expect(Nife.isNotEmpty(Infinity)).toBe(true);
    expect(Nife.isNotEmpty([ null ])).toBe(true);
    expect(Nife.isNotEmpty({ 'something': true })).toBe(true);
    expect(Nife.isNotEmpty(0)).toBe(true);
    expect(Nife.isNotEmpty(1)).toBe(true);
    expect(Nife.isNotEmpty(-1)).toBe(true);
    expect(Nife.isNotEmpty(true)).toBe(true);
    expect(Nife.isNotEmpty(false)).toBe(true);
    expect(Nife.isNotEmpty('   s')).toBe(true);
    expect(Nife.isNotEmpty(BigInt(1))).toBe(true);
  });

  it('should be able to get first value of array', function() {
    expect(Nife.firstValue([ 1, 2, 3 ])).toBe(1);
    expect(Nife.firstValue([ ], 'other')).toBe('other');
    expect(Nife.firstValue({})).toBe(undefined);
    expect(Nife.firstValue(null)).toBe(undefined);
    expect(Nife.firstValue(undefined)).toBe(undefined);
    expect(Nife.firstValue(undefined, 'something')).toBe('something');
  });

  it('should be able to get last value of array', function() {
    expect(Nife.lastValue([ 1, 2, 3 ])).toBe(3);
    expect(Nife.lastValue([ ], 'other')).toBe('other');
    expect(Nife.lastValue({})).toBe(undefined);
    expect(Nife.lastValue(null)).toBe(undefined);
    expect(Nife.lastValue(undefined)).toBe(undefined);
    expect(Nife.lastValue(undefined, 'something')).toBe('something');
  });

  it('should be able to get size of different objects', function() {
    expect(Nife.sizeOf([])).toBe(0);
    expect(Nife.sizeOf({})).toBe(0);
    expect(Nife.sizeOf({ [Symbol.for('test')]: true })).toBe(1);
    expect(Nife.sizeOf([ 1, 2, 3 ])).toBe(3);
    expect(Nife.sizeOf({ 'derp': true })).toBe(1);
    expect(Nife.sizeOf('derp')).toBe(4);
    expect(Nife.sizeOf('')).toBe(0);
    expect(Nife.sizeOf(0)).toBe(0);
    expect(Nife.sizeOf(1)).toBe(0);
    expect(Nife.sizeOf(true)).toBe(0);
    expect(Nife.sizeOf(false)).toBe(0);
    expect(Nife.sizeOf(function(){})).toBe(0);
    expect(Nife.sizeOf(function(arg){})).toBe(1);
  });

  it('should be able to capitalize strings', function() {
    expect(Nife.capitalize('derp stuff')).toBe('Derp stuff');
    expect(Nife.capitalize('derp stuff', true)).toBe('Derp Stuff');
    expect(Nife.capitalize('derp-stuff and thangs', true)).toBe('Derp-stuff And Thangs');
    expect(Nife.capitalize('derp THANG')).toBe('Derp THANG');
    expect(Nife.capitalize('derp THANG', true)).toBe('Derp THANG');
  });

  it('should be able to uncapitalize strings', function() {
    expect(Nife.uncapitalize('Something')).toBe('something');
    expect(Nife.uncapitalize('SOMETHING')).toBe('sOMETHING');
  });

  it('should be able to convert camel-case to snake-case', function() {
    expect(Nife.camelCaseToSnakeCase(null)).toBe(null);
    expect(Nife.camelCaseToSnakeCase(undefined)).toBe(undefined);
    expect(Nife.camelCaseToSnakeCase('testCamelCase')).toEqual('test_camel_case');
    expect(Nife.camelCaseToSnakeCase('TestCamelCase')).toEqual('test_camel_case');
    expect(Nife.camelCaseToSnakeCase('webhookURL')).toEqual('webhook_url');
    expect(Nife.camelCaseToSnakeCase('webhookURLBase')).toEqual('webhook_url_base');
  });

  it('should be able to convert snake-case to camel-case', function() {
    expect(Nife.snakeCaseToCamelCase(null)).toBe(null);
    expect(Nife.snakeCaseToCamelCase(undefined)).toBe(undefined);
    expect(Nife.snakeCaseToCamelCase('TestSnakeCase')).toEqual('TestSnakeCase');
    expect(Nife.snakeCaseToCamelCase('TESTSNAKECASE')).toEqual('TESTSNAKECASE');
    expect(Nife.snakeCaseToCamelCase('test_snake_case')).toEqual('testSnakeCase');
    expect(Nife.snakeCaseToCamelCase('test_snake_case', true)).toEqual('TestSnakeCase');
    expect(Nife.snakeCaseToCamelCase('Test_snake_case', false)).toEqual('testSnakeCase');
    expect(Nife.snakeCaseToCamelCase('_test')).toEqual('Test');
    expect(Nife.snakeCaseToCamelCase('_test_case')).toEqual('TestCase');
    expect(Nife.snakeCaseToCamelCase('_test_case_')).toEqual('TestCase');
    expect(Nife.snakeCaseToCamelCase('_test_case_', false)).toEqual('testCase');
  });

  it('should be able to create a resolvable (success)', function(done) {
    var promise = Nife.createResolvable();

    expect(promise.status()).toEqual('pending');

    promise.then((result) => {
      expect(result).toEqual('good job');
      expect(promise.status()).toEqual('resolved');
      done();
    });

    promise.resolve('good job');
  });

  it('should be able to create a resolvable (failure)', function(done) {
    var promise = Nife.createResolvable();

    expect(promise.status()).toEqual('pending');

    promise.catch((result) => {
      expect(result).toEqual('bad job');
      expect(promise.status()).toEqual('rejected');
      done();
    });

    promise.reject('bad job');
  });
});
