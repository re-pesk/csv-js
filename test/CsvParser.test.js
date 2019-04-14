const { describe, it } = require('mocha');
const { expect } = require('chai');
const { CsvParser } = require('../src/CsvParser');

describe('CsvParser\n', () => {
  describe('calling without arguments\n', () => {
    it('creates object with all parameters equal to dault value (false)\n', () => {
      const csvParser = CsvParser();
      expect(csvParser).to.be.an('object');
      expect(csvParser.constructor.name).to.equal('CsvParser');
      expect(csvParser.parameters).to.deep.equal(Object.seal({
        withHeader: false,
        withNull: false,
        withNumbers: false,
        withEmptyLine: false,
        ignoreCorruptedData: false,
      }));
    });
  });
  describe('calling with argument \'parameters\'\n', () => {
    it(' creates object with parameters different from default value\n', () => {
      const csvParser = CsvParser({
        withHeader: true,
        withNull: true,
        withNumbers: true,
        withEmptyLine: true,
        ignoreCorruptedData: true,
      });
      expect(csvParser).to.be.an('object');
      expect(csvParser.constructor.name).to.equal('CsvParser');
      expect(csvParser.parameters).to.deep.equal(Object.seal({
        withHeader: true,
        withNull: true,
        withNumbers: true,
        withEmptyLine: true,
        ignoreCorruptedData: true,
      }));
    });
  });
  describe('assigning value to property \'#parameters\'\n', () => {
    it('set parameters of object to new values\n', () => {
      const csvParser = CsvParser();
      csvParser.parameters = {
        withHeader: true,
        withNull: true,
        withNumbers: true,
        withEmptyLine: true,
        ignoreCorruptedData: true,
      };
      expect(csvParser.parameters).to.deep.equal({
        withHeader: true,
        withNull: true,
        withNumbers: true,
        withEmptyLine: true,
        ignoreCorruptedData: true,
      });
    });
  });
  describe('calling method \'#makeRecords\'\n', () => {
    it('creates recordset \n', () => {
      const csvParser = CsvParser();
      expect(csvParser.makeRecords('')).to.deep.equal([[[['', 0], ['', 0], ['', 0], ['', 0]]]]);
    });
  });
  describe('calling method \'#checkRecords\'\n', () => {
    it('returns true if recordset is valid\n', () => {
      const csvParser = CsvParser();
      expect(csvParser.checkRecords([[[['', 0], ['', 0], ['', 0], ['', 0]]]])).to.deep.equal(true);
    });
  });
  describe('calling method \'#checkValues\'\n', () => {
    it('returns true if values of recordset are valid\n', () => {
      const csvParser = CsvParser();
      expect(csvParser.checkValues([[[['', 0], ['', 0], ['', 0], ['', 0]]]])).to.deep.equal(true);
    });
  });
  describe('calling method \'#recordsToDataTree\'\n', () => {
    it('creates recordset \n', () => {
      const csvParser = CsvParser();
      expect(csvParser.recordsToDataTree([[[['', 0], ['', 0], ['', 0], ['', 0]]]])).to.deep.equal({ records: [['']] });
    });
  });
  describe('calling method \'#makeDataTree\'\n', () => {
    it('creates recordset \n', () => {
      const csvParser = CsvParser();
      expect(csvParser.makeDataTree('')).to.deep.equal({ records: [['']] });
    });
  });
});
