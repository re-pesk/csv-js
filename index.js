const { CsvParser } = require('./src/CsvParser');


// const csv = `field_name_1,"Field\r
// Name 2",field_name_3 \r
// "aaa","b \r
// ,bb","ccc""ddd"\r
// zzz,,""\r
// 1,2.2,\r
// ,3,\r
// `;
const csv = '"abc"ooo,bcd,12+-\r\n"bcd",,xxx=!\r\n';
const csvParser = CsvParser({ withEmptyLine: true, ignoreCorruptedData: true });
console.log(csvParser.parameters);
console.log(csvParser.constructor.name);
console.log(csvParser instanceof CsvParser);
const records = csvParser.makeRecords(csv);
// const records = csvParser.makeRecords('');
console.log('records =>', JSON.stringify(records));
csvParser.checkRecords(records);
const tree = csvParser.recordsToDataTree(records);
console.log(tree);
console.log(JSON.stringify(tree));

