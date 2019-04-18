/* eslint-disable camelcase */
const { describe, it } = require('mocha');
const { expect } = require('chai');
const {
  makeRecords, checkRecords, checkValues, recordsToDataTree, makeDataTree,
} = require('../src/CsvParsing');
const {
  escapeNl, indent, indentString, indentJson,
} = require('../src/helpers');

describe('makeRecords\n', () => {
  describe('throws error\n', () => {
    it(
      'when called without argument\n',
      () => expect(() => makeRecords()).to.throw(TypeError, 'Function \'makeRecords\': value of \'csvString\' must be a string!'),
    );
  });
  describe('returns set of records that contains:\n', () => {
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
          expect(makeRecords(testData.csv)).to.deep.equal(testData.expected);
        },
      );
    });
  });
});

describe('checkRecords\n', () => {
  describe('throws error\n', () => {
    describe('when it is called without arguments\n', () => {
      it(
        'value of \'recordSet\' is undefined\n',
        () => expect(() => checkRecords()).to.throw(TypeError, 'Function \'checkRecords\': value of \'recordSet\' must be an array!'),
      );
    });
    describe('when argument \'recordSet\' gets value of a wrong type:\n', () => {
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
    describe('when value of \'recordSet\' has a wrong structure:\n', () => {
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
      ];
      testDataList.forEach((testData) => {
        const records = makeRecords(testData.csv);
        const parameters = { withEmptyLine: testData.withEmptyLine || false };
        it(testData.it, () => {
          expect(
            () => {
              checkRecords(records, parameters);
            },
          ).to.throw(TypeError, testData.message);
        });
      });
    });
  });
});

describe('checkValues\n', () => {
  describe('throws error\n', () => {
    describe('when function is called without arguments\n', () => {
      it('value of \'recordSet\' is undefined\n', () => {
        expect(() => checkValues()).to.throw(TypeError, 'Function \'checkValues\': value of \'recordSet\' must be an array!');
      });
    });
    describe('when records contains wrong data:\n', () => {
      const testDataList = [
        {
          it: '\'abc"\' has corrupted end \'"\' at position 3!',
          csv: 'abc"',
          message: 'Function \'checkValues\': record 0, field 0: \'abc"\' has corrupted end \'"\' at position 3!',
        },
        {
          it: '\'"abc""\' has corrupted end \'"\' at position 5!',
          csv: '"abc""',
          message: 'Function \'checkValues\': record 0, field 0: \'"abc""\' has corrupted end \'"\' at position 5!',
        },
        {
          it: 'parameter \'withEmptyLine\' is set to \'true\', but the only field of the last record 1 is not empty:',
          csv: ',\r\na',
          withEmptyLine: true,
          message: 'Function \'checkValues\': when \'withEmptyLine\' is set to true, the only field of the last record 1 is not empty!',
        },
      ];
      testDataList.forEach((testData) => {
        const escCsv = escapeNl(testData.csv);
        const records = makeRecords(testData.csv);
        const parameters = { withEmptyLine: testData.withEmptyLine || false };
        it(`${testData.it}\n${indentString(`csv == '${escCsv}' ->\nrecords ==`, 6)}\n${indentJson(records, 7)}\n`, () => {
          expect(() => {
            checkValues(records, parameters);
          }).to.throw(TypeError, testData.message);
        });
      });
    });
  });
});

describe('recordsToDataTree\n', () => {
  describe('throws error\n', () => {
    const testDataList = [
      {
        it: 'when called without argument',
        recordSet: undefined,
        message: 'Function \'recordsToDataTree\': value of \'recordSet\' must be an array!',
      },
      {
        it: 'when argument \'recordSet\' has not valid structure',
        recordSet: [[[['', 0], ['', 0], ['', 0], ['']]]],
        message: 'Function \'recordsToDataTree\': item 3 of field 0 of record 0 is not a part of field!',
      },
      {
        it: 'when argument \'parameters\' is not object',
        recordSet: [[[['', 0], ['', 0], ['', 0], ['', 0]]]],
        parameters: [],
        message: 'Function \'recordsToDataTree\': value of \'parameters\' must be an Object!',
      },
      {
        it: 'when the argument \'recordSet\' has non-allowed data',
        recordSet: [[[['a"', 0], ['', 0], ['a', 0], ['"', 1]]]],
        message: 'Function \'recordsToDataTree\': record 0, field 0: \'a"\' has corrupted end \'"\' at position 1!',
      },
    ];
    testDataList.forEach((testData) => {
      it(`${testData.it}\n`, () => {
        const { recordSet, parameters } = testData;
        if (!recordSet) {
          expect(() => recordsToDataTree()).to.throw(TypeError, testData.message);
        } else if (!parameters) {
          expect(() => recordsToDataTree(recordSet)).to.throw(TypeError, testData.message);
        } else {
          expect(() => recordsToDataTree(recordSet, parameters))
            .to.throw(TypeError, testData.message);
        }
      });
    });
  });
  // describe('returns appropriate data tree\n', () => {

  // });
});

describe('makeDataTree\n', () => {
  describe('throws error\n', () => {
    it(
      'when called without argument\n',
      () => expect(() => makeDataTree()).to.throw(TypeError, 'Function \'makeDataTree\': value of \'csvString\' must be a string!'),
    );
    it(
      'when argument \'parameters\' is not object\n',
      () => expect(() => makeDataTree('', [])).to.throw(TypeError, 'Function \'makeDataTree\': value of \'parameters\' must be an Object!'),
    );
    it(
      'when argument \'parameters\' has member with name that is not in allowed parameters list\n',
      () => expect(() => makeDataTree('', { notAllowedName: true }))
        .to.throw(
          TypeError,
          'Function \'makeDataTree\': the object int the \'parameters\' argument has a member \'notAllowedName\' which is not included in the list of allowed parameters!',
        ),
    );
    it(
      'when argument \'parameters\' has member with non-boolean value\n',
      () => expect(() => makeDataTree('', { withHeader: 1 }))
        .to.throw(
          TypeError,
          'Function \'makeDataTree\': value of parameter \'withHeader\' is not boolean!',
        ),
    );
    it(
      'when csv string has corrupted records and fields\n',
      () => expect(() => makeDataTree('a"\n\r')).to.throw(TypeError, 'Function \'recordsToDataTree\': record 0, field 0: \'a"\\n\\r\' has corrupted end \'"\\n\\r\' at position 1!'),
    );
    describe('parameter \'withHeader\' equals to true\n', () => {
      it(
        'and csv string has empty non-escaped fields in the first record\n',
        () => expect(() => makeDataTree('a,,b', { withHeader: true })).to.throw(TypeError, 'Function \'recordsToDataTree\': header of field 1 is non-escaped empty string!'),
      );
      it(
        'and csv string has empty escaped fields in the first record\n',
        () => expect(() => makeDataTree('a,"",b', { withHeader: true })).to.throw(TypeError, 'Function \'recordsToDataTree\': header of field 1 is escaped empty string!'),
      );
    });
  });
  describe('parses csv string and creates appropriate data tree\n', () => {
    describe(`when all parameters are equal to false\n${indent('  ', 4)}and csv string:\n`, () => {
      const testDataList = [
        {
          it: 'is empty string',
          csv: '',
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
          expected: { records: [['a'], ['b'], ['']] },
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
          expect(makeDataTree(testData.csv)).to.deep.equal(testData.expected);
        });
      });
    });
    describe(`when parameter 'withHeader' equals to true\n${indent('  ', 4)}and csv string:\n`, () => {
      it('has first record with no empty fields\n', () => {
        const expected = { header: ['a', 'b', 'c'] };
        expect(makeDataTree('a,b,c', { withHeader: true })).to.deep.equal(expected);
      });
    });
    describe(`when parameter 'withNull' equals to true\n${indent('  ', 4)}and csv string:\n`, () => {
      it('has empty non-escaped field, escaped field and field with double comma inside\n', () => {
        const expected = { records: [[null, '', '"']] };
        expect(makeDataTree(',"",""""', { withNull: true })).to.deep.equal(expected);
      });
    });
    describe(`when parameter 'withNumber' equals to true\n${indent('  ', 4)}and csv string:\n`, () => {
      it('has fields, consisting of digits and one point only\n', () => {
        const expected = { records: [[1, 1.1]] };
        expect(makeDataTree('1,1.1', { withNumbers: true })).to.deep.equal(expected);
      });
    });
    describe(`when parameter 'withEmptyLine' equals to true\n${indent('  ', 4)}and csv string:\n`, () => {
      it('has first records with several fields and record separator at very end of string\n', () => {
        const expected = { records: [['a', 'b'], ['']] };
        expect(makeDataTree('a,b\r\n', { withEmptyLine: true })).to.deep.equal(expected);
      });
    });
    describe(`when parameter 'ignoreCorruptedData' equals to true\n${indent('  ', 4)}and csv string:\n`, () => {
      it('has a non-escaped field corrupted at the end of it\n', () => {
        const expected = { records: [['a']] };
        expect(makeDataTree('a"', { ignoreCorruptedData: true })).to.deep.equal(expected);
      });
      it('has a escaped field corrupted at the end of it\n', () => {
        const expected = { records: [['"a"']] };
        expect(makeDataTree('"a"b', { ignoreCorruptedData: true })).to.deep.equal(expected);
      });
    });
  });
});
