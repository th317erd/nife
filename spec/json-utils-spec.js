const Nife = require('../src');

describe("JSONUtils", function() {
  it('should be able to serialize/deserialize object', function() {
    var obj = [
      {
        'stuff':    true,
        'thang':    false,
        'int':      1,
        'negative': -1,
        'string':   'stuff',
      }
    ];

    var serialized = Nife.safeJSONStringify(obj);
    expect(serialized).toEqual('{"::@id@::":0,"value":[{"::@id@::":1,"value":{"stuff":true,"thang":false,"int":1,"negative":-1,"string":"stuff"}}]}');
    expect(Nife.safeJSONParse(serialized)).toEqual(obj);
  });

  it('should be able to serialize/deserialize cyclic object', function() {
    var obj = [
      {
        'stuff':    true,
        'thang':    false,
        'int':      1,
        'negative': -1,
        'string':   'stuff',
      }
    ];

    obj[0].object = obj;

    var serialized = Nife.safeJSONStringify(obj);
    expect(serialized).toEqual('{"::@id@::":0,"value":[{"::@id@::":1,"value":{"stuff":true,"thang":false,"int":1,"negative":-1,"string":"stuff","object":"::@0@::"}}]}');

    var obj2 = Nife.safeJSONParse(serialized);
    expect(obj2).toEqual(obj);
    expect(obj2[0].object).toBe(obj2);
  });
});
