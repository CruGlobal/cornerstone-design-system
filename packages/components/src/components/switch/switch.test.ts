import { aTimeout, expect, oneEvent, waitUntil } from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import { html } from 'lit';
import sinon from 'sinon';
import { expectEvent } from '../../internal/test/expect-event.js';
import { fixtures } from '../../internal/test/fixture.js';
import { runFormControlBaseTests } from '../../internal/test/form-control-base-tests.js';
import type CsSwitch from './switch.js';

describe('<cs-switch>', () => {
  runFormControlBaseTests({ tagName: 'cs-switch', formValue: { property: 'checked' } });

  for (const fixture of fixtures) {
    describe(`with "${fixture.type}" rendering`, () => {
      describe('accessibility', () => {
        it('should pass accessibility tests', async () => {
          const el = await fixture<CsSwitch>(html`<cs-switch>Switch</cs-switch>`);
          await expect(el).to.be.accessible();
        });

        it('should have role="switch" on the internal input', async () => {
          const el = await fixture<CsSwitch>(html`<cs-switch>Switch</cs-switch>`);
          const input = el.shadowRoot!.querySelector('input')!;
          expect(input.getAttribute('role')).to.equal('switch');
        });

        it('should set aria-checked to match checked state', async () => {
          const el = await fixture<CsSwitch>(html`<cs-switch>Switch</cs-switch>`);
          const input = el.shadowRoot!.querySelector('input')!;

          expect(input.getAttribute('aria-checked')).to.equal('false');

          el.checked = true;
          await el.updateComplete;

          expect(input.getAttribute('aria-checked')).to.equal('true');
        });
      });

      describe('properties', () => {
        it('should have correct default property values', async () => {
          const el = await fixture<CsSwitch>(html`<cs-switch></cs-switch>`);

          expect(el.name).to.equal(null);
          expect(el.value).to.equal('on');
          expect(el.title).to.equal('');
          expect(el.disabled).to.be.false;
          expect(el.required).to.be.false;
          expect(el.checked).to.be.false;
          expect(el.defaultChecked).to.be.false;
          expect(el.hint).to.equal('');
          expect(el.size).to.equal('m');
        });

        it('should reflect the checked attribute as defaultChecked', async () => {
          const el = await fixture<CsSwitch>(html`<cs-switch checked></cs-switch>`);
          expect(el.defaultChecked).to.be.true;
          expect(el.checked).to.be.true;
        });

        it('should default value to "on" when no value attribute is set', async () => {
          const el = await fixture<CsSwitch>(html`<cs-switch></cs-switch>`);
          expect(el.value).to.equal('on');
        });

        it('should return the value regardless of checked state', async () => {
          const el = await fixture<CsSwitch>(html`<cs-switch value="myvalue" checked></cs-switch>`);

          expect(el.checked).to.be.true;
          expect(el.value).to.equal('myvalue');

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
          const el = await fixture<CsSwitch>(html`<cs-switch title="Test"></cs-switch>`);
          const input = el.shadowRoot!.querySelector('input')!;
          expect(input.title).to.equal('Test');
        });

        it('should be disabled with the disabled attribute', async () => {
          const el = await fixture<CsSwitch>(html`<cs-switch disabled></cs-switch>`);
          const input = el.shadowRoot!.querySelector<HTMLInputElement>('input')!;
          expect(input.disabled).to.be.true;
        });

        it('should update checked when set programmatically', async () => {
          const el = await fixture<CsSwitch>(html`<cs-switch></cs-switch>`);
          expect(el.checked).to.equal(false);

          el.checked = true;
          await el.updateComplete;

          expect(el.checked).to.equal(true);
        });

        it('should be valid by default', async () => {
          const el = await fixture<CsSwitch>(html`<cs-switch></cs-switch>`);
          expect(el.checkValidity()).to.be.true;
        });
      });

      describe('events', () => {
        it('should emit change and input when clicked', async () => {
          const el = await fixture<CsSwitch>(html`<cs-switch></cs-switch>`);

          await expectEvent(el, ['change', 'input'], () => el.click());

          expect(el.checked).to.be.true;
        });

        it('should emit change and input when toggled with spacebar', async () => {
          const el = await fixture<CsSwitch>(html`<cs-switch></cs-switch>`);

          el.focus();
          await expectEvent(el, ['change', 'input'], () => sendKeys({ press: ' ' }));

          expect(el.checked).to.be.true;
        });

        it('should emit change and input when toggled with the right arrow', async () => {
          const el = await fixture<CsSwitch>(html`<cs-switch></cs-switch>`);

          el.focus();
          await expectEvent(el, ['change', 'input'], () => sendKeys({ press: 'ArrowRight' }));

          expect(el.checked).to.be.true;
        });

        it('should emit change and input when toggled with the left arrow', async () => {
          const el = await fixture<CsSwitch>(html`<cs-switch checked></cs-switch>`);

          el.focus();
          await expectEvent(el, ['change', 'input'], () => sendKeys({ press: 'ArrowLeft' }));

          expect(el.checked).to.be.false;
        });

        it('should not emit change or input when checked is set by JavaScript', async () => {
          const el = await fixture<CsSwitch>(html`<cs-switch></cs-switch>`);
          el.addEventListener('change', () => expect.fail('change incorrectly emitted'));
          el.addEventListener('input', () => expect.fail('input incorrectly emitted'));

          el.checked = true;
          await el.updateComplete;
          el.checked = false;
          await el.updateComplete;
        });
      });

      describe('slots', () => {
        it('should render the default slot for label content', async () => {
          const el = await fixture<CsSwitch>(html`<cs-switch>Switch Label</cs-switch>`);
          const labelSlot = el.shadowRoot!.querySelector<HTMLSlotElement>('slot:not([name])')!;
          expect(labelSlot).to.exist;
        });

        it('should display hint text via the hint attribute', async () => {
          const el = await fixture<CsSwitch>(html`<cs-switch hint="Help text">Switch</cs-switch>`);
          const hintSlot = el.shadowRoot!.querySelector('[part="hint"]')!;
          expect(hintSlot.textContent).to.contain('Help text');
        });

        it('should display hint text via the hint slot', async () => {
          const el = await fixture<CsSwitch>(html`
            <cs-switch>
              Switch
              <span slot="hint">Slotted hint</span>
            </cs-switch>
          `);
          const hintSlot = el.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="hint"]')!;
          expect(hintSlot).to.exist;
        });
      });

      describe('keyboard navigation', () => {
        it('should toggle on with Space key', async () => {
          const el = await fixture<CsSwitch>(html`<cs-switch></cs-switch>`);
          el.focus();
          await sendKeys({ press: ' ' });
          await el.updateComplete;

          expect(el.checked).to.be.true;
        });

        it('should toggle off with Space key', async () => {
          const el = await fixture<CsSwitch>(html`<cs-switch checked></cs-switch>`);
          el.focus();
          await sendKeys({ press: ' ' });
          await el.updateComplete;

          expect(el.checked).to.be.false;
        });

        it('should turn on with ArrowRight key', async () => {
          const el = await fixture<CsSwitch>(html`<cs-switch></cs-switch>`);
          el.focus();
          await sendKeys({ press: 'ArrowRight' });
          await el.updateComplete;

          expect(el.checked).to.be.true;
        });

        it('should turn off with ArrowLeft key', async () => {
          const el = await fixture<CsSwitch>(html`<cs-switch checked></cs-switch>`);
          el.focus();
          await sendKeys({ press: 'ArrowLeft' });
          await el.updateComplete;

          expect(el.checked).to.be.false;
        });
      });

      describe('form integration', () => {
        it('should submit the correct value when a value is provided', async () => {
          const form = await fixture<HTMLFormElement>(html`
            <form>
              <cs-switch name="a" value="1" checked></cs-switch>
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
              <cs-switch name="a" checked></cs-switch>
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
              <cs-switch name="a" value="1"></cs-switch>
            </form>
          `);
          const formData = new FormData(form);
          expect(formData.get('a')).to.be.null;
        });

        it('should show a constraint validation error when setCustomValidity() is called', async () => {
          const form = await fixture<HTMLFormElement>(html`
            <form>
              <cs-switch name="a" value="1" checked></cs-switch>
              <cs-button type="submit">Submit</cs-button>
            </form>
          `);
          const button = form.querySelector('cs-button')!;
          const csSwitch = form.querySelector('cs-switch')!;
          const submitHandler = sinon.spy((event: SubmitEvent) => event.preventDefault());

          csSwitch.setCustomValidity('Invalid selection');
          form.addEventListener('submit', submitHandler);
          button.click();
          await aTimeout(100);

          expect(submitHandler).to.not.have.been.called;
        });

        it('should be invalid when required and unchecked', async () => {
          const el = await fixture<CsSwitch>(html`<cs-switch required></cs-switch>`);
          expect(el.checkValidity()).to.be.false;
        });

        it('should be valid when required and checked', async () => {
          const el = await fixture<CsSwitch>(html`<cs-switch required checked></cs-switch>`);
          expect(el.checkValidity()).to.be.true;
        });

        it('should be present in form data when using the form attribute and located outside of a <form>', async () => {
          const el = await fixture<HTMLFormElement>(html`
            <div>
              <form id="f">
                <cs-button type="submit">Submit</cs-button>
              </form>
              <cs-switch form="f" name="a" value="1" checked></cs-switch>
            </div>
          `);
          const form = el.querySelector('form')!;
          const formData = new FormData(form);
          expect(formData.get('a')).to.equal('1');
        });

        it('should reset the element to its initial value on form reset', async () => {
          const form = await fixture<HTMLFormElement>(html`
            <form>
              <cs-switch name="a" value="1" checked></cs-switch>
              <cs-button type="reset">Reset</cs-button>
            </form>
          `);
          const button = form.querySelector('cs-button')!;
          const switchEl = form.querySelector('cs-switch')!;

          switchEl.checked = false;
          await switchEl.updateComplete;

          setTimeout(() => button.click());
          await oneEvent(form, 'reset');
          await switchEl.updateComplete;

          expect(switchEl.checked).to.be.true;

          switchEl.defaultChecked = false;

          setTimeout(() => button.click());
          await oneEvent(form, 'reset');
          await switchEl.updateComplete;

          expect(switchEl.checked).to.be.false;
        });
      });

      describe('CSS parts and states', () => {
        it('should expose CSS parts', async () => {
          const el = await fixture<CsSwitch>(html`<cs-switch hint="Help">Switch</cs-switch>`);
          expect(el.shadowRoot!.querySelector('[part~="switch"]')).to.exist;
          expect(el.shadowRoot!.querySelector('[part="control"]')).to.exist;
          expect(el.shadowRoot!.querySelector('[part="thumb"]')).to.exist;
          expect(el.shadowRoot!.querySelector('[part="label"]')).to.exist;
          expect(el.shadowRoot!.querySelector('[part="hint"]')).to.exist;
        });

        it('should set :state(checked) when checked', async () => {
          const el = await fixture<CsSwitch>(html`<cs-switch checked></cs-switch>`);
          expect(el.customStates.has('checked')).to.be.true;
        });

        it('should not have :state(checked) when unchecked', async () => {
          const el = await fixture<CsSwitch>(html`<cs-switch></cs-switch>`);
          expect(el.customStates.has('checked')).to.be.false;
        });

        it('should toggle :state(checked) when clicked', async () => {
          const el = await fixture<CsSwitch>(html`<cs-switch></cs-switch>`);
          expect(el.customStates.has('checked')).to.be.false;

          el.click();
          await el.updateComplete;

          expect(el.customStates.has('checked')).to.be.true;
        });

        it('should receive validation states even when novalidate is used on the parent form', async () => {
          const el = await fixture<HTMLFormElement>(html`<form novalidate><cs-switch required></cs-switch></form>`);
          const csSwitch = el.querySelector<CsSwitch>('cs-switch')!;

          expect(csSwitch.customStates.has('required')).to.be.true;
          expect(csSwitch.customStates.has('optional')).to.be.false;
          expect(csSwitch.customStates.has('invalid')).to.be.true;
          expect(csSwitch.customStates.has('valid')).to.be.false;
          expect(csSwitch.customStates.has('user-invalid')).to.be.false;
          expect(csSwitch.customStates.has('user-valid')).to.be.false;
        });

        it('should set :state(user-valid) after user interaction when valid', async () => {
          const el = await fixture<CsSwitch>(html`<cs-switch required></cs-switch>`);

          // Initially no user states
          expect(el.customStates.has('user-valid')).to.be.false;
          expect(el.customStates.has('user-invalid')).to.be.false;

          // Click to check (satisfies required)
          el.click();
          await el.updateComplete;

          expect(el.customStates.has('user-valid')).to.be.true;
          expect(el.customStates.has('user-invalid')).to.be.false;
        });

        it('should set :state(user-invalid) after user interaction when invalid', async () => {
          const el = await fixture<CsSwitch>(html`<cs-switch required checked></cs-switch>`);

          // Click to uncheck (violates required)
          el.click();
          await el.updateComplete;

          expect(el.customStates.has('user-invalid')).to.be.true;
          expect(el.customStates.has('user-valid')).to.be.false;
        });
      });

      describe('regression tests', () => {
        it('should hide the native input with correct positioning for overflow scroll', async () => {
          // https://github.com/shoelace-style/shoelace/issues/1169
          const el = await fixture<CsSwitch>(html`<cs-switch></cs-switch>`);
          const control = el.shadowRoot!.querySelector('.switch')!;
          const input = el.shadowRoot!.querySelector('.input')!;

          expect(getComputedStyle(control).position).to.equal('relative');
          expect(getComputedStyle(input).position).to.equal('absolute');
        });

        it('should not jump the page when focusing a switch at the bottom of an overflow container', async () => {
          // https://github.com/shoelace-style/shoelace/issues/1169
          const el = await fixture<HTMLDivElement>(html`
            <div style="display: flex; flex-direction: column; overflow: auto; max-height: 400px;"></div>
          `);

          const switchElements = Array.from({ length: 60 }, () =>
            Object.assign(document.createElement('cs-switch'), {
              textContent: 'Switch',
            }),
          );

          switchElements.forEach((switchEl) => {
            el.append(switchEl);
          });

          await aTimeout(1);

          const switches = el.querySelectorAll<CsSwitch>('cs-switch');
          const lastSwitch = switches[switches.length - 1];

          expect(window.scrollY).to.equal(0);
          await aTimeout(10);
          lastSwitch.focus();
          await aTimeout(10);
          expect(window.scrollY).to.equal(0);
        });

        // https://github.com/shoelace-style/webawesome/issues/2602
        it('Should properly set value when moving from `disabled` -> `not disabled` -> `disabled`', async () => {
          const form = await fixture<HTMLFormElement>(html`
            <form id="f"><cs-switch name="x" value="1"></cs-switch></form>
          `);

          const switchEl = form.querySelector<CsSwitch>('cs-switch')!;
          const fd = () => new FormData(form);

          expect(switchEl.checked).to.equal(false);
          expect(fd().get('x')).to.be.null;

          switchEl.disabled = true;
          await switchEl.updateComplete;
          switchEl.disabled = false;
          await switchEl.updateComplete;

          expect(switchEl.checked).to.equal(false);
          expect(fd().get('x')).to.be.null;
        });

        // https://github.com/shoelace-style/webawesome/issues/2602
        it('Should properly set value when moving from `disabled` -> `not disabled` -> `disabled` when in a `<fieldset>`', async () => {
          const form = await fixture<HTMLFormElement>(html`
            <form id="f">
              <fieldset>
                <cs-switch name="x" value="1"></cs-switch>
              </fieldset>
            </form>
          `);

          const switchEl = form.querySelector<CsSwitch>('cs-switch')!;
          const fieldset = form.querySelector<HTMLFieldSetElement>('fieldset')!;
          const fd = () => new FormData(form);

          expect(switchEl.checked).to.equal(false);
          expect(fd().get('x')).to.be.null;

          fieldset.disabled = true;
          await switchEl.updateComplete;
          fieldset.disabled = false;
          await switchEl.updateComplete;

          expect(switchEl.checked).to.equal(false);
          expect(fd().get('x')).to.be.null;
        });
      });
    });
  }
});
