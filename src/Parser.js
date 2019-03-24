class Parser {
  constructor() {
    if (new.target === Parser) {
      throw new TypeError('Cannot construct Parser instances directly');
    }
  }
}

module.exports = {
  Parser,
};
