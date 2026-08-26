import { expect, oneEvent, waitUntil } from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import { html } from 'lit';
import sinon from 'sinon';
import { clientFixture, fixtures } from '../../internal/test/fixture.js';
import { runFormControlBaseTests } from '../../internal/test/form-control-base-tests.js';
import { serialize } from '../../utilities/form.js';
import type CsTextarea from './textarea.js';

describe('<cs-textarea>', () => {
  runFormControlBaseTests({ tagName: 'cs-textarea', formValue: { dirtyValue: 'dirtied' } });

  for (const fixture of fixtures) {
    describe(`with "${fixture.type}" rendering`, () => {
      describe('accessibility', () => {
        it('should pass accessibility tests', async () => {
          const el = await fixture<CsTextarea>(html`<cs-textarea label="Name"></cs-textarea>`);
          await expect(el).to.be.accessible();
        });

        it('should focus the textarea when clicking on the label', async () => {
          const el = await fixture<CsTextarea>(html`<cs-textarea label="Name"></cs-textarea>`);
          const label = el.shadowRoot!.querySelector('[part~="form-control-label"]')!;
          const focusHandler = sinon.spy();

          el.addEventListener('focus', focusHandler);
          (label as HTMLLabelElement).click();
          await waitUntil(() => focusHandler.calledOnce);

          expect(focusHandler).to.have.been.calledOnce;
        });
      });

      describe('properties', () => {
        it('should have correct default property values', async () => {
          const el = await fixture<CsTextarea>(html`<cs-textarea></cs-textarea>`);

          expect(el.size).to.equal('m');
          expect(el.name).to.equal(null);
          expect(el.value).to.equal('');
          expect(el.defaultValue).to.equal('');
          expect(el.title).to.equal('');
          expect(el.appearance).to.equal('outlined');
          expect(el.label).to.equal('');
          expect(el.hint).to.equal('');
          expect(el.placeholder).to.equal('');
          expect(el.rows).to.equal(4);
          expect(el.resize).to.equal('vertical');
          expect(el.disabled).to.be.false;
          expect(el.readonly).to.be.false;
          expect(el.minlength).to.be.undefined;
          expect(el.maxlength).to.be.undefined;
          expect(el.required).to.be.false;
          expect(el.autocapitalize).to.be.undefined;
          expect(el.autocorrect).to.be.undefined;
          expect(el.autocomplete).to.be.undefined;
          expect(el.autofocus).to.be.undefined;
          expect(el.enterkeyhint).to.be.undefined;
          expect(el.spellcheck).to.be.true;
          expect(el.inputmode).to.be.undefined;
          expect(el.withCount).to.be.false;
        });

        it('should reflect the title attribute to the internal textarea', async () => {
          const el = await fixture<CsTextarea>(html`<cs-textarea title="Test"></cs-textarea>`);
          const textarea = el.shadowRoot!.querySelector('textarea')!;
          expect(textarea.title).to.equal('Test');
        });

        it('should be disabled with the disabled attribute', async () => {
          const el = await fixture<CsTextarea>(html`<cs-textarea disabled></cs-textarea>`);
          const textarea = el.shadowRoot!.querySelector<HTMLTextAreaElement>('[part~="textarea"]')!;
          expect(textarea.disabled).to.be.true;
        });

        it('should reflect the readonly attribute to the internal textarea', async () => {
          const el = await fixture<CsTextarea>(html`<cs-textarea readonly></cs-textarea>`);
          const textarea = el.shadowRoot!.querySelector<HTMLTextAreaElement>('[part~="textarea"]')!;
          expect(textarea.readOnly).to.be.true;
        });

        it('should reflect the placeholder attribute', async () => {
          const el = await fixture<CsTextarea>(html`<cs-textarea placeholder="Enter text"></cs-textarea>`);
          const textarea = el.shadowRoot!.querySelector<HTMLTextAreaElement>('[part~="textarea"]')!;
          expect(textarea.placeholder).to.equal('Enter text');
        });

        it('should set the rows attribute on the internal textarea', async () => {
          const el = await fixture<CsTextarea>(html`<cs-textarea rows="8"></cs-textarea>`);
          const textarea = el.shadowRoot!.querySelector<HTMLTextAreaElement>('[part~="textarea"]')!;
          expect(textarea.rows).to.equal(8);
        });
      });

      describe('slots', () => {
        it('should show "has-label" class when label slot is populated', async () => {
          const el = await fixture<CsTextarea>(html`<cs-textarea><span slot="label">Name</span></cs-textarea>`);
          const label = el.shadowRoot!.querySelector('[part~="form-control-label"]')!;
          expect(label.classList.contains('has-label')).to.equal(true);
        });

        it('should show "has-label" class when label attribute is set', async () => {
          const el = await fixture<CsTextarea>(html`<cs-textarea label="Name"></cs-textarea>`);
          const label = el.shadowRoot!.querySelector('[part~="form-control-label"]')!;
          expect(label.classList.contains('has-label')).to.equal(true);
        });

        it('should not show "has-label" class when no label is provided', async () => {
          const el = await fixture<CsTextarea>(html`<cs-textarea></cs-textarea>`);
          const label = el.shadowRoot!.querySelector('[part~="form-control-label"]')!;
          expect(label.classList.contains('has-label')).to.equal(false);
        });

        it('should render the hint slot', async () => {
          const el = await fixture<CsTextarea>(html`<cs-textarea hint="Some hint"></cs-textarea>`);
          const hint = el.shadowRoot!.querySelector('[part~="hint"]')!;
          expect(hint.textContent).to.contain('Some hint');
        });

        it('should render the hint part as a top-level child so it can be positioned in custom layouts', async () => {
          const el = await fixture<CsTextarea>(html`<cs-textarea hint="Some hint"></cs-textarea>`);
          const hint = el.shadowRoot!.querySelector('[part~="hint"]')!;
          expect(hint.parentNode).to.equal(el.shadowRoot);
        });

        it('should hide the hint part when there is no hint', async () => {
          const el = await fixture<CsTextarea>(html`<cs-textarea></cs-textarea>`);
          const hint = el.shadowRoot!.querySelector('[part~="hint"]')!;
          expect(getComputedStyle(hint).display).to.equal('none');
        });

        it('should show the hint part when a hint is provided', async () => {
          const el = await fixture<CsTextarea>(html`<cs-textarea hint="Some hint"></cs-textarea>`);
          const hint = el.shadowRoot!.querySelector('[part~="hint"]')!;
          expect(getComputedStyle(hint).display).to.not.equal('none');
        });

        it('should keep the character count visible when there is no hint', async () => {
          const el = await fixture<CsTextarea>(html`<cs-textarea with-count maxlength="10"></cs-textarea>`);
          const count = el.shadowRoot!.querySelector('[part~="count"]')!;
          expect(count.getBoundingClientRect().height).to.be.greaterThan(0);
        });

        it('should lay the hint and character count out on one line', async () => {
          const el = await fixture<CsTextarea>(
            html`<cs-textarea hint="Some hint" with-count maxlength="10"></cs-textarea>`,
          );
          const footer = el.shadowRoot!.querySelector('[part~="hint"]')!;
          const hint = el.shadowRoot!.querySelector('.hint')!;
          const count = el.shadowRoot!.querySelector('[part~="count"]')!;
          expect(getComputedStyle(footer).display).to.equal('flex');
          expect(count.getBoundingClientRect().top).to.be.lessThan(hint.getBoundingClientRect().bottom);
        });

        it('should keep the character count inside the control when the hint cannot wrap', async () => {
          const el = await fixture<CsTextarea>(
            html`<cs-textarea
              style="width: 300px"
              hint="Supercalifragilisticexpialidocious-antidisestablishmentarianism-pneumonoultramicroscopicsilicovolcanoconiosis"
              with-count
              maxlength="10"
            ></cs-textarea>`,
          );
          const count = el.shadowRoot!.querySelector('[part~="count"]')!;
          expect(count.getBoundingClientRect().right).to.be.at.most(el.getBoundingClientRect().right);
        });
      });

      describe('events', () => {
        it('should emit input and change when the user types and blurs', async () => {
          const el = await fixture<CsTextarea>(html`<cs-textarea></cs-textarea>`);
          const inputHandler = sinon.spy();
          const changeHandler = sinon.spy();

          el.addEventListener('input', inputHandler);
          el.addEventListener('change', changeHandler);
          el.focus();
          await sendKeys({ type: 'abc' });
          el.blur();
          await el.updateComplete;

          expect(changeHandler).to.have.been.calledOnce;
          expect(inputHandler).to.have.been.calledThrice;
        });

        it('should not emit change or input when the value is set programmatically', async () => {
          const el = await fixture<CsTextarea>(html`<cs-textarea></cs-textarea>`);

          el.addEventListener('change', () => expect.fail('change should not be emitted'));
          el.addEventListener('input', () => expect.fail('input should not be emitted'));
          el.value = 'abc';

          await el.updateComplete;
        });

        it('should not emit change or input when calling setRangeText()', async () => {
          const el = await fixture<CsTextarea>(html`<cs-textarea value="hi there"></cs-textarea>`);

          el.addEventListener('change', () => expect.fail('change should not be emitted'));
          el.addEventListener('input', () => expect.fail('input should not be emitted'));
          el.focus();
          el.setSelectionRange(0, 2);
          el.setRangeText('hello');

          await el.updateComplete;
        });
      });

      describe('form integration', () => {
        it('should submit an empty value when initial value is set and then deleted', async () => {
          const form = await fixture<HTMLFormElement>(html`
            <form><cs-textarea name="a" value="1"></cs-textarea></form>
          `);
          const textarea = form.querySelector('cs-textarea')!;

          textarea.focus();
          textarea.select();
          await sendKeys({ press: 'Backspace' });
          await textarea.updateComplete;

          const formData = new FormData(form);
          expect(formData.get('a')).to.equal('');
        });

        it('should serialize its name and value with FormData', async () => {
          const form = await fixture<HTMLFormElement>(html`
            <form><cs-textarea name="a" value="1"></cs-textarea></form>
          `);
          const formData = new FormData(form);
          expect(formData.get('a')).to.equal('1');
        });

        it('should serialize its name and value with JSON', async () => {
          const form = await fixture<HTMLFormElement>(html`
            <form><cs-textarea name="a" value="1"></cs-textarea></form>
          `);
          const json = serialize(form);
          expect(json.a).to.equal('1');
        });

        it('should be present in form data when using the form attribute and located outside of a <form>', async () => {
          const el = await fixture<HTMLFormElement>(html`
            <div>
              <form id="f">
                <cs-button type="submit">Submit</cs-button>
              </form>
              <cs-textarea form="f" name="a" value="1"></cs-textarea>
            </div>
          `);
          const form = el.querySelector('form')!;
          const formData = new FormData(form);

          expect(formData.get('a')).to.equal('1');
        });

        it('should reset the element to its initial value', async () => {
          const form = await fixture<HTMLFormElement>(html`
            <form>
              <cs-textarea name="a" value="test"></cs-textarea>
              <cs-button type="reset">Reset</cs-button>
            </form>
          `);
          const button = form.querySelector('cs-button')!;
          const textarea = form.querySelector('cs-textarea')!;
          textarea.value = '1234';

          await textarea.updateComplete;

          setTimeout(() => button.click());
          await oneEvent(form, 'reset');
          await textarea.updateComplete;

          expect(textarea.value).to.equal('test');

          textarea.defaultValue = '';

          setTimeout(() => button.click());
          await oneEvent(form, 'reset');
          await textarea.updateComplete;

          expect(textarea.value).to.equal('');
        });
      });

      describe('constraint validation', () => {
        it('should be valid by default', async () => {
          const el = await fixture<CsTextarea>(html`<cs-textarea></cs-textarea>`);
          expect(el.checkValidity()).to.be.true;
        });

        it('should be invalid when required and empty', async () => {
          const el = await fixture<CsTextarea>(html`<cs-textarea required></cs-textarea>`);
          expect(el.checkValidity()).to.be.false;
        });

        it('should be invalid when required and disabled is removed', async () => {
          const el = await fixture<CsTextarea>(html`<cs-textarea disabled required></cs-textarea>`);
          el.disabled = false;
          await el.updateComplete;
          expect(el.checkValidity()).to.be.false;
        });

        it('should be invalid when setCustomValidity() is called with a non-empty value', async () => {
          const el = await fixture<CsTextarea>(html`<cs-textarea></cs-textarea>`);

          el.setCustomValidity('Invalid selection');
          await el.updateComplete;

          expect(el.checkValidity()).to.be.false;
          expect(el.customStates.has('invalid')).to.be.true;
          expect(el.customStates.has('valid')).to.be.false;
          expect(el.customStates.has('user-invalid')).to.be.false;
          expect(el.customStates.has('user-valid')).to.be.false;

          el.focus();
          await sendKeys({ type: 'test' });
          await el.updateComplete;
          el.blur();
          await el.updateComplete;

          expect(el.customStates.has('user-invalid')).to.be.true;
          expect(el.customStates.has('user-valid')).to.be.false;
        });
      });

      describe('CSS parts and states', () => {
        it('should receive the correct validation states when valid', async () => {
          const el = await fixture<CsTextarea>(html`<cs-textarea required value="a"></cs-textarea>`);

          expect(el.checkValidity()).to.be.true;
          expect(el.customStates.has('required')).to.be.true;
          expect(el.customStates.has('optional')).to.be.false;
          expect(el.customStates.has('invalid')).to.be.false;
          expect(el.customStates.has('valid')).to.be.true;
          expect(el.customStates.has('user-invalid')).to.be.false;
          expect(el.customStates.has('user-valid')).to.be.false;

          el.focus();
          await sendKeys({ press: 'b' });
          await el.updateComplete;
          el.blur();
          await el.updateComplete;

          expect(el.checkValidity()).to.be.true;
          expect(el.customStates.has('user-invalid')).to.be.false;
          expect(el.customStates.has('user-valid')).to.be.true;
        });

        it('should receive the correct validation states when invalid', async () => {
          const el = await fixture<CsTextarea>(html`<cs-textarea required></cs-textarea>`);

          expect(el.customStates.has('required')).to.be.true;
          expect(el.customStates.has('optional')).to.be.false;
          expect(el.customStates.has('invalid')).to.be.true;
          expect(el.customStates.has('valid')).to.be.false;
          expect(el.customStates.has('user-invalid')).to.be.false;
          expect(el.customStates.has('user-valid')).to.be.false;

          el.focus();
          await sendKeys({ press: 'a' });
          await sendKeys({ press: 'Backspace' });
          await el.updateComplete;
          el.blur();
          await el.updateComplete;

          expect(el.customStates.has('user-invalid')).to.be.true;
          expect(el.customStates.has('user-valid')).to.be.false;
        });

        it('should receive validation states even when novalidate is used on the parent form', async () => {
          const el = await fixture<HTMLFormElement>(html`
            <form novalidate><cs-textarea required></cs-textarea></form>
          `);
          const textarea = el.querySelector<CsTextarea>('cs-textarea')!;

          expect(textarea.customStates.has('required')).to.be.true;
          expect(textarea.customStates.has('optional')).to.be.false;
          expect(textarea.customStates.has('invalid')).to.be.true;
          expect(textarea.customStates.has('valid')).to.be.false;
          expect(textarea.customStates.has('user-invalid')).to.be.false;
          expect(textarea.customStates.has('user-valid')).to.be.false;
        });

        it('should have the blank state when the textarea is empty', async () => {
          const el = await fixture<CsTextarea>(html`<cs-textarea></cs-textarea>`);
          await el.updateComplete;
          expect(el.customStates.has('blank')).to.be.true;
        });

        it('should not have the blank state when the textarea has a value', async () => {
          const el = await fixture<CsTextarea>(html`<cs-textarea value="hello"></cs-textarea>`);
          await el.updateComplete;
          expect(el.customStates.has('blank')).to.be.false;
        });
      });

      describe('when using spellcheck', () => {
        it('should enable spellcheck when no attribute is present', async () => {
          const el = await fixture<CsTextarea>(html`<cs-textarea></cs-textarea>`);
          const textarea = el.shadowRoot!.querySelector<HTMLTextAreaElement>('textarea')!;
          expect(textarea.getAttribute('spellcheck')).to.equal('true');
          expect(textarea.spellcheck).to.be.true;
        });

        it('should enable spellcheck when set to "true"', async () => {
          const el = await fixture<CsTextarea>(html`<cs-textarea spellcheck="true"></cs-textarea>`);
          const textarea = el.shadowRoot!.querySelector<HTMLTextAreaElement>('textarea')!;
          expect(textarea.getAttribute('spellcheck')).to.equal('true');
          expect(textarea.spellcheck).to.be.true;
        });

        it('should disable spellcheck when set to "false"', async () => {
          const el = await fixture<CsTextarea>(html`<cs-textarea spellcheck="false"></cs-textarea>`);
          const textarea = el.shadowRoot!.querySelector<HTMLTextAreaElement>('textarea')!;
          expect(textarea.getAttribute('spellcheck')).to.equal('false');
          expect(textarea.spellcheck).to.be.false;
        });
      });

      describe('character count', () => {
        it('should show character count when with-count is set', async () => {
          const el = await fixture<CsTextarea>(html`<cs-textarea with-count></cs-textarea>`);
          await el.updateComplete;
          const count = el.shadowRoot!.querySelector('[part~="count"]');
          expect(count).to.not.be.null;
        });

        it('should not show character count by default', async () => {
          const el = await fixture<CsTextarea>(html`<cs-textarea></cs-textarea>`);
          await el.updateComplete;
          const count = el.shadowRoot!.querySelector('[part~="count"]');
          expect(count).to.be.null;
        });

        it('should show remaining characters when maxlength is set', async () => {
          const el = await fixture<CsTextarea>(
            html`<cs-textarea with-count maxlength="10" value="hello"></cs-textarea>`,
          );
          await el.updateComplete;
          const count = el.shadowRoot!.querySelector('[part~="count"]')!;
          // The count should reflect remaining characters
          expect(count.textContent).to.not.be.empty;
        });
      });

      describe('methods', () => {
        it('should set replacement text in the correct location with setRangeText()', async () => {
          const el = await fixture<CsTextarea>(html`<cs-textarea value="test"></cs-textarea>`);

          el.focus();
          el.setSelectionRange(1, 3);
          el.setRangeText('boom');
          await el.updateComplete;
          expect(el.value).to.equal('tboomt'); // cspell:disable-line
        });

        it('should report the vertical offset in top and the horizontal offset in left with scrollPosition()', async () => {
          const el = await fixture<CsTextarea>(html`
            <cs-textarea
              rows="2"
              value="line one
line two
line three
line four
line five
line six"
            ></cs-textarea>
          `);
          const textarea = el.shadowRoot!.querySelector<HTMLTextAreaElement>('[part~="textarea"]')!;

          // Firefox ignores the assignment until the control has been laid out, so retry until it lands.
          await waitUntil(() => {
            el.scrollPosition({ top: 20 });
            return textarea.scrollTop > 0;
          }, 'the control never accepted a scroll position');

          expect(textarea.scrollLeft).to.equal(0);

          const position = el.scrollPosition()!;
          expect(position.top).to.equal(textarea.scrollTop);
          expect(position.left).to.equal(0);
        });
      });
    });
  }

  describe('auto resize visibility (issue 2347)', () => {
    it('should size to fit when revealed after being initially hidden', async () => {
      const container = await clientFixture<HTMLDivElement>(html`
        <div style="display: none">
          <cs-textarea
            resize="auto"
            value="line one
line two
line three"
          ></cs-textarea>
        </div>
      `);
      const el = container.querySelector<CsTextarea>('cs-textarea')!;
      await el.updateComplete;

      // While hidden, scrollHeight is 0 so the internal textarea has no measurable height.
      const textarea = el.shadowRoot!.querySelector<HTMLTextAreaElement>('[part~="textarea"]')!;

      container.style.display = '';

      // Wait for the ResizeObserver to fire and re-run setTextareaDimensions().
      await waitUntil(() => textarea.clientHeight > 0, 'textarea did not resize after becoming visible');

      expect(textarea.clientHeight).to.be.greaterThan(0);
    });
  });

  describe('resize mode changes', () => {
    it('should re-bind the resize observer when switching from a manual mode to auto', async () => {
      // Regression: previously the observer was created once on first updated() and never recreated when `resize`
      // changed, so switching from a manual mode to `auto` left the observer pointed at the inner textarea instead of
      // the host. The auto-mode height recompute on width change then never fired.
      const container = await clientFixture<HTMLDivElement>(html`
        <div style="display: none">
          <cs-textarea
            resize="vertical"
            value="line one
line two
line three"
          ></cs-textarea>
        </div>
      `);
      const el = container.querySelector<CsTextarea>('cs-textarea')!;
      await el.updateComplete;

      el.resize = 'auto';
      await el.updateComplete;

      const textarea = el.shadowRoot!.querySelector<HTMLTextAreaElement>('[part~="textarea"]')!;
      container.style.display = '';

      await waitUntil(
        () => textarea.clientHeight > 0,
        'textarea did not auto-size after switching resize mode and becoming visible',
      );

      expect(textarea.clientHeight).to.be.greaterThan(0);
    });

    it('should disconnect the resize observer when switching to none', async () => {
      const el = await clientFixture<CsTextarea>(html`<cs-textarea resize="auto"></cs-textarea>`);
      await el.updateComplete;

      // Access the private field for verification — there is no public surface for the observer.
      expect((el as unknown as { resizeObserver?: ResizeObserver }).resizeObserver).to.exist;

      el.resize = 'none';
      await el.updateComplete;

      expect((el as unknown as { resizeObserver?: ResizeObserver }).resizeObserver).to.be.undefined;
    });
  });

  describe('auto resize shrinking', () => {
    it('should shrink the visible wrapper back to its original size after expanded content is cleared', async () => {
      const el = await clientFixture<CsTextarea>(html`<cs-textarea resize="auto"></cs-textarea>`);
      await el.updateComplete;

      // The user perceives the size of the visible wrapper, not the inner <textarea>. Measure the host's bounding box
      // so we catch cases where the inner textarea shrinks but the wrapper stays expanded (e.g. because the size
      // adjuster pinned it to the previous larger height).
      const original = el.getBoundingClientRect().height;

      el.focus();
      for (let i = 0; i < 5; i++) {
        await sendKeys({ press: 'Enter' });
      }
      await el.updateComplete;
      await waitUntil(
        () => el.getBoundingClientRect().height > original,
        'wrapper did not expand after pressing Enter',
      );
      const expanded = el.getBoundingClientRect().height;
      expect(expanded).to.be.greaterThan(original);

      el.select();
      await sendKeys({ press: 'Delete' });
      await el.updateComplete;

      await waitUntil(
        () => Math.round(el.getBoundingClientRect().height) === Math.round(original),
        `wrapper did not shrink back to original (original=${original}, expanded=${expanded})`,
      );
      expect(Math.round(el.getBoundingClientRect().height)).to.equal(Math.round(original));
    });
  });
});
