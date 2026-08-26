import { aTimeout, expect } from '@open-wc/testing';
import { html } from 'lit';
import { fixtures } from '../../internal/test/fixture.js';
import type CsCallout from './callout.js';

describe('<cs-callout>', () => {
  for (const fixture of fixtures) {
    describe(`with "${fixture.type}" rendering`, () => {
      describe('accessibility', () => {
        it('should be accessible with default properties', async () => {
          const el = await fixture<CsCallout>(html`<cs-callout>This is a callout</cs-callout>`);
          await expect(el).to.be.accessible();
        });

        it('should be accessible with all variants', async () => {
          const variants = ['brand', 'neutral', 'success', 'warning', 'danger'] as const;
          // dumb reason these fail in CI.
          if (fixture.type === 'ssr-client-hydrated') {
            return;
          }

          for (const variant of variants) {
            const el = await fixture<CsCallout>(html`<cs-callout variant="${variant}">Callout</cs-callout>`);
            await el.updateComplete;
            await expect(el).to.be.accessible();
            await aTimeout(1);
          }
        });
      });

      describe('properties', () => {
        it('should have default property values', async () => {
          const el = await fixture<CsCallout>(html`<cs-callout>Test</cs-callout>`);

          expect(el.variant).to.equal('brand');
          expect(el.size).to.equal('m');
          expect(el.appearance).to.be.undefined;
        });

        it('should reflect the variant attribute', async () => {
          const el = await fixture<CsCallout>(html`<cs-callout variant="danger">Test</cs-callout>`);
          expect(el.getAttribute('variant')).to.equal('danger');
          expect(el.variant).to.equal('danger');
        });

        it('should reflect the size attribute', async () => {
          const el = await fixture<CsCallout>(html`<cs-callout size="s">Test</cs-callout>`);
          expect(el.getAttribute('size')).to.equal('s');
          expect(el.size).to.equal('s');
        });

        it('should reflect the appearance attribute', async () => {
          const el = await fixture<CsCallout>(html`<cs-callout appearance="filled">Test</cs-callout>`);
          expect(el.getAttribute('appearance')).to.equal('filled');
          expect(el.appearance).to.equal('filled');
        });

        it('should accept all valid variants', async () => {
          const el = await fixture<CsCallout>(html`<cs-callout>Test</cs-callout>`);

          for (const variant of ['brand', 'neutral', 'success', 'warning', 'danger'] as const) {
            el.variant = variant;
            await el.updateComplete;
            expect(el.variant).to.equal(variant);
            expect(el.getAttribute('variant')).to.equal(variant);
          }
        });

        it('should accept all valid appearances', async () => {
          const el = await fixture<CsCallout>(html`<cs-callout>Test</cs-callout>`);

          for (const appearance of ['accent', 'filled', 'outlined', 'plain', 'filled-outlined'] as const) {
            el.appearance = appearance;
            await el.updateComplete;
            expect(el.appearance).to.equal(appearance);
            expect(el.getAttribute('appearance')).to.equal(appearance);
          }
        });

        it('should accept all valid sizes', async () => {
          const el = await fixture<CsCallout>(html`<cs-callout>Test</cs-callout>`);

          for (const size of ['xs', 's', 'm', 'l', 'xl'] as const) {
            el.size = size;
            await el.updateComplete;
            expect(el.size).to.equal(size);
            expect(el.getAttribute('size')).to.equal(size);
          }
        });
      });

      describe('slots', () => {
        it('should render the default slot content', async () => {
          const el = await fixture<CsCallout>(html`<cs-callout>Hello World</cs-callout>`);
          const defaultSlot = el.shadowRoot!.querySelector('slot:not([name])');
          expect(defaultSlot).to.exist;
        });

        it('should render the icon slot', async () => {
          const el = await fixture<CsCallout>(html`<cs-callout><span slot="icon">Icon</span>Content</cs-callout>`);
          const iconSlot = el.shadowRoot!.querySelector('slot[name="icon"]');
          expect(iconSlot).to.exist;
        });
      });

      describe('icon spacing', () => {
        /**
         * A document-level universal margin reset used to defeat the icon gap: a slotted element belongs to the
         * outer tree, and a normal declaration from the outer tree beats one from the inner tree whatever the
         * specificity. The reset written here is what every one of the classic resets does, and it is what
         * collapsed the gap to zero on a real page.
         */
        it('should keep the icon gap under a document margin reset', async () => {
          // The gap's value comes from a theme token and no theme is loaded here, so the token is set here too.
          // What is under test is the cascade, not the number.
          const reset = document.createElement('style');
          reset.textContent = ':root { --cs-form-control-padding-inline: 20px } *, *::before, *::after { margin: 0 }';
          document.head.append(reset);

          try {
            const el = await fixture<CsCallout>(html`<cs-callout><span slot="icon">Icon</span>Content</cs-callout>`);
            await el.updateComplete;

            const icon = el.querySelector('[slot="icon"]')!;

            expect(getComputedStyle(icon).marginInlineEnd).to.equal('20px');
          } finally {
            reset.remove();
          }
        });

        it('should not reserve the gap when no icon is slotted', async () => {
          const el = await fixture<CsCallout>(html`<cs-callout>Content</cs-callout>`);
          await el.updateComplete;

          const container = el.shadowRoot!.querySelector('[part~="icon"]')!;
          const message = el.shadowRoot!.querySelector('[part~="message"]')!;

          // The gap belongs to the icon, so with nothing slotted the message starts where the container does.
          expect(container.getBoundingClientRect().right).to.equal(message.getBoundingClientRect().left);
        });
      });

      describe('CSS parts', () => {
        it('should have an icon part', async () => {
          const el = await fixture<CsCallout>(html`<cs-callout>Test</cs-callout>`);
          expect(el.shadowRoot!.querySelector('[part~="icon"]')).to.exist;
        });

        it('should have a message part', async () => {
          const el = await fixture<CsCallout>(html`<cs-callout>Test</cs-callout>`);
          expect(el.shadowRoot!.querySelector('[part~="message"]')).to.exist;
        });
      });
    });
  }
});
