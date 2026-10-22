import { aTimeout, expect, waitUntil } from '@open-wc/testing';
import { a11ySnapshot } from '@web/test-runner-commands';
import { html } from 'lit';
import sinon from 'sinon';
import { fixtures } from '../../internal/test/fixture.js';
import { runFormControlBaseTests } from '../../internal/test/form-control-base-tests.js';
import { formControlHeight } from '../../internal/test/form-control-height.js';
import type CsButton from './button.js';

const variants = ['brand', 'success', 'neutral', 'warning', 'danger'];

interface AccessibilityNode {
  role: string;
  name: string;
}

function partOf(el: CsButton, name: string) {
  return el.shadowRoot!.querySelector<HTMLElement>(`[part~="${name}"]`)!;
}

/** The box a button's label text paints in. A `<slot>` reports no box of its own, so measure the text node. */
function labelTextRect(el: CsButton) {
  const text = [...el.childNodes].find((node) => node.nodeType === Node.TEXT_NODE && node.textContent!.trim())!;
  const range = document.createRange();
  range.selectNodeContents(text);
  return range.getBoundingClientRect();
}

function centerX(rect: DOMRect) {
  return rect.left + rect.width / 2;
}

/** Runs `action` with `console.warn` stubbed and returns the vertical end slot warnings it logged. */
async function endSlotWarnings(action: () => Promise<unknown>) {
  const warn = sinon.stub(console, 'warn');

  try {
    await action();
    await aTimeout(0);
    return warn.getCalls().filter((call) => String(call.args[0]).includes('end slot of a vertical button'));
  } finally {
    warn.restore();
  }
}

/** Whether `inner` lies inside `outer`, allowing half a pixel for subpixel rounding. */
function isInside(inner: DOMRect, outer: DOMRect) {
  return (
    inner.left >= outer.left - 0.5 &&
    inner.right <= outer.right + 0.5 &&
    inner.top >= outer.top - 0.5 &&
    inner.bottom <= outer.bottom + 0.5
  );
}

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

      describe('orientation', () => {
        it('should default to horizontal and reflect a change', async () => {
          const el = await fixture<CsButton>(html`<cs-button>Settings</cs-button>`);
          expect(el.orientation).to.equal('horizontal');
          expect(el.getAttribute('orientation')).to.equal('horizontal');

          el.orientation = 'vertical';
          await el.updateComplete;
          expect(el.getAttribute('orientation')).to.equal('vertical');
        });

        it('should be accessible and named by its label when vertical with a decorative start icon', async () => {
          const el = await fixture<CsButton>(html`
            <cs-button orientation="vertical">
              <cs-icon slot="start" library="system" name="settings"></cs-icon>
              Settings
            </cs-button>
          `);
          await expect(el).to.be.accessible();

          const button = (await a11ySnapshot({ selector: 'cs-button button' })) as unknown as AccessibilityNode;
          expect(button).to.include({ role: 'button', name: 'Settings' });
        });

        it('should be accessible and named by its label when a vertical link has a decorative start icon', async () => {
          const el = await fixture<CsButton>(html`
            <cs-button orientation="vertical" href="#settings">
              <cs-icon slot="start" library="system" name="settings"></cs-icon>
              Settings
            </cs-button>
          `);
          await expect(el).to.be.accessible();

          const link = (await a11ySnapshot({ selector: 'cs-button a' })) as unknown as AccessibilityNode;
          expect(link).to.include({ role: 'link', name: 'Settings' });
        });

        it('should stack start above the label and end below it, centered, in DOM order and with no added ARIA', async () => {
          let el!: CsButton;
          // Still laid out, though it warns; the stub keeps the warning out of the test output.
          const warnings = await endSlotWarnings(async () => {
            el = await fixture<CsButton>(html`
              <cs-button orientation="vertical">
                <cs-icon slot="start" library="system" name="settings"></cs-icon>
                Settings
                <cs-icon slot="end" library="system" name="keyboard_arrow_down"></cs-icon>
              </cs-button>
            `);
          });
          expect(warnings).to.have.lengthOf(1);
          const button = partOf(el, 'button');
          const buttonRect = button.getBoundingClientRect();
          const start = el.querySelector('[slot="start"]')!.getBoundingClientRect();
          const end = el.querySelector('[slot="end"]')!.getBoundingClientRect();
          const label = labelTextRect(el);

          expect(getComputedStyle(button).flexDirection).to.equal('column');
          expect(start.bottom).to.be.at.most(label.top + 0.5);
          expect(label.bottom).to.be.at.most(end.top + 0.5);
          for (const rect of [start, label, end]) {
            expect(Math.abs(centerX(rect) - centerX(buttonRect))).to.be.below(1);
          }

          for (const name of ['start', 'label', 'end']) {
            expect(getComputedStyle(partOf(el, name)).order).to.equal('0');
          }
          expect(el.hasAttribute('aria-orientation')).to.be.false;
          expect(button.hasAttribute('aria-orientation')).to.be.false;
        });

        it('should keep the one-row height fixed and use it as the stacked minimum', async () => {
          const el = await fixture<HTMLDivElement>(html`
            <div>
              <cs-button>Settings</cs-button>
              <cs-button orientation="vertical">
                <cs-icon slot="start" library="system" name="settings"></cs-icon>
                Settings
              </cs-button>
            </div>
          `);
          const [row, stacked] = [...el.querySelectorAll<CsButton>('cs-button')].map((button) =>
            partOf(button, 'button'),
          );
          const rowStyle = getComputedStyle(row);
          const stackedStyle = getComputedStyle(stacked);

          expect(rowStyle.whiteSpace).to.equal('nowrap');
          expect(stackedStyle.minHeight).to.equal(rowStyle.height);
          expect(stackedStyle.minWidth).to.equal(rowStyle.height);
          expect(stacked.getBoundingClientRect().height).to.be.above(row.getBoundingClientRect().height);
        });

        it('should keep a one-row button one control tall beside a labelled input in a stretching row', async () => {
          const el = await fixture<HTMLDivElement>(html`
            <div style="display: flex">
              <cs-input label="Name"></cs-input>
              <cs-button>Save</cs-button>
            </div>
          `);
          const host = el.querySelector<CsButton>('cs-button')!;
          const button = partOf(host, 'button');
          const control = formControlHeight(button);

          // The row stretches the host to the labelled input's height; the button inside must not follow it.
          expect(host.getBoundingClientRect().height).to.be.above(control + 1);
          expect(button.getBoundingClientRect().height).to.equal(control);
        });

        it('should keep the focus ring outside the box when vertical', async () => {
          const el = await fixture<CsButton>(html`
            <cs-button orientation="vertical" appearance="filled" variant="brand">
              <cs-icon slot="start" library="system" name="settings"></cs-icon>
              Settings
            </cs-button>
          `);
          const button = partOf(el, 'button');

          el.focus();
          await waitUntil(() => button.matches(':focus-visible'), 'the button never showed its focus ring');
          const style = getComputedStyle(button);

          expect(style.outlineStyle).to.equal('solid');
          expect(style.outlineOffset).to.equal('1px');
        });

        it('should be ignored by an icon-only button', async () => {
          const el = await fixture<CsButton>(html`
            <cs-button orientation="vertical">
              <cs-icon library="system" name="settings" label="Settings"></cs-icon>
            </cs-button>
          `);
          await waitUntil(() => partOf(el, 'button').classList.contains('is-icon-button'));
          const button = partOf(el, 'button');
          const rect = button.getBoundingClientRect();

          expect(getComputedStyle(button).flexDirection).to.equal('row');
          expect(Math.abs(rect.width - rect.height)).to.be.below(1);
        });

        it('should give every stacked button in a horizontal group the same height', async () => {
          const el = await fixture<HTMLElement>(html`
            <cs-button-group label="Sections">
              <cs-button orientation="vertical">
                <cs-icon slot="start" library="system" name="settings"></cs-icon>
                Settings
              </cs-button>
              <cs-button orientation="vertical">Search</cs-button>
              <cs-button orientation="vertical" with-caret>
                <cs-icon slot="start" library="system" name="person"></cs-icon>
                Profile
              </cs-button>
            </cs-button-group>
          `);
          const buttons = [...el.querySelectorAll<CsButton>('cs-button')].map((button) => partOf(button, 'button'));
          const heights = buttons.map((button) => button.getBoundingClientRect().height);
          const textOnlyMinimum = parseFloat(getComputedStyle(buttons[1]).minHeight);

          // The text-only button needs only the minimum; matching the others means it was stretched.
          expect(heights[1]).to.be.above(textOnlyMinimum + 1);
          for (const height of heights) {
            expect(Math.abs(height - heights[0])).to.be.below(1);
          }
        });

        for (const [name, textSpacing] of [
          ['default text spacing', ''],
          ['WCAG 1.4.12 text spacing', 'letter-spacing: 0.12em; word-spacing: 0.16em; line-height: 1.5;'],
        ]) {
          it(`should keep five small stacked items inside a 320px bar with ${name}`, async () => {
            // Written out rather than mapped: the SSR fixture cannot serialize nested templates.
            const el = await fixture<HTMLElement>(html`
              <nav aria-label="Main" style="display: flex; gap: 4px; width: 320px; ${textSpacing}">
                <cs-button orientation="vertical" size="s" href="#" style="flex: 1 1 0">
                  <cs-icon slot="start" library="system" name="settings"></cs-icon>
                  Home
                </cs-button>
                <cs-button orientation="vertical" size="s" href="#" style="flex: 1 1 0">
                  <cs-icon slot="start" library="system" name="settings"></cs-icon>
                  Search
                </cs-button>
                <cs-button orientation="vertical" size="s" href="#" style="flex: 1 1 0">
                  <cs-icon slot="start" library="system" name="settings"></cs-icon>
                  Notifications
                </cs-button>
                <cs-button orientation="vertical" size="s" href="#" style="flex: 1 1 0">
                  <cs-icon slot="start" library="system" name="settings"></cs-icon>
                  Messages
                </cs-button>
                <cs-button orientation="vertical" size="s" href="#" style="flex: 1 1 0">
                  <cs-icon slot="start" library="system" name="settings"></cs-icon>
                  Settings
                </cs-button>
              </nav>
            `);
            const bar = el.getBoundingClientRect();

            for (const item of el.querySelectorAll<CsButton>('cs-button')) {
              const button = partOf(item, 'button').getBoundingClientRect();
              const icon = item.querySelector('cs-icon')!.getBoundingClientRect();
              const label = item.textContent.trim();

              expect(isInside(button, bar), `"${label}" button spills out of the bar`).to.be.true;
              expect(isInside(labelTextRect(item), button), `"${label}" text spills out of its button`).to.be.true;
              expect(isInside(icon, button), `"${label}" icon spills out of its button`).to.be.true;
            }
          });
        }
      });

      describe('content alignment', () => {
        it('should center by default and follow --cs-button-justify-content set on an ancestor', async () => {
          const el = await fixture<HTMLDivElement>(html`
            <div>
              <cs-button>Settings</cs-button>
              <div style="--cs-button-justify-content: start">
                <cs-button>Settings</cs-button>
              </div>
            </div>
          `);
          const [plain, aligned] = [...el.querySelectorAll<CsButton>('cs-button')];

          expect(getComputedStyle(partOf(plain, 'button')).justifyContent).to.equal('center');
          expect(getComputedStyle(partOf(aligned, 'button')).justifyContent).to.equal('start');
        });

        it('should be ignored by icon-only and vertical buttons', async () => {
          const el = await fixture<HTMLDivElement>(html`
            <div style="--cs-button-justify-content: start">
              <cs-button><cs-icon library="system" name="settings" label="Settings"></cs-icon></cs-button>
              <cs-button orientation="vertical">
                <cs-icon slot="start" library="system" name="settings"></cs-icon>
                Settings
              </cs-button>
            </div>
          `);
          const [iconOnly, stacked] = [...el.querySelectorAll<CsButton>('cs-button')];
          await waitUntil(() => partOf(iconOnly, 'button').classList.contains('is-icon-button'));

          expect(getComputedStyle(partOf(iconOnly, 'button')).justifyContent).to.equal('center');
          expect(getComputedStyle(partOf(stacked, 'button')).justifyContent).to.equal('center');
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

  describe('vertical end slot warning', () => {
    for (const fixture of fixtures) {
      describe(`with "${fixture.type}" rendering`, () => {
        it('should warn when a vertical button has an element other than a badge in end', async () => {
          let el!: CsButton;
          const calls = await endSlotWarnings(async () => {
            el = await fixture<CsButton>(html`
              <cs-button orientation="vertical">
                Settings
                <cs-icon slot="end" library="system" name="keyboard_arrow_down"></cs-icon>
              </cs-button>
            `);
          });

          expect(calls).to.have.lengthOf(1);
          expect(calls[0].args[1]).to.equal(el);
        });

        it('should not warn when the only element in end of a vertical button is a badge', async () => {
          const calls = await endSlotWarnings(() =>
            fixture<CsButton>(html`
              <cs-button orientation="vertical">
                Messages
                <cs-badge slot="end" variant="danger" pill>3</cs-badge>
              </cs-button>
            `),
          );
          expect(calls).to.have.lengthOf(0);
        });

        it('should not warn when a horizontal button has an element in end', async () => {
          const calls = await endSlotWarnings(() =>
            fixture<CsButton>(html`
              <cs-button>
                Settings
                <cs-icon slot="end" library="system" name="keyboard_arrow_down"></cs-icon>
              </cs-button>
            `),
          );
          expect(calls).to.have.lengthOf(0);
        });

        it('should not warn when a vertical icon-only button has an element in end', async () => {
          const calls = await endSlotWarnings(() =>
            fixture<CsButton>(html`
              <cs-button orientation="vertical">
                <cs-icon library="system" name="settings" label="Settings"></cs-icon>
                <cs-icon slot="end" library="system" name="keyboard_arrow_down"></cs-icon>
              </cs-button>
            `),
          );
          expect(calls).to.have.lengthOf(0);
        });

        it('should warn when orientation changes to vertical after render', async () => {
          const el = await fixture<CsButton>(html`
            <cs-button>
              Settings
              <cs-icon slot="end" library="system" name="keyboard_arrow_down"></cs-icon>
            </cs-button>
          `);
          const calls = await endSlotWarnings(async () => {
            el.orientation = 'vertical';
            await el.updateComplete;
          });

          expect(calls).to.have.lengthOf(1);
          expect(calls[0].args[1]).to.equal(el);
        });
      });
    }
  });
});
