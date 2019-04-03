const { Parser } = require('./Parser');

const CR = '\\r';
const LF = '\\n';
const NL = '^';
const COMMA = ',';
const DQUOTE = '"';
const TEXTDATA = '[\x20-!#-+--~]';

const CRLF = CR + LF;
const EOL = `${CRLF}|${CR}|${LF}`;
const DOUBLE_DQUOTE = `${DQUOTE}{2}`;

const NON_ESCAPED = `${TEXTDATA}+`;
const ESCAPED = `${DQUOTE}(?:${TEXTDATA}|${COMMA}|${CR}|${LF}|${DOUBLE_DQUOTE})*${DQUOTE}`;

const CSV_PATTERN = `(${EOL}|${COMMA}|${NL})(${ESCAPED}|${NON_ESCAPED})?`;
const csvRegexp = new RegExp(CSV_PATTERN, 'g');

const rSeparator = /^,|\r\n|\r|\n/;
const rOuterQuotes = /^"|"$/g;
const rInnerQuotes = /""/g;
const rEmptyValue = /^$/;

const allowedProperties = ['withHeader', 'withNull'];

function tokenize(csv) {
  // eslint-disable-next-line quotes
  const data = `\n${csv.trim()}`;
  const tokens = data.match(csvRegexp);
  return tokens;
}

function convertValue(value, withNull) {
  if (!Number.isNaN(Number.parseFloat(value))) {
    if (value.indexOf('.') !== -1) {
      return Number.parseFloat(value);
    }
    return Number.parseInt(value, 10);
  }
  if (withNull && rEmptyValue.test(value)) {
    return null;
  }
  const newValue = value.replace(rOuterQuotes, '');
  return newValue.replace(rInnerQuotes, '"');
}

function tokensToDataTree(tokens, privateProperties) {
  const header = [];
  const records = [];
  let recordno = -1;
  const { withHeader, withNull } = privateProperties;
  tokens.forEach((member) => {
    const match = member.match(rSeparator);
    if (match[0] !== ',') {
      if (!withHeader && recordno < 0) {
        recordno = 0;
      }
      recordno += 1;
      if (recordno > 0) {
        records.push([]);
      }
    }

    let value = member.substring(match[0].length);

    value = convertValue(value, withNull);

    if (recordno < 1) {
      header.push(value);
    } else {
      records[records.length - 1].push(value);
    }
  });

  const tree = {};
  if (withHeader) {
    tree.header = header;
  }
  tree.records = records;
  return tree;
}

function makeDataTree(data, privateProperties) {
  if (typeof data !== 'string') {
    throw TypeError('Value of argument must be string.');
  }
  const tokens = tokenize(data);
  const dataTree = tokensToDataTree(tokens, privateProperties);
  return dataTree;
}

function setBooleanProperty(propertyName, value, privateProperties) {
  if (!['boolean', 'undefined'].includes(typeof value) && value !== null) {
    throw new TypeError(`Value of #${propertyName} property must be boolean, undefined or null.`);
  }
  // eslint-disable-next-line no-param-reassign
  privateProperties[propertyName] = value || false;
}

function setProperties(properties, privateProperties) {
  Object.getOwnPropertyNames(properties).forEach((name) => {
    if (!allowedProperties.includes(name)) {
      throw new TypeError(`"${name}" is not a name of property.`);
    }
    setBooleanProperty(name, properties[name], privateProperties);
  });
}

// Constructor
function CsvParser(properties = {}) {
  const privateProperties = {
    withHeader: false,
    withNull: false,
  };
  setProperties(properties, privateProperties);

  const csvParser = Object.seal(
    Object.create(
      Object.defineProperties(
        Object.create(Parser.prototype),
        {
          inputType: {
            value: 'csv',
          },
          withHeader: {
            get: () => privateProperties.withHeader,
            set: value => setBooleanProperty('withHeader', value, privateProperties),
          },
          withNull: {
            get: () => privateProperties.withNull,
            set: value => setBooleanProperty('withNull', value, privateProperties),
          },
          makeDataTree: {
            value: data => makeDataTree(data, privateProperties),
          },
        },
      ),
    ),
  );

  return csvParser;
}

module.exports = { CsvParser };
