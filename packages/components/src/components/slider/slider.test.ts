import { expect, oneEvent } from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import { html } from 'lit';
import { expectEvent } from '../../internal/test/expect-event.js';
import { fixtures } from '../../internal/test/fixture.js';
import { runFormControlBaseTests } from '../../internal/test/form-control-base-tests.js';
import { clickOnElement } from '../../internal/test/pointer-utilities.js';
import { serialize } from '../../utilities/form.js';
import type CsSlider from './slider.js';

describe('<cs-slider>', () => {
  runFormControlBaseTests({ tagName: 'cs-slider', formValue: { dirtyValue: 42 } });

  for (const fixture of fixtures) {
    describe(`with "${fixture.type}" rendering`, () => {
      describe('accessibility', () => {
        it('should pass accessibility tests', async () => {
          const el = await fixture<CsSlider>(html`<cs-slider label="Volume"></cs-slider>`);
          await expect(el).to.be.accessible();
        });

        it('should have correct aria attributes when disabled', async () => {
          const el = await fixture<CsSlider>(html`<cs-slider disabled></cs-slider>`);
          const input = el.shadowRoot!.querySelector<HTMLElement>("[role='slider']")!;
          expect(el.matches(':disabled')).to.be.true;
          expect(input.getAttribute('aria-disabled')).to.equal('true');
        });
      });

      describe('properties', () => {
        it('should have correct default property values', async () => {
          const el = await fixture<CsSlider>(html`<cs-slider></cs-slider>`);
          expect(el.name).to.not.be.ok;
          expect(el.value).to.equal(0);
          expect(el.label).to.equal('');
          expect(el.hint).to.equal('');
          expect(el.disabled).to.be.false;
          expect(el.checkValidity()).to.be.true;
          expect(el.min).to.equal(0);
          expect(el.max).to.equal(100);
          expect(el.step).to.equal(1);
          expect(el.tooltipPlacement).to.equal('top');
          expect(el.defaultValue).to.equal(0);
        });

        it('should set value by attribute', async () => {
          const el = await fixture<CsSlider>(html`<cs-slider value="50"></cs-slider>`);
          expect(el.value).to.equal(50);
        });

        it('should clamp value to min/max range', async () => {
          const el = await fixture<CsSlider>(html`<cs-slider min="10" max="90" value="200"></cs-slider>`);
          expect(el.value).to.equal(90);
        });
      });

      describe('events', () => {
        it('should emit change and input when pressing ArrowRight', async () => {
          const el = await fixture<CsSlider>(html`<cs-slider value="50"></cs-slider>`);

          await expectEvent(el, ['change', 'input'], async () => {
            el.focus();
            await sendKeys({ press: 'ArrowRight' });
            await el.updateComplete;
          });

          expect(el.value).to.equal(51);
        });

        it('should not emit change or input when changing the value programmatically', async () => {
          const el = await fixture<CsSlider>(html`<cs-slider value="0"></cs-slider>`);

          el.addEventListener('change', () => expect.fail('change should not be emitted'));
          el.addEventListener('input', () => expect.fail('input should not be emitted'));
          el.value = 50;
          await el.updateComplete;
        });

        it('should not emit change or input when stepUp() is called programmatically', async () => {
          const el = await fixture<CsSlider>(html`<cs-slider step="2" value="2"></cs-slider>`);

          el.addEventListener('change', () => expect.fail('change should not be emitted'));
          el.addEventListener('input', () => expect.fail('input should not be emitted'));
          el.stepUp();
          await el.updateComplete;
        });

        it('should not emit change or input when stepDown() is called programmatically', async () => {
          const el = await fixture<CsSlider>(html`<cs-slider step="2" value="2"></cs-slider>`);

          el.addEventListener('change', () => expect.fail('change should not be emitted'));
          el.addEventListener('input', () => expect.fail('input should not be emitted'));
          el.stepDown();
          await el.updateComplete;
        });
      });

      describe('keyboard navigation', () => {
        it('should increase value with ArrowRight', async () => {
          const el = await fixture<CsSlider>(html`<cs-slider value="50"></cs-slider>`);
          el.focus();
          await sendKeys({ press: 'ArrowRight' });
          await el.updateComplete;
          expect(el.value).to.equal(51);
        });

        it('should decrease value with ArrowLeft', async () => {
          const el = await fixture<CsSlider>(html`<cs-slider value="50"></cs-slider>`);
          el.focus();
          await sendKeys({ press: 'ArrowLeft' });
          await el.updateComplete;
          expect(el.value).to.equal(49);
        });

        it('should increase value with ArrowUp', async () => {
          const el = await fixture<CsSlider>(html`<cs-slider value="50"></cs-slider>`);
          el.focus();
          await sendKeys({ press: 'ArrowUp' });
          await el.updateComplete;
          expect(el.value).to.equal(51);
        });

        it('should decrease value with ArrowDown', async () => {
          const el = await fixture<CsSlider>(html`<cs-slider value="50"></cs-slider>`);
          el.focus();
          await sendKeys({ press: 'ArrowDown' });
          await el.updateComplete;
          expect(el.value).to.equal(49);
        });

        it('should set value to min with Home', async () => {
          const el = await fixture<CsSlider>(html`<cs-slider value="50"></cs-slider>`);
          el.focus();
          await sendKeys({ press: 'Home' });
          await el.updateComplete;
          expect(el.value).to.equal(0);
        });

        it('should set value to max with End', async () => {
          const el = await fixture<CsSlider>(html`<cs-slider value="50"></cs-slider>`);
          el.focus();
          await sendKeys({ press: 'End' });
          await el.updateComplete;
          expect(el.value).to.equal(100);
        });
      });

      describe('step', () => {
        it('should increment by step when stepUp() is called', async () => {
          const el = await fixture<CsSlider>(html`<cs-slider step="2" value="2"></cs-slider>`);
          el.stepUp();
          await el.updateComplete;
          expect(el.value).to.equal(4);
        });

        it('should decrement by step when stepDown() is called', async () => {
          const el = await fixture<CsSlider>(html`<cs-slider step="2" value="2"></cs-slider>`);
          el.stepDown();
          await el.updateComplete;
          expect(el.value).to.equal(0);
        });

        it('should be valid when the value sits on a fractional step grid', async () => {
          const el = await fixture<CsSlider>(html`<cs-slider min="0" max="1" step="0.1" value="0.3"></cs-slider>`);
          expect(el.validity.stepMismatch).to.be.false;
          expect(el.checkValidity()).to.be.true;
        });

        it('should be valid when a range slider sits on a fractional step grid', async () => {
          const el = await fixture<CsSlider>(
            html`<cs-slider range min="0" max="1" step="0.1" min-value="0.1" max-value="0.7"></cs-slider>`,
          );
          expect(el.validity.stepMismatch).to.be.false;
          expect(el.checkValidity()).to.be.true;
        });
      });

      describe('form integration', () => {
        it('should serialize its name and value with FormData', async () => {
          const form = await fixture<HTMLFormElement>(html`<form><cs-slider name="a" value="1"></cs-slider></form>`);
          const formData = new FormData(form);
          expect(formData.get('a')).to.equal('1');
        });

        it('should serialize its name and value with JSON', async () => {
          const form = await fixture<HTMLFormElement>(html`<form><cs-slider name="a" value="1"></cs-slider></form>`);
          const json = serialize(form);
          expect(json.a).to.equal('1');
        });

        it('should be invalid when setCustomValidity() is called with a non-empty value', async () => {
          const slider = await fixture<CsSlider>(html`<cs-slider></cs-slider>`);

          slider.setCustomValidity('Invalid selection');
          await slider.updateComplete;

          expect(slider.checkValidity()).to.be.false;
          expect(slider.customStates.has('invalid')).to.be.true;
          expect(slider.customStates.has('valid')).to.be.false;
          expect(slider.customStates.has('user-invalid')).to.be.false;
          expect(slider.customStates.has('user-valid')).to.be.false;

          await clickOnElement(slider);
          await slider.updateComplete;
          slider.blur();
          await slider.updateComplete;

          expect(slider.customStates.has('user-invalid')).to.be.true;
          expect(slider.customStates.has('user-valid')).to.be.false;
        });

        it('should receive validation attributes ("states") even when novalidate is used on the parent form', async () => {
          const el = await fixture<HTMLFormElement>(html`<form novalidate><cs-slider></cs-slider></form>`);
          const slider = el.querySelector<CsSlider>('cs-slider')!;

          slider.setCustomValidity('Invalid value');
          await slider.updateComplete;

          expect(slider.customStates.has('invalid')).to.be.true;
          expect(slider.customStates.has('valid')).to.be.false;
          expect(slider.customStates.has('user-invalid')).to.be.false;
          expect(slider.customStates.has('user-valid')).to.be.false;
        });

        it('should be present in form data when using the form attribute and located outside of a <form>', async () => {
          const el = await fixture<HTMLFormElement>(html`
            <div>
              <form id="f">
                <cs-button type="submit">Submit</cs-button>
              </form>
              <cs-slider form="f" name="a" value="50"></cs-slider>
            </div>
          `);
          const form = el.querySelector('form')!;
          const formData = new FormData(form);

          expect(formData.get('a')).to.equal('50');
        });

        it('should reset the element to its initial value', async () => {
          const form = await fixture<HTMLFormElement>(html`
            <form>
              <cs-slider name="a" value="99"></cs-slider>
              <cs-button type="reset">Reset</cs-button>
            </form>
          `);
          const button = form.querySelector('cs-button')!;
          const input = form.querySelector('cs-slider')!;
          input.value = 80;

          await input.updateComplete;

          setTimeout(() => button.click());
          await oneEvent(form, 'reset');
          await input.updateComplete;

          expect(input.value).to.equal(99);

          input.defaultValue = 0;

          setTimeout(() => button.click());
          await oneEvent(form, 'reset');
          await input.updateComplete;

          expect(input.value).to.equal(0);
        });
      });

      describe('regression tests', () => {
        // Inherited from upstream: the range thumbs built their accessible name from `this.label`, so a
        // consumer who used the `label` *slot* got thumbs announced as a hard-coded "Minimum value" with
        // no reference to the visible label. They reference the rendered label now. Nothing tested this,
        // which is why it survived the fork.
        it('should name range thumbs from a slotted label, not the attribute', async () => {
          const el = await fixture<CsSlider>(
            html`<cs-slider range min="0" max="10" min-value="2" max-value="8">
              <span slot="label">Volume</span>
            </cs-slider>`,
          );

          // Accessible-name computation walks the *flattened* tree, so a filled slot contributes its
          // assigned nodes. `textContent` on the shadow element returns the slot's fallback instead,
          // which is exactly the difference this fix turns on.
          const flatText = (node: Element): string =>
            Array.from(node.childNodes)
              .map((child) =>
                child instanceof HTMLSlotElement
                  ? child
                      .assignedNodes({ flatten: true })
                      .map((assigned) => assigned.textContent ?? '')
                      .join('')
                  : (child.textContent ?? ''),
              )
              .join('')
              .trim();

          for (const [thumb, bound] of [
            ['thumb-min', 'minimum value'],
            ['thumb-max', 'maximum value'],
          ]) {
            const target = el.shadowRoot!.querySelector(`#${thumb}`)!;
            expect(target.getAttribute('aria-label'), `${thumb} must not carry its own name`).to.be.null;

            const ids = target.getAttribute('aria-labelledby')!.split(/\s+/);
            const referenced = ids.map((id) => el.shadowRoot!.querySelector(`#${id}`));
            expect(referenced.every(Boolean), `${thumb} references a missing element`).to.be.true;

            const name = referenced.map((node) => flatText(node!)).join(' ');
            expect(name, `${thumb} accessible name`).to.contain('Volume');
            expect(name, `${thumb} accessible name`).to.contain(bound);
          }
        });

        it('should respond to attribute changes if the value has not changed', async () => {
          const el = await fixture<CsSlider>(html`<cs-slider step="2" value="2"></cs-slider>`);
          expect(el.value).to.equal(2);
          el.setAttribute('value', '4');
          await el.updateComplete;
          expect(el.value).to.equal(4);
        });

        // https://github.com/shoelace-style/webawesome/issues/1273
        it('should not respond to attribute changes if the value has changed', async () => {
          const el = await fixture<CsSlider>(html`<cs-slider step="2" value="2"></cs-slider>`);
          expect(el.value).to.equal(2);
          el.value = 6;
          await el.updateComplete;
          el.setAttribute('value', '4');
          await el.updateComplete;
          expect(el.value).to.equal(6);
          expect(el.defaultValue).to.equal(4);
        });
      });
    });
  }
});
