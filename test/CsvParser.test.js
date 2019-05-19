const { describe, it } = require('mocha');
const { expect } = require('chai');
const { CsvParser } = require('../src/CsvParser');
const {
  escapeNl, indent, indentString, indentJson,
} = require('../src/helpers');

describe('CsvParser\n', () => {
  describe('::()\n', () => {
    describe('calling without arguments\n', () => {
      it('creates object with all parameters equal to default value (false)\n', () => {
        const csvParser = CsvParser();
        expect(csvParser).to.be.an('object');
        expect(csvParser.constructor.name).to.equal('CsvParser');
        expect(csvParser.parameters).to.deep.equal(Object.seal({
          hasHeader: false,
          convertToNull: false,
          convertToNumber: false,
          preserveEmptyLine: false,
          ignoreInvalidChars: false,
        }));
      });
    });
    describe('calling with argument \'parameters\'\n', () => {
      it(' creates object with parameters different from default value\n', () => {
        const csvParser = CsvParser({
          hasHeader: true,
          convertToNull: true,
          convertToNumber: true,
          preserveEmptyLine: true,
          ignoreInvalidChars: true,
        });
        expect(csvParser).to.be.an('object');
        expect(csvParser.constructor.name).to.equal('CsvParser');
        expect(csvParser.parameters).to.deep.equal(Object.seal({
          hasHeader: true,
          convertToNull: true,
          convertToNumber: true,
          preserveEmptyLine: true,
          ignoreInvalidChars: true,
        }));
      });
    });
  });
  describe('assigning value to property \'.parameters\'\n', () => {
    describe('throws error\n', () => {
      const csvParser = CsvParser();
      it(
        'when argument \'parameters\' is not an object\n',
        () => expect(() => {
          csvParser.parameters = [];
        }).to.throw(TypeError, 'Argument \'parameters\' must be an Object!'),
      );
      it(
        'when argument \'parameters\' has a member that is not an allowed parameter!\n',
        () => expect(() => { csvParser.parameters = { notAllowedName: true }; }).to.throw(
          TypeError,
          'The parser cannot have parameter with name \'notAllowedName\'!',
        ),
      );
      it(
        'when argument \'parameters\' has member with non-boolean value\n',
        () => expect(() => { csvParser.parameters = { hasHeader: 1 }; }).to.throw(
          TypeError,
          'The value of parameter \'hasHeader\' is not a boolean!',
        ),
      );
    });
    describe('sets parameters of object to new values\n', () => {
      it('when parameters object was valid\n', () => {
        const csvParser = CsvParser();
        csvParser.parameters = {
          hasHeader: true,
          convertToNull: true,
          convertToNumber: true,
          preserveEmptyLine: true,
          ignoreInvalidChars: true,
        };
        expect(csvParser.parameters).to.deep.equal({
          hasHeader: true,
          convertToNull: true,
          convertToNumber: true,
          preserveEmptyLine: true,
          ignoreInvalidChars: true,
        });
      });
    });
  });
  describe('.makeRecords()\n', () => {
    describe('throws error\n', () => {
      const csvParser = CsvParser();
      it(
        'when called without argument\n',
        () => expect(() => csvParser.makeRecords()).to.throw(TypeError, 'Argument \'csvString\' must be a string!'),
      );
    });
    describe('returns set of records that contains:\n', () => {
      const csvParser = CsvParser();
      const testDataList = {
        makeRecords: [
          {
            csv: '',
            it: '1 record x 1 field',
            expected: [
              [
                [['', 0], ['', 0], ['', 0], ['', 0]],
              ],
            ],
          },
          {
            csv: '""',
            it: '1 record x 1 field with quoted value',
            expected: [
              [
                [['""', 0], ['', 0], ['""', 0], ['', 2]],
              ],
            ],
          },
          {
            csv: ',',
            it: '1 record x 2 fields',
            expected: [
              [
                [['', 0], ['', 0], ['', 0], ['', 0]],
                [[',', 0], [',', 0], ['', 1], ['', 1]],
              ],
            ],
          },
          {
            csv: '","',
            it: '1 record x 1 field with quoted value',
            expected: [
              [
                [['","', 0], ['', 0], ['","', 0], ['', 3]],
              ],
            ],
          },
          {
            csv: '\r\n',
            it: '2 records x 1 field',
            expected: [
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
            expected: [
              [[['', 0], ['', 0], ['', 0], ['', 0]]],
              [[['\r\n', 0], ['\r\n', 0], ['', 2], ['', 2]]],
              [[['\r\n', 2], ['\r\n', 0], ['', 2], ['', 2]]],
            ],
          },
          {
            csv: '"\r\n\r\n"',
            it: '1 record x 1 field with quoted value',
            expected: [
              [[['"\r\n\r\n"', 0], ['', 0], ['"\r\n\r\n"', 0], ['', 6]]],
            ],
          },
          {
            csv: ',\r\n',
            it: '1 record x 2 fields + 1 record x 1 field',
            expected: [
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
            expected: [
              [[['\n\r"abc"\r', 0], ['', 0], ['\n\r', 0], ['"abc"\r', 2]]],
              [[['\r\n', 8], ['\r\n', 0], ['', 2], ['', 2]]],
            ],
          },
          {
            csv: '"abc"\n\r\r\n\n\r"abc"',
            it: '2 records x 1 corrupted field',
            expected: [
              [[['"abc"\n\r', 0], ['', 0], ['"abc"', 0], ['\n\r', 5]]],
              [[['\r\n\n\r"abc"', 7], ['\r\n', 0], ['\n\r', 2], ['"abc"', 4]]],
            ],
          },
        ],
      };
      testDataList.makeRecords.forEach((testData) => {
        it(
          `${testData.it}\n${indent('  ', 5)}when argument 'csv' is '${escapeNl(testData.csv)}'\n`,
          () => {
            expect(csvParser.makeRecords(testData.csv)).to.deep.equal(testData.expected);
          },
        );
      });
    });
  });
  describe('.checkRecords()\n', () => {
    const csvParser = CsvParser();
    describe('throws error\n', () => {
      describe('when it is called without arguments\n', () => {
        it(
          'value of \'recordSet\' is undefined\n',
          () => expect(() => csvParser.checkRecords()).to.throw(TypeError, 'Argument \'recordSet\' must be an array!'),
        );
      });
      describe('when argument \'recordSet\' gets value of a wrong type:\n', () => {
        const testDataList = [
          {
            it: 'value is undefined\n',
            records: undefined,
            message: 'Argument \'recordSet\' must be an array!',
          },
          {
            it: 'value is not an array\n',
            records: {},
            message: 'Argument \'recordSet\' must be an array!',
          },
        ];
        testDataList.forEach((testData) => {
          it(
            testData.it,
            () => expect(
              () => csvParser.checkRecords(testData.records),
            ).to.throw(TypeError, testData.message),
          );
        });
      });
      describe('when value of \'recordSet\' has a wrong structure:\n', () => {
        const testDataList = [
          {
            it: 'value is empty array\n',
            records: [],
            message: 'Argument \'recordSet\' cannot be empty array!',
          },
          {
            it: 'array contains record without fields\n',
            records: [[]],
            message: 'Record #0 have no fields!',
          },
          {
            it: 'array contains record that have an empty element\n',
            records: [[[]]],
            message: 'Item #0 of record #0 is not a field!',
          },
        ];
        testDataList.forEach((testData) => {
          it(
            testData.it,
            () => expect(
              () => csvParser.checkRecords(testData.records),
            ).to.throw(TypeError, testData.message),
          );
        });
      });
      describe('when not all records in \'recordSet\' has the same length:\n', () => {
        const testDataList = [
          {
            it: 'record has more fields than first record\n',
            csv: '\r\n,',
            message: 'Record #1 has more fields than record #0!',
          },
          {
            it: 'record has less fields than first record\n',
            csv: ',\r\n\r\n',
            message: 'Record #1 has less fields than record #0!',
          },
          {
            it: 'the last record has has less fields than first record, but more than one\n',
            csv: ',,\r\n,',
            message: 'The last record #1 has less fields than record #0, but more than 1!',
          },
          {
            it: 'the first record has several fields, but the only field of the last record is not empty\n',
            csv: ',\r\na',
            message: 'The only field of the last record #1 is not empty, when the first record has several fields!',
          },
        ];
        testDataList.forEach((testData) => {
          const records = csvParser.makeRecords(testData.csv);
          it(testData.it, () => {
            expect(
              () => {
                csvParser.checkRecords(records);
              },
            ).to.throw(TypeError, testData.message);
          });
        });
      });
    });
  });
  describe('.checkValues()\n', () => {
    const csvParser = CsvParser();
    describe('throws error\n', () => {
      describe('when function is called without arguments\n', () => {
        it('value of \'recordSet\' is undefined\n', () => {
          expect(() => csvParser.checkValues()).to.throw(TypeError, 'Argument \'recordSet\' must be an array!');
        });
      });
      describe('when records contains wrong data:\n', () => {
        const testDataList = [
          {
            it: '\'abc"\' has invalid end \'"\' at position 3!',
            csv: 'abc"',
            message: 'Record #0, field #0: \'abc"\' has invalid end \'"\' at position 3!',
          },
          {
            it: '\'"abc""\' has invalid end \'"\' at position 5!',
            csv: '"abc""',
            message: 'Record #0, field #0: \'"abc""\' has invalid end \'"\' at position 5!',
          },
          {
            it: 'the first record has several fields, but the only field of the last record 1 is not empty:',
            csv: ',\r\na',
            message: 'The only field of the last record #1 is not empty, when the first record has several fields',
          },
        ];
        testDataList.forEach((testData) => {
          const escCsv = escapeNl(testData.csv);
          const records = csvParser.makeRecords(testData.csv);
          it(`${testData.it}\n${indentString(`csv == '${escCsv}' ->\nrecords ==`, 6)}\n${indentJson(records, 7)}\n`, () => {
            expect(() => {
              csvParser.checkValues(records);
            }).to.throw(TypeError, testData.message);
          });
        });
      });
    });
  });
  describe('.recordsToDataTree()\n', () => {
    const csvParser = CsvParser();
    describe('throws error\n', () => {
      const testDataList = [
        {
          it: 'when called without argument',
          recordSet: undefined,
          message: 'Argument \'recordSet\' must be an array!',
        },
        {
          it: 'when argument \'recordSet\' has not valid structure',
          recordSet: [[[['', 0], ['', 0], ['', 0], ['']]]],
          message: 'Item #3 of field #0 of record #0 is not a part of field!',
        },
        {
          it: 'when the argument \'recordSet\' has non-allowed data',
          recordSet: [[[['a"', 0], ['', 0], ['a', 0], ['"', 1]]]],
          message: 'Record #0, field #0: \'a"\' has invalid end \'"\' at position 1!',
        },
      ];
      testDataList.forEach((testData) => {
        it(`${testData.it}\n`, () => {
          if (!testData.recordSet) {
            expect(() => csvParser.recordsToDataTree()).to.throw(TypeError, testData.message);
          } else {
            expect(() => csvParser.recordsToDataTree(testData.recordSet))
              .to.throw(TypeError, testData.message);
          }
        });
      });
    });
  });
  describe('.makeDataTree()\n', () => {
    describe('throws error\n', () => {
      const csvParser = CsvParser();
      it(
        'when called without argument\n',
        () => expect(() => csvParser.makeDataTree()).to.throw(TypeError, 'Argument \'csvString\' must be a string!'),
      );
      it(
        'when csv string has invalid records and fields\n',
        () => expect(() => csvParser.makeDataTree('a"\n\r')).to.throw(TypeError, 'Record #0, field #0: \'a"\\n\\r\' has invalid end \'"\\n\\r\' at position 1!'),
      );
      describe('parameter \'hasHeader\' equals to true\n', () => {
        csvParser.parameters = { hasHeader: true };
        it(
          'and csv string has empty non-escaped fields in the first record\n',
          () => expect(() => csvParser.makeDataTree('a,,b')).to.throw(TypeError, 'Value of header field #1 is non-escaped empty string!'),
        );
        it(
          'and csv string has empty escaped fields in the first record\n',
          () => expect(() => csvParser.makeDataTree('a,"",b')).to.throw(TypeError, 'Value of header field #1 is escaped empty string!'),
        );
      });
    });
    describe('parses csv string and creates appropriate data tree\n', () => {
      describe(`when all parameters are equal to false\n${indent('  ', 5)}and csv string:\n`, () => {
        const csvParser = CsvParser();
        const testDataList = [
          {
            it: 'is empty string',
            csv: '',
            expected: { records: [['']] },
          },
          {
            it: 'is a string with two empty lines',
            csv: '\r\n',
            expected: { records: [['']] },
          },
          {
            it: 'has one non-escaped field',
            csv: 'a',
            expected: { records: [['a']] },
          },
          {
            it: 'has three fields',
            csv: ',b,3',
            expected: { records: [['', 'b', '3']] },
          },
          {
            it: 'has three records each with one empty field',
            csv: 'a\r\nb\r\n',
            expected: { records: [['a'], ['b']] },
          },
          {
            it: 'has one escaped field',
            csv: '"a"',
            expected: { records: [['"a"']] },
          },
          {
            it: 'has two records and each of them has two fields',
            csv: 'a,b\r\nc,d',
            expected: { records: [['a', 'b'], ['c', 'd']] },
          },
          {
            it: 'has escaped field containing field and record separators and double comma inside',
            csv: '"a,""\r\n"',
            expected: { records: [['"a,""\r\n"']] },
          },
        ];
        testDataList.forEach((testData) => {
          it(`${testData.it} '${escapeNl(testData.csv)}'\n'`, () => {
            expect(csvParser.makeDataTree(testData.csv)).to.deep.equal(testData.expected);
          });
        });
      });
      describe(`when parameter 'hasHeader' equals to true\n${indent('  ', 5)}and csv string:\n`, () => {
        const csvParser = CsvParser({ hasHeader: true });
        it('has first record with no empty fields\n', () => {
          const expected = { header: ['a', 'b', 'c'] };
          expect(csvParser.makeDataTree('a,b,c')).to.deep.equal(expected);
        });
      });
      describe(`when parameter 'convertToNull' equals to true\n${indent('  ', 5)}and csv string:\n`, () => {
        const csvParser = CsvParser({ convertToNull: true });
        it('has empty non-escaped field, escaped field and field with double comma inside\n', () => {
          const expected = { records: [[null, '', '"']] };
          expect(csvParser.makeDataTree(',"",""""')).to.deep.equal(expected);
        });
      });
      describe(`when parameter 'convertToNumber' equals to true\n${indent('  ', 5)}and csv string:\n`, () => {
        const csvParser = CsvParser({ convertToNumber: true });
        it('has fields, consisting of digits and one point only\n', () => {
          const expected = { records: [[1, 1.1]] };
          expect(csvParser.makeDataTree('1,1.1')).to.deep.equal(expected);
        });
      });
      describe(`when parameter 'preserveEmptyLine' equals to true\n${indent('  ', 5)}and csv string:\n`, () => {
        const csvParser = CsvParser({ preserveEmptyLine: true });
        it('has first records with several fields and record separator at very end of string\n', () => {
          const expected = { records: [['a', 'b'], ['']] };
          expect(csvParser.makeDataTree('a,b\r\n', { preserveEmptyLine: true })).to.deep.equal(expected);
        });
      });
      describe(`when parameter 'ignoreInvalidChars' equals to true\n${indent('  ', 5)}and csv string:\n`, () => {
        const csvParser = CsvParser({ ignoreInvalidChars: true });
        it('has a non-escaped field corrupted at the end of it\n', () => {
          const expected = { records: [['a']] };
          expect(csvParser.makeDataTree('a"')).to.deep.equal(expected);
        });
        it('has a escaped field corrupted at the end of it\n', () => {
          const expected = { records: [['"a"']] };
          expect(csvParser.makeDataTree('"a"b')).to.deep.equal(expected);
        });
      });
    });
  });
});
