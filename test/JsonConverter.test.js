/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */
const { Converter } = require('../src/Converter');
const { JsonConverter } = require('../src/JsonConverter');

describe('JsonConverter', () => {
  describe('() - calling without arguments:', () => {
    it('creates object that is instance of Converter', () => {
      const jsonConverter = JsonConverter();
      expect(jsonConverter).toBeInstanceOf(Converter);
    });
    describe('#ouputType', () => {
      const jsonConverter = JsonConverter();
      it('value of the property is "json"', () => {
        expect(jsonConverter).toHaveProperty('outputType', 'json');
      });
      it('is not writable', () => {
        jsonConverter.outputType = 'abc';
        expect(jsonConverter).toHaveProperty('outputType', 'json');
      });
    });
    describe('#replacer', () => {
      const jsonConverter = JsonConverter();
      it('getter returns null', () => {
        expect(jsonConverter).toHaveProperty('replacer', null);
      });
      it('setter changes value of the property to null', () => {
        jsonConverter.replacer = null;
        expect(jsonConverter).toHaveProperty('replacer', null);
      });
      it('setter changes value of the property to array', () => {
        const replacer = ['header'];
        jsonConverter.replacer = replacer;
        expect(jsonConverter.replacer).toBeInstanceOf(Array);
        expect(jsonConverter).toHaveProperty('replacer', replacer);
      });
      it('setter changes value of the property to function', () => {
        const replacer = (key, value) => {
          // Filtering out properties
          if (key === 'header') {
            return undefined;
          }
          return value;
        };
        jsonConverter.replacer = replacer;
        expect(jsonConverter.replacer).toBeInstanceOf(Function);
        expect(jsonConverter).toHaveProperty('replacer', replacer);
      });
      it('setter throws error if new value is not function, array, null or undefined', () => {
        expect(() => { jsonConverter.replacer = 5; }).toThrow(TypeError, 'Value of #replacer" property must be function, array, null or undefined.');
      });
    });
    describe('#space', () => {
      const jsonConverter = JsonConverter();
      it('getter returns null', () => {
        expect(jsonConverter).toHaveProperty('space', null);
      });
      it('setter changes value of the property to null', () => {
        jsonConverter.space = null;
        expect(jsonConverter).toHaveProperty('space', null);
      });
      it('setter changes value of the property to string', () => {
        jsonConverter.space = '    ';
        expect(jsonConverter.space).toStrictEqual('    ');
      });
      it('setter changes value of the property to number', () => {
        jsonConverter.space = 4;
        expect(jsonConverter.space).toStrictEqual(4);
      });
      it('setter throws error if new value is not string, number, null or undefined', () => {
        expect(() => { jsonConverter.space = new Date(); }).toThrow(TypeError, 'Value of #space property must be string, number, null or undefined.');
      });
    });
  });
  describe('(arguments) - calling with arguments:', () => {
    describe('when arguments are wrong:', () => {
      it('throws error when argument is not function, array, null or undefined ({ replacer: 5 })', () => {
        expect(() => JsonConverter({ replacer: 5 })).toThrow(TypeError, 'Value of #replacer" property must be function, array, null or undefined.');
      });
      it('throws error when argument is not function, array, null or undefined ({ space: new Date() })', () => {
        expect(() => JsonConverter({ space: new Date() })).toThrow(TypeError, 'Value of #space property must be string, number, null or undefined.');
      });
      it('throws error when argument has wrong name ({ wrongName: true })', () => {
        expect(() => JsonConverter({ wrongName: null })).toThrow(TypeError, '"wrongName" is not a name of property.');
      });
    });
    describe('when values of arguments are undefined', () => {
      const jsonConverter = JsonConverter({ replacer: undefined, space: undefined });
      it('creates object that is instance of Parser', () => {
        expect(jsonConverter).toBeInstanceOf(Converter);
      });
      it('value of #replacer is null', () => {
        expect(jsonConverter.replacer).toStrictEqual(null);
      });
      it('value of #space is null', () => {
        expect(jsonConverter.space).toStrictEqual(null);
      });
    });
    describe('when argument is { replacer: ["header"] }', () => {
      const jsonConverter = JsonConverter({ replacer: ['header'] });
      it('creates object that is instance of Converter', () => {
        expect(jsonConverter).toBeInstanceOf(Converter);
      });
      it('value of #replacer is ["header"]', () => {
        expect(jsonConverter.replacer).toEqual(['header']);
      });
      it('value #space is null', () => {
        expect(jsonConverter.space).toStrictEqual(null);
      });
    });
    describe('when arguments are { replacer: ["header"], space: 2 }', () => {
      const jsonConverter = JsonConverter({ replacer: ['header'], space: 2 });
      it('creates object that is instance of Converter', () => {
        expect(jsonConverter).toBeInstanceOf(Converter);
      });
      it('Value of #replacer is 2', () => {
        expect(jsonConverter.replacer).toEqual(['header']);
      });
      it('Value #space is 2', () => {
        expect(jsonConverter.space).toStrictEqual(2);
      });
    });
  });
  describe('#convert', () => {
    const jsonConverter = JsonConverter();
    it('called without argument returns undefined', () => {
      expect(jsonConverter.convert()).toBeUndefined;
    });
    describe('returns appropriate string:', () => {
      const tree = {
        header: ['field_name_1', 'Field\nName 2', 'field_name_3 '],
        records: [
          ['aaa', 'b \n,bb', 'ccc"ddd'],
          ['zzz', null, ''],
          [1, 2.2, null],
          [null, 3, null],
        ],
      };
      it('when #replacer and #space are null', () => {
        expect(jsonConverter.replacer).toStrictEqual(null);
        expect(jsonConverter.space).toStrictEqual(null);
        expect(jsonConverter.convert(tree)).toStrictEqual('{"header":["field_name_1","Field\\nName 2","field_name_3 "],"records":[["aaa","b \\n,bb","ccc\\"ddd"],["zzz",null,""],[1,2.2,null],[null,3,null]]}');
      });
      it('when #replacer is array and #space is null', () => {
        jsonConverter.replacer = ['header'];
        expect(jsonConverter.replacer).toEqual(['header']);
        expect(jsonConverter.space).toStrictEqual(null);
        expect(jsonConverter.convert(tree)).toStrictEqual('{"header":["field_name_1","Field\\nName 2","field_name_3 "]}');
      });
      it('when #replacer is function and #space is null', () => {
        const replacer = (key, value) => {
          // Filtering out properties
          if (key === 'header') {
            return undefined;
          }
          return value;
        };
        jsonConverter.replacer = replacer;
        expect(jsonConverter.replacer).toStrictEqual(replacer);
        expect(jsonConverter.space).toStrictEqual(null);
        expect(jsonConverter.convert(tree)).toStrictEqual('{"records":[["aaa","b \\n,bb","ccc\\"ddd"],["zzz",null,""],[1,2.2,null],[null,3,null]]}');
      });
      it('when #replacer is array and #space is "  "', () => {
        const expected = '{\n  "header": [\n    "field_name_1",\n    "Field\\nName 2",\n    "field_name_3 "\n  ]\n}';
        jsonConverter.replacer = ['header'];
        jsonConverter.space = '  ';
        expect(jsonConverter.replacer).toEqual(['header']);
        expect(jsonConverter.space).toStrictEqual('  ');
        expect(jsonConverter.convert(tree)).toStrictEqual(expected);
      });
      it('when #replacer is array and #space is 2', () => {
        const expected = '{\n  "header": [\n    "field_name_1",\n    "Field\\nName 2",\n    "field_name_3 "\n  ]\n}';
        jsonConverter.replacer = ['header'];
        jsonConverter.space = 2;
        expect(jsonConverter.replacer).toEqual(['header']);
        expect(jsonConverter.space).toStrictEqual(2);
        expect(jsonConverter.convert(tree)).toStrictEqual(expected);
      });
    });
  });
});
