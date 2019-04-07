import { describe, it } from 'mocha';
import { expect } from 'chai';
import { Converter } from '../src/Converter';

describe('Converter', () => {
  describe('()', () => {
    it('Direct calling throws TypeError', () => {
      expect(Converter).to.throw(TypeError, 'Cannot construct instances of Converter directly');
    });
  });
});
