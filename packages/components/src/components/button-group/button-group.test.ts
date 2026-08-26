import { elementUpdated, expect } from '@open-wc/testing';
import { html } from 'lit';
import { fixtures } from '../../internal/test/fixture.js';
import type CsButtonGroup from './button-group.js';

describe('<cs-button-group>', () => {
  for (const fixture of fixtures) {
    describe(`with "${fixture.type}" rendering`, () => {
      describe('accessibility', () => {
        it('should pass accessibility tests', async () => {
          const el = await fixture<CsButtonGroup>(html`
            <cs-button-group label="Actions">
              <cs-button>Button 1</cs-button>
              <cs-button>Button 2</cs-button>
              <cs-button>Button 3</cs-button>
            </cs-button-group>
          `);

          if (fixture.type === 'client-only') {
            await expect(el).to.be.accessible();
          }
        });

        it('should have role="group" on the group slot by default', async () => {
          const el = await fixture<CsButtonGroup>(html`
            <cs-button-group label="Actions">
              <cs-button>Button 1</cs-button>
            </cs-button-group>
          `);
          const base = el.shadowRoot!.querySelector('slot')!;
          expect(base.getAttribute('role')).to.equal('group');
        });

        it('should set aria-label from the label property', async () => {
          const el = await fixture<CsButtonGroup>(html`
            <cs-button-group label="My Group">
              <cs-button>Button 1</cs-button>
            </cs-button-group>
          `);
          const base = el.shadowRoot!.querySelector('slot')!;
          expect(base.getAttribute('aria-label')).to.equal('My Group');
        });
      });

      describe('properties', () => {
        it('should have an empty label by default', async () => {
          const el = await fixture<CsButtonGroup>(html`
            <cs-button-group>
              <cs-button>Button 1</cs-button>
            </cs-button-group>
          `);
          expect(el.label).to.equal('');
        });

        it('should default orientation to "horizontal"', async () => {
          const el = await fixture<CsButtonGroup>(html`
            <cs-button-group>
              <cs-button>Button 1</cs-button>
            </cs-button-group>
          `);
          expect(el.orientation).to.equal('horizontal');
          expect(el.getAttribute('orientation')).to.equal('horizontal');
        });

        it('should reflect orientation to the attribute', async () => {
          const el = await fixture<CsButtonGroup>(html`
            <cs-button-group orientation="vertical">
              <cs-button>Button 1</cs-button>
            </cs-button-group>
          `);
          expect(el.orientation).to.equal('vertical');
          expect(el.getAttribute('orientation')).to.equal('vertical');
        });

        it('should set aria-orientation when orientation changes', async () => {
          const el = await fixture<CsButtonGroup>(html`
            <cs-button-group>
              <cs-button>Button 1</cs-button>
            </cs-button-group>
          `);
          expect(el.getAttribute('aria-orientation')).to.equal('horizontal');

          el.orientation = 'vertical';
          await elementUpdated(el);
          expect(el.getAttribute('aria-orientation')).to.equal('vertical');
        });
      });

      describe('slots', () => {
        it('should render slotted buttons', async () => {
          const el = await fixture<CsButtonGroup>(html`
            <cs-button-group>
              <cs-button>Button 1</cs-button>
              <cs-button>Button 2</cs-button>
              <cs-button>Button 3</cs-button>
            </cs-button-group>
          `);
          const buttons = el.querySelectorAll('cs-button');
          expect(buttons.length).to.equal(3);
        });

        for (const appearance of ['accent', 'filled', 'filled-outlined', 'outlined', 'plain'] as const) {
          it(`should not offset the first ${appearance} button`, async () => {
            const el = await fixture<CsButtonGroup>(html`
              <cs-button-group>
                <cs-button appearance=${appearance}>Button 1</cs-button>
                <cs-button appearance=${appearance}>Button 2</cs-button>
              </cs-button-group>
            `);
            const firstButton = el.querySelector('cs-button')!;

            expect(getComputedStyle(firstButton).marginInlineStart).to.equal('0px');
          });

          it(`should not offset the first vertical ${appearance} button`, async () => {
            const el = await fixture<CsButtonGroup>(html`
              <cs-button-group orientation="vertical">
                <cs-button appearance=${appearance}>Button 1</cs-button>
                <cs-button appearance=${appearance}>Button 2</cs-button>
              </cs-button-group>
            `);
            const firstButton = el.querySelector('cs-button')!;

            expect(getComputedStyle(firstButton).marginBlockStart).to.equal('0px');
          });
        }
      });

      describe('native buttons', () => {
        // The grouping styles are driven by custom properties that native.css consumes, so a button group should set
        // the same radius overrides on slotted native `<button>` elements.
        it('should apply radius custom properties to slotted native buttons', async () => {
          const el = await fixture<CsButtonGroup>(html`
            <cs-button-group label="Alignment">
              <button class="cs-filled">Left</button>
              <button class="cs-filled">Center</button>
              <button class="cs-filled">Right</button>
            </cs-button-group>
          `);

          const [first, middle, last] = [...el.querySelectorAll('button')];

          // The middle button has all four corners squared off
          const middleStyles = getComputedStyle(middle);
          expect(middleStyles.getPropertyValue('--_button-start-start-radius').trim()).to.equal('0');
          expect(middleStyles.getPropertyValue('--_button-start-end-radius').trim()).to.equal('0');
          expect(middleStyles.getPropertyValue('--_button-end-start-radius').trim()).to.equal('0');
          expect(middleStyles.getPropertyValue('--_button-end-end-radius').trim()).to.equal('0');

          // The first button keeps its leading corners but squares off the trailing ones
          const firstStyles = getComputedStyle(first);
          expect(firstStyles.getPropertyValue('--_button-start-end-radius').trim()).to.equal('0');
          expect(firstStyles.getPropertyValue('--_button-end-end-radius').trim()).to.equal('0');

          // The last button keeps its trailing corners but squares off the leading ones
          const lastStyles = getComputedStyle(last);
          expect(lastStyles.getPropertyValue('--_button-start-start-radius').trim()).to.equal('0');
          expect(lastStyles.getPropertyValue('--_button-end-start-radius').trim()).to.equal('0');
        });
      });

      describe('focus and hover behavior', () => {
        it('should add button-focus class on focusin and remove on focusout', async () => {
          const el = await fixture<CsButtonGroup>(html`
            <cs-button-group>
              <cs-button>Button 1</cs-button>
              <cs-button>Button 2</cs-button>
            </cs-button-group>
          `);

          const button = el.querySelector('cs-button')!;
          button.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
          await elementUpdated(button);
          expect(button.classList.contains('button-focus')).to.be.true;

          button.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
          await elementUpdated(button);
          expect(button.classList.contains('button-focus')).to.be.false;
        });

        it('should add button-hover class on mouseover and remove on mouseout', async () => {
          const el = await fixture<CsButtonGroup>(html`
            <cs-button-group>
              <cs-button>Button 1</cs-button>
              <cs-button>Button 2</cs-button>
            </cs-button-group>
          `);

          const button = el.querySelector('cs-button')!;
          button.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
          await elementUpdated(button);
          expect(button.classList.contains('button-hover')).to.be.true;

          button.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
          await elementUpdated(button);
          expect(button.classList.contains('button-hover')).to.be.false;
        });
      });
    });
  }
});
