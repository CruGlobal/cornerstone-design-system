import { aTimeout, expect, oneEvent, waitUntil } from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import { html } from 'lit';
import sinon from 'sinon';
import { fixtures } from '../../internal/test/fixture.js';
import { runFormControlBaseTests } from '../../internal/test/form-control-base-tests.js';
import { clickOnElement, dragElement } from '../../internal/test/pointer-utilities.js';
import { serialize } from '../../utilities/form.js';
import type CsPopover from '../popover/popover.js';
import type CsColorPicker from './color-picker.js';

describe('<cs-color-picker>', () => {
  runFormControlBaseTests({ tagName: 'cs-color-picker', formValue: { dirtyValue: '#ff0000' } });

  for (const fixture of fixtures) {
    describe(`with "${fixture.type}" rendering`, () => {
      describe('accessibility', () => {
        it('should pass accessibility tests', async () => {
          const el = await fixture<CsColorPicker>(
            html`<cs-color-picker label="Brand colour" value="#000000"></cs-color-picker>`,
          );
          await expect(el).to.be.accessible();
        });
      });

      describe('properties', () => {
        it('should display a color when an initial value is provided', async () => {
          const el = await fixture<CsColorPicker>(html` <cs-color-picker value="#000"></cs-color-picker> `);
          const trigger = el.shadowRoot!.querySelector<HTMLButtonElement>('[part~="trigger"]');
          expect(trigger?.style.color).to.equal('rgb(0, 0, 0)');
        });

        it('should ignore alpha in the initial value when opacity is not enabled', async () => {
          const el = await fixture<CsColorPicker>(html` <cs-color-picker value="#ff000080"></cs-color-picker> `);
          const trigger = el.shadowRoot!.querySelector<HTMLButtonElement>('[part~="trigger"]');
          expect(el.value).to.equal('#ff0000');
          expect(trigger?.style.color).to.equal('rgb(255, 0, 0)');
        });

        it('should show opacity slider when opacity is enabled', async () => {
          const el = await fixture<CsColorPicker>(html` <cs-color-picker opacity></cs-color-picker> `);
          const opacitySlider = el.shadowRoot!.querySelector('[part*="opacity-slider"]')!;
          expect(opacitySlider).to.exist;
        });

        it('should render the correct swatches when passing a string of color values', async () => {
          const el = await fixture<CsColorPicker>(html`
            <cs-color-picker swatches="red; #008000; rgb(0,0,255);"></cs-color-picker>
          `);
          const swatches = [...el.shadowRoot!.querySelectorAll('[part~="swatch"] > div')];

          expect(swatches.length).to.equal(3);
          expect(getComputedStyle(swatches[0]).backgroundColor).to.equal('rgb(255, 0, 0)');
          expect(getComputedStyle(swatches[1]).backgroundColor).to.equal('rgb(0, 128, 0)');
          expect(getComputedStyle(swatches[2]).backgroundColor).to.equal('rgb(0, 0, 255)');
        });

        it('should render the correct swatches when passing an array of color values', async () => {
          const el = await fixture<CsColorPicker>(html` <cs-color-picker></cs-color-picker> `);
          el.swatches = ['red', '#008000', 'rgb(0,0,255)'];
          await el.updateComplete;

          const swatches = [...el.shadowRoot!.querySelectorAll('[part~="swatch"] > div')];

          expect(swatches.length).to.equal(3);
          expect(getComputedStyle(swatches[0]).backgroundColor).to.equal('rgb(255, 0, 0)');
          expect(getComputedStyle(swatches[1]).backgroundColor).to.equal('rgb(0, 128, 0)');
          expect(getComputedStyle(swatches[2]).backgroundColor).to.equal('rgb(0, 0, 255)');
        });
      });

      describe('events', () => {
        it('should not emit change or input when the value is changed programmatically', async () => {
          const el = await fixture<CsColorPicker>(html` <cs-color-picker></cs-color-picker> `);
          const color = 'rgb(255, 204, 0)';

          el.addEventListener('change', () => expect.fail('change should not be emitted'));
          el.addEventListener('input', () => expect.fail('change should not be emitted'));
          el.value = color;
          await el.updateComplete;
        });

        it('should emit change and input when the color grid selector is moved', async () => {
          const el = await fixture<CsColorPicker>(html` <cs-color-picker></cs-color-picker> `);
          const trigger = el.shadowRoot!.querySelector<HTMLButtonElement>('[part~="trigger"]')!;
          const grid = el.shadowRoot!.querySelector<HTMLElement>('[part~="grid"]')!;
          const changeHandler = sinon.spy();
          const inputHandler = sinon.spy();

          el.addEventListener('change', changeHandler);
          el.addEventListener('input', inputHandler);

          await clickOnElement(trigger); // open the dropdown
          await aTimeout(200); // wait for the dropdown to open
          await el.updateComplete;

          // Simulate a drag event. "change" should not fire until we stop dragging.
          await dragElement(grid, 2, 0, {
            afterMouseDown: () => {
              expect(changeHandler).to.have.not.been.called;
              expect(inputHandler).to.have.been.calledOnce;
            },
            afterMouseMove: () => {
              expect(inputHandler).to.have.been.calledTwice;
            },
          });

          expect(changeHandler).to.have.been.calledOnce;
          expect(inputHandler).to.have.been.calledTwice;
        });

        it('should emit change and input when the opacity slider is moved', async () => {
          const el = await fixture<CsColorPicker>(html` <cs-color-picker opacity></cs-color-picker> `);
          const trigger = el.shadowRoot!.querySelector<HTMLButtonElement>('[part~="trigger"]')!;
          const slider = el.shadowRoot!.querySelector<HTMLElement>('[part~="opacity-slider"]')!;
          const changeHandler = sinon.spy();
          const inputHandler = sinon.spy();

          el.addEventListener('change', changeHandler);
          el.addEventListener('input', inputHandler);

          await clickOnElement(trigger); // open the dropdown
          await aTimeout(200); // wait for the dropdown to open

          // Simulate a drag event. "change" should not fire until we stop dragging.
          await dragElement(slider, 2, 0, {
            afterMouseDown: () => {
              expect(changeHandler).to.have.not.been.called;
              expect(inputHandler).to.have.been.calledOnce;
            },
            afterMouseMove: () => {
              expect(inputHandler).to.have.been.calledTwice;
            },
          });

          await el.updateComplete;

          expect(changeHandler).to.have.been.calledOnce;
          expect(inputHandler).to.have.been.calledTwice;
        });

        it('should emit change and input when toggling the format', async () => {
          const el = await fixture<CsColorPicker>(html` <cs-color-picker value="#fff"></cs-color-picker> `);
          const trigger = el.shadowRoot!.querySelector<HTMLButtonElement>('[part~="trigger"]')!;
          const formatButton = el.shadowRoot!.querySelector<HTMLElement>('[part~="format-button"]')!;
          const changeHandler = sinon.spy();
          const inputHandler = sinon.spy();

          el.addEventListener('change', changeHandler);
          el.addEventListener('input', inputHandler);

          await clickOnElement(trigger); // open the dropdown
          await aTimeout(200); // wait for the dropdown to open
          await clickOnElement(formatButton); // click on the format button
          await el.updateComplete;

          expect(el.value).to.equal('rgb(255, 255, 255)');
          expect(changeHandler).to.have.been.calledOnce;
          expect(inputHandler).to.have.been.calledOnce;
        });

        it('should emit change and input when clicking on a swatch', async () => {
          const el = await fixture<CsColorPicker>(html`
            <cs-color-picker swatches="red; green; blue;"></cs-color-picker>
          `);
          const trigger = el.shadowRoot!.querySelector<HTMLButtonElement>('[part~="trigger"]')!;
          const swatch = el.shadowRoot!.querySelector<HTMLElement>('[part~="swatch"]')!;
          const changeHandler = sinon.spy();
          const inputHandler = sinon.spy();

          el.addEventListener('change', changeHandler);
          el.addEventListener('input', inputHandler);

          await clickOnElement(trigger); // open the dropdown
          await aTimeout(200); // wait for the dropdown to open
          await clickOnElement(swatch); // click on the swatch
          await el.updateComplete;

          expect(changeHandler).to.have.been.calledOnce;
          expect(inputHandler).to.have.been.calledOnce;
        });

        it('should emit change and input when selecting a swatch with the keyboard', async () => {
          const el = await fixture<CsColorPicker>(html`
            <cs-color-picker swatches="red; green; blue;"></cs-color-picker>
          `);
          const trigger = el.shadowRoot!.querySelector<HTMLButtonElement>('[part~="trigger"]')!;
          const swatch = el.shadowRoot!.querySelector<HTMLElement>('[part~="swatch"]')!;
          const changeHandler = sinon.spy();
          const inputHandler = sinon.spy();

          el.addEventListener('change', changeHandler);
          el.addEventListener('input', inputHandler);

          await clickOnElement(trigger); // open the dropdown
          await aTimeout(200); // wait for the dropdown to open
          swatch.focus();
          await sendKeys({ press: 'Enter' });
          await el.updateComplete;

          expect(el.value).to.equal('#ff0000');
          expect(changeHandler).to.have.been.calledOnce;
          expect(inputHandler).to.have.been.calledOnce;
        });

        it('should set a fully transparent value when selecting a transparent swatch with opacity enabled', async () => {
          const el = await fixture<CsColorPicker>(html`
            <cs-color-picker opacity swatches="transparent;"></cs-color-picker>
          `);
          const trigger = el.shadowRoot!.querySelector<HTMLButtonElement>('[part~="trigger"]')!;

          await clickOnElement(trigger); // open the dropdown
          await aTimeout(200); // wait for the dropdown to open
          const swatch = el.shadowRoot!.querySelector<HTMLElement>('[part~="swatch"]')!;
          await clickOnElement(swatch); // click on the swatch
          await el.updateComplete;

          expect(el.value).to.equal('#00000000');
        });

        it('should render the correct format when selecting a swatch of a different format', async () => {
          const el = await fixture<CsColorPicker>(html` <cs-color-picker format="rgb"></cs-color-picker> `);
          const trigger = el.shadowRoot!.querySelector<HTMLButtonElement>('[part~="trigger"]')!;
          const changeHandler = sinon.spy();
          const inputHandler = sinon.spy();

          el.addEventListener('change', changeHandler);
          el.addEventListener('input', inputHandler);

          el.swatches = ['#fff'];
          await el.updateComplete;
          const swatch = el.shadowRoot!.querySelector<HTMLElement>('[part~="swatch"]')!;

          await clickOnElement(trigger); // open the dropdown
          await aTimeout(200); // wait for the dropdown to open
          await clickOnElement(swatch); // click on the swatch
          await el.updateComplete;

          expect(el.value).to.equal('rgb(255, 255, 255)');
          expect(changeHandler).to.have.been.calledOnce;
          expect(inputHandler).to.have.been.calledOnce;
        });
      });

      describe('keyboard navigation', () => {
        it('should emit change and input when selecting a color with the keyboard on the grid handle', async () => {
          const el = await fixture<CsColorPicker>(html` <cs-color-picker></cs-color-picker> `);
          const trigger = el.shadowRoot!.querySelector<HTMLButtonElement>('[part~="trigger"]')!;
          const gridHandle = el.shadowRoot!.querySelector<HTMLElement>('[part~="grid-handle"]')!;
          const changeHandler = sinon.spy();
          const inputHandler = sinon.spy();

          el.addEventListener('change', changeHandler);
          el.addEventListener('input', inputHandler);

          await clickOnElement(trigger); // open the dropdown
          await aTimeout(200); // wait for the dropdown to open
          gridHandle.focus();
          await sendKeys({ press: 'ArrowRight' }); // move the grid handle
          await el.updateComplete;

          expect(changeHandler).to.have.been.calledOnce;
          expect(inputHandler).to.have.been.calledOnce;
        });

        it('should emit change and input when selecting hue with the keyboard', async () => {
          const el = await fixture<CsColorPicker>(html` <cs-color-picker></cs-color-picker> `);
          const trigger = el.shadowRoot!.querySelector<HTMLButtonElement>('[part~="trigger"]')!;
          const handle = el.shadowRoot!.querySelector<HTMLElement>('[part~="hue-slider"] > span')!;
          const changeHandler = sinon.spy();
          const inputHandler = sinon.spy();

          el.addEventListener('change', changeHandler);
          el.addEventListener('input', inputHandler);

          await clickOnElement(trigger); // open the dropdown
          await aTimeout(200); // wait for the dropdown to open
          handle.focus();
          await sendKeys({ press: 'ArrowRight' }); // move the handle
          await el.updateComplete;

          expect(changeHandler).to.have.been.calledOnce;
          expect(inputHandler).to.have.been.calledOnce;
        });

        it('should emit change and input when selecting opacity with the keyboard', async () => {
          const el = await fixture<CsColorPicker>(html` <cs-color-picker opacity></cs-color-picker> `);
          const trigger = el.shadowRoot!.querySelector<HTMLButtonElement>('[part~="trigger"]')!;
          const handle = el.shadowRoot!.querySelector<HTMLElement>('[part~="opacity-slider"] > span')!;
          const changeHandler = sinon.spy();
          const inputHandler = sinon.spy();

          el.addEventListener('change', changeHandler);
          el.addEventListener('input', inputHandler);

          await clickOnElement(trigger); // open the dropdown
          await aTimeout(200); // wait for the dropdown to open
          handle.focus();
          await sendKeys({ press: 'ArrowRight' }); // move the handle
          await el.updateComplete;

          expect(changeHandler).to.have.been.calledOnce;
          expect(inputHandler).to.have.been.calledOnce;
        });

        it('should emit change and input when entering a value in the color input and pressing enter', async () => {
          const el = await fixture<CsColorPicker>(html` <cs-color-picker opacity></cs-color-picker> `);
          const trigger = el.shadowRoot!.querySelector<HTMLButtonElement>('[part~="trigger"]')!;
          const input = el.shadowRoot!.querySelector<HTMLElement>('[part~="input"]')!;
          const changeHandler = sinon.spy();
          const inputHandler = sinon.spy();

          el.addEventListener('change', changeHandler);
          el.addEventListener('input', inputHandler);

          await clickOnElement(trigger); // open the dropdown
          await aTimeout(200); // wait for the dropdown to open
          input.focus(); // focus the input
          await el.updateComplete;
          await sendKeys({ type: 'fc0' }); // type in a color
          await sendKeys({ press: 'Enter' }); // press enter
          await el.updateComplete;

          expect(changeHandler).to.have.been.calledOnce;
          expect(inputHandler).to.have.been.calledOnce;
        });

        it('should emit change and input when entering a value in the color input and blurring the field', async () => {
          const el = await fixture<CsColorPicker>(html` <cs-color-picker opacity></cs-color-picker> `);
          const trigger = el.shadowRoot!.querySelector<HTMLButtonElement>('[part~="trigger"]')!;
          const input = el.shadowRoot!.querySelector<HTMLElement>('[part~="input"]')!;
          const changeHandler = sinon.spy();
          const inputHandler = sinon.spy();

          el.addEventListener('change', changeHandler);
          el.addEventListener('input', inputHandler);

          await clickOnElement(trigger); // open the dropdown
          await aTimeout(200); // wait for the dropdown to open
          input.focus(); // focus the input
          await el.updateComplete;
          await sendKeys({ type: 'fc0' }); // type in a color
          input.blur(); // commit changes by blurring the field
          await el.updateComplete;
          await aTimeout(1);

          expect(changeHandler).to.have.been.calledOnce;
          expect(inputHandler).to.have.been.calledOnce;
        });
      });

      describe('focus and blur', () => {
        it('should focus and blur when calling focus() and blur() and rendered as a dropdown', async () => {
          const colorPicker = await fixture<CsColorPicker>(html` <cs-color-picker></cs-color-picker> `);
          const focusHandler = sinon.spy();
          const blurHandler = sinon.spy();

          colorPicker.addEventListener('focus', focusHandler);
          colorPicker.addEventListener('blur', blurHandler);

          // Focus
          colorPicker.focus();
          await colorPicker.updateComplete;

          expect(document.activeElement).to.equal(colorPicker);
          expect(focusHandler).to.have.been.calledOnce;

          // Blur
          colorPicker.blur();
          await colorPicker.updateComplete;

          expect(document.activeElement).to.equal(document.body);
          expect(blurHandler).to.have.been.calledOnce;
        });
      });

      describe('form integration', () => {
        it('should preserve alpha when initialized with a HEXA value and opacity enabled', async () => {
          const form = await fixture<HTMLFormElement>(html`
            <form>
              <cs-color-picker name="a" format="hex" opacity value="#4d64d54d"></cs-color-picker>
            </form>
          `);
          const colorPicker = form.querySelector<CsColorPicker>('cs-color-picker')!;

          expect(colorPicker.value).to.equal('#4d64d54d');
          expect(new FormData(form).get('a')).to.equal('#4d64d54d');
        });

        it('should preserve alpha and letter case when initialized with an uppercase HEXA value', async () => {
          const form = await fixture<HTMLFormElement>(html`
            <form>
              <cs-color-picker name="a" format="hex" opacity uppercase value="#4d64d54d"></cs-color-picker>
            </form>
          `);
          const colorPicker = form.querySelector<CsColorPicker>('cs-color-picker')!;

          expect(colorPicker.value).to.equal('#4D64D54D');
          expect(new FormData(form).get('a')).to.equal('#4D64D54D');
        });

        it('should serialize its name and value with FormData', async () => {
          const form = await fixture<HTMLFormElement>(html`
            <form>
              <cs-color-picker name="a" value="#ffcc00"></cs-color-picker>
            </form>
          `);

          const formData = new FormData(form);
          expect(formData.get('a')).to.equal('#ffcc00');
        });

        it('should serialize its name and value with JSON', async () => {
          const form = await fixture<HTMLFormElement>(html`
            <form>
              <cs-color-picker name="a" value="#ffcc00"></cs-color-picker>
            </form>
          `);
          const json = serialize(form);
          expect(json.a).to.equal('#ffcc00');
        });

        it('should be present in form data when using the form attribute and located outside of a <form>', async () => {
          const el = await fixture<HTMLFormElement>(html`
            <div>
              <form id="f">
                <cs-button type="submit">Submit</cs-button>
              </form>
              <cs-color-picker form="f" name="a" value="#ffcc00"></cs-color-picker>
            </div>
          `);
          const form = el.querySelector('form')!;
          const formData = new FormData(form);

          expect(formData.get('a')).to.equal('#ffcc00');
        });

        it('should reset the element to its initial value', async () => {
          const form = await fixture<HTMLFormElement>(html`
            <form>
              <cs-color-picker name="a" value="#ffffff"></cs-color-picker>
              <cs-button type="reset">Reset</cs-button>
            </form>
          `);
          const button = form.querySelector('cs-button')!;
          const colorPicker = form.querySelector<CsColorPicker>('cs-color-picker')!;
          colorPicker.value = '#000000';

          await colorPicker.updateComplete;

          setTimeout(() => button.click());
          await oneEvent(form, 'reset');
          await colorPicker.updateComplete;

          expect(colorPicker.value).to.equal('#ffffff');

          colorPicker.defaultValue = '';

          setTimeout(() => button.click());
          await oneEvent(form, 'reset');
          await colorPicker.updateComplete;

          expect(colorPicker.value).to.equal('');
        });
      });

      describe('CSS parts and states', () => {
        it('should be valid by default', async () => {
          const el = await fixture<CsColorPicker>(html` <cs-color-picker></cs-color-picker> `);
          expect(el.checkValidity()).to.be.true;
        });

        it('should be invalid when required and empty', async () => {
          const el = await fixture<CsColorPicker>(html` <cs-color-picker required></cs-color-picker> `);
          expect(el.checkValidity()).to.be.false;
        });

        it('should be invalid when required and disabled is removed', async () => {
          const el = await fixture<CsColorPicker>(html` <cs-color-picker disabled required></cs-color-picker> `);
          el.disabled = false;
          await el.updateComplete;
          expect(el.checkValidity()).to.be.false;
        });

        it('should receive the correct validation attributes ("states") when valid', async () => {
          const el = await fixture<CsColorPicker>(html` <cs-color-picker required value="#fff"></cs-color-picker> `);
          const trigger = el.shadowRoot!.querySelector('[part~="trigger"]')!;
          const grid = el.shadowRoot!.querySelector('[part~="grid"]')!;

          expect(el.checkValidity()).to.be.true;
          expect(el.customStates.has('required')).to.be.true;
          expect(el.customStates.has('optional')).to.be.false;
          expect(el.customStates.has('invalid')).to.be.false;
          expect(el.customStates.has('valid')).to.be.true;
          expect(el.customStates.has('user-invalid')).to.be.false;
          expect(el.customStates.has('user-valid')).to.be.false;

          await clickOnElement(trigger);
          await aTimeout(500);
          await clickOnElement(grid);
          await el.updateComplete;

          expect(el.checkValidity()).to.be.true;
          expect(el.customStates.has('user-invalid')).to.be.false;
          expect(el.customStates.has('user-valid')).to.be.true;
        });

        it('should receive the correct validation attributes ("states") when invalid', async () => {
          const el = await fixture<CsColorPicker>(html` <cs-color-picker required></cs-color-picker> `);
          const trigger = el.shadowRoot!.querySelector('[part~="trigger"]')!;
          const grid = el.shadowRoot!.querySelector('[part~="grid"]')!;

          expect(el.customStates.has('required')).to.be.true;
          expect(el.customStates.has('optional')).to.be.false;
          expect(el.customStates.has('invalid')).to.be.true;
          expect(el.customStates.has('valid')).to.be.false;
          expect(el.customStates.has('user-invalid')).to.be.false;
          expect(el.customStates.has('user-valid')).to.be.false;

          await clickOnElement(trigger);
          await aTimeout(500);
          await clickOnElement(grid);
          await el.updateComplete;

          expect(el.checkValidity()).to.be.true;
          expect(el.customStates.has('user-invalid')).to.be.false;
          expect(el.customStates.has('user-valid')).to.be.true;
        });
      });
    });
  }

  describe('dismissible stack', () => {
    it('should only close the popover when pressing Escape with an open color-picker underneath', async () => {
      const fixture = fixtures[0];
      const el = await fixture<HTMLDivElement>(html`
        <div>
          <cs-color-picker id="test-color-picker"></cs-color-picker>
          <cs-button id="popover-anchor">Open Popover</cs-button>
          <cs-popover id="test-popover" for="popover-anchor">
            <div style="padding: 1rem;">Popover content</div>
          </cs-popover>
        </div>
      `);

      const colorPicker = el.querySelector<CsColorPicker>('#test-color-picker')!;
      const popover = el.querySelector<CsPopover>('#test-popover')!;

      // Open color picker
      const trigger = colorPicker.shadowRoot!.querySelector<HTMLButtonElement>('[part~="trigger"]')!;
      await clickOnElement(trigger);
      await aTimeout(200);
      await waitUntil(() => colorPicker.open);

      // Open popover on top
      popover.open = true;
      await waitUntil(() => popover.open);
      await aTimeout(200);

      await sendKeys({ press: 'Escape' });
      await aTimeout(200);

      expect(popover.open).to.be.false;
      expect(colorPicker.open).to.be.true;
    });
  });
});
