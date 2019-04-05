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
      const testDataList = [
        {
          it: 'when #withHeader is false and #withNull is false',
          withHeader: false,
          withNull: false,
          tree: {
            records: [
              ['field_name_1', 'Field\nName 2', 'field_name_3 '],
              ['aaa', 'b \n,bb', 'ccc"ddd'],
              ['zzz', '', ''],
              [1, 2.2, ''],
              ['', 3, ''],
            ],
          },
        },
        {
          it: 'when #withHeader is true and #withNull is false',
          withHeader: true,
          withNull: false,
          tree: {
            header: ['field_name_1', 'Field\nName 2', 'field_name_3 '],
            records: [
              ['aaa', 'b \n,bb', 'ccc"ddd'],
              ['zzz', '', ''],
              [1, 2.2, ''],
              ['', 3, ''],
            ],
          },
        },
        {
          it: 'when #withHeader is false and #withNull is true',
          withHeader: false,
          withNull: true,
          tree: {
            records: [
              ['field_name_1', 'Field\nName 2', 'field_name_3 '],
              ['aaa', 'b \n,bb', 'ccc"ddd'],
              ['zzz', null, ''],
              [1, 2.2, null],
              [null, 3, null],
            ],
          },
        },
        {
          it: 'when #withHeader is true and #withNull is true',
          withHeader: true,
          withNull: true,
          tree: {
            header: ['field_name_1', 'Field\nName 2', 'field_name_3 '],
            records: [
              ['aaa', 'b \n,bb', 'ccc"ddd'],
              ['zzz', null, ''],
              [1, 2.2, null],
              [null, 3, null],
            ],
          },
        },
      ];
      testDataList.forEach(testData => it(
        testData.it,
        () => {
          csvParser.withHeader = testData.withHeader;
          csvParser.withNull = testData.withNull;
          expect(csvParser.withHeader).to.equal(testData.withHeader);
          expect(csvParser.withNull).to.equal(testData.withNull);
          expect(csvParser.makeDataTree(csv)).to.deep.equal(testData.tree);
        },
      ));
    });
    describe('returns appropriate data tree:', () => {
      const csvParser = CsvParser();
      const csv = '';
      it('when input is empty string', () => {
        expect(csvParser.makeDataTree(csv)).to.eql({ records: [['']] });
      });
    });
    describe('throws error:', () => {
      const withHeader = true;
      const branch = withHeader ? 'header' : 'first record';
      // const csvParser = CsvParser();
      const csvParser = CsvParser({ withHeader, withNull: true });
      it('throws error called without argument', () => {
        expect(() => csvParser.makeDataTree()).to.throw(
          TypeError,
          'Value of argument must be string.',
        );
      });
      const testDataList = [
        {
          it: `when record has less fields than ${branch}`,
          csv: 'a,b,c\nzzz,""\n,,',
          errorClass: RangeError,
          message: `Error occured before field '' started at 13 character: last record has less fields than ${branch}!`,
        },
        {
          it: `when last record has less fields than ${branch}`,
          csv: 'a,b,c\nzzz,,""\n,',
          errorClass: RangeError,
          message: `Last record has less fields than ${branch}!`,
        },
        {
          it: `when record has more fields than ${branch}`,
          csv: 'a,b,c\nzzz,,,""\n,,',
          errorClass: RangeError,
          message: `Index of curent field '""' started at 12 character is greater then number of fields in ${branch}!`,
        },
        {
          it: 'when non-escaped field has double quote',
          csv: 'a,b,c\nzzz,",""\n,,',
          errorClass: SyntaxError,
          message: 'Corrupted field \'",""\' starting at 10 character!',
        },
        {
          it: 'when escaped field has extra characters after double quote',
          csv: 'a,b,c\nzzz,,""abc\n,,',
          errorClass: SyntaxError,
          message: 'Corrupted field \'""abc\' starting at 11 character!',
        },
      ];
      testDataList.forEach(testData => it(
        testData.it,
        () => expect(() => csvParser.makeDataTree(testData.csv))
          .to.throw(testData.errorClass, testData.message),
      ));
    });
  });
});
