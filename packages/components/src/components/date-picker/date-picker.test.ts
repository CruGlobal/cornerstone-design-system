// German strings the locale tests assert. cspell:ignore Montag Vorheriger Monat Nächster
import { expect, html } from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import { expectEvent } from '../../internal/test/expect-event.js';
import { clientFixture, fixtures } from '../../internal/test/fixture.js';
import { isWebkit } from '../../internal/test/pointer-utilities.js';
// The bundled build, so the strings register with the same localize registry the components read.
import '../../../dist/bundled/translations/de.js';
import type CsDialog from '../dialog/dialog.js';
import type CsDatePicker from './date-picker.js';

function shadow(el: CsDatePicker): ShadowRoot {
  return el.shadowRoot!;
}

function cell(el: CsDatePicker, iso: string): HTMLTableCellElement {
  return shadow(el).querySelector<HTMLTableCellElement>(`td[data-date="${iso}"]`)!;
}

function dayCells(el: CsDatePicker): HTMLTableCellElement[] {
  return [...shadow(el).querySelectorAll<HTMLTableCellElement>('td[data-date]')];
}

function tabStops(el: CsDatePicker): string[] {
  return [...shadow(el).querySelectorAll<HTMLElement>('td[tabindex="0"]')].map((td) => td.dataset.date!);
}

function focusedDate(el: CsDatePicker): string | undefined {
  return (shadow(el).activeElement as HTMLElement | null)?.dataset.date;
}

function title(el: CsDatePicker): string {
  return shadow(el).querySelector('[part~="title"]')!.textContent.trim();
}

function weekdayNames(el: CsDatePicker): string[] {
  return [...shadow(el).querySelectorAll('th .cs-visually-hidden')].map((span) => span.textContent.trim());
}

function previousButton(el: CsDatePicker): HTMLButtonElement {
  return shadow(el).querySelector<HTMLButtonElement>('[part~="navigation-button-previous"]')!;
}

function nextButton(el: CsDatePicker): HTMLButtonElement {
  return shadow(el).querySelector<HTMLButtonElement>('[part~="navigation-button-next"]')!;
}

/** The text of the newest polite announcement in the shared live region. */
function lastAnnouncement(): string | undefined {
  return document.querySelector('[role="log"][aria-live="polite"]')?.lastElementChild?.textContent ?? undefined;
}

/** Today in the browser's own time zone, as the picker computes it when `today` is not set. */
function localTodayIso(): string {
  const now = new Date();
  return [now.getFullYear(), now.getMonth() + 1, now.getDate()]
    .map((n, i) => String(n).padStart(i ? 2 : 4, '0'))
    .join('-');
}

async function press(el: CsDatePicker, key: string) {
  await sendKeys({ press: key });
  await el.updateComplete;
}

/** Focuses the picker's tab stop and presses each key in turn. */
async function focusAndPress(el: CsDatePicker, ...keys: string[]) {
  el.focus();
  for (const key of keys) {
    await press(el, key);
  }
}

describe('<cs-date-picker>', () => {
  for (const fixture of fixtures) {
    describe(`with "${fixture.type}" rendering`, () => {
      describe('accessibility', () => {
        it('is accessible with a value', async () => {
          const el = await fixture<CsDatePicker>(
            html`<cs-date-picker value="2026-05-11" today="2026-05-04"></cs-date-picker>`,
          );
          await expect(el).to.be.accessible();
        });

        it('is accessible with unavailable days', async () => {
          const el = await fixture<CsDatePicker>(
            html`<cs-date-picker
              today="2026-05-04"
              min="2026-05-03"
              max="2026-05-28"
              disabled-dates="2026-05-12"
              disabled-days-of-week="sun"
            ></cs-date-picker>`,
          );
          await expect(el).to.be.accessible();
        });

        it('is accessible when readonly', async () => {
          const el = await fixture<CsDatePicker>(
            html`<cs-date-picker readonly value="2026-05-11" today="2026-05-04"></cs-date-picker>`,
          );
          await expect(el).to.be.accessible();
        });

        it('is accessible when disabled', async () => {
          const el = await fixture<CsDatePicker>(
            html`<cs-date-picker disabled value="2026-05-11" today="2026-05-04"></cs-date-picker>`,
          );
          await expect(el).to.be.accessible();
        });

        it('names the grid with the month title and each day with its full date', async () => {
          const el = await fixture<CsDatePicker>(html`<cs-date-picker today="2026-05-04"></cs-date-picker>`);
          const grid = shadow(el).querySelector('[part~="grid"]')!;
          expect(grid.getAttribute('role')).to.equal('grid');
          expect(shadow(el).getElementById(grid.getAttribute('aria-labelledby')!)!.textContent.trim()).to.equal(
            'May 2026',
          );
          expect(cell(el, '2026-05-11').getAttribute('aria-label')).to.equal('Monday, May 11, 2026');
          expect(cell(el, '2026-05-11').textContent.trim()).to.equal('11');
        });

        it('marks the selected day with aria-selected and today with aria-current', async () => {
          const el = await fixture<CsDatePicker>(
            html`<cs-date-picker value="2026-05-11" today="2026-05-04"></cs-date-picker>`,
          );
          expect(cell(el, '2026-05-11').getAttribute('aria-selected')).to.equal('true');
          expect(cell(el, '2026-05-11').part.contains('day-selected')).to.be.true;
          expect(cell(el, '2026-05-12').getAttribute('aria-selected')).to.equal('false');
          expect(cell(el, '2026-05-04').getAttribute('aria-current')).to.equal('date');
          expect(cell(el, '2026-05-04').part.contains('day-today')).to.be.true;
          expect(cell(el, '2026-05-11').hasAttribute('aria-current')).to.be.false;
        });

        it('names the navigation buttons', async () => {
          const el = await fixture<CsDatePicker>(html`<cs-date-picker today="2026-05-04"></cs-date-picker>`);
          expect(previousButton(el).getAttribute('aria-label')).to.equal('Previous month');
          expect(nextButton(el).getAttribute('aria-label')).to.equal('Next month');
        });

        it('gives each weekday column its full name', async () => {
          const el = await fixture<CsDatePicker>(html`<cs-date-picker today="2026-05-04"></cs-date-picker>`);
          expect(weekdayNames(el)).to.deep.equal([
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
          ]);
        });
      });

      describe('rendering', () => {
        it('shows the month of the value', async () => {
          const el = await fixture<CsDatePicker>(
            html`<cs-date-picker value="2025-11-20" today="2026-05-04"></cs-date-picker>`,
          );
          expect(title(el)).to.equal('November 2025');
          expect(dayCells(el)).to.have.length(30);
        });

        it('shows the month of today when there is no value', async () => {
          const el = await fixture<CsDatePicker>(html`<cs-date-picker today="2026-02-10"></cs-date-picker>`);
          expect(title(el)).to.equal('February 2026');
          expect(dayCells(el)).to.have.length(28);
        });

        it('always renders six weeks, so the height never changes', async () => {
          // February 2026 starts on a Sunday and fills exactly four rows; August 2026 needs all six.
          for (const today of ['2026-02-10', '2026-08-10']) {
            const el = await fixture<CsDatePicker>(html`<cs-date-picker today=${today}></cs-date-picker>`);
            expect(shadow(el).querySelectorAll('tbody tr')).to.have.length(6);
            expect(shadow(el).querySelectorAll('tbody td')).to.have.length(42);
          }
        });

        it('shows 29 days in a leap February and 28 otherwise', async () => {
          const leap = await fixture<CsDatePicker>(html`<cs-date-picker today="2024-02-10"></cs-date-picker>`);
          expect(dayCells(leap)).to.have.length(29);
          expect(cell(leap, '2024-02-29')).to.exist;

          const common = await fixture<CsDatePicker>(html`<cs-date-picker today="2100-02-10"></cs-date-picker>`);
          expect(dayCells(common)).to.have.length(28);
        });

        it('places the first of the month under its weekday', async () => {
          // 1 May 2026 is a Friday, the sixth column when weeks start on Sunday.
          const el = await fixture<CsDatePicker>(html`<cs-date-picker today="2026-05-04"></cs-date-picker>`);
          const firstRow = [...shadow(el).querySelectorAll('tbody tr:first-child td')];
          expect(firstRow.map((td) => (td as HTMLElement).dataset.date ?? null)).to.deep.equal([
            null,
            null,
            null,
            null,
            null,
            '2026-05-01',
            '2026-05-02',
          ]);
        });

        it('shows no selection for a value that is not a real date', async () => {
          for (const value of ['2026-02-30', '2026-5-1', 'tomorrow']) {
            const el = await fixture<CsDatePicker>(
              html`<cs-date-picker value=${value} today="2026-02-10"></cs-date-picker>`,
            );
            expect(shadow(el).querySelector('[aria-selected="true"]')).to.be.null;
            expect(title(el)).to.equal('February 2026');
          }
        });

        it('marks the local date as today when today is not set', async () => {
          const iso = localTodayIso();
          const el = await fixture<CsDatePicker>(html`<cs-date-picker></cs-date-picker>`);
          expect(cell(el, iso).getAttribute('aria-current')).to.equal('date');
        });

        it('marks the date in the today attribute as today', async () => {
          const el = await fixture<CsDatePicker>(html`<cs-date-picker today="2031-07-04"></cs-date-picker>`);
          expect(title(el)).to.equal('July 2031');
          expect(shadow(el).querySelectorAll('[aria-current="date"]')).to.have.length(1);
          expect(cell(el, '2031-07-04').getAttribute('aria-current')).to.equal('date');
        });

        it('reflects size and scales with it', async () => {
          const small = await fixture<CsDatePicker>(
            html`<cs-date-picker size="s" today="2026-05-04"></cs-date-picker>`,
          );
          const large = await fixture<CsDatePicker>(
            html`<cs-date-picker size="l" today="2026-05-04"></cs-date-picker>`,
          );
          expect(small.getAttribute('size')).to.equal('s');
          expect(large.getAttribute('size')).to.equal('l');
          expect(cell(large, '2026-05-11').getBoundingClientRect().width).to.be.greaterThan(
            cell(small, '2026-05-11').getBoundingClientRect().width,
          );
        });

        it('defaults to size m', async () => {
          const el = await fixture<CsDatePicker>(html`<cs-date-picker today="2026-05-04"></cs-date-picker>`);
          expect(el.size).to.equal('m');
          expect(el.getAttribute('size')).to.equal('m');
        });
      });

      describe('the tab stop', () => {
        it('puts exactly one day in the tab order, the selected one', async () => {
          const el = await fixture<CsDatePicker>(
            html`<cs-date-picker value="2026-05-11" today="2026-05-04"></cs-date-picker>`,
          );
          expect(tabStops(el)).to.deep.equal(['2026-05-11']);
          expect(dayCells(el).filter((td) => td.getAttribute('tabindex') === '-1')).to.have.length(30);
        });

        it('falls back to today, then to the first day that can be picked', async () => {
          const withToday = await fixture<CsDatePicker>(html`<cs-date-picker today="2026-05-04"></cs-date-picker>`);
          expect(tabStops(withToday)).to.deep.equal(['2026-05-04']);

          const todayUnavailable = await fixture<CsDatePicker>(
            html`<cs-date-picker today="2026-05-04" disabled-dates="2026-05-04"></cs-date-picker>`,
          );
          expect(tabStops(todayUnavailable)).to.deep.equal(['2026-05-01']);
        });

        it('starts inside min and max when today is outside them', async () => {
          const el = await fixture<CsDatePicker>(
            html`<cs-date-picker today="2026-05-04" min="2026-08-10" max="2026-09-30"></cs-date-picker>`,
          );
          expect(title(el)).to.equal('August 2026');
          expect(tabStops(el)).to.deep.equal(['2026-08-10']);
        });

        it('focus() moves focus to the tab stop', async () => {
          const el = await fixture<CsDatePicker>(
            html`<cs-date-picker value="2026-05-11" today="2026-05-04"></cs-date-picker>`,
          );
          el.focus();
          expect(focusedDate(el)).to.equal('2026-05-11');
        });

        it('blur() removes focus', async () => {
          const el = await fixture<CsDatePicker>(
            html`<cs-date-picker value="2026-05-11" today="2026-05-04"></cs-date-picker>`,
          );
          el.focus();
          el.blur();
          expect(shadow(el).activeElement).to.be.null;
        });

        it('is one tab stop, reached after the navigation buttons', async () => {
          // Inputs on both sides keep every Tab inside the page: a Tab that leaves it never returns in WebKit.
          const container = await fixture<HTMLDivElement>(html`
            <div>
              <input class="before" aria-label="Before" />
              <cs-date-picker value="2026-05-11" today="2026-05-04"></cs-date-picker>
              <input class="after" aria-label="After" />
            </div>
          `);
          const el = container.querySelector('cs-date-picker')!;
          await el.updateComplete;
          container.querySelector<HTMLInputElement>('.before')!.focus();

          const beforeGrid: string[] = [];
          for (let i = 0; i < 3 && !focusedDate(el); i++) {
            await press(el, 'Tab');
            if (!focusedDate(el)) {
              beforeGrid.push(shadow(el).activeElement?.getAttribute('part') ?? 'outside');
            }
          }
          expect(focusedDate(el)).to.equal('2026-05-11');
          // WebKit leaves buttons out of the Tab order unless the user turns on full keyboard access.
          expect(beforeGrid).to.deep.equal(
            isWebkit
              ? []
              : ['navigation-button navigation-button-previous', 'navigation-button navigation-button-next'],
          );

          await press(el, 'Tab');
          expect(document.activeElement).to.equal(container.querySelector('.after'));
        });
      });

      describe('picking a date', () => {
        it('selects a clicked day, reflects it and emits cs-change once', async () => {
          const el = await fixture<CsDatePicker>(html`<cs-date-picker today="2026-05-04"></cs-date-picker>`);
          await expectEvent(el, 'cs-change', () => cell(el, '2026-05-20').click());
          await el.updateComplete;
          expect(el.value).to.equal('2026-05-20');
          expect(el.getAttribute('value')).to.equal('2026-05-20');
          expect(cell(el, '2026-05-20').getAttribute('aria-selected')).to.equal('true');
          expect(tabStops(el)).to.deep.equal(['2026-05-20']);
        });

        it('emits nothing when the selected day is clicked again', async () => {
          const el = await fixture<CsDatePicker>(
            html`<cs-date-picker value="2026-05-20" today="2026-05-04"></cs-date-picker>`,
          );
          await expectEvent(el, 'cs-change', () => cell(el, '2026-05-20').click(), { count: 0, timeout: 100 });
          expect(el.value).to.equal('2026-05-20');
        });

        it('selects the focused day with Enter and with Space', async () => {
          const el = await fixture<CsDatePicker>(html`<cs-date-picker today="2026-05-04"></cs-date-picker>`);
          el.focus();
          await expectEvent(el, 'cs-change', () => press(el, 'Enter'));
          expect(el.value).to.equal('2026-05-04');

          await press(el, 'ArrowRight');
          await expectEvent(el, 'cs-change', () => press(el, ' '));
          expect(el.value).to.equal('2026-05-05');
        });

        it('ignores a click on a day that cannot be picked', async () => {
          const el = await fixture<CsDatePicker>(
            html`<cs-date-picker today="2026-05-04" disabled-dates="2026-05-20"></cs-date-picker>`,
          );
          await expectEvent(el, 'cs-change', () => cell(el, '2026-05-20').click(), { count: 0, timeout: 100 });
          expect(el.value).to.equal('');
        });

        it('does not change the value when readonly, but still moves focus', async () => {
          const el = await fixture<CsDatePicker>(
            html`<cs-date-picker readonly value="2026-05-11" today="2026-05-04"></cs-date-picker>`,
          );
          expect(shadow(el).querySelector('[part~="grid"]')!.getAttribute('aria-readonly')).to.equal('true');
          await expectEvent(el, 'cs-change', () => cell(el, '2026-05-20').click(), { count: 0, timeout: 100 });
          await el.updateComplete;
          expect(el.value).to.equal('2026-05-11');
          expect(tabStops(el)).to.deep.equal(['2026-05-20']);

          el.focus();
          await expectEvent(el, 'cs-change', () => press(el, 'Enter'), { count: 0, timeout: 100 });
          expect(el.value).to.equal('2026-05-11');
          await press(el, 'ArrowRight');
          expect(focusedDate(el)).to.equal('2026-05-21');
        });

        it('takes no focus and no picks when disabled', async () => {
          const el = await fixture<CsDatePicker>(
            html`<cs-date-picker disabled value="2026-05-11" today="2026-05-04"></cs-date-picker>`,
          );
          expect(tabStops(el)).to.deep.equal([]);
          expect(dayCells(el).every((td) => !td.hasAttribute('tabindex'))).to.be.true;
          expect(dayCells(el).every((td) => td.getAttribute('aria-disabled') === 'true')).to.be.true;
          expect(previousButton(el).disabled).to.be.true;
          expect(nextButton(el).disabled).to.be.true;
          await expectEvent(el, 'cs-change', () => cell(el, '2026-05-20').click(), { count: 0, timeout: 100 });
          expect(el.value).to.equal('2026-05-11');
        });
      });

      describe('keyboard', () => {
        it('moves a day with ArrowLeft and ArrowRight, across the end of a month', async () => {
          const el = await fixture<CsDatePicker>(
            html`<cs-date-picker value="2026-05-31" today="2026-05-04"></cs-date-picker>`,
          );
          await focusAndPress(el, 'ArrowRight');
          expect(focusedDate(el)).to.equal('2026-06-01');
          expect(title(el)).to.equal('June 2026');
          await press(el, 'ArrowLeft');
          expect(focusedDate(el)).to.equal('2026-05-31');
          expect(title(el)).to.equal('May 2026');
          expect(el.value).to.equal('2026-05-31');
        });

        it('moves a week with ArrowUp and ArrowDown, across the end of a year', async () => {
          const el = await fixture<CsDatePicker>(
            html`<cs-date-picker value="2026-12-28" today="2026-05-04"></cs-date-picker>`,
          );
          await focusAndPress(el, 'ArrowDown');
          expect(focusedDate(el)).to.equal('2027-01-04');
          expect(title(el)).to.equal('January 2027');
          await press(el, 'ArrowUp');
          await press(el, 'ArrowUp');
          expect(focusedDate(el)).to.equal('2026-12-21');
        });

        it('moves to the start and end of the week with Home and End', async () => {
          // Wednesday 13 May 2026; the week runs Sunday 10 to Saturday 16.
          const el = await fixture<CsDatePicker>(
            html`<cs-date-picker value="2026-05-13" today="2026-05-04"></cs-date-picker>`,
          );
          await focusAndPress(el, 'Home');
          expect(focusedDate(el)).to.equal('2026-05-10');
          await press(el, 'End');
          expect(focusedDate(el)).to.equal('2026-05-16');
        });

        it('follows first-day-of-week for Home and End', async () => {
          const el = await fixture<CsDatePicker>(
            html`<cs-date-picker first-day-of-week="mon" value="2026-05-13" today="2026-05-04"></cs-date-picker>`,
          );
          await focusAndPress(el, 'Home');
          expect(focusedDate(el)).to.equal('2026-05-11');
          await press(el, 'End');
          expect(focusedDate(el)).to.equal('2026-05-17');
        });

        it('moves a month with PageUp and PageDown, keeping the day where the month has it', async () => {
          const el = await fixture<CsDatePicker>(
            html`<cs-date-picker value="2026-01-31" today="2026-05-04"></cs-date-picker>`,
          );
          await focusAndPress(el, 'PageDown');
          expect(focusedDate(el)).to.equal('2026-02-28');
          await press(el, 'PageDown');
          expect(focusedDate(el)).to.equal('2026-03-28');
          await press(el, 'PageUp');
          await press(el, 'PageUp');
          await press(el, 'PageUp');
          expect(focusedDate(el)).to.equal('2025-12-28');
        });

        it('lands on 29 February in a leap year', async () => {
          const el = await fixture<CsDatePicker>(
            html`<cs-date-picker value="2024-03-31" today="2026-05-04"></cs-date-picker>`,
          );
          await focusAndPress(el, 'PageUp');
          expect(focusedDate(el)).to.equal('2024-02-29');
        });

        it('moves a year with Shift+PageUp and Shift+PageDown', async () => {
          const el = await fixture<CsDatePicker>(
            html`<cs-date-picker value="2024-02-29" today="2026-05-04"></cs-date-picker>`,
          );
          await focusAndPress(el, 'Shift+PageDown');
          expect(focusedDate(el)).to.equal('2025-02-28');
          expect(title(el)).to.equal('February 2025');
          await press(el, 'Shift+PageUp');
          await press(el, 'Shift+PageUp');
          expect(focusedDate(el)).to.equal('2023-02-28');
        });

        it('skips days that cannot be picked', async () => {
          const el = await fixture<CsDatePicker>(
            html`<cs-date-picker
              value="2026-05-11"
              today="2026-05-04"
              disabled-dates="2026-05-12 2026-05-13"
            ></cs-date-picker>`,
          );
          await focusAndPress(el, 'ArrowRight');
          expect(focusedDate(el)).to.equal('2026-05-14');
          await press(el, 'ArrowLeft');
          expect(focusedDate(el)).to.equal('2026-05-11');
        });

        it('skips disabled weekdays, including on Home and End', async () => {
          // Friday 15 May 2026, with weekends disabled.
          const el = await fixture<CsDatePicker>(
            html`<cs-date-picker
              value="2026-05-15"
              today="2026-05-04"
              disabled-days-of-week="sat sun"
            ></cs-date-picker>`,
          );
          await focusAndPress(el, 'ArrowRight');
          expect(focusedDate(el)).to.equal('2026-05-18');
          await press(el, 'Home');
          expect(focusedDate(el)).to.equal('2026-05-18');
          await press(el, 'End');
          expect(focusedDate(el)).to.equal('2026-05-22');
        });

        it('stops at min and max', async () => {
          const el = await fixture<CsDatePicker>(
            html`<cs-date-picker
              value="2026-05-10"
              today="2026-05-04"
              min="2026-05-10"
              max="2026-05-20"
            ></cs-date-picker>`,
          );
          await focusAndPress(el, 'ArrowLeft');
          expect(focusedDate(el)).to.equal('2026-05-10');
          await press(el, 'ArrowUp');
          expect(focusedDate(el)).to.equal('2026-05-10');
          await press(el, 'PageUp');
          expect(focusedDate(el)).to.equal('2026-05-10');
          await press(el, 'PageDown');
          expect(focusedDate(el)).to.equal('2026-05-20');
          await press(el, 'ArrowRight');
          expect(focusedDate(el)).to.equal('2026-05-20');
          await press(el, 'ArrowDown');
          expect(focusedDate(el)).to.equal('2026-05-20');
        });

        it('swaps ArrowLeft and ArrowRight in a right-to-left picker', async () => {
          const el = await fixture<CsDatePicker>(
            html`<cs-date-picker dir="rtl" value="2026-05-11" today="2026-05-04"></cs-date-picker>`,
          );
          await focusAndPress(el, 'ArrowLeft');
          expect(focusedDate(el)).to.equal('2026-05-12');
          await press(el, 'ArrowRight');
          await press(el, 'ArrowRight');
          expect(focusedDate(el)).to.equal('2026-05-10');
        });

        it('announces the month when a key moves to another one', async () => {
          const el = await fixture<CsDatePicker>(
            html`<cs-date-picker value="2026-05-11" today="2026-05-04"></cs-date-picker>`,
          );
          await focusAndPress(el, 'PageDown');
          expect(lastAnnouncement()).to.equal('June 2026');
          await press(el, 'Shift+PageDown');
          expect(lastAnnouncement()).to.equal('June 2027');
        });

        it('keeps the keys it handles from scrolling the page or reaching anything around it', async () => {
          const el = await fixture<CsDatePicker>(
            html`<cs-date-picker value="2026-05-11" today="2026-05-04"></cs-date-picker>`,
          );
          const seen: KeyboardEvent[] = [];
          const reachedHost: string[] = [];
          const capture = (event: KeyboardEvent) => seen.push(event);
          const bubble = (event: KeyboardEvent) => reachedHost.push(event.key);
          window.addEventListener('keydown', capture, { capture: true });
          el.addEventListener('keydown', bubble);
          try {
            el.focus();
            for (const key of ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' ', 'Enter']) {
              await press(el, key);
            }
          } finally {
            window.removeEventListener('keydown', capture, { capture: true });
            el.removeEventListener('keydown', bubble);
          }
          expect(seen).to.have.length(8);
          expect(seen.every((event) => event.defaultPrevented)).to.be.true;
          expect(reachedHost).to.deep.equal([]);
        });

        it('leaves Escape, Tab and modified keys to the page', async () => {
          const el = await fixture<CsDatePicker>(
            html`<cs-date-picker value="2026-05-11" today="2026-05-04"></cs-date-picker>`,
          );
          const reachedHost: KeyboardEvent[] = [];
          const bubble = (event: KeyboardEvent) => reachedHost.push(event);
          el.addEventListener('keydown', bubble);
          try {
            el.focus();
            await press(el, 'Escape');
            // Alt+Arrow is the browser's back and forward, so it is dispatched rather than pressed.
            for (const init of [{ altKey: true }, { ctrlKey: true }, { metaKey: true }, { shiftKey: true }]) {
              cell(el, '2026-05-11').dispatchEvent(
                new KeyboardEvent('keydown', {
                  key: 'ArrowRight',
                  bubbles: true,
                  composed: true,
                  cancelable: true,
                  ...init,
                }),
              );
            }
            await el.updateComplete;
          } finally {
            el.removeEventListener('keydown', bubble);
          }
          expect(reachedHost.map((event) => event.key)).to.deep.equal([
            'Escape',
            'ArrowRight',
            'ArrowRight',
            'ArrowRight',
            'ArrowRight',
          ]);
          expect(reachedHost.some((event) => event.defaultPrevented)).to.be.false;
          expect(focusedDate(el)).to.equal('2026-05-11');
        });

        it('lets Escape close a dialog the picker sits in', async () => {
          const dialog = await fixture<CsDialog>(html`
            <cs-dialog open label="Pick a date">
              <cs-date-picker value="2026-05-11" today="2026-05-04"></cs-date-picker>
            </cs-dialog>
          `);
          const picker = dialog.querySelector('cs-date-picker')!;
          await picker.updateComplete;
          picker.focus();
          expect(focusedDate(picker)).to.equal('2026-05-11');
          await expectEvent(dialog, 'cs-hide', () => sendKeys({ press: 'Escape' }));
        });
      });

      describe('navigation buttons', () => {
        it('show the next and previous month without changing the value', async () => {
          const el = await fixture<CsDatePicker>(
            html`<cs-date-picker value="2026-05-11" today="2026-05-04"></cs-date-picker>`,
          );
          await expectEvent(el, 'cs-change', () => nextButton(el).click(), { count: 0, timeout: 100 });
          await el.updateComplete;
          expect(title(el)).to.equal('June 2026');
          expect(lastAnnouncement()).to.equal('June 2026');
          expect(tabStops(el)).to.deep.equal(['2026-06-11']);
          expect(el.value).to.equal('2026-05-11');

          previousButton(el).click();
          previousButton(el).click();
          await el.updateComplete;
          expect(title(el)).to.equal('April 2026');
          expect(tabStops(el)).to.deep.equal(['2026-04-11']);
        });

        it('cross the end of a year', async () => {
          const el = await fixture<CsDatePicker>(html`<cs-date-picker today="2026-12-15"></cs-date-picker>`);
          nextButton(el).click();
          await el.updateComplete;
          expect(title(el)).to.equal('January 2027');
          previousButton(el).click();
          previousButton(el).click();
          await el.updateComplete;
          expect(title(el)).to.equal('November 2026');
        });

        it('are marked unavailable at min and max and keep focus when pressed', async () => {
          const el = await fixture<CsDatePicker>(
            html`<cs-date-picker today="2026-05-04" min="2026-04-20" max="2026-06-10"></cs-date-picker>`,
          );
          expect(previousButton(el).hasAttribute('aria-disabled')).to.be.false;
          previousButton(el).focus();
          await press(el, 'Enter');
          expect(title(el)).to.equal('April 2026');
          expect(previousButton(el).getAttribute('aria-disabled')).to.equal('true');
          expect(previousButton(el).disabled).to.be.false;
          await press(el, 'Enter');
          expect(title(el)).to.equal('April 2026');
          expect(shadow(el).activeElement).to.equal(previousButton(el));
          // The tab stop stays inside min.
          expect(tabStops(el)).to.deep.equal(['2026-04-20']);

          nextButton(el).click();
          nextButton(el).click();
          await el.updateComplete;
          expect(title(el)).to.equal('June 2026');
          expect(nextButton(el).getAttribute('aria-disabled')).to.equal('true');
          nextButton(el).click();
          await el.updateComplete;
          expect(title(el)).to.equal('June 2026');
        });

        it('still work when readonly', async () => {
          const el = await fixture<CsDatePicker>(
            html`<cs-date-picker readonly value="2026-05-11" today="2026-05-04"></cs-date-picker>`,
          );
          nextButton(el).click();
          await el.updateComplete;
          expect(title(el)).to.equal('June 2026');
        });

        it('point the right way in a right-to-left picker', async () => {
          const el = await fixture<CsDatePicker>(html`<cs-date-picker dir="rtl" today="2026-05-04"></cs-date-picker>`);
          expect(previousButton(el).querySelector('cs-icon')!.getAttribute('name')).to.equal('keyboard_arrow_right');
          expect(nextButton(el).querySelector('cs-icon')!.getAttribute('name')).to.equal('keyboard_arrow_left');
        });
      });

      describe('min, max and disabled days', () => {
        it('disables days outside min and max', async () => {
          const el = await fixture<CsDatePicker>(
            html`<cs-date-picker today="2026-05-04" min="2026-05-03" max="2026-05-28"></cs-date-picker>`,
          );
          for (const iso of ['2026-05-02', '2026-05-29']) {
            expect(cell(el, iso).getAttribute('aria-disabled')).to.equal('true');
            expect(cell(el, iso).part.contains('day-disabled')).to.be.true;
            expect(cell(el, iso).hasAttribute('tabindex')).to.be.false;
          }
          for (const iso of ['2026-05-03', '2026-05-28']) {
            expect(cell(el, iso).hasAttribute('aria-disabled')).to.be.false;
            expect(cell(el, iso).getAttribute('tabindex')).to.equal('-1');
          }
        });

        it('disables each date in disabled-dates and ignores entries that are not dates', async () => {
          const el = await fixture<CsDatePicker>(
            html`<cs-date-picker
              today="2026-05-04"
              disabled-dates="2026-05-12
                2026-05-25 not-a-date 2026-02-30"
            ></cs-date-picker>`,
          );
          const disabled = dayCells(el)
            .filter((td) => td.getAttribute('aria-disabled') === 'true')
            .map((td) => td.dataset.date);
          expect(disabled).to.deep.equal(['2026-05-12', '2026-05-25']);
        });

        it('disables each weekday in disabled-days-of-week', async () => {
          const el = await fixture<CsDatePicker>(
            html`<cs-date-picker today="2026-05-04" disabled-days-of-week="sat sun"></cs-date-picker>`,
          );
          const disabled = dayCells(el)
            .filter((td) => td.getAttribute('aria-disabled') === 'true')
            .map((td) => td.dataset.date);
          expect(disabled).to.deep.equal([
            '2026-05-02',
            '2026-05-03',
            '2026-05-09',
            '2026-05-10',
            '2026-05-16',
            '2026-05-17',
            '2026-05-23',
            '2026-05-24',
            '2026-05-30',
            '2026-05-31',
          ]);
        });

        it('still shows a value that falls on a disabled day as selected', async () => {
          const el = await fixture<CsDatePicker>(
            html`<cs-date-picker value="2026-05-12" disabled-dates="2026-05-12" today="2026-05-04"></cs-date-picker>`,
          );
          expect(cell(el, '2026-05-12').getAttribute('aria-selected')).to.equal('true');
          expect(cell(el, '2026-05-12').getAttribute('aria-disabled')).to.equal('true');
        });
      });

      describe('locale', () => {
        it('takes the first day of the week from the locale', async () => {
          const us = await fixture<CsDatePicker>(
            html`<cs-date-picker locale="en-US" today="2026-05-04"></cs-date-picker>`,
          );
          expect(weekdayNames(us)[0]).to.equal('Sunday');
          const gb = await fixture<CsDatePicker>(
            html`<cs-date-picker locale="en-GB" today="2026-05-04"></cs-date-picker>`,
          );
          expect(weekdayNames(gb)[0]).to.equal('Monday');
        });

        it('overrides the locale with first-day-of-week', async () => {
          const el = await fixture<CsDatePicker>(
            html`<cs-date-picker locale="en-GB" first-day-of-week="sat" today="2026-05-04"></cs-date-picker>`,
          );
          expect(weekdayNames(el)[0]).to.equal('Saturday');
          expect(weekdayNames(el)[6]).to.equal('Friday');
        });

        it('formats names and labels in the locale', async () => {
          const el = await fixture<CsDatePicker>(
            html`<cs-date-picker locale="de" today="2026-05-04"></cs-date-picker>`,
          );
          expect(title(el)).to.equal('Mai 2026');
          expect(weekdayNames(el)[0]).to.equal('Montag');
          expect(cell(el, '2026-05-11').getAttribute('aria-label')).to.equal('Montag, 11. Mai 2026');
          // Button labels follow lang, not locale.
          expect(previousButton(el).getAttribute('aria-label')).to.equal('Previous month');
        });

        it('formats in lang when locale is empty', async () => {
          const el = await fixture<CsDatePicker>(html`<cs-date-picker lang="de" today="2026-05-04"></cs-date-picker>`);
          expect(title(el)).to.equal('Mai 2026');
          expect(weekdayNames(el)[0]).to.equal('Montag');
        });

        it('shows short weekday names, or narrow ones where the short ones are whole words', async () => {
          const visible = (el: CsDatePicker) =>
            [...shadow(el).querySelectorAll('.weekday-short')].map((span) => span.textContent.trim());

          const en = await fixture<CsDatePicker>(
            html`<cs-date-picker locale="en-US" today="2026-05-04"></cs-date-picker>`,
          );
          expect(visible(en)).to.deep.equal(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);

          // Arabic's short weekday names are its long names, too wide for a day's column.
          const ar = await fixture<CsDatePicker>(
            html`<cs-date-picker locale="ar-EG" today="2026-05-04"></cs-date-picker>`,
          );
          const long = new Intl.DateTimeFormat('ar-EG', { weekday: 'long', timeZone: 'UTC' });
          const narrow = new Intl.DateTimeFormat('ar-EG', { weekday: 'narrow', timeZone: 'UTC' });
          // ar-EG weeks start on Saturday, 7 January 2023 among them.
          const week = Array.from({ length: 7 }, (_, i) => new Date(Date.UTC(2023, 0, 7 + i)));
          expect(visible(ar)).to.deep.equal(week.map((date) => narrow.format(date)));
          expect(weekdayNames(ar)).to.deep.equal(week.map((date) => long.format(date)));
        });

        it('falls back to English for a malformed locale', async () => {
          const el = await fixture<CsDatePicker>(
            html`<cs-date-picker locale="not a locale!" today="2026-05-04"></cs-date-picker>`,
          );
          expect(title(el)).to.equal('May 2026');
        });
      });

      describe('attributes as the source of truth', () => {
        it('shows the month of a value set as a property', async () => {
          const el = await fixture<CsDatePicker>(html`<cs-date-picker today="2026-05-04"></cs-date-picker>`);
          el.value = '2027-09-15';
          await el.updateComplete;
          expect(title(el)).to.equal('September 2027');
          expect(el.getAttribute('value')).to.equal('2027-09-15');
          expect(cell(el, '2027-09-15').getAttribute('aria-selected')).to.equal('true');
          expect(tabStops(el)).to.deep.equal(['2027-09-15']);
        });

        it('follows a value attribute that changes, as a morph would apply it', async () => {
          const el = await fixture<CsDatePicker>(
            html`<cs-date-picker value="2026-05-11" today="2026-05-04"></cs-date-picker>`,
          );
          el.setAttribute('value', '2026-08-02');
          await el.updateComplete;
          expect(el.value).to.equal('2026-08-02');
          expect(title(el)).to.equal('August 2026');

          el.removeAttribute('value');
          await el.updateComplete;
          expect(el.value).to.equal('');
          expect(shadow(el).querySelector('[aria-selected="true"]')).to.be.null;
        });

        it('keeps the month on show when a morph reapplies an unchanged value', async () => {
          const el = await fixture<CsDatePicker>(
            html`<cs-date-picker value="2026-05-11" today="2026-05-04"></cs-date-picker>`,
          );
          nextButton(el).click();
          await el.updateComplete;
          el.setAttribute('value', '2026-05-11');
          await el.updateComplete;
          expect(title(el)).to.equal('June 2026');
        });

        it('tolerates constraint attributes being removed', async () => {
          const el = await fixture<CsDatePicker>(
            html`<cs-date-picker
              today="2026-05-04"
              min="2026-05-10"
              max="2026-05-20"
              disabled-dates="2026-05-12"
              disabled-days-of-week="sun"
              first-day-of-week="mon"
              locale="de"
            ></cs-date-picker>`,
          );
          for (const name of ['min', 'max', 'disabled-dates', 'disabled-days-of-week', 'first-day-of-week', 'locale']) {
            el.removeAttribute(name);
          }
          await el.updateComplete;
          expect(dayCells(el).some((td) => td.hasAttribute('aria-disabled'))).to.be.false;
          expect(title(el)).to.equal('May 2026');
          expect(weekdayNames(el)[0]).to.equal('Sunday');
        });

        it('works after being removed and inserted again', async () => {
          const el = await fixture<CsDatePicker>(html`<cs-date-picker today="2026-05-04"></cs-date-picker>`);
          const parent = el.parentElement!;
          el.remove();
          parent.append(el);
          await el.updateComplete;

          await expectEvent(el, 'cs-change', () => cell(el, '2026-05-14').click());
          expect(el.value).to.equal('2026-05-14');
          el.focus();
          await press(el, 'ArrowRight');
          expect(focusedDate(el)).to.equal('2026-05-15');
        });

        it('moves focus to the new tab stop when the value changes under it', async () => {
          const el = await fixture<CsDatePicker>(
            html`<cs-date-picker value="2026-05-11" today="2026-05-04"></cs-date-picker>`,
          );
          el.focus();
          el.value = '2026-09-03';
          await el.updateComplete;
          expect(focusedDate(el)).to.equal('2026-09-03');
        });
      });
    });
  }

  // Client-only: the server render knows only the translations its own modules register, and this file's import of
  // the German strings runs in the browser alone. The formatting half of `lang` is tested in both modes above.
  describe('translated labels (client-only)', () => {
    it('labels the navigation buttons in lang', async () => {
      const el = await clientFixture<CsDatePicker>(
        html`<cs-date-picker lang="de" today="2026-05-04"></cs-date-picker>`,
      );
      expect(previousButton(el).getAttribute('aria-label')).to.equal('Vorheriger Monat');
      expect(nextButton(el).getAttribute('aria-label')).to.equal('Nächster Monat');
    });
  });
});
