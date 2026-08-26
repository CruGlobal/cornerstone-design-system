import { aTimeout, expect, waitUntil } from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import { html } from 'lit';
import sinon from 'sinon';
import { expectEvent } from '../../internal/test/expect-event.js';
import { fixtures } from '../../internal/test/fixture.js';
import { clickOnElement } from '../../internal/test/pointer-utilities.js';
import type CsPopover from './popover.js';

describe('<cs-popover>', () => {
  for (const fixture of fixtures) {
    describe(`with "${fixture.type}" rendering`, () => {
      describe('accessibility', () => {
        it('should pass accessibility tests', async () => {
          const el = await fixture(
            html`<div>
              <cs-button id="pop-anchor">Anchor</cs-button><cs-popover for="pop-anchor">Popover content</cs-popover>
            </div>`,
          );
          await expect(el).to.be.accessible();
        });
      });

      describe('accessibility', () => {
        it('should use a dialog element internally', async () => {
          const el = await fixture<HTMLDivElement>(html`
            <div>
              <cs-button id="anchor">Anchor</cs-button>
              <cs-popover for="anchor">Popover content</cs-popover>
            </div>
          `);
          const popover = el.querySelector<CsPopover>('cs-popover')!;
          await popover.updateComplete;
          const dialog = popover.shadowRoot!.querySelector('dialog');
          expect(dialog).to.exist;
        });
      });

      describe('properties', () => {
        it('should render a component', async () => {
          const el = await fixture(html`<cs-popover></cs-popover>`);
          expect(el).to.exist;
        });

        it('should default to closed', async () => {
          const el = await fixture<HTMLDivElement>(html`
            <div>
              <cs-button id="anchor">Anchor</cs-button>
              <cs-popover for="anchor">Content</cs-popover>
            </div>
          `);
          const popover = el.querySelector<CsPopover>('cs-popover')!;
          expect(popover.open).to.be.false;
        });

        it('should default placement to top', async () => {
          const el = await fixture<HTMLDivElement>(html`
            <div>
              <cs-button id="anchor">Anchor</cs-button>
              <cs-popover for="anchor">Content</cs-popover>
            </div>
          `);
          const popover = el.querySelector<CsPopover>('cs-popover')!;
          expect(popover.placement).to.equal('top');
        });

        it('should accept a custom placement', async () => {
          const el = await fixture<HTMLDivElement>(html`
            <div>
              <cs-button id="anchor">Anchor</cs-button>
              <cs-popover for="anchor" placement="bottom-start">Content</cs-popover>
            </div>
          `);
          const popover = el.querySelector<CsPopover>('cs-popover')!;
          expect(popover.placement).to.equal('bottom-start');
        });

        it('should default distance to 8', async () => {
          const el = await fixture<HTMLDivElement>(html`
            <div>
              <cs-button id="anchor">Anchor</cs-button>
              <cs-popover for="anchor">Content</cs-popover>
            </div>
          `);
          const popover = el.querySelector<CsPopover>('cs-popover')!;
          expect(popover.distance).to.equal(8);
        });

        it('should accept a custom distance', async () => {
          const el = await fixture<HTMLDivElement>(html`
            <div>
              <cs-button id="anchor">Anchor</cs-button>
              <cs-popover for="anchor" distance="20">Content</cs-popover>
            </div>
          `);
          const popover = el.querySelector<CsPopover>('cs-popover')!;
          expect(popover.distance).to.equal(20);
        });

        it('should accept skidding property', async () => {
          const el = await fixture<HTMLDivElement>(html`
            <div>
              <cs-button id="anchor">Anchor</cs-button>
              <cs-popover for="anchor" skidding="15">Content</cs-popover>
            </div>
          `);
          const popover = el.querySelector<CsPopover>('cs-popover')!;
          expect(popover.skidding).to.equal(15);
        });

        it('should accept the for property', async () => {
          const el = await fixture<HTMLDivElement>(html`
            <div>
              <cs-button id="my-anchor">Anchor</cs-button>
              <cs-popover for="my-anchor">Content</cs-popover>
            </div>
          `);
          const popover = el.querySelector<CsPopover>('cs-popover')!;
          expect(popover.for).to.equal('my-anchor');
        });

        it('should accept without-arrow property', async () => {
          const el = await fixture<HTMLDivElement>(html`
            <div>
              <cs-button id="anchor">Anchor</cs-button>
              <cs-popover for="anchor" without-arrow>Content</cs-popover>
            </div>
          `);
          const popover = el.querySelector<CsPopover>('cs-popover')!;
          expect(popover.withoutArrow).to.be.true;
        });
      });

      describe('events', () => {
        it('should fire cs-show and cs-after-show when opening via open property', async () => {
          const el = await fixture<HTMLDivElement>(html`
            <div>
              <cs-button id="anchor">Anchor</cs-button>
              <cs-popover for="anchor">Content</cs-popover>
            </div>
          `);
          const popover = el.querySelector<CsPopover>('cs-popover')!;

          await expectEvent(popover, ['cs-show', 'cs-after-show'], () => {
            popover.open = true;
          });

          expect(popover.open).to.be.true;
        });

        it('should fire cs-hide and cs-after-hide when closing via open property', async () => {
          const el = await fixture<HTMLDivElement>(html`
            <div>
              <cs-button id="anchor">Anchor</cs-button>
              <cs-popover for="anchor" open>Content</cs-popover>
            </div>
          `);
          const popover = el.querySelector<CsPopover>('cs-popover')!;
          await popover.updateComplete;
          await aTimeout(200);

          await expectEvent(popover, ['cs-hide', 'cs-after-hide'], () => {
            popover.open = false;
          });

          expect(popover.open).to.be.false;
        });

        it('should fire cs-show and cs-after-show when calling show()', async () => {
          const el = await fixture<HTMLDivElement>(html`
            <div>
              <cs-button id="anchor">Anchor</cs-button>
              <cs-popover for="anchor">Content</cs-popover>
            </div>
          `);
          const popover = el.querySelector<CsPopover>('cs-popover')!;

          await expectEvent(popover, ['cs-show', 'cs-after-show'], () => {
            popover.show();
          });

          expect(popover.open).to.be.true;
        });

        it('should fire cs-hide and cs-after-hide when calling hide()', async () => {
          const el = await fixture<HTMLDivElement>(html`
            <div>
              <cs-button id="anchor">Anchor</cs-button>
              <cs-popover for="anchor" open>Content</cs-popover>
            </div>
          `);
          const popover = el.querySelector<CsPopover>('cs-popover')!;
          await popover.updateComplete;
          await aTimeout(200);

          await expectEvent(popover, ['cs-hide', 'cs-after-hide'], () => {
            popover.hide();
          });

          expect(popover.open).to.be.false;
        });

        it('should not fire cs-after-show when cs-show is prevented', async () => {
          const el = await fixture<HTMLDivElement>(html`
            <div>
              <cs-button id="anchor">Anchor</cs-button>
              <cs-popover for="anchor">Content</cs-popover>
            </div>
          `);
          const popover = el.querySelector<CsPopover>('cs-popover')!;
          const afterShowSpy = sinon.spy();

          popover.addEventListener('cs-show', (event) => event.preventDefault());
          popover.addEventListener('cs-after-show', afterShowSpy);

          popover.open = true;
          await aTimeout(200);

          expect(afterShowSpy.callCount).to.equal(0);
          expect(popover.open).to.be.false;
        });

        it('should not fire cs-after-hide when cs-hide is prevented', async () => {
          const el = await fixture<HTMLDivElement>(html`
            <div>
              <cs-button id="anchor">Anchor</cs-button>
              <cs-popover for="anchor" open>Content</cs-popover>
            </div>
          `);
          const popover = el.querySelector<CsPopover>('cs-popover')!;
          await popover.updateComplete;
          await aTimeout(200);

          const afterHideSpy = sinon.spy();
          popover.addEventListener('cs-hide', (event) => event.preventDefault());
          popover.addEventListener('cs-after-hide', afterHideSpy);

          popover.open = false;
          await aTimeout(200);

          expect(afterHideSpy.callCount).to.equal(0);
          expect(popover.open).to.be.true;
        });
      });

      describe('slots', () => {
        it('should accept content in the default slot', async () => {
          const el = await fixture<HTMLDivElement>(html`
            <div>
              <cs-button id="anchor">Anchor</cs-button>
              <cs-popover for="anchor">
                <p>Hello world</p>
              </cs-popover>
            </div>
          `);
          const popover = el.querySelector<CsPopover>('cs-popover')!;
          const content = popover.querySelector('p');
          expect(content).to.exist;
          expect(content!.textContent).to.equal('Hello world');
        });
      });

      describe('keyboard navigation', () => {
        it('should close on Escape', async () => {
          const el = await fixture<HTMLDivElement>(html`
            <div>
              <cs-button id="anchor">Anchor</cs-button>
              <cs-popover for="anchor">Content</cs-popover>
            </div>
          `);
          const popover = el.querySelector<CsPopover>('cs-popover')!;

          popover.open = true;
          await waitUntil(() => popover.open);
          await aTimeout(200);

          await sendKeys({ press: 'Escape' });
          await waitUntil(() => !popover.open);

          expect(popover.open).to.be.false;
        });
      });

      describe('CSS parts and states', () => {
        it('should expose the dialog CSS part', async () => {
          const el = await fixture<HTMLDivElement>(html`
            <div>
              <cs-button id="anchor">Anchor</cs-button>
              <cs-popover for="anchor">Content</cs-popover>
            </div>
          `);
          const popover = el.querySelector<CsPopover>('cs-popover')!;
          const dialog = popover.shadowRoot!.querySelector('[part~="dialog"]');
          expect(dialog).to.exist;
        });

        it('should expose the body CSS part', async () => {
          const el = await fixture<HTMLDivElement>(html`
            <div>
              <cs-button id="anchor">Anchor</cs-button>
              <cs-popover for="anchor">Content</cs-popover>
            </div>
          `);
          const popover = el.querySelector<CsPopover>('cs-popover')!;
          const body = popover.shadowRoot!.querySelector('[part~="body"]');
          expect(body).to.exist;
        });

        it('should expose the popup CSS part', async () => {
          const el = await fixture<HTMLDivElement>(html`
            <div>
              <cs-button id="anchor">Anchor</cs-button>
              <cs-popover for="anchor">Content</cs-popover>
            </div>
          `);
          const popover = el.querySelector<CsPopover>('cs-popover')!;
          const popup = popover.shadowRoot!.querySelector('[part~="popup"]');
          expect(popup).to.exist;
        });
      });
    });
  }

  describe('trigger interaction', () => {
    it('should toggle open when the anchor is clicked', async () => {
      const el = await fixtures[0]<HTMLDivElement>(html`
        <div>
          <cs-button id="anchor">Anchor</cs-button>
          <cs-popover for="anchor">Content</cs-popover>
        </div>
      `);
      const popover = el.querySelector<CsPopover>('cs-popover')!;
      const anchor = el.querySelector<HTMLElement>('#anchor')!;

      await clickOnElement(anchor);
      await waitUntil(() => popover.open);
      expect(popover.open).to.be.true;

      await aTimeout(200);

      await clickOnElement(anchor);
      await waitUntil(() => !popover.open);
      expect(popover.open).to.be.false;
    });

    it('should close when clicking outside', async () => {
      const el = await fixtures[0]<HTMLDivElement>(html`
        <div style="padding: 200px;">
          <cs-button id="anchor">Anchor</cs-button>
          <cs-popover for="anchor">Content</cs-popover>
        </div>
      `);
      const popover = el.querySelector<CsPopover>('cs-popover')!;

      popover.open = true;
      await waitUntil(() => popover.open);
      await aTimeout(200);

      // Click outside the popover
      await clickOnElement(el, 'top');
      await waitUntil(() => !popover.open);

      expect(popover.open).to.be.false;
    });

    it('should close when a data-popover="close" button is clicked', async () => {
      const el = await fixtures[0]<HTMLDivElement>(html`
        <div>
          <cs-button id="anchor">Anchor</cs-button>
          <cs-popover for="anchor">
            <button data-popover="close">Close me</button>
          </cs-popover>
        </div>
      `);
      const popover = el.querySelector<CsPopover>('cs-popover')!;

      popover.open = true;
      await waitUntil(() => popover.open);
      await aTimeout(200);

      const closeButton = popover.querySelector<HTMLElement>('[data-popover="close"]')!;
      await clickOnElement(closeButton);
      await waitUntil(() => !popover.open);

      expect(popover.open).to.be.false;
    });
  });

  describe('dismissible stack', () => {
    it('should only close the dropdown when pressing Escape on a popover with a dropdown inside', async () => {
      const el = await fixtures[0]<HTMLDivElement>(html`
        <div>
          <cs-button id="popover-anchor">Open Popover</cs-button>
          <cs-popover id="test-popover" for="popover-anchor">
            <div style="padding: 1rem;">
              <cs-dropdown id="test-dropdown">
                <cs-button slot="trigger" caret>Open Dropdown</cs-button>
                <cs-dropdown-item>Item 1</cs-dropdown-item>
              </cs-dropdown>
            </div>
          </cs-popover>
        </div>
      `);

      const popover = el.querySelector<CsPopover>('#test-popover')!;
      const dropdown = el.querySelector<any>('#test-dropdown')!;

      popover.open = true;
      await waitUntil(() => popover.open);
      await aTimeout(200);

      dropdown.open = true;
      await waitUntil(() => dropdown.open);
      await aTimeout(200);

      await sendKeys({ press: 'Escape' });
      await aTimeout(200);

      expect(dropdown.open).to.be.false;
      expect(popover.open).to.be.true;
    });

    it('should only close the tooltip when pressing Escape on a popover with a tooltip inside', async () => {
      const el = await fixtures[0]<HTMLDivElement>(html`
        <div>
          <cs-button id="popover-anchor">Open Popover</cs-button>
          <cs-popover id="test-popover" for="popover-anchor">
            <div style="padding: 1rem;">
              <cs-button id="tooltip-anchor">Hover me</cs-button>
              <cs-tooltip id="test-tooltip" for="tooltip-anchor" trigger="click">Tooltip content</cs-tooltip>
            </div>
          </cs-popover>
        </div>
      `);

      const popover = el.querySelector<CsPopover>('#test-popover')!;
      const tooltip = el.querySelector<any>('#test-tooltip')!;

      popover.open = true;
      await waitUntil(() => popover.open);
      await aTimeout(200);

      tooltip.open = true;
      await waitUntil(() => tooltip.open);
      await aTimeout(200);

      await sendKeys({ press: 'Escape' });
      await aTimeout(200);

      expect(tooltip.open).to.be.false;
      expect(popover.open).to.be.true;
    });
  });
});
