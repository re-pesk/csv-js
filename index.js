const { Parser } = require('./src/Parser');
const { CsvParser } = require('./src/CsvParser');
const { Converter } = require('./src/Converter');
const { JsonConverter } = require('./src/JsonConverter');

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
// console.log(csvParser.inputType);
// console.log(csvParser instanceof Parser);
// console.log(csvParser.constructor.name);

const csvParser2 = CsvParser();
csvParser2.withNull = true;

const tree = csvParser.makeDataTree(csv);
const tree2 = csvParser2.makeDataTree(csv);

const jsonConverter = new JsonConverter({ replacer: null, space: 2 });
jsonConverter.replacer = (key, value) => {
  // Filtering out properties
  if (key === 'header') {
    return undefined;
  }
  return value;
};

console.log(jsonConverter.outputType);
console.log(jsonConverter instanceof Converter);
console.log(jsonConverter.constructor.name);

console.log(jsonConverter.convert(tree));
jsonConverter.replacer = (key, value) => {
  // Filtering out properties
  if (key === 'records') {
    return undefined;
  }
  return value;
};
jsonConverter.space = '';
console.log(jsonConverter.convert(tree));
