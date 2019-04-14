import {
  makeRecords, checkRecords, recordsToDataTree, makeDataTree 
} from './src/CsvParser';

import { indentString } from './src/helpers';

// const csv = `field_name_1,"Field\r
// Name 2",field_name_3 \r
// "aaa","b \r
// ,bb","ccc""ddd"\r
// zzz,,""\r
// 1,2.2,\r
// ,3,\r
// `;

// const csv = ',\r\na';
const tree = makeDataTree('1,1.1', { withNumber: true });
// const records = makeRecords(csv); // "abc"\n\r\r\n\n\r"abc"
// const records = csvParser.makeRecords('');
// console.log('records =>', JSON.stringify(records));
// const records = [[[['', 0], ['', 0], ['', 0], ['']]]];
// console.log('records =>', JSON.stringify(records));
// console.log(`records =>\n${indentString(JSON.stringify(records), 4)}`);
// checkRecords(records, { withEmptyLine: true });
// checkRecords(records, { withEmptyLine: true });
// const tree = recordsToDataTree(records, { withEmptyLine: true });
console.log(tree);
console.log(JSON.stringify(tree));

