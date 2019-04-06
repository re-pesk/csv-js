const { Parser } = require('./Parser');

/*
const CR = '\r'; // '\x0D'
const LF = '\n'; // '\x0A'
const START = '^';
const COMMA = ',';
const DQUOTE = '"';
const CHARS = '[\x20-\xFE]';
const TEXTDATA = '(?:(?![' . DQUOTE . COMMA . '\x7F' . '])' . CHARS . ')';

const CRLF = CR . LF;
const CR_NOT_LF = CR . '(?!' . LF . ')';
const EOL = CRLF . '|' . CR . '|' . LF;
const DOUBLE_DQUOTE = DQUOTE . '{2}';

const NON_ESCAPED = '(?:' . CR_NOT_LF . '|' . LF . '|' .TEXTDATA . ')' . '+';
const ESCAPED = DQUOTE . '(?:' . DOUBLE_DQUOTE . '|' . TEXTDATA . '|' .  COMMA . '|' . CR . '|' . LF . ')*' . DQUOTE;

const HEAD = '(?:' . CRLF . '|' . COMMA . '|' . START . ')';
const TAIL = '(?:' . DQUOTE . '|' . CR_NOT_LF . '|[^' . CR . COMMA . '])*';
const BODY = '(?:' . ESCAPED . '|' . NON_ESCAPED . '|)';

const CSV_PATTERN = '/(?:' . HEAD . ')(?:' . BODY . ')(?:' . TAIL . ')/x';
const RECORD_PATTERN = '/^(' . HEAD . ')(' . BODY . ')(' . TAIL . ')$/x';

const SIGN = '[+-]?';
const DIGITS = '[0-9]+';
const INT_PATTERN = '/^' . SIGN . DIGITS . '$/';
const FLOAT_PATTERN = '/^' . SIGN . DIGITS . '\.' . DIGITS . '$/';

const EMPTY_PATTERN = '/^$/';
const OUTER_QUOTES = '/^"|"$/';
const INNER_QUOTES = '/""/';

*/

const CR = '\x0D'; // '\x0D' == '\r'
const LF = '\x0A'; // '\x0A' == '\n'
const START = '^';
const DQUOTE = '\x22'; // '\x22' == '"'
const COMMA = '\x2C'; // '\x2C' == ','
const CHARS = '[\x20-\xFE]';
const TEXTDATA = `(?:(?!['${DQUOTE}${COMMA}\x7F])${CHARS})`; // '\x7F' == DEL

const CRLF = `${CR}${LF}`;
const CR_NOT_LF = `${CR}(?!${LF})`;
const EOL = `${CRLF}$`;
const DOUBLE_DQUOTE = `${DQUOTE}{2}`;

const NON_ESCAPED = `(?:${CR_NOT_LF}|${LF}|${TEXTDATA})+`;
const ESCAPED = `${DQUOTE}(?:${DOUBLE_DQUOTE}|${TEXTDATA}|${COMMA}|${CR}|${LF})*${DQUOTE}`;

const HEAD = `(?:${CRLF}|${COMMA}|${START})`;
const TAIL = `(?:${DQUOTE}|${CR_NOT_LF}|[^${CR}${COMMA}])*`;
const BODY = `(?:${ESCAPED}|${NON_ESCAPED}|)`;

const CSV_PATTERN = `(?:${HEAD})(?:${BODY})(?:${TAIL})`;
const RECORD_PATTERN = `^(${HEAD})(${BODY})(${TAIL})$`;

const SIGN = '[+-]?';
const DIGITS = '[0-9]+';
const INT_PATTERN = `/^${SIGN}${DIGITS}$/`;
const FLOAT_PATTERN = `/^${SIGN}${DIGITS}\.${DIGITS}$/`;

const EMPTY_PATTERN = '^$';
const OUTER_QUOTES = `^${DQUOTE}|${DQUOTE}$`;
const INNER_QUOTES = DOUBLE_DQUOTE;


const csvPattern = new RegExp(CSV_PATTERN, 'g');

const replaceNl = new RegExp(`(${CR})|(${LF})`, 'g');

const lastEol = new RegExp(EOL);
const outerQuotesPattern = new RegExp(OUTER_QUOTES, 'g');
const innerQuotesPattern = new RegExp(INNER_QUOTES, 'g');
const emptyValuePattern = new RegExp(EMPTY_PATTERN, 'g');

const allowedProperties = ['withHeader', 'withNull'];

function splitTokenToParts(token) {
  const recPattern = new RegExp(RECORD_PATTERN, 'g');
  const headPattern = new RegExp(HEAD, 'g');
  const bodyPattern = new RegExp(`${HEAD}${BODY}`, 'g');
  const strings = recPattern.exec(token[0]);
  headPattern.exec(token[0]);
  bodyPattern.exec(token[0]);
  const parts = [
    [strings[0], token[1]],
    [strings[1], 0],
    [strings[2], headPattern.lastIndex],
    [strings[3], bodyPattern.lastIndex],
  ];
  return parts;
}


function replacer(match) {
  if (match === '\r') {
    return '\\r';
  }
  return '\\n';
}

function tokenize(inputStr) {
  const str = `\r\n${inputStr.replace(lastEol, '')}`;
  const tokens = [];
  let token;
  let index = 0;
  do {
    token = csvPattern.exec(str);
    if (token !== null) {
      token.push(index);
      index = csvPattern.lastIndex;
      const parts = splitTokenToParts(token);
      tokens.push(parts);
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
  if (withNull && emptyValuePattern.test(value)) {
    return null;
  }
  const newValue = value.replace(outerQuotesPattern, '');
  return newValue.replace(innerQuotesPattern, '"');
}

function tokensToDataTree(tokens, privateProperties) {
  const records = [];
  let fieldNo = 0;
  const { withHeader, withNull } = privateProperties;
  const branch = withHeader ? 'header' : 'first record';
  tokens.forEach((token) => {
    if (token[1][0] !== ',') {
      if (records.length > 1 && records[records.length - 1].length < records[0].length) {
        throw new RangeError(`Record ${records.length} has less fields than ${branch}!`);
      }
      records.push([]);
      fieldNo = 1;
    }
    if (token[3][0] !== '') {
      const fieldStr = replaceNl[Symbol.replace](token[0][0], replacer);
      const endStr = replaceNl[Symbol.replace](token[3][0], replacer);
      throw new SyntaxError(
        `Record ${records.length}, field ${fieldNo}: '${fieldStr}' has corrupted end '${endStr}' at position ${token[3][1]}!`,
      );
    }
    if (records.length > 1) {
      if (fieldNo > records[0].length) {
        throw new RangeError(`Record ${records.length} has more fields than ${branch}!`);
      }
    }

    const value = convertValue(token[2][0], withNull);
    records[records.length - 1].push(value);
    fieldNo += 1;
  });

  if (records[records.length - 1].length < records[0].length) {
    throw new RangeError(`Record ${records.length} has less fields than ${branch}!`);
  }

  const tree = {};
  if (withHeader) {
    tree.header = records.shift();
    tree.header.forEach((fieldName, index) => {
      if (fieldName === '') {
        throw new SyntaxError(`Header of field ${index} is empty!`);
      }
      if (fieldName === null) {
        throw new SyntaxError(`Header of field ${index} is null!`);
      }
    });
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
