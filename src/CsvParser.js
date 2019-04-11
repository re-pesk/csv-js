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

function tokenize(csv) {
  if (csv === '') {
    return [[['', 0], ['', 0], ['', 0], ['', 0]]];
  }
  const tokens = [];
  let pattern = csvPattern;
  if (/^(?:\r\n|,)/.test(csv)) {
    tokens.push([['', 0], ['', 0], ['', 0], ['', 0]]);
    pattern = csvPatternWoStart;
  }
  let token;
  let index = 0;
  do {
    token = pattern.exec(csv);
    if (token !== null) {
      token.push(index);
      index = pattern.lastIndex;
      const parts = splitTokenToParts(token);
      tokens.push(parts);
    }
  } while (token !== null);
  return tokens;
}

function tokensToRecords(tokens) {
  const recordSet = [];

  tokens.forEach((token) => {
    if (token[1][0] !== ',') {
      recordSet.push([token]);
    } else {
      recordSet[recordSet.length - 1].push(token);
    }
  });

  return recordSet;
}

function makeRecords(csv) {
  if (typeof csv !== 'string') {
    throw new TypeError('Function "makeRecords": the argument "csv" must be string!');
  }
  const tokens = tokenize(csv);
  const recordSet = tokensToRecords(tokens);
  return recordSet;
}

function replacer(match) {
  if (match === '\r') {
    return '\\r';
  }
  return '\\n';
}

function checkRecords(recordSet, parameters = {}) {
  if (!Array.isArray(recordSet)) {
    throw new TypeError('Function \'checkRecords\': value of \'recordSet\' must be an array!');
  } else if (recordSet.length < 1) {
    throw new TypeError('Function \'checkRecords\': value of \'recordSet\' cannot be empty array!');
  }
  if (typeof parameters !== 'object' || parameters.constructor.name !== 'Object') {
    throw new TypeError('Function \'checkRecords\': value of \'parameters\' must be an Object');
  }
  const withEmptyLine = parameters.withEmptyLine || false;
  const fieldCount = recordSet[0].length;
  recordSet.forEach((record, recordNo) => {
    if (record.length < 1) {
      throw new TypeError(`Function 'checkRecords': record ${recordNo} have no fields!`);
    }
    record.forEach((field, fieldNo) => {
      if (field.length !== 4) {
        throw new TypeError(`Function 'checkRecords': item ${fieldNo} of record ${recordNo} is not an field!`);
      }
      field.forEach((part, partNo) => {
        if (part.length !== 2 || typeof part[0] !== 'string' || typeof part[1] !== 'number') {
          throw new TypeError(`Function 'checkRecords': item ${partNo} of field ${fieldNo} of record ${recordNo} is not a part of field!`);
        }
      });
    });
    if (recordNo > 0) {
      if (record.length > fieldCount) {
        throw new TypeError(`Function 'checkRecords': record ${recordNo} has more fields than record 0!`);
      } else if (record.length < fieldCount) {
        if (recordNo < recordSet.length - 1) {
          throw new TypeError(`Function 'checkRecords': record ${recordNo} has less fields than record 0!`);
        } else if (record.length > 1) {
          throw new TypeError(`Function 'checkRecords': the last record ${recordNo} has less fields than record 0, but more than 1!`);
        } else if (!withEmptyLine) {
          throw new TypeError(`Function 'checkRecords': the last record ${recordNo} has only one field, but 'withEmptyLine' is set to false!`);
        }
      }
    }
  });
  return true;
}

function checkValues(recordSet, parameters = {}) {
  if (!Array.isArray(recordSet)) {
    throw new TypeError('Function \'checkRecords\': value of \'recordSet\' must be an array!');
  } else if (recordSet.length < 1) {
    throw new TypeError('Function \'checkRecords\': value of \'recordSet\' cannot be empty array!');
  }
  if (typeof parameters !== 'object' || parameters.constructor.name !== 'Object') {
    throw new TypeError('Function \'checkRecords\': value of \'parameters\' must be an Object');
  }
  const withHeader = parameters.withHeader || false;
  const withEmptyLine = parameters.withEmptyLine || false;
  recordSet.forEach((record, recordNo) => {
    record.forEach((field, fieldNo) => {
      if (field[3][0] !== '') {
        const fieldStr = replaceNl[Symbol.replace](field[0][0], replacer);
        const endStr = replaceNl[Symbol.replace](field[3][0], replacer);
        throw new TypeError(
          `Function 'checkRecords': record ${recordNo}, field ${fieldNo}: '${fieldStr}' has corrupted end '${endStr}' at position ${field[3][1]}!`,
        );
      }
    });
  });

  if (withHeader) {
    recordSet[0].forEach((field, fieldNo) => {
      if (field[2][0] === '') {
        throw new TypeError(`Function 'checkRecords': header of field ${fieldNo} is empty!`);
      }
      if (field[2][0] === '""') {
        throw new TypeError(`Function 'checkRecords': header of field ${fieldNo} is escaped empty string!`);
      }
    });
  }

  if (recordSet.length > 1) {
    const firstRecord = recordSet[0];
    const lastRecord = recordSet[recordSet.length - 1];
    if (firstRecord.length > 1 && lastRecord.length === 1 && withEmptyLine) {
      if (lastRecord[0][1][0] !== '\r\n' || lastRecord[0][2][0] !== '' || lastRecord[0][3][0] !== ''
          || lastRecord[0][1][1] !== 0 || lastRecord[0][2][1] !== 2 || lastRecord[0][3][1] !== 2) {
        throw new TypeError(`Function 'checkRecords': when 'withEmptyLine' is set to true the only field of the last record ${recordSet.length - 1} must be empty!'`);
      }
    }
  }
  return true;
}

function convertValue(value, withNull, withNumbers) {
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

function recordsToDataTree(recordSet, parameters = {}) {
  if (!Array.isArray(recordSet)) {
    throw new TypeError('Function \'checkRecords\': value of \'recordSet\' must be an array!');
  } else if (recordSet.length < 1) {
    throw new TypeError('Function \'checkRecords\': value of \'recordSet\' cannot be empty array!');
  }
  if (typeof parameters !== 'object' || parameters.constructor.name !== 'Object') {
    throw new TypeError('Function \'checkRecords\': value of \'parameters\' must be an Object');
  }
  const withHeader = parameters.withHeader || false;
  const withNull = parameters.withNull || false;
  const withNumbers = parameters.withNumbers || false;
  const withEmptyLine = parameters.withEmptyLine || false;
  const onlyChecked = parameters.onlyChecked || false;
  
  checkRecords(recordSet, parameters);
  if (onlyChecked) {
    checkValues(recordSet, parameters);
  }

  let filteredRecords = recordSet;
  if (!withEmptyLine) {
    filteredRecords = recordSet.filter(
      (record, recordNo) => (
        recordNo < recordSet.length - 1 || record.length > 1
        || record[0][1][0] !== '\r\n' || record[0][2][0] !== '' || record[0][3][0] !== ''
        || record[0][1][1] !== 0 || record[0][2][1] !== 2 || record[0][3][1] !== 2
        || recordSet[0].length < 2
      ),
    );
  }
  const dataRecords = filteredRecords.map(
    record => record.map(field => convertValue(field[2][0], withNull, withNumbers)),
  );
  const tree = {};
  if (withHeader) {
    tree.header = dataRecords.shift();
  }
  if (dataRecords.length > 0) {
    tree.recordSet = dataRecords;
  }
  return tree;
}

function makeDataTree(csv, parameters = {}) {
  if (typeof csv !== 'string') {
    throw TypeError('Function \'rmakeDataTree\': argument "makeDataTree.args.csv" must be a string.');
  }
  if (typeof parameters !== 'object' || parameters.constructor.name !== 'Object') {
    throw new TypeError('Function \'rmakeDataTree\': argument \'parameters\' must be object { ... }');
  }
  const newParameters = {
    withHeader: parameters.withHeader || false,
    withNull: parameters.withNull || false,
    withNumbers: parameters.withNumbers || false,
    withEmptyLine: parameters.withEmptyLine || false,
  };

  const recordSet = makeRecords(csv);
  const dataTree = recordsToDataTree(recordSet, newParameters);
  return dataTree;
}

// eslint-disable-next-line import/prefer-default-export
export {
  makeRecords, checkRecords, checkValues, recordsToDataTree, makeDataTree,
};
