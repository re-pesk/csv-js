/* eslint-disable no-undef */
const { expect } = require('chai');
const { Converter } = require('../src/Converter');

describe('Converter()', () => {
  it('Call to Converter produces TypeError', () => {
    expect(Converter).to.throw(TypeError, 'Cannot construct Converter instances directly');
  });
});
