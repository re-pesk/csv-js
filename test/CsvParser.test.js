/* eslint-disable no-undef */
const { expect } = require('chai');
const { Parser } = require('../src/Parser');
const { CsvParser } = require('../src/CsvParser');

describe('CsvParser', () => {
  const csvParser = CsvParser();
  describe('::()', () => {
    it('Call to CsvParser creates object', () => {
      expect(csvParser).to.be.an('object');
    });
    it('created object is instance of Parser', () => {
      expect(csvParser).to.be.an.instanceof(Parser);
    });
  });
  describe('#inputType', () => {
    it('value of the property is "csv"', () => {
      expect(csvParser).to.have.property('inputType', 'csv');
    });
  });
  describe('#withHeader', () => {
    it('getter returns false', () => {
      expect(csvParser).to.have.property('withHeader', false);
    });
    it('setter throws error if new value has not allowed type', () => {
      csvParser.withHeader = 5;
      expect(csvParser.withHeader = 5).to.throw(TypeError, 'Value of "withHeader" property must be boolean or undefined');
    });
    it('setter changes value of the property to true', () => {
      csvParser.withHeader = true;
      expect(csvParser).to.have.property('withHeader', true);
    });
  });
  describe('#withNull', () => {
    it('getter returns false', () => {
      expect(csvParser).to.have.property('withNull', false);
    });
    it('setter changes value of the property to true', () => {
      csvParser.withNull = true;
      expect(csvParser).to.have.property('withNull', true);
    });
  });
  describe('#makeDataTree', () => {
    it('getter returns false', () => {
      const csv = `field_name_1,"Field
Name 2",field_name_3 
"aaa","b 
,bb","ccc""ddd"
zzz,,""
1,2.2,
,3,
`;
      const tree = csvParser.makeDataTree(csv);
      expect(tree).to.have.property('records');
    });
  });
});
