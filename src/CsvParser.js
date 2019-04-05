const { Parser } = require('./Parser');

const CR = '\\r';
const LF = '\\n';
const START_OF_LINE = '^';
const COMMA = ',';
const DQUOTE = '"';
const TEXTDATA = '[\x20-!#-+--~]';

const SEPARATOR = `${CR}${LF}|${CR}|${LF}|${COMMA}|${START_OF_LINE}`;
const DOUBLE_DQUOTE = `${DQUOTE}{2}`;

const NON_ESCAPED = `${TEXTDATA}+`;
const ESCAPED = `${DQUOTE}(?:${DOUBLE_DQUOTE}|${TEXTDATA}|${COMMA}|${CR}|${LF})*${DQUOTE}`;
const CORRUPTED_TAIL = `(?:${DQUOTE}|[^${DQUOTE}${COMMA}${CR}${LF}])*`;

const CSV_PATTERN = `(${SEPARATOR})(${ESCAPED}|${NON_ESCAPED}|)(${CORRUPTED_TAIL})`;

const csvRegexp = new RegExp(CSV_PATTERN, 'g');

const lastEol = new RegExp(`${CR}${LF}|${CR}|${LF}$`);
const rOuterQuotes = /^"|"$/g;
const rInnerQuotes = /""/g;
const rEmptyValue = /^$/;

const allowedProperties = ['withHeader', 'withNull'];

function tokenize(inputStr) {
  // eslint-disable-next-line quotes
  // const data = `\n${csv.trim()}`;
  const str = inputStr.replace(lastEol, '');
  if (str === '') {
    return [csvRegexp.exec(str)];
  }
  const tokens = [];
  let token;
  do {
    token = csvRegexp.exec(str);
    if (token !== null) {
      tokens.push(token);
    }
  } while (token !== null);
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
  const records = [];
  let fieldNo = 0;
  const { withHeader, withNull } = privateProperties;
  const branch = withHeader ? 'header' : 'first record';
  tokens.forEach((token) => {
    if (token[3] !== '') {
      throw new SyntaxError(`Corrupted field '${token[2]}${token[3]}' starting at ${token.index + token[1].length} character!`);
    }
    if (token[1] !== ',') {
      if (records.length > 1 && records[records.length - 1].length < records[0].length) {
        throw new RangeError(`Error occured before field '${token[2]}${token[3]}' started at ${token.index + token[1].length} character: last record has less fields than ${branch}!`);
      }
      records.push([]);
      fieldNo = 1;
    }

    if (records.length > 1) {
      if (fieldNo > records[0].length) {
        throw new RangeError(`Index of curent field '${token[2]}${token[3]}' started at ${token.index + token[1].length} character is greater then number of fields in ${branch}!`);
      }
    }

    const value = convertValue(token[2], withNull);
    records[records.length - 1].push(value);
    fieldNo += 1;
  });

  if (records[records.length - 1].length < records[0].length) {
    throw new RangeError(`Last record has less fields than ${branch}!`);
  }

  const tree = {};
  if (withHeader) {
    tree.header = records.shift();
  }
  if (records.length > 0) {
    tree.records = records;
  }
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
