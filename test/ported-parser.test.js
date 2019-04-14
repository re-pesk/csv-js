const {expect} = require('chai');
const {CsvParser} = require('../src/CsvParser');

describe('[Ported tests from https://github.com/ralekna/csv-parser]', () => {

  const parser = new CsvParser();
  parser.withHeader = false;
  const parse = csv => {
    const {records} = parser.makeDataTree(csv);
    return records;
  }

  it('should parse single comma separated line', () => {
    expect(parse(`aaa,bbb,ccc`)).to.be.deep.equal([['aaa', 'bbb', 'ccc']]);
  });

  it('should parse single comma separated line with numbers and special chars', () => {
    expect(parse(`111,@@@,...`)).to.be.deep.equal([[111, '@@@', '...']]);
  });

  it('should parse single comma separated line with quotes', () => {
    expect(parse(`"aaa","bbb","ccc"`)).to.be.deep.equal([['aaa', 'bbb', 'ccc']]);
  });

  it('should parse multiple comma separated line', () => {
    expect(parse(`aaa,bbb,ccc \r\nddd,eee,fff`)).to.be.deep.equal([['aaa', 'bbb', 'ccc '], ['ddd', 'eee', 'fff']]);

  });

  it('should parse single comma separated line with quotes and linebreaks inside', () => {
    expect(parse(`"aaa","b \r\nbb","ccc"`)).to.be.deep.equal([['aaa', 'b \r\nbb', 'ccc']]);
  });

  it('should parse mixed line with quotes and linebreaks inside', () => {
    expect(parse(`aaa,"b \r\nbb","ccc"\r\nddd,"eee",fff`)).to.be.deep.equal([['aaa', 'b \r\nbb', 'ccc'], ['ddd', 'eee', 'fff']]);
  });

});