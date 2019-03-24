const { CsvParser } = require('./src/CsvParser');

const csv = `field_name_1,"Field
Name 2",field_name_3 
"aaa","b 
,bb","ccc""ddd"
zzz,,""
1,2.2,
,3,
`;

const csvParser = CsvParser(true);
const tree = csvParser.makeDataTree(csv);

console.log(JSON.stringify(tree, null, '    '));

