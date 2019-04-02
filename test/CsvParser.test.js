const { describe, it } = require('mocha');
const should = require('chai').should();
const { Parser } = require('../src/Parser');
const { CsvParser } = require('../src/CsvParser');

const csv = `field_name_1,"Field
Name 2",field_name_3 
"aaa","b 
,bb","ccc""ddd"
zzz,,""
1,2.2,
,3,
`;

describe('CsvParser', () => {
  describe('() - calling without arguments:', () => {
    it('Calling creates object that is instance of Parser', () => {
      const csvParser = CsvParser();
      csvParser.should.be.an('object').itself.be.an.instanceof(Parser);
    });
    describe('#inputType', () => {
      const csvParser = CsvParser();
      it('Value of the property is "csv"', () => {
        csvParser.should.have.property('inputType', 'csv');
      });
      it('The property is not writable', () => {
        csvParser.inputType = 'abc';
        csvParser.should.have.property('inputType', 'csv');
      });
    });
    describe('#withHeader', () => {
      const csvParser = CsvParser();
      it('Getter returns false', () => {
        csvParser.should.have.property('withHeader', false);
      });
      it('Setter changes value of the property to true', () => {
        csvParser.withHeader = true;
        csvParser.withHeader.should.equal(true);
      });
      it('Setter throws error if new value has not allowed type', () => {
        (() => {
          csvParser.withHeader = 5;
        }).should.throw(TypeError, 'Value of #withHeader property must be boolean, undefined or null.');
      });
    });
    describe('#withNull', () => {
      const csvParser = CsvParser();
      it('Getter returns false', () => {
        csvParser.should.have.property('withNull', false);
      });
      it('Setter changes value of the property to true', () => {
        csvParser.withNull = true;
        csvParser.withNull.should.equal(true);
      });
      it('Setter throws error if new value has not allowed type', () => {
        (() => {
          csvParser.withNull = 5;
        }).should.throw(TypeError, 'Value of #withNull property must be boolean, undefined or null.');
      });
    });
  });
  describe('(arguments) - calling with arguments:', () => {
    describe('when arguments are wrong:', () => {
      it('throws error when argument has wrong type ({ withHeader: 5 })', () => {
        (() => CsvParser({ withHeader: 5 })).should.throw(TypeError, 'Value of #withHeader property must be boolean, undefined or null');
      });
      it('throws error when argument has wrong name ({ wrongName: true })', () => {
        (() => CsvParser({ wrongName: true })).should.throw(TypeError, '"wrongName" is not a name of property.');
      });
    });
    describe('when values of arguments are undefined or null', () => {
      const csvParser = CsvParser({ withHeader: undefined, withNull: null });
      it('creates object that is instance of Parser', () => {
        csvParser.should.be.an('object').itself.be.an.instanceof(Parser);
      });
      it('value of #withHeader is false', () => {
        csvParser.withHeader.should.equal(false);
      });
      it('value of #withNull is false', () => {
        csvParser.withNull.should.equal(false);
      });
    });
    describe('when argument is { withHeader: true }', () => {
      const csvParser = CsvParser({ withHeader: true });
      it('creates object that is instance of Parser', () => {
        csvParser.should.be.an('object').itself.be.an.instanceof(Parser);
      });
      it('value of #withHeader is true', () => {
        csvParser.withHeader.should.equal(true);
      });
      it('value #withNull is false', () => {
        csvParser.withNull.should.equal(false);
      });
    });
    describe('when arguments are { withHeader: true, withNull: true }', () => {
      const csvParser = CsvParser({ withHeader: true, withNull: true });
      it('creates object that is instance of Parser', () => {
        csvParser.should.be.an('object').itself.be.an.instanceof(Parser);
      });
      it('Value of #withHeader are true', () => {
        csvParser.withHeader.should.equal(true);
      });
      it('Value #withNull are true', () => {
        csvParser.withHeader.should.equal(true);
      });
    });
  });
  describe('#makeDataTree', () => {
    const csvParser = CsvParser();
    it('throws error called without argument', () => {
      (() => csvParser.makeDataTree()).should.throw(TypeError, 'Value of argument must be string.');
    });
    describe('returns appropriate data tree:', () => {
      it('when #withHeader is false and #withNull is false', () => {
        csvParser.withHeader.should.equal(false);
        csvParser.withNull.should.equal(false);
        csvParser.makeDataTree(csv).should.eql({
          records: [
            [
              'field_name_1',
              'Field\nName 2',
              'field_name_3',
            ],
            [
              'aaa',
              'b \n,bb',
              'ccc"ddd',
            ],
            [
              'zzz',
              '',
              '',
            ],
            [
              1,
              2.2,
              '',
            ],
            [
              '',
              3,
              '',
            ],
          ],
        });
      });
      it('when #withHeader is true and #withNull is false', () => {
        csvParser.withHeader = true;
        csvParser.withHeader.should.equal(true);
        csvParser.withNull.should.equal(false);
        csvParser.makeDataTree(csv).should.eql({
          header: [
            'field_name_1',
            'Field\nName 2',
            'field_name_3',
          ],
          records: [
            [
              'aaa',
              'b \n,bb',
              'ccc"ddd',
            ],
            [
              'zzz',
              '',
              '',
            ],
            [
              1,
              2.2,
              '',
            ],
            [
              '',
              3,
              '',
            ],
          ],
        });
      });
      it('when #withHeader is false and #withNull is true', () => {
        csvParser.withHeader = false;
        csvParser.withNull = true;
        csvParser.withHeader.should.equal(false);
        csvParser.withNull.should.equal(true);
        csvParser.makeDataTree(csv).should.eql({
          records: [
            [
              'field_name_1',
              'Field\nName 2',
              'field_name_3',
            ],
            [
              'aaa',
              'b \n,bb',
              'ccc"ddd',
            ],
            [
              'zzz',
              null,
              '',
            ],
            [
              1,
              2.2,
              null,
            ],
            [
              null,
              3,
              null,
            ],
          ],
        });
      });
      it('when #withHeader is true and #withNull is true', () => {
        csvParser.withHeader = true;
        csvParser.withHeader.should.equal(true);
        csvParser.withNull.should.equal(true);
        csvParser.makeDataTree(csv).should.eql({
          header: [
            'field_name_1',
            'Field\nName 2',
            'field_name_3',
          ],
          records: [
            [
              'aaa',
              'b \n,bb',
              'ccc"ddd',
            ],
            [
              'zzz',
              null,
              '',
            ],
            [
              1,
              2.2,
              null,
            ],
            [
              null,
              3,
              null,
            ],
          ],
        });
      });
    });
  });
});
