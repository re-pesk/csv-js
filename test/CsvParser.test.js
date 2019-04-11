/* eslint-disable camelcase */
import { describe, it } from 'mocha';
import { expect } from 'chai';
import {
  makeRecords, checkRecords, checkValues, recordsToDataTree, makeDataTree 
} from '../src/CsvParser';

import { escapeNL, indentString } from '../src/helpers';

describe('makeRecords\n', () => {
  const testDataList = {
    makeRecords: [
      {
        csv: '',
        it: '1 record x 1 field',
        records: [
          [
            [['', 0], ['', 0], ['', 0], ['', 0]],
          ],
        ],
      },
      {
        csv: '""',
        it: '1 record x 1 field with quoted value',
        records: [
          [
            [['""', 0], ['', 0], ['""', 0], ['', 2]],
          ],
        ],
      },
      {
        csv: ',',
        it: '1 record x 2 fields',
        records: [
          [
            [['', 0], ['', 0], ['', 0], ['', 0]],
            [[',', 0], [',', 0], ['', 1], ['', 1]],
          ],
        ],
      },
      {
        csv: '","',
        it: '1 record x 1 field with quoted value',
        records: [
          [
            [['","', 0], ['', 0], ['","', 0], ['', 3]],
          ],
        ],
      },
      {
        csv: '\r\n',
        it: '2 records x 1 field',
        records: [
          [
            [['', 0], ['', 0], ['', 0], ['', 0]],
          ], [
            [['\r\n', 0], ['\r\n', 0], ['', 2], ['', 2]],
          ],
        ],
      },
      {
        csv: '\r\n\r\n',
        it: '3 records x 1 field',
        records: [
          [[['', 0], ['', 0], ['', 0], ['', 0]]],
          [[['\r\n', 0], ['\r\n', 0], ['', 2], ['', 2]]],
          [[['\r\n', 2], ['\r\n', 0], ['', 2], ['', 2]]],
        ],
      },
      {
        csv: '"\r\n\r\n"',
        it: '1 record x 1 field with quoted value',
        records: [
          [[['"\r\n\r\n"', 0], ['', 0], ['"\r\n\r\n"', 0], ['', 6]]],
        ],
      },
      {
        csv: ',\r\n',
        it: '1 record x 2 fields + 1 record x 1 field',
        records: [
          [
            [['', 0], ['', 0], ['', 0], ['', 0]],
            [[',', 0], [',', 0], ['', 1], ['', 1]],
          ],
          [[['\r\n', 1], ['\r\n', 0], ['', 2], ['', 2]]],
        ],
      },
      {
        csv: '\n\r"abc"\r\r\n',
        it: '1 record x 1 corrupted field + 1 record x 1 normal field',
        records: [
          [[['\n\r"abc"\r', 0], ['', 0], ['\n\r', 0], ['"abc"\r', 2]]],
          [[['\r\n', 8], ['\r\n', 0], ['', 2], ['', 2]]],
        ],
      },
      {
        csv: '"abc"\n\r\r\n\n\r"abc"',
        it: '2 records x 1 corrupted field',
        records: [
          [[['"abc"\n\r', 0], ['', 0], ['"abc"', 0], ['\n\r', 5]]],
          [[['\r\n\n\r"abc"', 7], ['\r\n', 0], ['\n\r', 2], ['"abc"', 4]]],
        ],
      },
    ],
  };
  describe('throws error\n', () => {
    it(
      'when called without argument\n',
      () => expect(() => makeRecords()).to.throw(TypeError, 'Function "makeRecords": the argument "csv" must be string!'),
    );
  });
  describe('returns set of records that contains:\n', () => {
    testDataList.makeRecords.forEach((testData) => {
      const escapedStr = escapeNL(testData.csv);
      it(
        `${testData.it}\n          when argument 'csv' is '${escapedStr}'\n`,
        () => expect(makeRecords(testData.csv)).to.deep.equal(testData.records),
      );
    });
  });
});

/*
checkRecords
  throws error  
    when is called without arguments
      value of argument 'recordset' is undefined
    when argument 'recordset' gets value of a wrong type
      value is undefined
      value is not array
    when value of 'recordset' has a wrong structure
    when not all records has the same length 
  
*/

describe('checkRecords\n', () => {
  describe('throws error\n', () => {
    describe('when it is called without arguments\n', () => {
      it(
        'value of \'recordset\' is undefined\n',
        () => expect(() => checkRecords()).to.throw(TypeError, 'Function \'checkRecords\': value of \'recordSet\' must be an array!'),
      );
    });
    describe('when argument \'recordset\' gets value of a wrong type:\n', () => {
      const testDataList = [
        {
          it: 'value is undefined\n',
          records: undefined,
          message: 'Function \'checkRecords\': value of \'recordSet\' must be an array!',
        },
        {
          it: 'value is not an array\n',
          records: {},
          message: 'Function \'checkRecords\': value of \'recordSet\' must be an array!',
        },
      ];
      testDataList.forEach((testData) => {
        it(
          testData.it,
          () => expect(
            () => checkRecords(testData.records),
          ).to.throw(TypeError, testData.message),
        );
      });
    });
    describe('when value of \'recordset\' has a wrong structure:\n', () => {
      const testDataList = [
        {
          it: 'value is empty array\n',
          records: [],
          message: 'Function \'checkRecords\': value of \'recordSet\' cannot be empty array!',
        },
        {
          it: 'array contains record without fields\n',
          records: [[]],
          message: 'Function \'checkRecords\': record 0 have no fields!',
        },
        {
          it: 'array contains record that have an empty element\n',
          records: [[[]]],
          message: 'Function \'checkRecords\': item 0 of record 0 is not an field!',
        },
      ];
      testDataList.forEach((testData) => {
        it(
          testData.it,
          () => expect(
            () => checkRecords(testData.records),
          ).to.throw(TypeError, testData.message),
        );
      });
    });
    describe('when not all records in \'recordSet\' has the same length:\n', () => {
      const testDataList = [
        {
          it: 'record has more fields than first record\n',
          csv: '\r\n,',
          message: 'Function \'checkRecords\': record 1 has more fields than record 0!',
        },
        {
          it: 'record has less fields than first record\n',
          csv: ',\r\n\r\n',
          message: 'Function \'checkRecords\': record 1 has less fields than record 0!',
        },
        {
          it: 'the last record has has less fields than first record, but more than one\n',
          csv: ',,\r\n,',
          message: 'Function \'checkRecords\': the last record 1 has less fields than record 0, but more than 1!',
        },
        {
          it: 'the last record has only one field, but parameter \'withEmptyLine\' is set to \'false\':\n',
          csv: ',\r\n',
          withEmptyLine: false,
          message: 'Function \'checkRecords\': the last record 1 has only one field, but \'withEmptyLine\' is set to false!',
        },
        {
          it: 'parameter \'withEmptyLine\' is set to \'true\', the only field of the last record 1 is not empty:\n',
          withEmptyLine: true,
          csv: ',\r\na',
          message: 'Function \'checkRecords\': the only field of the last record 1 is not empty!',
        },
      ];
      testDataList.forEach((testData) => {
        const records = makeRecords(testData.csv);
        const { withEmptyLine } = testData;
        it(testData.it, () => {
          if (withEmptyLine === undefined) {
            expect(() => checkRecords(records)).to.throw(TypeError, testData.message);  
          } else {
            expect(() => checkRecords(records, { withEmptyLine })).to.throw(TypeError, testData.message);
          }
        });
      });
    });
  });
});
describe('checkValues\n', () => {
  describe('throws error\n', () => {
    describe('when records contains wrong data:\n', () => {
      const testDataList = [
        {
          csv: 'abc"',
          message: 'Record 0, field 0: \'abc"\' has corrupted end \'"\' at position 3!',
        },
        {
          csv: '"abc""',
          message: 'Record 0, field 0: \'"abc""\' has corrupted end \'"\' at position 5!',
        },
        {
          csv: ',\r\n',
          message: 'Record 1 has less fields than record 0!',
        },
      ];
      testDataList.forEach((testData) => {
        const escCsv = escapeNL(testData.csv);
        const records = makeRecords(testData.csv);
        it(`csv == '${escCsv}' ->\n${indentString('records ==', 6)}\n${indentString(JSON.stringify(records), 7)}\n`, () => {
          expect(() => checkRecords(records)).to.throw(TypeError, testData.message);
        });
      });
    });
  });
});


/* describe('CsvParser', () => {
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
      it('when input is empty string', () => {
        const csv = '';
        expect(csvParser.makeRecords(csv)).to.deep.equal([[[['', 0], ['', 0], ['', 0], ['', 0]]]]);
      });
      it('when input is csv string', () => {
        const csv = 'abc,bcd,12+-\r\nbcd,,xxx=!';
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
            [['abc', 0], ['', 0], ['abc', 0], ['', 3]],
            [[',bcd', 3], [',', 0], ['bcd', 1], ['', 4]],
            [[',12+-', 7], [',', 0], ['12+-', 1], ['', 5]],
          ],
          [
            [['\r\nbcd', 12], ['\r\n', 0], ['bcd', 2], ['', 5]],
            [[',', 17], [',', 0], ['', 1], ['', 1]],
            [[',xxx=!', 18], [',', 0], ['xxx=!', 1], ['', 6]],
          ],
          [
            [['\r\n', 24], ['\r\n', 0], ['', 2], ['', 2]],
          ],
        ];
        expect(csvParser.parameters.withEmptyLine).to.equal(false);
        expect(() => csvParser.checkRecords(records)).to.throw(RangeError, 'Record 2 has less fields than first record!');
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
}); */
