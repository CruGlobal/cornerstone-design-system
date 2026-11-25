import { expect } from '@open-wc/testing';
import { typeNumericSegment } from './numeric-segment.js';

describe('typeNumericSegment', () => {
  describe('a 1 to 12 segment, such as a month', () => {
    it('commits and advances on a first digit no second digit could follow', () => {
      expect(typeNumericSegment('', '2', 1, 12)).to.deep.equal({ value: 2, buffer: '', advance: true });
      expect(typeNumericSegment('', '9', 1, 12)).to.deep.equal({ value: 9, buffer: '', advance: true });
    });

    it('holds a 1, which may start 10 to 12, as the value 1', () => {
      expect(typeNumericSegment('', '1', 1, 12)).to.deep.equal({ value: 1, buffer: '1', advance: false });
    });

    it('commits a pair that stays in range', () => {
      expect(typeNumericSegment('1', '0', 1, 12)).to.deep.equal({ value: 10, buffer: '', advance: true });
      expect(typeNumericSegment('1', '2', 1, 12)).to.deep.equal({ value: 12, buffer: '', advance: true });
    });

    it('starts over from the second digit when the pair passes the maximum', () => {
      expect(typeNumericSegment('1', '3', 1, 12)).to.deep.equal({ value: 3, buffer: '', advance: true });
    });

    it('holds a leading 0 with no value, then commits the digit after it', () => {
      expect(typeNumericSegment('', '0', 1, 12)).to.deep.equal({ value: null, buffer: '0', advance: false });
      expect(typeNumericSegment('0', '0', 1, 12)).to.deep.equal({ value: null, buffer: '0', advance: false });
      expect(typeNumericSegment('0', '5', 1, 12)).to.deep.equal({ value: 5, buffer: '', advance: true });
    });
  });

  describe('a 0 to 59 segment, such as a minute', () => {
    it('holds a leading 0 as the value 0', () => {
      expect(typeNumericSegment('', '0', 0, 59)).to.deep.equal({ value: 0, buffer: '0', advance: false });
      expect(typeNumericSegment('0', '0', 0, 59)).to.deep.equal({ value: 0, buffer: '', advance: true });
    });

    it('holds 0 to 5 and commits 6 to 9 at once', () => {
      expect(typeNumericSegment('', '5', 0, 59)).to.deep.equal({ value: 5, buffer: '5', advance: false });
      expect(typeNumericSegment('', '6', 0, 59)).to.deep.equal({ value: 6, buffer: '', advance: true });
    });
  });

  describe('a 1 to 31 segment, such as a day', () => {
    it('holds 1 to 3 and commits 4 to 9 at once', () => {
      expect(typeNumericSegment('', '3', 1, 31)).to.deep.equal({ value: 3, buffer: '3', advance: false });
      expect(typeNumericSegment('', '4', 1, 31)).to.deep.equal({ value: 4, buffer: '', advance: true });
    });

    it('commits 31 and starts over on 32', () => {
      expect(typeNumericSegment('3', '1', 1, 31)).to.deep.equal({ value: 31, buffer: '', advance: true });
      expect(typeNumericSegment('3', '2', 1, 31)).to.deep.equal({ value: 2, buffer: '2', advance: false });
    });
  });
});
