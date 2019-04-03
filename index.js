const { CsvParser } = require('./src/CsvParser');
const { JsonConverter } = require('./src/JsonConverter');

const csv = 'field_name_1,"Field\nName 2",field_name_3 \n"aaa","b \n,bb","ccc""ddd"\nzzz,,""\n1,2.2,\n,3,\n';

const csvParser = CsvParser();
csvParser.withHeader = true;
csvParser.withNull = true;

const tree = csvParser.makeDataTree(csv);
const jsonConverter = new JsonConverter();
const testStr = jsonConverter.convert(tree);

console.log('csv =>');
console.log(`\`${csv}\``);
console.log('tree =>');
console.log(tree);
console.log('testStr =>');
console.log(`'${testStr}'`);
