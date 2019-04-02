const { describe, it } = require('mocha');
const should = require('chai').should();
const { Converter } = require('../src/Converter');

describe('Converter', () => {
  describe('()', () => {
    it('Direct calling throws TypeError', () => {
      Converter.should.throw(TypeError, 'Cannot construct instances of Converter directly');
    });
  });
});
