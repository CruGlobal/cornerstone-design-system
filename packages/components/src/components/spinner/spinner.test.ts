import { expect } from '@open-wc/testing';
import { html } from 'lit';
import { fixtures } from '../../internal/test/fixture.js';
import type CsSpinner from './spinner.js';

describe('<cs-spinner>', () => {
  for (const fixture of fixtures) {
    describe(`with "${fixture.type}" rendering`, () => {
      describe('accessibility', () => {
        it('should pass accessibility tests', async () => {
          const el = await fixture<CsSpinner>(html`<cs-spinner></cs-spinner>`);
          await expect(el).to.be.accessible();
        });

        it('should have role="progressbar" on the base part', async () => {
          const el = await fixture<CsSpinner>(html`<cs-spinner></cs-spinner>`);
          const base = el.shadowRoot!.querySelector('[part~="spinner"]')!;
          expect(base).to.have.attribute('role', 'progressbar');
        });

        it('should have an aria-label for loading', async () => {
          const el = await fixture<CsSpinner>(html`<cs-spinner></cs-spinner>`);
          const base = el.shadowRoot!.querySelector('[part~="spinner"]')!;
          expect(base).to.have.attribute('aria-label');
        });
      });

      describe('CSS parts', () => {
        it('should have a base part', async () => {
          const el = await fixture<CsSpinner>(html`<cs-spinner></cs-spinner>`);
          expect(el.shadowRoot!.querySelector('[part~="spinner"]')).to.exist;
        });
      });

      describe('rendering', () => {
        it('should have flex:none to prevent flex re-sizing', async () => {
          const el = await fixture<CsSpinner>(html`<cs-spinner></cs-spinner>`);
          // 0 0 auto is the computed value for `none`
          expect(getComputedStyle(el).flex).to.equal('0 0 auto');
        });
      });
    });
  }
});
