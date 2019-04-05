/* eslint-disable no-undef */
const { Parser } = require('../src/Parser');

describe('Parser', () => {
  describe('()', () => {
    it('Direct calling throws TypeError', () => {
      expect(Parser).toThrow(TypeError, 'Cannot construct instances of Parser directly');
    });
  });
});
