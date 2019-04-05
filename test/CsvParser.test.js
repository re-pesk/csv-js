/* eslint-disable no-undef */
const { Parser } = require('../src/Parser');
const { CsvParser } = require('../src/CsvParser');

describe('CsvParser', () => {
  describe('() - calling without arguments:', () => {
    it('creates object that is instance of Parser', () => {
      const csvParser = CsvParser();
      expect(csvParser).toBeInstanceOf(Parser);
    });
    describe('#inputType', () => {
      const csvParser = CsvParser();
      it('Value of the property is "csv"', () => {
        expect(csvParser).toHaveProperty('inputType', 'csv');
      });
      it('The property is not writable', () => {
        csvParser.inputType = 'abc';
        expect(csvParser).toHaveProperty('inputType', 'csv');
      });
    });
    describe('#withHeader', () => {
      const csvParser = CsvParser();
      it('Getter returns false', () => {
        expect(csvParser).toHaveProperty('withHeader', false);
      });
      it('Setter changes value of the property to true', () => {
        csvParser.withHeader = true;
        expect(csvParser.withHeader).toStrictEqual(true);
      });
      it('Setter throws error if new value is not boolean, undefined or null', () => {
        expect(() => {
          csvParser.withHeader = 5;
        }).toThrow(TypeError, 'Value of #withHeader property must be boolean, undefined or null.');
      });
    });
    describe('#withNull', () => {
      const csvParser = CsvParser();
      it('Getter returns false', () => {
        expect(csvParser).toHaveProperty('withNull', false);
      });
      it('Setter changes value of the property to true', () => {
        csvParser.withNull = true;
        expect(csvParser.withNull).toStrictEqual(true);
      });
      it('Setter throws error if new value is not boolean, undefined or null', () => {
        expect(() => {
          csvParser.withNull = 5;
        }).toThrow(TypeError, 'Value of #withNull property must be boolean, undefined or null.');
      });
    });
  });
  describe('(arguments) - calling with arguments:', () => {
    describe('when arguments are wrong:', () => {
      it('throws error when argument is not boolean, undefined or null ({ withHeader: 5 })', () => {
        expect(() => CsvParser({ withHeader: 5 })).toThrow(TypeError, 'Value of #withHeader property must be boolean, undefined or null');
      });
      it('throws error when argument has wrong name ({ wrongName: true })', () => {
        expect(() => CsvParser({ wrongName: true })).toThrow(TypeError, '"wrongName" is not a name of property.');
      });
    });
    describe('when values of arguments are undefined or null', () => {
      const csvParser = CsvParser({ withHeader: undefined, withNull: null });
      it('creates object that is instance of Parser', () => {
        expect(csvParser).toBeInstanceOf(Parser);
      });
      it('value of #withHeader is false', () => {
        expect(csvParser.withHeader).toStrictEqual(false);
      });
      it('value of #withNull is false', () => {
        expect(csvParser.withNull).toStrictEqual(false);
      });
    });
    describe('when argument is { withHeader: true }', () => {
      const csvParser = CsvParser({ withHeader: true });
      it('creates object that is instance of Parser', () => {
        expect(csvParser).toBeInstanceOf(Parser);
      });
      it('value of #withHeader is true', () => {
        expect(csvParser.withHeader).toStrictEqual(true);
      });
      it('value #withNull is false', () => {
        expect(csvParser.withNull).toStrictEqual(false);
      });
    });
    describe('when arguments are { withHeader: true, withNull: true }', () => {
      const csvParser = CsvParser({ withHeader: true, withNull: true });
      it('creates object that is instance of Parser', () => {
        expect(csvParser).toBeInstanceOf(Parser);
      });
      it('Value of #withHeader is true', () => {
        expect(csvParser.withHeader).toStrictEqual(true);
      });
      it('Value #withNull is true', () => {
        expect(csvParser.withHeader).toStrictEqual(true);
      });
    });
  });
  describe('#makeDataTree', () => {
    describe('returns appropriate data tree:', () => {
      const csvParser = CsvParser();
      const csv = 'field_name_1,"Field\\nName 2",field_name_3 \n"aaa","b \\n,bb","ccc""ddd"\nzzz,,""\n1,2.2,\n,3,\n';
      const testDataList = [
        {
          it: 'when #withHeader is false and #withNull is false',
          withHeader: false,
          withNull: false,
          tree: {
            records: [
              ['field_name_1', 'Field\\nName 2', 'field_name_3 '],
              ['aaa', 'b \\n,bb', 'ccc"ddd'],
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
            header: ['field_name_1', 'Field\\nName 2', 'field_name_3 '],
            records: [
              ['aaa', 'b \\n,bb', 'ccc"ddd'],
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
              ['field_name_1', 'Field\\nName 2', 'field_name_3 '],
              ['aaa', 'b \\n,bb', 'ccc"ddd'],
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
            header: ['field_name_1', 'Field\\nName 2', 'field_name_3 '],
            records: [
              ['aaa', 'b \\n,bb', 'ccc"ddd'],
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
          expect(csvParser.withHeader).toStrictEqual(testData.withHeader);
          expect(csvParser.withNull).toStrictEqual(testData.withNull);
          expect(csvParser.makeDataTree(csv)).toEqual(testData.tree);
        },
      ));
    });
    describe('returns appropriate data tree:', () => {
      const csvParser = CsvParser({ withHeader: true });
      it('when input is empty string and #withHeader and #withNull are false', () => {
        const csv = '';
        expect(csvParser.makeDataTree(csv)).toEqual({ header: [''] });
      });
      it('when input has only one record and #withHeader and #withNull are false', () => {
        const csv = 'field_name_1,"Field\\nName 2",field_name_3 ';
        expect(csvParser.makeDataTree(csv)).toStrictEqual({ header: ['field_name_1', 'Field\\nName 2', 'field_name_3 '] });
      });
    });
    describe('throws error:', () => {
      const withHeader = true;
      const branch = withHeader ? 'header' : 'first record';
      // const csvParser = CsvParser();
      const csvParser = CsvParser({ withHeader, withNull: true });
      it('throws error called without argument', () => {
        expect(() => csvParser.makeDataTree()).toThrow(
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
          .toThrow(testData.errorClass, testData.message),
      ));
    });
  });
});
