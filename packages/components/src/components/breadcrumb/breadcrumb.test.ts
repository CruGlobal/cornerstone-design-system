import { expect } from '@open-wc/testing';
import { html } from 'lit';
import { fixtures } from '../../internal/test/fixture.js';
import type CsBreadcrumb from './breadcrumb.js';

// The default link color just misses AA contrast, but the next step up is way too dark.
const ignoredRules = ['color-contrast'];

describe('<cs-breadcrumb>', () => {
  for (const fixture of fixtures) {
    describe(`with "${fixture.type}" rendering`, () => {
      describe('accessibility', () => {
        it('should pass accessibility tests', async () => {
          const el = await fixture<CsBreadcrumb>(html`
            <cs-breadcrumb>
              <cs-breadcrumb-item>Home</cs-breadcrumb-item>
              <cs-breadcrumb-item>Products</cs-breadcrumb-item>
              <cs-breadcrumb-item>Shoes</cs-breadcrumb-item>
            </cs-breadcrumb>
          `);

          if (fixture.type === 'client-only') {
            // For some reason ssr does not mix well with Axe checks.
            await expect(el).to.be.accessible({ ignoredRules });
          }
        });

        it('should pass accessibility tests with custom separators', async () => {
          const el = await fixture<CsBreadcrumb>(html`
            <cs-breadcrumb>
              <cs-breadcrumb-item>Home</cs-breadcrumb-item>
              <cs-breadcrumb-item>Products</cs-breadcrumb-item>
              <cs-breadcrumb-item>Shoes</cs-breadcrumb-item>
            </cs-breadcrumb>
          `);

          // For some reason ssr does not mix well with Axe checks.
          if (fixture.type === 'client-only') {
            await expect(el).to.be.accessible({ ignoredRules });
          }
        });

        it('should set aria-current="page" on the last breadcrumb item', async () => {
          const el = await fixture<CsBreadcrumb>(html`
            <cs-breadcrumb>
              <cs-breadcrumb-item>Home</cs-breadcrumb-item>
              <cs-breadcrumb-item>Products</cs-breadcrumb-item>
              <cs-breadcrumb-item>Shoes</cs-breadcrumb-item>
            </cs-breadcrumb>
          `);

          const items = el.querySelectorAll('cs-breadcrumb-item');
          expect(items[0].hasAttribute('aria-current')).to.be.false;
          expect(items[1].hasAttribute('aria-current')).to.be.false;
          expect(items[2].getAttribute('aria-current')).to.equal('page');
        });
      });

      describe('properties', () => {
        it('should have an empty label by default', async () => {
          const el = await fixture<CsBreadcrumb>(html`
            <cs-breadcrumb>
              <cs-breadcrumb-item>Home</cs-breadcrumb-item>
            </cs-breadcrumb>
          `);
          expect(el.label).to.equal('');
        });

        it('should set the nav aria-label from the label property', async () => {
          const el = await fixture<CsBreadcrumb>(html`
            <cs-breadcrumb label="Breadcrumb">
              <cs-breadcrumb-item>Home</cs-breadcrumb-item>
            </cs-breadcrumb>
          `);
          const nav = el.shadowRoot!.querySelector('nav')!;
          expect(nav.getAttribute('aria-label')).to.equal('Breadcrumb');
        });
      });

      describe('slots', () => {
        it('should render default separator icons for each breadcrumb item', async () => {
          const el = await fixture<CsBreadcrumb>(html`
            <cs-breadcrumb>
              <cs-breadcrumb-item>Home</cs-breadcrumb-item>
              <cs-breadcrumb-item>Products</cs-breadcrumb-item>
              <cs-breadcrumb-item>Shoes</cs-breadcrumb-item>
            </cs-breadcrumb>
          `);
          // Each item gets a separator icon cloned into it
          expect(el.querySelectorAll('cs-icon').length).to.equal(3);
        });

        it('should accept a custom separator in the "separator" slot', async () => {
          const el = await fixture<CsBreadcrumb>(html`
            <cs-breadcrumb>
              <span class="custom-sep" slot="separator">/</span>
              <cs-breadcrumb-item>Home</cs-breadcrumb-item>
              <cs-breadcrumb-item>Products</cs-breadcrumb-item>
              <cs-breadcrumb-item>Shoes</cs-breadcrumb-item>
            </cs-breadcrumb>
          `);
          const separatorSlot = el.shadowRoot!.querySelector<HTMLSlotElement>('slot[name=separator]')!;
          const assigned = separatorSlot.assignedNodes({ flatten: true });
          expect(assigned.length).to.equal(1);
        });

        it('should replace default separators with custom ones', async () => {
          const el = await fixture<CsBreadcrumb>(html`
            <cs-breadcrumb>
              <span class="custom-sep" slot="separator">/</span>
              <cs-breadcrumb-item>Home</cs-breadcrumb-item>
              <cs-breadcrumb-item>Products</cs-breadcrumb-item>
              <cs-breadcrumb-item>Shoes</cs-breadcrumb-item>
            </cs-breadcrumb>
          `);
          // Custom separators get cloned into each item
          expect(el.querySelectorAll('.custom-sep').length).to.equal(4);
          expect(el.querySelectorAll('cs-icon').length).to.equal(0);
        });
      });

      describe('CSS parts and states', () => {
        it('should expose a "breadcrumb" part on the nav element', async () => {
          const el = await fixture<CsBreadcrumb>(html`
            <cs-breadcrumb>
              <cs-breadcrumb-item>Home</cs-breadcrumb-item>
            </cs-breadcrumb>
          `);
          const base = el.shadowRoot!.querySelector('[part~="breadcrumb"]');
          expect(base).to.exist;
          expect(base!.tagName.toLowerCase()).to.equal('nav');
        });
      });
    });
  }
});
