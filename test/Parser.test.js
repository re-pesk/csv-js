import { describe, it } from 'mocha';
import { expect } from 'chai';
import { Parser } from '../src/Parser';

describe('Parser', () => {
  describe('()', () => {
    it('Direct calling throws TypeError', () => {
      expect(Parser).to.throw(TypeError, 'Cannot construct instances of Parser directly');
    });
  });
});
