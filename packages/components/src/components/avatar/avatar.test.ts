import { expect, waitUntil } from '@open-wc/testing';
import { html } from 'lit';
import { expectEvent } from '../../internal/test/expect-event.js';
import { fixtures } from '../../internal/test/fixture.js';
import type CsAvatar from './avatar.js';

const ignoredRules = ['color-contrast'];

describe('<cs-avatar>', () => {
  for (const fixture of fixtures) {
    describe(`with "${fixture.type}" rendering`, () => {
      describe('accessibility', () => {
        it('should pass accessibility tests with defaults', async () => {
          const el = await fixture<CsAvatar>(html`<cs-avatar label="Avatar"></cs-avatar>`);
          await expect(el).to.be.accessible({ ignoredRules });
        });

        it('should pass accessibility tests with an image', async () => {
          const el = await fixture<CsAvatar>(html`
            <cs-avatar
              image="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
              label="Transparent pixel"
            ></cs-avatar>
          `);
          await expect(el).to.be.accessible({ ignoredRules });
        });

        it('should pass accessibility tests with initials', async () => {
          const el = await fixture<CsAvatar>(html`<cs-avatar initials="AB" label="Avatar"></cs-avatar>`);
          await expect(el).to.be.accessible({ ignoredRules });
        });

        it('should pass accessibility tests with a custom icon slot', async () => {
          const el = await fixture<CsAvatar>(html` <cs-avatar label="Avatar"><span slot="icon">X</span></cs-avatar> `);
          await expect(el).to.be.accessible({ ignoredRules });
        });
      });

      describe('properties', () => {
        it('should have an empty image by default', async () => {
          const el = await fixture<CsAvatar>(html`<cs-avatar label="Avatar"></cs-avatar>`);
          expect(el.image).to.equal('');
        });

        it('should have an empty label by default', async () => {
          const el = await fixture<CsAvatar>(html`<cs-avatar></cs-avatar>`);
          expect(el.label).to.equal('');
        });

        it('should have empty initials by default', async () => {
          const el = await fixture<CsAvatar>(html`<cs-avatar></cs-avatar>`);
          expect(el.initials).to.equal('');
        });

        it('should default loading to "eager"', async () => {
          const el = await fixture<CsAvatar>(html`<cs-avatar></cs-avatar>`);
          expect(el.loading).to.equal('eager');
        });

        it('should default shape to "circle" and reflect it', async () => {
          const el = await fixture<CsAvatar>(html`<cs-avatar></cs-avatar>`);
          expect(el.shape).to.equal('circle');
          expect(el.getAttribute('shape')).to.equal('circle');
        });

        it('should reflect shape attribute for all shapes', async () => {
          for (const shape of ['circle', 'square', 'rounded'] as const) {
            const el = await fixture<CsAvatar>(html`<cs-avatar shape="${shape}" label="Avatar"></cs-avatar>`);
            expect(el.getAttribute('shape')).to.equal(shape);
          }
        });

        it('should render the image when image property is set', async () => {
          const src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
          const el = await fixture<CsAvatar>(html`<cs-avatar image="${src}" label="Avatar"></cs-avatar>`);
          const img = el.shadowRoot!.querySelector('[part~="image"]')!;
          expect(img).to.exist;
          expect(img.getAttribute('src')).to.equal(src);
        });

        it('should render initials when initials property is set', async () => {
          const el = await fixture<CsAvatar>(html`<cs-avatar initials="AB" label="Avatar"></cs-avatar>`);
          const initials = el.shadowRoot!.querySelector<HTMLElement>('[part~="initials"]')!;
          expect(initials).to.exist;
          expect(initials.textContent.trim()).to.equal('AB');
        });

        it('should set aria-label on the image element', async () => {
          const src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
          const el = await fixture<CsAvatar>(html`<cs-avatar image="${src}" label="User photo"></cs-avatar>`);
          const img = el.shadowRoot!.querySelector('[part~="image"]')!;
          expect(img.getAttribute('aria-label')).to.equal('User photo');
        });

        it('should set aria-label on the initials element', async () => {
          const el = await fixture<CsAvatar>(html`<cs-avatar initials="AB" label="User initials"></cs-avatar>`);
          const initials = el.shadowRoot!.querySelector('[part~="initials"]')!;
          expect(initials.getAttribute('aria-label')).to.equal('User initials');
        });
      });

      describe('slots', () => {
        it('should render a default icon when no image or initials are provided', async () => {
          const el = await fixture<CsAvatar>(html`<cs-avatar label="Avatar"></cs-avatar>`);
          const iconSlot = el.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="icon"]');
          expect(iconSlot).to.exist;
        });

        it('should accept custom content in the icon slot', async () => {
          const el = await fixture<CsAvatar>(html`
            <cs-avatar label="Avatar"><span slot="icon">custom icon</span></cs-avatar>
          `);
          const slot = el.shadowRoot!.querySelector<HTMLSlotElement>('slot[name=icon]')!;
          const assigned = slot.assignedNodes({ flatten: true }) as HTMLElement[];
          expect(assigned.length).to.equal(1);
          expect(assigned[0].innerHTML).to.equal('custom icon');
        });
      });

      describe('CSS parts and states', () => {
        it('should expose an "image" part when an image is provided', async () => {
          const src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
          const el = await fixture<CsAvatar>(html`<cs-avatar image="${src}" label="Avatar"></cs-avatar>`);
          expect(el.shadowRoot!.querySelector('[part~="image"]')).to.exist;
        });

        it('should expose an "initials" part when initials are provided', async () => {
          const el = await fixture<CsAvatar>(html`<cs-avatar initials="AB" label="Avatar"></cs-avatar>`);
          expect(el.shadowRoot!.querySelector('[part~="initials"]')).to.exist;
        });

        it('should expose an "icon" part when showing the default icon', async () => {
          const el = await fixture<CsAvatar>(html`<cs-avatar label="Avatar"></cs-avatar>`);
          expect(el.shadowRoot!.querySelector('[part~="icon"]')).to.exist;
        });
      });

      describe('error handling', () => {
        it('should emit cs-error and hide the image when loading fails', async () => {
          const el = await fixture<CsAvatar>(html`<cs-avatar></cs-avatar>`);

          await expectEvent(el, ['cs-error'], async () => {
            el.image = 'bad_image';
            await el.updateComplete;
          });

          await waitUntil(() => el.shadowRoot!.querySelector('img') === null);
          expect(el.shadowRoot!.querySelector('img')).to.be.null;
        });

        it('should show the image again after setting a valid image', async () => {
          const el = await fixture<CsAvatar>(html`<cs-avatar></cs-avatar>`);
          el.image = 'bad_image';
          await el.updateComplete;
          await waitUntil(() => el.shadowRoot!.querySelector('img') === null);

          el.image = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
          await el.updateComplete;
          expect(el.shadowRoot!.querySelector('img')).to.exist;
        });
      });
    });
  }
});
