const { describe, it } = require('mocha');
const { expect } = require('chai');
const { Parser } = require('../src/Parser');
const { CsvParser } = require('../src/CsvParser');

describe('CsvParser', () => {
  describe('() - calling without arguments:', () => {
    it('creates object that is instance of Parser', () => {
      const csvParser = CsvParser();
      expect(csvParser).to.be.an('object').itself.be.an.instanceof(Parser);
    });
    describe('#inputType', () => {
      const csvParser = CsvParser();
      it('Value of the property is "csv"', () => {
        expect(csvParser).to.have.property('inputType', 'csv');
      });
      it('The property is not writable', () => {
        csvParser.inputType = 'abc';
        expect(csvParser).to.have.property('inputType', 'csv');
      });
    });
    describe('#withHeader', () => {
      const csvParser = CsvParser();
      it('Getter returns false', () => {
        expect(csvParser).to.have.property('withHeader', false);
      });
      it('Setter changes value of the property to true', () => {
        csvParser.withHeader = true;
        expect(csvParser.withHeader).to.equal(true);
      });
      it('Setter throws error if new value is not boolean, undefined or null', () => {
        expect(() => {
          csvParser.withHeader = 5;
        }).to.throw(TypeError, 'Value of #withHeader property must be boolean, undefined or null.');
      });
    });
    describe('#withNull', () => {
      const csvParser = CsvParser();
      it('Getter returns false', () => {
        expect(csvParser).to.have.property('withNull', false);
      });
      it('Setter changes value of the property to true', () => {
        csvParser.withNull = true;
        expect(csvParser.withNull).to.equal(true);
      });
      it('Setter throws error if new value is not boolean, undefined or null', () => {
        expect(() => {
          csvParser.withNull = 5;
        }).to.throw(TypeError, 'Value of #withNull property must be boolean, undefined or null.');
      });
    });
  });
  describe('(arguments) - calling with arguments:', () => {
    describe('when arguments are wrong:', () => {
      it('throws error when argument is not boolean, undefined or null ({ withHeader: 5 })', () => {
        expect(() => CsvParser({ withHeader: 5 })).to.throw(TypeError, 'Value of #withHeader property must be boolean, undefined or null');
      });
      it('throws error when argument has wrong name ({ wrongName: true })', () => {
        expect(() => CsvParser({ wrongName: true })).to.throw(TypeError, '"wrongName" is not a name of property.');
      });
    });
    describe('when values of arguments are undefined or null', () => {
      const csvParser = CsvParser({ withHeader: undefined, withNull: null });
      it('creates object that is instance of Parser', () => {
        expect(csvParser).to.be.an('object').itself.be.an.instanceof(Parser);
      });
      it('value of #withHeader is false', () => {
        expect(csvParser.withHeader).to.equal(false);
      });
      it('value of #withNull is false', () => {
        expect(csvParser.withNull).to.equal(false);
      });
    });
    describe('when argument is { withHeader: true }', () => {
      const csvParser = CsvParser({ withHeader: true });
      it('creates object that is instance of Parser', () => {
        expect(csvParser).to.be.an('object').itself.be.an.instanceof(Parser);
      });
      it('value of #withHeader is true', () => {
        expect(csvParser.withHeader).to.equal(true);
      });
      it('value #withNull is false', () => {
        expect(csvParser.withNull).to.equal(false);
      });
    });
    describe('when arguments are { withHeader: true, withNull: true }', () => {
      const csvParser = CsvParser({ withHeader: true, withNull: true });
      it('creates object that is instance of Parser', () => {
        expect(csvParser).to.be.an('object').itself.be.an.instanceof(Parser);
      });
      it('Value of #withHeader is true', () => {
        expect(csvParser.withHeader).to.equal(true);
      });
      it('Value #withNull is true', () => {
        expect(csvParser.withHeader).to.equal(true);
      });
    });
  });
  describe('#makeDataTree', () => {
    describe('returns appropriate data tree:', () => {
      const csvParser = CsvParser();
      const csv = `field_name_1,"Field
Name 2",field_name_3 
"aaa","b 
,bb","ccc""ddd"
zzz,,""
1,2.2,
,3,
`;
      it('when #withHeader is false and #withNull is false', () => {
        expect(csvParser.withHeader).to.equal(false);
        expect(csvParser.withNull).to.equal(false);
        expect(csvParser.makeDataTree(csv)).to.eql(
          {
            records: [
              ['field_name_1', 'Field\nName 2', 'field_name_3 '],
              ['aaa', 'b \n,bb', 'ccc"ddd'],
              ['zzz', '', ''],
              [1, 2.2, ''],
              ['', 3, ''],
            ],
          },
        );
      });
      it('when #withHeader is true and #withNull is false', () => {
        csvParser.withHeader = true;
        expect(csvParser.withHeader).to.equal(true);
        expect(csvParser.withNull).to.equal(false);
        expect(csvParser.makeDataTree(csv)).to.eql(
          {
            header: ['field_name_1', 'Field\nName 2', 'field_name_3 '],
            records: [
              ['aaa', 'b \n,bb', 'ccc"ddd'],
              ['zzz', '', ''],
              [1, 2.2, ''],
              ['', 3, ''],
            ],
          },
        );
      });
      it('when #withHeader is false and #withNull is true', () => {
        csvParser.withHeader = false;
        csvParser.withNull = true;
        expect(csvParser.withHeader).to.equal(false);
        expect(csvParser.withNull).to.equal(true);
        expect(csvParser.makeDataTree(csv)).to.eql(
          {
            records: [
              ['field_name_1', 'Field\nName 2', 'field_name_3 '],
              ['aaa', 'b \n,bb', 'ccc"ddd'],
              ['zzz', null, ''],
              [1, 2.2, null],
              [null, 3, null],
            ],
          },
        );
      });
      it('when #withHeader is true and #withNull is true', () => {
        csvParser.withHeader = true;
        expect(csvParser.withHeader).to.equal(true);
        expect(csvParser.withNull).to.equal(true);
        expect(csvParser.makeDataTree(csv)).to.eql(
          {
            header: ['field_name_1', 'Field\nName 2', 'field_name_3 '],
            records: [
              ['aaa', 'b \n,bb', 'ccc"ddd'],
              ['zzz', null, ''],
              [1, 2.2, null],
              [null, 3, null],
            ],
          },
        );
      });
    });
    describe('returns appropriate data tree:', () => {
      const csvParser = CsvParser();
      const csv = '';
      it('when input is empty string', () => {
        expect(csvParser.makeDataTree(csv)).to.eql({ records: [['']] });
      });
    });
    describe('throws error:', () => {
      const csvParser = CsvParser();
      // const csvParser = CsvParser({ withHeader: true, withNull: true });
      it('throws error called without argument', () => {
        expect(() => csvParser.makeDataTree()).to.throw(TypeError, 'Value of argument must be string.');
      });
      it('when record has less fields then first record', () => {
        const csv = 'a,b,c\nzzz,""\n,,';
        expect(() => csvParser.makeDataTree(csv)).to.throw(RangeError, 'Error occured before field \'\' started at 13 character: last record has less fields than first record!');
      });
      it('when last record has less fields then first record', () => {
        const csv = 'a,b,c\nzzz,,""\n,';
        expect(() => csvParser.makeDataTree(csv)).to.throw(RangeError, 'Last record has less fields than first record');
      });
      it('when record has more fields then first record', () => {
        const csv = 'a,b,c\nzzz,,,""\n,,';
        expect(() => { csvParser.makeDataTree(csv); }).to.throw(RangeError, 'Index of curent field \'""\' started at 12 character is greater then number of fields in first record!');
      });
      it('when non-escaped field has double quote', () => {
        const csv = 'a,b,c\nzzz,",""\n,,';
        expect(() => { csvParser.makeDataTree(csv); }).to.throw(SyntaxError, 'Corrupted field \'",""\' starting at 10 character!');
      });
      it('when escaped field has extra characters after double quote', () => {
        const csv = 'a,b,c\nzzz,,""abc\n,,';
        expect(() => { csvParser.makeDataTree(csv); }).to.throw(SyntaxError, 'Corrupted field \'""abc\' starting at 11 character!');
      });
    });
  });
});
