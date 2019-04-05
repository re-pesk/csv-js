const { CsvParser } = require('./src/CsvParser');
const { JsonConverter } = require('./src/JsonConverter');

const csvList = {
  0: 'a,b,c\nzzz,,""\n,,',
  1: 'a,b,c\nzzz,""\n,,',
  2: 'a,b,c\nzzz,,,""\n,,',
  3: 'a,b,c\nzzz,,""\n,',
  4: 'a,b,c\nzzz,",""\n,,',
  5: 'a,b,c\nzzz,,""abc\n,,',
};

const csvParser = CsvParser({ withHeader: true });
const jsonConverter = new JsonConverter();

Object.getOwnPropertyNames(csvList).forEach((key) => {
  let tree;
  try {
    tree = csvParser.makeDataTree(csvList[key]);
    console.log(key, 'tree =>', tree);

    const testStr = jsonConverter.convert(tree);
    console.log('  testStr =>', testStr);
  } catch (e) {
    console.log(key, e.message);
  }
});
