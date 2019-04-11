const CR = '\x0D'; // '\x0D' == '\r'
const LF = '\x0A'; // '\x0A' == '\n'
const START = '^';
const DQUOTE = '\x22'; // '\x22' == '"'
const COMMA = '\x2C'; // '\x2C' == ','
const DEL = '\x7F';
const CHARS = '[\x20-\xFE]';
const TEXTDATA = `(?:(?!['${DQUOTE}${COMMA}${DEL}])${CHARS})`; // '\x7F' == DEL

const CRLF = `${CR}${LF}`;
const CR_NOT_LF = `${CR}(?!${LF})`;
const DOUBLE_DQUOTE = `${DQUOTE}{2}`;

const NON_ESCAPED = `(?:${CR_NOT_LF}|${LF}|${TEXTDATA})+`;
const ESCAPED = `${DQUOTE}(?:${DOUBLE_DQUOTE}|${TEXTDATA}|${COMMA}|${CR}|${LF})*${DQUOTE}`;

const HEAD_WO_START = `(?:${CRLF}|${COMMA})`;
const HEAD = `(?:${CRLF}|${COMMA}|${START})`;
const BODY = `(?:${ESCAPED}|${NON_ESCAPED}|)`;
const HEAD_BODY = `(?:${HEAD}${BODY})`;
const TAIL = `(?:${DQUOTE}|${CR_NOT_LF}|[^${CR}${COMMA}])*`;

const CSV_PATTERN = `(?:${HEAD_WO_START})(?:${BODY})(?:${TAIL})`;
const CSV_PATTERN_START = `(?:${HEAD})(?:${BODY})(?:${TAIL})`;
const RECORD_PATTERN = `^(${HEAD})(${BODY})(${TAIL})$`;

const EMPTY_PATTERN = '^$';
const OUTER_QUOTES = `^${DQUOTE}|${DQUOTE}$`;
const INNER_QUOTES = DOUBLE_DQUOTE;


const csvPatternWoStart = new RegExp(CSV_PATTERN, 'g');
const csvPattern = new RegExp(CSV_PATTERN_START, 'g');

const replaceNl = new RegExp(`(${CR})|(${LF})`, 'g');

const outerQuotesPattern = new RegExp(OUTER_QUOTES, 'g');
const innerQuotesPattern = new RegExp(INNER_QUOTES, 'g');
const emptyValuePattern = new RegExp(EMPTY_PATTERN, 'g');

function splitTokenToParts(token) {
  const recPattern = new RegExp(RECORD_PATTERN, 'g');
  const headPattern = new RegExp(HEAD, 'g');
  const bodyPattern = new RegExp(HEAD_BODY, 'g');
  const strings = recPattern.exec(token[0]);
  headPattern.exec(token[0]);
  bodyPattern.exec(token[0]);
  const parts = [
    token,
    [strings[1], 0],
    [strings[2], headPattern.lastIndex],
    [strings[3], bodyPattern.lastIndex],
  ];
  return parts;
}


function tokenize(inputStr) {
  // const str = `${inputStr.replace(lastEol, '')}`;
  const str = inputStr;
  if (str === '') {
    return [[['', 0], ['', 0], ['', 0], ['', 0]]];
  }
  const tokens = [];
  let pattern = csvPattern;
  if (/^,/.test(str)) {
    tokens.push([['', 0], ['', 0], ['', 0], ['', 0]]);
    pattern = csvPatternWoStart;
  }
  let token;
  let index = 0;
  do {
    token = pattern.exec(str);
    if (token !== null) {
      token.push(index);
      index = pattern.lastIndex;
      const parts = splitTokenToParts(token);
      tokens.push(parts);
    }
  } while (token !== null);
  return tokens;
}

function convertValue(value, withNull, withNumbers) {
  const isNaN = Number.isNaN(Number.parseFloat(value));
  if (withNumbers && !Number.isNaN(Number.parseFloat(value))) {
    if (value.indexOf('.') !== -1) {
      return Number.parseFloat(value);
    }
    return Number.parseInt(value, 10);
  }
  if (!withNull) {
    return value;
  }
  if (emptyValuePattern.test(value)) {
    return null;
  }
  const newValue = value.replace(outerQuotesPattern, '');
  return newValue.replace(innerQuotesPattern, '"');
}

function replacer(match) {
  if (match === '\r') {
    return '\\r';
  }
  return '\\n';
}

function checkRecords(records, privateProperties) {
  const { withHeader, withEmptyLine } = privateProperties;
  const fieldCount = records[0].length;
  records.forEach((record, recordNo) => {
    record.forEach((field, fieldNo) => {
      if (field[3][0] !== '') {
        const fieldStr = replaceNl[Symbol.replace](field[0][0], replacer);
        const endStr = replaceNl[Symbol.replace](field[3][0], replacer);
        throw new SyntaxError(
          `Record ${recordNo}, field ${fieldNo}: '${fieldStr}' has corrupted end '${endStr}' at position ${field[3][1]}!`,
        );
      }
    });
    if (withHeader && recordNo < 1) {
      record.forEach((field, fieldNo) => {
        if (field[2][0] === '') {
          throw new SyntaxError(`Header of field ${fieldNo} is empty!`);
        }
        if (field[2][0] === '""') {
          throw new SyntaxError(`Header of field ${fieldNo} is escaped empty string!`);
        }
      });
    }
    if (recordNo > 0) {
      if (record.length > fieldCount) {
        throw new RangeError(`Record ${recordNo} has more fields than first record!`);
      } else if (record.length < fieldCount) {
        if (!withEmptyLine || record.length > 1) {
          throw new RangeError(`Record ${recordNo} has less fields than first record!`);
        } else if (record[0][1][0] !== '\r\n' || record[0][2][0] !== '' || record[0][3][0] !== ''
          || record[0][1][1] !== 0 || record[0][2][1] !== 2 || record[0][3][1] !== 2) {
          throw new RangeError(`Record ${recordNo} has less fields than first record!`);
        }
      }
    }
  });
  return true;
}

function tokensToRecords(tokens) {
  const records = [];

  tokens.forEach((token) => {
    if (token[1][0] !== ',') {
      records.push([token]);
    } else {
      records[records.length - 1].push(token);
    }
  });

  return records;
}

function recordsToDataTree(records, privateProperties) {
  const { withHeader, withNull, withNumbers, withEmptyLine } = privateProperties;
  let filteredRecords = records;
  if (!withEmptyLine) {
    filteredRecords = records.filter((record, recordNo) => {
      return (recordNo < records.length - 1) || (record.length > 1)
      || (record[0][1][0] !== '\r\n') || (record[0][2][0] !== '') || (record[0][3][0] !== '')
      || (record[0][1][1] !== 0) || (record[0][2][1] !== 2) || (record[0][3][1] !== 2)
      || records[0].length < 2;
    });
  }
  const dataRecords = filteredRecords.map(
    record => record.map(field => convertValue(field[2][0], withNull, withNumbers)),
  );
  const tree = {};
  if (withHeader) {
    tree.header = dataRecords.shift();
  }
  if (dataRecords.length > 0) {
    tree.records = dataRecords;
  }
  return tree;
}

function makeRecords(str) {
  const tokens = tokenize(str);
  const records = tokensToRecords(tokens);
  return records;
}

function makeDataTree(str, privateProperties) {
  if (typeof str !== 'string') {
    throw TypeError('Value of argument must be string.');
  }
  const records = makeRecords(str, privateProperties);
  checkRecords(records, privateProperties);
  const dataTree = recordsToDataTree(records, privateProperties);
  return dataTree;
}

function checkProperties(properties, privateProperties) {
  Object.getOwnPropertyNames(properties).forEach((name) => {
    if (!Object.getOwnPropertyNames(privateProperties).includes(name)) {
      throw new TypeError(`"${name}" is not a name of property.`);
    }
    if (!['boolean', 'undefined'].includes(typeof properties[name]) && properties[name] !== null) {
      throw new TypeError(`Value of #${name} property must be boolean, undefined or null.`);
    }
  });
  return true;
}


// Constructor
function CsvParser(properties = {}) {
  const privateProperties = Object.seal({
    withHeader: false,
    withNull: false,
    withNumbers: false,
    withEmptyLine: false,
  });

  function setProperties(_properties) {
    checkProperties(_properties, privateProperties);
    const names = Object.getOwnPropertyNames(_properties);
    names.forEach((name) => {
      privateProperties[name] = _properties[name] || false;
    });
  }

  setProperties(properties);

  return Object.seal({
    get parameters() { return privateProperties; },
    set parameters(newProperties) { setProperties(newProperties); },
    makeRecords(csv) { return makeRecords(csv); },
    checkRecords(records) { return checkRecords(records, privateProperties); },
    recordsToDataTree(records) { return recordsToDataTree(records, privateProperties); },
    makeDataTree(csv) { return makeDataTree(csv, privateProperties); },
  });
}

// eslint-disable-next-line import/prefer-default-export
export { CsvParser };
