import { expect } from '@open-wc/testing';
import { a11ySnapshot } from '@web/test-runner-commands';
import { html } from 'lit';
import { fixtures } from '../../internal/test/fixture.js';
import { isWebkit } from '../../internal/test/pointer-utilities.js';
import type CsButton from '../button/button.js';
import type CsBadge from './badge.js';

const liveRoles = ['alert', 'log', 'marquee', 'status', 'timer'];

const liveRegion = [
  ...liveRoles.map((role) => `[role="${role}"]`),
  'output',
  '[aria-live]:not([aria-live="off"])',
].join(', ');

interface AccessibilityNode {
  role: string;
  name: string;
}

describe('<cs-badge>', () => {
  for (const fixture of fixtures) {
    describe(`with "${fixture.type}" rendering`, () => {
      describe('accessibility', () => {
        it('should pass accessibility tests', async () => {
          const el = await fixture<CsBadge>(html`<cs-badge>Badge</cs-badge>`);
          await expect(el).to.be.accessible();
        });

        it('should not render a live region', async () => {
          const el = await fixture<CsBadge>(html`<cs-badge>Badge</cs-badge>`);
          const liveRegions = [...el.shadowRoot!.querySelectorAll(liveRegion)].map((node) => node.outerHTML);
          expect(liveRegions).to.deep.equal([]);
          expect(el.matches(liveRegion)).to.be.false;
          expect(el.internals.role).not.to.be.oneOf(liveRoles);
          expect(el.internals.ariaLive).to.be.oneOf([null, 'off']);
        });

        it('should add its text to the accessible name of a button it is in', async () => {
          const el = await fixture<CsButton>(html`<cs-button>Requests <cs-badge pill>30</cs-badge></cs-button>`);
          await expect(el).to.be.accessible();

          const button = (await a11ySnapshot({ selector: 'cs-button button' })) as unknown as AccessibilityNode;
          // WebKit drops the space: a known gap in resources/accessibility.md.
          expect(button).to.include({ role: 'button', name: isWebkit ? 'Requests30' : 'Requests 30' });
        });
      });

      describe('properties', () => {
        it('should default variant to "brand"', async () => {
          const el = await fixture<CsBadge>(html`<cs-badge>Badge</cs-badge>`);
          expect(el.variant).to.equal('brand');
          expect(el.getAttribute('variant')).to.equal('brand');
        });

        it('should default appearance to "accent"', async () => {
          const el = await fixture<CsBadge>(html`<cs-badge>Badge</cs-badge>`);
          expect(el.appearance).to.equal('accent');
          expect(el.getAttribute('appearance')).to.equal('accent');
        });

        it('should default pill to false', async () => {
          const el = await fixture<CsBadge>(html`<cs-badge>Badge</cs-badge>`);
          expect(el.pill).to.equal(false);
          expect(el.hasAttribute('pill')).to.be.false;
        });

        it('should default attention to "none"', async () => {
          const el = await fixture<CsBadge>(html`<cs-badge>Badge</cs-badge>`);
          expect(el.attention).to.equal('none');
        });

        it('should reflect pill attribute when set', async () => {
          const el = await fixture<CsBadge>(html`<cs-badge pill>Badge</cs-badge>`);
          expect(el.pill).to.equal(true);
          expect(el.hasAttribute('pill')).to.be.true;
        });

        it('should reflect variant attribute', async () => {
          const el = await fixture<CsBadge>(html`<cs-badge variant="danger">Badge</cs-badge>`);
          expect(el.variant).to.equal('danger');
          expect(el.getAttribute('variant')).to.equal('danger');
        });

        it('should reflect appearance attribute', async () => {
          const el = await fixture<CsBadge>(html`<cs-badge appearance="filled">Badge</cs-badge>`);
          expect(el.appearance).to.equal('filled');
          expect(el.getAttribute('appearance')).to.equal('filled');
        });

        it('should reflect attention attribute', async () => {
          const el = await fixture<CsBadge>(html`<cs-badge attention="pulse">Badge</cs-badge>`);
          expect(el.attention).to.equal('pulse');
          expect(el.getAttribute('attention')).to.equal('pulse');
        });

        for (const variant of ['brand', 'neutral', 'success', 'warning', 'danger'] as const) {
          it(`should accept variant="${variant}"`, async () => {
            const el = await fixture<CsBadge>(html`<cs-badge variant="${variant}">Badge</cs-badge>`);
            expect(el.variant).to.equal(variant);
            await expect(el).to.be.accessible();
          });
        }

        for (const appearance of ['accent', 'filled', 'outlined', 'filled-outlined'] as const) {
          it(`should accept appearance="${appearance}"`, async () => {
            const el = await fixture<CsBadge>(html`<cs-badge appearance="${appearance}">Badge</cs-badge>`);
            expect(el.appearance).to.equal(appearance);
          });
        }

        for (const attention of ['none', 'pulse', 'bounce'] as const) {
          it(`should accept attention="${attention}"`, async () => {
            const el = await fixture<CsBadge>(html`<cs-badge attention="${attention}">Badge</cs-badge>`);
            expect(el.attention).to.equal(attention);
          });
        }
      });

      describe('slots', () => {
        it('should render default slot content', async () => {
          const el = await fixture<CsBadge>(html`<cs-badge>Badge</cs-badge>`);
          expect(el.innerText).to.equal('Badge');
        });

        it('should render content in the start slot', async () => {
          const el = await fixture<CsBadge>(html`<cs-badge><span slot="start">Icon</span>Badge</cs-badge>`);
          const startSlot = el.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="start"]')!;
          const assigned = startSlot.assignedElements();
          expect(assigned.length).to.equal(1);
          expect(assigned[0].textContent).to.equal('Icon');
        });

        it('should render content in the end slot', async () => {
          const el = await fixture<CsBadge>(html`<cs-badge>Badge<span slot="end">Icon</span></cs-badge>`);
          const endSlot = el.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="end"]')!;
          const assigned = endSlot.assignedElements();
          expect(assigned.length).to.equal(1);
          expect(assigned[0].textContent).to.equal('Icon');
        });
      });

      describe('CSS parts', () => {
        it('should have a base part', async () => {
          const el = await fixture<CsBadge>(html`<cs-badge>Badge</cs-badge>`);
          expect(el.shadowRoot!.querySelector('[part~="badge"]')).to.exist;
        });

        it('should have a start part', async () => {
          const el = await fixture<CsBadge>(html`<cs-badge>Badge</cs-badge>`);
          expect(el.shadowRoot!.querySelector('[part~="start"]')).to.exist;
        });

        it('should have an end part', async () => {
          const el = await fixture<CsBadge>(html`<cs-badge>Badge</cs-badge>`);
          expect(el.shadowRoot!.querySelector('[part~="end"]')).to.exist;
        });
      });
    });
  }
});
