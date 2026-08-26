import { aTimeout, expect, waitUntil } from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import { html } from 'lit';
import sinon from 'sinon';
import { expectEvent } from '../../internal/test/expect-event.js';
import { fixtures } from '../../internal/test/fixture.js';
import { moveMouseOnElement } from '../../internal/test/pointer-utilities.js';
import type CsDropdownItem from '../dropdown-item/dropdown-item.js';
import type CsDropdown from './dropdown.js';

describe('<cs-dropdown>', () => {
  for (const fixture of fixtures) {
    describe(`with "${fixture.type}" rendering`, () => {
      describe('accessibility', () => {
        it('should pass accessibility tests', async () => {
          const el = await fixture<CsDropdown>(
            html`<cs-dropdown
              ><cs-button slot="trigger">Dropdown</cs-button><cs-dropdown-item>One</cs-dropdown-item></cs-dropdown
            >`,
          );
          await expect(el).to.be.accessible();
        });
      });

      describe('accessibility', () => {
        it('should set aria-haspopup on the trigger button', async () => {
          const el = await fixture<HTMLDivElement>(html`
            <cs-dropdown>
              <cs-button slot="trigger">Dropdown</cs-button>
              <cs-dropdown-item>One</cs-dropdown-item>
            </cs-dropdown>
          `);
          const dropdown = el.querySelector<CsDropdown>('cs-dropdown') ?? (el as unknown as CsDropdown);
          const dd = dropdown.tagName === 'CS-DROPDOWN' ? dropdown : el.querySelector<CsDropdown>('cs-dropdown')!;
          await dd.updateComplete;

          const trigger = dd.querySelector<HTMLElement>('[slot="trigger"]')!;
          await customElements.whenDefined('cs-button');
          const csButton = trigger as any;
          await csButton.updateComplete;
          const nativeButton = csButton.shadowRoot!.querySelector('[part~="button"]')!;

          expect(nativeButton.getAttribute('aria-haspopup')).to.equal('menu');
        });

        it('should set aria-expanded to true when open', async () => {
          const el = await fixture<CsDropdown>(html`
            <cs-dropdown open>
              <cs-button slot="trigger">Dropdown</cs-button>
              <cs-dropdown-item>One</cs-dropdown-item>
            </cs-dropdown>
          `);
          await el.updateComplete;
          await aTimeout(200);

          const trigger = el.querySelector<HTMLElement>('[slot="trigger"]')! as any;
          await trigger.updateComplete;
          const nativeButton = trigger.shadowRoot!.querySelector('[part~="button"]')!;

          expect(nativeButton.getAttribute('aria-expanded')).to.equal('true');
        });

        it('should have role="menu" on the menu container', async () => {
          const el = await fixture<CsDropdown>(html`
            <cs-dropdown>
              <cs-button slot="trigger">Dropdown</cs-button>
              <cs-dropdown-item>One</cs-dropdown-item>
            </cs-dropdown>
          `);
          await el.updateComplete;

          const menu = el.shadowRoot!.querySelector('#menu')!;
          expect(menu.getAttribute('role')).to.equal('menu');
        });

        it('should exclude labels and dividers from the reported menu item count', async () => {
          const el = await fixture<CsDropdown>(html`
            <cs-dropdown>
              <cs-button slot="trigger">Dropdown</cs-button>
              <h3>Type</h3>
              <cs-dropdown-item>Phone</cs-dropdown-item>
              <cs-dropdown-item>Tablet</cs-dropdown-item>
              <cs-dropdown-item>Desktop</cs-dropdown-item>
              <cs-divider></cs-divider>
              <cs-dropdown-item>More options</cs-dropdown-item>
            </cs-dropdown>
          `);
          await el.updateComplete;

          const items = [...el.querySelectorAll('cs-dropdown-item')];
          await waitUntil(() => items.every((item) => item.hasAttribute('aria-posinset')));
          expect(items.map((item) => item.getAttribute('aria-posinset'))).to.deep.equal(['1', '2', '3', '4']);
          expect(items.map((item) => item.getAttribute('aria-setsize'))).to.deep.equal(['4', '4', '4', '4']);
        });
      });

      describe('properties', () => {
        it('should render a component', async () => {
          const el = await fixture(html`<cs-dropdown></cs-dropdown>`);
          expect(el).to.exist;
        });

        it('should default to closed', async () => {
          const el = await fixture<CsDropdown>(html`
            <cs-dropdown>
              <cs-button slot="trigger">Dropdown</cs-button>
              <cs-dropdown-item>One</cs-dropdown-item>
            </cs-dropdown>
          `);
          expect(el.open).to.be.false;
        });

        it('should respect the open attribute when included', async () => {
          const el = await fixture<CsDropdown>(html`
            <cs-dropdown open>
              <cs-button slot="trigger">Dropdown</cs-button>
              <cs-dropdown-item>One</cs-dropdown-item>
            </cs-dropdown>
          `);
          await el.updateComplete;
          await aTimeout(200);
          expect(el.open).to.be.true;
        });

        it('should default placement to bottom-start', async () => {
          const el = await fixture<CsDropdown>(html`
            <cs-dropdown>
              <cs-button slot="trigger">Dropdown</cs-button>
              <cs-dropdown-item>One</cs-dropdown-item>
            </cs-dropdown>
          `);
          expect(el.placement).to.equal('bottom-start');
        });

        it('should accept a custom placement', async () => {
          const el = await fixture<CsDropdown>(html`
            <cs-dropdown placement="top-end">
              <cs-button slot="trigger">Dropdown</cs-button>
              <cs-dropdown-item>One</cs-dropdown-item>
            </cs-dropdown>
          `);
          expect(el.placement).to.equal('top-end');
        });

        it('should default size to medium', async () => {
          const el = await fixture<CsDropdown>(html`
            <cs-dropdown>
              <cs-button slot="trigger">Dropdown</cs-button>
              <cs-dropdown-item>One</cs-dropdown-item>
            </cs-dropdown>
          `);
          expect(el.size).to.equal('m');
        });

        it('should accept distance property', async () => {
          const el = await fixture<CsDropdown>(html`
            <cs-dropdown distance="20">
              <cs-button slot="trigger">Dropdown</cs-button>
              <cs-dropdown-item>One</cs-dropdown-item>
            </cs-dropdown>
          `);
          expect(el.distance).to.equal(20);
        });

        it('should accept skidding property', async () => {
          const el = await fixture<CsDropdown>(html`
            <cs-dropdown skidding="10">
              <cs-button slot="trigger">Dropdown</cs-button>
              <cs-dropdown-item>One</cs-dropdown-item>
            </cs-dropdown>
          `);
          expect(el.skidding).to.equal(10);
        });
      });

      describe('events', () => {
        it('should fire cs-show and cs-after-show when opening', async () => {
          const el = await fixture<CsDropdown>(html`
            <cs-dropdown>
              <cs-button slot="trigger">Dropdown</cs-button>
              <cs-dropdown-item>One</cs-dropdown-item>
            </cs-dropdown>
          `);

          const trigger = el.querySelector<HTMLElement>('[slot="trigger"]')!;

          await expectEvent(el, ['cs-show', 'cs-after-show'], () => {
            trigger.click();
          });

          expect(el.open).to.be.true;
        });

        it('should fire cs-hide and cs-after-hide when closing', async () => {
          const el = await fixture<CsDropdown>(html`
            <cs-dropdown open>
              <cs-button slot="trigger">Dropdown</cs-button>
              <cs-dropdown-item>One</cs-dropdown-item>
            </cs-dropdown>
          `);
          await el.updateComplete;
          await aTimeout(200);

          const trigger = el.querySelector<HTMLElement>('[slot="trigger"]')!;

          await expectEvent(el, ['cs-hide', 'cs-after-hide'], () => {
            trigger.click();
          });

          expect(el.open).to.be.false;
        });

        it('should not fire cs-after-hide when cs-hide is prevented', async () => {
          const el = await fixture<CsDropdown>(html`
            <cs-dropdown>
              <cs-button slot="trigger">Dropdown</cs-button>
              <cs-dropdown-item>One</cs-dropdown-item>
            </cs-dropdown>
          `);

          const trigger = el.querySelector<HTMLElement>('[slot="trigger"]')!;

          // Open first
          trigger.click();
          await waitUntil(() => el.open);
          await aTimeout(200);

          const afterHideSpy = sinon.spy();
          el.addEventListener('cs-hide', (event) => event.preventDefault());
          el.addEventListener('cs-after-hide', afterHideSpy);

          // Try to close
          trigger.click();
          await aTimeout(200);

          expect(afterHideSpy.callCount).to.equal(0);
          expect(el.open).to.be.true;
        });

        it('should fire cs-select when an item is clicked', async () => {
          const el = await fixture<CsDropdown>(html`
            <cs-dropdown open>
              <cs-button slot="trigger">Dropdown</cs-button>
              <cs-dropdown-item value="one">One</cs-dropdown-item>
              <cs-dropdown-item value="two">Two</cs-dropdown-item>
            </cs-dropdown>
          `);
          await el.updateComplete;
          await aTimeout(200);

          const item = el.querySelector<HTMLElement>('cs-dropdown-item[value="two"]')!;
          const events = await expectEvent(el, 'cs-select', () => {
            item.click();
          });

          expect((events[0] as CustomEvent).detail.item.value).to.equal('two');
        });

        it('should close after selection by default', async () => {
          const el = await fixture<CsDropdown>(html`
            <cs-dropdown open>
              <cs-button slot="trigger">Dropdown</cs-button>
              <cs-dropdown-item value="one">One</cs-dropdown-item>
            </cs-dropdown>
          `);
          await el.updateComplete;
          await aTimeout(200);

          const item = el.querySelector<HTMLElement>('cs-dropdown-item')!;
          item.click();

          await waitUntil(() => !el.open);
          expect(el.open).to.be.false;
        });

        it('should not close after selection when cs-select is prevented', async () => {
          const el = await fixture<CsDropdown>(html`
            <cs-dropdown open>
              <cs-button slot="trigger">Dropdown</cs-button>
              <cs-dropdown-item value="one">One</cs-dropdown-item>
            </cs-dropdown>
          `);
          await el.updateComplete;
          await aTimeout(200);

          el.addEventListener('cs-select', (event) => event.preventDefault());

          const item = el.querySelector<HTMLElement>('cs-dropdown-item')!;
          item.click();
          await aTimeout(200);

          expect(el.open).to.be.true;
        });

        it('should toggle checkbox items on selection', async () => {
          const el = await fixture<CsDropdown>(html`
            <cs-dropdown open>
              <cs-button slot="trigger">Dropdown</cs-button>
              <cs-dropdown-item type="checkbox" value="check-me">Check Me</cs-dropdown-item>
            </cs-dropdown>
          `);
          await el.updateComplete;
          await aTimeout(200);

          const item = el.querySelector<any>('cs-dropdown-item[value="check-me"]')!;
          expect(item.checked).to.be.false;

          item.click();
          await aTimeout(100);

          expect(item.checked).to.be.true;
        });
      });

      describe('slots', () => {
        it('should accept items in the default slot', async () => {
          const el = await fixture<CsDropdown>(html`
            <cs-dropdown>
              <cs-button slot="trigger">Dropdown</cs-button>
              <cs-dropdown-item>One</cs-dropdown-item>
              <cs-dropdown-item>Two</cs-dropdown-item>
            </cs-dropdown>
          `);
          const items = el.querySelectorAll('cs-dropdown-item');
          expect(items.length).to.equal(2);
        });

        it('should accept a trigger in the trigger slot', async () => {
          const el = await fixture<CsDropdown>(html`
            <cs-dropdown>
              <cs-button slot="trigger">Dropdown</cs-button>
              <cs-dropdown-item>One</cs-dropdown-item>
            </cs-dropdown>
          `);
          const trigger = el.querySelector('[slot="trigger"]');
          expect(trigger).to.exist;
        });
      });

      describe('keyboard navigation', () => {
        it('should close on Escape and focus the trigger', async () => {
          const el = await fixture<CsDropdown>(html`
            <cs-dropdown>
              <cs-button slot="trigger">Dropdown</cs-button>
              <cs-dropdown-item>One</cs-dropdown-item>
              <cs-dropdown-item>Two</cs-dropdown-item>
            </cs-dropdown>
          `);

          const trigger = el.querySelector<HTMLElement>('[slot="trigger"]')!;
          trigger.click();
          await waitUntil(() => el.open);
          await aTimeout(200);

          await sendKeys({ press: 'Escape' });
          await waitUntil(() => !el.open);

          expect(el.open).to.be.false;
        });

        it('should navigate items with ArrowDown', async () => {
          const el = await fixture<CsDropdown>(html`
            <cs-dropdown>
              <cs-button slot="trigger">Dropdown</cs-button>
              <cs-dropdown-item>One</cs-dropdown-item>
              <cs-dropdown-item>Two</cs-dropdown-item>
              <cs-dropdown-item>Three</cs-dropdown-item>
            </cs-dropdown>
          `);

          const trigger = el.querySelector<HTMLElement>('[slot="trigger"]')!;
          trigger.click();
          await waitUntil(() => el.open);
          await aTimeout(200);

          // First item should be focused on open
          const items = el.querySelectorAll('cs-dropdown-item');
          expect((items[0] as any).active).to.be.true;

          // ArrowDown should move to next item
          await sendKeys({ press: 'ArrowDown' });
          await aTimeout(50);

          expect((items[1] as any).active).to.be.true;
          expect((items[0] as any).active).to.be.false;
        });

        it('should navigate items with ArrowUp', async () => {
          const el = await fixture<CsDropdown>(html`
            <cs-dropdown>
              <cs-button slot="trigger">Dropdown</cs-button>
              <cs-dropdown-item>One</cs-dropdown-item>
              <cs-dropdown-item>Two</cs-dropdown-item>
              <cs-dropdown-item>Three</cs-dropdown-item>
            </cs-dropdown>
          `);

          const trigger = el.querySelector<HTMLElement>('[slot="trigger"]')!;
          trigger.click();
          await waitUntil(() => el.open);
          await aTimeout(200);

          // ArrowUp from first item should wrap to last
          await sendKeys({ press: 'ArrowUp' });
          await aTimeout(50);

          const items = el.querySelectorAll('cs-dropdown-item');
          expect((items[2] as any).active).to.be.true;
        });

        it('should select an item with Enter', async () => {
          const el = await fixture<CsDropdown>(html`
            <cs-dropdown>
              <cs-button slot="trigger">Dropdown</cs-button>
              <cs-dropdown-item value="one">One</cs-dropdown-item>
              <cs-dropdown-item value="two">Two</cs-dropdown-item>
            </cs-dropdown>
          `);

          const trigger = el.querySelector<HTMLElement>('[slot="trigger"]')!;
          trigger.click();
          await waitUntil(() => el.open);
          await aTimeout(200);

          const selectSpy = sinon.spy();
          el.addEventListener('cs-select', selectSpy);

          await sendKeys({ press: 'Enter' });
          await waitUntil(() => selectSpy.calledOnce);

          expect(selectSpy.calledOnce).to.be.true;
          expect(selectSpy.firstCall.args[0].detail.item.value).to.equal('one');
        });

        it('should select an item with Space', async () => {
          const el = await fixture<CsDropdown>(html`
            <cs-dropdown>
              <cs-button slot="trigger">Dropdown</cs-button>
              <cs-dropdown-item value="one">One</cs-dropdown-item>
            </cs-dropdown>
          `);

          const trigger = el.querySelector<HTMLElement>('[slot="trigger"]')!;
          trigger.click();
          await waitUntil(() => el.open);
          await aTimeout(200);

          const selectSpy = sinon.spy();
          el.addEventListener('cs-select', selectSpy);

          await sendKeys({ press: ' ' });
          await waitUntil(() => selectSpy.calledOnce);

          expect(selectSpy.calledOnce).to.be.true;
        });

        it('should navigate to Home and End keys', async () => {
          const el = await fixture<CsDropdown>(html`
            <cs-dropdown>
              <cs-button slot="trigger">Dropdown</cs-button>
              <cs-dropdown-item>One</cs-dropdown-item>
              <cs-dropdown-item>Two</cs-dropdown-item>
              <cs-dropdown-item>Three</cs-dropdown-item>
            </cs-dropdown>
          `);

          const trigger = el.querySelector<HTMLElement>('[slot="trigger"]')!;
          trigger.click();
          await waitUntil(() => el.open);
          await aTimeout(200);

          const items = el.querySelectorAll('cs-dropdown-item');

          // End should go to last item
          await sendKeys({ press: 'End' });
          await aTimeout(50);
          expect((items[2] as any).active).to.be.true;

          // Home should go to first item
          await sendKeys({ press: 'Home' });
          await aTimeout(50);
          expect((items[0] as any).active).to.be.true;
        });

        it('should support type-ahead to find items', async () => {
          const el = await fixture<CsDropdown>(html`
            <cs-dropdown>
              <cs-button slot="trigger">Dropdown</cs-button>
              <cs-dropdown-item>Apple</cs-dropdown-item>
              <cs-dropdown-item>Banana</cs-dropdown-item>
              <cs-dropdown-item>Cherry</cs-dropdown-item>
            </cs-dropdown>
          `);

          const trigger = el.querySelector<HTMLElement>('[slot="trigger"]')!;
          trigger.click();
          await waitUntil(() => el.open);
          await aTimeout(200);

          const items = el.querySelectorAll('cs-dropdown-item');

          // Type "b" to jump to Banana
          await sendKeys({ press: 'b' });
          await aTimeout(50);
          expect((items[1] as any).active).to.be.true;
        });

        it('should skip disabled items during navigation', async () => {
          const el = await fixture<CsDropdown>(html`
            <cs-dropdown>
              <cs-button slot="trigger">Dropdown</cs-button>
              <cs-dropdown-item>One</cs-dropdown-item>
              <cs-dropdown-item disabled>Two</cs-dropdown-item>
              <cs-dropdown-item>Three</cs-dropdown-item>
            </cs-dropdown>
          `);

          const trigger = el.querySelector<HTMLElement>('[slot="trigger"]')!;
          trigger.click();
          await waitUntil(() => el.open);
          await aTimeout(200);

          const items = el.querySelectorAll('cs-dropdown-item');

          // First non-disabled item should be active
          expect((items[0] as any).active).to.be.true;

          // ArrowDown should skip disabled item and go to Three
          await sendKeys({ press: 'ArrowDown' });
          await aTimeout(50);

          expect((items[2] as any).active).to.be.true;
        });
      });

      describe('CSS parts and states', () => {
        it('should expose the menu CSS part', async () => {
          const el = await fixture<CsDropdown>(html`
            <cs-dropdown>
              <cs-button slot="trigger">Dropdown</cs-button>
              <cs-dropdown-item>One</cs-dropdown-item>
            </cs-dropdown>
          `);
          const menu = el.shadowRoot!.querySelector('[part~="menu"]');
          expect(menu).to.exist;
        });
      });
    });
  }

  describe('trigger interaction', () => {
    it('should toggle open when the trigger is clicked', async () => {
      const el = await fixtures[0]<CsDropdown>(html`
        <cs-dropdown>
          <cs-button slot="trigger">Dropdown</cs-button>
          <cs-dropdown-item>One</cs-dropdown-item>
        </cs-dropdown>
      `);

      const trigger = el.querySelector<HTMLElement>('[slot="trigger"]')!;
      trigger.click();
      await waitUntil(() => el.open);
      expect(el.open).to.be.true;

      await aTimeout(200);
      trigger.click();
      await waitUntil(() => !el.open);
      expect(el.open).to.be.false;
    });
  });

  describe('submenu hover', () => {
    async function openSubmenu() {
      const el = await fixtures[0]<HTMLDivElement>(html`
        <div style="padding: 50px;">
          <cs-dropdown id="dropdown">
            <cs-button slot="trigger">Dropdown</cs-button>
            <cs-dropdown-item id="parent">
              Parent
              <cs-dropdown-item slot="submenu" id="child">Child</cs-dropdown-item>
            </cs-dropdown-item>
            <cs-dropdown-item id="sibling">Sibling</cs-dropdown-item>
          </cs-dropdown>
        </div>
      `);

      const dropdown = el.querySelector<CsDropdown>('#dropdown')!;
      const parent = el.querySelector<CsDropdownItem>('#parent')!;
      const child = el.querySelector<CsDropdownItem>('#child')!;
      const sibling = el.querySelector<CsDropdownItem>('#sibling')!;

      dropdown.open = true;
      await waitUntil(() => dropdown.open);
      await aTimeout(200);

      await moveMouseOnElement(parent);
      await waitUntil(() => parent.submenuOpen);
      await aTimeout(200);

      return { dropdown, parent, child, sibling };
    }

    it('should keep the submenu open when the pointer travels into it', async () => {
      const { parent, child, sibling } = await openSubmenu();

      await moveMouseOnElement(sibling);
      await moveMouseOnElement(child);
      await aTimeout(300);

      expect(parent.submenuOpen).to.be.true;
    });

    it('should close the submenu when the pointer moves away and stays away', async () => {
      const { parent, sibling } = await openSubmenu();

      await moveMouseOnElement(sibling);
      await aTimeout(300);

      expect(parent.submenuOpen).to.be.false;
    });
  });

  describe('dismissible stack', () => {
    it('should only close the dropdown when pressing Escape on a dropdown with a popover inside', async () => {
      const el = await fixtures[0]<HTMLDivElement>(html`
        <div>
          <cs-dropdown id="test-dropdown">
            <cs-button slot="trigger">Dropdown</cs-button>
            <cs-dropdown-item>Item 1</cs-dropdown-item>
            <cs-dropdown-item id="popover-trigger">Item 2</cs-dropdown-item>
          </cs-dropdown>
          <cs-popover id="test-popover" for="popover-trigger">
            <div style="padding: 1rem;">Popover inside dropdown</div>
          </cs-popover>
        </div>
      `);

      const dropdown = el.querySelector<CsDropdown>('#test-dropdown')!;
      const popover = el.querySelector<any>('#test-popover')!;

      dropdown.open = true;
      await waitUntil(() => dropdown.open);
      await aTimeout(200);

      popover.open = true;
      await waitUntil(() => popover.open);
      await aTimeout(200);

      await sendKeys({ press: 'Escape' });
      await aTimeout(200);

      expect(popover.open).to.be.false;
      expect(dropdown.open).to.be.true;

      await sendKeys({ press: 'Escape' });
      await aTimeout(200);

      expect(dropdown.open).to.be.false;
    });
  });
});
