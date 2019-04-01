/* eslint-disable no-undef */
const { expect } = require('chai');
const { Converter } = require('../src/Converter');
const { JsonConverter } = require('../src/JsonConverter');

describe('JsonConverter', () => {
  const jsonConverter = JsonConverter();
  describe('::()', () => {
    it('Call to JsonConverter creates object', () => {
      expect(jsonConverter).to.be.an('object');
    });
    it('created object is instance of Converter', () => {
      expect(jsonConverter).to.be.an.instanceof(Converter);
    });
  });
  describe('#ouputType', () => {
    it('value of the property is "json"', () => {
      expect(jsonConverter).to.have.property('outputType', 'json');
    });
  });
  describe('#replacer', () => {
    it('getter returns null', () => {
      expect(jsonConverter).to.have.property('replacer', null);
    });
    it('setter throws error if new value has not allowed type', () => {
      expect(jsonConverter.replacer = 5).to.throw(TypeError, 'Value of "replacer" property must be boolean or undefined');
    });
    it('setter changes value of the property to function', () => {
      jsonConverter.replacer = (key, value) => {
        // Filtering out properties
        if (key === 'header') {
          return undefined;
        }
        return value;
      };
      expect(jsonConverter).to.have.property('replacer').be.a('function');
    });
  });
  describe('#space', () => {
    it('getter returns undefined', () => {
      expect(jsonConverter).to.have.property('space', undefined);
    });
    it('setter changes value of the property to string or number', () => {
      jsonConverter.space = '    ';
      expect(jsonConverter).to.have.property('space', '    ');
    });
  });
  describe('#convert', () => {
    it('getter returns false', () => {
      jsonConverter.replacer = null;
      jsonConverter.space = '';
      const tree = {
        records: [
          [
            'aaa',
            `b 
,bb`,
            'ccc"ddd',
          ],
          [
            'zzz',
            '',
            '',
          ],
          [
            1,
            2.2,
            '',
          ],
          [
            '',
            3,
            '',
          ],
        ],
        header: [
          'field_name_1',
          `Field
Name 2`,
          'field_name_3',
        ],
      };
      const jsonString = jsonConverter.convert(tree);
      expect(jsonString).to.be.equal('{"records":[["aaa","b \\n,bb","ccc\\"ddd"],["zzz","",""],[1,2.2,""],["",3,""]],"header":["field_name_1","Field\\nName 2","field_name_3"]}');
    });
  });
});
