const {
  makeRecords, checkParameters, checkRecords, checkValues, recordsToDataTree, makeDataTree,
} = require('../src/CsvParsing');

// Constructor

function CsvParser(_parameters = {}) {
  const privateParameters = Object.seal({
    withHeader: false,
    withNull: false,
    withNumbers: false,
    withEmptyLine: false,
    ignoreCorruptedData: false,
  });

  function setProperties(parameters) {
    checkParameters(parameters, 'CsvParser');
    const names = Object.getOwnPropertyNames(parameters);
    names.forEach((name) => {
      privateParameters[name] = parameters[name];
    });
  }

  setProperties(_parameters);

  return Object.seal({
    constructor: CsvParser,
    get parameters() { return privateParameters; },
    set parameters(properties) { setProperties(properties); },
    makeRecords(csv) { return makeRecords(csv); },
    checkRecords(recordSet) { return checkRecords(recordSet, privateParameters); },
    checkValues(recordSet) { return checkValues(recordSet, privateParameters); },
    recordsToDataTree(recordSet) { return recordsToDataTree(recordSet, privateParameters); },
    makeDataTree(csvString) { return makeDataTree(csvString, privateParameters); },
  });
}

module.exports = { CsvParser };
