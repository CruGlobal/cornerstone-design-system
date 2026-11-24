import { expect, oneEvent, waitUntil } from '@open-wc/testing';
import { a11ySnapshot, emulateMedia, sendKeys } from '@web/test-runner-commands';
import { html, nothing, render } from 'lit';
import sinon from 'sinon';
import type { CsOptionsRequestEvent } from '../../events/options-request.js';
import { expectNoMotion } from '../../internal/test/expect-animation-duration.js';
import { expectEvent } from '../../internal/test/expect-event.js';
import { settleAnimations } from '../../internal/test/finish-animations.js';
import { fixtures } from '../../internal/test/fixture.js';
import { runFormControlBaseTests } from '../../internal/test/form-control-base-tests.js';
import { clickOnElement, isWebkit } from '../../internal/test/pointer-utilities.js';
import type CsAvatar from '../avatar/avatar.js';
import type CsOption from '../option/option.js';
import type CsTag from '../tag/tag.js';
import type CsCombobox from './combobox.js';

/** Focuses the text field and types into it, one key at a time, as a person would. */
async function type(el: CsCombobox, text: string) {
  el.focus();
  await sendKeys({ type: text });
  await el.updateComplete;
}

/** Selects whatever is in the field, then types over it. */
async function typeOver(el: CsCombobox, text: string) {
  el.focus();
  el.displayInput.select();
  await sendKeys({ type: text });
  await el.updateComplete;
}

async function press(el: CsCombobox, key: string) {
  await sendKeys({ press: key });
  await el.updateComplete;
}

function options(el: CsCombobox) {
  return [...el.querySelectorAll<CsOption>('cs-option')];
}

function shownLabels(el: CsCombobox) {
  return options(el)
    .filter((option) => !option.hidden)
    .map((option) => option.label);
}

function part(el: CsCombobox, name: string) {
  return el.shadowRoot!.querySelector<HTMLElement>(`[part~="${name}"]`)!;
}

/** The status rows that are showing, by name. */
function shownStatus(el: CsCombobox) {
  return ['empty', 'no-results', 'loading', 'error'].filter((name) => !part(el, name).hidden);
}

/**
 * Collects what the shared polite live region announces from now on. The region lives in the light DOM of
 * `document.body`, so this watches there rather than inside the component.
 */
function listenForAnnouncements() {
  const messages: string[] = [];
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node.parentElement?.matches('[aria-live="polite"]')) {
          messages.push(node.textContent ?? '');
        }
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  return { messages, stop: () => observer.disconnect() };
}

/**
 * A `filter-debounce` long enough that a request scheduled under it is still waiting when the test acts on it.
 * A keystroke reaches the page through the test runner, and on a busy machine that trip alone can outlast a
 * debounce of a few hundred milliseconds, which made "inside the debounce" a race.
 */
const STILL_WAITING = 60_000;

let heldClock: sinon.SinonFakeTimers | undefined;

/**
 * Puts `setTimeout` on a clock the test moves, so a debounce lapses when the test says and not while a keystroke
 * is on its way. The suite's `afterEach` gives the real clock back, whether the test passed, failed or timed out.
 */
function holdTimers() {
  heldClock = sinon.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'], shouldClearNativeTimers: true });
  return heldClock;
}

/** The four fruits most tests use, as option data a dataSource can return. */
const FRUIT_DATA = [
  { value: 'apple', label: 'Apple' },
  { value: 'apricot', label: 'Apricot' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
];

/** Answers like the client-side filter does: labels containing the query, ignoring case. */
function fruitsMatching(query: string) {
  return FRUIT_DATA.filter((fruit) => fruit.label.toLowerCase().includes(query.toLowerCase()));
}

/** Waits until the list shows exactly these labels and nothing is loading: at once in client mode, once the answer lands in server mode. */
async function answered(el: CsCombobox, labels: string[]) {
  await waitUntil(() => !el.loading && shownLabels(el).join() === labels.join(), `expected ${labels.join()}`);
  await el.updateComplete;
}

/** A promise whose settling the test controls, standing in for a server response. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('<cs-combobox>', () => {
  // Declared in this suite so it runs before the fixture's own afterEach, which waits on a real timer.
  afterEach(() => {
    heldClock?.restore();
    heldClock = undefined;
  });

  for (const fixture of fixtures) {
    describe(`with "${fixture.type}" rendering`, () => {
      describe('accessibility', () => {
        it('should pass accessibility tests when closed', async () => {
          const el = await fixture<CsCombobox>(
            html`<cs-combobox label="Fruit">
              <cs-option value="apple">Apple</cs-option>
              <cs-option value="apricot">Apricot</cs-option>
              <cs-option value="banana">Banana</cs-option>
              <cs-option value="cherry">Cherry</cs-option>
            </cs-combobox>`,
          );
          await expect(el).to.be.accessible();
        });

        it('should pass accessibility tests when open and filtered', async () => {
          const el = await fixture<CsCombobox>(
            html`<cs-combobox label="Fruit">
              <cs-option value="apple">Apple</cs-option>
              <cs-option value="apricot">Apricot</cs-option>
              <cs-option value="banana">Banana</cs-option>
              <cs-option value="cherry">Cherry</cs-option>
            </cs-combobox>`,
          );
          // Wait out the show animation, or axe measures text that is still fading in
          const shown = oneEvent(el, 'cs-after-show');
          await type(el, 'ap');
          await shown;
          await expect(el).to.be.accessible();
        });

        it('should pass accessibility tests when open with no results', async () => {
          const el = await fixture<CsCombobox>(
            html`<cs-combobox label="Fruit">
              <cs-option value="apple">Apple</cs-option>
              <cs-option value="apricot">Apricot</cs-option>
              <cs-option value="banana">Banana</cs-option>
              <cs-option value="cherry">Cherry</cs-option>
            </cs-combobox>`,
          );
          const shown = oneEvent(el, 'cs-after-show');
          await type(el, 'zzz');
          await shown;
          expect(shownStatus(el)).to.deep.equal(['no-results']);
          await expect(el).to.be.accessible();
        });

        it('should pass accessibility tests with tags', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="Fruit" multiple with-clear>
              <cs-option value="apple" selected>Apple</cs-option>
              <cs-option value="banana" selected>Banana</cs-option>
              <cs-option value="cherry">Cherry</cs-option>
            </cs-combobox>
          `);
          await el.show();
          await expect(el).to.be.accessible();
        });

        it('should expose an editable combobox with list autocomplete, labelled by its label', async () => {
          const el = await fixture<CsCombobox>(
            html`<cs-combobox label="Fruit">
              <cs-option value="apple">Apple</cs-option>
              <cs-option value="apricot">Apricot</cs-option>
              <cs-option value="banana">Banana</cs-option>
              <cs-option value="cherry">Cherry</cs-option>
            </cs-combobox>`,
          );
          const input = el.displayInput;
          const listbox = el.shadowRoot!.getElementById(input.getAttribute('aria-controls')!)!;

          expect(input.localName).to.equal('input');
          expect(input.getAttribute('role')).to.equal('combobox');
          expect(input.getAttribute('aria-autocomplete')).to.equal('list');
          expect(input.getAttribute('aria-expanded')).to.equal('false');
          expect(listbox.getAttribute('role')).to.equal('listbox');
          expect(input.labels?.[0]?.textContent?.trim()).to.equal('Fruit');

          await el.show();
          expect(input.getAttribute('aria-expanded')).to.equal('true');
        });

        it('should point the input at the highlighted option', async () => {
          const el = await fixture<CsCombobox>(
            html`<cs-combobox label="Fruit">
              <cs-option value="apple">Apple</cs-option>
              <cs-option value="apricot">Apricot</cs-option>
              <cs-option value="banana">Banana</cs-option>
              <cs-option value="cherry">Cherry</cs-option>
            </cs-combobox>`,
          );
          const [, , banana] = options(el);
          const announcements = listenForAnnouncements();

          try {
            await type(el, 'ban');
            await waitUntil(() => el.currentOption === banana);

            if ('ariaActiveDescendantElement' in Element.prototype) {
              // The reference reaches from the shadow root out to the option in the light DOM.
              expect(el.displayInput.ariaActiveDescendantElement === banana, 'active descendant').to.be.true;
            } else {
              // An ID reference cannot leave the shadow root, so none is written, and the live region reads instead.
              expect(el.displayInput.hasAttribute('aria-activedescendant')).to.be.false;
              await press(el, 'ArrowDown');
              await waitUntil(() => announcements.messages.includes('Banana'));
            }
          } finally {
            announcements.stop();
          }
        });

        it('should read the highlighted option aloud where element reflection is missing', async () => {
          const el = await fixture<CsCombobox>(
            html`<cs-combobox label="Fruit">
              <cs-option value="apple">Apple</cs-option>
              <cs-option value="apricot">Apricot</cs-option>
              <cs-option value="banana">Banana</cs-option>
              <cs-option value="cherry">Cherry</cs-option>
            </cs-combobox>`,
          );
          const descriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'ariaActiveDescendantElement');
          const announcements = listenForAnnouncements();

          try {
            // Simulate an engine without ARIA element reflection
            delete (Element.prototype as Partial<Element>).ariaActiveDescendantElement;
            el.focus();
            await press(el, 'ArrowDown');
            await waitUntil(() => el.open);
            await press(el, 'ArrowDown');

            expect(el.currentOption?.label).to.equal('Apricot');
            await waitUntil(() => announcements.messages.includes('Apricot'));
          } finally {
            if (descriptor) {
              Object.defineProperty(Element.prototype, 'ariaActiveDescendantElement', descriptor);
            }
            announcements.stop();
          }
        });
      });

      describe('live region', () => {
        it('should announce the result count as the list narrows', async () => {
          const el = await fixture<CsCombobox>(
            html`<cs-combobox label="Fruit">
              <cs-option value="apple">Apple</cs-option>
              <cs-option value="apricot">Apricot</cs-option>
              <cs-option value="banana">Banana</cs-option>
              <cs-option value="cherry">Cherry</cs-option>
            </cs-combobox>`,
          );
          const announcements = listenForAnnouncements();

          try {
            await type(el, 'ap');
            await waitUntil(() => announcements.messages.includes('2 results'));
            await type(el, 'r');
            await waitUntil(() => announcements.messages.includes('1 result'));
          } finally {
            announcements.stop();
          }
        });

        it('should announce when nothing matches', async () => {
          const el = await fixture<CsCombobox>(
            html`<cs-combobox label="Fruit">
              <cs-option value="apple">Apple</cs-option>
              <cs-option value="apricot">Apricot</cs-option>
              <cs-option value="banana">Banana</cs-option>
              <cs-option value="cherry">Cherry</cs-option>
            </cs-combobox>`,
          );
          const announcements = listenForAnnouncements();

          try {
            await type(el, 'zzz');
            await waitUntil(() => announcements.messages.includes('No matching results'));
          } finally {
            announcements.stop();
          }
        });

        it('should announce the empty message, and a slotted one in its place', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="Fruit">
              <span slot="empty">Add a fruit first</span>
            </cs-combobox>
          `);
          const announcements = listenForAnnouncements();

          try {
            await el.show();
            expect(shownStatus(el)).to.deep.equal(['empty']);
            await waitUntil(() => announcements.messages.includes('Add a fruit first'));
          } finally {
            announcements.stop();
          }
        });
      });

      describe('filtering', () => {
        it('should show every option, with a check on the current pick, when opened with nothing typed', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="Fruit" value="banana">
              <cs-option value="apple">Apple</cs-option>
              <cs-option value="apricot">Apricot</cs-option>
              <cs-option value="banana">Banana</cs-option>
              <cs-option value="cherry">Cherry</cs-option>
            </cs-combobox>
          `);
          await el.show();

          expect(shownLabels(el)).to.deep.equal(['Apple', 'Apricot', 'Banana', 'Cherry']);
          const banana = options(el)[2];
          expect(banana.selected).to.be.true;
          expect(banana.getAttribute('aria-selected')).to.equal('true');
          expect(banana.shadowRoot!.querySelector('cs-icon[part~="checked-icon"]') !== null, 'element present').to.be
            .true;
        });

        it('should narrow the list as the user types and highlight the first match', async () => {
          const el = await fixture<CsCombobox>(
            html`<cs-combobox label="Fruit">
              <cs-option value="apple">Apple</cs-option>
              <cs-option value="apricot">Apricot</cs-option>
              <cs-option value="banana">Banana</cs-option>
              <cs-option value="cherry">Cherry</cs-option>
            </cs-combobox>`,
          );
          await type(el, 'ap');
          await waitUntil(() => el.open);

          expect(shownLabels(el)).to.deep.equal(['Apple', 'Apricot']);
          expect(el.currentOption?.label).to.equal('Apple');
          expect(el.inputValue).to.equal('ap');
          // Typing never changes the value
          expect(el.value).to.equal(null);
        });

        it('should match anywhere in the label, ignoring case', async () => {
          const el = await fixture<CsCombobox>(
            html`<cs-combobox label="Fruit">
              <cs-option value="apple">Apple</cs-option>
              <cs-option value="apricot">Apricot</cs-option>
              <cs-option value="banana">Banana</cs-option>
              <cs-option value="cherry">Cherry</cs-option>
            </cs-combobox>`,
          );
          await type(el, 'ERR');
          await waitUntil(() => el.open);
          expect(shownLabels(el)).to.deep.equal(['Cherry']);
        });

        it('should use a custom filter', async () => {
          const el = await fixture<CsCombobox>(
            html`<cs-combobox label="Fruit">
              <cs-option value="apple">Apple</cs-option>
              <cs-option value="apricot">Apricot</cs-option>
              <cs-option value="banana">Banana</cs-option>
              <cs-option value="cherry">Cherry</cs-option>
            </cs-combobox>`,
          );
          el.filter = (option, query) => option.label.toLowerCase().startsWith(query.toLowerCase());
          await type(el, 'a');
          await waitUntil(() => el.open);
          // "Banana" contains an "a" but does not start with one
          expect(shownLabels(el)).to.deep.equal(['Apple', 'Apricot']);
        });

        it('should hide dividers and group labels while filtering, and restore them on close', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="Fruit">
              <small>Tree</small>
              <cs-option value="apple">Apple</cs-option>
              <cs-divider></cs-divider>
              <cs-option value="banana">Banana</cs-option>
            </cs-combobox>
          `);
          const small = el.querySelector('small')!;
          const divider = el.querySelector('cs-divider')!;

          await type(el, 'b');
          await waitUntil(() => el.open);
          expect(small.hidden).to.be.true;
          expect(divider.hidden).to.be.true;
          // The hidden attribute alone loses to a slotted display rule, so check what renders
          expect(getComputedStyle(small).display).to.equal('none');
          expect(getComputedStyle(divider).display).to.equal('none');

          await el.hide();
          expect(small.hidden).to.be.false;
          expect(divider.hidden).to.be.false;
          expect(getComputedStyle(small).display).to.not.equal('none');
          expect(getComputedStyle(divider).display).to.not.equal('none');
          expect(shownLabels(el)).to.deep.equal(['Apple', 'Banana']);
        });

        it('should leave an option the author hid alone', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="Fruit">
              <cs-option value="apple">Apple</cs-option>
              <cs-option value="avocado" hidden>Avocado</cs-option>
            </cs-combobox>
          `);
          await type(el, 'a');
          await waitUntil(() => el.open);
          expect(shownLabels(el)).to.deep.equal(['Apple']);

          await el.hide();
          expect(options(el)[1].hidden).to.be.true;
        });

        it('should keep the list open and say so when nothing matches', async () => {
          const el = await fixture<CsCombobox>(
            html`<cs-combobox label="Fruit">
              <cs-option value="apple">Apple</cs-option>
              <cs-option value="apricot">Apricot</cs-option>
              <cs-option value="banana">Banana</cs-option>
              <cs-option value="cherry">Cherry</cs-option>
            </cs-combobox>`,
          );
          await type(el, 'zzz');
          await waitUntil(() => el.open);

          expect(shownLabels(el)).to.deep.equal([]);
          expect(shownStatus(el)).to.deep.equal(['no-results']);
          expect(part(el, 'no-results').textContent?.trim()).to.equal('No matching results');

          await press(el, 'Enter');
          expect(el.open).to.be.true;
          expect(el.value).to.equal(null);
        });

        it('should render slotted status content', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="Fruit">
              <cs-option value="apple">Apple</cs-option>
              <cs-option value="apricot">Apricot</cs-option>
              <cs-option value="banana">Banana</cs-option>
              <cs-option value="cherry">Cherry</cs-option>

              <span slot="no-results">No fruit by that name</span>
            </cs-combobox>
          `);
          await type(el, 'zzz');
          await waitUntil(() => el.open);
          const slot = part(el, 'no-results').querySelector('slot')!;
          expect(slot.assignedElements()[0].textContent).to.equal('No fruit by that name');
        });
      });

      describe('picking', () => {
        it('should pick the first match with Enter, show its label and close', async () => {
          const el = await fixture<CsCombobox>(
            html`<cs-combobox label="Fruit">
              <cs-option value="apple">Apple</cs-option>
              <cs-option value="apricot">Apricot</cs-option>
              <cs-option value="banana">Banana</cs-option>
              <cs-option value="cherry">Cherry</cs-option>
            </cs-combobox>`,
          );
          await type(el, 'ban');
          await waitUntil(() => el.open);

          await expectEvent(el, ['input', 'change'], async () => {
            await press(el, 'Enter');
          });

          expect(el.value).to.equal('banana');
          expect(el.inputValue).to.equal('Banana');
          expect(el.displayInput.value).to.equal('Banana');
          await waitUntil(() => !el.open);
        });

        it('should pick the first match with Tab', async () => {
          const el = await fixture<CsCombobox>(html`
            <div>
              <cs-combobox label="Fruit">
                <cs-option value="apple">Apple</cs-option>
                <cs-option value="apricot">Apricot</cs-option>
                <cs-option value="banana">Banana</cs-option>
                <cs-option value="cherry">Cherry</cs-option>
              </cs-combobox>
              <button>Next</button>
            </div>
          `);
          const combobox = el.querySelector('cs-combobox')!;
          await type(combobox, 'che');
          await waitUntil(() => combobox.open);
          await press(combobox, 'Tab');

          expect(combobox.value).to.equal('cherry');
          await waitUntil(() => !combobox.open);
        });

        describe('Tab from a list long enough to scroll', () => {
          // Chromium and Firefox make a scrolling element a tab stop, so the list's scroller must stay out of the tab
          // order. A short list does not scroll, which is why these need fifty options.
          async function longList() {
            const el = await fixture<HTMLElement>(html`
              <div>
                <cs-combobox label="State"></cs-combobox>
                <input id="next" aria-label="Next field" />
              </div>
            `);
            const combobox = el.querySelector('cs-combobox')!;
            for (let n = 1; n <= 50; n++) {
              const option = document.createElement('cs-option');
              option.value = `state-${n}`;
              option.textContent = `State ${n}`;
              combobox.append(option);
            }
            await waitUntil(() => options(combobox).length === 50);
            await combobox.updateComplete;
            return { combobox, next: el.querySelector<HTMLInputElement>('#next')! };
          }

          it('should move on to the next field and close, with nothing picked', async () => {
            const { combobox, next } = await longList();
            combobox.focus();
            await press(combobox, 'Alt+ArrowDown');
            await waitUntil(() => combobox.open);
            const listbox = part(combobox, 'listbox');
            expect(listbox.scrollHeight > listbox.clientHeight, 'the list scrolls').to.be.true;

            await press(combobox, 'Tab');
            expect(document.activeElement === next, 'focus on the next field').to.be.true;
            await waitUntil(() => !combobox.open);
            expect(combobox.value).to.equal(null);
          });

          it('should pick the highlight, close and move on to the next field', async () => {
            const { combobox, next } = await longList();
            combobox.focus();
            await press(combobox, 'ArrowDown');
            await waitUntil(() => combobox.open);

            await press(combobox, 'Tab');
            expect(combobox.value).to.equal('state-1');
            await waitUntil(() => !combobox.open);
            expect(document.activeElement === next, 'focus on the next field').to.be.true;
          });
        });

        it('should not pick anything on Tab when nothing was typed or chosen', async () => {
          const el = await fixture<CsCombobox>(html`
            <div>
              <cs-combobox label="Fruit">
                <cs-option value="apple">Apple</cs-option>
                <cs-option value="apricot">Apricot</cs-option>
                <cs-option value="banana">Banana</cs-option>
                <cs-option value="cherry">Cherry</cs-option>
              </cs-combobox>
              <button>Next</button>
            </div>
          `);
          const combobox = el.querySelector('cs-combobox')!;
          await clickOnElement(combobox.displayInput);
          await waitUntil(() => combobox.open);
          await press(combobox, 'Tab');

          expect(combobox.value).to.equal(null);
          await waitUntil(() => !combobox.open);
        });

        it('should pick an option with a tap', async () => {
          const el = await fixture<CsCombobox>(
            html`<cs-combobox label="Fruit">
              <cs-option value="apple">Apple</cs-option>
              <cs-option value="apricot">Apricot</cs-option>
              <cs-option value="banana">Banana</cs-option>
              <cs-option value="cherry">Cherry</cs-option>
            </cs-combobox>`,
          );
          await type(el, 'a');
          await waitUntil(() => el.open);
          await el.updateComplete;
          const apricot = options(el)[1];

          await expectEvent(el, ['input', 'change'], async () => {
            await clickOnElement(apricot);
            await el.updateComplete;
          });

          expect(el.value).to.equal('apricot');
          expect(el.shadowRoot!.activeElement === el.displayInput, 'focused element').to.be.true;
        });

        it('should move the highlight with the arrow keys, keeping focus in the field', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="Fruit">
              <cs-option value="apple">Apple</cs-option>
              <cs-option value="apricot" disabled>Apricot</cs-option>
              <cs-option value="banana">Banana</cs-option>
              <cs-option value="cherry">Cherry</cs-option>
            </cs-combobox>
          `);
          el.focus();
          await press(el, 'ArrowDown');
          await waitUntil(() => el.open);
          expect(el.currentOption?.label).to.equal('Apple');

          // The disabled option is skipped
          await press(el, 'ArrowDown');
          expect(el.currentOption?.label).to.equal('Banana');
          await press(el, 'ArrowDown');
          expect(el.currentOption?.label).to.equal('Cherry');
          // And the highlight wraps
          await press(el, 'ArrowDown');
          expect(el.currentOption?.label).to.equal('Apple');
          await press(el, 'ArrowUp');
          expect(el.currentOption?.label).to.equal('Cherry');

          expect(el.shadowRoot!.activeElement === el.displayInput, 'focused element').to.be.true;
          expect(el.currentOption!.matches(':focus')).to.be.false;
        });

        it('should close on Escape and put back the last pick’s label', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="Fruit" value="apple">
              <cs-option value="apple">Apple</cs-option>
              <cs-option value="apricot">Apricot</cs-option>
              <cs-option value="banana">Banana</cs-option>
              <cs-option value="cherry">Cherry</cs-option>
            </cs-combobox>
          `);
          await type(el, 'zz');
          await waitUntil(() => el.open);
          expect(el.inputValue).to.not.equal('Apple');

          await press(el, 'Escape');

          expect(el.inputValue).to.equal('Apple');
          expect(el.displayInput.value).to.equal('Apple');
          expect(el.value).to.equal('apple');
          await waitUntil(() => !el.open);
        });

        it('should stop Escape from reaching anything behind the open list', async () => {
          const el = await fixture<CsCombobox>(
            html`<cs-combobox label="Fruit">
              <cs-option value="apple">Apple</cs-option>
              <cs-option value="apricot">Apricot</cs-option>
              <cs-option value="banana">Banana</cs-option>
              <cs-option value="cherry">Cherry</cs-option>
            </cs-combobox>`,
          );
          const documentHandler = sinon.spy();
          document.addEventListener('keydown', documentHandler);

          try {
            await type(el, 'a');
            await waitUntil(() => el.open);
            await press(el, 'Escape');
            expect(documentHandler.getCalls().some((call) => call.args[0].key === 'Escape')).to.be.false;
          } finally {
            document.removeEventListener('keydown', documentHandler);
          }
        });

        it('should never submit typed text when it is not allowed to stand as the value', async () => {
          const el = await fixture<CsCombobox>(html`
            <div>
              <cs-combobox label="Fruit" value="apple">
                <cs-option value="apple">Apple</cs-option>
                <cs-option value="apricot">Apricot</cs-option>
                <cs-option value="banana">Banana</cs-option>
                <cs-option value="cherry">Cherry</cs-option>
              </cs-combobox>
              <button>Next</button>
            </div>
          `);
          const combobox = el.querySelector('cs-combobox')!;
          await type(combobox, 'zz');
          el.querySelector('button')!.focus();
          await combobox.updateComplete;

          expect(combobox.value).to.equal('apple');
          expect(combobox.inputValue).to.equal('Apple');
        });

        it('should clear the value when the field is emptied and left', async () => {
          const el = await fixture<CsCombobox>(html`
            <div>
              <cs-combobox label="Fruit" value="apple">
                <cs-option value="apple">Apple</cs-option>
                <cs-option value="apricot">Apricot</cs-option>
                <cs-option value="banana">Banana</cs-option>
                <cs-option value="cherry">Cherry</cs-option>
              </cs-combobox>
              <button>Next</button>
            </div>
          `);
          const combobox = el.querySelector('cs-combobox')!;
          combobox.focus();
          combobox.displayInput.select();
          await press(combobox, 'Backspace');
          await waitUntil(() => combobox.open);

          await expectEvent(combobox, ['input', 'change'], async () => {
            el.querySelector('button')!.focus();
            await combobox.updateComplete;
          });
          expect(combobox.value).to.equal(null);
        });

        it('should not emit input or change while typing, or when the value is set programmatically', async () => {
          const el = await fixture<CsCombobox>(
            html`<cs-combobox label="Fruit">
              <cs-option value="apple">Apple</cs-option>
              <cs-option value="apricot">Apricot</cs-option>
              <cs-option value="banana">Banana</cs-option>
              <cs-option value="cherry">Cherry</cs-option>
            </cs-combobox>`,
          );
          const handler = sinon.spy();
          el.addEventListener('input', handler);
          el.addEventListener('change', handler);

          await type(el, 'ap');
          el.value = 'cherry';
          // input and change would be queued on this same update, so they have run by the time it settles
          await el.updateComplete;

          expect(handler).to.not.have.been.called;
          expect(el.value).to.equal('cherry');
          expect(el.inputValue).to.equal('Cherry');

          // The control: a pick by the user does fire both, and the same wait is long enough to see them
          await typeOver(el, 'ban');
          await press(el, 'Enter');
          await el.updateComplete;
          expect(handler).to.have.been.calledTwice;
        });

        it('should show a label change on the picked option', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="Fruit" value="apple">
              <cs-option value="apple">Apple</cs-option>
              <cs-option value="apricot">Apricot</cs-option>
              <cs-option value="banana">Banana</cs-option>
              <cs-option value="cherry">Cherry</cs-option>
            </cs-combobox>
          `);
          options(el)[0].textContent = 'Green apple';
          await waitUntil(() => el.inputValue === 'Green apple');
        });

        it('should leave Home and End to the text field, and hand the highlight back to the first match', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="Fruit">
              <cs-option value="apple">Apple</cs-option>
              <cs-option value="apricot">Apricot</cs-option>
              <cs-option value="banana">Banana</cs-option>
              <cs-option value="cherry">Cherry</cs-option>
            </cs-combobox>
          `);
          // Where the caret lands is the platform's call (on macOS, Firefox and WebKit leave it where it is), so assert
          // that the combobox never takes the key from the text field.
          const prevented: Record<string, boolean> = {};
          el.addEventListener('keydown', (event) => (prevented[event.key] = event.defaultPrevented));

          await type(el, 'ap');
          await waitUntil(() => el.open);
          await press(el, 'ArrowDown');
          expect(el.currentOption?.label).to.equal('Apricot');

          await press(el, 'Home');
          expect(prevented.Home).to.be.false;
          expect(el.currentOption?.label).to.equal('Apple');

          await press(el, 'End');
          expect(prevented.End).to.be.false;
          expect(el.currentOption?.label).to.equal('Apple');
          expect(el.open).to.be.true;
        });

        it('should select the pick’s label when the field is pressed, so typing replaces it', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="Fruit" value="apple">
              <cs-option value="apple">Apple</cs-option>
              <cs-option value="apricot">Apricot</cs-option>
              <cs-option value="banana">Banana</cs-option>
              <cs-option value="cherry">Cherry</cs-option>
            </cs-combobox>
          `);
          await clickOnElement(el.displayInput);
          await waitUntil(() => el.open);
          await sendKeys({ type: 'ban' });
          await el.updateComplete;

          expect(el.inputValue).to.equal('ban');
          expect(el.currentOption?.label).to.equal('Banana');
        });

        it('should select the pick’s label when the field is reached with Tab', async () => {
          const el = await fixture<HTMLElement>(html`
            <div>
              <button>Before</button>
              <cs-combobox label="Fruit" value="cherry">
                <cs-option value="apple">Apple</cs-option>
                <cs-option value="apricot">Apricot</cs-option>
                <cs-option value="banana">Banana</cs-option>
                <cs-option value="cherry">Cherry</cs-option>
              </cs-combobox>
            </div>
          `);
          const combobox = el.querySelector('cs-combobox')!;
          el.querySelector('button')!.focus();
          await press(combobox, 'Tab');

          expect(combobox.shadowRoot!.activeElement === combobox.displayInput, 'focused element').to.be.true;
          expect(combobox.displayInput.selectionStart).to.equal(0);
          expect(combobox.displayInput.selectionEnd).to.equal('Cherry'.length);
        });

        it('should submit its form on Enter while the list is closed', async () => {
          const form = await fixture<HTMLFormElement>(html`
            <form>
              <cs-combobox name="fruit" value="apple">
                <cs-option value="apple">Apple</cs-option>
                <cs-option value="apricot">Apricot</cs-option>
                <cs-option value="banana">Banana</cs-option>
                <cs-option value="cherry">Cherry</cs-option>
              </cs-combobox>
              <button type="submit">Go</button>
            </form>
          `);
          const combobox = form.querySelector('cs-combobox')!;
          const submitted = sinon.spy((event: Event) => event.preventDefault());
          form.addEventListener('submit', submitted);

          combobox.focus();
          await press(combobox, 'Enter');
          await waitUntil(() => submitted.calledOnce);
          expect(combobox.open).to.be.false;
        });

        it('should forget an arrow-key open that cs-show cancelled', async () => {
          const el = await fixture<HTMLElement>(html`
            <div>
              <cs-combobox label="Fruit">
                <cs-option value="apple">Apple</cs-option>
                <cs-option value="apricot">Apricot</cs-option>
                <cs-option value="banana">Banana</cs-option>
                <cs-option value="cherry">Cherry</cs-option>
              </cs-combobox>
              <button>Next</button>
            </div>
          `);
          const combobox = el.querySelector('cs-combobox')!;
          combobox.addEventListener('cs-show', (event) => event.preventDefault(), { once: true });
          combobox.focus();
          await press(combobox, 'ArrowDown');
          expect(combobox.open).to.be.false;

          // A later open by pointer highlights nothing, so Tab picks nothing
          await clickOnElement(combobox.displayInput);
          await waitUntil(() => combobox.open);
          expect(combobox.currentOption?.label).to.equal(undefined);
          await press(combobox, 'Tab');
          expect(combobox.value).to.equal(null);
        });
      });

      describe('multiple', () => {
        it('should turn picks into tags, clear the field after each and stay open', async () => {
          const el = await fixture<CsCombobox>(
            html`<cs-combobox label="Fruit" multiple>
              <cs-option value="apple">Apple</cs-option>
              <cs-option value="apricot">Apricot</cs-option>
              <cs-option value="banana">Banana</cs-option>
              <cs-option value="cherry">Cherry</cs-option>
            </cs-combobox>`,
          );
          await type(el, 'ban');
          await waitUntil(() => el.open);
          await press(el, 'Enter');

          expect(el.value).to.deep.equal(['banana']);
          expect(el.inputValue).to.equal('');
          expect(el.displayInput.value).to.equal('');
          expect(el.open).to.be.true;

          await type(el, 'che');
          await press(el, 'Enter');
          expect(el.value).to.deep.equal(['banana', 'cherry']);

          const tags = [...el.shadowRoot!.querySelectorAll('[part~="tag"]')].map((tag) => tag.textContent?.trim());
          expect(tags).to.deep.equal(['Banana', 'Cherry']);
        });

        it('should remove the last tag with Backspace in an empty field', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="Fruit" multiple>
              <cs-option value="apple" selected>Apple</cs-option>
              <cs-option value="banana" selected>Banana</cs-option>
              <cs-option value="cherry">Cherry</cs-option>
            </cs-combobox>
          `);
          el.focus();

          await expectEvent(el, ['input', 'change'], async () => {
            await press(el, 'Backspace');
          });
          expect(el.value).to.deep.equal(['apple']);
        });

        it('should remove a tag with its remove button', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="Fruit" multiple>
              <cs-option value="apple" selected>Apple</cs-option>
              <cs-option value="banana" selected>Banana</cs-option>
            </cs-combobox>
          `);
          await el.updateComplete;
          const removeButton = el
            .shadowRoot!.querySelector('[part~="tag"]')!
            .shadowRoot!.querySelector('[part~="remove-button"]')!;

          await expectEvent(el, ['input', 'change'], async () => {
            await clickOnElement(removeButton, 'center', 1, 1);
            await el.updateComplete;
          });
          expect(el.value).to.deep.equal(['banana']);
        });

        it('should collapse tags past max-options-visible into a count', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="Fruit" multiple max-options-visible="1">
              <cs-option value="apple" selected>Apple</cs-option>
              <cs-option value="banana" selected>Banana</cs-option>
              <cs-option value="cherry" selected>Cherry</cs-option>
            </cs-combobox>
          `);
          await el.updateComplete;
          const tags = [...el.shadowRoot!.querySelectorAll('[part~="tag"]')].map((tag) => tag.textContent?.trim());
          expect(tags).to.deep.equal(['Apple', '+2']);
        });

        it("should show a copy of each option's start content in its tag", async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="People" multiple>
              <cs-option value="ana" selected><cs-avatar slot="start" initials="AB"></cs-avatar>Ana Bell</cs-option>
              <cs-option value="cy">Cy Reed</cs-option>
            </cs-combobox>
          `);
          await el.updateComplete;
          const tag = part(el, 'tag');
          const copy = tag.querySelector('cs-avatar');

          expect(copy, 'a copy in the tag').to.exist;
          expect(copy === el.querySelector('cs-avatar'), 'the original moved into the tag').to.be.false;
          expect(copy!.getAttribute('initials')).to.equal('AB');
          expect(copy!.assignedSlot?.name).to.equal('start');
          expect(tag.textContent?.trim()).to.equal('Ana Bell');
        });

        // The tag's text is the option's label, which already names it, so the copy is display only.
        it("should make the copy of an option's start content inert", async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="People" multiple>
              <cs-option value="ana" selected><cs-avatar slot="start" initials="AB"></cs-avatar>Ana Bell</cs-option>
            </cs-combobox>
          `);
          await el.updateComplete;

          expect(part(el, 'tag').querySelector('cs-avatar')?.inert, 'inert').to.be.true;
          await expect(el).to.be.accessible();
        });

        // The copy has none of the original's listeners, so focus on it would lead nowhere.
        it('should keep a copy of focusable start content out of focus', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="People" multiple>
              <cs-option value="ana" selected><button slot="start" type="button">i</button>Ana Bell</cs-option>
            </cs-combobox>
          `);
          await el.updateComplete;
          const copy = part(el, 'tag').querySelector('button')!;

          copy.focus();

          expect(el.shadowRoot!.activeElement === copy, 'the copy took focus').to.be.false;
          await expect(el).to.be.accessible();
        });

        it('should show start content added to a picked option', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="Fruit" multiple>
              <cs-option value="apple" selected>Apple</cs-option>
            </cs-combobox>
          `);
          await el.updateComplete;
          const icon = document.createElement('cs-icon');
          icon.slot = 'start';
          icon.library = 'system';
          icon.name = 'check';

          el.querySelector('cs-option')!.prepend(icon);

          await waitUntil(() => part(el, 'tag').querySelector('cs-icon') !== null, 'the tag shows the new icon');
        });

        // Lit, React and Vue can set a property without writing its attribute, and the copy has to carry it.
        it('should copy start content set through properties', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="People" multiple>
              <cs-option value="ana" selected><cs-avatar slot="start"></cs-avatar>Ana Bell</cs-option>
            </cs-combobox>
          `);
          el.querySelector<CsAvatar>('cs-avatar')!.initials = 'AB';

          el.requestUpdate();
          await el.updateComplete;

          expect(part(el, 'tag').querySelector<CsAvatar>('cs-avatar')?.initials).to.equal('AB');
        });

        // A copy's id would shadow the control's own: its tags come before the hint the field is described by.
        it('should keep the ids of start content out of the shadow root', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="People" hint="Pick everyone who works on it" multiple>
              <cs-option value="ana" selected><span slot="start" id="hint">A</span>Ana Bell</cs-option>
            </cs-combobox>
          `);
          await el.updateComplete;

          expect(el.shadowRoot!.getElementById('hint') === part(el, 'hint'), 'hint resolves to the hint').to.be.true;
        });

        // A per-person avatar colour and a label's colour dot are both set inline, and the copy has to keep them.
        it('should keep inline colours on the copies', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="People" multiple>
              <cs-option value="ana" selected
                ><cs-avatar
                  slot="start"
                  initials="AB"
                  style="background-color: rgb(46, 107, 168); color: rgb(255, 255, 255)"
                ></cs-avatar
                >Ana Bell</cs-option
              >
              <cs-option value="bug" selected
                ><span
                  slot="start"
                  style="display: inline-block; width: 0.5em; height: 0.5em; border-radius: 50%; background: rgb(229, 72, 77)"
                ></span
                >Bug</cs-option
              >
            </cs-combobox>
          `);
          await el.updateComplete;
          const [avatar, dot] = [...part(el, 'tags').querySelectorAll<HTMLElement>('[slot="start"]')];

          expect(getComputedStyle(avatar).backgroundColor).to.equal('rgb(46, 107, 168)');
          expect(getComputedStyle(avatar).color).to.equal('rgb(255, 255, 255)');
          expect(getComputedStyle(dot).backgroundColor).to.equal('rgb(229, 72, 77)');
          expect(getComputedStyle(dot).borderTopLeftRadius).to.equal('50%');
          expect(dot.getBoundingClientRect().width).to.be.above(0);
        });

        // A copy has to land as the tag's own child, or the tag's sizing for a slotted avatar misses it.
        for (const size of ['xs', 's', 'm', 'l', 'xl'] as const) {
          it(`should size an avatar's copy to the tag when size="${size}"`, async () => {
            const el = await fixture<CsCombobox>(html`
              <cs-combobox label="People" size=${size} multiple>
                <cs-option value="ana" selected><cs-avatar slot="start" initials="AB"></cs-avatar>Ana Bell</cs-option>
              </cs-combobox>
            `);
            await el.updateComplete;
            const tag = part(el, 'tag');
            const textSize = parseFloat(getComputedStyle(tag.shadowRoot!.querySelector('[part~="content"]')!).fontSize);

            expect(tag.querySelector('cs-avatar')!.getBoundingClientRect().width).to.be.closeTo(textSize * 1.75, 0.5);
          });
        }

        it('should truncate a long label to the same width with or without start content', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="People" multiple>
              <cs-option value="jw" selected
                ><cs-avatar slot="start" initials="JW"></cs-avatar>Jonah Whitfield-Abernathy</cs-option
              >
              <cs-option value="jx" selected>Jonah Whitfield-Abernathy</cs-option>
            </cs-combobox>
          `);
          await el.updateComplete;
          const [withStart, without] = [...part(el, 'tags').querySelectorAll('cs-tag')].map((tag) =>
            tag.shadowRoot!.querySelector<HTMLElement>('[part~="content"]')!,
          );

          expect(withStart.scrollWidth > withStart.clientWidth, 'the label is truncated').to.be.true;
          expect(withStart.getBoundingClientRect().width).to.be.closeTo(without.getBoundingClientRect().width, 0.5);
        });

        // What a screen reader gets from a tag: its text, then one button named Remove. The inert copy adds neither.
        // Checked in the DOM they come from: Playwright's accessibility snapshot of a tag is empty on Linux WebKit, and
        // shows an inert avatar's initials on macOS WebKit.
        it("should leave a tag's text and remove button as they were", async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="People" multiple>
              <cs-option value="ana" selected><cs-avatar slot="start" initials="AB"></cs-avatar>Ana Bell</cs-option>
            </cs-combobox>
          `);
          await el.updateComplete;
          const tag = part(el, 'tag') as CsTag;
          await tag.updateComplete;
          const copy = tag.querySelector<HTMLElement>('cs-avatar')!;
          const text = [...tag.childNodes]
            .filter((node) => node.nodeType === Node.TEXT_NODE)
            .map((node) => node.textContent);
          const buttons = [...tag.shadowRoot!.querySelectorAll('cs-button')];

          expect(copy.inert, 'the copy is inert').to.be.true;
          expect(text.join('').trim()).to.equal('Ana Bell');
          expect(buttons.map((button) => button.querySelector('cs-icon')?.label)).to.deep.equal(['Remove']);
        });

        // The same, read from the accessibility tree. Playwright's snapshot of a tag is empty on Linux WebKit and shows an
        // inert avatar's initials on macOS WebKit, so this runs where the tree is complete.
        (isWebkit ? it.skip : it)("should leave a tag's accessible text and remove button as they were", async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="People" multiple>
              <cs-option value="ana" selected><cs-avatar slot="start" initials="AB"></cs-avatar>Ana Bell</cs-option>
            </cs-combobox>
          `);
          await el.updateComplete;
          type AccessibilityNode = { role: string; name?: string; children?: AccessibilityNode[] };
          const nodes: AccessibilityNode[] = [];
          const walk = (node: AccessibilityNode) => {
            nodes.push(node);
            node.children?.forEach(walk);
          };

          walk((await a11ySnapshot({})) as unknown as AccessibilityNode);

          expect(
            nodes.some((node) => node.name === 'Ana Bell'),
            'Ana Bell',
          ).to.be.true;
          expect(nodes.filter((node) => node.role === 'button').map((node) => node.name)).to.deep.equal(['Remove']);
          expect(nodes.filter((node) => node.name === 'AB').length, 'AB nodes').to.equal(0);
        });

        // A copy made fresh each render would fetch a broken image again every time, and its error would leave the
        // control as if the page's own avatar had failed again.
        it("should keep a failed image's copy, and its error, inside the tag as the control renders", async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="People" multiple>
              <cs-option value="ana" selected
                ><cs-avatar slot="start" initials="AB" image="/no-such-image.png"></cs-avatar>Ana Bell</cs-option
              >
            </cs-combobox>
          `);
          const original = el.querySelector('cs-avatar')!;
          const errors: EventTarget[] = [];
          el.addEventListener('cs-error', (event) => errors.push(event.target!));
          await el.updateComplete;
          const copy = part(el, 'tag').querySelector('cs-avatar')!;
          await waitUntil(() => copy.shadowRoot?.querySelector('.initials'), 'the copy falls back to its initials');

          await type(el, 'a');

          expect(part(el, 'tag').querySelector('cs-avatar') === copy, 'the same copy').to.be.true;
          expect(errors.filter((target) => target !== original).length, 'errors from the copy').to.equal(0);
        });

        it('should leave start content out of the tag that counts the rest', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="People" multiple max-options-visible="1">
              <cs-option value="ana" selected><cs-avatar slot="start" initials="AB"></cs-avatar>Ana Bell</cs-option>
              <cs-option value="cy" selected><cs-avatar slot="start" initials="CR"></cs-avatar>Cy Reed</cs-option>
            </cs-combobox>
          `);
          await el.updateComplete;
          const tags = [...part(el, 'tags').querySelectorAll('cs-tag')];

          expect(tags.map((tag) => tag.textContent?.trim())).to.deep.equal(['Ana Bell', '+1']);
          expect(tags[1].querySelector('[slot="start"]')).to.be.null;
        });

        // Turbo's morph can re-create the option elements after a save. The tags have to come back whole.
        it('should show the start content of re-created options', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="People" multiple>
              <cs-option value="ana" selected><cs-avatar slot="start" initials="AB"></cs-avatar>Ana Bell</cs-option>
            </cs-combobox>
          `);
          await el.updateComplete;

          el.querySelector('cs-option')!.replaceWith(
            Object.assign(document.createElement('div'), {
              innerHTML:
                '<cs-option value="ana" selected><cs-avatar slot="start" initials="AC"></cs-avatar>Ana Bell</cs-option>',
            }).firstElementChild!,
          );

          await waitUntil(
            () => part(el, 'tag')?.querySelector('cs-avatar')?.getAttribute('initials') === 'AC',
            'the tag shows the new option',
          );
          expect(el.value).to.deep.equal(['ana']);
        });

        it('should remove a custom tag through its data-value', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="Fruit" multiple>
              <cs-option value="apple" selected>Apple</cs-option>
              <cs-option value="banana" selected>Banana</cs-option>
            </cs-combobox>
          `);
          el.getTag = (option) => {
            const tag = document.createElement('cs-tag');
            tag.withRemove = true;
            tag.dataset.value = option.value;
            tag.append(option.label);
            return tag;
          };
          el.requestUpdate();
          await el.updateComplete;
          const tag = part(el, 'tags').querySelector<CsTag>('cs-tag[data-value="apple"]')!;
          await tag.updateComplete;

          await expectEvent(el, ['input', 'change'], async () => {
            await clickOnElement(tag.shadowRoot!.querySelector('[part~="remove-button"]')!, 'center', 1, 1);
            await el.updateComplete;
          });
          expect(el.value).to.deep.equal(['banana']);
        });

        it('should render a string from getTag as text, never as HTML', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="Fruit" multiple>
              <cs-option value="apple" selected>Apple</cs-option>
            </cs-combobox>
          `);
          el.getTag = (option) => `<img src="x" alt="${option.label}">`;
          el.requestUpdate();
          await el.updateComplete;

          const tags = part(el, 'tags');
          expect(tags.querySelector('img') !== null, 'element present').to.be.false;
          expect(tags.textContent).to.include('<img src="x" alt="Apple">');
        });

        it('should submit every pick with the form', async () => {
          const form = await fixture<HTMLFormElement>(html`
            <form>
              <cs-combobox name="fruit" multiple>
                <cs-option value="apple" selected>Apple</cs-option>
                <cs-option value="banana" selected>Banana</cs-option>
                <cs-option value="cherry">Cherry</cs-option>
              </cs-combobox>
            </form>
          `);
          expect(new FormData(form).getAll('fruit')).to.deep.equal(['apple', 'banana']);
        });
      });

      describe('allow-custom-value', () => {
        it('should keep typed text that matches no option as the value', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="Fruit" allow-custom-value>
              <cs-option value="apple">Apple</cs-option>
              <cs-option value="apricot">Apricot</cs-option>
              <cs-option value="banana">Banana</cs-option>
              <cs-option value="cherry">Cherry</cs-option>
            </cs-combobox>
          `);
          await type(el, 'Mango');
          await waitUntil(() => el.open);
          // Nothing is highlighted, so Enter keeps exactly what was typed
          expect(el.currentOption?.label).to.equal(undefined);

          await expectEvent(el, ['input', 'change'], async () => {
            await press(el, 'Enter');
          });
          expect(el.value).to.equal('Mango');
          expect(el.inputValue).to.equal('Mango');
        });

        it('should pick the option whose label the typed text equals', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="Fruit" allow-custom-value>
              <cs-option value="apple">Apple</cs-option>
              <cs-option value="apricot">Apricot</cs-option>
              <cs-option value="banana">Banana</cs-option>
              <cs-option value="cherry">Cherry</cs-option>
            </cs-combobox>
          `);
          await type(el, 'apple');
          await press(el, 'Enter');
          expect(el.value).to.equal('apple');
          expect(el.inputValue).to.equal('Apple');
        });

        it('should keep typed text when the user clicks away', async () => {
          const el = await fixture<HTMLElement>(html`
            <div>
              <p>Somewhere else, above the list that opens below</p>
              <cs-combobox label="Fruit" allow-custom-value>
                <cs-option value="apple">Apple</cs-option>
              </cs-combobox>
            </div>
          `);
          const combobox = el.querySelector('cs-combobox')!;
          await type(combobox, 'Mango');
          await waitUntil(() => combobox.open);

          await clickOnElement(el.querySelector('p')!);
          await waitUntil(() => !combobox.open);
          expect(combobox.value).to.equal('Mango');
        });

        it('should keep typed text however the list is closed, except with Escape', async () => {
          const form = await fixture<HTMLFormElement>(html`
            <form>
              <cs-combobox name="fruit" label="Fruit" allow-custom-value>
                <cs-option value="apple">Apple</cs-option>
                <cs-option value="apricot">Apricot</cs-option>
                <cs-option value="banana">Banana</cs-option>
                <cs-option value="cherry">Cherry</cs-option>
              </cs-combobox>
            </form>
          `);
          const el = form.querySelector('cs-combobox')!;

          await type(el, 'Mango');
          await press(el, 'Alt+ArrowUp');
          await waitUntil(() => !el.open);
          expect(el.value).to.equal('Mango');

          await typeOver(el, 'Papaya');
          await waitUntil(() => el.open);
          await clickOnElement(part(el, 'expand-icon'));
          await waitUntil(() => !el.open);
          expect(el.value).to.equal('Papaya');

          await typeOver(el, 'Guava');
          await waitUntil(() => el.open);
          await el.hide();
          expect(el.value).to.equal('Guava');
          // hide() settles the text inside an update, and the form still has to hear about it
          expect(new FormData(form).get('fruit')).to.equal('Guava');

          await typeOver(el, 'Lime');
          await waitUntil(() => el.open);
          await press(el, 'Escape');
          expect(el.value).to.equal('Guava');
          expect(el.inputValue).to.equal('Guava');
        });

        it('should empty the field when turning allow-custom-value off drops its value', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="Fruit" allow-custom-value>
              <cs-option value="apple">Apple</cs-option>
              <cs-option value="apricot">Apricot</cs-option>
              <cs-option value="banana">Banana</cs-option>
              <cs-option value="cherry">Cherry</cs-option>
            </cs-combobox>
          `);
          await type(el, 'Mango');
          await press(el, 'Enter');
          expect(el.value).to.equal('Mango');

          el.allowCustomValue = false;
          await el.updateComplete;
          expect(el.value).to.equal(null);
          expect(el.inputValue).to.equal('');
          expect(el.displayInput.value).to.equal('');
        });

        it('should settle typed text on hide(), changing the value and emitting input and change', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="Fruit" allow-custom-value>
              <cs-option value="apple">Apple</cs-option>
              <cs-option value="banana">Banana</cs-option>
            </cs-combobox>
          `);

          // Custom text is kept
          await type(el, 'Mango');
          await expectEvent(el, ['input', 'change'], () => el.hide());
          expect(el.value).to.equal('Mango');

          // Text equal to an option's label picks that option
          await typeOver(el, 'banana');
          await expectEvent(el, ['input', 'change'], () => el.hide());
          expect(el.value).to.equal('banana');
          expect(el.inputValue).to.equal('Banana');

          // An emptied field clears the value
          el.focus();
          el.displayInput.select();
          await press(el, 'Backspace');
          await waitUntil(() => el.open);
          await expectEvent(el, ['input', 'change'], () => el.hide());
          expect(el.value).to.equal(null);
        });

        it('should be ignored when multiple is set', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="Fruit" allow-custom-value multiple>
              <cs-option value="apple">Apple</cs-option>
              <cs-option value="apricot">Apricot</cs-option>
              <cs-option value="banana">Banana</cs-option>
              <cs-option value="cherry">Cherry</cs-option>
            </cs-combobox>
          `);
          await type(el, 'Mango');
          await press(el, 'Enter');
          expect(el.value).to.deep.equal([]);
        });
      });

      describe('allow-create', () => {
        it('should offer to create typed text that matches nothing, and pick what it creates', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="Fruit" allow-create>
              <cs-option value="apple">Apple</cs-option>
              <cs-option value="apricot">Apricot</cs-option>
              <cs-option value="banana">Banana</cs-option>
              <cs-option value="cherry">Cherry</cs-option>
            </cs-combobox>
          `);
          await type(el, 'Mango');
          await waitUntil(() => el.open);
          await el.updateComplete;

          const createOption = el.shadowRoot!.querySelector<CsOption>('.create-option')!;
          expect(createOption.textContent?.trim()).to.equal('Create "Mango"');
          expect(shownStatus(el)).to.deep.equal([]);

          const [createEvent] = await expectEvent(el, 'cs-create', async () => {
            await press(el, 'Enter');
          });
          expect((createEvent as CustomEvent).detail).to.deep.equal({ inputValue: 'Mango' });

          expect(el.value).to.equal('Mango');
          const created = options(el).at(-1)!;
          expect(created.value).to.equal('Mango');
          expect(created.label).to.equal('Mango');
        });

        it('should create on Tab when the create option is the highlight', async () => {
          const el = await fixture<HTMLElement>(html`
            <div>
              <cs-combobox label="Fruit" allow-create>
                <cs-option value="apple">Apple</cs-option>
                <cs-option value="apricot">Apricot</cs-option>
                <cs-option value="banana">Banana</cs-option>
                <cs-option value="cherry">Cherry</cs-option>
              </cs-combobox>
              <button>Next</button>
            </div>
          `);
          const combobox = el.querySelector('cs-combobox')!;
          await type(combobox, 'Kiwi');
          await waitUntil(() => combobox.open);
          await combobox.updateComplete;
          await press(combobox, 'Tab');

          expect(combobox.value).to.equal('Kiwi');
          expect(options(combobox).at(-1)!.value).to.equal('Kiwi');
        });

        it('should pick an option that already has the typed value instead of adding a second', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="Fruit" allow-create multiple>
              <cs-option value="kiwi" selected>Green fruit</cs-option>
              <cs-option value="lime">Lime</cs-option>
            </cs-combobox>
          `);
          await type(el, 'kiwi');
          await waitUntil(() => el.open);
          await el.updateComplete;
          await press(el, 'Enter');

          expect(options(el).length).to.equal(2);
          // Already picked, so it stays picked rather than toggling off
          expect(el.value).to.deep.equal(['kiwi']);
          expect(el.inputValue).to.equal('');

          await type(el, 'lime');
          await waitUntil(() => el.currentOption?.value === 'lime');
          await press(el, 'Enter');
          expect(el.value).to.deep.equal(['kiwi', 'lime']);
          expect(options(el).length).to.equal(2);
        });

        it('should not offer to create a value a disabled option holds', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="Fruit" allow-create>
              <cs-option value="kiwi" disabled>Green fruit</cs-option>
              <cs-option value="lime">Lime</cs-option>
            </cs-combobox>
          `);
          const created = sinon.spy();
          el.addEventListener('cs-create', created);

          await type(el, 'kiwi');
          await waitUntil(() => el.open);
          await el.updateComplete;
          expect(el.shadowRoot!.querySelector('.create-option') !== null, 'element present').to.be.false;
          expect(shownStatus(el)).to.deep.equal(['no-results']);

          await press(el, 'Enter');
          expect(created).to.not.have.been.called;
          expect(el.value).to.equal(null);
        });

        it('should let a cancelled cs-create leave the options alone', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="Fruit" allow-create>
              <cs-option value="apple">Apple</cs-option>
              <cs-option value="apricot">Apricot</cs-option>
              <cs-option value="banana">Banana</cs-option>
              <cs-option value="cherry">Cherry</cs-option>
            </cs-combobox>
          `);
          el.addEventListener('cs-create', (event) => event.preventDefault());
          await type(el, 'Mango');
          await waitUntil(() => el.open);
          await el.updateComplete;
          await press(el, 'Enter');

          expect(options(el).length).to.equal(4);
          expect(el.value).to.equal(null);
        });

        it('should add created picks as tags in multiple mode', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="Fruit" allow-create multiple>
              <cs-option value="apple">Apple</cs-option>
              <cs-option value="apricot">Apricot</cs-option>
              <cs-option value="banana">Banana</cs-option>
              <cs-option value="cherry">Cherry</cs-option>
            </cs-combobox>
          `);
          await type(el, 'Kiwi');
          await waitUntil(() => el.open);
          await el.updateComplete;
          await press(el, 'Enter');
          expect(el.value).to.deep.equal(['Kiwi']);
          expect(el.inputValue).to.equal('');
        });

        it('should let the page create the option itself after cancelling cs-create', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="Fruit" allow-create multiple>
              <cs-option value="apple">Apple</cs-option>
            </cs-combobox>
          `);
          el.addEventListener('cs-create', (event) => {
            event.preventDefault();
            const value = event.detail.inputValue.toLowerCase();
            const option = document.createElement('cs-option');
            option.value = value;
            option.textContent = value;
            el.append(option);
            el.value = [...(el.value as string[]), value];
          });

          await type(el, 'KIWI');
          await waitUntil(() => el.open);
          await el.updateComplete;
          await press(el, 'Enter');
          await waitUntil(() => (el.value as string[]).includes('kiwi'));

          // Setting the value from outside empties the half-typed query, so the list shows everything again
          expect(el.inputValue).to.equal('');
          expect(el.displayInput.value).to.equal('');
          expect(shownLabels(el)).to.deep.equal(['Apple', 'kiwi']);
        });
      });

      describe('clearing', () => {
        it('should highlight the pick on the next open after clearing a closed list', async () => {
          const form = await fixture<HTMLFormElement>(html`
            <form>
              <cs-combobox name="fruit" label="Fruit" with-clear>
                <cs-option value="apple">Apple</cs-option>
                <cs-option value="banana" selected>Banana</cs-option>
              </cs-combobox>
            </form>
          `);
          const el = form.querySelector('cs-combobox')!;
          await el.updateComplete;

          // The clear button does not open the list
          await clickOnElement(part(el, 'clear-button'));
          expect(el.value).to.equal(null);
          expect(el.open).to.be.false;

          form.reset();
          await el.updateComplete;
          expect(el.value).to.equal('banana');

          await clickOnElement(el.displayInput);
          await waitUntil(() => el.open);
          expect(el.currentOption?.value).to.equal('banana');
        });

        it('should clear the value and emit cs-clear, input and change', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="Fruit" with-clear value="apple">
              <cs-option value="apple">Apple</cs-option>
              <cs-option value="apricot">Apricot</cs-option>
              <cs-option value="banana">Banana</cs-option>
              <cs-option value="cherry">Cherry</cs-option>
            </cs-combobox>
          `);
          await el.updateComplete;

          await expectEvent(el, ['cs-clear', 'input', 'change'], async () => {
            await clickOnElement(part(el, 'clear-button'));
            await el.updateComplete;
          });
          expect(el.value).to.equal(null);
          expect(el.inputValue).to.equal('');
          expect(el.shadowRoot!.activeElement === el.displayInput, 'focused element').to.be.true;
        });
      });

      describe('events', () => {
        it('should emit cs-show, cs-after-show, cs-hide, and cs-after-hide', async () => {
          const el = await fixture<CsCombobox>(
            html`<cs-combobox label="Fruit">
              <cs-option value="apple">Apple</cs-option>
              <cs-option value="apricot">Apricot</cs-option>
              <cs-option value="banana">Banana</cs-option>
              <cs-option value="cherry">Cherry</cs-option>
            </cs-combobox>`,
          );
          await expectEvent(el, ['cs-show', 'cs-after-show'], () => el.show());
          await expectEvent(el, ['cs-hide', 'cs-after-hide'], () => el.hide());
        });

        it('should open when the field is pressed', async () => {
          const el = await fixture<CsCombobox>(
            html`<cs-combobox label="Fruit">
              <cs-option value="apple">Apple</cs-option>
              <cs-option value="apricot">Apricot</cs-option>
              <cs-option value="banana">Banana</cs-option>
              <cs-option value="cherry">Cherry</cs-option>
            </cs-combobox>`,
          );
          await clickOnElement(el.displayInput);
          await waitUntil(() => el.open);
          expect(el.shadowRoot!.activeElement === el.displayInput, 'focused element').to.be.true;
        });
      });

      describe('disabled', () => {
        it('should not open or take input when disabled', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="Fruit" disabled>
              <cs-option value="apple">Apple</cs-option>
              <cs-option value="apricot">Apricot</cs-option>
              <cs-option value="banana">Banana</cs-option>
              <cs-option value="cherry">Cherry</cs-option>
            </cs-combobox>
          `);
          expect(el.displayInput.disabled).to.be.true;

          await el.show();
          expect(el.open).to.be.false;
          await clickOnElement(el.displayInput);
          await el.updateComplete;
          expect(el.open).to.be.false;
          expect(el.shadowRoot!.activeElement === null, 'focused element').to.be.true;
        });

        it('should close when disabled while open', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="Fruit">
              <cs-option value="apple">Apple</cs-option>
              <cs-option value="apricot">Apricot</cs-option>
              <cs-option value="banana">Banana</cs-option>
              <cs-option value="cherry">Cherry</cs-option>
            </cs-combobox>
          `);
          await el.show();
          const hidden = oneEvent(el, 'cs-after-hide');
          el.disabled = true;
          await hidden;
          expect(el.open).to.be.false;
          expect(part(el, 'listbox').hidden).to.be.true;
        });

        it('should pass accessibility tests when disabled', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="Fruit" disabled value="apple">
              <cs-option value="apple">Apple</cs-option>
              <cs-option value="apricot">Apricot</cs-option>
              <cs-option value="banana">Banana</cs-option>
              <cs-option value="cherry">Cherry</cs-option>
            </cs-combobox>
          `);
          await expect(el).to.be.accessible();
        });

        it('should pass accessibility tests when invalid', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="Fruit" hint="Pick a fruit." required>
              <cs-option value="apple">Apple</cs-option>
              <cs-option value="apricot">Apricot</cs-option>
              <cs-option value="banana">Banana</cs-option>
              <cs-option value="cherry">Cherry</cs-option>
            </cs-combobox>
          `);
          el.hasInteracted = true;
          await el.updateComplete;
          expect(el.displayInput.getAttribute('aria-invalid')).to.equal('true');
          await expect(el).to.be.accessible();
        });
      });

      describe('motion and cleanup', () => {
        it('should not move when the user prefers reduced motion', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="Fruit">
              <cs-option value="apple">Apple</cs-option>
              <cs-option value="apricot">Apricot</cs-option>
              <cs-option value="banana">Banana</cs-option>
              <cs-option value="cherry">Cherry</cs-option>
            </cs-combobox>
          `);
          await emulateMedia({ reducedMotion: 'reduce' });
          try {
            el.open = true;
            await expectNoMotion(el.popup.popup, 'show');
            await settleAnimations(el);

            el.open = false;
            await expectNoMotion(el.popup.popup, 'hide');
            await settleAnimations(el);
          } finally {
            await emulateMedia({ reducedMotion: 'no-preference' });
          }
        });

        it('should stop listening to the shadow root it was in once removed while open', async () => {
          const host = await fixture<HTMLElement>(html`<div></div>`);
          const root = host.attachShadow({ mode: 'open' });
          const el = document.createElement('cs-combobox');
          el.label = 'Fruit';
          el.innerHTML = '<cs-option value="apple">Apple</cs-option>';
          root.append(el);
          await el.updateComplete;
          await el.show();

          const removeListener = sinon.spy(root, 'removeEventListener');
          try {
            el.remove();
            expect(removeListener.calledWith('focusin')).to.be.true;
          } finally {
            removeListener.restore();
          }
        });
      });

      describe('form integration', () => {
        it('should be invalid when required and empty, and valid once something is picked', async () => {
          const el = await fixture<CsCombobox>(
            html`<cs-combobox label="Fruit" required>
              <cs-option value="apple">Apple</cs-option>
              <cs-option value="apricot">Apricot</cs-option>
              <cs-option value="banana">Banana</cs-option>
              <cs-option value="cherry">Cherry</cs-option>
            </cs-combobox>`,
          );
          expect(el.checkValidity()).to.be.false;
          expect(el.validity.valueMissing).to.be.true;

          await type(el, 'app');
          await press(el, 'Enter');
          expect(el.checkValidity()).to.be.true;
        });

        it('should be invalid when required, multiple and every tag is removed', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="Fruit" required multiple>
              <cs-option value="apple" selected>Apple</cs-option>
            </cs-combobox>
          `);
          expect(el.checkValidity()).to.be.true;
          el.focus();
          await press(el, 'Backspace');
          expect(el.value).to.deep.equal([]);
          expect(el.checkValidity()).to.be.false;
        });

        it('should serialize its name and value with FormData', async () => {
          const form = await fixture<HTMLFormElement>(html`
            <form>
              <cs-combobox name="fruit" value="cherry">
                <cs-option value="apple">Apple</cs-option>
                <cs-option value="apricot">Apricot</cs-option>
                <cs-option value="banana">Banana</cs-option>
                <cs-option value="cherry">Cherry</cs-option>
              </cs-combobox>
            </form>
          `);
          expect(new FormData(form).get('fruit')).to.equal('cherry');
        });

        it('should drop a value no option carries', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="Fruit" value="mango">
              <cs-option value="apple">Apple</cs-option>
              <cs-option value="apricot">Apricot</cs-option>
              <cs-option value="banana">Banana</cs-option>
              <cs-option value="cherry">Cherry</cs-option>
            </cs-combobox>
          `);
          expect(el.value).to.equal(null);
          expect(el.inputValue).to.equal('');
        });

        it('should start from its selected option when it connects before its options upgrade', async () => {
          // Setting innerHTML on a parent upgrades the combobox before the options inside it, so its first look at
          // them finds plain elements with no value. A bundle that defines cs-combobox before cs-option does the same.
          const container = await fixture<HTMLElement>(html`<div></div>`);
          container.innerHTML = `
            <cs-combobox id="many" multiple>
              <cs-option value="a">A</cs-option><cs-option value="b" selected>B</cs-option><cs-option value="c">C</cs-option>
            </cs-combobox>
            <cs-combobox id="one">
              <cs-option value="a">A</cs-option><cs-option value="b" selected>B</cs-option><cs-option value="c">C</cs-option>
            </cs-combobox>
          `;
          const many = container.querySelector<CsCombobox>('#many')!;
          const one = container.querySelector<CsCombobox>('#one')!;
          await Promise.all(
            [...container.querySelectorAll<CsOption>('cs-option')].map((option) => option.updateComplete),
          );
          await many.updateComplete;
          await one.updateComplete;
          await waitUntil(() => one.value === 'b' && JSON.stringify(many.value) === '["b"]');

          expect(many.value).to.deep.equal(['b']);
          expect(one.value).to.equal('b');
          expect(one.inputValue).to.equal('B');
          expect(options(many).map((option) => option.selected)).to.deep.equal([false, true, false]);
          expect(options(one).map((option) => option.selected)).to.deep.equal([false, true, false]);
        });

        it('should give the form a value set from a cs-show listener', async () => {
          const form = await fixture<HTMLFormElement>(html`
            <form>
              <cs-combobox name="fruit" label="Fruit">
                <cs-option value="apple">Apple</cs-option>
                <cs-option value="banana">Banana</cs-option>
              </cs-combobox>
            </form>
          `);
          const el = form.querySelector('cs-combobox')!;
          // cs-show fires inside an update, after the step that normally writes the form value
          el.addEventListener('cs-show', () => (el.value = 'banana'), { once: true });

          await el.show();
          expect(el.value).to.equal('banana');
          expect(new FormData(form).get('fruit')).to.equal('banana');
        });

        it('should reset to its selected option', async () => {
          const form = await fixture<HTMLFormElement>(html`
            <form>
              <cs-combobox name="fruit">
                <cs-option value="apple">Apple</cs-option>
                <cs-option value="banana" selected>Banana</cs-option>
              </cs-combobox>
            </form>
          `);
          const el = form.querySelector('cs-combobox')!;
          await typeOver(el, 'app');
          await press(el, 'Enter');
          expect(el.value).to.equal('apple');

          form.reset();
          await el.updateComplete;
          expect(el.value).to.equal('banana');
          expect(el.inputValue).to.equal('Banana');
        });
      });

      describe('highlight rule', () => {
        // One rule decides what is highlighted when the list opens and whenever its options change under it. It is
        // written out above placeHighlight() in combobox.ts. Each row runs in client mode (options in the markup) and
        // in server mode (the same options from a dataSource that filters as the client does).
        const all = ['Apple', 'Apricot', 'Banana', 'Cherry'];

        async function rig(mode: 'client' | 'server', multiple = false) {
          const el =
            mode === 'client'
              ? await fixture<CsCombobox>(html`
                  <cs-combobox label="Fruit" with-clear ?multiple=${multiple}>
                    <cs-option value="apple">Apple</cs-option>
                    <cs-option value="apricot">Apricot</cs-option>
                    <cs-option value="banana">Banana</cs-option>
                    <cs-option value="cherry">Cherry</cs-option>
                  </cs-combobox>
                `)
              : await fixture<CsCombobox>(html`
                  <cs-combobox label="Fruit" with-clear ?multiple=${multiple} filter-debounce="10"></cs-combobox>
                `);
          const requests = sinon.spy((query: string) => fruitsMatching(query));
          if (mode === 'server') {
            el.dataSource = requests;
          }
          return { el, requests };
        }

        /**
         * In server mode, waits for a request after `asked` before checking the answer. The list from before can show
         * the same labels, so without this the check could pass before the new answer lands.
         */
        async function answeredAfter(el: CsCombobox, requests: sinon.SinonSpy, asked: number, labels: string[]) {
          if (el.dataSource) {
            await waitUntil(() => requests.callCount > asked, 'expected a new request');
          }
          await answered(el, labels);
        }

        for (const mode of ['client', 'server'] as const) {
          describe(`in ${mode} mode`, () => {
            it('first open by Down Arrow, nothing picked: the first option, and Tab picks it', async () => {
              const { el } = await rig(mode);
              el.focus();
              await press(el, 'ArrowDown');
              await answered(el, all);
              expect(el.currentOption?.value).to.equal('apple');
              await press(el, 'Tab');
              expect(el.value).to.equal('apple');
            });

            it('first open by Up Arrow, nothing picked: the last option', async () => {
              const { el } = await rig(mode);
              el.focus();
              await press(el, 'ArrowUp');
              await answered(el, all);
              expect(el.currentOption?.value).to.equal('cherry');
            });

            it('open by pointer with a pick: the pick, and Tab changes nothing', async () => {
              const { el } = await rig(mode);
              el.value = 'banana';
              const changed = sinon.spy();
              el.addEventListener('change', changed);

              await clickOnElement(el.displayInput);
              await answered(el, all);
              expect(el.currentOption?.value).to.equal('banana');
              await press(el, 'Tab');
              expect(el.value).to.equal('banana');
              expect(changed).to.not.have.been.called;
            });

            it('open by pointer with nothing picked: nothing, and Tab picks nothing', async () => {
              const { el } = await rig(mode);
              await clickOnElement(el.displayInput);
              await answered(el, all);
              expect(el.currentOption?.label).to.equal(undefined);
              await press(el, 'Tab');
              expect(el.value).to.equal(null);
            });

            it('text typed: the first match', async () => {
              const { el } = await rig(mode);
              await type(el, 'ap');
              await answered(el, ['Apple', 'Apricot']);
              expect(el.currentOption?.value).to.equal('apple');
            });

            it('text emptied by the user: nothing, and Enter clears the pick', async () => {
              const { el, requests } = await rig(mode);
              el.value = 'banana';
              await clickOnElement(el.displayInput);
              await answered(el, all);
              expect(el.currentOption?.value).to.equal('banana');

              // In server mode the label arrives with the answer, after focus selected the raw value, so select again
              el.displayInput.select();
              const asked = requests.callCount;
              await press(el, 'Backspace');
              expect(el.inputValue).to.equal('');
              await answeredAfter(el, requests, asked, all);
              expect(el.currentOption?.label).to.equal(undefined);
              await press(el, 'Enter');
              expect(el.value).to.equal(null);
            });

            it('opened by an arrow, then text typed and deleted: nothing, and Tab picks nothing', async () => {
              const { el, requests } = await rig(mode);
              el.focus();
              await press(el, 'ArrowDown');
              await answered(el, all);
              await type(el, 'x');
              await answered(el, []);
              const asked = requests.callCount;
              await press(el, 'Backspace');
              await answeredAfter(el, requests, asked, all);
              expect(el.currentOption?.label).to.equal(undefined);
              await press(el, 'Tab');
              expect(el.value).to.equal(null);
            });

            it('after a pick in multiple mode: the option just picked, with no new request', async () => {
              const { el, requests } = await rig(mode, true);
              el.value = ['apple'];
              el.focus();
              await press(el, 'ArrowDown');
              await answered(el, all);
              expect(el.currentOption?.value).to.equal('apple');
              await press(el, 'ArrowDown');
              await press(el, 'ArrowDown');
              const asked = requests.callCount;

              await press(el, 'Enter');
              await el.updateComplete;
              expect(el.value).to.deep.equal(['apple', 'banana']);
              expect(el.currentOption?.value).to.equal('banana');
              expect(requests.callCount).to.equal(asked);
              await press(el, 'ArrowDown');
              expect(el.currentOption?.value).to.equal('cherry');
            });

            it('after a pick in multiple mode with text typed: the option just picked, once every option is back', async () => {
              const { el } = await rig(mode, true);
              await type(el, 'ban');
              await answered(el, ['Banana']);
              await press(el, 'Enter');
              await answered(el, all);
              expect(el.value).to.deep.equal(['banana']);
              expect(el.currentOption?.value).to.equal('banana');
            });

            it('after the clear button: nothing', async () => {
              const { el } = await rig(mode);
              el.value = 'banana';
              await clickOnElement(el.displayInput);
              await answered(el, all);
              await clickOnElement(part(el, 'clear-button'));
              await answered(el, all);
              expect(el.value).to.equal(null);
              expect(el.currentOption?.label).to.equal(undefined);
            });
          });
        }

        // Only a dataSource can fail, so this row has no client-mode counterpart.
        it('after a failed request: nothing; a retry by typing: the first match (server mode)', async () => {
          const el = await fixture<CsCombobox>(html`<cs-combobox label="Fruit" filter-debounce="10"></cs-combobox>`);
          let fail = false;
          el.dataSource = (query) => (fail ? Promise.reject(new Error('offline')) : fruitsMatching(query));

          await el.show();
          await answered(el, all);
          fail = true;
          const failed = oneEvent(el, 'cs-options-error');
          await type(el, 'b');
          await failed;
          await el.updateComplete;
          expect(el.currentOption?.label).to.equal(undefined);

          fail = false;
          await type(el, 'a');
          await answered(el, ['Banana']);
          expect(el.currentOption?.value).to.equal('banana');
        });
      });

      describe('server mode', () => {
        // The combobox remembers the last option element it saw for each pick, and the tag copies from that.
        it("should keep a pick's start content in its tag once its option leaves the list", async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="People" multiple>
              <cs-option value="ana" selected><cs-avatar slot="start" initials="AB"></cs-avatar>Ana Bell</cs-option>
            </cs-combobox>
          `);
          el.dataSource = () => [{ value: 'cy', label: 'Cy Reed' }];

          await el.show();
          await answered(el, ['Cy Reed']);

          expect(part(el, 'tag').querySelector('cs-avatar')?.getAttribute('initials')).to.equal('AB');
        });

        // Option data carries no start content, so a server answer that should show some returns elements.
        it('should show start content on options a dataSource returns as elements', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="People" multiple>
              <cs-option value="ana" selected><cs-avatar slot="start" initials="AB"></cs-avatar>Ana Bell</cs-option>
            </cs-combobox>
          `);
          el.dataSource = () =>
            [
              ['ana', 'Ana Bell', 'AN'],
              ['cy', 'Cy Reed', 'CR'],
            ].map(([value, label, initials]) =>
              Object.assign(document.createElement('div'), {
                innerHTML: `<cs-option value="${value}"><cs-avatar slot="start" initials="${initials}"></cs-avatar>${label}</cs-option>`,
              }).querySelector('cs-option')!,
            );

          await el.show();
          await answered(el, ['Ana Bell', 'Cy Reed']);

          expect(part(el, 'tag').querySelector('cs-avatar')?.getAttribute('initials')).to.equal('AN');
        });

        it('should request right away on open, then debounce keystrokes into one request', async () => {
          const el = await fixture<CsCombobox>(html`<cs-combobox label="Fruit" filter-debounce="100"></cs-combobox>`);
          const dataSource = sinon.spy((query: string, signal: AbortSignal) =>
            signal.aborted ? [] : [{ value: query || 'all', label: query || 'All' }],
          );
          el.dataSource = dataSource;

          await el.show();
          expect(dataSource.callCount).to.equal(1);
          expect(dataSource.firstCall.args[0]).to.equal('');
          expect(dataSource.firstCall.args[1]).to.be.instanceOf(AbortSignal);

          // The debounce waits on a held clock, so nothing goes out however far apart the keystrokes land. Each one
          // has to cancel the wait before it: if any did not, moving the clock would send more than one request.
          const clock = holdTimers();
          await type(el, 'kiw');
          expect(dataSource.callCount).to.equal(1);
          clock.tick(el.filterDebounce + 1);
          clock.restore();

          await waitUntil(() => dataSource.callCount >= 2);
          expect(dataSource.secondCall.args[0]).to.equal('kiw');
          await waitUntil(() => shownLabels(el).join() === 'kiw');

          // Three keystrokes made one request, not three
          expect(dataSource.callCount).to.equal(2);
          // No client filtering: the server's answer is shown as is, first match highlighted
          expect(el.currentOption?.value).to.equal('kiw');
        });

        it('should abort a stale request and ignore its answer', async () => {
          const el = await fixture<CsCombobox>(html`<cs-combobox label="Fruit" filter-debounce="20"></cs-combobox>`);
          const answers = [
            deferred<{ value: string; label: string }[]>(),
            deferred<{ value: string; label: string }[]>(),
          ];
          const signals: AbortSignal[] = [];
          el.dataSource = (query, signal) => {
            if (query === '') {
              return [];
            }
            signals.push(signal);
            return answers[signals.length - 1].promise;
          };

          await type(el, 'a');
          await waitUntil(() => signals.length === 1);
          await type(el, 'b');
          await waitUntil(() => signals.length === 2);

          expect(signals[0].aborted).to.be.true;
          expect(signals[1].aborted).to.be.false;

          answers[1].resolve([{ value: 'fresh', label: 'Fresh' }]);
          await waitUntil(() => shownLabels(el).join() === 'Fresh');
          answers[0].resolve([{ value: 'stale', label: 'Stale' }]);
          // The combobox's own continuation was queued on this promise first, so it has run once this one does
          await answers[0].promise;
          await el.updateComplete;
          expect(shownLabels(el)).to.deep.equal(['Fresh']);
        });

        it('should show the loading row while nothing is showing yet', async () => {
          const el = await fixture<CsCombobox>(html`<cs-combobox label="Fruit"></cs-combobox>`);
          const answer = deferred<{ value: string; label: string }[]>();
          el.dataSource = () => answer.promise;

          await el.show();
          expect(el.loading).to.be.true;
          expect(shownStatus(el)).to.deep.equal(['loading']);
          expect(el.customStates.has('loading')).to.be.true;
          expect(el.customStates.has('showing-loading-row')).to.be.true;
          expect(el.shadowRoot!.querySelector('[part~="spinner"]') !== null, 'element present').to.be.false;

          answer.resolve([{ value: 'apple', label: 'Apple' }]);
          await waitUntil(() => !el.loading);
          await el.updateComplete;
          expect(shownStatus(el)).to.deep.equal([]);
          expect(shownLabels(el)).to.deep.equal(['Apple']);
        });

        it('should show the spinner in the field while options from before are showing', async () => {
          const el = await fixture<CsCombobox>(html`<cs-combobox label="Fruit" filter-debounce="20"></cs-combobox>`);
          const answer = deferred<{ value: string; label: string }[]>();
          el.dataSource = (query) => (query === '' ? [{ value: 'apple', label: 'Apple' }] : answer.promise);

          await el.show();
          await waitUntil(() => shownLabels(el).length === 1);
          await type(el, 'b');
          await waitUntil(() => el.loading);
          await el.updateComplete;

          expect(shownStatus(el)).to.deep.equal([]);
          expect(part(el, 'spinner') !== null, 'element present').to.be.true;
          expect(el.customStates.has('showing-loading-row')).to.be.false;
          answer.resolve([]);
        });

        it('should show the error row, emit cs-options-error, and try again on the next keystroke', async () => {
          const el = await fixture<CsCombobox>(html`<cs-combobox label="Fruit" filter-debounce="20"></cs-combobox>`);
          const failure = new Error('offline');
          let fail = true;
          el.dataSource = () =>
            fail ? Promise.reject(failure) : Promise.resolve([{ value: 'apple', label: 'Apple' }]);
          const announcements = listenForAnnouncements();

          try {
            const errorEvent = oneEvent(el, 'cs-options-error');
            el.show();
            const { detail } = await errorEvent;
            expect(detail.error).to.equal(failure);
            expect(detail.request).to.deep.equal({ query: '' });

            await el.updateComplete;
            expect(shownStatus(el)).to.deep.equal(['error']);
            expect(el.loading).to.be.false;
            await waitUntil(() => announcements.messages.includes("Couldn't load options"));

            fail = false;
            await type(el, 'a');
            await waitUntil(() => shownLabels(el).join() === 'Apple');
            expect(shownStatus(el)).to.deep.equal([]);
          } finally {
            announcements.stop();
          }
        });

        it('should replace options already showing with the error row when a request fails', async () => {
          const el = await fixture<CsCombobox>(html`<cs-combobox label="Fruit" filter-debounce="20"></cs-combobox>`);
          el.dataSource = (query) =>
            query === '' ? [{ value: 'apple', label: 'Apple' }] : Promise.reject(new Error('offline'));

          await el.show();
          await waitUntil(() => shownLabels(el).join() === 'Apple');

          const failed = oneEvent(el, 'cs-options-error');
          await type(el, 'b');
          await failed;
          await el.updateComplete;

          expect(shownStatus(el)).to.deep.equal(['error']);
          expect(shownLabels(el)).to.deep.equal([]);
          expect(el.currentOption?.label).to.equal(undefined);
          await press(el, 'Enter');
          expect(el.value).to.equal(null);
        });

        it('should leave the markers a framework keeps among its children', async () => {
          const container = await fixture<HTMLElement>(html`<div></div>`);
          const view = (withHint: boolean) =>
            html`<cs-combobox label="Fruit"
              >${withHint ? html`<span slot="hint">Pick a fruit</span>` : nothing}</cs-combobox
            >`;
          render(view(false), container);
          const el = container.querySelector('cs-combobox')!;
          await el.updateComplete;
          el.dataSource = () => [{ value: 'apple', label: 'Apple' }];

          await el.show();
          await waitUntil(() => shownLabels(el).join() === 'Apple');

          // Lit inserts the hint before a comment marker it keeps inside the combobox, which must still be there
          render(view(true), container);
          expect(el.querySelector('[slot="hint"]')?.textContent).to.equal('Pick a fruit');
          expect(shownLabels(el)).to.deep.equal(['Apple']);
        });

        it('should ask for every option again when the clear button empties an open list', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="Fruit" with-clear filter-debounce="20"></cs-combobox>
          `);
          const dataSource = sinon.spy((query: string) => [{ value: query || 'all', label: query || 'All' }]);
          el.dataSource = dataSource;

          await type(el, 'b');
          await waitUntil(() => shownLabels(el).join() === 'b');
          await clickOnElement(part(el, 'clear-button'));

          await waitUntil(() => shownLabels(el).join() === 'All');
          expect(dataSource.lastCall.args[0]).to.equal('');
          expect(el.inputValue).to.equal('');
        });

        it('should highlight the arrow’s option, or the pick, once the first results arrive', async () => {
          const el = await fixture<HTMLElement>(html`
            <div>
              <cs-combobox label="Fruit"></cs-combobox>
              <button>Next</button>
            </div>
          `);
          const combobox = el.querySelector('cs-combobox')!;
          combobox.dataSource = () => [
            { value: 'apple', label: 'Apple' },
            { value: 'banana', label: 'Banana' },
          ];

          combobox.focus();
          await press(combobox, 'ArrowDown');
          await waitUntil(() => shownLabels(combobox).length === 2);
          expect(combobox.currentOption?.value).to.equal('apple');
          await press(combobox, 'ArrowDown');
          await press(combobox, 'Enter');
          expect(combobox.value).to.equal('banana');

          await clickOnElement(combobox.displayInput);
          await waitUntil(() => combobox.open && shownLabels(combobox).length === 2);
          await combobox.updateComplete;
          expect(combobox.currentOption?.value).to.equal('banana');
        });

        it('should hand out a copy of its value, never its own array', async () => {
          const el = await fixture<CsCombobox>(html`<cs-combobox label="Fruit" multiple server></cs-combobox>`);
          el.value = ['apple'];
          await el.updateComplete;

          el.value.push('banana');
          expect(el.value).to.deep.equal(['apple']);
          (el.defaultValue as string[]).push('banana');
          expect(el.defaultValue).to.deep.equal([]);
        });

        it('should request again with reload() and resolve once the new options are in', async () => {
          const el = await fixture<CsCombobox>(html`<cs-combobox label="Fruit"></cs-combobox>`);
          let version = 1;
          el.dataSource = () => [{ value: `v${version}`, label: `Version ${version}` }];

          await el.show();
          await waitUntil(() => shownLabels(el).join() === 'Version 1');

          version = 2;
          await el.reload();
          expect(shownLabels(el)).to.deep.equal(['Version 2']);
        });

        it('should accept DOM nodes and Lit templates', async () => {
          const el = await fixture<CsCombobox>(html`<cs-combobox label="Fruit" filter-debounce="20"></cs-combobox>`);
          el.dataSource = (query) => {
            if (query === '') {
              const option = document.createElement('cs-option');
              option.value = 'node';
              option.textContent = 'From a node';
              return [option, document.createElement('cs-divider')];
            }
            return html`<cs-option value="template">From a template</cs-option>`;
          };

          await el.show();
          await waitUntil(() => shownLabels(el).join() === 'From a node');
          expect(el.querySelector('cs-divider') !== null, 'element present').to.be.true;

          await type(el, 't');
          await waitUntil(() => shownLabels(el).join() === 'From a template');
          expect(el.querySelector('cs-divider') !== null, 'element present').to.be.false;
        });

        it('should keep a created pick when the server’s answers never carry it', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="Fruit" multiple allow-create filter-debounce="10"></cs-combobox>
          `);
          const created = sinon.spy();
          el.addEventListener('cs-create', created);
          el.dataSource = (query) => fruitsMatching(query);

          await type(el, 'Kiwi');
          await waitUntil(() => el.shadowRoot!.querySelector('.create-option'));
          await el.updateComplete;
          await press(el, 'Enter');
          expect(el.value).to.deep.equal(['Kiwi']);

          // The next answer does not carry Kiwi, so its option has left the list, but the pick has not
          await answered(el, ['Apple', 'Apricot', 'Banana', 'Cherry']);
          await type(el, 'Kiwi');
          await waitUntil(() => el.shadowRoot!.querySelector('.create-option'));
          await el.updateComplete;
          await press(el, 'Enter');

          expect(el.value).to.deep.equal(['Kiwi']);
          expect(created).to.have.been.calledOnce;
        });

        it('should not offer to create, or say nothing matches, while the answer for new text is on its way', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="Fruit" allow-create filter-debounce="${STILL_WAITING}"></cs-combobox>
          `);
          el.dataSource = () => [];

          // Opening by typing asks at once; the answer for "k" is that nothing matches
          await type(el, 'k');
          await waitUntil(() => el.shadowRoot!.querySelector('.create-option') !== null);
          expect(el.loading).to.be.false;

          // "ki" waits on the debounce. The answer showing is for "k", so it cannot stand for "ki" yet
          await sendKeys({ type: 'i' });
          await el.updateComplete;
          expect(el.loading).to.be.true;
          expect(el.shadowRoot!.querySelector('.create-option') !== null, 'create option shown').to.be.false;
          expect(shownStatus(el)).to.deep.equal(['loading']);

          // The next keystroke waits only a moment, so its answer lands and the create option comes back
          el.filterDebounce = 10;
          await sendKeys({ type: 'w' });
          await waitUntil(() => !el.loading);
          await el.updateComplete;
          expect(el.shadowRoot!.querySelector('.create-option') !== null, 'create option shown').to.be.true;
        });

        it('should drop an answer that lands while the request for newer text waits', async () => {
          // A debounce no slow browser can outlast, so "ap" is still waiting when the checks below run
          const el = await fixture<CsCombobox>(html`<cs-combobox label="Fruit" filter-debounce="5000"></cs-combobox>`);
          const answerForA = deferred<{ value: string; label: string }[]>();
          el.dataSource = (query) => (query === 'a' ? answerForA.promise : fruitsMatching(query));

          // Typing "a" opens the list and asks at once; "p" then waits on the debounce
          await type(el, 'a');
          await type(el, 'p');
          answerForA.resolve(fruitsMatching('a'));
          await answerForA.promise;
          await el.updateComplete;

          // The answer for "a" cannot stand for "ap": still loading, nothing highlighted
          expect(el.loading).to.be.true;
          expect(el.currentOption?.label).to.equal(undefined);

          // reload() asks for "ap" now rather than after the debounce, and resolves once its options are in
          await el.reload();
          expect(shownLabels(el)).to.deep.equal(['Apple', 'Apricot']);
          expect(el.currentOption?.value).to.equal('apple');
        });

        it('should highlight nothing when typing opens the list, until the first answer lands', async () => {
          const el = await fixture<CsCombobox>(html`<cs-combobox label="Fruit" allow-create></cs-combobox>`);
          const answerForB = deferred<{ value: string; label: string }[]>();
          const created = sinon.spy();
          el.addEventListener('cs-create', created);
          el.dataSource = (query) => (query === 'b' ? answerForB.promise : fruitsMatching(query));

          // Leave the answer for the empty field behind as the options showing
          await el.show();
          await answered(el, ['Apple', 'Apricot', 'Banana', 'Cherry']);
          await el.hide();

          await type(el, 'b');
          await waitUntil(() => el.open);
          expect(el.currentOption?.label).to.equal(undefined);
          await press(el, 'Enter');
          expect(el.value).to.equal(null);
          expect(created).to.not.have.been.called;

          answerForB.resolve(fruitsMatching('b'));
          await answered(el, ['Banana']);
        });

        it('should ask for every option again when a pick lands while the request for an emptied field waits', async () => {
          const el = await fixture<CsCombobox>(html`
            <cs-combobox label="Fruit" multiple filter-debounce="300"></cs-combobox>
          `);
          const requests = sinon.spy((query: string) => fruitsMatching(query));
          el.dataSource = requests;

          await type(el, 'ap');
          await answered(el, ['Apple', 'Apricot']);

          // Emptying the field schedules a request for "", and the pick comes before it goes out. The debounce is
          // made long first, so only the pick can bring every option back.
          el.filterDebounce = STILL_WAITING;
          await press(el, 'Backspace');
          await press(el, 'Backspace');
          await press(el, 'ArrowDown');
          await press(el, 'Enter');
          expect(el.value).to.deep.equal(['apple']);

          await answered(el, ['Apple', 'Apricot', 'Banana', 'Cherry']);
          expect(requests.lastCall.args[0]).to.equal('');
        });

        it('should keep a single created pick when its text is typed again after the server dropped its option', async () => {
          const el = await fixture<CsCombobox>(
            html`<cs-combobox label="Fruit" allow-create filter-debounce="10"></cs-combobox>`,
          );
          const created = sinon.spy();
          el.addEventListener('cs-create', created);
          el.dataSource = (query) => fruitsMatching(query);

          await type(el, 'Kiwi');
          await waitUntil(() => el.shadowRoot!.querySelector('.create-option') !== null);
          await el.updateComplete;
          await press(el, 'Enter');
          expect(el.value).to.equal('Kiwi');

          // Reopening asks for "" again, and that answer drops the created option
          await el.show();
          await answered(el, ['Apple', 'Apricot', 'Banana', 'Cherry']);
          await typeOver(el, 'Kiwi');
          await waitUntil(() => el.shadowRoot!.querySelector('.create-option') !== null && !el.loading);
          await el.updateComplete;
          await press(el, 'Enter');

          expect(el.value).to.equal('Kiwi');
          expect(created).to.have.been.calledOnce;
          await waitUntil(() => !el.open);
        });

        it('should stop loading when the list closes inside the debounce, and send nothing', async () => {
          const el = await fixture<CsCombobox>(html`<cs-combobox label="Fruit" filter-debounce="300"></cs-combobox>`);
          const requests = sinon.spy((query: string) => fruitsMatching(query));
          el.dataSource = requests;

          await el.show();
          await answered(el, ['Apple', 'Apricot', 'Banana', 'Cherry']);

          // The debounce runs on a clock the test holds, so it cannot lapse while the keystroke is on its way
          const clock = holdTimers();
          await type(el, 'a');
          expect(el.loading).to.be.true;

          await el.hide();
          expect(el.loading).to.be.false;
          // Past the debounce, so a request that was not cancelled goes out here
          clock.tick(el.filterDebounce + 1);
          expect(requests.callCount).to.equal(1);
        });

        it('should keep loading while a request is in flight and only the waiting one is cancelled', async () => {
          const form = await fixture<HTMLFormElement>(html`
            <form><cs-combobox name="fruit" label="Fruit" filter-debounce="20"></cs-combobox></form>
          `);
          const el = form.querySelector('cs-combobox')!;
          const answerForA = deferred<{ value: string; label: string }[]>();
          const asked: string[] = [];
          el.dataSource = (query) => {
            asked.push(query);
            return query === 'a' ? answerForA.promise : fruitsMatching(query);
          };

          await el.show();
          await answered(el, ['Apple', 'Apricot', 'Banana', 'Cherry']);
          await type(el, 'a');
          await waitUntil(() => asked.includes('a'));
          el.filterDebounce = STILL_WAITING;
          await type(el, 'p');

          // Resetting the form cancels the request waiting for "ap"; the one for "a" is still on its way
          form.reset();
          expect(el.loading).to.be.true;

          answerForA.resolve(fruitsMatching('a'));
          await waitUntil(() => !el.loading);
        });

        it('should stop loading once a cancelled schedule follows a request whose dataSource was removed', async () => {
          const form = await fixture<HTMLFormElement>(html`
            <form><cs-combobox name="fruit" label="Fruit" server filter-debounce="20"></cs-combobox></form>
          `);
          const el = form.querySelector('cs-combobox')!;
          const never = deferred<{ value: string; label: string }[]>();
          let requests = 0;
          el.addEventListener('cs-options-request', () => requests++);
          el.dataSource = () => never.promise;

          // A dataSource request goes out, then the page removes the dataSource while it is in flight
          await el.show();
          el.dataSource = null;
          await type(el, 'a');
          await waitUntil(() => requests === 2);

          // A schedule that is cancelled with nothing left in flight ends loading. The debounce is made long first,
          // so the request for "ab" is still waiting at the reset however slow the keystroke is to arrive.
          el.filterDebounce = STILL_WAITING;
          await type(el, 'b');
          form.reset();
          expect(el.loading).to.be.false;
        });

        it('should replace what a DocumentFragment brought, not pile it up', async () => {
          const el = await fixture<CsCombobox>(html`<cs-combobox label="Fruit"></cs-combobox>`);
          el.dataSource = () => {
            const fragment = document.createDocumentFragment();
            const option = document.createElement('cs-option');
            option.value = 'apple';
            option.textContent = 'Apple';
            const note = document.createElement('span');
            note.className = 'note';
            fragment.append(option, note);
            return fragment;
          };

          await el.show();
          await answered(el, ['Apple']);
          await el.reload();
          await el.reload();
          expect(el.querySelectorAll('span.note').length).to.equal(1);
          expect(shownLabels(el)).to.deep.equal(['Apple']);
        });

        it('should refuse an HTML string rather than parse it', async () => {
          const el = await fixture<CsCombobox>(html`<cs-combobox label="Fruit"></cs-combobox>`);
          // @ts-expect-error - a string is not a valid answer, which is the point
          el.dataSource = () => '<img src="x"><cs-option value="injected">Injected</cs-option>';

          const errorEvent = oneEvent(el, 'cs-options-error');
          el.show();
          const { detail } = await errorEvent;

          expect(detail.error).to.be.instanceOf(TypeError);
          expect(el.querySelector('img') !== null, 'element present').to.be.false;
          expect(options(el).length).to.equal(0);
        });

        it('should keep a pick and its label when the server replaces the options', async () => {
          const el = await fixture<CsCombobox>(html`<cs-combobox label="Fruit" filter-debounce="20"></cs-combobox>`);
          el.dataSource = (query) =>
            query.startsWith('b') ? [{ value: 'banana', label: 'Banana' }] : [{ value: 'apple', label: 'Apple' }];

          await type(el, 'a');
          await waitUntil(() => el.currentOption?.value === 'apple');
          await press(el, 'Enter');
          expect(el.value).to.equal('apple');

          await typeOver(el, 'b');
          await waitUntil(() => shownLabels(el).join() === 'Banana');
          await press(el, 'Escape');

          expect(el.value).to.equal('apple');
          expect(el.inputValue).to.equal('Apple');
        });

        it('should emit cs-options-request in server mode without a dataSource, and leave loading to the page', async () => {
          const el = await fixture<CsCombobox>(
            html`<cs-combobox label="Fruit" server filter-debounce="20"></cs-combobox>`,
          );
          const requests: CsOptionsRequestEvent[] = [];
          el.addEventListener('cs-options-request', (event) => requests.push(event));

          await el.show();
          expect(requests.length).to.equal(1);
          expect(requests[0].detail.query).to.equal('');
          expect(requests[0].detail.signal).to.be.instanceOf(AbortSignal);
          expect(el.loading).to.be.true;

          // Wait for the request that asks for "ch", not for a count: two keystrokes further apart than the
          // debounce make a request each, and the count then passes two without ever stopping there.
          await type(el, 'ch');
          await waitUntil(() => requests.at(-1)?.detail.query === 'ch');
          expect(requests[0].detail.signal.aborted).to.be.true;

          // The page answers, then clears loading itself
          const option = document.createElement('cs-option');
          option.value = 'cherry';
          option.textContent = 'Cherry';
          el.append(option);
          el.loading = false;
          await waitUntil(() => shownLabels(el).join() === 'Cherry');
          await el.updateComplete;
          expect(shownStatus(el)).to.deep.equal([]);
        });
      });
    });
  }

  // These run last on purpose. One of them calls reportValidity() on an invalid control and never clicks away, so
  // Firefox's native validation bubble stays open on the text field, and is orphaned when the fixture is removed.
  // From then on, a Playwright click in Firefox that removes its own target (a tag's remove button, the clear button)
  // never settles. cs-select escapes this only because it anchors validation on a hidden input.
  runFormControlBaseTests({
    tagName: 'cs-combobox',
    // A combobox's value has to match one of its options, so the base fixture needs them.
    init: (control) => {
      control.innerHTML = '<cs-option value="a">A</cs-option><cs-option value="b">B</cs-option>';
    },
    formValue: { dirtyValue: 'b' },
  });
});
