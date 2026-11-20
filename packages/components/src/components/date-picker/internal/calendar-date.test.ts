import { expect } from '@open-wc/testing';
import {
  addDays,
  addMonths,
  type CalendarDate,
  clampDate,
  compareDates,
  dayOfWeek,
  daysInMonth,
  firstDayOfWeekFor,
  isSameDate,
  isSameMonth,
  monthGrid,
  parseIsoDate,
  parseIsoDateList,
  parseWeekdays,
  resolveLocale,
  startOfWeek,
  toIsoDate,
  toUtcDate,
} from './calendar-date.js';

/** Shorthand: the `CalendarDate` for an ISO string the test knows is valid. */
function d(iso: string): CalendarDate {
  const date = parseIsoDate(iso);
  if (!date) {
    throw new Error(`${iso} is not a date`);
  }
  return date;
}

describe('calendar-date', () => {
  describe('parseIsoDate', () => {
    it('reads a real YYYY-MM-DD date', () => {
      expect(parseIsoDate('2026-05-11')).to.deep.equal({ year: 2026, month: 5, day: 11 });
      expect(parseIsoDate('0001-01-01')).to.deep.equal({ year: 1, month: 1, day: 1 });
      expect(parseIsoDate('9999-12-31')).to.deep.equal({ year: 9999, month: 12, day: 31 });
    });

    it('accepts 29 February only in leap years', () => {
      expect(parseIsoDate('2024-02-29')).to.not.be.null;
      expect(parseIsoDate('2000-02-29')).to.not.be.null;
      expect(parseIsoDate('2023-02-29')).to.be.null;
      expect(parseIsoDate('1900-02-29')).to.be.null;
      expect(parseIsoDate('2100-02-29')).to.be.null;
    });

    it('rejects days a month does not have', () => {
      expect(parseIsoDate('2026-04-31')).to.be.null;
      expect(parseIsoDate('2026-02-30')).to.be.null;
      expect(parseIsoDate('2026-01-32')).to.be.null;
      expect(parseIsoDate('2026-01-00')).to.be.null;
    });

    it('rejects months and years out of range', () => {
      expect(parseIsoDate('2026-13-01')).to.be.null;
      expect(parseIsoDate('2026-00-10')).to.be.null;
      expect(parseIsoDate('0000-01-01')).to.be.null;
    });

    it('rejects anything that is not strictly YYYY-MM-DD', () => {
      for (const value of [
        '2026-5-1',
        ' 2026-05-01',
        '2026-05-01 ',
        '2026/05/01',
        '20260501',
        '2026-05-01T00:00',
        '',
      ]) {
        expect(parseIsoDate(value), value).to.be.null;
      }
      expect(parseIsoDate(null)).to.be.null;
      expect(parseIsoDate(undefined)).to.be.null;
    });
  });

  describe('toIsoDate', () => {
    it('pads every part', () => {
      expect(toIsoDate({ year: 1, month: 2, day: 3 })).to.equal('0001-02-03');
      expect(toIsoDate({ year: 2026, month: 11, day: 20 })).to.equal('2026-11-20');
    });

    it('round-trips through parseIsoDate', () => {
      for (const iso of ['0001-01-01', '0099-12-31', '1970-01-01', '2024-02-29', '9999-12-31']) {
        expect(toIsoDate(d(iso))).to.equal(iso);
      }
    });
  });

  describe('daysInMonth', () => {
    it('counts every month, leap years included', () => {
      expect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => daysInMonth(2026, month))).to.deep.equal([
        31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
      ]);
      expect(daysInMonth(2024, 2)).to.equal(29);
      expect(daysInMonth(2000, 2)).to.equal(29);
      expect(daysInMonth(1900, 2)).to.equal(28);
    });

    it('reads years below 100 as themselves, not as 1900 to 1999', () => {
      // Year 0 is a leap year in the proleptic Gregorian calendar. `Date.UTC` would read it as 1900, which is not.
      expect(daysInMonth(4, 2)).to.equal(29);
      expect(daysInMonth(0, 2)).to.equal(29);
    });
  });

  describe('addDays', () => {
    it('crosses the end of a month and a year', () => {
      expect(toIsoDate(addDays(d('2026-05-31'), 1))).to.equal('2026-06-01');
      expect(toIsoDate(addDays(d('2026-12-31'), 1))).to.equal('2027-01-01');
      expect(toIsoDate(addDays(d('2027-01-01'), -1))).to.equal('2026-12-31');
    });

    it('lands on 29 February in a leap year', () => {
      expect(toIsoDate(addDays(d('2024-02-28'), 1))).to.equal('2024-02-29');
      expect(toIsoDate(addDays(d('2024-03-01'), -1))).to.equal('2024-02-29');
      expect(toIsoDate(addDays(d('2023-02-28'), 1))).to.equal('2023-03-01');
    });

    it('moves by weeks', () => {
      expect(toIsoDate(addDays(d('2026-12-28'), 7))).to.equal('2027-01-04');
      expect(toIsoDate(addDays(d('2026-03-03'), -7))).to.equal('2026-02-24');
    });

    it('keeps a two-digit year', () => {
      expect(toIsoDate(addDays(d('0050-12-31'), 1))).to.equal('0051-01-01');
    });

    it('steps through a whole year one day at a time without skipping or repeating a day', () => {
      // Whatever the browser's time zone, no daylight-saving change can move a date, because nothing here is local.
      const seen: string[] = [];
      let date = d('2026-01-01');
      for (let i = 0; i < 365; i++) {
        seen.push(toIsoDate(date));
        date = addDays(date, 1);
      }
      expect(new Set(seen).size).to.equal(365);
      expect(seen[0]).to.equal('2026-01-01');
      expect(seen[364]).to.equal('2026-12-31');
      expect(toIsoDate(date)).to.equal('2027-01-01');
      expect([...seen].sort()).to.deep.equal(seen);
    });
  });

  describe('addMonths', () => {
    it('keeps the day where the month has it', () => {
      expect(toIsoDate(addMonths(d('2026-05-11'), 1))).to.equal('2026-06-11');
      expect(toIsoDate(addMonths(d('2026-05-11'), -5))).to.equal('2025-12-11');
    });

    it("uses the month's last day where it has no such day", () => {
      expect(toIsoDate(addMonths(d('2026-01-31'), 1))).to.equal('2026-02-28');
      expect(toIsoDate(addMonths(d('2024-01-31'), 1))).to.equal('2024-02-29');
      expect(toIsoDate(addMonths(d('2026-03-31'), 1))).to.equal('2026-04-30');
      expect(toIsoDate(addMonths(d('2024-03-31'), -1))).to.equal('2024-02-29');
    });

    it('moves by years, from 29 February to 28 February', () => {
      expect(toIsoDate(addMonths(d('2024-02-29'), 12))).to.equal('2025-02-28');
      expect(toIsoDate(addMonths(d('2024-02-29'), -12))).to.equal('2023-02-28');
      expect(toIsoDate(addMonths(d('2024-02-29'), 48))).to.equal('2028-02-29');
    });

    it('crosses the end of a year in both directions', () => {
      expect(toIsoDate(addMonths(d('2026-12-15'), 1))).to.equal('2027-01-15');
      expect(toIsoDate(addMonths(d('2026-01-15'), -1))).to.equal('2025-12-15');
      expect(toIsoDate(addMonths(d('2026-01-15'), -13))).to.equal('2024-12-15');
    });
  });

  describe('comparing and clamping', () => {
    it('orders dates', () => {
      expect(compareDates(d('2026-05-11'), d('2026-05-12'))).to.be.lessThan(0);
      expect(compareDates(d('2027-01-01'), d('2026-12-31'))).to.be.greaterThan(0);
      expect(compareDates(d('2026-05-11'), d('2026-05-11'))).to.equal(0);
    });

    it('matches days and months', () => {
      expect(isSameDate(d('2026-05-11'), d('2026-05-11'))).to.be.true;
      expect(isSameDate(d('2026-05-11'), null)).to.be.false;
      expect(isSameDate(null, null)).to.be.false;
      expect(isSameMonth(d('2026-05-01'), d('2026-05-31'))).to.be.true;
      expect(isSameMonth(d('2026-05-01'), d('2025-05-01'))).to.be.false;
    });

    it('clamps to inclusive bounds', () => {
      const min = d('2026-05-10');
      const max = d('2026-05-20');
      expect(toIsoDate(clampDate(d('2026-05-01'), min, max))).to.equal('2026-05-10');
      expect(toIsoDate(clampDate(d('2026-05-31'), min, max))).to.equal('2026-05-20');
      expect(toIsoDate(clampDate(d('2026-05-15'), min, max))).to.equal('2026-05-15');
      expect(toIsoDate(clampDate(min, min, max))).to.equal('2026-05-10');
    });
  });

  describe('weeks', () => {
    it('knows the day of the week', () => {
      expect(dayOfWeek(d('2023-01-01'))).to.equal(0);
      expect(dayOfWeek(d('2026-05-11'))).to.equal(1);
      expect(dayOfWeek(d('2026-05-16'))).to.equal(6);
      expect(dayOfWeek(d('2000-02-29'))).to.equal(2);
    });

    it('finds the start of the week for any first day', () => {
      // Wednesday 13 May 2026.
      expect(toIsoDate(startOfWeek(d('2026-05-13'), 0))).to.equal('2026-05-10');
      expect(toIsoDate(startOfWeek(d('2026-05-13'), 1))).to.equal('2026-05-11');
      expect(toIsoDate(startOfWeek(d('2026-05-13'), 6))).to.equal('2026-05-09');
      expect(toIsoDate(startOfWeek(d('2026-05-10'), 0))).to.equal('2026-05-10');
      // Across a year: Thursday 1 January 2026, weeks starting Monday.
      expect(toIsoDate(startOfWeek(d('2026-01-01'), 1))).to.equal('2025-12-29');
    });
  });

  describe('monthGrid', () => {
    it('lays a month out in six weeks', () => {
      // 1 May 2026 is a Friday.
      const grid = monthGrid(2026, 5, 0);
      expect(grid).to.have.length(42);
      expect(grid.slice(0, 5)).to.deep.equal([null, null, null, null, null]);
      expect(grid[5]).to.deep.equal({ year: 2026, month: 5, day: 1 });
      expect(grid[35]).to.deep.equal({ year: 2026, month: 5, day: 31 });
      expect(grid.slice(36)).to.deep.equal([null, null, null, null, null, null]);
    });

    it('shifts with the first day of the week', () => {
      expect(monthGrid(2026, 5, 1).findIndex((cell) => cell !== null)).to.equal(4);
      expect(monthGrid(2026, 5, 6).findIndex((cell) => cell !== null)).to.equal(6);
    });

    it('starts a month that begins on the first day of the week in the first cell', () => {
      // 1 February 2026 is a Sunday.
      const grid = monthGrid(2026, 2, 0);
      expect(grid[0]).to.deep.equal({ year: 2026, month: 2, day: 1 });
      expect(grid.filter(Boolean)).to.have.length(28);
    });
  });

  describe('lists', () => {
    it('reads weekday tokens in any order and case, ignoring unknown ones', () => {
      expect([...parseWeekdays('sat sun')].sort()).to.deep.equal([0, 6]);
      expect([...parseWeekdays(' Mon  FRI weekend ')].sort()).to.deep.equal([1, 5]);
      expect(parseWeekdays('').size).to.equal(0);
      expect(parseWeekdays(null).size).to.equal(0);
    });

    it('reads a whitespace-separated date list, dropping what is not a date', () => {
      const dates = parseIsoDateList(' 2026-05-12\n\t2026-12-25  2026-02-30 soon 2026-05-12 ');
      expect([...dates]).to.deep.equal(['2026-05-12', '2026-12-25']);
      expect(parseIsoDateList(undefined).size).to.equal(0);
    });
  });

  describe('locale', () => {
    it("reads the locale's first day of the week", () => {
      expect(firstDayOfWeekFor('en-US')).to.equal(0);
      expect(firstDayOfWeekFor('en')).to.equal(0);
      expect(firstDayOfWeekFor('en-GB')).to.equal(1);
      expect(firstDayOfWeekFor('de')).to.equal(1);
      expect(firstDayOfWeekFor('fr-FR')).to.equal(1);
      expect(firstDayOfWeekFor('ar-EG')).to.equal(6);
    });

    it('canonicalizes a tag and falls back to English for a malformed one', () => {
      expect(resolveLocale('en-gb')).to.equal('en-GB');
      expect(resolveLocale('')).to.equal('en');
      expect(resolveLocale(null)).to.equal('en');
      expect(resolveLocale('not a locale!')).to.equal('en');
    });

    it('formats a date as the same calendar day in UTC', () => {
      const format = new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeZone: 'UTC' });
      expect(format.format(toUtcDate(d('2026-05-11')))).to.equal('Monday, May 11, 2026');
      expect(format.format(toUtcDate(d('2026-01-01')))).to.equal('Thursday, January 1, 2026');
    });
  });
});
