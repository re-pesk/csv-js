import { describe, it } from 'mocha';
import { expect } from 'chai';
import { CsvParser } from '../src/CsvParser';

describe('CsvParser', () => {
  describe('() - calling without arguments:', () => {
    it('creates object with expected properties', () => {
      const csvParser = CsvParser();
      expect(csvParser).to.be.an('object');
      expect(csvParser).to.have.property('makeRecords');
      expect(csvParser).to.have.property('recordsToDataTree');
      expect(csvParser).to.have.property('makeDataTree');
    });
    describe('#parameters', () => {
      it('Getter returns object', () => {
        const csvParser = CsvParser();
        expect(csvParser).to.have.property('parameters');
        expect(csvParser.parameters).to.deep.equal({
          withHeader: false,
          withNull: false,
          withNumbers: false,
          withEmptyLine: false,
        });
      });
      it('Setter changes values of the parameters to true', () => {
        const csvParser = CsvParser();
        csvParser.parameters = {
          withHeader: true,
          withNull: true,
          withNumbers: true,
          withEmptyLine: true,
        };
        expect(csvParser.parameters).to.deep.equal({
          withHeader: true,
          withNull: true,
          withNumbers: true,
          withEmptyLine: true,
        });
      });
      it('Setter throws error if new value of parameter is not boolean, undefined or null', () => {
        const csvParser = CsvParser();
        expect(() => {
          csvParser.parameters = { withHeader: 5 };
        }).to.throw(TypeError, 'Value of #withHeader property must be boolean, undefined or null.');
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
      it('values of each parameter are false', () => {
        expect(csvParser.parameters).to.deep.equal({
          withHeader: false,
          withNull: false,
          withNumbers: false,
          withEmptyLine: false,
        });
      });
    });
    describe('when arguments are { withHeader: true, withNull: true, withNumbers: true, withEmptyLine: true }', () => {
      const csvParser = CsvParser({
        withHeader: true, withNull: true, withNumbers: true, withEmptyLine: true,
      });
      it('values of #withHeader, #withNull and #withNumbers are true', () => {
        expect(csvParser.parameters).to.deep.equal({
          withHeader: true,
          withNull: true,
          withNumbers: true,
          withEmptyLine: true,
        });
      });
    });
  });
  describe('#makeDataTree', () => {
    describe('returns appropriate data tree:', () => {
      const csv = `field_name_1,"Field\r
Name 2",field_name_3 \r
"aaa","b \r
,bb","ccc""ddd"\r
zzz,,""\r
1,2.2,\r
,3,`;
      const testDataList = [
        {
          it: 'when all parameters are false',
          parameters: {
            withHeader: false,
            withNull: false,
            withNumbers: false,
            withEmptyLine: false,
          },
          tree: {
            records: [
              ['field_name_1', '"Field\r\nName 2"', 'field_name_3 '],
              ['"aaa"', '"b \r\n,bb"', '"ccc""ddd"'],
              ['zzz', '', '""'],
              ['1', '2.2', ''],
              ['', '3', ''],
            ],
          },
        },
        {
          it: 'when #withHeader is true',
          parameters: {
            withHeader: true,
            withNull: false,
            withNumbers: false,
            withEmptyLine: false,
          },
          tree: {
            header: ['field_name_1', '"Field\r\nName 2"', 'field_name_3 '],
            records: [
              ['"aaa"', '"b \r\n,bb"', '"ccc""ddd"'],
              ['zzz', '', '""'],
              ['1', '2.2', ''],
              ['', '3', ''],
            ],
          },
        },
        {
          it: 'when #withNull is true',
          parameters: {
            withHeader: false,
            withNull: true,
            withNumbers: false,
            withEmptyLine: false,
          },
          tree: {
            records: [
              ['field_name_1', 'Field\r\nName 2', 'field_name_3 '],
              ['aaa', 'b \r\n,bb', 'ccc"ddd'],
              ['zzz', null, ''],
              ['1', '2.2', null],
              [null, '3', null],
            ],
          },
        },
        {
          it: 'when #withNumbers is true',
          parameters: {
            withHeader: false,
            withNull: false,
            withNumbers: true,
            withEmptyLine: false,
          },
          tree: {
            records: [
              ['field_name_1', '"Field\r\nName 2"', 'field_name_3 '],
              ['"aaa"', '"b \r\n,bb"', '"ccc""ddd"'],
              ['zzz', '', '""'],
              [1, 2.2, ''],
              ['', 3, ''],
            ],
          },
        },
        {
          it: 'when #withEmptyLine is true',
          parameters: {
            withHeader: false,
            withNull: false,
            withNumbers: false,
            withEmptyLine: true,
          },
          tree: {
            records: [
              ['field_name_1', '"Field\r\nName 2"', 'field_name_3 '],
              ['"aaa"', '"b \r\n,bb"', '"ccc""ddd"'],
              ['zzz', '', '""'],
              ['1', '2.2', ''],
              ['', '3', ''],
            ],
          },
        },
      ];
      testDataList.forEach(testData => it(
        testData.it,
        () => {
          const csvParser = CsvParser();
          csvParser.parameters = testData.parameters;
          expect(csvParser.parameters).to.deep.equal(testData.parameters);
          expect(csvParser.makeDataTree(csv)).to.deep.equal(testData.tree);
        },
      ));
    });
    describe('returns appropriate data tree:', () => {
      const csvParser = CsvParser();
      it('when input is empty string and #withHeader is false', () => {
        const csv = '';
        expect(csvParser.parameters.withHeader).to.equal(false);
        expect(csvParser.makeDataTree(csv)).to.deep.equal({ records: [['']] });
      });
      it('when input has only record and #withHeader is true', () => {
        const csv = 'field_name_1,"Field\r\nName 2",field_name_3 ';
        csvParser.parameters = { withHeader: true };
        expect(csvParser.parameters.withHeader).to.equal(true);
        expect(csvParser.makeDataTree(csv)).to.deep.equal({ header: ['field_name_1', '"Field\r\nName 2"', 'field_name_3 '] });
      });
    });
    describe('throws error:', () => {
      const csvParser = CsvParser({ withHeader: true, withNull: true });
      it('when called without argument', () => {
        expect(() => csvParser.makeDataTree()).to.throw(
          TypeError,
          'Value of argument must be string.',
        );
      });
      const testDataList = [
        {
          it: 'when record has less fields than first record',
          csv: 'a,b,c\r\nzzz,""\r\n,,',
          errorClass: RangeError,
          message: 'Record 1 has less fields than first record!',
        },
        {
          it: 'when last record has less fields than first record',
          csv: 'a,b,c\r\nzzz,,""\r\n,',
          errorClass: RangeError,
          message: 'Record 2 has less fields than first record!',
        },
        {
          it: 'when record has more fields than first record',
          csv: 'a,b,c\r\nzzz,,,""\r\n,,',
          errorClass: RangeError,
          message: 'Record 1 has more fields than first record!',
        },
        {
          it: 'when non-escaped field has double quote',
          csv: 'a,b,c\r\nzzz,","\r"\r\n,,',
          errorClass: SyntaxError,
          message: 'Record 1, field 1: \',","\\r"\' has corrupted end \'\\r"\' at position 4!',
        },
        {
          it: 'when escaped field has extra characters after double quote',
          csv: 'a,b,c\r\nzzz,,""\nabc\r\n,,',
          errorClass: SyntaxError,
          message: 'Record 1, field 2: \',""\\nabc\' has corrupted end \'\\nabc\' at position 3!',
        },
        {
          it: 'when field of header is empty',
          csv: ',b,c\r\nzzz,,""\r\n,,',
          errorClass: SyntaxError,
          message: 'Header of field 0 is empty!',
        },
        {
          it: 'when field of header is escaped empty string',
          csv: '"",b,c\r\nzzz,,""\r\n,,',
          errorClass: SyntaxError,
          message: 'Header of field 0 is escaped empty string!',
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
  describe('#makeRecords', () => {
    describe('returns appropriate data tree:', () => {
      const csvParser = CsvParser();
      it('when input is empty string and #withHeader is false', () => {
        const csv = '';
        expect(csvParser.parameters.withHeader).to.equal(false);
        expect(csvParser.makeRecords(csv)).to.deep.equal([[[['', 0], ['', 0], ['', 0], ['', 0]]]]);
      });
      it('when input is csv string and #withHeader is false', () => {
        const csv = 'abc,bcd,12+-\r\nbcd,,xxx=!';
        expect(csvParser.parameters.withHeader).to.equal(false);
        const result = [
          [[['abc', 0], ['', 0], ['abc', 0], ['', 3]],
            [[',bcd', 3], [',', 0], ['bcd', 1], ['', 4]],
            [[',12+-', 7], [',', 0], ['12+-', 1], ['', 5]],
          ],
          [[['\r\nbcd', 12], ['\r\n', 0], ['bcd', 2], ['', 5]],
            [[',', 17], [',', 0], ['', 1], ['', 1]],
            [[',xxx=!', 18], [',', 0], ['xxx=!', 1], ['', 6]],
          ],
        ];
        expect(csvParser.makeRecords(csv)).to.deep.equal(result);
      });
    });
  });
  describe('#checkRecords', () => {
    describe('returns appropriate data tree:', () => {
      const csvParser = CsvParser();
      it('when parameter #withEmptyLine is false', () => {
        const records = [
          [
            [["abc",0],["",0],["abc",0],["",3]],
            [[",bcd",3],[",",0],["bcd",1],["",4]],
            [[",12+-",7],[",",0],["12+-",1],["",5]]
          ],
          [
            [["\r\nbcd",12],["\r\n",0],["bcd",2],["",5]],
            [[",",17],[",",0],["",1],["",1]],
            [[",xxx=!",18],[",",0],["xxx=!",1],["",6]]
          ],
          [
            [["\r\n",24],["\r\n",0],["",2],["",2]]
          ]
        ];
        expect(csvParser.parameters.withHeader).to.equal(false);
        expect(csvParser.makeRecords(csv)).to.deep.equal([[[['', 0], ['', 0], ['', 0], ['', 0]]]]);
      });
      it('when input is csv string and #withHeader is false', () => {
        const csv = 'abc,bcd,12+-\r\nbcd,,xxx=!';
        expect(csvParser.parameters.withHeader).to.equal(false);
        const result = [
          [[['abc', 0], ['', 0], ['abc', 0], ['', 3]],
            [[',bcd', 3], [',', 0], ['bcd', 1], ['', 4]],
            [[',12+-', 7], [',', 0], ['12+-', 1], ['', 5]],
          ],
          [[['\r\nbcd', 12], ['\r\n', 0], ['bcd', 2], ['', 5]],
            [[',', 17], [',', 0], ['', 1], ['', 1]],
            [[',xxx=!', 18], [',', 0], ['xxx=!', 1], ['', 6]],
          ],
        ];
        expect(csvParser.makeRecords(csv)).to.deep.equal(result);
      });
    });
  });
});
