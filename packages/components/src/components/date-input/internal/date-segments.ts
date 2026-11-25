/**
 * Pure, DOM-free model for the segmented field of `<cs-date-input>`: which month, day and year segments it shows and
 * in what order for a locale, how typing and the arrow keys change each one, and how they compose to an ISO date. It
 * plays the same role for date-input as `time-input/internal/time-segments.ts` does for time-input, and is wired to the
 * shared `SegmentedFieldController` through `dateSegmentRules()`.
 *
 * The value is always `YYYY-MM-DD`. Only the segment order and the separators between them come from the locale.
 */

import { typeNumericSegment } from '../../../internal/segmented-field/numeric-segment.js';
import type {
  SegmentLayout,
  SegmentRules,
  TypeDigitResult,
} from '../../../internal/segmented-field/segmented-field-controller.js';
import { type CalendarDate, daysInMonth, parseIsoDate, toIsoDate } from '../../date-picker/internal/calendar-date.js';

export type DateField = 'year' | 'month' | 'day';

/** A partly or fully entered date. `null` is an empty segment. */
export interface DateSegments {
  year: number | null;
  /** 1 to 12. */
  month: number | null;
  day: number | null;
}

export const EMPTY_DATE_SEGMENTS: Readonly<DateSegments> = { year: null, month: null, day: null };

/** `YYYY-MM-DD` has four year digits. */
const YEAR_DIGITS = 4;

/** A leap year, so 29 February is a step away while the year is still empty. */
const LEAP_YEAR = 2000;

const BOUNDS: Record<DateField, { min: number; max: number }> = {
  year: { min: 1, max: 9999 },
  month: { min: 1, max: 12 },
  day: { min: 1, max: 31 },
};

const FALLBACK_LAYOUT: SegmentLayout = {
  tokens: [
    { kind: 'segment', field: 'month' },
    { kind: 'literal', text: '/' },
    { kind: 'segment', field: 'day' },
    { kind: 'literal', text: '/' },
    { kind: 'segment', field: 'year' },
  ],
  order: ['month', 'day', 'year'],
};

const layoutCache = new Map<string, SegmentLayout>();
const monthNameFormats = new Map<string, Intl.DateTimeFormat>();

/** Clears the layout cache (for tests). */
export function clearDateSegmentLayoutCache(): void {
  layoutCache.clear();
}

/**
 * The segments and separators for a locale, read from `Intl.DateTimeFormat.formatToParts()` for a date whose month, day
 * and year can't be confused. Separators are kept as the locale writes them (`/`, `.`, `. ` and trailing text such as
 * Korean's final `.`). Digits are Latin, since the value is.
 */
export function buildDateSegmentLayout(locale: string): SegmentLayout {
  const key = locale || 'en';
  const cached = layoutCache.get(key);
  if (cached) {
    return cached;
  }

  let parts: Intl.DateTimeFormatPart[] = [];
  try {
    parts = new Intl.DateTimeFormat(key, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      calendar: 'gregory',
      numberingSystem: 'latn',
      timeZone: 'UTC',
    }).formatToParts(Date.UTC(2026, 0, 23));
  } catch {
    // A tag `Intl` rejects gets the fallback below.
  }

  const tokens: SegmentLayout['tokens'] = [];
  const order: DateField[] = [];
  for (const part of parts) {
    if (part.type === 'year' || part.type === 'month' || part.type === 'day') {
      tokens.push({ kind: 'segment', field: part.type });
      order.push(part.type);
    } else if (part.type === 'literal') {
      tokens.push({ kind: 'literal', text: part.value });
    }
  }

  const layout = order.length === 3 && new Set(order).size === 3 ? { tokens, order } : FALLBACK_LAYOUT;
  layoutCache.set(key, layout);
  return layout;
}

/** The range a segment's spinbutton announces, and the range typing accepts. */
export function dateSegmentBounds(field: DateField): { min: number; max: number } {
  return BOUNDS[field];
}

/** The last day the day segment steps to: the month's length once the month is known, 29 February until the year is. */
function lastDayFor(segments: DateSegments): number {
  return segments.month === null ? BOUNDS.day.max : daysInMonth(segments.year ?? LEAP_YEAR, segments.month);
}

/**
 * The value a segment steps to with Arrow Up (`1`) or Arrow Down (`-1`), or `null` when it can't move.
 *
 * - An empty segment takes today's month, day or year.
 * - Month and day wrap within their range without carrying into the next segment, as a native date input does. The
 *   day wraps at the month's last day.
 * - The year stops at 1 and 9999, the ends of what `YYYY-MM-DD` can hold.
 */
export function stepDateSegment(
  segments: DateSegments,
  field: DateField,
  delta: -1 | 1,
  today: CalendarDate,
): number | null {
  const current = segments[field];
  const max = field === 'day' ? lastDayFor(segments) : BOUNDS[field].max;

  if (current === null) {
    return Math.min(today[field], max);
  }
  if (field === 'year') {
    const next = current + delta;
    return next < BOUNDS.year.min || next > BOUNDS.year.max ? null : next;
  }
  // A typed 31 in a 30-day month steps into the month's range rather than past it.
  if (current > max) {
    return delta > 0 ? 1 : max;
  }
  const next = current + delta;
  if (next > max) {
    return 1;
  }
  return next < 1 ? max : next;
}

/**
 * Applies one typed digit to a segment. Month and day follow the shared two-digit rule. The year is held in its buffer
 * until it has four digits, and keeps the year it had meanwhile: `2`, `20` and `202` are never the year meant, so they
 * never reach `value`.
 */
export function typeDateDigit(
  field: DateField,
  buffer: string,
  digit: string,
  current: number | null,
): TypeDigitResult {
  if (field !== 'year') {
    const { min, max } = BOUNDS[field];
    return typeNumericSegment(buffer, digit, min, max);
  }
  const next = buffer + digit;
  if (next.length >= YEAR_DIGITS) {
    return { value: commitDateBuffer('year', next), buffer: '', advance: true };
  }
  return { value: current, buffer: next, advance: false };
}

/** The value a pending buffer commits to when focus leaves its segment. Below the segment's range is no value. */
export function commitDateBuffer(field: DateField, buffer: string): number | null {
  const value = Number(buffer);
  return Number.isInteger(value) && value >= BOUNDS[field].min ? value : null;
}

/** What a segment shows: the digits being typed, else its value, zero-padded, else dashes as wide as the segment. */
export function formatDateSegmentText(field: DateField, value: number | null, buffer: string): string {
  const width = field === 'year' ? YEAR_DIGITS : 2;
  if (buffer) {
    return buffer.padStart(width, '0');
  }
  if (value === null) {
    return '-'.repeat(width);
  }
  return String(value).padStart(width, '0');
}

/** The month's full name in a locale, for the month segment's `aria-valuetext`. */
export function formatMonthName(locale: string, month: number): string {
  let format = monthNameFormats.get(locale);
  if (!format) {
    format = new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC' });
    monthNameFormats.set(locale, format);
  }
  return format.format(Date.UTC(2000, month - 1, 1));
}

/** True when no segment holds a value. */
export function isDateSegmentsEmpty(segments: DateSegments): boolean {
  return segments.year === null && segments.month === null && segments.day === null;
}

/** `YYYY-MM-DD` when every segment is filled and together they name a real date (not 31 April), else `''`. */
export function dateSegmentsToIso({ year, month, day }: DateSegments): string {
  if (year === null || month === null || day === null) {
    return '';
  }
  const iso = toIsoDate({ year, month, day });
  return parseIsoDate(iso) ? iso : '';
}

/** The segments for a `YYYY-MM-DD` value, all empty when it isn't a real date. */
export function isoToDateSegments(iso: string): DateSegments {
  const date = parseIsoDate(iso);
  return date ? { ...date } : { ...EMPTY_DATE_SEGMENTS };
}

/**
 * The rules `SegmentedFieldController` applies to the date segments. They compute and never write: the controller
 * hands every result to the host's `onCommit`, which is the one place segments change.
 */
export function dateSegmentRules(options: {
  getSegments: () => DateSegments;
  today: () => CalendarDate;
}): SegmentRules {
  return {
    typeDigit: (_group, field, buffer, digit) =>
      typeDateDigit(field as DateField, buffer, digit, options.getSegments()[field as DateField]),
    step: (_group, field, delta) => {
      const value = stepDateSegment(options.getSegments(), field as DateField, delta, options.today());
      return value === null ? null : { value };
    },
    bounds: (_group, field) => dateSegmentBounds(field as DateField),
    commitBuffer: (_group, field, buffer) => commitDateBuffer(field as DateField, buffer),
    clear: (_group, field) => options.getSegments()[field as DateField] !== null,
  };
}
