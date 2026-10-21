import { expect } from '@open-wc/testing';
import { emulateMedia } from '@web/test-runner-commands';
import { html } from 'lit';
import { fixtures } from '../../internal/test/fixture.js';
import { isWebkit } from '../../internal/test/pointer-utilities.js';
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

      describe('forced colors', () => {
        // Skipped on WebKit: Playwright can't emulate forced colors there, so the check would run in normal colors.
        // A non-system color is forced to Canvas there and the skeleton vanishes, so GrayText wins over any override.
        (isWebkit ? it.skip : it)('should stay visible in GrayText whatever color a page sets', async () => {
          const el = await fixture<HTMLElement>(html`
            <div>
              <cs-skeleton style="--cs-skeleton-color: rgb(255, 0, 0)"></cs-skeleton>
              <span id="gray" style="background-color: GrayText">probe</span>
              <span id="canvas" style="background-color: Canvas">probe</span>
            </div>
          `);
          const skeleton = el.querySelector<CsSkeleton>('cs-skeleton')!;
          await skeleton.updateComplete;
          const indicator = skeleton.shadowRoot!.querySelector('[part~="indicator"]')!;
          await emulateMedia({ forcedColors: 'active' });
          try {
            const background = getComputedStyle(indicator).backgroundColor;
            expect(background).to.equal(getComputedStyle(el.querySelector('#gray')!).backgroundColor);
            expect(background).not.to.equal(getComputedStyle(el.querySelector('#canvas')!).backgroundColor);
          } finally {
            await emulateMedia({ forcedColors: 'none' });
          }
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
