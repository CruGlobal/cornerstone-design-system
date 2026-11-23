import { expect } from '@open-wc/testing';
import { html } from 'lit';
import { expectEvent } from '../../internal/test/expect-event.js';
import { fixtures } from '../../internal/test/fixture.js';
import type CsTag from './tag.js';

describe('<cs-tag>', () => {
  for (const fixture of fixtures) {
    describe(`with "${fixture.type}" rendering`, () => {
      describe('accessibility', () => {
        it('should be accessible with default properties', async () => {
          const el = await fixture<CsTag>(html`<cs-tag>Test</cs-tag>`);
          await expect(el).to.be.accessible();
        });

        it('should be accessible with a remove button', async () => {
          const el = await fixture<CsTag>(html`<cs-tag with-remove>Test</cs-tag>`);
          await expect(el).to.be.accessible();
        });

        it('should be accessible with start content', async () => {
          const el = await fixture<CsTag>(
            html`<cs-tag with-remove><cs-icon slot="start" name="check" library="system"></cs-icon>Test</cs-tag>`,
          );
          await expect(el).to.be.accessible();
        });
      });

      describe('properties', () => {
        it('should have default property values', async () => {
          const el = await fixture<CsTag>(html`<cs-tag>Test</cs-tag>`);

          expect(el.variant).to.equal('neutral');
          expect(el.appearance).to.equal('filled-outlined');
          expect(el.size).to.equal('m');
          expect(el.pill).to.equal(false);
          expect(el.withRemove).to.equal(false);
        });

        it('should reflect the variant attribute', async () => {
          const el = await fixture<CsTag>(html`<cs-tag variant="danger">Test</cs-tag>`);
          expect(el.getAttribute('variant')).to.equal('danger');
          expect(el.variant).to.equal('danger');
        });

        it('should reflect the appearance attribute', async () => {
          const el = await fixture<CsTag>(html`<cs-tag appearance="filled">Test</cs-tag>`);
          expect(el.getAttribute('appearance')).to.equal('filled');
          expect(el.appearance).to.equal('filled');
        });

        it('should reflect the size attribute', async () => {
          const el = await fixture<CsTag>(html`<cs-tag size="l">Test</cs-tag>`);
          expect(el.getAttribute('size')).to.equal('l');
          expect(el.size).to.equal('l');
        });

        it('should reflect the pill attribute', async () => {
          const el = await fixture<CsTag>(html`<cs-tag pill>Test</cs-tag>`);
          expect(el.pill).to.equal(true);
          expect(el.hasAttribute('pill')).to.be.true;
        });

        it('should accept all valid variants', async () => {
          const el = await fixture<CsTag>(html`<cs-tag>Test</cs-tag>`);
          const variants = ['brand', 'neutral', 'highlight', 'information', 'success', 'warning', 'danger'] as const;

          for (const variant of variants) {
            el.variant = variant;
            await el.updateComplete;
            expect(el.variant).to.equal(variant);
            expect(el.getAttribute('variant')).to.equal(variant);
          }
        });

        it('should show the remove button when with-remove is set', async () => {
          const el = await fixture<CsTag>(html`<cs-tag with-remove>Test</cs-tag>`);
          const removeButton = el.shadowRoot!.querySelector('cs-button');
          expect(removeButton).to.exist;
        });

        it('should not show the remove button by default', async () => {
          const el = await fixture<CsTag>(html`<cs-tag>Test</cs-tag>`);
          const removeButton = el.shadowRoot!.querySelector('cs-button');
          expect(removeButton).to.be.null;
        });
      });

      describe('events', () => {
        it('should emit cs-remove when the remove button is clicked', async () => {
          const el = await fixture<CsTag>(html`<cs-tag with-remove>Test</cs-tag>`);
          const removeButton = el.shadowRoot!.querySelector<HTMLElement>('cs-button')!;

          await expectEvent(el, 'cs-remove', () => removeButton.click());
        });
      });

      describe('slots', () => {
        it('should render the default slot content', async () => {
          const el = await fixture<CsTag>(html`<cs-tag>Hello</cs-tag>`);
          const slot = el.shadowRoot!.querySelector('slot:not([name])');
          expect(slot).to.exist;
        });

        it('should place start content before the content, a gap apart', async () => {
          const el = await fixture<CsTag>(
            html`<cs-tag><cs-icon slot="start" name="check" library="system"></cs-icon><span>Done</span></cs-tag>`,
          );
          const icon = el.querySelector('cs-icon')!;
          const text = el.querySelector('span')!;
          const gap = parseFloat(getComputedStyle(el).columnGap);

          expect(icon.assignedSlot?.name).to.equal('start');
          expect(text.getBoundingClientRect().left - icon.getBoundingClientRect().right).to.be.closeTo(gap, 0.5);
        });

        // The tag spaces its children with a flex gap, so a start slot that drew a box of its own would add a gap
        // to every tag, filled or not.
        it('should leave no space when the start slot is empty', async () => {
          const el = await fixture<CsTag>(html`<cs-tag><span>Done</span></cs-tag>`);
          const style = getComputedStyle(el);
          const inset = parseFloat(style.paddingInlineStart) + parseFloat(style.borderInlineStartWidth);

          const offset = el.querySelector('span')!.getBoundingClientRect().left - el.getBoundingClientRect().left;
          expect(offset).to.be.closeTo(inset, 0.5);
        });
      });

      describe('start content sizing', () => {
        for (const size of ['xs', 's', 'm', 'l', 'xl'] as const) {
          it(`should draw a start icon at the text's size when size="${size}"`, async () => {
            const el = await fixture<CsTag>(
              html`<cs-tag size=${size}
                ><cs-icon slot="start" name="check" library="system"></cs-icon><span>Done</span></cs-tag
              >`,
            );
            const textSize = parseFloat(getComputedStyle(el.querySelector('span')!).fontSize);

            expect(el.querySelector('cs-icon')!.getBoundingClientRect().height).to.be.closeTo(textSize, 0.5);
          });

          it(`should fit a start avatar inside the tag when size="${size}"`, async () => {
            const el = await fixture<CsTag>(
              html`<cs-tag size=${size}
                ><cs-avatar slot="start" initials="AB"></cs-avatar><span>Ana Bell</span></cs-tag
              >`,
            );
            const textSize = parseFloat(getComputedStyle(el.querySelector('span')!).fontSize);
            const avatar = el.querySelector('cs-avatar')!.getBoundingClientRect();
            const tag = el.getBoundingClientRect();

            expect(avatar.width).to.be.closeTo(textSize * 1.75, 0.5);
            expect(avatar.height).to.be.closeTo(avatar.width, 0.5);
            expect(avatar.top).to.be.above(tag.top);
            expect(avatar.bottom).to.be.below(tag.bottom);
          });
        }
      });

      describe('CSS parts', () => {
        it('should have a content part', async () => {
          const el = await fixture<CsTag>(html`<cs-tag>Test</cs-tag>`);
          expect(el.shadowRoot!.querySelector('[part~="content"]')).to.exist;
        });

        it('should have a remove-button part when removable', async () => {
          const el = await fixture<CsTag>(html`<cs-tag with-remove>Test</cs-tag>`);
          expect(el.shadowRoot!.querySelector('[part~="remove-button"]')).to.exist;
        });
      });
    });
  }
});
