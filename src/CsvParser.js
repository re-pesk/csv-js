/* eslint-disable prefer-template */
const { Parser } = require('./Parser');

const CR = '\\r';
const LF = '\\n';
const NL = '^';
const COMMA = ',';
const DQUOTE = '"';
const TEXTDATA = '[ -!]|[#-+]|[--~]';

const CRLF = CR + LF;
const EOL = CRLF + '|' + CR + '|' + LF;
const DOUBLE_DQUOTE = DQUOTE + '{2}';

const NON_ESCAPED = '(?:' + TEXTDATA + ')+';
const ESCAPED = DQUOTE + '(?:' + TEXTDATA + '|' + COMMA + '|' + CR + '|' + LF + '|' + DOUBLE_DQUOTE + ')*' + DQUOTE;

const CSV_PATTERN = '(' + EOL + '|' + COMMA + '|' + NL + ')(' + ESCAPED + '|' + NON_ESCAPED + ')?';
const csvRegexp = new RegExp(CSV_PATTERN, 'gm');

const rSeparator = /^,|\r\n|\r|\n/;
const rOuterQuotes = /^"|"$/g;
const rInnerQuotes = /""/g;
const rEmptyValue = /^$/;

function tokenize(csv) {
  // eslint-disable-next-line quotes
  const data = "\n" + csv.trim();
  const tokens = data.match(csvRegexp);
  return tokens;
}

function convertValue(value, withNull) {
  if (!Number.isNaN(Number.parseFloat(value))) {
    return parseFloat(value);
  }
  if (!Number.isNaN(Number.parseInt(value, 10))) {
    return parseInt(value, 10);
  }
  if (typeof value === 'string') {
    if (withNull && rEmptyValue.test(value)) {
      return null;
    }
    const newValue = value.replace(rOuterQuotes, '');
    return newValue.replace(rInnerQuotes, '"');
  }
  return value;
}

function tokensToDataTree(tokens, privateProperties) {
  const tree = { records: [] };
  let withHeader = privateProperties.with_header;
  let fillingHeader = false;
  tokens.forEach((member) => {
    const match = member.match(rSeparator);
    if (match[0] !== ',') {
      if (withHeader) {
        withHeader = false;
        fillingHeader = true;
        tree.header = [];
      } else {
        fillingHeader = false;
        tree.records.push([]);
      }
    }

    let value = member.substring(match[0].length);

    value = convertValue(value, privateProperties.with_null);

    if (fillingHeader) {
      tree.header.push(value);
    } else {
      tree.records[tree.records.length - 1].push(value);
    }
  });

  return tree;
}

function CsvParser(with_header = false, with_null = false) {
  const privateProperties = {
    with_header,
    with_null,
  };

  class CsvParserClass extends Parser {
    constructor(_with_header = false, _with_null = false) {
      super();
      this.withHeader(_with_header);
      this.withNull(_with_null);
    }

    static inputType() {
      return 'csv';
    }

    // eslint-disable-next-line class-methods-use-this
    withHeader(value) {
      if (typeof value !== 'boolean') {
        throw new TypeError('Value must be boolean');
      }
      privateProperties.with_header = value;
    }

    // eslint-disable-next-line class-methods-use-this
    withNull(value) {
      if (typeof value !== 'boolean') {
        throw new TypeError('Value must be boolean');
      }
      privateProperties.with_null = value;
    }

    // eslint-disable-next-line class-methods-use-this
    makeDataTree(data) {
      const tokens = tokenize(data);
      const dataTree = tokensToDataTree(tokens, privateProperties);
      return dataTree;
    }
  }

  return new CsvParserClass(with_header, with_null);
}

module.exports = { CsvParser };
