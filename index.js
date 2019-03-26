const { Parser } = require('./src/Parser');
const { CsvParser } = require('./src/CsvParser');

const csv = `field_name_1,"Field
Name 2",field_name_3 
"aaa","b 
,bb","ccc""ddd"
zzz,,""
1,2.2,
,3,
`;

const csvParser = CsvParser({ withHeader: true });
csvParser.inputType = 'ddd';
console.log(csvParser.inputType);
console.log(csvParser instanceof Parser);
console.log(csvParser.constructor.name);

const csvParser2 = CsvParser();
csvParser2.withNull = true;

const tree = csvParser.makeDataTree(csv);
console.log(JSON.stringify(tree, null, '    '));

const tree2 = csvParser2.makeDataTree(csv);
console.log(JSON.stringify(tree2, null, '    '));
