/**
 * Calendar-date helpers for `<cs-date-picker>`.
 *
 * A calendar date is a day on the calendar, not an instant. Every helper here works on `{ year, month, day }` and
 * does its arithmetic on UTC `Date` objects, so neither the local time zone nor a daylight-saving change can move a
 * date. `localToday()` is the one helper that reads the local clock, because "today" is the one date that depends on
 * where the user is.
 */

export interface CalendarDate {
  year: number;
  /** 1 to 12. */
  month: number;
  day: number;
}

/** A weekday as the picker's attributes spell it, in `Date.prototype.getUTCDay()` order. */
export type WeekdayToken = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

export const WEEKDAY_TOKENS: readonly WeekdayToken[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

/** `YYYY-MM-DD` has four year digits, so these are the first and last dates a value can name. */
export const FIRST_DATE: CalendarDate = { year: 1, month: 1, day: 1 };
export const LAST_DATE: CalendarDate = { year: 9999, month: 12, day: 31 };

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * A UTC midnight for the date. `setUTCFullYear` rather than `Date.UTC`, because `Date.UTC` reads years 0 to 99 as
 * 1900 to 1999.
 */
function toUtc({ year, month, day }: CalendarDate): Date {
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  return date;
}

function fromUtc(date: Date): CalendarDate {
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

/** The number of days in a month, leap years included. */
export function daysInMonth(year: number, month: number): number {
  // Day 0 of the next month is the last day of this one.
  return toUtc({ year, month: month + 1, day: 0 }).getUTCDate();
}

/** Reads a strict `YYYY-MM-DD` that names a real date. Anything else, including `null`, is `null`. */
export function parseIsoDate(value: string | null | undefined): CalendarDate | null {
  const match = ISO_DATE.exec(value ?? '');
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) {
    return null;
  }
  return { year, month, day };
}

export function toIsoDate({ year, month, day }: CalendarDate): string {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** A `Date` at UTC midnight on this day. Format it with `timeZone: 'UTC'`, never with the local zone. */
export function toUtcDate(date: CalendarDate): Date {
  return toUtc(date);
}

/** Negative when `a` is earlier, positive when later, zero when they are the same day. */
export function compareDates(a: CalendarDate, b: CalendarDate): number {
  return a.year - b.year || a.month - b.month || a.day - b.day;
}

export function isSameDate(a: CalendarDate | null, b: CalendarDate | null): boolean {
  return a !== null && b !== null && compareDates(a, b) === 0;
}

export function isSameMonth(a: CalendarDate, b: CalendarDate): boolean {
  return a.year === b.year && a.month === b.month;
}

export function clampDate(date: CalendarDate, min: CalendarDate, max: CalendarDate): CalendarDate {
  if (compareDates(date, min) < 0) {
    return min;
  }
  if (compareDates(date, max) > 0) {
    return max;
  }
  return date;
}

export function addDays(date: CalendarDate, days: number): CalendarDate {
  const utc = toUtc(date);
  utc.setUTCDate(utc.getUTCDate() + days);
  return fromUtc(utc);
}

/** Moves by whole months, keeping the day where the month has it and using the month's last day where it doesn't. */
export function addMonths(date: CalendarDate, months: number): CalendarDate {
  const index = date.year * 12 + (date.month - 1) + months;
  const year = Math.floor(index / 12);
  const month = index - year * 12 + 1;
  return { year, month, day: Math.min(date.day, daysInMonth(year, month)) };
}

/** 0 for Sunday through 6 for Saturday. */
export function dayOfWeek(date: CalendarDate): number {
  return toUtc(date).getUTCDay();
}

/** The first day of the week holding `date`, for a week that starts on `firstDayOfWeek` (0 is Sunday). */
export function startOfWeek(date: CalendarDate, firstDayOfWeek: number): CalendarDate {
  return addDays(date, -((dayOfWeek(date) - firstDayOfWeek + 7) % 7));
}

/**
 * The 42 cells of a six-week month grid, in reading order. A cell is the date it shows, or `null` where the grid has
 * no day of this month. Always six rows, so the grid's height and markup never change from one month to the next.
 */
export function monthGrid(year: number, month: number, firstDayOfWeek: number): (CalendarDate | null)[] {
  const lead = (dayOfWeek({ year, month, day: 1 }) - firstDayOfWeek + 7) % 7;
  const count = daysInMonth(year, month);
  return Array.from({ length: 42 }, (_, index) => {
    const day = index - lead + 1;
    return day >= 1 && day <= count ? { year, month, day } : null;
  });
}

/** Today in the user's own time zone. */
export function localToday(): CalendarDate {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
}

/** Reads a space-separated list of weekday tokens (`sat sun`) into weekday numbers. Unknown tokens are ignored. */
export function parseWeekdays(value: string | null | undefined): Set<number> {
  const days = new Set<number>();
  for (const token of (value ?? '').toLowerCase().split(/\s+/)) {
    const index = WEEKDAY_TOKENS.indexOf(token as WeekdayToken);
    if (index !== -1) {
      days.add(index);
    }
  }
  return days;
}

/** Reads a whitespace-separated list of `YYYY-MM-DD` dates into a set of the valid ones. */
export function parseIsoDateList(value: string | null | undefined): Set<string> {
  const dates = new Set<string>();
  for (const token of (value ?? '').split(/\s+/)) {
    const date = parseIsoDate(token);
    if (date) {
      dates.add(toIsoDate(date));
    }
  }
  return dates;
}

// Unicode's published first day of the week by region, the data `Intl` itself uses, for engines whose `Intl.Locale`
// has no week info. Every region not listed starts on Monday.
const SUNDAY_FIRST = new Set(
  (
    'AG AS BD BR BS BT BW BZ CA CO DM DO ET GT GU HK HN ID IL IN JM JP KE KH KR LA MH MM MO MT MX MZ NI NP PA PE PH ' +
    'PK PR PT PY SA SG SV TH TT TW UM US VE VI WS YE ZA ZW'
  ).split(' '),
);
const SATURDAY_FIRST = new Set('AE AF BH DJ DZ EG IQ IR JO KW LY OM QA SD SY'.split(' '));
const FRIDAY_FIRST = new Set(['MV']);

interface WeekInfoLocale extends Intl.Locale {
  getWeekInfo?: () => { firstDay: number };
  weekInfo?: { firstDay: number };
}

/** The locale's first day of the week, 0 for Sunday through 6 for Saturday. */
export function firstDayOfWeekFor(locale: string): number {
  let region: string | undefined;
  try {
    const intlLocale = new Intl.Locale(locale) as WeekInfoLocale;
    // `getWeekInfo()` is the current spelling and the `weekInfo` getter the one engines shipped first. Both number
    // Monday 1 through Sunday 7.
    const weekInfo = intlLocale.getWeekInfo?.() ?? intlLocale.weekInfo;
    if (weekInfo?.firstDay) {
      return weekInfo.firstDay % 7;
    }
    region = intlLocale.maximize().region;
  } catch {
    return 0;
  }
  if (region && SUNDAY_FIRST.has(region)) {
    return 0;
  }
  if (region && SATURDAY_FIRST.has(region)) {
    return 6;
  }
  if (region && FRIDAY_FIRST.has(region)) {
    return 5;
  }
  return 1;
}

/** A BCP-47 tag `Intl` accepts, or `en` when the tag is malformed. */
export function resolveLocale(tag: string | null | undefined): string {
  try {
    return Intl.getCanonicalLocales(tag || 'en')[0] ?? 'en';
  } catch {
    return 'en';
  }
}
