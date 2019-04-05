/* eslint-disable no-undef */
const { Converter } = require('../src/Converter');

describe('Converter', () => {
  describe('()', () => {
    it('Direct calling throws TypeError', () => {
      expect(Converter).toThrow(TypeError, 'Cannot construct instances of Converter directly');
    });
  });
});
