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
  const result = clearString(input)
    .replace(/^\[{4}/, '[\n[[[')
    .replace(/\]{4}$/, ']]]\n]')
    .replace(/\]{3}, \[{3}/, ']]],\n[[[')
    .replace(/\[{3}/g, '  [[[')
    .replace(/^/, '  '.repeat(spaceInt))
    .replace(/(?<!\\)\n/g, `\n${'  '.repeat(spaceInt)}`);
  return result;
}

// eslint-disable-next-line import/prefer-default-export
export { escapeNL, clearString, indentString };
