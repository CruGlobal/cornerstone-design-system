import { html, isServer, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { CsChangeEvent } from '../../events/change.js';
import CornerstoneElement from '../../internal/cornerstone-element.js';
import { customElement } from '../../internal/custom-element.js';
import { announce } from '../../internal/live-announcer.js';
import sizeStyles from '../../styles/component/size.styles.js';
import visuallyHidden from '../../styles/component/visually-hidden.styles.js';
import { LocalizeController } from '../../utilities/localize.js';
import '../icon/icon.js';
import styles from './date-picker.styles.js';
import {
  addDays,
  addMonths,
  type CalendarDate,
  clampDate,
  compareDates,
  dayOfWeek,
  FIRST_DATE,
  firstDayOfWeekFor,
  isSameDate,
  isSameMonth,
  LAST_DATE,
  localToday,
  monthGrid,
  parseIsoDate,
  parseIsoDateList,
  parseWeekdays,
  resolveLocale,
  startOfWeek,
  toIsoDate,
  toUtcDate,
  WEEKDAY_TOKENS,
  type WeekdayToken,
} from './internal/calendar-date.js';

export type CsDatePickerSize = 'xs' | 's' | 'm' | 'l' | 'xl';
export type CsDatePickerFirstDayOfWeek = 'auto' | WeekdayToken;

/** How many steps a keyboard move takes past disabled dates before it gives up and stays put. */
const MAX_SEARCH_STEPS = 1000;

/**
 * The longest short weekday name a day's column fits, in characters: `lun.`, `Mo.`, `Sun`. Measured against the
 * 2.25em `.day` width and the 0.75em `.weekday-short` font size in `date-picker.styles.ts`.
 */
const MAX_SHORT_WEEKDAY_LENGTH = 4;

/** A Sunday, for asking `Intl` the name of each weekday. */
const REFERENCE_SUNDAY: CalendarDate = { year: 2023, month: 1, day: 1 };

const dateFormats = new Map<string, Intl.DateTimeFormat>();
const numberFormats = new Map<string, Intl.NumberFormat>();

/** A cached `Intl.DateTimeFormat` that reads every date in UTC, which is how `calendar-date.ts` builds them. */
function dateFormat(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${locale}|${JSON.stringify(options)}`;
  let format = dateFormats.get(key);
  if (!format) {
    format = new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' });
    dateFormats.set(key, format);
  }
  return format;
}

/** The day of the month in the locale's digits, with no suffix (`Intl`'s `day` option gives Japanese `11日`). */
function dayNumberFormat(locale: string): Intl.NumberFormat {
  let format = numberFormats.get(locale);
  if (!format) {
    format = new Intl.NumberFormat(locale, { useGrouping: false });
    numberFormats.set(locale, format);
  }
  return format;
}

interface Constraints {
  lower: CalendarDate;
  upper: CalendarDate;
  dates: Set<string>;
  weekdays: Set<number>;
}

/**
 * @summary Date pickers show a month as a grid of days, so people can browse the calendar and pick one date.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/date-picker
 * @status experimental
 * @since 0.14
 *
 * @dependency cs-icon
 *
 * @event cs-change - Emitted when the user picks a date. Read the new date from the picker's `value`.
 *
 * @csspart date-picker - The component's outer wrapper.
 * @csspart header - The row holding the month title and the navigation buttons.
 * @csspart title - The month and year on show. It also names the grid.
 * @csspart navigation-button - The previous and next month buttons.
 * @csspart navigation-button-previous - Added to the previous month button.
 * @csspart navigation-button-next - Added to the next month button.
 * @csspart grid - The `<table>` of days.
 * @csspart weekday - Each weekday column header.
 * @csspart day - Each cell holding a day of the month.
 * @csspart day-selected - Added to the selected day.
 * @csspart day-today - Added to today.
 * @csspart day-disabled - Added to a day that can't be picked.
 */
@customElement('cs-date-picker')
export default class CsDatePicker extends CornerstoneElement {
  static css = [sizeStyles, visuallyHidden, styles];

  readonly localize = new LocalizeController(this);

  private constraintCache: { key: string; value: Constraints } | null = null;
  private refocusAfterUpdate = false;

  /** The day the grid's tab stop sits on. Its month is the month on show. `null` until the user moves it. */
  @state() private activeDate: CalendarDate | null = null;

  /**
   * The selected date as `YYYY-MM-DD`, or an empty string for none. It reflects to the `value` attribute, so the
   * attribute always holds the current date. A value that isn't a real date shows no selection.
   */
  @property({ reflect: true }) value = '';

  /** The earliest date that can be picked, as `YYYY-MM-DD`. */
  @property() min = '';

  /** The latest date that can be picked, as `YYYY-MM-DD`. */
  @property() max = '';

  /** Dates that can't be picked, as a whitespace-separated list of `YYYY-MM-DD` dates. */
  @property({ attribute: 'disabled-dates' }) disabledDates = '';

  /** Weekdays that can't be picked, as a space-separated list of `sun`, `mon`, `tue`, `wed`, `thu`, `fri` and `sat`. */
  @property({ attribute: 'disabled-days-of-week' }) disabledDaysOfWeek = '';

  /**
   * The date to mark as today, as `YYYY-MM-DD`. When empty, today comes from the user's clock and time zone. Set it
   * when your app's day follows another time zone, or so the server and the browser render the same today.
   */
  @property() today = '';

  /** The weekday in the first column. `auto` takes it from the locale. */
  @property({ attribute: 'first-day-of-week' }) firstDayOfWeek: CsDatePickerFirstDayOfWeek = 'auto';

  /**
   * The BCP-47 locale for the month and weekday names, the digits and the first day of the week. When empty, the
   * inherited `lang` is used. The button labels follow `lang`.
   */
  @property() locale = '';

  /** Disables the picker. No day can be focused or picked, and the month can't change. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Shows the value without letting the user change it. Days stay focusable and the month can still change. */
  @property({ type: Boolean, reflect: true }) readonly = false;

  /** The picker's size. Every dimension inside it scales with this. */
  @property({ reflect: true }) size: CsDatePickerSize = 'm';

  protected willUpdate(changedProperties: PropertyValues<this>) {
    super.willUpdate(changedProperties);

    // A new value brings its month into view. The first render does that already.
    if (changedProperties.has('value') && this.hasUpdated) {
      const date = parseIsoDate(this.value);
      if (date) {
        this.activeDate = date;
      }
    }

    // This render may move the tab stop to another cell, or give the focused cell another day. Remember to put
    // focus back on the tab stop afterwards.
    if (!isServer) {
      this.refocusAfterUpdate = this.shadowRoot?.activeElement instanceof HTMLTableCellElement;
    }
  }

  protected updated(changedProperties: PropertyValues<this>) {
    super.updated(changedProperties);

    if (this.refocusAfterUpdate) {
      this.refocusAfterUpdate = false;
      const cell = this.tabStopCell;
      if (cell && this.shadowRoot?.activeElement !== cell) {
        cell.focus();
      }
    }
  }

  private get resolvedLocale(): string {
    return resolveLocale(this.locale || this.localize.lang());
  }

  private get isRtl(): boolean {
    // `localize.dir()` reads the document, which the server doesn't have.
    return isServer ? this.dir === 'rtl' : this.localize.dir() === 'rtl';
  }

  private resolvedFirstDayOfWeek(locale: string): number {
    const index = WEEKDAY_TOKENS.indexOf(this.firstDayOfWeek as WeekdayToken);
    return index === -1 ? firstDayOfWeekFor(locale) : index;
  }

  private get resolvedToday(): CalendarDate {
    return parseIsoDate(this.today) ?? localToday();
  }

  /** The day the tab stop sits on: the user's last move, else the value, else today kept inside `min` and `max`. */
  private get resolvedActiveDate(): CalendarDate {
    if (this.activeDate) {
      return this.activeDate;
    }
    const { lower, upper } = this.constraints;
    return parseIsoDate(this.value) ?? clampDate(this.resolvedToday, lower, upper);
  }

  /** `min`, `max` and the disabled lists, read once per change rather than once per cell. */
  private get constraints(): Constraints {
    // Attributes a morph removes arrive as `null`, so every read tolerates it.
    const key = [this.min, this.max, this.disabledDates, this.disabledDaysOfWeek].join('|');
    if (this.constraintCache?.key !== key) {
      const min = parseIsoDate(this.min);
      const max = parseIsoDate(this.max);
      this.constraintCache = {
        key,
        value: {
          lower: min && compareDates(min, FIRST_DATE) > 0 ? min : FIRST_DATE,
          upper: max && compareDates(max, LAST_DATE) < 0 ? max : LAST_DATE,
          dates: parseIsoDateList(this.disabledDates),
          weekdays: parseWeekdays(this.disabledDaysOfWeek),
        },
      };
    }
    return this.constraintCache.value;
  }

  /** True for a date outside `min` and `max` or on a disabled list. Says nothing about the `disabled` attribute. */
  private isUnavailable(date: CalendarDate): boolean {
    const { lower, upper, dates, weekdays } = this.constraints;
    return (
      compareDates(date, lower) < 0 ||
      compareDates(date, upper) > 0 ||
      dates.has(toIsoDate(date)) ||
      weekdays.has(dayOfWeek(date))
    );
  }

  private isDateDisabled(date: CalendarDate): boolean {
    return this.disabled || this.isUnavailable(date);
  }

  private get tabStopCell(): HTMLElement | null {
    return this.shadowRoot?.querySelector<HTMLElement>('td[tabindex="0"]') ?? null;
  }

  /**
   * The first date that can take focus, stepping from `start` by `step` days. `start` itself counts when `inclusive`.
   * `null` when the search leaves `min` and `max` first.
   */
  private findFocusableDate(start: CalendarDate, step: number, inclusive = false): CalendarDate | null {
    const { lower, upper } = this.constraints;
    let candidate = inclusive ? start : addDays(start, step);
    for (let i = 0; i < MAX_SEARCH_STEPS; i++) {
      if (compareDates(candidate, lower) < 0 || compareDates(candidate, upper) > 0) {
        return null;
      }
      if (!this.isDateDisabled(candidate)) {
        return candidate;
      }
      candidate = addDays(candidate, step);
    }
    return null;
  }

  /** The date `months` away, kept inside `min` and `max`, or the nearest date to it that can take focus. */
  private findDateMonthsAway(from: CalendarDate, months: number): CalendarDate | null {
    const { lower, upper } = this.constraints;
    const target = clampDate(addMonths(from, months), lower, upper);
    const direction = Math.sign(months);
    return this.findFocusableDate(target, direction, true) ?? this.findFocusableDate(target, -direction, true);
  }

  private get isPreviousMonthUnavailable(): boolean {
    const { year, month } = this.resolvedActiveDate;
    return compareDates(addDays({ year, month, day: 1 }, -1), this.constraints.lower) < 0;
  }

  private get isNextMonthUnavailable(): boolean {
    const { year, month } = this.resolvedActiveDate;
    return compareDates(addMonths({ year, month, day: 1 }, 1), this.constraints.upper) > 0;
  }

  private monthTitle(date: CalendarDate, locale: string): string {
    return dateFormat(locale, { month: 'long', year: 'numeric' }).format(toUtcDate(date));
  }

  /** Moves the tab stop, and announces the month when it changes, since the title isn't where focus is. */
  private moveTo(date: CalendarDate) {
    const previous = this.resolvedActiveDate;
    this.activeDate = date;
    if (!isSameMonth(previous, date)) {
      announce(this.monthTitle(date, this.resolvedLocale));
    }
  }

  private selectDate(date: CalendarDate) {
    if (this.readonly || this.isDateDisabled(date)) {
      return;
    }
    const iso = toIsoDate(date);
    if (iso === this.value) {
      return;
    }
    this.value = iso;
    this.dispatchEvent(new CsChangeEvent());
  }

  private goToMonth(offset: number) {
    const unavailable = offset < 0 ? this.isPreviousMonthUnavailable : this.isNextMonthUnavailable;
    if (this.disabled || unavailable) {
      return;
    }
    const { lower, upper } = this.constraints;
    this.moveTo(clampDate(addMonths(this.resolvedActiveDate, offset), lower, upper));
  }

  private handlePreviousClick() {
    this.goToMonth(-1);
  }

  private handleNextClick() {
    this.goToMonth(1);
  }

  private handleGridClick(event: MouseEvent) {
    const cell = (event.target as Element).closest<HTMLElement>('td[data-date]');
    const date = parseIsoDate(cell?.dataset.date);
    if (!date || this.isDateDisabled(date)) {
      return;
    }
    this.activeDate = date;
    this.selectDate(date);
  }

  private handleGridKeyDown(event: KeyboardEvent) {
    // Leave modified keys alone. Alt+Arrow is the browser's back and forward, and a picker inside a popup leaves
    // Alt+ArrowUp to whatever opened it.
    if (this.disabled || event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }
    // Shift only changes PageUp and PageDown. Other shifted keys are left for a range mode to give meaning to.
    if (event.shiftKey && event.key !== 'PageUp' && event.key !== 'PageDown') {
      return;
    }

    const cell = (event.target as Element).closest<HTMLElement>('td[data-date]');
    const from = parseIsoDate(cell?.dataset.date);
    if (!from) {
      return;
    }

    const { lower, upper } = this.constraints;
    const firstDayOfWeek = this.resolvedFirstDayOfWeek(this.resolvedLocale);
    const weekStart = startOfWeek(from, firstDayOfWeek);
    // In a right-to-left grid the next day sits to the left.
    const forward = this.isRtl ? -1 : 1;
    let to: CalendarDate | null;

    switch (event.key) {
      case 'ArrowLeft':
        to = this.findFocusableDate(from, -forward);
        break;
      case 'ArrowRight':
        to = this.findFocusableDate(from, forward);
        break;
      case 'ArrowUp':
        to = this.findFocusableDate(from, -7);
        break;
      case 'ArrowDown':
        to = this.findFocusableDate(from, 7);
        break;
      case 'Home':
        to = this.findFocusableDate(clampDate(weekStart, lower, upper), 1, true);
        break;
      case 'End':
        to = this.findFocusableDate(clampDate(addDays(weekStart, 6), lower, upper), -1, true);
        break;
      case 'PageUp':
        to = this.findDateMonthsAway(from, event.shiftKey ? -12 : -1);
        break;
      case 'PageDown':
        to = this.findDateMonthsAway(from, event.shiftKey ? 12 : 1);
        break;
      case 'Enter':
      case ' ':
        to = null;
        this.selectDate(from);
        break;
      default:
        // Tab, Escape and everything else go on to the page and to any overlay the picker sits in.
        return;
    }

    // The grid owns these keys: no page scroll, and nothing around the picker acts on them as well.
    event.preventDefault();
    event.stopPropagation();

    if (to) {
      this.moveTo(to);
    }
  }

  /** Moves focus to the day that takes it: the selected day, today, or the first day that can be picked. */
  focus(options?: FocusOptions) {
    this.tabStopCell?.focus(options);
  }

  /** Removes focus from the picker. */
  blur() {
    (this.shadowRoot?.activeElement as HTMLElement | null)?.blur();
  }

  render() {
    const locale = this.resolvedLocale;
    const active = this.resolvedActiveDate;
    const selected = parseIsoDate(this.value);
    const today = this.resolvedToday;
    const firstDayOfWeek = this.resolvedFirstDayOfWeek(locale);
    const cells = monthGrid(active.year, active.month, firstDayOfWeek);

    // The one cell in the tab order: where the user left it, else the selected day, today or the first day that can
    // take focus. With nothing to focus the grid has no tab stop.
    const focusable = cells.filter((date): date is CalendarDate => date !== null && !this.isDateDisabled(date));
    const tabStop =
      focusable.find((date) => isSameDate(date, active)) ??
      focusable.find((date) => isSameDate(date, selected)) ??
      focusable.find((date) => isSameDate(date, today)) ??
      focusable[0] ??
      null;

    const fullDate = dateFormat(locale, { dateStyle: 'full' });
    const dayNumber = dayNumberFormat(locale);
    const weekdays = Array.from({ length: 7 }, (_, index) => {
      const date = toUtcDate(addDays(REFERENCE_SUNDAY, firstDayOfWeek + index));
      return {
        long: dateFormat(locale, { weekday: 'long' }).format(date),
        short: dateFormat(locale, { weekday: 'short' }).format(date),
        narrow: dateFormat(locale, { weekday: 'narrow' }).format(date),
      };
    });
    // Some locales' short names are whole words (Arabic's are its long names), too wide for a day's column. Those
    // get the narrow names. Screen readers hear the long name either way.
    const useNarrowWeekdays = weekdays.some(({ short }) => [...short].length > MAX_SHORT_WEEKDAY_LENGTH);
    const rows = Array.from({ length: 6 }, (_, row) => cells.slice(row * 7, row * 7 + 7));

    // While the whole picker is disabled the buttons leave the tab order. At `min` or `max` they stay in it, marked
    // unavailable, so the button just pressed keeps focus.
    const previousUnavailable = !this.disabled && this.isPreviousMonthUnavailable;
    const nextUnavailable = !this.disabled && this.isNextMonthUnavailable;

    const renderDay = (date: CalendarDate | null) => {
      const isUnavailable = date !== null && this.isUnavailable(date);
      const isDisabled = date !== null && (this.disabled || isUnavailable);
      const isSelected = isSameDate(date, selected);
      const isToday = isSameDate(date, today);
      const tabIndex = date && !isDisabled ? (isSameDate(date, tabStop) ? '0' : '-1') : undefined;

      return html`<td
        role="gridcell"
        part="${date ? 'day' : ''} ${isSelected ? 'day-selected' : ''} ${isToday ? 'day-today' : ''} ${
          isDisabled ? 'day-disabled' : ''
        }"
        class="${date ? 'day' : 'placeholder'} ${isUnavailable ? 'day-unavailable' : ''}"
        data-date=${ifDefined(date ? toIsoDate(date) : undefined)}
        tabindex=${ifDefined(tabIndex)}
        aria-selected=${ifDefined(date ? String(isSelected) : undefined)}
        aria-current=${ifDefined(isToday ? 'date' : undefined)}
        aria-disabled=${ifDefined(isDisabled ? 'true' : undefined)}
        aria-label=${ifDefined(date ? fullDate.format(toUtcDate(date)) : undefined)}
      >
        ${date ? dayNumber.format(date.day) : ''}
      </td>`;
    };

    return html`
      <div part="date-picker" class="date-picker">
        <div part="header" class="header">
          <button
            type="button"
            part="navigation-button navigation-button-previous"
            class="navigation-button"
            aria-label=${this.localize.term('previousMonth')}
            aria-disabled=${ifDefined(previousUnavailable ? 'true' : undefined)}
            ?disabled=${this.disabled}
            @click=${this.handlePreviousClick}
          >
            <cs-icon library="system" name=${this.isRtl ? 'keyboard_arrow_right' : 'keyboard_arrow_left'}></cs-icon>
          </button>
          <div part="title" class="title" id="title">${this.monthTitle(active, locale)}</div>
          <button
            type="button"
            part="navigation-button navigation-button-next"
            class="navigation-button"
            aria-label=${this.localize.term('nextMonth')}
            aria-disabled=${ifDefined(nextUnavailable ? 'true' : undefined)}
            ?disabled=${this.disabled}
            @click=${this.handleNextClick}
          >
            <cs-icon library="system" name=${this.isRtl ? 'keyboard_arrow_left' : 'keyboard_arrow_right'}></cs-icon>
          </button>
        </div>

        <table
          part="grid"
          class="grid"
          role="grid"
          aria-labelledby="title"
          aria-readonly=${ifDefined(this.readonly ? 'true' : undefined)}
          aria-disabled=${ifDefined(this.disabled ? 'true' : undefined)}
          @click=${this.handleGridClick}
          @keydown=${this.handleGridKeyDown}
        >
          <thead>
            <tr>
              ${weekdays.map(
                (weekday) => html`
                  <th scope="col" part="weekday" class="weekday">
                    <span class="weekday-short" aria-hidden="true">
                      ${useNarrowWeekdays ? weekday.narrow : weekday.short}
                    </span>
                    <span class="cs-visually-hidden">${weekday.long}</span>
                  </th>
                `,
              )}
            </tr>
          </thead>
          <tbody>
            ${rows.map(
              (row) =>
                html`<tr>
                  ${row.map(renderDay)}
                </tr>`,
            )}
          </tbody>
        </table>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cs-date-picker': CsDatePicker;
  }
}
