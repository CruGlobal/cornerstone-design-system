import { aTimeout, expect, waitUntil } from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import { html } from 'lit';
import { expectEvent } from '../../internal/test/expect-event.js';
import { fixtures } from '../../internal/test/fixture.js';
import { clickOnElement } from '../../internal/test/pointer-utilities.js';
import type CsDrawer from './drawer.js';

describe('<cs-drawer>', () => {
  for (const fixture of fixtures) {
    describe(`with "${fixture.type}" rendering`, () => {
      describe('accessibility', () => {
        it('should pass accessibility tests', async () => {
          const el = await fixture<CsDrawer>(html`<cs-drawer label="Menu" open>Content</cs-drawer>`);
          await expect(el).to.be.accessible();
        });
      });

      describe('accessibility', () => {
        it('should be hidden when closed', async () => {
          const el = await fixture<CsDrawer>(html`<cs-drawer>Content</cs-drawer>`);
          expect(getComputedStyle(el).display).to.equal('none');
        });

        it('should be visible when open', async () => {
          const el = await fixture<CsDrawer>(html`<cs-drawer open>Content</cs-drawer>`);
          expect(getComputedStyle(el).display).to.not.equal('none');
        });

        it('should focus the element with autofocus when opened', async () => {
          const el = await fixture<CsDrawer>(html`<cs-drawer><cs-input autofocus></cs-input></cs-drawer>`);
          const input = el.querySelector('cs-input')!;

          el.open = true;
          await aTimeout(250);

          expect(document.activeElement).to.equal(input);
        });
      });

      describe('properties', () => {
        it('should default open to false', async () => {
          const el = await fixture<CsDrawer>(html`<cs-drawer>Content</cs-drawer>`);
          expect(el.open).to.be.false;
        });

        it('should reflect open attribute', async () => {
          const el = await fixture<CsDrawer>(html`<cs-drawer open>Content</cs-drawer>`);
          expect(el.open).to.be.true;
          expect(el.hasAttribute('open')).to.be.true;
        });

        it('should set label text in the header', async () => {
          const el = await fixture<CsDrawer>(html`<cs-drawer open label="Test Label">Content</cs-drawer>`);
          const title = el.shadowRoot!.querySelector('[part="title"]')!;
          expect(title.textContent).to.contain('Test Label');
        });

        it('should hide the header when without-header is set', async () => {
          const el = await fixture<CsDrawer>(html`<cs-drawer open without-header>Content</cs-drawer>`);
          const header = el.shadowRoot!.querySelector('[part="header"]');
          expect(header).to.be.null;
        });

        it('should show the header by default', async () => {
          const el = await fixture<CsDrawer>(html`<cs-drawer open>Content</cs-drawer>`);
          const header = el.shadowRoot!.querySelector('[part="header"]');
          expect(header).to.not.be.null;
        });

        it('should default placement to end', async () => {
          const el = await fixture<CsDrawer>(html`<cs-drawer>Content</cs-drawer>`);
          expect(el.placement).to.equal('end');
        });

        it('should accept start placement', async () => {
          const el = await fixture<CsDrawer>(html`<cs-drawer placement="start">Content</cs-drawer>`);
          expect(el.placement).to.equal('start');
          expect(el.getAttribute('placement')).to.equal('start');
        });

        it('should accept top placement', async () => {
          const el = await fixture<CsDrawer>(html`<cs-drawer placement="top">Content</cs-drawer>`);
          expect(el.placement).to.equal('top');
        });

        it('should accept bottom placement', async () => {
          const el = await fixture<CsDrawer>(html`<cs-drawer placement="bottom">Content</cs-drawer>`);
          expect(el.placement).to.equal('bottom');
        });

        it('should accept end placement', async () => {
          const el = await fixture<CsDrawer>(html`<cs-drawer placement="end">Content</cs-drawer>`);
          expect(el.placement).to.equal('end');
        });

        it('should default lightDismiss to false', async () => {
          const el = await fixture<CsDrawer>(html`<cs-drawer>Content</cs-drawer>`);
          expect(el.lightDismiss).to.be.false;
        });
      });

      describe('events', () => {
        it('should emit cs-show and cs-after-show when setting open = true', async () => {
          const el = await fixture<CsDrawer>(html`<cs-drawer>Content</cs-drawer>`);

          await expectEvent(el, ['cs-show', 'cs-after-show'], () => {
            el.open = true;
          });

          expect(el.open).to.be.true;
          expect(getComputedStyle(el).display).to.not.equal('none');
        });

        it('should emit cs-hide and cs-after-hide when setting open = false', async () => {
          const el = await fixture<CsDrawer>(html`<cs-drawer open>Content</cs-drawer>`);

          await expectEvent(el, ['cs-hide', 'cs-after-hide'], () => {
            el.open = false;
          });

          expect(el.open).to.be.false;
          expect(getComputedStyle(el).display).to.equal('none');
        });

        it('should not close when cs-hide is prevented', async () => {
          const el = await fixture<CsDrawer>(html`<cs-drawer open>Content</cs-drawer>`);

          el.addEventListener('cs-hide', (event) => {
            event.preventDefault();
          });

          await sendKeys({ press: 'Escape' });
          await aTimeout(250);

          expect(el.open).to.be.true;
        });

        it('should include source in cs-hide event detail', async () => {
          const el = await fixture<CsDrawer>(html`<cs-drawer open>Content</cs-drawer>`);

          const [hideEvent] = await expectEvent(el, 'cs-hide', async () => {
            await clickOnElement(el);
            await sendKeys({ press: 'Escape' });
          });

          expect((hideEvent as CustomEvent).detail.source).to.exist;
        });
      });

      describe('slots', () => {
        it('should render the default slot content', async () => {
          const el = await fixture<CsDrawer>(html`<cs-drawer open>Drawer body content</cs-drawer>`);
          const body = el.shadowRoot!.querySelector('[part="body"]')!;
          expect(body).to.not.be.null;
        });

        it('should render the label slot', async () => {
          const el = await fixture<CsDrawer>(html`
            <cs-drawer open>
              <span slot="label">Custom Label</span>
              Content
            </cs-drawer>
          `);
          const labelSlot = el.shadowRoot!.querySelector('slot[name="label"]') as HTMLSlotElement;
          expect(labelSlot).to.not.be.null;
        });

        it('should render the header-actions slot', async () => {
          const el = await fixture<CsDrawer>(html`
            <cs-drawer open>
              <cs-button slot="header-actions">Action</cs-button>
              Content
            </cs-drawer>
          `);
          const headerActionsSlot = el.shadowRoot!.querySelector('slot[name="header-actions"]') as HTMLSlotElement;
          expect(headerActionsSlot).to.not.be.null;
        });

        it('should render the footer slot', async () => {
          const el = await fixture<CsDrawer>(html`
            <cs-drawer open>
              Content
              <cs-button slot="footer">OK</cs-button>
            </cs-drawer>
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
          const el = await fixture<CsDrawer>(html`<cs-drawer open>Content</cs-drawer>`);

          await expectEvent(el, 'cs-after-hide', async () => {
            await clickOnElement(el);
            await sendKeys({ press: 'Escape' });
          });

          expect(el.open).to.be.false;
        });

        it('should not close when a bubbled cancel event originates from within the drawer', async () => {
          const el = await fixture<CsDrawer>(html`<cs-drawer open><input type="file" /></cs-drawer>`);
          const input = el.querySelector('input')!;

          const cancelEvent = new Event('cancel', { bubbles: true });
          input.dispatchEvent(cancelEvent);
          await aTimeout(250);

          expect(el.open).to.be.true;
        });
      });

      describe('light dismiss', () => {
        it('should not close when clicking the backdrop by default', async () => {
          const el = await fixture<CsDrawer>(html`<cs-drawer open>Content</cs-drawer>`);
          const dialog = el.shadowRoot!.querySelector<HTMLDialogElement>('.drawer')!;

          // Simulate a backdrop click by dispatching pointerdown with the dialog as the target
          dialog.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
          await aTimeout(250);

          expect(el.open).to.be.true;
        });

        it('should close when clicking the backdrop when light-dismiss is enabled', async () => {
          const el = await fixture<CsDrawer>(html`<cs-drawer open light-dismiss>Content</cs-drawer>`);
          const dialog = el.shadowRoot!.querySelector<HTMLDialogElement>('.drawer')!;

          await expectEvent(el, 'cs-after-hide', () => {
            // Simulate a backdrop click by dispatching pointerdown with the dialog as the target
            dialog.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
          });

          expect(el.open).to.be.false;
        });

        it('should not close when clicking inside the drawer even when light-dismiss is enabled', async () => {
          const el = await fixture<CsDrawer>(html`<cs-drawer open light-dismiss>Content</cs-drawer>`);
          const body = el.shadowRoot!.querySelector<HTMLElement>('[part="body"]')!;

          // pointerdown originates from the body, not the backdrop, so it should not dismiss
          body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
          await aTimeout(250);

          expect(el.open).to.be.true;
        });
      });

      describe('CSS parts and states', () => {
        it('should expose the dialog part', async () => {
          const el = await fixture<CsDrawer>(html`<cs-drawer open>Content</cs-drawer>`);
          expect(el.shadowRoot!.querySelector('[part="dialog"]')).to.not.be.null;
        });

        it('should expose the header part', async () => {
          const el = await fixture<CsDrawer>(html`<cs-drawer open>Content</cs-drawer>`);
          expect(el.shadowRoot!.querySelector('[part="header"]')).to.not.be.null;
        });

        it('should expose the title part', async () => {
          const el = await fixture<CsDrawer>(html`<cs-drawer open>Content</cs-drawer>`);
          expect(el.shadowRoot!.querySelector('[part="title"]')).to.not.be.null;
        });

        it('should expose the header-actions part', async () => {
          const el = await fixture<CsDrawer>(html`<cs-drawer open>Content</cs-drawer>`);
          expect(el.shadowRoot!.querySelector('[part="header-actions"]')).to.not.be.null;
        });

        it('should expose the close-button part', async () => {
          const el = await fixture<CsDrawer>(html`<cs-drawer open>Content</cs-drawer>`);
          expect(el.shadowRoot!.querySelector('[part="close-button"]')).to.not.be.null;
        });

        it('should expose the body part', async () => {
          const el = await fixture<CsDrawer>(html`<cs-drawer open>Content</cs-drawer>`);
          expect(el.shadowRoot!.querySelector('[part="body"]')).to.not.be.null;
        });

        it('should expose the footer part when footer slot is used', async () => {
          const el = await fixture<CsDrawer>(html`
            <cs-drawer open>
              Content
              <cs-button slot="footer">OK</cs-button>
            </cs-drawer>
          `);
          el.requestUpdate();
          await el.updateComplete;
          expect(el.shadowRoot!.querySelector('[part="footer"]')).to.not.be.null;
        });

        it('should apply placement class to internal dialog element', async () => {
          const el = await fixture<CsDrawer>(html`<cs-drawer open placement="start">Content</cs-drawer>`);
          const dialog = el.shadowRoot!.querySelector('[part="dialog"]')!;
          expect(dialog.classList.contains('start')).to.be.true;
        });
      });

      describe('hidden by third-party styles', () => {
        it('should suspend the modal when hidden while open and resume it when rendered again', async () => {
          const el = await fixture<CsDrawer>(html`<cs-drawer open label="Drawer">Content</cs-drawer>`);

          expect(document.documentElement.classList.contains('cs-scroll-lock')).to.be.true;

          // Simulate a content blocker hiding the drawer with a cosmetic filter
          el.style.setProperty('display', 'none', 'important');
          await waitUntil(() => !document.documentElement.classList.contains('cs-scroll-lock'));

          // The native dialog is closed so the page isn't inert, but the component stays logically open
          expect(el.drawer.open).to.be.false;
          expect(el.open).to.be.true;

          // Unhide it and the modal should resume
          el.style.removeProperty('display');
          await waitUntil(() => document.documentElement.classList.contains('cs-scroll-lock'));

          expect(el.drawer.open).to.be.true;
          expect(el.open).to.be.true;
        });

        it('should not keep the page scroll locked when the drawer is already hidden before it opens', async () => {
          // Simulate an extension stylesheet injected before the drawer opens
          const style = document.createElement('style');
          style.textContent = 'cs-drawer { display: none !important; }';
          document.head.append(style);

          try {
            const el = await fixture<CsDrawer>(html`<cs-drawer open label="Drawer">Content</cs-drawer>`);

            await waitUntil(() => !document.documentElement.classList.contains('cs-scroll-lock'));
            expect(el.drawer.open).to.be.false;
            expect(el.open).to.be.true;

            // Removing the stylesheet should resume the modal
            style.remove();
            await waitUntil(() => document.documentElement.classList.contains('cs-scroll-lock'));
            expect(el.drawer.open).to.be.true;
          } finally {
            style.remove();
          }
        });
      });
    });
  }
});
