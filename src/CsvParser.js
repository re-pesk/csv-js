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

function checkCsvString(csvString, functionName) {
  if (typeof csvString !== 'string') {
    throw new TypeError(`${functionName}: value of 'csvString' must be a string!`);
  }
}

function checkRecordSet(recordSet, functionName) {
  if (!Array.isArray(recordSet)) {
    throw new TypeError(`${functionName}: value of 'recordSet' must be an array!`);
  } else if (recordSet.length < 1) {
    throw new TypeError(`${functionName}: value of 'recordSet' cannot be empty array!`);
  }
}

const defaultParameters = {
  hasHeader: false,
  convertToNull: false,
  convertToNumber: false,
  preserveEmptyLine: false,
  ignoreInvalidChars: false,
};

const parameterNames = Object.getOwnPropertyNames(defaultParameters);

function checkParameters(parameters, functionName) {
  if (typeof parameters !== 'object'
      || parameters.constructor.name !== 'Object') {
    throw new TypeError(`${functionName}: value of argument 'parameters' must be an Object!`);
  }
  Object.getOwnPropertyNames(parameters).forEach((name) => {
    if (!parameterNames.includes(name)) {
      throw new TypeError(`${functionName}: the object in the 'parameters' argument has a member '${name}' that is not allowed parameter!`);
    }
    if (typeof parameters[name] !== 'boolean') {
      throw new TypeError(`${functionName}: value of parameter '${name}' is not boolean!`);
    }
  });
}

function splitTokenToParts(token) {
  const recPattern = new RegExp(RECORD_PATTERN, 'g');
  const headPattern = new RegExp(HEAD, 'g');
  const bodyPattern = new RegExp(HEAD_BODY, 'g');
  const strings = recPattern.exec(token[0]);
  headPattern.exec(token[0]);
  bodyPattern.exec(token[0]);
  const parts = [
    [token[0], token[1]],
    [strings[1], 0],
    [strings[2], headPattern.lastIndex],
    [strings[3], bodyPattern.lastIndex],
  ];
  return parts;
}

function tokenize(csvString) {
  if (csvString === '') {
    return [[['', 0], ['', 0], ['', 0], ['', 0]]];
  }
  const tokens = [];
  let pattern = csvPattern;
  if (/^(?:\r\n|,)/.test(csvString)) {
    tokens.push([['', 0], ['', 0], ['', 0], ['', 0]]);
    pattern = csvPatternWoStart;
  }
  let token;
  let index = 0;
  do {
    token = pattern.exec(csvString);
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

function makeRecords(csvString, functionName) {
  checkCsvString(csvString, functionName);
  const tokens = tokenize(csvString);
  const recordSet = tokensToRecords(tokens);
  return recordSet;
}

function checkRecords(recordSet, parameters, functionName) {
  checkRecordSet(recordSet, functionName);
  const preserveEmptyLine = parameters.preserveEmptyLine || false;
  const fieldCount = recordSet[0].length;
  recordSet.forEach((record, recordNo) => {
    if (record.length < 1) {
      throw new TypeError(`${functionName}: record ${recordNo} have no fields!`);
    }
    record.forEach((field, fieldNo) => {
      if (field.length !== 4) {
        throw new TypeError(`${functionName}: item ${fieldNo} of record ${recordNo} is not an field!`);
      }
      field.forEach((part, partNo) => {
        if (part.length !== 2 || typeof part[0] !== 'string' || typeof part[1] !== 'number') {
          throw new TypeError(`${functionName}: item ${partNo} of field ${fieldNo} of record ${recordNo} is not a part of field!`);
        }
      });
    });
    if (recordNo > 0) {
      if (record.length > fieldCount) {
        throw new TypeError(`${functionName}: record ${recordNo} has more fields than record 0!`);
      } else if (record.length < fieldCount) {
        if (recordNo < recordSet.length - 1) {
          throw new TypeError(`${functionName}: record ${recordNo} has less fields than record 0!`);
        } else if (record.length > 1) {
          throw new TypeError(`${functionName}: the last record ${recordNo} has less fields than record 0, but more than 1!`);
        } else if (!preserveEmptyLine) {
          throw new TypeError(`${functionName}: the last record ${recordNo} has only one field, but 'preserveEmptyLine' is set to false!`);
        }
      }
    }
  });
  return true;
}

function replacer(match) {
  if (match === '\r') {
    return '\\r';
  }
  return '\\n';
}

function checkValues(recordSet, parameters, functionName) {
  checkRecordSet(recordSet, functionName);
  const hasHeader = parameters.hasHeader || false;
  const preserveEmptyLine = parameters.preserveEmptyLine || false;
  recordSet.forEach((record, recordNo) => {
    record.forEach((field, fieldNo) => {
      if (field[3][0] !== '') {
        const fieldStr = replaceNl[Symbol.replace](field[0][0], replacer);
        const endStr = replaceNl[Symbol.replace](field[3][0], replacer);
        throw new TypeError(
          `${functionName}: record ${recordNo}, field ${fieldNo}: '${fieldStr}' has invalid end '${endStr}' at position ${field[3][1]}!`,
        );
      }
    });
  });

  if (hasHeader) {
    recordSet[0].forEach((field, fieldNo) => {
      if (field[2][0] === '') {
        throw new TypeError(`${functionName}: header of field ${fieldNo} is non-escaped empty string!`);
      }
      if (field[2][0] === '""') {
        throw new TypeError(`${functionName}: header of field ${fieldNo} is escaped empty string!`);
      }
    });
  }

  if (recordSet.length > 1) {
    const firstRecord = recordSet[0];
    const lastRecord = recordSet[recordSet.length - 1];
    if (firstRecord.length > 1 && lastRecord.length === 1 && preserveEmptyLine) {
      if (lastRecord[0][1][0] !== '\r\n' || lastRecord[0][2][0] !== '' || lastRecord[0][3][0] !== ''
          || lastRecord[0][1][1] !== 0 || lastRecord[0][2][1] !== 2 || lastRecord[0][3][1] !== 2) {
        throw new TypeError(`${functionName}: when 'preserveEmptyLine' is set to true, the only field of the last record ${recordSet.length - 1} is not empty!'`);
      }
    }
  }
  return true;
}

function convertValue(value, parameters) {
  const convertToNumber = parameters.convertToNumber || false;
  const convertToNull = parameters.convertToNull || false;
  if (convertToNumber && !Number.isNaN(Number.parseFloat(value))) {
    if (value.indexOf('.') !== -1) {
      return Number.parseFloat(value);
    }
    return Number.parseInt(value, 10);
  }
  if (!convertToNull) {
    return value;
  }
  if (emptyValuePattern.test(value)) {
    return null;
  }
  const newValue = value.replace(outerQuotesPattern, '');
  return newValue.replace(innerQuotesPattern, '"');
}

function recordsToDataTree(recordSet, parameters, functionName) {
  checkRecordSet(recordSet, functionName);
  checkRecords(recordSet, parameters, functionName);
  const hasHeader = parameters.hasHeader || false;
  const preserveEmptyLine = parameters.preserveEmptyLine || false;
  const ignoreInvalidChars = parameters.ignoreInvalidChars || false;

  if (!ignoreInvalidChars) {
    checkValues(recordSet, parameters, functionName);
  }

  let filteredRecords = recordSet;
  if (!preserveEmptyLine) {
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
    record => record.map(field => convertValue(field[2][0], parameters)),
  );
  const tree = {};
  if (hasHeader) {
    tree.header = dataRecords.shift();
  }
  if (dataRecords.length > 0) {
    tree.records = dataRecords;
  }
  return tree;
}

function makeDataTree(csvString, parameters, functionName) {
  const recordSet = makeRecords(csvString, functionName);
  const dataTree = recordsToDataTree(recordSet, parameters, functionName);
  return dataTree;
}

function CsvParser(_parameters = {}) {
  const privateParameters = Object.seal(Object.assign({}, defaultParameters));

  function setProperties(parameters, functionName) {
    checkParameters(parameters, functionName);
    const names = Object.getOwnPropertyNames(parameters);
    names.forEach((name) => {
      privateParameters[name] = parameters[name];
    });
  }

  setProperties(_parameters, 'CsvParser::()');

  return Object.seal({
    constructor: CsvParser,
    get parameters() { return privateParameters; },
    set parameters(properties) { setProperties(properties, 'CsvParser::parameters::set'); },
    makeRecords(csv) { return makeRecords(csv, 'CsvParser::makeRecords'); },
    checkRecords(recordSet) { return checkRecords(recordSet, privateParameters, 'CsvParser::checkRecords'); },
    checkValues(recordSet) { return checkValues(recordSet, privateParameters, 'CsvParser::checkValues'); },
    recordsToDataTree(recordSet) { return recordsToDataTree(recordSet, privateParameters, 'CsvParser::recordsToDataTree'); },
    makeDataTree(csvString) { return makeDataTree(csvString, privateParameters, 'CsvParser::makeDataTree'); },
  });
}

module.exports = { CsvParser };
