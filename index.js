const { CsvParser } = require('./src/CsvParser');
const { JsonConverter } = require('./src/JsonConverter');

function testList() {
  const csvList = {
    0: 'a,b,c\r\nzzz,,""\r\n,,',
    1: 'a,b,c\r\nzzz,""\r\n,,',
    2: 'a,b,c\r\nzzz,,,""\r\n,,',
    3: 'a,b,c\r\nzzz,,""\r\n,',
    4: 'a,b,c\r\nzzz,,\n""\r\n,,',
    5: 'a,b,c\r\nzzz,,""abc\r\n,,',
  };

  const csvParser = CsvParser({ withHeader: true });
  const jsonConverter = new JsonConverter();

  Object.getOwnPropertyNames(csvList).forEach((key) => {
    let tree;
    try {
      tree = csvParser.makeDataTree(csvList[key]);
      const testStr = jsonConverter.convert(tree);
      console.log(key, testStr);
    } catch (e) {
      console.log(key, e.message);
    }
  });
}

testList();

const csv = `field_name_1,"Field\r
Name 2",field_name_3 \r
"aaa","b \r
,bb","ccc""ddd"\r
zzz,,""\r
1,2.2,\r
,3,\r
`;

// const csv = ',b,c\r\nzzz,,""\r\n,,';
const csvParser = CsvParser({ withHeader: true });
const jsonConverter = new JsonConverter();
const tree = csvParser.makeDataTree(csv);
console.log(jsonConverter.convert(tree));
