import { aTimeout, expect, oneEvent, waitUntil } from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import { html, nothing, render } from 'lit';
import sinon from 'sinon';
import type { CsOptionsRequestEvent } from '../../events/options-request.js';
import { expectEvent } from '../../internal/test/expect-event.js';
import { fixtures } from '../../internal/test/fixture.js';
import { runFormControlBaseTests } from '../../internal/test/form-control-base-tests.js';
import { clickOnElement } from '../../internal/test/pointer-utilities.js';
import type CsOption from '../option/option.js';
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
              expect(el.displayInput.ariaActiveDescendantElement).to.equal(banana);
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
          expect(banana.shadowRoot!.querySelector('cs-icon[part~="checked-icon"]')).to.exist;
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
          expect(el.shadowRoot!.activeElement).to.equal(el.displayInput);
        });

        it('should move the highlight with the arrow keys, Home and End, keeping focus in the field', async () => {
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
          await press(el, 'End');
          expect(el.currentOption?.label).to.equal('Cherry');
          await press(el, 'Home');
          expect(el.currentOption?.label).to.equal('Apple');
          await press(el, 'ArrowUp');
          expect(el.currentOption?.label).to.equal('Cherry');

          expect(el.shadowRoot!.activeElement).to.equal(el.displayInput);
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
          await el.updateComplete;
          await aTimeout(0);

          expect(handler).to.not.have.been.called;
          expect(el.value).to.equal('cherry');
          expect(el.inputValue).to.equal('Cherry');
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
          expect(tags.querySelector('img')).to.equal(null);
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
          expect(el.currentOption).to.equal(undefined);

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

          expect(options(el)).to.have.length(4);
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
          expect(el.shadowRoot!.activeElement).to.equal(el.displayInput);
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
          expect(el.shadowRoot!.activeElement).to.equal(el.displayInput);
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
          await aTimeout(0);

          expect(many.value).to.deep.equal(['b']);
          expect(one.value).to.equal('b');
          expect(one.inputValue).to.equal('B');
          expect(options(many).map((option) => option.selected)).to.deep.equal([false, true, false]);
          expect(options(one).map((option) => option.selected)).to.deep.equal([false, true, false]);
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

      describe('server mode', () => {
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

          await type(el, 'kiw');
          await waitUntil(() => dataSource.callCount === 2);
          expect(dataSource.secondCall.args[0]).to.equal('kiw');
          await waitUntil(() => shownLabels(el).join() === 'kiw');

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
          await aTimeout(50);
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
          expect(el.shadowRoot!.querySelector('[part~="spinner"]')).to.equal(null);

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
          expect(part(el, 'spinner')).to.exist;
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
          expect(el.querySelector('cs-divider')).to.exist;

          await type(el, 't');
          await waitUntil(() => shownLabels(el).join() === 'From a template');
          expect(el.querySelector('cs-divider')).to.equal(null);
        });

        it('should refuse an HTML string rather than parse it', async () => {
          const el = await fixture<CsCombobox>(html`<cs-combobox label="Fruit"></cs-combobox>`);
          // @ts-expect-error - a string is not a valid answer, which is the point
          el.dataSource = () => '<img src="x"><cs-option value="injected">Injected</cs-option>';

          const errorEvent = oneEvent(el, 'cs-options-error');
          el.show();
          const { detail } = await errorEvent;

          expect(detail.error).to.be.instanceOf(TypeError);
          expect(el.querySelector('img')).to.equal(null);
          expect(options(el)).to.have.length(0);
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
          expect(requests).to.have.length(1);
          expect(requests[0].detail.query).to.equal('');
          expect(requests[0].detail.signal).to.be.instanceOf(AbortSignal);
          expect(el.loading).to.be.true;

          await type(el, 'ch');
          await waitUntil(() => requests.length === 2);
          expect(requests[1].detail.query).to.equal('ch');
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
