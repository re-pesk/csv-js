const { describe, it } = require('mocha');
const should = require('chai').should();
const { Parser } = require('../src/Parser');

describe('Parser', () => {
  describe('()', () => {
    it('Direct calling throws TypeError', () => {
      Parser.should.throw(TypeError, 'Cannot construct instances of Parser directly');
    });
  });
});
