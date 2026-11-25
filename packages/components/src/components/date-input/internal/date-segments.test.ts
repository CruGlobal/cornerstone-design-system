// German month name the locale test asserts. cspell:ignore März
import { expect } from '@open-wc/testing';
import {
  buildDateSegmentLayout,
  clearDateSegmentLayoutCache,
  commitDateBuffer,
  dateSegmentBounds,
  dateSegmentRules,
  dateSegmentsToIso,
  type DateSegments,
  formatDateSegmentText,
  formatMonthName,
  isDateSegmentsEmpty,
  isoToDateSegments,
  stepDateSegment,
  typeDateDigit,
} from './date-segments.js';

const TODAY = { year: 2026, month: 5, day: 31 };

function segments(year: number | null, month: number | null, day: number | null): DateSegments {
  return { year, month, day };
}

function literals(locale: string): string[] {
  return buildDateSegmentLayout(locale)
    .tokens.filter((token) => token.kind === 'literal')
    .map((token) => (token as { text: string }).text);
}

describe('date-segments model', () => {
  beforeEach(() => clearDateSegmentLayoutCache());

  describe('buildDateSegmentLayout', () => {
    it('orders month, day, year with slashes for en-US', () => {
      expect(buildDateSegmentLayout('en-US').order).to.deep.equal(['month', 'day', 'year']);
      expect(literals('en-US')).to.deep.equal(['/', '/']);
    });

    it('orders day, month, year for en-GB and de-DE, with the locale separator', () => {
      expect(buildDateSegmentLayout('en-GB').order).to.deep.equal(['day', 'month', 'year']);
      expect(literals('en-GB')).to.deep.equal(['/', '/']);
      expect(buildDateSegmentLayout('de-DE').order).to.deep.equal(['day', 'month', 'year']);
      expect(literals('de-DE')).to.deep.equal(['.', '.']);
    });

    it('orders year, month, day for ja-JP', () => {
      expect(buildDateSegmentLayout('ja-JP').order).to.deep.equal(['year', 'month', 'day']);
    });

    it('keeps a trailing literal, such as Korean’s final full stop', () => {
      const layout = buildDateSegmentLayout('ko-KR');
      expect(layout.order).to.deep.equal(['year', 'month', 'day']);
      expect(layout.tokens.at(-1)).to.deep.include({ kind: 'literal' });
    });

    it('falls back to month, day, year for a tag Intl rejects', () => {
      expect(buildDateSegmentLayout('not a locale!').order).to.deep.equal(['month', 'day', 'year']);
    });

    it('caches one layout per locale', () => {
      expect(buildDateSegmentLayout('en-US')).to.equal(buildDateSegmentLayout('en-US'));
      expect(buildDateSegmentLayout('en-GB')).to.not.equal(buildDateSegmentLayout('en-US'));
    });
  });

  describe('dateSegmentBounds', () => {
    it('announces 1 to 12, 1 to 31 and 1 to 9999', () => {
      expect(dateSegmentBounds('month')).to.deep.equal({ min: 1, max: 12 });
      expect(dateSegmentBounds('day')).to.deep.equal({ min: 1, max: 31 });
      expect(dateSegmentBounds('year')).to.deep.equal({ min: 1, max: 9999 });
    });
  });

  describe('stepDateSegment', () => {
    it('fills an empty segment from today', () => {
      expect(stepDateSegment(segments(null, null, null), 'month', 1, TODAY)).to.equal(5);
      expect(stepDateSegment(segments(null, null, null), 'day', -1, TODAY)).to.equal(31);
      expect(stepDateSegment(segments(null, null, null), 'year', 1, TODAY)).to.equal(2026);
    });

    it('fills an empty day from today, kept inside the month', () => {
      expect(stepDateSegment(segments(2026, 2, null), 'day', 1, TODAY)).to.equal(28);
    });

    it('wraps the month without carrying into the year', () => {
      expect(stepDateSegment(segments(2026, 12, 1), 'month', 1, TODAY)).to.equal(1);
      expect(stepDateSegment(segments(2026, 1, 1), 'month', -1, TODAY)).to.equal(12);
    });

    it('wraps the day at the month’s last day', () => {
      expect(stepDateSegment(segments(2026, 4, 30), 'day', 1, TODAY)).to.equal(1);
      expect(stepDateSegment(segments(2026, 4, 1), 'day', -1, TODAY)).to.equal(30);
      expect(stepDateSegment(segments(2025, 2, 28), 'day', 1, TODAY)).to.equal(1);
      expect(stepDateSegment(segments(2024, 2, 28), 'day', 1, TODAY)).to.equal(29);
    });

    it('reaches 29 February while the year is empty', () => {
      expect(stepDateSegment(segments(null, 2, 28), 'day', 1, TODAY)).to.equal(29);
    });

    it('wraps the day at 31 while the month is empty', () => {
      expect(stepDateSegment(segments(null, null, 31), 'day', 1, TODAY)).to.equal(1);
    });

    it('steps a typed 31 in a 30-day month back into the month', () => {
      expect(stepDateSegment(segments(2026, 4, 31), 'day', 1, TODAY)).to.equal(1);
      expect(stepDateSegment(segments(2026, 4, 31), 'day', -1, TODAY)).to.equal(30);
    });

    it('stops the year at 1 and 9999', () => {
      expect(stepDateSegment(segments(9999, 1, 1), 'year', 1, TODAY)).to.equal(null);
      expect(stepDateSegment(segments(1, 1, 1), 'year', -1, TODAY)).to.equal(null);
      expect(stepDateSegment(segments(2026, 1, 1), 'year', -1, TODAY)).to.equal(2025);
    });
  });

  describe('typeDateDigit', () => {
    it('types months and days with the shared two-digit rule', () => {
      expect(typeDateDigit('month', '', '1', null)).to.deep.equal({ value: 1, buffer: '1', advance: false });
      expect(typeDateDigit('month', '1', '2', 1)).to.deep.equal({ value: 12, buffer: '', advance: true });
      expect(typeDateDigit('day', '', '4', null)).to.deep.equal({ value: 4, buffer: '', advance: true });
      expect(typeDateDigit('day', '3', '1', 3)).to.deep.equal({ value: 31, buffer: '', advance: true });
    });

    it('accepts day 31 whatever the month, leaving the check to the composed date', () => {
      expect(typeDateDigit('day', '3', '1', 3).value).to.equal(31);
    });

    it('holds a year until its fourth digit, keeping the year it had', () => {
      expect(typeDateDigit('year', '', '2', null)).to.deep.equal({ value: null, buffer: '2', advance: false });
      expect(typeDateDigit('year', '20', '2', 2025)).to.deep.equal({ value: 2025, buffer: '202', advance: false });
      expect(typeDateDigit('year', '202', '6', 2025)).to.deep.equal({ value: 2026, buffer: '', advance: true });
    });

    it('commits year 0000 as no year', () => {
      expect(typeDateDigit('year', '000', '0', null)).to.deep.equal({ value: null, buffer: '', advance: true });
    });
  });

  describe('commitDateBuffer', () => {
    it('commits the digits typed so far', () => {
      expect(commitDateBuffer('month', '1')).to.equal(1);
      expect(commitDateBuffer('year', '26')).to.equal(26);
    });

    it('commits a lone 0 as no value', () => {
      expect(commitDateBuffer('month', '0')).to.equal(null);
      expect(commitDateBuffer('day', '0')).to.equal(null);
      expect(commitDateBuffer('year', '00')).to.equal(null);
    });
  });

  describe('formatDateSegmentText', () => {
    it('shows dashes as wide as an empty segment', () => {
      expect(formatDateSegmentText('month', null, '')).to.equal('--');
      expect(formatDateSegmentText('year', null, '')).to.equal('----');
    });

    it('zero-pads a value and the digits being typed', () => {
      expect(formatDateSegmentText('day', 7, '')).to.equal('07');
      expect(formatDateSegmentText('year', 26, '')).to.equal('0026');
      expect(formatDateSegmentText('month', 1, '1')).to.equal('01');
      expect(formatDateSegmentText('year', 2025, '20')).to.equal('0020');
    });
  });

  describe('formatMonthName', () => {
    it('names the month in the locale', () => {
      expect(formatMonthName('en-US', 3)).to.equal('March');
      expect(formatMonthName('de-DE', 3)).to.equal('März');
    });
  });

  describe('composing and splitting', () => {
    it('composes a real date to YYYY-MM-DD', () => {
      expect(dateSegmentsToIso(segments(2026, 5, 11))).to.equal('2026-05-11');
      expect(dateSegmentsToIso(segments(42, 1, 2))).to.equal('0042-01-02');
      expect(dateSegmentsToIso(segments(2024, 2, 29))).to.equal('2024-02-29');
    });

    it('composes nothing from a partial or impossible date', () => {
      expect(dateSegmentsToIso(segments(2026, 5, null))).to.equal('');
      expect(dateSegmentsToIso(segments(null, null, null))).to.equal('');
      expect(dateSegmentsToIso(segments(2026, 4, 31))).to.equal('');
      expect(dateSegmentsToIso(segments(2025, 2, 29))).to.equal('');
    });

    it('splits a value into segments, and anything else into empty ones', () => {
      expect(isoToDateSegments('2026-05-11')).to.deep.equal(segments(2026, 5, 11));
      expect(isoToDateSegments('2026-02-30')).to.deep.equal(segments(null, null, null));
      expect(isoToDateSegments('')).to.deep.equal(segments(null, null, null));
    });

    it('tells an empty set of segments from a partial one', () => {
      expect(isDateSegmentsEmpty(segments(null, null, null))).to.equal(true);
      expect(isDateSegmentsEmpty(segments(null, 3, null))).to.equal(false);
    });
  });

  describe('dateSegmentRules', () => {
    const rules = (current: DateSegments) => dateSegmentRules({ getSegments: () => current, today: () => TODAY });

    it('reports whether clearing a segment removed a value', () => {
      expect(rules(segments(2026, 5, null)).clear('single', 'month')).to.equal(true);
      expect(rules(segments(2026, 5, null)).clear('single', 'day')).to.equal(false);
    });

    it('reports a step that cannot move as no step', () => {
      expect(rules(segments(9999, 1, 1)).step('single', 'year', 1)).to.equal(null);
      expect(rules(segments(2026, 1, 1)).step('single', 'month', 1)).to.deep.equal({ value: 2 });
    });
  });
});
