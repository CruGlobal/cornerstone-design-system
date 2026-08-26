import { aTimeout, expect, oneEvent, waitUntil } from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import { html } from 'lit';
import sinon from 'sinon';
import { expectEvent } from '../../internal/test/expect-event.js';
import { fixtures } from '../../internal/test/fixture.js';
import { runFormControlBaseTests } from '../../internal/test/form-control-base-tests.js';
import { clickOnElement } from '../../internal/test/pointer-utilities.js';
import CsCheckbox from './checkbox.js';

describe('<cs-checkbox>', () => {
  runFormControlBaseTests({ tagName: 'cs-checkbox', formValue: { property: 'checked' } });

  for (const fixture of fixtures) {
    describe(`with "${fixture.type}" rendering`, () => {
      describe('accessibility', () => {
        it('should pass accessibility tests', async () => {
          const el = await fixture<CsCheckbox>(html`<cs-checkbox>Checkbox</cs-checkbox>`);
          await expect(el).to.be.accessible();
        });
      });

      describe('properties', () => {
        it('should have correct default property values', async () => {
          const el = await fixture<CsCheckbox>(html`<cs-checkbox></cs-checkbox>`);

          expect(el.name).to.equal(null);
          expect(el.value).to.equal('on');
          expect(el.title).to.equal('');
          expect(el.disabled).to.be.false;
          expect(el.required).to.be.false;
          expect(el.checked).to.be.false;
          expect(el.indeterminate).to.be.false;
          expect(el.defaultChecked).to.be.false;
          expect(el.hint).to.equal('');
          expect(el.size).to.equal('m');
        });

        it('should reflect the checked attribute as defaultChecked', async () => {
          const el = await fixture<CsCheckbox>(html`<cs-checkbox checked></cs-checkbox>`);
          expect(el.defaultChecked).to.be.true;
          expect(el.checked).to.be.true;
        });

        it('should default value to "on" when no value attribute is set', async () => {
          const el = await fixture<CsCheckbox>(html`<cs-checkbox></cs-checkbox>`);
          expect(el.value).to.equal('on');
        });

        it('should return the value regardless of checked state', async () => {
          const el = await fixture<CsCheckbox>(html`<cs-checkbox value="myvalue" checked></cs-checkbox>`);

          expect(el.checked).to.be.true;
          expect(el.value).to.equal('myvalue');
          expect(el.shadowRoot?.querySelector('input')?.checked).to.equal(true);

          el.checked = false;
          await el.updateComplete;

          expect(el.checked).to.be.false;
          expect(el.value).to.equal('myvalue');
          expect(el.shadowRoot?.querySelector('input')?.checked).to.equal(false);

          // let's recheck setting `el.checked = true`
          // https://github.com/shoelace-style/webawesome/issues/2478
          el.checked = true;
          await el.updateComplete;
          expect(el.shadowRoot?.querySelector('input')?.checked).to.equal(true);
        });

        it('should have title on the internal input if title attribute is set', async () => {
          const el = await fixture<CsCheckbox>(html`<cs-checkbox title="Test"></cs-checkbox>`);
          const input = el.shadowRoot!.querySelector('input')!;
          expect(input.title).to.equal('Test');
        });

        it('should be disabled with the disabled attribute', async () => {
          const el = await fixture<CsCheckbox>(html`<cs-checkbox disabled></cs-checkbox>`);
          const checkbox = el.shadowRoot!.querySelector('input')!;
          expect(checkbox.disabled).to.be.true;
        });

        it('should be disabled when disabled property is set', async () => {
          const el = await fixture<CsCheckbox>(html`<cs-checkbox></cs-checkbox>`);
          const checkbox = el.shadowRoot!.querySelector('input')!;

          el.disabled = true;
          await el.updateComplete;

          expect(checkbox.disabled).to.be.true;
        });

        it('should be valid by default', async () => {
          const el = await fixture<CsCheckbox>(html`<cs-checkbox></cs-checkbox>`);
          expect(el.checkValidity()).to.be.true;
        });
      });

      describe('events', () => {
        it('should emit change and input when clicked', async () => {
          const el = await fixture<CsCheckbox>(html`<cs-checkbox></cs-checkbox>`);

          await expectEvent(el, ['change', 'input'], () => el.click());

          expect(el.checked).to.be.true;
        });

        it('should emit change and input when toggled with spacebar', async () => {
          const el = await fixture<CsCheckbox>(html`<cs-checkbox></cs-checkbox>`);

          el.focus();
          await el.updateComplete;
          await expectEvent(el, ['change', 'input'], () => sendKeys({ press: ' ' }));

          expect(el.checked).to.be.true;
        });

        it('should not emit change or input when checked programmatically', async () => {
          const el = await fixture<CsCheckbox>(html`<cs-checkbox></cs-checkbox>`);

          el.addEventListener('change', () => expect.fail('change should not be emitted'));
          el.addEventListener('input', () => expect.fail('input should not be emitted'));
          el.checked = true;
          await el.updateComplete;
          await aTimeout(0);
          el.checked = false;
          await el.updateComplete;
          await aTimeout(0);
        });
      });

      describe('slots', () => {
        it('should render the default slot for label content', async () => {
          const el = await fixture<CsCheckbox>(html`<cs-checkbox>Checkbox Label</cs-checkbox>`);
          const labelSlot = el.shadowRoot!.querySelector<HTMLSlotElement>('slot:not([name])')!;
          expect(labelSlot).to.exist;
        });

        it('should display hint text via the hint attribute', async () => {
          const el = await fixture<CsCheckbox>(html`<cs-checkbox hint="Help text">Checkbox</cs-checkbox>`);
          const hintSlot = el.shadowRoot!.querySelector('[part="hint"]')!;
          expect(hintSlot.textContent).to.contain('Help text');
        });

        it('should display hint text via the hint slot', async () => {
          const el = await fixture<CsCheckbox>(html`
            <cs-checkbox>
              Checkbox
              <span slot="hint">Slotted hint</span>
            </cs-checkbox>
          `);
          const hintSlot = el.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="hint"]')!;
          expect(hintSlot).to.exist;
        });
      });

      describe('keyboard navigation', () => {
        it('should toggle on with Space key', async () => {
          const el = await fixture<CsCheckbox>(html`<cs-checkbox></cs-checkbox>`);
          el.focus();
          await el.updateComplete;
          await sendKeys({ press: ' ' });
          await el.updateComplete;

          expect(el.checked).to.be.true;
        });

        it('should toggle off with Space key', async () => {
          const el = await fixture<CsCheckbox>(html`<cs-checkbox checked></cs-checkbox>`);
          el.focus();
          await el.updateComplete;
          await sendKeys({ press: ' ' });
          await el.updateComplete;

          expect(el.checked).to.be.false;
        });
      });

      describe('form integration', () => {
        it('should submit the correct value when a value is provided', async () => {
          const form = await fixture<HTMLFormElement>(html`
            <form>
              <cs-checkbox name="a" value="1" checked></cs-checkbox>
              <cs-button type="submit">Submit</cs-button>
            </form>
          `);
          const button = form.querySelector('cs-button')!;
          const submitHandler = sinon.spy((event: SubmitEvent) => {
            formData = new FormData(form);
            event.preventDefault();
          });
          let formData: FormData;

          form.addEventListener('submit', submitHandler);
          button.click();

          await waitUntil(() => submitHandler.calledOnce);
          expect(formData!.get('a')).to.equal('1');
        });

        it('should submit "on" when no value is provided', async () => {
          const form = await fixture<HTMLFormElement>(html`
            <form>
              <cs-checkbox name="a" checked></cs-checkbox>
              <cs-button type="submit">Submit</cs-button>
            </form>
          `);
          const button = form.querySelector('cs-button')!;
          const submitHandler = sinon.spy((event: SubmitEvent) => {
            formData = new FormData(form);
            event.preventDefault();
          });
          let formData: FormData;

          form.addEventListener('submit', submitHandler);
          button.click();

          await waitUntil(() => submitHandler.calledOnce);
          expect(formData!.get('a')).to.equal('on');
        });

        it('should not submit a value when unchecked', async () => {
          const form = await fixture<HTMLFormElement>(html`
            <form>
              <cs-checkbox name="a" value="1"></cs-checkbox>
            </form>
          `);
          const formData = new FormData(form);
          expect(formData.get('a')).to.be.null;
        });

        it('should keep its form value when going from checked -> unchecked -> checked', async () => {
          const form = await fixture<HTMLFormElement>(
            html`<form><cs-checkbox name="test" value="myvalue" checked>Checked</cs-checkbox></form>`,
          );
          const checkbox = form.querySelector('cs-checkbox')!;

          expect(checkbox.checked).to.equal(true);
          expect(new FormData(form).get('test')).to.equal('myvalue');

          checkbox.checked = false;
          await checkbox.updateComplete;

          expect(checkbox.checked).to.equal(false);
          expect(new FormData(form).get('test')).to.equal(null);

          checkbox.checked = true;
          await checkbox.updateComplete;

          expect(checkbox.checked).to.equal(true);
          expect(new FormData(form).get('test')).to.equal('myvalue');
        });

        it('should be invalid when setCustomValidity() is called with a non-empty value', async () => {
          const checkbox = await fixture<CsCheckbox>(html`<cs-checkbox></cs-checkbox>`);

          checkbox.setCustomValidity('Invalid selection');
          await checkbox.updateComplete;

          expect(checkbox.checkValidity()).to.be.false;
          expect(checkbox.customStates.has('invalid')).to.be.true;
          expect(checkbox.customStates.has('valid')).to.be.false;

          // user-invalid only appears after interaction
          await clickOnElement(checkbox);
          await checkbox.updateComplete;
          await aTimeout(0);

          expect(checkbox.customStates.has('user-invalid')).to.be.true;
          expect(checkbox.customStates.has('user-valid')).to.be.false;
        });

        it('should be invalid when required and unchecked', async () => {
          const el = await fixture<CsCheckbox>(html`<cs-checkbox required></cs-checkbox>`);
          expect(el.checkValidity()).to.be.false;
        });

        it('should be valid when required and checked', async () => {
          const el = await fixture<CsCheckbox>(html`<cs-checkbox required checked></cs-checkbox>`);
          await el.updateComplete;
          expect(el.checkValidity()).to.be.true;
        });

        it('should be present in form data when using the form attribute and located outside of a <form>', async () => {
          const el = await fixture<HTMLFormElement>(html`
            <div>
              <form id="f">
                <cs-button type="submit">Submit</cs-button>
              </form>
              <cs-checkbox form="f" name="a" value="1" checked></cs-checkbox>
            </div>
          `);
          const form = el.querySelector('form')!;
          const formData = new FormData(form);
          expect(formData.get('a')).to.equal('1');
        });

        it('should reset the element to its initial value on form reset', async () => {
          const form = await fixture<HTMLFormElement>(html`
            <form>
              <cs-checkbox name="a" value="1" checked></cs-checkbox>
              <cs-button type="reset">Reset</cs-button>
            </form>
          `);
          const button = form.querySelector('cs-button')!;
          const checkbox = form.querySelector('cs-checkbox')!;

          checkbox.checked = false;
          await checkbox.updateComplete;
          expect(checkbox.defaultChecked).to.equal(true);

          await new Promise((resolve) => {
            form.addEventListener('reset', resolve, { once: true });
            button.click();
          });
          await checkbox.updateComplete;

          expect(checkbox.checked).to.be.true;

          checkbox.defaultChecked = false;

          setTimeout(() => button.click());
          await oneEvent(form, 'reset');
          await checkbox.updateComplete;

          expect(checkbox.checked).to.be.false;
        });
      });

      describe('CSS parts and states', () => {
        it('should expose CSS parts', async () => {
          const el = await fixture<CsCheckbox>(html`<cs-checkbox hint="Help">Checkbox</cs-checkbox>`);
          expect(el.shadowRoot!.querySelector('[part~="checkbox"]')).to.exist;
          expect(el.shadowRoot!.querySelector('[part="control"]')).to.exist;
          expect(el.shadowRoot!.querySelector('[part="label"]')).to.exist;
          expect(el.shadowRoot!.querySelector('[part="hint"]')).to.exist;
        });

        it('should set :state(checked) when checked', async () => {
          const el = await fixture<CsCheckbox>(html`<cs-checkbox checked></cs-checkbox>`);
          expect(el.customStates.has('checked')).to.be.true;
        });

        it('should not have :state(checked) when unchecked', async () => {
          const el = await fixture<CsCheckbox>(html`<cs-checkbox></cs-checkbox>`);
          expect(el.customStates.has('checked')).to.be.false;
        });

        it('should toggle :state(checked) when clicked', async () => {
          const el = await fixture<CsCheckbox>(html`<cs-checkbox></cs-checkbox>`);
          expect(el.customStates.has('checked')).to.be.false;

          el.click();
          await el.updateComplete;

          expect(el.customStates.has('checked')).to.be.true;
        });

        it('should set :state(disabled) when disabled', async () => {
          const el = await fixture<CsCheckbox>(html`<cs-checkbox disabled></cs-checkbox>`);
          expect(el.customStates.has('disabled')).to.be.true;
        });

        it('should receive validation states even when novalidate is used on the parent form', async () => {
          const el = await fixture<HTMLFormElement>(html`
            <form novalidate><cs-checkbox required></cs-checkbox></form>
          `);
          const checkbox = el.querySelector<CsCheckbox>('cs-checkbox')!;

          expect(checkbox.customStates.has('required')).to.be.true;
          expect(checkbox.customStates.has('optional')).to.be.false;
          expect(checkbox.customStates.has('invalid')).to.be.true;
          expect(checkbox.customStates.has('valid')).to.be.false;
          expect(checkbox.customStates.has('user-invalid')).to.be.false;
          expect(checkbox.customStates.has('user-valid')).to.be.false;
        });

        it('should set :state(user-valid) after user interaction when valid', async () => {
          const el = await fixture<CsCheckbox>(html`<cs-checkbox required></cs-checkbox>`);

          expect(el.customStates.has('user-valid')).to.be.false;
          expect(el.customStates.has('user-invalid')).to.be.false;

          el.click();
          await el.updateComplete;

          expect(el.customStates.has('user-valid')).to.be.true;
          expect(el.customStates.has('user-invalid')).to.be.false;
        });

        it('should set :state(user-invalid) after user interaction when invalid', async () => {
          const el = await fixture<CsCheckbox>(html`<cs-checkbox required checked></cs-checkbox>`);

          el.click();
          await el.updateComplete;

          expect(el.customStates.has('user-invalid')).to.be.true;
          expect(el.customStates.has('user-valid')).to.be.false;
        });
      });

      describe('indeterminate', () => {
        it('should set :state(indeterminate) when indeterminate', async () => {
          const el = await fixture<CsCheckbox>(html`<cs-checkbox indeterminate></cs-checkbox>`);
          expect(el.customStates.has('indeterminate')).to.be.true;
        });

        it('should render indeterminate icon when indeterminate', async () => {
          const el = await fixture<CsCheckbox>(html`<cs-checkbox indeterminate></cs-checkbox>`);
          const indeterminateIcon = el.shadowRoot!.querySelector('[part~="indeterminate-icon"]')!;
          expect(indeterminateIcon).to.exist;
        });

        it('should clear indeterminate state when clicked', async () => {
          const el = await fixture<CsCheckbox>(html`<cs-checkbox indeterminate></cs-checkbox>`);
          expect(el.indeterminate).to.be.true;

          el.click();
          await el.updateComplete;

          expect(el.indeterminate).to.be.false;
          expect(el.checked).to.be.true;
          expect(el.shadowRoot!.querySelector('[part~="indeterminate-icon"]')).to.be.null;
        });

        it('should show check icon instead of indeterminate icon when checked', async () => {
          const el = await fixture<CsCheckbox>(html`<cs-checkbox checked></cs-checkbox>`);
          expect(el.shadowRoot!.querySelector('[part~="checked-icon"]')).to.exist;
          expect(el.shadowRoot!.querySelector('[part~="indeterminate-icon"]')).to.be.null;
        });
      });

      describe('regression tests', () => {
        it('should hide the native input with correct positioning for overflow scroll', async () => {
          // https://github.com/shoelace-style/shoelace/issues/1169
          const el = await fixture<CsCheckbox>(html`<cs-checkbox></cs-checkbox>`);
          const label = el.shadowRoot!.querySelector('label')!;
          const input = el.shadowRoot!.querySelector('.input')!;

          expect(getComputedStyle(label).position).to.equal('relative');
          expect(getComputedStyle(input).position).to.equal('absolute');
        });

        it('should click the inner input when click() is called', async () => {
          const el = await fixture<CsCheckbox>(html`<cs-checkbox></cs-checkbox>`);
          const checkbox = el.shadowRoot!.querySelector('input')!;
          const clickSpy = sinon.spy();

          checkbox.addEventListener('click', clickSpy, { once: true });

          el.click();
          await el.updateComplete;

          expect(clickSpy.called).to.equal(true);
          expect(el.checked).to.equal(true);
        });

        it('should focus the inner input when focus() is called', async () => {
          const el = await fixture<CsCheckbox>(html`<cs-checkbox></cs-checkbox>`);
          const checkbox = el.shadowRoot!.querySelector('input')!;
          const focusSpy = sinon.spy();

          checkbox.addEventListener('focus', focusSpy, { once: true });

          el.focus();
          await el.updateComplete;

          expect(focusSpy.called).to.equal(true);
          expect(el.shadowRoot!.activeElement).to.equal(checkbox);
        });

        it('should blur the inner input when blur() is called', async () => {
          const el = await fixture<CsCheckbox>(html`<cs-checkbox></cs-checkbox>`);
          const checkbox = el.shadowRoot!.querySelector('input')!;
          const blurSpy = sinon.spy();

          checkbox.addEventListener('blur', blurSpy, { once: true });

          el.focus();
          await el.updateComplete;

          el.blur();
          await el.updateComplete;

          expect(blurSpy.called).to.equal(true);
          expect(el.shadowRoot!.activeElement).to.equal(null);
        });

        it('should not jump the page when focusing a checkbox at the bottom of an overflow container', async () => {
          // https://github.com/shoelace-style/shoelace/issues/1169
          const el = await fixture<HTMLDivElement>(html`
            <div style="display: flex; flex-direction: column; overflow: auto; max-height: 400px; gap: 8px;"></div>
          `);

          for (let i = 0; i < 33; i++) {
            el.append(
              Object.assign(document.createElement('cs-checkbox'), {
                textContent: 'Checkbox',
              }),
            );
          }

          await aTimeout(1);

          const checkboxes = el.querySelectorAll<CsCheckbox>('cs-checkbox');
          const lastCheckbox = checkboxes[checkboxes.length - 1];

          expect(window.scrollY).to.equal(0);
          await aTimeout(10);
          lastCheckbox.focus();
          await aTimeout(10);
          expect(window.scrollY).to.equal(0);
        });

        // https://github.com/shoelace-style/webawesome/issues/2602
        it('Should properly set value when moving from `disabled` -> `not disabled` -> `disabled`', async () => {
          const form = await fixture<HTMLFormElement>(html`
            <form id="f"><cs-checkbox name="x" value="1"></cs-checkbox></form>
          `);

          const checkbox = form.querySelector<CsCheckbox>('cs-checkbox')!;
          const fd = () => new FormData(form);

          expect(checkbox.checked).to.equal(false);
          expect(fd().get('x')).to.be.null;

          checkbox.disabled = true;
          await checkbox.updateComplete;
          checkbox.disabled = false;
          await checkbox.updateComplete;

          expect(checkbox.checked).to.equal(false);
          expect(fd().get('x')).to.be.null;
        });

        // https://github.com/shoelace-style/webawesome/issues/2602
        it('Should properly set value when moving from `disabled` -> `not disabled` -> `disabled` when in a `<fieldset>`', async () => {
          const form = await fixture<HTMLFormElement>(html`
            <form id="f">
              <fieldset>
                <cs-checkbox name="x" value="1"></cs-checkbox>
              </fieldset>
            </form>
          `);

          const checkbox = form.querySelector<CsCheckbox>('cs-checkbox')!;
          const fieldset = form.querySelector<HTMLFieldSetElement>('fieldset')!;
          const fd = () => new FormData(form);

          expect(checkbox.checked).to.equal(false);
          expect(fd().get('x')).to.be.null;

          fieldset.disabled = true;
          await checkbox.updateComplete;
          fieldset.disabled = false;
          await checkbox.updateComplete;

          expect(checkbox.checked).to.equal(false);
          expect(fd().get('x')).to.be.null;
        });
      });
    });
  }
});
