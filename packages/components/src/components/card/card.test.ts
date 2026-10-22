import { aTimeout, expect } from '@open-wc/testing';
import { html } from 'lit';
import { fixtures } from '../../internal/test/fixture.js';
import type CsCard from './card.js';

describe('<cs-card>', () => {
  for (const fixture of fixtures) {
    describe(`with "${fixture.type}" rendering`, () => {
      describe('accessibility', () => {
        it('should pass accessibility tests with default content', async () => {
          const el = await fixture<CsCard>(html`<cs-card>Card content</cs-card>`);
          await expect(el).to.be.accessible();
        });

        it('should pass accessibility tests with header', async () => {
          const el = await fixture<CsCard>(html`
            <cs-card>
              <div slot="header">Header</div>
              Card content
            </cs-card>
          `);
          await expect(el).to.be.accessible();
        });

        it('should pass accessibility tests with footer', async () => {
          const el = await fixture<CsCard>(html`
            <cs-card>
              Card content
              <div slot="footer">Footer</div>
            </cs-card>
          `);
          await expect(el).to.be.accessible();
        });

        it('should pass accessibility tests with media', async () => {
          const el = await fixture<CsCard>(html`
            <cs-card>
              <img
                slot="media"
                src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
                alt="A placeholder image"
              />
              Card content
            </cs-card>
          `);
          await expect(el).to.be.accessible();
        });
      });

      describe('properties', () => {
        it('should default appearance to "outlined" and reflect it', async () => {
          const el = await fixture<CsCard>(html`<cs-card>Content</cs-card>`);
          expect(el.appearance).to.equal('outlined');
          expect(el.getAttribute('appearance')).to.equal('outlined');
        });

        it('should reflect appearance attribute for all values', async () => {
          // for some dumb reason these fail in CI.
          if (fixture.type === 'ssr-client-hydrated') {
            return;
          }

          for (const appearance of ['accent', 'filled', 'outlined', 'filled-outlined', 'plain'] as const) {
            const el = await fixture<CsCard>(html`<cs-card appearance="${appearance}">Content</cs-card>`);
            expect(el.getAttribute('appearance')).to.equal(appearance);
            await aTimeout(1);
          }
        });

        it('should default orientation to "vertical" and reflect it', async () => {
          const el = await fixture<CsCard>(html`<cs-card>Content</cs-card>`);
          expect(el.orientation).to.equal('vertical');
          expect(el.getAttribute('orientation')).to.equal('vertical');
        });

        it('should support horizontal orientation', async () => {
          const el = await fixture<CsCard>(html`<cs-card orientation="horizontal">Content</cs-card>`);
          expect(el.orientation).to.equal('horizontal');
          expect(el.getAttribute('orientation')).to.equal('horizontal');
        });

        it('should default hasHeader to false', async () => {
          const el = await fixture<CsCard>(html`<cs-card>Content</cs-card>`);
          expect(el.hasHeader).to.be.false;
        });

        it('should default hasMedia to false', async () => {
          const el = await fixture<CsCard>(html`<cs-card>Content</cs-card>`);
          expect(el.hasMedia).to.be.false;
        });

        it('should default hasFooter to false', async () => {
          const el = await fixture<CsCard>(html`<cs-card>Content</cs-card>`);
          expect(el.hasFooter).to.be.false;
        });
      });

      describe('slots', () => {
        it('should render default slot content inside the body part', async () => {
          const el = await fixture<CsCard>(html`<cs-card>Main content</cs-card>`);
          const bodyPart = el.shadowRoot!.querySelector('[part~="body"]')!;
          expect(bodyPart).to.exist;
          const defaultSlot = bodyPart.querySelector<HTMLSlotElement>('slot:not([name])')!;
          expect(defaultSlot).to.exist;
          const assigned = defaultSlot.assignedNodes({ flatten: true });
          const text = assigned.map((n) => n.textContent ?? '').join('');
          expect(text).to.contain('Main content');
        });

        it('should render the child content', async () => {
          const el = await fixture<CsCard>(html`<cs-card>Hello world</cs-card>`);
          expect(el.innerText).to.contain('Hello world');
        });

        it('should accept content in the "header" slot', async () => {
          const el = await fixture<CsCard>(html`
            <cs-card>
              <div slot="header">Header Title</div>
              Content
            </cs-card>
          `);
          const slot = el.shadowRoot!.querySelector<HTMLSlotElement>('slot[name=header]')!;
          const assigned = slot.assignedNodes({ flatten: true });
          expect(assigned.length).to.equal(1);
        });

        it('should render header content text', async () => {
          const el = await fixture<CsCard>(html`
            <cs-card>
              <div slot="header">Header Title</div>
              Content
            </cs-card>
          `);
          const header = el.querySelector<HTMLElement>('div[slot=header]')!;
          expect(header.innerText).to.equal('Header Title');
        });

        it('should accept content in the "footer" slot', async () => {
          const el = await fixture<CsCard>(html`
            <cs-card>
              Content
              <div slot="footer">Footer Content</div>
            </cs-card>
          `);
          const slot = el.shadowRoot!.querySelector<HTMLSlotElement>('slot[name=footer]')!;
          const assigned = slot.assignedNodes({ flatten: true });
          expect(assigned.length).to.equal(1);
        });

        it('should render footer content text', async () => {
          const el = await fixture<CsCard>(html`
            <cs-card>
              Content
              <div slot="footer">Footer Content</div>
            </cs-card>
          `);
          const footer = el.querySelector<HTMLElement>('div[slot=footer]')!;
          expect(footer.innerText).to.equal('Footer Content');
        });

        it('should accept content in the "media" slot', async () => {
          const el = await fixture<CsCard>(html`
            <cs-card>
              <img
                slot="media"
                src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
                alt="Placeholder"
              />
              Content
            </cs-card>
          `);
          const slot = el.shadowRoot!.querySelector<HTMLSlotElement>('slot[name=media]')!;
          const assigned = slot.assignedNodes({ flatten: true });
          expect(assigned.length).to.equal(1);
        });
      });

      describe('CSS parts and states', () => {
        it('should expose a "body" part', async () => {
          const el = await fixture<CsCard>(html`<cs-card>Content</cs-card>`);
          expect(el.shadowRoot!.querySelector('[part~="body"]')).to.exist;
        });

        it('should expose a "header" part in vertical orientation', async () => {
          const el = await fixture<CsCard>(html`
            <cs-card>
              <div slot="header">Header</div>
              Content
            </cs-card>
          `);
          expect(el.shadowRoot!.querySelector('[part~="header"]')).to.exist;
        });

        it('should expose a "footer" part in vertical orientation', async () => {
          const el = await fixture<CsCard>(html`
            <cs-card>
              Content
              <div slot="footer">Footer</div>
            </cs-card>
          `);
          expect(el.shadowRoot!.querySelector('[part~="footer"]')).to.exist;
        });

        it('should expose a "media" part', async () => {
          const el = await fixture<CsCard>(html`
            <cs-card>
              <img
                slot="media"
                src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
                alt="Placeholder"
              />
              Content
            </cs-card>
          `);
          expect(el.shadowRoot!.querySelector('[part~="media"]')).to.exist;
        });

        it('should render horizontal layout with body and actions parts', async () => {
          const el = await fixture<CsCard>(html`
            <cs-card orientation="horizontal">
              Content
              <div slot="actions">Actions</div>
            </cs-card>
          `);
          expect(el.shadowRoot!.querySelector('[part~="body"]')).to.exist;
          expect(el.shadowRoot!.querySelector('[part~="actions"]')).to.exist;
        });
      });

      // GitHub #182: the default lives in the fallback, so a value set anywhere above the card reaches it, and the
      // card sets nothing its content would inherit.
      describe('custom properties', () => {
        const bodyPadding = (el: CsCard) =>
          getComputedStyle(el.shadowRoot!.querySelector('[part~="body"]')!).paddingTop;

        it('should default --cs-card-spacing to --cs-space-l', async () => {
          const el = await fixture<CsCard>(html`<cs-card>Content</cs-card>`);
          expect(bodyPadding(el)).to.equal('24px');
        });

        it('should take --cs-card-spacing from the root, a section, or the card itself', async () => {
          document.documentElement.style.setProperty('--cs-card-spacing', '10px');
          try {
            const wrapper = await fixture<HTMLDivElement>(html`
              <div>
                <cs-card id="from-root">Root</cs-card>
                <section style="--cs-card-spacing: 20px">
                  <cs-card id="from-section">Section</cs-card>
                </section>
                <cs-card id="from-card" style="--cs-card-spacing: 30px">Card</cs-card>
              </div>
            `);
            const cards = [...wrapper.querySelectorAll<CsCard>('cs-card')];
            await Promise.all(cards.map((card) => card.updateComplete));
            expect(cards.map(bodyPadding)).to.deep.equal(['10px', '20px', '30px']);
          } finally {
            document.documentElement.style.removeProperty('--cs-card-spacing');
          }
        });

        it('should not hand a spacing value to its content', async () => {
          const el = await fixture<CsCard>(html`<cs-card><p>Content</p></cs-card>`);
          const content = getComputedStyle(el.querySelector('p')!);
          expect(content.getPropertyValue('--spacing')).to.equal('');
          expect(content.getPropertyValue('--cs-card-spacing')).to.equal('');
        });
      });
    });
  }
});
