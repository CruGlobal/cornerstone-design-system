import { aTimeout, expect, oneEvent, waitUntil } from '@open-wc/testing';
import { a11ySnapshot, resetMouse, sendKeys, sendMouse } from '@web/test-runner-commands';
import { html } from 'lit';
import sinon from 'sinon';
import { expectEvent } from '../../internal/test/expect-event.js';
import { fixtures } from '../../internal/test/fixture.js';
import { runFormControlBaseTests } from '../../internal/test/form-control-base-tests.js';
import { clickOnElement, isWebkit } from '../../internal/test/pointer-utilities.js';
import { serialize } from '../../utilities/form.js';
import type CsAvatar from '../avatar/avatar.js';
import type CsOption from '../option/option.js';
import type CsTag from '../tag/tag.js';
import type CsTooltip from '../tooltip/tooltip.js';
import type CsSelect from './select.js';

/**
 * Asserts the clear button spans the combobox's padding box, then clicks just inside the combobox's top
 * border at the button's center. The click is measured from the field, not the button, so it misses a button
 * that only runs through the middle of the field.
 */
async function clickInsideTopEdge(el: CsSelect) {
  const combobox = el.shadowRoot!.querySelector<HTMLElement>('[part~="combobox"]')!;
  const clearButton = el.shadowRoot!.querySelector<HTMLElement>('[part~="clear-button"]')!;
  const box = combobox.getBoundingClientRect();
  const button = clearButton.getBoundingClientRect();
  const borderTop = combobox.clientTop;

  // The button spans the field, so the whole column clears, not just a band through the middle
  expect(button.top).to.be.at.most(box.top + borderTop + 1);
  expect(button.bottom).to.be.at.least(box.bottom - borderTop - 1);

  await sendMouse({
    type: 'click',
    position: [
      Math.floor(button.left + window.pageXOffset + button.width / 2),
      Math.floor(box.top + window.pageYOffset + borderTop + 1),
    ],
  });
}

describe('<cs-select>', () => {
  runFormControlBaseTests({
    tagName: 'cs-select',
    // A select's value has to match one of its options, so the base fixture needs them.
    init: (control) => {
      control.innerHTML = '<cs-option value="a">A</cs-option><cs-option value="b">B</cs-option>';
    },
    formValue: { dirtyValue: 'b' },
  });

  for (const fixture of fixtures) {
    describe(`with "${fixture.type}" rendering`, () => {
      describe('accessibility', () => {
        it('should pass accessibility tests when closed', async () => {
          await customElements.whenDefined('cs-option');
          const el = await fixture<CsSelect>(html`
            <cs-select label="Select one">
              <cs-option value="option-1">Option 1</cs-option>
              <cs-option value="option-2">Option 2</cs-option>
              <cs-option value="option-3">Option 3</cs-option>
            </cs-select>
          `);
          await expect(el).to.be.accessible();
        });

        it('should pass accessibility tests when open', async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select label="Select one">
              <cs-option value="option-1">Option 1</cs-option>
              <cs-option value="option-2">Option 2</cs-option>
              <cs-option value="option-3">Option 3</cs-option>
            </cs-select>
          `);

          await el.show();
          await expect(el).to.be.accessible();
        });
      });

      describe('properties', () => {
        it('should be disabled with the disabled attribute', async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select disabled>
              <cs-option value="option-1">Option 1</cs-option>
              <cs-option value="option-2">Option 2</cs-option>
              <cs-option value="option-3">Option 3</cs-option>
            </cs-select>
          `);
          expect(el.displayInput.disabled).to.be.true;
        });

        it('should show a placeholder when no options are selected', async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select placeholder="Select one">
              <cs-option value="option-1">Option 1</cs-option>
              <cs-option value="option-2">Option 2</cs-option>
              <cs-option value="option-3">Option 3</cs-option>
            </cs-select>
          `);
          const displayInput = el.shadowRoot!.querySelector<HTMLInputElement>('[part~="display-input"]')!;

          expect(getComputedStyle(displayInput).opacity).to.not.equal('0');
          expect(displayInput.placeholder).to.equal('Select one');
        });

        it('should show a placeholder when no options are selected and multiple is set', async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select placeholder="Select a few" multiple>
              <cs-option value="option-1">Option 1</cs-option>
              <cs-option value="option-2">Option 2</cs-option>
              <cs-option value="option-3">Option 3</cs-option>
            </cs-select>
          `);
          const displayInput = el.shadowRoot!.querySelector<HTMLInputElement>('[part~="display-input"]')!;

          expect(getComputedStyle(displayInput).opacity).to.not.equal('0');
          expect(displayInput.placeholder).to.equal('Select a few');
        });

        it('should not allow selection when the option is disabled', async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select value="option-1">
              <cs-option value="option-1">Option 1</cs-option>
              <cs-option value="option-2" disabled>Option 2</cs-option>
            </cs-select>
          `);
          const disabledOption = el.querySelector('cs-option[disabled]')!;

          await el.show();
          await clickOnElement(disabledOption);
          await el.updateComplete;

          expect(el.value).to.equal('option-1');
        });

        it('should have rounded tags when using the pill attribute', async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select multiple pill>
              <cs-option value="option-1" selected>Option 1</cs-option>
              <cs-option value="option-2" selected>Option 2</cs-option>
              <cs-option value="option-3">Option 3</cs-option>
            </cs-select>
          `);
          const tag = el.shadowRoot!.querySelector('[part~="tag"]')!;

          expect(tag.hasAttribute('pill')).to.be.true;
        });

        it('should update the display label when an option changes', async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select value="option-1">
              <cs-option value="option-1">Option 1</cs-option>
              <cs-option value="option-2">Option 2</cs-option>
              <cs-option value="option-3">Option 3</cs-option>
            </cs-select>
          `);
          const displayInput = el.shadowRoot!.querySelector<HTMLSelectElement>('.display-input')!;
          const option = el.querySelector('cs-option')!;

          expect(displayInput.value).to.equal('Option 1');

          option.textContent = 'updated';
          await aTimeout(250);
          await el.updateComplete;

          expect(displayInput.value).to.equal('updated');
        });

        it('should allow interaction after being disabled and re-enabled', async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select label="Select one">
              <cs-option value="option-1">Option 1</cs-option>
              <cs-option value="option-2">Option 2</cs-option>
              <cs-option value="option-3">Option 3</cs-option>
            </cs-select>
          `);
          const popup = el.shadowRoot!.querySelector('cs-popup');

          // First disable the select
          el.disabled = true;
          await el.updateComplete;

          // Wait 500ms
          await aTimeout(500);

          // Re-enable the select
          el.disabled = false;
          await el.updateComplete;

          // Click on the select to open the dropdown
          await clickOnElement(el, 'center', 0, 8);
          await el.updateComplete;
          await aTimeout(500);

          // Get the popup element and check its active state
          expect(popup?.active).to.be.true;
        });

        describe('with selected attribute', () => {
          it('should select options using the selected attribute for single select', async () => {
            const el = await fixture<CsSelect>(html`
              <cs-select>
                <cs-option value="option-1">Option 1</cs-option>
                <cs-option value="option-2" selected>Option 2</cs-option>
                <cs-option value="option-3">Option 3</cs-option>
              </cs-select>
            `);

            expect(el.value).to.equal('option-2');
            expect(el.displayInput.value).to.equal('Option 2');
          });

          it('should select multiple options using the selected attribute', async () => {
            const el = await fixture<CsSelect>(html`
              <cs-select multiple>
                <cs-option value="option-1" selected>Option 1</cs-option>
                <cs-option value="option-2">Option 2</cs-option>
                <cs-option value="option-3" selected>Option 3</cs-option>
              </cs-select>
            `);

            expect(el.value).to.have.members(['option-1', 'option-3']);
            expect(el.value).to.have.length(2);
          });

          it('should handle options with spaces in values', async () => {
            const el = await fixture<CsSelect>(html`
              <cs-select>
                <cs-option value="option with spaces">Option with spaces</cs-option>
                <cs-option value="another option" selected>Another option</cs-option>
              </cs-select>
            `);

            expect(el.value).to.equal('another option');
            expect(el.displayInput.value).to.equal('Another option');
          });

          it('should handle multiple options with spaces in values', async () => {
            const el = await fixture<CsSelect>(html`
              <cs-select multiple>
                <cs-option value="option with spaces" selected>Option with spaces</cs-option>
                <cs-option value="another option">Another option</cs-option>
                <cs-option value="third option" selected>Third option</cs-option>
              </cs-select>
            `);

            expect(el.value).to.have.members(['option with spaces', 'third option']);
            expect(el.value).to.have.length(2);
          });

          it('should serialize options with spaces correctly in FormData', async () => {
            const form = await fixture<HTMLFormElement>(html`
              <form>
                <cs-select name="test" multiple>
                  <cs-option value="option with spaces" selected>Option with spaces</cs-option>
                  <cs-option value="another option" selected>Another option</cs-option>
                </cs-select>
              </form>
            `);

            const formData = new FormData(form);
            const values = formData.getAll('test');
            expect(values).to.have.members(['option with spaces', 'another option']);
          });

          it('should select options using the selected attribute with with-clear', async () => {
            // Regression: Issue #1922 - selected attribute was ignored when with-clear was present
            const el = await fixture<CsSelect>(html`
              <cs-select with-clear>
                <cs-option value="option-1">Option 1</cs-option>
                <cs-option value="option-2" selected>Option 2</cs-option>
                <cs-option value="option-3">Option 3</cs-option>
              </cs-select>
            `);

            expect(el.value).to.equal('option-2');
            expect(el.displayInput.value).to.equal('Option 2');
          });

          it('should select options with selected attribute, with-clear, and placeholder', async () => {
            // Regression: Bug #1922 exact combination
            const el = await fixture<CsSelect>(html`
              <cs-select placeholder="Placeholder" with-clear>
                <cs-option value="option-1" selected>Option 1</cs-option>
                <cs-option value="option-2">Option 2</cs-option>
                <cs-option value="option-3">Option 3</cs-option>
              </cs-select>
            `);

            expect(el.value).to.equal('option-1');
            expect(el.displayInput.value).to.equal('Option 1');
          });

          it('should select multiple options with selected attribute and with-clear', async () => {
            const el = await fixture<CsSelect>(html`
              <cs-select multiple with-clear>
                <cs-option value="option-1" selected>Option 1</cs-option>
                <cs-option value="option-2" selected>Option 2</cs-option>
                <cs-option value="option-3">Option 3</cs-option>
              </cs-select>
            `);

            expect(el.value).to.have.members(['option-1', 'option-2']);
            expect(el.value).to.have.length(2);
          });
        });
      });

      describe('events', () => {
        it('should emit change and input when the value is changed with the mouse', async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select value="option-1">
              <cs-option value="option-1">Option 1</cs-option>
              <cs-option value="option-2">Option 2</cs-option>
              <cs-option value="option-3">Option 3</cs-option>
            </cs-select>
          `);

          expect(el.value).to.equal('option-1');
          expect(el.defaultValue).to.equal('option-1');
          expect(el.displayInput.value).to.equal('Option 1');

          const secondOption = el.querySelectorAll<CsOption>('cs-option')[1];

          await el.show();

          await expectEvent(el, ['change', 'input'], async () => {
            await clickOnElement(secondOption);
            await el.updateComplete;
          });

          expect(el.value).to.equal('option-2');
        });

        it('should emit change and input when the value is changed with the keyboard', async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select value="option-1">
              <cs-option value="option-1">Option 1</cs-option>
              <cs-option value="option-2">Option 2</cs-option>
              <cs-option value="option-3">Option 3</cs-option>
            </cs-select>
          `);
          const changeHandler = sinon.spy();
          const inputHandler = sinon.spy();

          el.addEventListener('change', changeHandler);
          el.addEventListener('input', inputHandler);

          el.focus();
          await el.updateComplete;
          await sendKeys({ press: ' ' }); // open the dropdown
          await aTimeout(500); // wait for the dropdown to open
          await sendKeys({ press: 'ArrowDown' }); // move selection to the second option
          await el.updateComplete;
          await sendKeys({ press: 'ArrowDown' }); // move selection to the third option
          await el.updateComplete;
          el.focus(); // For some reason, the browser loses focus before we press enter. Refocus the select.
          await sendKeys({ press: 'Enter' }); // commit the selection
          await el.updateComplete;

          expect(changeHandler).to.have.been.calledOnce;
          expect(inputHandler).to.have.been.calledOnce;
          expect(el.value).to.equal('option-3');
        });

        it('should not emit change or input when the value is changed programmatically', async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select value="option-1">
              <cs-option value="option-1">Option 1</cs-option>
              <cs-option value="option-2">Option 2</cs-option>
              <cs-option value="option-3">Option 3</cs-option>
            </cs-select>
          `);

          el.addEventListener('change', () => expect.fail('change should not be emitted'));
          el.addEventListener('input', () => expect.fail('input should not be emitted'));
          el.value = 'option-2';

          await el.updateComplete;
        });

        it('should emit change and input with the correct validation message when the value changes', async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select required>
              <cs-option value="option-1">Option 1</cs-option>
              <cs-option value="option-2">Option 2</cs-option>
              <cs-option value="option-3">Option 3</cs-option>
            </cs-select>
          `);
          const option2 = el.querySelectorAll('cs-option')[1];
          const handler = sinon.spy((_event: InputEvent | Event) => {});

          el.addEventListener('change', handler);
          el.addEventListener('input', handler);

          await aTimeout(1);
          await clickOnElement(el);
          await aTimeout(500);
          await el.updateComplete;
          await aTimeout(100);
          await clickOnElement(option2);
          await el.updateComplete;
          await aTimeout(500);

          expect(handler).to.be.calledTwice;
          expect(el.value).to.equal(option2.value);
        });

        it('should have the correct event.target.value at the time the change event fires', async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select value="option-1">
              <cs-option value="option-1">Option 1</cs-option>
              <cs-option value="option-2">Option 2</cs-option>
              <cs-option value="option-3">Option 3</cs-option>
            </cs-select>
          `);
          const secondOption = el.querySelectorAll<CsOption>('cs-option')[1];
          let valueAtChangeTime: string | string[] | null = null;
          let valueAtInputTime: string | string[] | null = null;

          el.addEventListener('change', (event: Event) => {
            valueAtChangeTime = (event.target as CsSelect).value;
          });
          el.addEventListener('input', (event: Event) => {
            valueAtInputTime = (event.target as CsSelect).value;
          });

          await el.show();
          await clickOnElement(secondOption);
          await el.updateComplete;

          expect(valueAtChangeTime).to.equal('option-2');
          expect(valueAtInputTime).to.equal('option-2');
        });

        it('should have the correct event.target.value when selecting from no initial value', async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select>
              <cs-option value="option-1">Option 1</cs-option>
              <cs-option value="option-2">Option 2</cs-option>
              <cs-option value="option-3">Option 3</cs-option>
            </cs-select>
          `);
          const secondOption = el.querySelectorAll<CsOption>('cs-option')[1];
          let valueAtChangeTime: string | string[] | null = null;

          el.addEventListener('change', (event: Event) => {
            valueAtChangeTime = (event.target as CsSelect).value;
          });

          await el.show();
          await clickOnElement(secondOption);
          await el.updateComplete;

          expect(el.value).to.equal('option-2');
          expect(valueAtChangeTime).to.equal('option-2');
        });

        it('should emit exactly one change and one input event per click interaction', async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select value="option-1">
              <cs-option value="option-1">Option 1</cs-option>
              <cs-option value="option-2">Option 2</cs-option>
              <cs-option value="option-3">Option 3</cs-option>
            </cs-select>
          `);
          const changeHandler = sinon.spy();
          const inputHandler = sinon.spy();

          el.addEventListener('change', changeHandler);
          el.addEventListener('input', inputHandler);

          // First selection
          await el.show();
          await clickOnElement(el.querySelectorAll<CsOption>('cs-option')[1]);
          await el.updateComplete;
          await aTimeout(100);

          expect(changeHandler).to.have.been.calledOnce;
          expect(inputHandler).to.have.been.calledOnce;

          // Second selection — wait for the dropdown to fully close then reopen
          await aTimeout(500);
          await el.show();
          await aTimeout(500);
          await clickOnElement(el.querySelectorAll<CsOption>('cs-option')[2]);
          await el.updateComplete;
          await aTimeout(100);

          expect(changeHandler).to.have.been.calledTwice;
          expect(inputHandler).to.have.been.calledTwice;
          expect(el.value).to.equal('option-3');
        });

        it('should focus the select when clicking on the label', async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select label="Select One">
              <cs-option value="option-1">Option 1</cs-option>
              <cs-option value="option-2">Option 2</cs-option>
              <cs-option value="option-3">Option 3</cs-option>
            </cs-select>
          `);
          const label = el.shadowRoot!.querySelector('[part~="form-control-label"]')!;
          const focusHandler = sinon.spy();

          el.addEventListener('focus', focusHandler);
          (label as HTMLLabelElement).click();
          await waitUntil(() => focusHandler.calledOnce);

          expect(focusHandler).to.have.been.calledOnce;
        });

        it('should emit focus and blur when receiving and losing focus', async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select value="option-1">
              <cs-option value="option-1">Option 1</cs-option>
              <cs-option value="option-2">Option 2</cs-option>
              <cs-option value="option-3">Option 3</cs-option>
            </cs-select>
          `);
          const focusHandler = sinon.spy();
          const blurHandler = sinon.spy();

          el.addEventListener('focus', focusHandler);
          el.addEventListener('blur', blurHandler);

          el.focus();
          await el.updateComplete;
          el.blur();
          await el.updateComplete;

          expect(focusHandler).to.have.been.calledOnce;
          expect(blurHandler).to.have.been.calledOnce;
        });

        it('should emit cs-clear when the clear button is clicked', async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select value="option-1" with-clear>
              <cs-option value="option-1">Option 1</cs-option>
              <cs-option value="option-2">Option 2</cs-option>
              <cs-option value="option-3">Option 3</cs-option>
            </cs-select>
          `);
          const clearButton = el.shadowRoot!.querySelector('[part~="clear-button"]')!;

          await el.show();

          await expectEvent(el, 'cs-clear', async () => {
            await clickOnElement(clearButton);
            await el.updateComplete;
          });
        });

        it('should clear from a click near the top edge of the field', async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select value="option-1" with-clear>
              <cs-option value="option-1">Option 1</cs-option>
              <cs-option value="option-2">Option 2</cs-option>
            </cs-select>
          `);

          await expectEvent(el, 'cs-clear', async () => {
            await clickInsideTopEdge(el);
            await el.updateComplete;
          });
        });

        it('should clear from a click near the top edge of the field when tags are shown', async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select multiple with-clear>
              <cs-option value="option-1" selected>Option 1</cs-option>
              <cs-option value="option-2">Option 2</cs-option>
            </cs-select>
          `);

          await expectEvent(el, 'cs-clear', async () => {
            await clickInsideTopEdge(el);
            await el.updateComplete;
          });
        });

        it('should emit change and input when a tag is removed', async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select multiple>
              <cs-option value="option-1" selected>Option 1</cs-option>
              <cs-option value="option-2" selected>Option 2</cs-option>
              <cs-option value="option-3" selected>Option 3</cs-option>
            </cs-select>
          `);
          const tag = el.shadowRoot!.querySelector('[part~="tag"]')!;
          const removeButton = tag.shadowRoot!.querySelector('[part~="remove-button"]')!;

          await expectEvent(el, ['change', 'input'], async () => {
            // The offsets are a funky hack for Firefox.
            await clickOnElement(removeButton, 'center', 1, 1);
            await el.updateComplete;
            await aTimeout(1);
          });
        });

        it('should emit cs-show, cs-after-show, cs-hide, and cs-after-hide events when the listbox opens and closes', async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select value="option-1">
              <cs-option value="option-1">Option 1</cs-option>
              <cs-option value="option-2">Option 2</cs-option>
              <cs-option value="option-3">Option 3</cs-option>
            </cs-select>
          `);
          const showHandler = sinon.spy();
          const afterShowHandler = sinon.spy();
          const hideHandler = sinon.spy();
          const afterHideHandler = sinon.spy();

          el.addEventListener('cs-show', showHandler);
          el.addEventListener('cs-after-show', afterShowHandler);
          el.addEventListener('cs-hide', hideHandler);
          el.addEventListener('cs-after-hide', afterHideHandler);

          await el.show();
          expect(showHandler).to.have.been.calledOnce;
          expect(afterShowHandler).to.have.been.calledOnce;

          await el.hide();
          expect(hideHandler).to.have.been.calledOnce;
          expect(afterHideHandler).to.have.been.calledOnce;
        });

        it('should stay open when cs-hide is cancelled', async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select>
              <cs-option value="option-1">Option 1</cs-option>
              <cs-option value="option-2">Option 2</cs-option>
            </cs-select>
          `);
          const listbox = el.shadowRoot!.querySelector<HTMLElement>('.listbox')!;
          await el.show();

          el.addEventListener('cs-hide', (event) => event.preventDefault(), { once: true });
          el.open = false;
          await el.updateComplete;

          expect(el.open).to.be.true;
          expect(listbox.hidden).to.be.false;

          // The next close is not cancelled, so it has to close the select.
          await el.hide();
          expect(el.open).to.be.false;
          expect(listbox.hidden).to.be.true;
        });

        // Regression: https://github.com/shoelace-style/shoelace/issues/2117
        // This can happen in on Microsoft Edge auto-filling an associated input element in the same form
        it('should not throw on incomplete events', async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select required>
              <cs-option value="option-1">Option 1</cs-option>
            </cs-select>
          `);

          const event = new KeyboardEvent('keydown');
          Object.defineProperty(event, 'target', { writable: false, value: el });
          Object.defineProperty(event, 'key', { writable: false, value: undefined });

          /**
           * If Edge does autofill, it creates a broken KeyboardEvent
           * which is missing the key value.
           * Using the normal dispatch mechanism does not allow to do this
           * Thus passing the event directly to the private method for testing
           *
           * @ts-expect-error - private property */
          el.handleDocumentKeyDown(event);
        });
      });

      describe('tags', () => {
        it("should show a copy of each option's start content in its tag", async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select multiple>
              <cs-option value="ana" selected><cs-avatar slot="start" initials="AB"></cs-avatar>Ana Bell</cs-option>
              <cs-option value="cy">Cy Reed</cs-option>
            </cs-select>
          `);
          await el.updateComplete;
          const tag = el.shadowRoot!.querySelector('[part~="tag"]')!;
          const copy = tag.querySelector('cs-avatar');

          expect(copy, 'a copy in the tag').to.exist;
          expect(copy === el.querySelector('cs-avatar'), 'the original moved into the tag').to.be.false;
          expect(copy!.getAttribute('initials')).to.equal('AB');
          expect(copy!.assignedSlot?.name).to.equal('start');
          expect(tag.textContent?.trim()).to.equal('Ana Bell');
        });

        // The tag's text is the option's label, which already names it, so the copy is display only.
        it("should make the copy of an option's start content inert", async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select label="People" multiple>
              <cs-option value="ana" selected><cs-avatar slot="start" initials="AB"></cs-avatar>Ana Bell</cs-option>
            </cs-select>
          `);
          await el.updateComplete;

          expect(el.shadowRoot!.querySelector<HTMLElement>('[part~="tag"] cs-avatar')?.inert, 'inert').to.be.true;
          await expect(el).to.be.accessible();
        });

        // The copy has none of the original's listeners, so focus on it would lead nowhere.
        it('should keep a copy of focusable start content out of focus', async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select label="People" multiple>
              <cs-option value="ana" selected><button slot="start" type="button">i</button>Ana Bell</cs-option>
            </cs-select>
          `);
          await el.updateComplete;
          const copy = el.shadowRoot!.querySelector<HTMLElement>('[part~="tag"] button')!;

          copy.focus();

          expect(el.shadowRoot!.activeElement === copy, 'the copy took focus').to.be.false;
          await expect(el).to.be.accessible();
        });

        it('should show start content added to a picked option', async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select multiple>
              <cs-option value="apple" selected>Apple</cs-option>
            </cs-select>
          `);
          await el.updateComplete;
          const icon = document.createElement('cs-icon');
          icon.slot = 'start';
          icon.library = 'system';
          icon.name = 'check';

          el.querySelector('cs-option')!.prepend(icon);

          await waitUntil(
            () => el.shadowRoot!.querySelector('[part~="tag"] cs-icon') !== null,
            'the tag shows the new icon',
          );
        });

        // Lit, React and Vue can set a property without writing its attribute, and the copy has to carry it.
        it('should copy start content set through properties', async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select multiple>
              <cs-option value="ana" selected><cs-avatar slot="start"></cs-avatar>Ana Bell</cs-option>
            </cs-select>
          `);
          el.querySelector<CsAvatar>('cs-avatar')!.initials = 'AB';

          el.requestUpdate();
          await el.updateComplete;

          expect(el.shadowRoot!.querySelector<CsAvatar>('[part~="tag"] cs-avatar')?.initials).to.equal('AB');
        });

        // A copy's id would shadow the select's own: its tags come before the hint the field is described by.
        it('should keep the ids of start content out of the shadow root', async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select label="People" hint="Pick everyone who works on it" multiple>
              <cs-option value="ana" selected><span slot="start" id="hint">A</span>Ana Bell</cs-option>
            </cs-select>
          `);
          await el.updateComplete;
          const hint = el.shadowRoot!.querySelector('[part~="hint"]');

          expect(el.shadowRoot!.getElementById('hint') === hint, 'hint resolves to the hint').to.be.true;
        });

        // A per-person avatar colour and a label's colour dot are both set inline, and the copy has to keep them.
        it('should keep inline colours on the copies', async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select multiple>
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
            </cs-select>
          `);
          await el.updateComplete;
          const [avatar, dot] = [...el.shadowRoot!.querySelectorAll<HTMLElement>('[part~="tags"] [slot="start"]')];

          expect(getComputedStyle(avatar).backgroundColor).to.equal('rgb(46, 107, 168)');
          expect(getComputedStyle(avatar).color).to.equal('rgb(255, 255, 255)');
          expect(getComputedStyle(dot).backgroundColor).to.equal('rgb(229, 72, 77)');
          expect(getComputedStyle(dot).borderTopLeftRadius).to.equal('50%');
          expect(dot.getBoundingClientRect().width).to.be.above(0);
        });

        it('should truncate a long label to the same width with or without start content', async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select multiple>
              <cs-option value="jw" selected
                ><cs-avatar slot="start" initials="JW"></cs-avatar>Jonah Whitfield-Abernathy</cs-option
              >
              <cs-option value="jx" selected>Jonah Whitfield-Abernathy</cs-option>
            </cs-select>
          `);
          await el.updateComplete;
          const [withStart, without] = [...el.shadowRoot!.querySelectorAll('[part~="tags"] cs-tag')].map((tag) =>
            tag.shadowRoot!.querySelector<HTMLElement>('[part~="content"]')!,
          );

          expect(withStart.scrollWidth > withStart.clientWidth, 'the label is truncated').to.be.true;
          expect(withStart.getBoundingClientRect().width).to.be.closeTo(without.getBoundingClientRect().width, 0.5);
        });

        // What a screen reader gets from a tag: its text, then one button named Remove. The inert copy adds neither.
        // Checked in the DOM they come from: Playwright's accessibility snapshot of a tag is empty on Linux WebKit, and
        // shows an inert avatar's initials on macOS WebKit.
        it("should leave a tag's text and remove button as they were", async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select label="People" multiple>
              <cs-option value="ana" selected><cs-avatar slot="start" initials="AB"></cs-avatar>Ana Bell</cs-option>
            </cs-select>
          `);
          await el.updateComplete;
          const tag = el.shadowRoot!.querySelector<HTMLElement>('[part~="tag"]')! as CsTag;
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
          const el = await fixture<CsSelect>(html`
            <cs-select label="People" multiple>
              <cs-option value="ana" selected><cs-avatar slot="start" initials="AB"></cs-avatar>Ana Bell</cs-option>
            </cs-select>
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

        // A select lists an option among its tags without marking it selected when defaultValue names a disabled one.
        it('should show start content added to a tag whose option is not marked selected', async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select multiple>
              <cs-option value="ana" disabled>Ana Bell</cs-option>
            </cs-select>
          `);
          const option = el.querySelector('cs-option')!;
          el.defaultValue = ['ana'];
          el.selectionChanged();
          await waitUntil(() => el.shadowRoot!.querySelector('[part~="tag"]'), 'a tag for the option');
          expect(option.selected, 'marked selected').to.be.false;

          option.prepend(
            Object.assign(document.createElement('cs-icon'), { slot: 'start', library: 'system', name: 'check' }),
          );

          await waitUntil(() => el.shadowRoot!.querySelector('[part~="tag"] cs-icon'), 'the tag shows the new icon');
        });

        // A copy made fresh each render would fetch a broken image again every time, and its error would leave the
        // control as if the page's own avatar had failed again.
        it("should keep a failed image's copy, and its error, inside the tag as the control renders", async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select label="People" multiple>
              <cs-option value="ana" selected
                ><cs-avatar slot="start" initials="AB" image="/no-such-image.png"></cs-avatar>Ana Bell</cs-option
              >
            </cs-select>
          `);
          const original = el.querySelector('cs-avatar')!;
          const errors: EventTarget[] = [];
          el.addEventListener('cs-error', (event) => errors.push(event.target!));
          await el.updateComplete;
          const copy = el.shadowRoot!.querySelector<HTMLElement>('[part~="tag"]')!.querySelector('cs-avatar')!;
          await waitUntil(() => copy.shadowRoot?.querySelector('.initials'), 'the copy falls back to its initials');

          await el.show();
          el.requestUpdate();
          await el.updateComplete;

          expect(
            el.shadowRoot!.querySelector<HTMLElement>('[part~="tag"]')!.querySelector('cs-avatar') === copy,
            'the same copy',
          ).to.be.true;
          expect(errors.filter((target) => target !== original).length, 'errors from the copy').to.equal(0);
        });

        it('should leave start content out of the tag that counts the rest', async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select label="People" multiple max-options-visible="1">
              <cs-option value="ana" selected><cs-avatar slot="start" initials="AB"></cs-avatar>Ana Bell</cs-option>
              <cs-option value="cy" selected><cs-avatar slot="start" initials="CR"></cs-avatar>Cy Reed</cs-option>
            </cs-select>
          `);
          await el.updateComplete;
          const tags = [...el.shadowRoot!.querySelector<HTMLElement>('[part~="tags"]')!.querySelectorAll('cs-tag')];

          expect(tags.map((tag) => tag.textContent?.trim())).to.deep.equal(['Ana Bell', '+1']);
          expect(tags[1].querySelector('[slot="start"]')).to.be.null;
        });

        // Turbo's morph can re-create the option elements after a save. The tags have to come back whole.
        it('should show the start content of re-created options', async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select multiple>
              <cs-option value="ana" selected><cs-avatar slot="start" initials="AB"></cs-avatar>Ana Bell</cs-option>
            </cs-select>
          `);
          await el.updateComplete;

          el.querySelector('cs-option')!.replaceWith(
            Object.assign(document.createElement('div'), {
              innerHTML:
                '<cs-option value="ana" selected><cs-avatar slot="start" initials="AC"></cs-avatar>Ana Bell</cs-option>',
            }).firstElementChild!,
          );

          await waitUntil(
            () => el.shadowRoot!.querySelector('[part~="tag"] cs-avatar')?.getAttribute('initials') === 'AC',
            'the tag shows the new option',
          );
          expect(el.value).to.deep.equal(['ana']);
        });

        it('should remove a custom tag through its data-value', async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select multiple>
              <cs-option value="apple" selected>Apple</cs-option>
              <cs-option value="banana" selected>Banana</cs-option>
            </cs-select>
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
          const tag = el.shadowRoot!.querySelector<CsTag>('cs-tag[data-value="apple"]')!;
          await tag.updateComplete;

          await expectEvent(el, ['input', 'change'], async () => {
            await clickOnElement(tag.shadowRoot!.querySelector('[part~="remove-button"]')!, 'center', 1, 1);
            await el.updateComplete;
          });
          expect(el.value).to.deep.equal(['banana']);
        });
      });

      describe('rapid toggling', () => {
        it('should keep the listbox visible when reopened during the hide animation', async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select>
              <cs-option value="option-1">Option 1</cs-option>
              <cs-option value="option-2">Option 2</cs-option>
            </cs-select>
          `);
          const listbox = el.shadowRoot!.querySelector<HTMLElement>('.listbox')!;
          const afterHideHandler = sinon.spy();
          await el.show();
          el.addEventListener('cs-after-hide', afterHideHandler);

          // Start closing, then reopen before the hide animation ends.
          el.open = false;
          await el.updateComplete;
          const afterShow = oneEvent(el, 'cs-after-show');
          el.open = true;
          await afterShow;

          expect(el.open).to.be.true;
          expect(listbox.hidden).to.be.false;
          expect(afterHideHandler.callCount).to.equal(0);
        });

        it('should keep the listbox hidden when closed during the show animation', async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select>
              <cs-option value="option-1">Option 1</cs-option>
              <cs-option value="option-2">Option 2</cs-option>
            </cs-select>
          `);
          const listbox = el.shadowRoot!.querySelector<HTMLElement>('.listbox')!;
          const afterShowHandler = sinon.spy();
          el.addEventListener('cs-after-show', afterShowHandler);

          // Start opening, then close before the show animation ends.
          el.open = true;
          await el.updateComplete;
          const afterHide = oneEvent(el, 'cs-after-hide');
          el.open = false;
          await afterHide;

          expect(el.open).to.be.false;
          expect(listbox.hidden).to.be.true;
          expect(afterShowHandler.callCount).to.equal(0);
        });

        it('should hide the listbox when opened while disabled during the hide animation', async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select>
              <cs-option value="option-1">Option 1</cs-option>
              <cs-option value="option-2">Option 2</cs-option>
            </cs-select>
          `);
          const listbox = el.shadowRoot!.querySelector<HTMLElement>('.listbox')!;
          await el.show();

          el.open = false;
          await el.updateComplete;
          el.disabled = true;
          await el.updateComplete;
          const afterHide = oneEvent(el, 'cs-after-hide');
          el.open = true;
          await afterHide;

          expect(listbox.hidden).to.be.true;
        });
      });

      describe('keyboard navigation', () => {
        it('should open the listbox when any letter key is pressed with cs-select on focus', async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select>
              <cs-option value="option-1">Option 1</cs-option>
              <cs-option value="option-2">Option 2</cs-option>
              <cs-option value="option-3">Option 3</cs-option>
            </cs-select>
          `);
          const displayInput = el.shadowRoot!.querySelector<HTMLSelectElement>('.display-input')!;

          el.focus();
          await sendKeys({ press: 'r' });
          await el.updateComplete;

          expect(displayInput.getAttribute('aria-expanded')).to.equal('true');
        });

        it('should not open the listbox when ctrl + R is pressed with cs-select on focus', async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select>
              <cs-option value="option-1">Option 1</cs-option>
              <cs-option value="option-2">Option 2</cs-option>
              <cs-option value="option-3">Option 3</cs-option>
            </cs-select>
          `);
          const displayInput = el.shadowRoot!.querySelector<HTMLSelectElement>('.display-input')!;

          el.focus();
          await sendKeys({ down: 'Control' });
          await sendKeys({ press: 'r' });
          await sendKeys({ up: 'Control' });
          await el.updateComplete;
          expect(displayInput.getAttribute('aria-expanded')).to.equal('false');
        });

        it('should scroll a type-to-select match into view', async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select>
              <cs-option value="argentina">Argentina</cs-option>
              <cs-option value="belgium">Belgium</cs-option>
              <cs-option value="canada">Canada</cs-option>
              <cs-option value="denmark">Denmark</cs-option>
              <cs-option value="egypt">Egypt</cs-option>
              <cs-option value="france">France</cs-option>
              <cs-option value="ghana">Ghana</cs-option>
            </cs-select>
          `);
          const listbox = el.shadowRoot!.querySelector<HTMLElement>('.listbox')!;
          const ghana = el.querySelector<CsOption>('cs-option[value="ghana"]')!;
          const scrollTo = sinon.stub(listbox, 'scrollTo');

          sinon.stub(listbox, 'getBoundingClientRect').returns({
            top: 0,
            left: 0,
            right: 200,
            bottom: 100,
            width: 200,
            height: 100,
            x: 0,
            y: 0,
            toJSON: () => {},
          });
          sinon.stub(ghana, 'getBoundingClientRect').returns({
            top: 140,
            left: 0,
            right: 200,
            bottom: 160,
            width: 200,
            height: 20,
            x: 0,
            y: 140,
            toJSON: () => {},
          });
          Object.defineProperty(listbox, 'offsetHeight', { configurable: true, value: 100 });
          Object.defineProperty(ghana, 'clientHeight', { configurable: true, value: 20 });

          el.focus();
          await sendKeys({ press: 'g' });
          await sendKeys({ press: 'h' });
          await sendKeys({ press: 'a' });
          await sendKeys({ press: 'n' });
          await sendKeys({ press: 'a' });
          await el.updateComplete;

          expect(el.currentOption).to.equal(ghana);
          expect(scrollTo).to.have.been.calledWith({ top: 60, behavior: 'auto' });
        });
      });

      describe('form integration', () => {
        describe('when using constraint validation', () => {
          it('should be valid by default', async () => {
            const el = await fixture<HTMLFormElement>(html`
              <form>
                <cs-select>
                  <cs-option value="option-1">Option 1</cs-option>
                  <cs-option value="option-2">Option 2</cs-option>
                  <cs-option value="option-3">Option 3</cs-option>
                </cs-select>
              </form>
            `);
            const select = el.querySelector<CsSelect>('cs-select')!;
            expect(select.checkValidity()).to.be.true;
          });

          it('should be invalid when required and empty', async () => {
            const el = await fixture<HTMLFormElement>(html`
              <form>
                <cs-select required>
                  <cs-option value="option-1">Option 1</cs-option>
                  <cs-option value="option-2">Option 2</cs-option>
                  <cs-option value="option-3">Option 3</cs-option>
                </cs-select>
              </form>
            `);
            const select = el.querySelector<CsSelect>('cs-select')!;
            expect(select.checkValidity()).to.be.false;
          });

          it('should focus on the displayInput when constraint validation occurs', async () => {
            const el = await fixture<HTMLFormElement>(html`
              <form>
                <cs-select required>
                  <cs-option value="option-1">Option 1</cs-option>
                  <cs-option value="option-2">Option 2</cs-option>
                  <cs-option value="option-3">Option 3</cs-option>
                </cs-select>
              </form>
            `);
            const select = el.querySelector<CsSelect>('cs-select')!;
            el.requestSubmit();
            expect(select.shadowRoot!.activeElement).to.equal(select.displayInput);
          });
        });

        describe('when submitting a form', () => {
          it('should serialize its name and value with FormData', async () => {
            const form = await fixture<HTMLFormElement>(html`
              <form>
                <cs-select name="a" value="option-1">
                  <cs-option value="option-1">Option 1</cs-option>
                  <cs-option value="option-2">Option 2</cs-option>
                  <cs-option value="option-3">Option 3</cs-option>
                </cs-select>
              </form>
            `);
            const formData = new FormData(form);
            expect(formData.get('a')).to.equal('option-1');
          });

          it('should serialize its name and value in FormData when multiple options are selected', async () => {
            const form = await fixture<HTMLFormElement>(html`
              <form>
                <cs-select name="a" multiple>
                  <cs-option value="option-1">Option 1</cs-option>
                  <cs-option value="option-2" selected>Option 2</cs-option>
                  <cs-option value="option-3" selected>Option 3</cs-option>
                </cs-select>
              </form>
            `);
            const formData = new FormData(form);
            expect(formData.getAll('a')).to.include('option-2');
            expect(formData.getAll('a')).to.include('option-3');
          });

          it('should serialize its name and value in JSON', async () => {
            const form = await fixture<HTMLFormElement>(html`
              <form>
                <cs-select name="a" value="option-1">
                  <cs-option value="option-1">Option 1</cs-option>
                  <cs-option value="option-2">Option 2</cs-option>
                  <cs-option value="option-3">Option 3</cs-option>
                </cs-select>
              </form>
            `);
            const json = serialize(form);
            expect(json.a).to.equal('option-1');
          });

          it('should serialize its name and value in JSON when multiple options are selected', async () => {
            const form = await fixture<HTMLFormElement>(html`
              <form>
                <cs-select name="a" multiple>
                  <cs-option value="option-1">Option 1</cs-option>
                  <cs-option value="option-2" selected>Option 2</cs-option>
                  <cs-option value="option-3" selected>Option 3</cs-option>
                </cs-select>
              </form>
            `);

            const json = serialize(form);
            expect(JSON.stringify(json)).to.equal(JSON.stringify({ a: ['option-2', 'option-3'] }));
          });

          it('should be present in form data when using the form attribute and located outside of a <form>', async () => {
            const el = await fixture<HTMLFormElement>(html`
              <div>
                <form id="f">
                  <cs-button type="submit">Submit</cs-button>
                </form>
                <cs-select form="f" name="a" value="option-1">
                  <cs-option value="option-1">Option 1</cs-option>
                  <cs-option value="option-2">Option 2</cs-option>
                  <cs-option value="option-3">Option 3</cs-option>
                </cs-select>
              </div>
            `);
            const form = el.querySelector('form')!;
            const formData = new FormData(form);

            expect(formData.get('a')).to.equal('option-1');
          });
        });

        describe('when resetting a form', () => {
          it('should reset the element to its initial value', async () => {
            const form = await fixture<HTMLFormElement>(html`
              <form>
                <cs-select value="option-1">
                  <cs-option value="option-1">Option 1</cs-option>
                  <cs-option value="option-2">Option 2</cs-option>
                  <cs-option value="option-3">Option 3</cs-option>
                </cs-select>
                <cs-button type="reset">Reset</cs-button>
              </form>
            `);

            const resetButton = form.querySelector('cs-button')!;
            const select = form.querySelector('cs-select')!;

            select.value = 'option-3';
            await select.updateComplete;
            expect(select.value).to.equal('option-3');

            const resetSpy = sinon.spy();
            form.addEventListener('reset', () => {
              resetSpy();
            });
            // clickOnElement causes some weird behavior where the `reset` event never fires.
            resetButton.click();
            await select.updateComplete;

            expect(resetSpy).to.have.been.calledOnce;
            expect(select.value).to.equal('option-1');
          });
        });
      });

      describe('CSS parts and states', () => {
        it('should receive the correct validation attributes ("states") when valid', async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select label="Select one" required value="option-1">
              <cs-option value="option-1">Option 1</cs-option>
              <cs-option value="option-2">Option 2</cs-option>
              <cs-option value="option-3">Option 3</cs-option>
            </cs-select>
          `);
          const secondOption = el.querySelectorAll('cs-option')[1];

          expect(el.checkValidity()).to.be.true;
          expect(el.customStates.has('required')).to.be.true;
          expect(el.customStates.has('optional')).to.be.false;
          expect(el.customStates.has('invalid')).to.be.false;
          expect(el.customStates.has('valid')).to.be.true;
          expect(el.customStates.has('user-invalid')).to.be.false;
          expect(el.customStates.has('user-valid')).to.be.false;

          await el.show();
          await clickOnElement(secondOption);
          await el.updateComplete;
          el.blur();
          await el.updateComplete;

          expect(el.checkValidity()).to.be.true;
          expect(el.customStates.has('user-invalid')).to.be.false;
          expect(el.customStates.has('user-valid')).to.be.true;
        });

        it('should receive the correct validation attributes ("states") when invalid', async () => {
          const el = await fixture<CsSelect>(html`
            <cs-select label="Select one" required>
              <cs-option value="option-1">Option 1</cs-option>
              <cs-option value="option-2">Option 2</cs-option>
              <cs-option value="option-3">Option 3</cs-option>
            </cs-select>
          `);
          const secondOption = el.querySelectorAll('cs-option')[1];

          expect(el.customStates.has('required')).to.be.true;
          expect(el.customStates.has('optional')).to.be.false;
          expect(el.customStates.has('invalid')).to.be.true;
          expect(el.customStates.has('valid')).to.be.false;
          expect(el.customStates.has('user-invalid')).to.be.false;
          expect(el.customStates.has('user-valid')).to.be.false;

          await el.show();
          await clickOnElement(secondOption);
          el.value = '';
          await el.updateComplete;
          el.blur();
          await el.updateComplete;

          expect(el.customStates.has('user-invalid')).to.be.true;
          expect(el.customStates.has('user-valid')).to.be.false;
        });

        it('should receive validation attributes ("states") even when novalidate is used on the parent form', async () => {
          const el = await fixture<HTMLFormElement>(html`
            <form novalidate>
              <cs-select required>
                <cs-option value="option-1">Option 1</cs-option>
                <cs-option value="option-2">Option 2</cs-option>
                <cs-option value="option-3">Option 3</cs-option>
              </cs-select>
            </form>
          `);
          const select = el.querySelector<CsSelect>('cs-select')!;

          expect(select.customStates.has('required')).to.be.true;
          expect(select.customStates.has('optional')).to.be.false;
          expect(select.customStates.has('invalid')).to.be.true;
          expect(select.customStates.has('valid')).to.be.false;
          expect(select.customStates.has('user-invalid')).to.be.false;
          expect(select.customStates.has('user-valid')).to.be.false;
        });
      });

      describe('with lazily loaded options', () => {
        describe('with no existing options', () => {
          it('should wait to select the option when the option exists for single select', async () => {
            const form = await fixture<HTMLFormElement>(
              html`<form><cs-select name="select" value="option-1"></cs-select></form>`,
            );
            const el = form.querySelector<CsSelect>('cs-select')!;

            expect(el.defaultValue).to.equal('option-1');
            expect(el.value).to.equal(null);
            expect(new FormData(form).get('select')).equal(null);

            const option = document.createElement('cs-option');
            option.value = 'option-1';
            option.innerText = 'Option 1';
            el.append(option);

            await aTimeout(10);
            await el.updateComplete;
            expect(el.optionValues ? [...el.optionValues] : []).to.have.members(['option-1']);
            expect(el.value).to.equal('option-1');
            expect(new FormData(form).get('select')).equal('option-1');
          });

          it('should wait to select the option when the option exists for multiple select', async () => {
            const form = await fixture<HTMLFormElement>(
              html`<form><cs-select name="select" value="option-1" multiple></cs-select></form>`,
            );

            const el = form.querySelector<CsSelect>('cs-select')!;
            expect(Array.isArray(el.value)).to.equal(true);
            expect(el.value!.length).to.equal(0);

            const option = document.createElement('cs-option');
            option.value = 'option-1';
            option.innerText = 'Option 1';
            el.append(option);

            await aTimeout(10);
            await el.updateComplete;
            expect(el.value!.length).to.equal(1);
            expect(el.value).to.have.members(['option-1']);
            expect(new FormData(form).getAll('select')).have.members(['option-1']);
          });
        });

        describe('with existing options', () => {
          it('should not select the option if options already exist for single select', async () => {
            const form = await fixture<HTMLFormElement>(
              html` <form>
                <cs-select name="select" value="foo">
                  <cs-option value="bar">Bar</cs-option>
                  <cs-option value="baz">Baz</cs-option>
                </cs-select>
              </form>`,
            );

            const el = form.querySelector<CsSelect>('cs-select')!;
            expect(el.value).to.equal(null);
            expect(new FormData(form).get('select')).to.equal(null);

            const option = document.createElement('cs-option');
            option.value = 'foo';
            option.innerText = 'Foo';
            el.append(option);

            await aTimeout(10);
            await el.updateComplete;
            expect(el.value).to.equal('foo');
            expect(new FormData(form).get('select')).to.equal('foo');
          });

          it('should not select the option if options already exist for multiple select', async () => {
            const form = await fixture<HTMLFormElement>(
              html` <form>
                <cs-select name="select" multiple>
                  <cs-option value="bar">Bar</cs-option>
                  <cs-option value="baz">Baz</cs-option>
                  <cs-option value="foo" selected>Foo</cs-option>
                </cs-select>
              </form>`,
            );

            const el = form.querySelector<CsSelect>('cs-select')!;
            expect(el.value).to.be.an('array');
            expect(el.value!.length).to.equal(1);
            expect(el.value).to.have.members(['foo']);
            expect(new FormData(form).getAll('select')).to.have.members(['foo']);
          });

          it('should only select the existing options if options already exist for multiple select', async () => {
            const form = await fixture<HTMLFormElement>(
              html` <form>
                <cs-select name="select" multiple>
                  <cs-option value="bar" selected>Bar</cs-option>
                  <cs-option value="baz" selected>Baz</cs-option>
                </cs-select>
              </form>`,
            );

            const el = form.querySelector<CsSelect>('cs-select')!;
            expect(el.optionValues ? [...el.optionValues] : []).to.have.members(['bar', 'baz']);
            expect(el.optionValues?.size).to.equal(2);
            expect(el.value).to.have.members(['bar', 'baz']);
            expect(el.value!.length).to.equal(2);
            expect(new FormData(form).getAll('select')).to.have.members(['bar', 'baz']);

            const option = document.createElement('cs-option');
            option.value = 'foo';
            option.innerText = 'Foo';
            option.selected = true;
            el.append(option);

            await aTimeout(10);
            await el.updateComplete;
            expect(el.value).to.have.members(['bar', 'baz', 'foo']);
            expect(new FormData(form).getAll('select')).to.have.members(['bar', 'baz', 'foo']);
          });
        });

        describe('with setting the value via JS', () => {
          it('should preserve value even if not returned', async () => {
            const form = await fixture<HTMLFormElement>(
              html` <form>
                <cs-select name="select">
                  <cs-option value="bar">Bar</cs-option>
                  <cs-option value="baz">Baz</cs-option>
                </cs-select>
              </form>`,
            );

            const el = form.querySelector<CsSelect>('cs-select')!;
            expect(el.value).to.equal(null);

            el.defaultValue = 'foo';
            await aTimeout(10);
            await el.updateComplete;
            expect(el.value).to.equal(null);

            const option = document.createElement('cs-option');
            option.value = 'foo';
            option.innerText = 'Foo';
            el.append(option);

            await aTimeout(10);
            await el.updateComplete;
            expect(el.value).to.equal('foo');
          });
        });
      });

      // Regression: https://github.com/shoelace-style/webawesome/issues/1131
      // new test, failing only in CI
      it.skip('should work properly with empty values on select', async () => {
        const el = await fixture<CsSelect>(html`
          <cs-select label="Select one">
            <cs-option value="">Blank Option</cs-option>
            <cs-option value="option-2">Option 2</cs-option>
            <cs-option value="option-3">Option 3</cs-option>
          </cs-select>
        `);

        await resetMouse();

        await el.show();
        const options = el.querySelectorAll('cs-option');
        await aTimeout(100);
        await clickOnElement(options[0]);
        await resetMouse();
        await el.updateComplete;
        expect(el.value).to.equal('');

        await aTimeout(100);
        await clickOnElement(options[1]);
        await resetMouse();
        await el.updateComplete;
        await aTimeout(100);
        expect(el.value).to.equal('option-2');

        await clickOnElement(options[0]);
        await resetMouse();
        await el.updateComplete;
        await aTimeout(100);
        expect(el.value).to.equal('');
        await resetMouse();
      });
    });
  }

  describe('dismissible stack', () => {
    it('should only close the tooltip when pressing Escape with a select open underneath', async () => {
      const fixture = fixtures[0];
      const el = await fixture<HTMLDivElement>(html`
        <div>
          <cs-select id="test-select">
            <cs-option value="1">Option 1</cs-option>
            <cs-option value="2">Option 2</cs-option>
          </cs-select>
          <cs-tooltip id="test-tooltip" for="test-select" trigger="manual">Tooltip content</cs-tooltip>
        </div>
      `);

      const select = el.querySelector<CsSelect>('#test-select')!;
      const tooltip = el.querySelector<CsTooltip>('#test-tooltip')!;

      // Open the select by focusing and pressing space
      select.focus();
      await sendKeys({ press: ' ' });
      await waitUntil(() => select.open);
      await aTimeout(200);

      // Open tooltip programmatically (manual trigger won't steal focus)
      tooltip.open = true;
      await waitUntil(() => tooltip.open);
      await aTimeout(200);

      await sendKeys({ press: 'Escape' });

      await waitUntil(() => tooltip.open === false);
      expect(tooltip.open).to.be.false;
      expect(select.open).to.be.true;
    });
  });

  describe('value set via property before options exist', () => {
    it('should display the selected value for single select when value property is set before options are added', async () => {
      const fixture = fixtures[0];
      const el = await fixture<CsSelect>(html`<cs-select label="Test"></cs-select>`);

      // Set value via property before options exist
      el.value = 'option-2';

      // Now add options after the value has been set
      const option1 = document.createElement('cs-option');
      option1.value = 'option-1';
      option1.textContent = 'Option 1';
      const option2 = document.createElement('cs-option');
      option2.value = 'option-2';
      option2.textContent = 'Option 2';
      const option3 = document.createElement('cs-option');
      option3.value = 'option-3';
      option3.textContent = 'Option 3';
      el.append(option1, option2, option3);

      await aTimeout(10);
      await el.updateComplete;

      expect(el.value).to.equal('option-2');
      expect(el.displayInput.value).to.equal('Option 2');
    });

    it('should display the selected values for multiple select when value property is set before options are added', async () => {
      const fixture = fixtures[0];
      const el = await fixture<CsSelect>(html`<cs-select label="Test" multiple></cs-select>`);

      // Set value via property as an array before options exist
      el.value = ['option-1', 'option-2'];

      // Now add options after the value has been set
      const option1 = document.createElement('cs-option');
      option1.value = 'option-1';
      option1.textContent = 'Option 1';
      const option2 = document.createElement('cs-option');
      option2.value = 'option-2';
      option2.textContent = 'Option 2';
      const option3 = document.createElement('cs-option');
      option3.value = 'option-3';
      option3.textContent = 'Option 3';
      el.append(option1, option2, option3);

      await aTimeout(10);
      await el.updateComplete;

      expect(el.value).to.be.an('array');
      expect(el.value).to.have.members(['option-1', 'option-2']);
      expect(el.selectedOptions.length).to.equal(2);
    });

    it('should display the selected value when value attribute is set with options present', async () => {
      const fixture = fixtures[0];
      const el = await fixture<CsSelect>(html`
        <cs-select value="option-2">
          <cs-option value="option-1">Option 1</cs-option>
          <cs-option value="option-2">Option 2</cs-option>
          <cs-option value="option-3">Option 3</cs-option>
        </cs-select>
      `);

      await el.updateComplete;

      expect(el.value).to.equal('option-2');
      expect(el.displayInput.value).to.equal('Option 2');
    });
  });

  describe('trailing affordance alignment', () => {
    // <cs-select> and <cs-input> are the canonical trailing axis the other form controls line
    // up against (date/time/combobox guards compare against <cs-select>). This anchors the two
    // references together so the axis itself can't silently drift.
    function iconCenterFromRight(host: HTMLElement, partSelector: string): number {
      const part = host.shadowRoot!.querySelector(partSelector);
      let icon: Element | null | undefined = part?.querySelector('cs-icon');
      if (!icon && part instanceof HTMLSlotElement) {
        icon = part.assignedElements()[0];
      }
      const target = icon ?? part!;
      const iconRect = target.getBoundingClientRect();
      const hostRect = host.getBoundingClientRect();
      return hostRect.right - (iconRect.left + iconRect.right) / 2;
    }

    it('shares the trailing axis with <cs-input>', async () => {
      const fixture = fixtures[0];
      const container = await fixture(html`
        <div>
          <cs-select with-clear value="a"><cs-option value="a">A</cs-option></cs-select>
          <cs-input with-clear value="text"><cs-icon slot="end" name="info" variant="fill"></cs-icon></cs-input>
        </div>
      `);
      const select = container.querySelector<HTMLElement & { updateComplete: Promise<unknown> }>('cs-select')!;
      const input = container.querySelector<HTMLElement & { updateComplete: Promise<unknown> }>('cs-input')!;
      await Promise.all([customElements.whenDefined('cs-select'), customElements.whenDefined('cs-input')]);
      await select.updateComplete;
      await input.updateComplete;
      await aTimeout(50);

      // input's trailing-most icon is the end-slot decoration; select's is the chevron.
      const trailingDelta = Math.abs(
        iconCenterFromRight(input, '[part~="end"]') - iconCenterFromRight(select, '[part~="expand-icon"]'),
      );
      const clearDelta = Math.abs(
        iconCenterFromRight(input, '[part~="clear-button"]') - iconCenterFromRight(select, '[part~="clear-button"]'),
      );

      // The clear buttons share a right edge, but <cs-input>'s is a square focus-ring target
      // (aspect-ratio: 1 against its 1.5em height), so it pads the icon by 2px on each side and
      // its center sits 2px inboard of the select's. That offset is intentional; anything beyond
      // it means the shared trailing edge itself has drifted.
      expect(trailingDelta, 'input end-slot icon is off the select trailing axis').to.be.lessThan(2);
      expect(clearDelta, 'input clear button is off the select clear axis').to.be.at.most(2);
    });
  });
});
