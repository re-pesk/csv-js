const { describe, it } = require('mocha');
const { expect } = require('chai');
const { Converter } = require('../src/Converter');

describe('Converter', () => {
  describe('()', () => {
    it('Direct calling throws TypeError', () => {
      expect(Converter).to.throw(TypeError, 'Cannot construct instances of Converter directly');
    });
  });
});
