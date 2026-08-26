import { aTimeout, expect, waitUntil } from '@open-wc/testing';
import { html } from 'lit';
import sinon from 'sinon';
import { fixtures } from '../../internal/test/fixture.js';
import { runFormControlBaseTests } from '../../internal/test/form-control-base-tests.js';
import type CsButton from './button.js';

const variants = ['brand', 'success', 'neutral', 'warning', 'danger'];

describe('<cs-button>', () => {
  runFormControlBaseTests({
    tagName: 'cs-button',
    variantName: 'type="button"',
    init: (control: CsButton) => {
      control.type = 'button';
    },
  });

  runFormControlBaseTests({
    tagName: 'cs-button',
    variantName: 'type="submit"',
    init: (control: CsButton) => {
      control.type = 'submit';
    },
  });

  runFormControlBaseTests({
    tagName: 'cs-button',
    variantName: 'href="xyz"',
    init: (control: CsButton) => {
      control.href = 'some-url';
    },
  });

  for (const fixture of fixtures) {
    describe(`with "${fixture.type}" rendering`, () => {
      describe('accessibility', () => {
        variants.forEach((variant) => {
          it(`should be accessible when variant is "${variant}"`, async () => {
            const el = await fixture<CsButton>(html` <cs-button variant="${variant}"> Button Label </cs-button> `);
            await expect(el).to.be.accessible();
          });
        });

        it('should be accessible when disabled', async () => {
          const el = await fixture<CsButton>(html` <cs-button disabled>Button Label</cs-button> `);
          await expect(el).to.be.accessible();
        });
      });

      describe('properties', () => {
        it('should have title if title attribute is set', async () => {
          const el = await fixture<CsButton>(html` <cs-button title="Test"></cs-button> `);
          const button = el.shadowRoot!.querySelector<HTMLButtonElement>('[part~="button"]')!;
          expect(button.title).to.equal('Test');
        });

        it('should render a spinner when loading', async () => {
          const el = await fixture<CsButton>(html` <cs-button loading>Button Label</cs-button> `);
          expect(el.shadowRoot!.querySelector('cs-spinner')).to.exist;
        });

        it('should render a caret when with-caret is set', async () => {
          const el = await fixture<CsButton>(html` <cs-button with-caret>Button Label</cs-button> `);
          expect(el.shadowRoot!.querySelector('[part~="caret"]')).to.exist;
        });

        it('should have correct default size', async () => {
          const el = await fixture<CsButton>(html` <cs-button>Button</cs-button> `);
          expect(el.size).to.equal('m');
        });

        it('should reflect the size attribute', async () => {
          const el = await fixture<CsButton>(html` <cs-button size="s">Button</cs-button> `);
          expect(el.size).to.equal('s');
        });

        it('should have correct default variant', async () => {
          const el = await fixture<CsButton>(html` <cs-button>Button</cs-button> `);
          expect(el.variant).to.equal('neutral');
        });

        it('should have correct default type', async () => {
          const el = await fixture<CsButton>(html` <cs-button>Button</cs-button> `);
          expect(el.type).to.equal('button');
        });
      });

      describe('when disabled', () => {
        it('should disable the native <button> when rendering a <button>', async () => {
          const el = await fixture<CsButton>(html` <cs-button disabled>Button Label</cs-button> `);
          expect(el.shadowRoot!.querySelector('button[disabled]')).to.exist;
        });

        it('should not disable the native <a> when rendering an <a>', async () => {
          const el = await fixture<CsButton>(html` <cs-button href="some/path" disabled>Button Label</cs-button> `);
          expect(el.shadowRoot!.querySelector('a[disabled]')).not.to.exist;
        });

        it('should prevent clicks when disabled and rendering an <a>', async () => {
          const el = await fixture<CsButton>(html` <cs-button href="some/path" disabled>Button Label</cs-button> `);
          const clickHandler = sinon.spy();
          el.addEventListener('click', clickHandler);
          el.click();
          expect(clickHandler).not.to.have.been.called;
        });
      });

      describe('when href is present', () => {
        it('should render as an <a>', async () => {
          const el = await fixture<CsButton>(html` <cs-button href="some/path">Button Label</cs-button> `);
          expect(el.shadowRoot!.querySelector('a')).to.exist;
          expect(el.shadowRoot!.querySelector('button')).not.to.exist;
        });

        it('should render a link with a custom rel when provided', async () => {
          const el = await fixture<CsButton>(html`
            <cs-button href="https://example.com/" target="_blank" rel="1">Link</cs-button>
          `);
          const link = el.shadowRoot!.querySelector('a')!;
          expect(link?.getAttribute('rel')).to.equal('1');
        });
      });

      describe('events', () => {
        it('should emit focus and blur when the button is focused and blurred', async () => {
          const el = await fixture<CsButton>(html` <cs-button>Button</cs-button> `);
          const focusHandler = sinon.spy();
          const blurHandler = sinon.spy();

          el.addEventListener('focus', focusHandler);
          el.addEventListener('blur', blurHandler);

          el.focus();
          await waitUntil(() => focusHandler.calledOnce);

          el.blur();
          await waitUntil(() => blurHandler.calledOnce);

          expect(focusHandler).to.have.been.calledOnce;
          expect(blurHandler).to.have.been.calledOnce;
        });

        it('should emit a click event when calling click()', async () => {
          const el = await fixture<CsButton>(html` <cs-button></cs-button> `);
          const clickHandler = sinon.spy();

          el.addEventListener('click', clickHandler);
          el.click();
          await waitUntil(() => clickHandler.calledOnce);

          expect(clickHandler).to.have.been.calledOnce;
        });
      });

      describe('form integration', () => {
        it('should submit when the button is inside the form', async () => {
          const form = await fixture<HTMLFormElement>(html`
            <form action="" method="post">
              <cs-button type="submit">Submit</cs-button>
            </form>
          `);
          const button = form.querySelector<CsButton>('cs-button')!;
          const handleSubmit = sinon.spy((event: SubmitEvent) => event.preventDefault());

          form.addEventListener('submit', handleSubmit);
          button.click();

          expect(handleSubmit).to.have.been.calledOnce;
        });

        it('should submit when the button is outside the form and has a form attribute', async () => {
          const el = await fixture(html`
            <div>
              <form id="a" action="" method="post"></form>
              <cs-button type="submit" form="a">Submit</cs-button>
            </div>
          `);
          const form = el.querySelector<HTMLFormElement>('form')!;
          const button = el.querySelector<CsButton>('cs-button')!;
          const handleSubmit = sinon.spy((event: SubmitEvent) => event.preventDefault());

          form.addEventListener('submit', handleSubmit);
          button.click();

          expect(handleSubmit).to.have.been.calledOnce;
        });

        it('should override form attributes when formaction, formmethod, formnovalidate, and formtarget are used inside a form', async () => {
          const form = await fixture(html`
            <form id="a" action="foo" method="post" target="_self">
              <cs-button type="submit" form="a" formaction="bar" formmethod="get" formtarget="_blank" formnovalidate>
                Submit
              </cs-button>
            </form>
          `);
          const button = form.querySelector<CsButton>('cs-button')!;
          const handleSubmit = sinon.spy((event: SubmitEvent) => {
            submitter = event.submitter as HTMLButtonElement;
            event.preventDefault();
          });
          let submitter!: HTMLButtonElement;

          form.addEventListener('submit', handleSubmit);
          button.click();

          expect(handleSubmit).to.have.been.calledOnce;
          expect(submitter.formAction.endsWith('/bar')).to.be.true;
          expect(submitter.formMethod).to.equal('get');
          expect(submitter.formTarget).to.equal('_blank');
          expect(submitter.formNoValidate).to.be.true;
        });

        it('should override form attributes when formaction, formmethod, formnovalidate, and formtarget are used outside a form', async () => {
          const el = await fixture(html`
            <div>
              <form id="a" action="foo" method="post" target="_self"></form>
              <cs-button type="submit" form="a" formaction="bar" formmethod="get" formtarget="_blank" formnovalidate>
                Submit
              </cs-button>
            </div>
          `);
          const form = el.querySelector<HTMLFormElement>('form')!;
          const button = el.querySelector<CsButton>('cs-button')!;
          const handleSubmit = sinon.spy((event: SubmitEvent) => {
            submitter = event.submitter as HTMLButtonElement;
            event.preventDefault();
          });
          let submitter!: HTMLButtonElement;

          form.addEventListener('submit', handleSubmit);
          button.click();

          expect(handleSubmit).to.have.been.calledOnce;
          expect(submitter.formAction.endsWith('/bar')).to.be.true;
          expect(submitter.formMethod).to.equal('get');
          expect(submitter.formTarget).to.equal('_blank');
          expect(submitter.formNoValidate).to.be.true;
        });

        it('should only submit button name / value pair when the form is submitted', async () => {
          const form = await fixture<HTMLFormElement>(
            html`<form>
              <cs-button type="submit" name="btn-1" value="value-1">Button 1</cs-button>
              <cs-button type="submit" name="btn-2" value="value-2">Button 2</cs-button>
            </form>`,
          );

          let formData = new FormData(form);
          let submitter: null | HTMLButtonElement = document.createElement('button');

          form.addEventListener('submit', (event) => {
            event.preventDefault();
            formData = new FormData(form);
            submitter = event.submitter as HTMLButtonElement;
          });

          expect(formData.get('btn-1')).to.be.null;
          expect(formData.get('btn-2')).to.be.null;

          form.querySelector('cs-button')?.click();
          await aTimeout(0);

          expect(formData.get('btn-1')).to.be.null;
          expect(formData.get('btn-2')).to.be.null;

          expect(submitter.name).to.equal('btn-1');
          expect(submitter.value).to.equal('value-1');

          form.querySelectorAll('cs-button')[1]?.click();
          await aTimeout(0);

          expect(formData.get('btn-1')).to.be.null;
          expect(formData.get('btn-2')).to.be.null;

          expect(submitter.name).to.equal('btn-2');
          expect(submitter.value).to.equal('value-2');
        });
      });
    });
  }

  describe('icon button label', () => {
    async function warningsFor(template: ReturnType<typeof html>) {
      const warn = sinon.stub(console, 'warn');

      try {
        const el = await fixtures[0]<CsButton>(template);
        await el.updateComplete;
        await aTimeout(0);
        return warn.getCalls().filter((call) => String(call.args[0]).includes('Icon buttons must have a label'));
      } finally {
        warn.restore();
      }
    }

    it('should warn when an icon-only button has no icon label', async () => {
      const calls = await warningsFor(html`<cs-button><cs-icon library="system" name="check"></cs-icon></cs-button>`);
      expect(calls).to.have.lengthOf(1);
    });

    it('should warn when an icon-only button has an empty icon label', async () => {
      const calls = await warningsFor(
        html`<cs-button><cs-icon library="system" name="check" label=""></cs-icon></cs-button>`,
      );
      expect(calls).to.have.lengthOf(1);
    });

    it('should not warn when the icon has a label', async () => {
      const calls = await warningsFor(
        html`<cs-button><cs-icon library="system" name="check" label="Confirm"></cs-icon></cs-button>`,
      );
      expect(calls).to.have.lengthOf(0);
    });

    it('should not warn when the button also has text', async () => {
      const calls = await warningsFor(
        html`<cs-button><cs-icon library="system" name="check"></cs-icon> Confirm</cs-button>`,
      );
      expect(calls).to.have.lengthOf(0);
    });

    it('should give an icon-only button an accessible name from the icon label', async () => {
      const el = await fixtures[0]<CsButton>(
        html`<cs-button><cs-icon library="system" name="check" label="Confirm"></cs-icon></cs-button>`,
      );
      await el.updateComplete;
      await aTimeout(0);

      await expect(el).to.be.accessible();
      expect(el.querySelector('cs-icon')!.getAttribute('aria-label')).to.equal('Confirm');
    });
  });
});
