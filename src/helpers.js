function escapeNL(input) {
  return input.replace(/\r/g, '\\r').replace(/\n/g, '\\n');
}

function clearString(input) {
  const result = input
    .replace(/,(?=\d+\]|\[)/g, ', ')
    .replace(/(?<!\\)"/g, '\'')
    .replace(/\\"/g, '"');
  return escapeNL(result);
}

function indentString(input, spaceInt) {
  const result = input
    .replace(/^/, '  '.repeat(spaceInt))
    .replace(/(?<!\\)\n/g, `\n${'  '.repeat(spaceInt)}`);
  return result;
}

function indentJson(input, spaceInt) {
  const result = clearString(JSON.stringify(input))
    .replace(/^\[{4}/, '[\n[[[')
    .replace(/\]{4}$/, ']]]\n]')
    .replace(/\]{3}, \[{3}/, ']]],\n[[[')
    .replace(/\[{3}/g, '  [[[');
  return indentString(result, spaceInt);
}


function indent(input, spaceInt) {
  return input.repeat(spaceInt);
}

// eslint-disable-next-line import/prefer-default-export
export {
  escapeNL, clearString, indent, indentString, indentJson,
};
