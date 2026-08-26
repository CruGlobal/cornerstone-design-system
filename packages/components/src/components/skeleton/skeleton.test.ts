import { expect } from '@open-wc/testing';
import { html } from 'lit';
import { fixtures } from '../../internal/test/fixture.js';
import type CsSkeleton from './skeleton.js';

describe('<cs-skeleton>', () => {
  for (const fixture of fixtures) {
    describe(`with "${fixture.type}" rendering`, () => {
      describe('accessibility', () => {
        it('should pass accessibility tests', async () => {
          const el = await fixture<CsSkeleton>(html`<cs-skeleton></cs-skeleton>`);
          await expect(el).to.be.accessible();
        });
      });

      describe('properties', () => {
        it('should have default effect of "none"', async () => {
          const el = await fixture<CsSkeleton>(html`<cs-skeleton></cs-skeleton>`);
          expect(el.effect).to.equal('none');
          expect(el.getAttribute('effect')).to.equal('none');
        });

        it('should reflect the effect property to an attribute', async () => {
          const el = await fixture<CsSkeleton>(html`<cs-skeleton effect="pulse"></cs-skeleton>`);
          expect(el.effect).to.equal('pulse');
          expect(el.getAttribute('effect')).to.equal('pulse');
        });

        it('should accept "pulse" effect', async () => {
          const el = await fixture<CsSkeleton>(html`<cs-skeleton effect="pulse"></cs-skeleton>`);
          expect(el.effect).to.equal('pulse');
        });

        it('should accept "sheen" effect', async () => {
          const el = await fixture<CsSkeleton>(html`<cs-skeleton effect="sheen"></cs-skeleton>`);
          expect(el.effect).to.equal('sheen');
        });

        it('should accept "none" effect', async () => {
          const el = await fixture<CsSkeleton>(html`<cs-skeleton effect="none"></cs-skeleton>`);
          expect(el.effect).to.equal('none');
        });
      });

      describe('CSS parts', () => {
        it('should have an indicator part', async () => {
          const el = await fixture<CsSkeleton>(html`<cs-skeleton></cs-skeleton>`);
          expect(el.shadowRoot!.querySelector('[part~="indicator"]')).to.exist;
        });
      });
    });
  }
});
