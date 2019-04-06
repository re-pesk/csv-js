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
      const csv = `field_name_1,"Field\r
Name 2",field_name_3 \r
"aaa","b \r
,bb","ccc""ddd"\r
zzz,,""\r
1,2.2,\r
,3,\r
`;
      const testDataList = [
        {
          it: 'when #withHeader is false and #withNull is false',
          withHeader: false,
          withNull: false,
          tree: {
            records: [
              ['field_name_1', 'Field\r\nName 2', 'field_name_3 '],
              ['aaa', 'b \r\n,bb', 'ccc"ddd'],
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
            header: ['field_name_1', 'Field\r\nName 2', 'field_name_3 '],
            records: [
              ['aaa', 'b \r\n,bb', 'ccc"ddd'],
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
              ['field_name_1', 'Field\r\nName 2', 'field_name_3 '],
              ['aaa', 'b \r\n,bb', 'ccc"ddd'],
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
            header: ['field_name_1', 'Field\r\nName 2', 'field_name_3 '],
            records: [
              ['aaa', 'b \r\n,bb', 'ccc"ddd'],
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
      it('when input is empty string and #withHeader is false', () => {
        const csv = '';
        expect(csvParser.withHeader).to.equal(false);
        expect(csvParser.makeDataTree(csv)).to.deep.equal({ records: [['']] });
      });
      it('when input has only record and #withHeader is true', () => {
        const csv = 'field_name_1,"Field\\nName 2",field_name_3 ';
        csvParser.withHeader = true;
        expect(csvParser.withHeader).to.equal(true);
        expect(csvParser.makeDataTree(csv)).to.deep.equal({ header: ['field_name_1', 'Field\\nName 2', 'field_name_3 '] });
      });
    });
    describe('throws error:', () => {
      const withHeader = true;
      const branch = withHeader ? 'header' : 'first record';
      // const csvParser = CsvParser();
      const csvParser = CsvParser({ withHeader: true, withNull: true });
      it('when called without argument', () => {
        expect(() => csvParser.makeDataTree()).to.throw(
          TypeError,
          'Value of argument must be string.',
        );
      });
      const testDataList = [
        {
          it: `when record has less fields than ${branch}`,
          csv: 'a,b,c\r\nzzz,""\r\n,,',
          errorClass: RangeError,
          message: `Record 2 has less fields than ${branch}!`,
        },
        {
          it: `when last record has less fields than ${branch}`,
          csv: 'a,b,c\r\nzzz,,""\r\n,',
          errorClass: RangeError,
          message: `Record 3 has less fields than ${branch}!`,
        },
        {
          it: `when record has more fields than ${branch}`,
          csv: 'a,b,c\r\nzzz,,,""\r\n,,',
          errorClass: RangeError,
          message: `Record 2 has more fields than ${branch}!`,
        },
        {
          it: 'when non-escaped field has double quote',
          csv: 'a,b,c\r\nzzz,","\r"\r\n,,',
          errorClass: SyntaxError,
          message: 'Record 2, field 2: \',","\\r"\' has corrupted end \'\\r"\' at position 4!',
        },
        {
          it: 'when escaped field has extra characters after double quote',
          csv: 'a,b,c\r\nzzz,,""\nabc\r\n,,',
          errorClass: SyntaxError,
          message: 'Record 2, field 3: \',""\\nabc\' has corrupted end \'\\nabc\' at position 3!',
        },
        {
          it: 'when #withHeader and #withNull are true and field of header is null',
          csv: ',b,c\r\nzzz,,""\r\n,,',
          errorClass: SyntaxError,
          message: 'Header of field 0 is null!',
        },
        {
          it: 'when #withHeader is true, #withNull is false and field of header is empty',
          parameters: { withNull: false },
          csv: ',b,c\r\nzzz,,""\r\n,,',
          errorClass: SyntaxError,
          message: 'Header of field 0 is empty!',
        },
      ];
      testDataList.forEach(testData => it(
        testData.it,
        () => {
          if (testData.parameters) {
            // eslint-disable-next-line no-shadow
            const { withHeader, withNull } = testData.parameters;
            if (withHeader !== undefined) {
              csvParser.withHeader = withHeader;
              expect(csvParser.withHeader).to.equal(withHeader);
            }
            if (withNull !== undefined) {
              csvParser.withNull = withNull;
              expect(csvParser.withNull).to.equal(withNull);
            }
          }
          expect(
            () => {
              csvParser.makeDataTree(testData.csv);
            },
          ).to.throw(testData.errorClass, testData.message); 
        },
      ));
    });
  });
});
