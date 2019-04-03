const { describe, it } = require('mocha');
const { expect } = require('chai');
const { Parser } = require('../src/Parser');

describe('Parser', () => {
  describe('()', () => {
    it('Direct calling throws TypeError', () => {
      expect(Parser).to.throw(TypeError, 'Cannot construct instances of Parser directly');
    });
  });
});
