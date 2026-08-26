import { aTimeout, expect, waitUntil } from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import { html } from 'lit';
import { expectEvent } from '../../internal/test/expect-event.js';
import { fixtures } from '../../internal/test/fixture.js';
import { clickOnElement } from '../../internal/test/pointer-utilities.js';
import type CsDialog from './dialog.js';

describe('<cs-dialog>', () => {
  for (const fixture of fixtures) {
    describe(`with "${fixture.type}" rendering`, () => {
      describe('accessibility', () => {
        it('should pass accessibility tests', async () => {
          const el = await fixture<CsDialog>(html`<cs-dialog label="Settings" open>Content</cs-dialog>`);
          await expect(el).to.be.accessible();
        });
      });

      describe('accessibility', () => {
        it('should be hidden when closed', async () => {
          const el = await fixture<CsDialog>(html`<cs-dialog>Content</cs-dialog>`);
          expect(getComputedStyle(el).display).to.equal('none');
        });

        it('should be visible when open', async () => {
          const el = await fixture<CsDialog>(html`<cs-dialog open>Content</cs-dialog>`);
          expect(getComputedStyle(el).display).to.not.equal('none');
        });

        it('should focus the element with autofocus when opened', async () => {
          const el = await fixture<CsDialog>(html`<cs-dialog><cs-input autofocus></cs-input></cs-dialog>`);
          const input = el.querySelector('cs-input')!;

          el.open = true;
          await aTimeout(250);

          expect(document.activeElement).to.equal(input);
        });
      });

      describe('properties', () => {
        it('should default open to false', async () => {
          const el = await fixture<CsDialog>(html`<cs-dialog>Content</cs-dialog>`);
          expect(el.open).to.be.false;
        });

        it('should reflect open attribute', async () => {
          const el = await fixture<CsDialog>(html`<cs-dialog open>Content</cs-dialog>`);
          expect(el.open).to.be.true;
          expect(el.hasAttribute('open')).to.be.true;
        });

        it('should set label text in the header', async () => {
          const el = await fixture<CsDialog>(html`<cs-dialog open label="Test Label">Content</cs-dialog>`);
          const title = el.shadowRoot!.querySelector('[part="title"]')!;
          expect(title.textContent).to.contain('Test Label');
        });

        it('should hide the header when without-header is set', async () => {
          const el = await fixture<CsDialog>(html`<cs-dialog open without-header>Content</cs-dialog>`);
          const header = el.shadowRoot!.querySelector('[part="header"]');
          expect(header).to.be.null;
        });

        it('should show the header by default', async () => {
          const el = await fixture<CsDialog>(html`<cs-dialog open>Content</cs-dialog>`);
          const header = el.shadowRoot!.querySelector('[part="header"]');
          expect(header).to.not.be.null;
        });

        it('should default lightDismiss to false', async () => {
          const el = await fixture<CsDialog>(html`<cs-dialog>Content</cs-dialog>`);
          expect(el.lightDismiss).to.be.false;
        });
      });

      describe('events', () => {
        it('should emit cs-show and cs-after-show when setting open = true', async () => {
          const el = await fixture<CsDialog>(html`<cs-dialog>Content</cs-dialog>`);

          await expectEvent(el, ['cs-show', 'cs-after-show'], () => {
            el.open = true;
          });

          expect(el.open).to.be.true;
          expect(getComputedStyle(el).display).to.not.equal('none');
        });

        it('should emit cs-hide and cs-after-hide when setting open = false', async () => {
          const el = await fixture<CsDialog>(html`<cs-dialog open>Content</cs-dialog>`);

          await expectEvent(el, ['cs-hide', 'cs-after-hide'], () => {
            el.open = false;
          });

          expect(el.open).to.be.false;
          expect(getComputedStyle(el).display).to.equal('none');
        });

        it('should not close when cs-hide is prevented', async () => {
          const el = await fixture<CsDialog>(html`<cs-dialog open>Content</cs-dialog>`);

          el.addEventListener('cs-hide', (event) => {
            event.preventDefault();
          });

          await clickOnElement(el);
          await sendKeys({ press: 'Escape' });
          await aTimeout(250);

          expect(el.open).to.be.true;
        });

        it('should include source in cs-hide event detail', async () => {
          const el = await fixture<CsDialog>(html`<cs-dialog open>Content</cs-dialog>`);

          const [hideEvent] = await expectEvent(el, 'cs-hide', async () => {
            await clickOnElement(el);
            await sendKeys({ press: 'Escape' });
          });

          expect((hideEvent as CustomEvent).detail.source).to.exist;
        });
      });

      describe('slots', () => {
        it('should render the default slot content', async () => {
          const el = await fixture<CsDialog>(html`<cs-dialog open>Dialog body content</cs-dialog>`);
          const body = el.shadowRoot!.querySelector('[part="body"]')!;
          expect(body).to.not.be.null;
        });

        it('should render the label slot', async () => {
          const el = await fixture<CsDialog>(html`
            <cs-dialog open>
              <span slot="label">Custom Label</span>
              Content
            </cs-dialog>
          `);
          const labelSlot = el.shadowRoot!.querySelector('slot[name="label"]') as HTMLSlotElement;
          expect(labelSlot).to.not.be.null;
        });

        it('should render the header-actions slot', async () => {
          const el = await fixture<CsDialog>(html`
            <cs-dialog open>
              <cs-button slot="header-actions">Action</cs-button>
              Content
            </cs-dialog>
          `);
          const headerActionsSlot = el.shadowRoot!.querySelector('slot[name="header-actions"]') as HTMLSlotElement;
          expect(headerActionsSlot).to.not.be.null;
        });

        it('should render the footer slot', async () => {
          const el = await fixture<CsDialog>(html`
            <cs-dialog open>
              Content
              <cs-button slot="footer">OK</cs-button>
            </cs-dialog>
          `);
          // Trigger a re-render so the HasSlotController detects the footer
          el.requestUpdate();
          await el.updateComplete;
          const footer = el.shadowRoot!.querySelector('[part="footer"]');
          expect(footer).to.not.be.null;
        });
      });

      describe('keyboard navigation', () => {
        it('should close when pressing Escape', async () => {
          const el = await fixture<CsDialog>(html`<cs-dialog open>Content</cs-dialog>`);

          await expectEvent(el, 'cs-after-hide', async () => {
            await clickOnElement(el);
            await sendKeys({ press: 'Escape' });
          });

          expect(el.open).to.be.false;
        });

        it('should not close when a bubbled cancel event originates from within the dialog', async () => {
          const el = await fixture<CsDialog>(html`<cs-dialog open><input type="file" /></cs-dialog>`);
          const input = el.querySelector('input')!;

          const cancelEvent = new Event('cancel', { bubbles: true });
          input.dispatchEvent(cancelEvent);
          await aTimeout(250);

          expect(el.open).to.be.true;
        });
      });

      describe('light dismiss', () => {
        it('should not close when clicking the backdrop by default', async () => {
          const el = await fixture<CsDialog>(html`<cs-dialog open>Content</cs-dialog>`);
          const dialog = el.shadowRoot!.querySelector<HTMLDialogElement>('.dialog')!;

          // Simulate a backdrop click by dispatching pointerdown with the dialog as the target
          dialog.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
          await aTimeout(250);

          expect(el.open).to.be.true;
        });

        it('should close when clicking the backdrop when light-dismiss is enabled', async () => {
          const el = await fixture<CsDialog>(html`<cs-dialog open light-dismiss>Content</cs-dialog>`);
          const dialog = el.shadowRoot!.querySelector<HTMLDialogElement>('.dialog')!;

          await expectEvent(el, 'cs-after-hide', () => {
            // Simulate a backdrop click by dispatching pointerdown with the dialog as the target
            dialog.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
          });

          expect(el.open).to.be.false;
        });

        it('should not close when clicking inside the dialog even when light-dismiss is enabled', async () => {
          const el = await fixture<CsDialog>(html`<cs-dialog open light-dismiss>Content</cs-dialog>`);
          const body = el.shadowRoot!.querySelector<HTMLElement>('[part="body"]')!;

          // pointerdown originates from the body, not the backdrop, so it should not dismiss
          body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
          await aTimeout(250);

          expect(el.open).to.be.true;
        });
      });

      describe('CSS parts and states', () => {
        it('should expose the dialog part', async () => {
          const el = await fixture<CsDialog>(html`<cs-dialog open>Content</cs-dialog>`);
          expect(el.shadowRoot!.querySelector('[part="dialog"]')).to.not.be.null;
        });

        it('should expose the header part', async () => {
          const el = await fixture<CsDialog>(html`<cs-dialog open>Content</cs-dialog>`);
          expect(el.shadowRoot!.querySelector('[part="header"]')).to.not.be.null;
        });

        it('should expose the title part', async () => {
          const el = await fixture<CsDialog>(html`<cs-dialog open>Content</cs-dialog>`);
          expect(el.shadowRoot!.querySelector('[part="title"]')).to.not.be.null;
        });

        it('should expose the header-actions part', async () => {
          const el = await fixture<CsDialog>(html`<cs-dialog open>Content</cs-dialog>`);
          expect(el.shadowRoot!.querySelector('[part="header-actions"]')).to.not.be.null;
        });

        it('should expose the close-button part', async () => {
          const el = await fixture<CsDialog>(html`<cs-dialog open>Content</cs-dialog>`);
          expect(el.shadowRoot!.querySelector('[part="close-button"]')).to.not.be.null;
        });

        it('should expose the body part', async () => {
          const el = await fixture<CsDialog>(html`<cs-dialog open>Content</cs-dialog>`);
          expect(el.shadowRoot!.querySelector('[part="body"]')).to.not.be.null;
        });

        it('should expose the footer part when footer slot is used', async () => {
          const el = await fixture<CsDialog>(html`
            <cs-dialog open>
              Content
              <cs-button slot="footer">OK</cs-button>
            </cs-dialog>
          `);
          el.requestUpdate();
          await el.updateComplete;
          expect(el.shadowRoot!.querySelector('[part="footer"]')).to.not.be.null;
        });
      });

      describe('hidden by third-party styles', () => {
        it('should suspend the modal when hidden while open and resume it when rendered again', async () => {
          const el = await fixture<CsDialog>(html`<cs-dialog open label="Dialog">Content</cs-dialog>`);

          expect(document.documentElement.classList.contains('cs-scroll-lock')).to.be.true;

          // Simulate a content blocker hiding the dialog with a cosmetic filter
          el.style.setProperty('display', 'none', 'important');
          await waitUntil(() => !document.documentElement.classList.contains('cs-scroll-lock'));

          // The native dialog is closed so the page isn't inert, but the component stays logically open
          expect(el.dialog.open).to.be.false;
          expect(el.open).to.be.true;

          // Unhide it and the modal should resume
          el.style.removeProperty('display');
          await waitUntil(() => document.documentElement.classList.contains('cs-scroll-lock'));

          expect(el.dialog.open).to.be.true;
          expect(el.open).to.be.true;
        });

        it('should not keep the page scroll locked when the dialog is already hidden before it opens', async () => {
          // Simulate an extension stylesheet injected before the dialog opens
          const style = document.createElement('style');
          style.textContent = 'cs-dialog { display: none !important; }';
          document.head.append(style);

          try {
            const el = await fixture<CsDialog>(html`<cs-dialog open label="Dialog">Content</cs-dialog>`);

            await waitUntil(() => !document.documentElement.classList.contains('cs-scroll-lock'));
            expect(el.dialog.open).to.be.false;
            expect(el.open).to.be.true;

            // Removing the stylesheet should resume the modal
            style.remove();
            await waitUntil(() => document.documentElement.classList.contains('cs-scroll-lock'));
            expect(el.dialog.open).to.be.true;
          } finally {
            style.remove();
          }
        });
      });
    });
  }
});
