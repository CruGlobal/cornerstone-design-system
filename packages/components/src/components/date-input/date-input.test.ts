import { expect, html, oneEvent } from '@open-wc/testing';
import { emulateMedia, sendKeys } from '@web/test-runner-commands';
import sinon from 'sinon';
import { expectAnimationDuration, expectNoMotion } from '../../internal/test/expect-animation-duration.js';
import { expectEvent } from '../../internal/test/expect-event.js';
import { fixtures } from '../../internal/test/fixture.js';
import { runFormControlBaseTests } from '../../internal/test/form-control-base-tests.js';
import { clickOnElement } from '../../internal/test/pointer-utilities.js';
import { serialize } from '../../utilities/form.js';
import type CsDatePicker from '../date-picker/date-picker.js';
import type CsPopup from '../popup/popup.js';
import type CsDateInput from './date-input.js';

type Field = 'month' | 'day' | 'year';

/**
 * Whether the element matches `:state(name)`, as a stylesheet sees it. Read through CSS rather than `customStates.has()`:
 * after hydration WebKit's `internals.states` sometimes reads as empty while the element still matches its states.
 */
function hasState(el: CsDateInput, name: string): boolean {
  return el.matches(`:state(${name})`);
}

function segment(el: CsDateInput, field: Field): HTMLElement {
  return el.shadowRoot!.querySelector<HTMLElement>(`[data-segment="${field}"]`)!;
}

function segmentOrder(el: CsDateInput): string[] {
  return [...el.shadowRoot!.querySelectorAll<HTMLElement>('[data-segment]')].map((s) => s.dataset.segment!);
}

function segmentText(el: CsDateInput): string {
  return [...el.shadowRoot!.querySelector('[part~="input"]')!.children].map((node) => node.textContent).join('');
}

function picker(el: CsDateInput): CsDatePicker {
  return el.shadowRoot!.querySelector<CsDatePicker>('cs-date-picker')!;
}

function pickerCell(el: CsDateInput, iso: string): HTMLElement {
  return picker(el).shadowRoot!.querySelector<HTMLElement>(`td[data-date="${iso}"]`)!;
}

function popup(el: CsDateInput): CsPopup {
  return el.shadowRoot!.querySelector<CsPopup>('cs-popup')!;
}

function expandButton(el: CsDateInput): HTMLButtonElement {
  return el.shadowRoot!.querySelector<HTMLButtonElement>('[part~="expand-button"]')!;
}

function clearButton(el: CsDateInput): HTMLButtonElement | null {
  return el.shadowRoot!.querySelector<HTMLButtonElement>('[part~="clear-button"]');
}

/** The segment with focus, or `undefined` when focus is elsewhere. */
function focusedSegment(el: CsDateInput): string | undefined {
  return (el.shadowRoot!.activeElement as HTMLElement | null)?.dataset.segment;
}

/** The calendar day with focus, or `undefined` when focus isn't in the calendar. */
function focusedDay(el: CsDateInput): string | undefined {
  return (picker(el).shadowRoot!.activeElement as HTMLElement | null)?.dataset.date;
}

async function press(el: CsDateInput, key: string) {
  await sendKeys({ press: key });
  await el.updateComplete;
}

async function typeInto(el: CsDateInput, field: Field, text: string) {
  segment(el, field).focus();
  await sendKeys({ type: text });
  await el.updateComplete;
}

describe('<cs-date-input>', () => {
  runFormControlBaseTests({ tagName: 'cs-date-input', formValue: { dirtyValue: '2026-05-11' } });

  for (const fixture of fixtures) {
    describe(`with "${fixture.type}" rendering`, () => {
      describe('accessibility', () => {
        it('is accessible with a label, hint and value', async () => {
          const el = await fixture<CsDateInput>(
            html`<cs-date-input label="Due date" hint="The day it's due." value="2026-05-11"></cs-date-input>`,
          );
          await expect(el).to.be.accessible();
        });

        it('is accessible when empty and required', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input label="Due date" required></cs-date-input>`);
          await expect(el).to.be.accessible();
        });

        it('is accessible with the popup open', async () => {
          const el = await fixture<CsDateInput>(
            html`<cs-date-input label="Due date" value="2026-05-11" today="2026-05-04"></cs-date-input>`,
          );
          await el.show();
          await expect(el).to.be.accessible();
        });

        it('is accessible when disabled', async () => {
          const el = await fixture<CsDateInput>(
            html`<cs-date-input label="Due date" value="2026-05-11" disabled></cs-date-input>`,
          );
          await expect(el).to.be.accessible();
        });

        it('names the segment group from the rendered label, slotted or not', async () => {
          const byAttribute = await fixture<CsDateInput>(html`<cs-date-input label="Due date"></cs-date-input>`);
          const group = byAttribute.shadowRoot!.querySelector('[part~="input"]')!;
          expect(group.getAttribute('role')).to.equal('group');
          expect(group.getAttribute('aria-labelledby')).to.equal('label');

          const bySlot = await fixture<CsDateInput>(
            html`<cs-date-input ssr-label><span slot="label">Due date</span></cs-date-input>`,
          );
          const label = bySlot.shadowRoot!.getElementById('label')!;
          expect(label.classList.contains('has-label')).to.be.true;
          expect(label.getAttribute('aria-hidden')).to.equal('false');
          expect(bySlot.shadowRoot!.querySelector('[part~="input"]')!.getAttribute('aria-labelledby')).to.equal(
            'label',
          );
        });

        it('falls back to the name Date without a label', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input></cs-date-input>`);
          const group = el.shadowRoot!.querySelector('[part~="input"]')!;
          expect(group.getAttribute('aria-label')).to.equal('Date');
          expect(group.hasAttribute('aria-labelledby')).to.be.false;
        });

        it('makes each segment a named spinbutton with its range and value', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input lang="en-US" value="2026-05-11"></cs-date-input>`);
          const month = segment(el, 'month');
          expect(month.getAttribute('role')).to.equal('spinbutton');
          expect(month.getAttribute('aria-label')).to.equal('Month');
          expect(month.getAttribute('aria-valuemin')).to.equal('1');
          expect(month.getAttribute('aria-valuemax')).to.equal('12');
          expect(month.getAttribute('aria-valuenow')).to.equal('5');
          expect(month.getAttribute('aria-valuetext')).to.equal('May');
          expect(segment(el, 'day').getAttribute('aria-label')).to.equal('Day');
          expect(segment(el, 'day').getAttribute('aria-valuetext')).to.equal('11');
          expect(segment(el, 'year').getAttribute('aria-label')).to.equal('Year');
          expect(segment(el, 'year').getAttribute('aria-valuemax')).to.equal('9999');
        });

        it('says an empty segment is empty', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input></cs-date-input>`);
          expect(segment(el, 'day').hasAttribute('aria-valuenow')).to.be.false;
          expect(segment(el, 'day').getAttribute('aria-valuetext')).to.equal('Empty');
        });

        it('describes each segment with the hint and the keyboard help', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input hint="The day it's due."></cs-date-input>`);
          const [hintId, helpId] = segment(el, 'day').getAttribute('aria-describedby')!.split(' ');
          expect(el.shadowRoot!.getElementById(hintId)!.textContent.trim()).to.equal("The day it's due.");
          expect(el.shadowRoot!.getElementById(helpId)!.textContent.trim()).to.equal(
            'Use arrow keys to change values; press Alt+Down Arrow to open the calendar.',
          );
        });

        it('marks the segments required, and invalid only once the user has entered something', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input lang="en-US" required></cs-date-input>`);
          expect(segment(el, 'month').getAttribute('aria-required')).to.equal('true');
          expect(hasState(el, 'user-invalid')).to.be.false;
          expect(segment(el, 'month').hasAttribute('aria-invalid')).to.be.false;

          await typeInto(el, 'month', '5');
          expect(hasState(el, 'user-invalid')).to.be.true;
          expect(segment(el, 'month').getAttribute('aria-invalid')).to.equal('true');
        });

        it('keeps the expand button’s name and reports the popup with aria-expanded', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input></cs-date-input>`);
          const button = expandButton(el);
          expect(button.getAttribute('aria-label')).to.equal('Choose date');
          expect(button.getAttribute('aria-expanded')).to.equal('false');
          expect(button.getAttribute('aria-haspopup')).to.equal('dialog');
          await el.show();
          expect(button.getAttribute('aria-label')).to.equal('Choose date');
          expect(button.getAttribute('aria-expanded')).to.equal('true');
          expect(el.shadowRoot!.getElementById(button.getAttribute('aria-controls')!)!.getAttribute('role')).to.equal(
            'dialog',
          );
        });
      });

      describe('rendering', () => {
        it('orders the segments and separators by locale', async () => {
          const us = await fixture<CsDateInput>(html`<cs-date-input lang="en-US" value="2026-05-11"></cs-date-input>`);
          expect(segmentOrder(us)).to.deep.equal(['month', 'day', 'year']);
          expect(segmentText(us)).to.equal('05/11/2026');

          const gb = await fixture<CsDateInput>(html`<cs-date-input lang="en-GB" value="2026-05-11"></cs-date-input>`);
          expect(segmentOrder(gb)).to.deep.equal(['day', 'month', 'year']);
          expect(segmentText(gb)).to.equal('11/05/2026');

          const de = await fixture<CsDateInput>(html`<cs-date-input lang="de-DE" value="2026-05-11"></cs-date-input>`);
          expect(segmentText(de)).to.equal('11.05.2026');

          const ja = await fixture<CsDateInput>(html`<cs-date-input lang="ja-JP" value="2026-05-11"></cs-date-input>`);
          expect(segmentOrder(ja)).to.deep.equal(['year', 'month', 'day']);
        });

        it('takes the order from locale over lang, and hands the locale to the calendar', async () => {
          const el = await fixture<CsDateInput>(
            html`<cs-date-input lang="en-US" locale="de-DE" value="2026-05-11"></cs-date-input>`,
          );
          expect(segmentText(el)).to.equal('11.05.2026');
          expect(picker(el).getAttribute('locale')).to.equal('de-DE');
        });

        it('shows dashes in empty segments', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input lang="en-US"></cs-date-input>`);
          expect(segmentText(el)).to.equal('--/--/----');
          expect(el.value).to.equal('');
          expect(hasState(el, 'blank')).to.be.true;
        });

        it('shows nothing for a value that is not a real date', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input lang="en-US" value="2026-02-30"></cs-date-input>`);
          expect(el.value).to.equal('');
          expect(segmentText(el)).to.equal('--/--/----');
        });

        it('takes a Date and gives its local day as the value and valueAsDate', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input lang="en-US"></cs-date-input>`);
          el.value = new Date(2026, 4, 11, 23, 30);
          await el.updateComplete;
          expect(el.value).to.equal('2026-05-11');
          expect(segmentText(el)).to.equal('05/11/2026');
          const date = el.valueAsDate!;
          expect([date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()]).to.deep.equal([
            2026, 4, 11, 0,
          ]);
          expect(hasState(el, 'blank')).to.be.false;
        });

        it('reads valueAsDate for the years 1 to 99 as written', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input value="0042-01-02"></cs-date-input>`);
          expect(el.valueAsDate!.getFullYear()).to.equal(42);
        });

        it('clears with null and reports valueAsDate as null', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input lang="en-US" value="2026-05-11"></cs-date-input>`);
          el.value = null;
          await el.updateComplete;
          expect(el.value).to.equal('');
          expect(el.valueAsDate).to.equal(null);
          expect(segmentText(el)).to.equal('--/--/----');
        });

        it('hands min, max, the disabled dates and days, today and the first weekday to the calendar', async () => {
          const el = await fixture<CsDateInput>(html`
            <cs-date-input
              value="2026-05-11"
              min="2026-05-02"
              max="2026-06-20"
              disabled-dates="2026-05-12 2026-05-13"
              disabled-days-of-week="sat sun"
              today="2026-05-04"
              first-day-of-week="mon"
              size="l"
            ></cs-date-input>
          `);
          const calendar = picker(el);
          expect(calendar.value).to.equal('2026-05-11');
          expect(calendar.getAttribute('min')).to.equal('2026-05-02');
          expect(calendar.getAttribute('max')).to.equal('2026-06-20');
          expect(calendar.getAttribute('disabled-dates')).to.equal('2026-05-12 2026-05-13');
          expect(calendar.getAttribute('disabled-days-of-week')).to.equal('sat sun');
          expect(calendar.getAttribute('today')).to.equal('2026-05-04');
          expect(calendar.getAttribute('first-day-of-week')).to.equal('mon');
          expect(calendar.getAttribute('size')).to.equal('l');
        });
      });

      describe('keyboard entry', () => {
        it('fills the segments from typed digits and composes an ISO value', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input lang="en-US"></cs-date-input>`);
          await typeInto(el, 'month', '05112026');
          expect(el.value).to.equal('2026-05-11');
          expect(segmentText(el)).to.equal('05/11/2026');
        });

        it('submits ISO whatever the locale order', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input lang="en-GB"></cs-date-input>`);
          await typeInto(el, 'day', '11052026');
          expect(el.value).to.equal('2026-05-11');
        });

        it('moves on once a segment can take no more digits', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input lang="en-US"></cs-date-input>`);
          await typeInto(el, 'month', '5');
          expect(focusedSegment(el)).to.equal('day');
          await sendKeys({ type: '4' });
          expect(focusedSegment(el)).to.equal('year');
        });

        it('moves on with a separator key', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input lang="en-US"></cs-date-input>`);
          await typeInto(el, 'month', '1/');
          expect(focusedSegment(el)).to.equal('day');
          expect(segment(el, 'month').getAttribute('aria-valuenow')).to.equal('1');
        });

        it('holds the year back from the value until its fourth digit', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input lang="en-US"></cs-date-input>`);
          const change = sinon.spy();
          el.addEventListener('change', change);
          await typeInto(el, 'month', '0511202');
          expect(segment(el, 'year').textContent).to.equal('0202');
          expect(el.value).to.equal('');
          expect(change.callCount).to.equal(0);

          await sendKeys({ type: '6' });
          await el.updateComplete;
          expect(el.value).to.equal('2026-05-11');
          expect(change.callCount).to.equal(1);
        });

        it('commits a short year when focus leaves it', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input lang="en-US"></cs-date-input>`);
          await typeInto(el, 'month', '051126');
          await press(el, 'ArrowLeft');
          expect(el.value).to.equal('0026-05-11');
        });

        it('steps a segment with the arrow keys, wrapping without carrying', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input lang="en-US" value="2026-12-31"></cs-date-input>`);
          segment(el, 'month').focus();
          await press(el, 'ArrowUp');
          expect(el.value).to.equal('2026-01-31');
          segment(el, 'day').focus();
          await press(el, 'ArrowUp');
          expect(el.value).to.equal('2026-01-01');
          await press(el, 'ArrowDown');
          await press(el, 'ArrowDown');
          expect(el.value).to.equal('2026-01-30');
        });

        it('fills an empty segment from today with an arrow key', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input lang="en-US" today="2026-05-04"></cs-date-input>`);
          segment(el, 'month').focus();
          await press(el, 'ArrowUp');
          segment(el, 'day').focus();
          await press(el, 'ArrowDown');
          segment(el, 'year').focus();
          await press(el, 'ArrowUp');
          expect(el.value).to.equal('2026-05-04');
        });

        it('clears a segment with Backspace, leaving the value empty', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input lang="en-US" value="2026-05-11"></cs-date-input>`);
          segment(el, 'day').focus();
          await press(el, 'Backspace');
          expect(el.value).to.equal('');
          expect(segmentText(el)).to.equal('05/--/2026');
        });

        it('moves between segments with the arrow keys, Home and End', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input lang="en-US"></cs-date-input>`);
          segment(el, 'month').focus();
          await press(el, 'ArrowRight');
          expect(focusedSegment(el)).to.equal('day');
          await press(el, 'End');
          expect(focusedSegment(el)).to.equal('year');
          await press(el, 'ArrowLeft');
          expect(focusedSegment(el)).to.equal('day');
          await press(el, 'Home');
          expect(focusedSegment(el)).to.equal('month');
        });

        it('is one tab stop: Tab leaves the segments rather than moving between them', async () => {
          const container = await fixture<HTMLDivElement>(html`
            <div>
              <input class="before" />
              <cs-date-input lang="en-US"></cs-date-input>
            </div>
          `);
          const el = container.querySelector<CsDateInput>('cs-date-input')!;
          container.querySelector<HTMLInputElement>('.before')!.focus();
          await press(el, 'Tab');
          expect(focusedSegment(el)).to.equal('month');
          await press(el, 'Tab');
          expect(focusedSegment(el)).to.equal(undefined);
        });

        it('focus() lands on the first empty segment', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input lang="en-US"></cs-date-input>`);
          await typeInto(el, 'month', '5');
          el.blur();
          el.focus();
          expect(focusedSegment(el)).to.equal('day');
        });

        it('ignores typing and stepping when readonly', async () => {
          const el = await fixture<CsDateInput>(
            html`<cs-date-input lang="en-US" value="2026-05-11" readonly></cs-date-input>`,
          );
          await typeInto(el, 'month', '7');
          await press(el, 'ArrowUp');
          expect(el.value).to.equal('2026-05-11');
          expect(segment(el, 'month').getAttribute('aria-readonly')).to.equal('true');
        });

        it('takes no focus when disabled', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input value="2026-05-11" disabled></cs-date-input>`);
          for (const field of ['month', 'day', 'year'] as const) {
            expect(segment(el, field).tabIndex).to.equal(-1);
            expect(segment(el, field).getAttribute('aria-disabled')).to.equal('true');
          }
          expect(expandButton(el).disabled).to.be.true;
        });
      });

      describe('events', () => {
        it('emits input on every edit and change once the date is complete', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input lang="en-US"></cs-date-input>`);
          const input = sinon.spy();
          const changes: string[] = [];
          el.addEventListener('input', input);
          el.addEventListener('change', () => changes.push(el.value));

          await typeInto(el, 'month', '0511');
          expect(input.callCount).to.equal(4);
          expect(changes).to.deep.equal([]);

          await sendKeys({ type: '2026' });
          expect(changes).to.deep.equal(['2026-05-11']);

          await press(el, 'ArrowUp');
          expect(changes).to.deep.equal(['2026-05-11', '2027-05-11']);
        });

        it('emits change when an edit empties a complete date, and not again while it stays empty', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input lang="en-US" value="2026-05-11"></cs-date-input>`);
          const change = sinon.spy();
          el.addEventListener('change', change);
          segment(el, 'day').focus();
          await press(el, 'Backspace');
          await press(el, 'ArrowLeft');
          await press(el, 'Backspace');
          expect(change.callCount).to.equal(1);
        });

        it('keeps the calendar’s cs-change inside', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input today="2026-05-04"></cs-date-input>`);
          await el.show();
          await expectEvent(el, 'cs-change', () => clickOnElement(pickerCell(el, '2026-05-20')), {
            count: 0,
            timeout: 100,
          });
          expect(el.value).to.equal('2026-05-20');
        });
      });

      describe('clear button', () => {
        it('appears only with with-clear once something is entered', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input lang="en-US" with-clear></cs-date-input>`);
          expect(clearButton(el)).to.equal(null);
          await typeInto(el, 'month', '5');
          expect(clearButton(el)).to.not.equal(null);

          const without = await fixture<CsDateInput>(html`<cs-date-input value="2026-05-11"></cs-date-input>`);
          expect(clearButton(without)).to.equal(null);
        });

        it('is not offered when the field is disabled or readonly', async () => {
          const disabled = await fixture<CsDateInput>(
            html`<cs-date-input with-clear value="2026-05-11" disabled></cs-date-input>`,
          );
          expect(clearButton(disabled)).to.equal(null);
          const readonly = await fixture<CsDateInput>(
            html`<cs-date-input with-clear value="2026-05-11" readonly></cs-date-input>`,
          );
          expect(clearButton(readonly)).to.equal(null);
        });

        it('clears the value, emits cs-clear, input and change, and focuses the first segment', async () => {
          const el = await fixture<CsDateInput>(
            html`<cs-date-input lang="en-US" with-clear value="2026-05-11"></cs-date-input>`,
          );
          await expectEvent(el, ['cs-clear', 'input', 'change'], () => clickOnElement(clearButton(el)!));
          await el.updateComplete;
          expect(el.value).to.equal('');
          expect(segmentText(el)).to.equal('--/--/----');
          expect(focusedSegment(el)).to.equal('month');
        });
      });

      describe('popup', () => {
        it('opens from the expand button and moves focus into the calendar', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input today="2026-05-04"></cs-date-input>`);
          await expectEvent(el, ['cs-show', 'cs-after-show'], () => clickOnElement(expandButton(el)));
          expect(el.open).to.be.true;
          expect(popup(el).active).to.be.true;
          expect(hasState(el, 'open')).to.be.true;
          expect(focusedDay(el)).to.equal('2026-05-04');
        });

        it('opens with Alt+Down Arrow onto the selected day', async () => {
          const el = await fixture<CsDateInput>(
            html`<cs-date-input lang="en-US" value="2026-05-11" today="2026-05-04"></cs-date-input>`,
          );
          segment(el, 'day').focus();
          await expectEvent(el, 'cs-after-show', () => sendKeys({ press: 'Alt+ArrowDown' }));
          expect(el.open).to.be.true;
          expect(focusedDay(el)).to.equal('2026-05-11');
        });

        it('opens on a press in the field, leaving focus in the segment', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input lang="en-US"></cs-date-input>`);
          await expectEvent(el, 'cs-after-show', () => clickOnElement(segment(el, 'day')));
          expect(el.open).to.be.true;
          expect(focusedSegment(el)).to.equal('day');
        });

        it('closes with Escape and puts focus back on the segment', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input lang="en-US" today="2026-05-04"></cs-date-input>`);
          segment(el, 'year').focus();
          await expectEvent(el, 'cs-after-show', () => sendKeys({ press: 'Alt+ArrowDown' }));
          expect(focusedDay(el)).to.equal('2026-05-04');

          await expectEvent(el, ['cs-hide', 'cs-after-hide'], () => sendKeys({ press: 'Escape' }));
          expect(el.open).to.be.false;
          expect(popup(el).active).to.be.false;
          expect(focusedSegment(el)).to.equal('year');
        });

        it('closes with Alt+Up Arrow from the calendar and from a segment', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input lang="en-US" today="2026-05-04"></cs-date-input>`);
          segment(el, 'month').focus();
          await expectEvent(el, 'cs-after-show', () => sendKeys({ press: 'Alt+ArrowDown' }));
          await expectEvent(el, 'cs-after-hide', () => sendKeys({ press: 'Alt+ArrowUp' }));
          expect(focusedSegment(el)).to.equal('month');

          await el.show();
          await expectEvent(el, 'cs-after-hide', () => sendKeys({ press: 'Alt+ArrowUp' }));
          expect(el.open).to.be.false;
        });

        it('sets the value from a picked day, closes, and returns focus to the field', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input lang="en-US" today="2026-05-04"></cs-date-input>`);
          segment(el, 'month').focus();
          await expectEvent(el, 'cs-after-show', () => sendKeys({ press: 'Alt+ArrowDown' }));
          await press(el, 'ArrowRight');

          await expectEvent(el, ['input', 'change', 'cs-after-hide'], () => sendKeys({ press: 'Enter' }));
          expect(el.value).to.equal('2026-05-05');
          expect(segmentText(el)).to.equal('05/05/2026');
          expect(el.open).to.be.false;
          expect(focusedSegment(el)).to.equal('month');
        });

        it('sets the value from a clicked day', async () => {
          const el = await fixture<CsDateInput>(
            html`<cs-date-input lang="en-US" value="2026-05-11" today="2026-05-04"></cs-date-input>`,
          );
          await expectEvent(el, 'cs-after-show', () => clickOnElement(expandButton(el)));
          await expectEvent(el, ['change', 'cs-after-hide'], () => clickOnElement(pickerCell(el, '2026-05-20')));
          expect(el.value).to.equal('2026-05-20');
          expect(focusedSegment(el)).to.equal('month');
        });

        it('shows a typed date in the calendar', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input lang="en-US" today="2026-05-04"></cs-date-input>`);
          await typeInto(el, 'month', '07042026');
          await el.show();
          expect(picker(el).value).to.equal('2026-07-04');
          expect(pickerCell(el, '2026-07-04').getAttribute('aria-selected')).to.equal('true');
        });

        it('closes when focus or a press goes outside', async () => {
          // Above the field, so the popup, which opens below it, doesn't cover them.
          const container = await fixture<HTMLDivElement>(html`
            <div>
              <input class="pressed" />
              <input class="focused" />
              <cs-date-input today="2026-05-04"></cs-date-input>
            </div>
          `);
          const el = container.querySelector<CsDateInput>('cs-date-input')!;

          await el.show();
          await expectEvent(el, 'cs-after-hide', () => clickOnElement(container.querySelector('.pressed')!));
          expect(el.open).to.be.false;

          await el.show();
          await expectEvent(el, 'cs-after-hide', () => container.querySelector<HTMLInputElement>('.focused')!.focus());
          expect(el.open).to.be.false;
        });

        it('closes with Escape when it was rendered open', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input open today="2026-05-04"></cs-date-input>`);
          expect(popup(el).active).to.be.true;
          await expectEvent(el, 'cs-after-hide', () => sendKeys({ press: 'Escape' }));
          expect(el.open).to.be.false;
        });

        it('lets the calendar be browsed but not changed when readonly', async () => {
          const el = await fixture<CsDateInput>(
            html`<cs-date-input readonly value="2026-05-11" today="2026-05-04"></cs-date-input>`,
          );
          await expectEvent(el, 'cs-after-show', () => clickOnElement(expandButton(el)));
          await clickOnElement(pickerCell(el, '2026-05-20'));
          await el.updateComplete;
          expect(el.value).to.equal('2026-05-11');
          expect(el.open).to.be.true;
        });

        it('does not open when disabled, and closes when disabled while open', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input></cs-date-input>`);
          await el.show();
          await expectEvent(el, 'cs-after-hide', async () => {
            el.disabled = true;
            await el.updateComplete;
          });
          expect(el.open).to.be.false;

          await el.show();
          expect(el.open).to.be.false;
        });

        it('stays closed, and reports no hide, when cs-show is cancelled', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input lang="en-US"></cs-date-input>`);
          const cancel = (event: Event) => event.preventDefault();
          el.addEventListener('cs-show', cancel);
          const hide = sinon.spy();
          el.addEventListener('cs-hide', hide);
          await expectEvent(el, 'cs-show', () => clickOnElement(expandButton(el)));
          await el.updateComplete;
          expect(el.open).to.be.false;
          expect(popup(el).active).to.be.false;
          expect(hide.callCount).to.equal(0);

          // The cancelled open asked for focus to move into the calendar; a later press in the field must not inherit it.
          el.removeEventListener('cs-show', cancel);
          await expectEvent(el, 'cs-after-show', () => clickOnElement(segment(el, 'day')));
          expect(focusedSegment(el)).to.equal('day');
        });

        it('defaults to bottom-start placement with no distance', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input></cs-date-input>`);
          expect(el.placement).to.equal('bottom-start');
          expect(popup(el).placement).to.equal('bottom-start');
          expect(popup(el).distance).to.equal(0);
        });

        it('animates its popup for --cs-show-duration and --cs-hide-duration set on it', async () => {
          const el = await fixture<CsDateInput>(
            html`<cs-date-input style="--cs-show-duration: 120ms; --cs-hide-duration: 80ms"></cs-date-input>`,
          );
          const shown = oneEvent(el, 'cs-after-show');
          void el.show();
          await expectAnimationDuration(popup(el).popup, '--cs-show-duration');
          await shown;

          const hidden = oneEvent(el, 'cs-after-hide');
          void el.hide();
          await expectAnimationDuration(popup(el).popup, '--cs-hide-duration');
          await hidden;
        });

        it('opens and closes without motion when the user prefers reduced motion', async () => {
          const el = await fixture<CsDateInput>(
            html`<cs-date-input style="--cs-show-duration: 400ms; --cs-hide-duration: 400ms"></cs-date-input>`,
          );
          await emulateMedia({ reducedMotion: 'reduce' });
          try {
            const shown = oneEvent(el, 'cs-after-show');
            void el.show();
            await expectNoMotion(popup(el).popup, 'show');
            await shown;

            const hidden = oneEvent(el, 'cs-after-hide');
            void el.hide();
            await expectNoMotion(popup(el).popup, 'hide');
            await hidden;
          } finally {
            await emulateMedia({ reducedMotion: 'no-preference' });
          }
        });
      });

      describe('trailing affordance alignment', () => {
        // The shared segmented-field styles put the expand icon and the clear button on <cs-select>'s trailing axis,
        // so a date input lines up with the form controls around it.
        function iconCenterFromRight(host: HTMLElement, partSelector: string): number {
          const part = host.shadowRoot!.querySelector(partSelector)!;
          const icon = part.querySelector('cs-icon') ?? part;
          const iconRect = icon.getBoundingClientRect();
          return host.getBoundingClientRect().right - (iconRect.left + iconRect.right) / 2;
        }

        it('aligns the expand icon and clear button with <cs-select>', async () => {
          const container = await fixture<HTMLDivElement>(html`
            <div>
              <cs-select with-clear value="a"><cs-option value="a">A</cs-option></cs-select>
              <cs-date-input with-clear value="2026-05-11"></cs-date-input>
            </div>
          `);
          const select = container.querySelector<HTMLElement & { updateComplete: Promise<unknown> }>('cs-select')!;
          const date = container.querySelector<CsDateInput>('cs-date-input')!;
          await select.updateComplete;
          await date.updateComplete;

          for (const part of ['[part~="expand-icon"]', '[part~="clear-button"]']) {
            const delta = Math.abs(iconCenterFromRight(date, part) - iconCenterFromRight(select, part));
            expect(delta, `${part} is off the select's trailing axis`).to.be.lessThan(2);
          }
        });
      });

      describe('validation', () => {
        it('is missing a value when required and empty', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input required></cs-date-input>`);
          expect(el.validity.valueMissing).to.be.true;
          expect(el.checkValidity()).to.be.false;
        });

        it('is valid when required and filled', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input required value="2026-05-11"></cs-date-input>`);
          expect(el.validity.valid).to.be.true;
        });

        it('reports a partial entry as bad input, ahead of the required message', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input lang="en-US" required></cs-date-input>`);
          await typeInto(el, 'month', '05');
          expect(el.value).to.equal('');
          expect(el.validity.badInput).to.be.true;
          expect(el.validationMessage).to.equal('Enter a valid date.');
        });

        it('reports a partial entry as bad input when not required too', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input lang="en-US"></cs-date-input>`);
          await typeInto(el, 'month', '0511');
          expect(el.validity.badInput).to.be.true;
          expect(el.checkValidity()).to.be.false;
        });

        it('reports an impossible date, such as 31 April, as bad input with no value', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input lang="en-US"></cs-date-input>`);
          await typeInto(el, 'month', '04312026');
          expect(segmentText(el)).to.equal('04/31/2026');
          expect(el.value).to.equal('');
          expect(el.validity.badInput).to.be.true;
        });

        it('is valid again once the entry is emptied', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input lang="en-US"></cs-date-input>`);
          await typeInto(el, 'month', '5');
          expect(el.validity.badInput).to.be.true;
          segment(el, 'month').focus();
          await press(el, 'Backspace');
          expect(el.validity.valid).to.be.true;
        });

        it('reports a date before min as rangeUnderflow and after max as rangeOverflow', async () => {
          const early = await fixture<CsDateInput>(
            html`<cs-date-input min="2026-05-02" value="2026-05-01"></cs-date-input>`,
          );
          expect(early.validity.rangeUnderflow).to.be.true;
          expect(early.validity.valid).to.be.false;

          const late = await fixture<CsDateInput>(
            html`<cs-date-input max="2026-05-02" value="2026-05-03"></cs-date-input>`,
          );
          expect(late.validity.rangeOverflow).to.be.true;

          const inside = await fixture<CsDateInput>(
            html`<cs-date-input min="2026-05-02" max="2026-05-02" value="2026-05-02"></cs-date-input>`,
          );
          expect(inside.validity.valid).to.be.true;
        });

        it('keeps a typed date on a disabled date in value and reports it as bad input', async () => {
          const el = await fixture<CsDateInput>(
            html`<cs-date-input lang="en-US" disabled-dates="2026-12-24 2026-12-25"></cs-date-input>`,
          );
          await typeInto(el, 'month', '12252026');
          expect(el.value).to.equal('2026-12-25');
          expect(el.validity.badInput).to.be.true;
          expect(el.validationMessage).to.equal('Enter a valid date.');
        });

        it('reports a date on a disabled weekday as bad input', async () => {
          // 10 May 2026 is a Sunday.
          const el = await fixture<CsDateInput>(
            html`<cs-date-input disabled-days-of-week="sat sun" value="2026-05-10"></cs-date-input>`,
          );
          expect(el.value).to.equal('2026-05-10');
          expect(el.validity.badInput).to.be.true;
        });

        it('checks again when min, max or the disabled dates change', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input value="2026-05-11"></cs-date-input>`);
          expect(el.validity.valid).to.be.true;

          el.min = '2026-06-01';
          await el.updateComplete;
          expect(el.validity.rangeUnderflow).to.be.true;
          el.min = '';
          await el.updateComplete;
          expect(el.validity.valid).to.be.true;

          el.disabledDates = '2026-05-11';
          await el.updateComplete;
          expect(el.validity.badInput).to.be.true;
          el.disabledDates = '';
          await el.updateComplete;
          expect(el.validity.valid).to.be.true;
        });

        it('emits cs-invalid when checked and invalid', async () => {
          const el = await fixture<CsDateInput>(html`<cs-date-input required></cs-date-input>`);
          await expectEvent(el, 'cs-invalid', () => {
            el.reportValidity();
          });
        });
      });

      describe('form association', () => {
        it('submits the ISO value under its name', async () => {
          const form = await fixture<HTMLFormElement>(
            html`<form><cs-date-input name="due" lang="en-GB" value="2026-05-11"></cs-date-input></form>`,
          );
          expect(new FormData(form).get('due')).to.equal('2026-05-11');
          expect((serialize(form) as { due: string }).due).to.equal('2026-05-11');
        });

        it('submits a typed date', async () => {
          const form = await fixture<HTMLFormElement>(
            html`<form><cs-date-input name="due" lang="en-US"></cs-date-input></form>`,
          );
          const el = form.querySelector<CsDateInput>('cs-date-input')!;
          await typeInto(el, 'month', '05112026');
          expect(new FormData(form).get('due')).to.equal('2026-05-11');
        });

        it('leaves the form data when empty or partly filled', async () => {
          const form = await fixture<HTMLFormElement>(
            html`<form novalidate><cs-date-input name="due" lang="en-US"></cs-date-input></form>`,
          );
          const el = form.querySelector<CsDateInput>('cs-date-input')!;
          expect(new FormData(form).has('due')).to.be.false;
          await typeInto(el, 'month', '0511');
          expect(new FormData(form).has('due')).to.be.false;
        });

        it('leaves the form data when disabled', async () => {
          const form = await fixture<HTMLFormElement>(
            html`<form><cs-date-input name="due" value="2026-05-11" disabled></cs-date-input></form>`,
          );
          const el = form.querySelector<CsDateInput>('cs-date-input')!;
          expect(new FormData(form).get('due')).to.equal(null);
          el.disabled = false;
          await el.updateComplete;
          expect(new FormData(form).get('due')).to.equal('2026-05-11');
        });

        it('belongs to the form its form attribute names', async () => {
          const container = await fixture<HTMLDivElement>(html`
            <div>
              <form id="date-input-external"></form>
              <cs-date-input form="date-input-external" name="due" value="2026-05-11"></cs-date-input>
            </div>
          `);
          expect(new FormData(container.querySelector('form')!).get('due')).to.equal('2026-05-11');
        });

        it('resets to its default value, dropping a partial entry', async () => {
          const form = await fixture<HTMLFormElement>(html`
            <form>
              <cs-date-input name="due" lang="en-US" value="2026-05-11"></cs-date-input>
              <cs-button type="reset">Reset</cs-button>
            </form>
          `);
          const el = form.querySelector<CsDateInput>('cs-date-input')!;
          segment(el, 'day').focus();
          await press(el, 'Backspace');
          expect(el.value).to.equal('');

          await expectEvent(form, 'reset', () => form.querySelector('cs-button')!.click());
          await el.updateComplete;
          expect(el.value).to.equal('2026-05-11');
          expect(segmentText(el)).to.equal('05/11/2026');
          expect(el.validity.valid).to.be.true;
          expect(new FormData(form).get('due')).to.equal('2026-05-11');
        });

        it('blocks submission and emits cs-invalid when required and empty', async () => {
          const form = await fixture<HTMLFormElement>(html`
            <form>
              <cs-date-input name="due" required></cs-date-input>
              <cs-button type="submit">Submit</cs-button>
            </form>
          `);
          const el = form.querySelector<CsDateInput>('cs-date-input')!;
          const submit = sinon.spy((event: Event) => event.preventDefault());
          form.addEventListener('submit', submit);
          await expectEvent(el, 'cs-invalid', () => form.querySelector('cs-button')!.click());
          expect(submit.callCount).to.equal(0);
        });
      });
    });
  }
});
