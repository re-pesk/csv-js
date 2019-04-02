const { describe, it } = require('mocha');
const { expect } = require('chai');
const { Parser } = require('../src/Parser');

describe('Parser()', () => {
  it('Call to Parser produces TypeError', () => {
    expect(Parser).to.throw(TypeError, 'Cannot construct Parser instances directly');
  });
});
