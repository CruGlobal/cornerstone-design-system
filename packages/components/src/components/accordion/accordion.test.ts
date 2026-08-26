import { expect, waitUntil } from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import { html } from 'lit';
import sinon from 'sinon';
import { expectEvent } from '../../internal/test/expect-event.js';
import { fixtures } from '../../internal/test/fixture.js';
import { clickOnElement } from '../../internal/test/pointer-utilities.js';
import type CsAccordionItem from '../accordion-item/accordion-item.js';
import type CsAccordion from './accordion.js';

describe('<cs-accordion>', () => {
  for (const fixture of fixtures) {
    describe(`with "${fixture.type}" rendering`, () => {
      describe('accessibility', () => {
        it('should be accessible', async () => {
          const el = await fixture<CsAccordion>(html`
            <cs-accordion>
              <cs-accordion-item label="One">Content one</cs-accordion-item>
              <cs-accordion-item label="Two">Content two</cs-accordion-item>
            </cs-accordion>
          `);
          await expect(el).to.be.accessible();
        });

        it('should be accessible with an expanded item', async () => {
          const el = await fixture<CsAccordion>(html`
            <cs-accordion>
              <cs-accordion-item label="One" expanded>Content one</cs-accordion-item>
              <cs-accordion-item label="Two">Content two</cs-accordion-item>
            </cs-accordion>
          `);
          await expect(el).to.be.accessible();
        });
      });

      describe('properties', () => {
        it('should default mode to multiple', async () => {
          const el = await fixture<CsAccordion>(html`
            <cs-accordion>
              <cs-accordion-item label="One">Content</cs-accordion-item>
            </cs-accordion>
          `);
          expect(el.mode).to.equal('multiple');
        });

        it('should default iconPlacement to end', async () => {
          const el = await fixture<CsAccordion>(html`
            <cs-accordion>
              <cs-accordion-item label="One">Content</cs-accordion-item>
            </cs-accordion>
          `);
          expect(el.iconPlacement).to.equal('end');
        });

        it('should reflect the mode property', async () => {
          const el = await fixture<CsAccordion>(html`
            <cs-accordion>
              <cs-accordion-item label="One">Content</cs-accordion-item>
            </cs-accordion>
          `);
          el.mode = 'single';
          await el.updateComplete;
          expect(el.getAttribute('mode')).to.equal('single');
        });

        it('should reflect the icon-placement property', async () => {
          const el = await fixture<CsAccordion>(html`
            <cs-accordion>
              <cs-accordion-item label="One">Content</cs-accordion-item>
            </cs-accordion>
          `);
          el.iconPlacement = 'start';
          await el.updateComplete;
          expect(el.getAttribute('icon-placement')).to.equal('start');
        });

        it('should sync iconPlacement to all child items', async () => {
          const el = await fixture<CsAccordion>(html`
            <cs-accordion icon-placement="start">
              <cs-accordion-item label="One">Content</cs-accordion-item>
              <cs-accordion-item label="Two">Content</cs-accordion-item>
            </cs-accordion>
          `);
          await el.updateComplete;
          const items = el.querySelectorAll<CsAccordionItem>('cs-accordion-item');
          for (const item of items) {
            expect(item.iconPlacement).to.equal('start');
          }
        });

        it('should update iconPlacement on children when the property changes', async () => {
          const el = await fixture<CsAccordion>(html`
            <cs-accordion>
              <cs-accordion-item label="One">Content</cs-accordion-item>
              <cs-accordion-item label="Two">Content</cs-accordion-item>
            </cs-accordion>
          `);
          el.iconPlacement = 'start';
          await el.updateComplete;
          const items = el.querySelectorAll<CsAccordionItem>('cs-accordion-item');
          for (const item of items) {
            expect(item.iconPlacement).to.equal('start');
          }
        });
      });

      describe('events', () => {
        it('should emit cs-accordion-expand and cs-accordion-after-expand when an item expands via click', async () => {
          const el = await fixture<CsAccordion>(html`
            <cs-accordion>
              <cs-accordion-item label="One">Content</cs-accordion-item>
            </cs-accordion>
          `);
          const item = el.querySelector('cs-accordion-item')!;
          const button = item.shadowRoot!.querySelector<HTMLButtonElement>('[part~="button"]')!;

          await expectEvent(el, ['cs-accordion-expand', 'cs-accordion-after-expand'], () => clickOnElement(button));
        });

        it('should emit cs-accordion-collapse and cs-accordion-after-collapse when an item collapses via click', async () => {
          const el = await fixture<CsAccordion>(html`
            <cs-accordion>
              <cs-accordion-item label="One" expanded>Content</cs-accordion-item>
            </cs-accordion>
          `);
          const item = el.querySelector('cs-accordion-item')!;
          const button = item.shadowRoot!.querySelector<HTMLButtonElement>('[part~="button"]')!;

          await expectEvent(el, ['cs-accordion-collapse', 'cs-accordion-after-collapse'], async () => {
            await clickOnElement(button);
          });
        });

        it('should include the item in the event detail', async () => {
          const el = await fixture<CsAccordion>(html`
            <cs-accordion>
              <cs-accordion-item label="One">Content</cs-accordion-item>
            </cs-accordion>
          `);
          const item = el.querySelector<CsAccordionItem>('cs-accordion-item')!;
          const button = item.shadowRoot!.querySelector<HTMLButtonElement>('[part~="button"]')!;

          const [event] = await expectEvent(el, 'cs-accordion-expand', () => clickOnElement(button));
          expect((event as CustomEvent).detail.item).to.equal(item);
        });

        it('should not emit events when clicking a disabled item', async () => {
          const el = await fixture<CsAccordion>(html`
            <cs-accordion>
              <cs-accordion-item label="One" disabled>Content</cs-accordion-item>
            </cs-accordion>
          `);
          const item = el.querySelector('cs-accordion-item')!;
          const button = item.shadowRoot!.querySelector<HTMLButtonElement>('[part~="button"]')!;
          const spy = sinon.spy();
          el.addEventListener('cs-accordion-expand', spy);

          await clickOnElement(button);
          await el.updateComplete;

          expect(spy).not.to.have.been.called;
        });
      });

      describe('cancelable events', () => {
        it('should not expand when cs-accordion-expand is prevented', async () => {
          const el = await fixture<CsAccordion>(html`
            <cs-accordion>
              <cs-accordion-item label="One">Content</cs-accordion-item>
            </cs-accordion>
          `);
          const item = el.querySelector<CsAccordionItem>('cs-accordion-item')!;
          const button = item.shadowRoot!.querySelector<HTMLButtonElement>('[part~="button"]')!;

          el.addEventListener('cs-accordion-expand', (e: Event) => e.preventDefault());
          await clickOnElement(button);
          await el.updateComplete;

          expect(item.expanded).to.be.false;
        });

        it('should not collapse when cs-accordion-collapse is prevented', async () => {
          const el = await fixture<CsAccordion>(html`
            <cs-accordion>
              <cs-accordion-item label="One" expanded>Content</cs-accordion-item>
            </cs-accordion>
          `);
          const item = el.querySelector<CsAccordionItem>('cs-accordion-item')!;
          const button = item.shadowRoot!.querySelector<HTMLButtonElement>('[part~="button"]')!;

          el.addEventListener('cs-accordion-collapse', (e: Event) => e.preventDefault());
          await clickOnElement(button);
          await el.updateComplete;

          expect(item.expanded).to.be.true;
        });

        it('should not emit cs-accordion-after-expand when cs-accordion-expand is prevented', async () => {
          const el = await fixture<CsAccordion>(html`
            <cs-accordion>
              <cs-accordion-item label="One">Content</cs-accordion-item>
            </cs-accordion>
          `);
          const item = el.querySelector('cs-accordion-item')!;
          const button = item.shadowRoot!.querySelector<HTMLButtonElement>('[part~="button"]')!;
          const afterExpandSpy = sinon.spy();

          el.addEventListener('cs-accordion-expand', (e: Event) => e.preventDefault());
          el.addEventListener('cs-accordion-after-expand', afterExpandSpy);

          await clickOnElement(button);
          await el.updateComplete;

          expect(afterExpandSpy).not.to.have.been.called;
        });
      });

      describe('single mode', () => {
        it('should close the open item when another item is opened', async () => {
          const el = await fixture<CsAccordion>(html`
            <cs-accordion mode="single">
              <cs-accordion-item label="One" expanded>Content one</cs-accordion-item>
              <cs-accordion-item label="Two">Content two</cs-accordion-item>
            </cs-accordion>
          `);
          const [first, second] = el.querySelectorAll<CsAccordionItem>('cs-accordion-item');
          const secondButton = second.shadowRoot!.querySelector<HTMLButtonElement>('[part~="button"]')!;

          expect(first.expanded).to.be.true;

          await clickOnElement(secondButton);
          await waitUntil(() => first.expanded === false);

          expect(first.expanded).to.be.false;
          expect(second.expanded).to.be.true;
        });

        it('should not collapse the open item when it is clicked again', async () => {
          const el = await fixture<CsAccordion>(html`
            <cs-accordion mode="single">
              <cs-accordion-item label="One" expanded>Content one</cs-accordion-item>
              <cs-accordion-item label="Two">Content two</cs-accordion-item>
            </cs-accordion>
          `);
          const [first] = el.querySelectorAll<CsAccordionItem>('cs-accordion-item');
          const firstButton = first.shadowRoot!.querySelector<HTMLButtonElement>('[part~="button"]')!;

          await clickOnElement(firstButton);
          await el.updateComplete;

          expect(first.expanded).to.be.true;
        });

        it('should allow multiple items to be open when mode is multiple', async () => {
          const el = await fixture<CsAccordion>(html`
            <cs-accordion>
              <cs-accordion-item label="One" expanded>Content one</cs-accordion-item>
              <cs-accordion-item label="Two">Content two</cs-accordion-item>
            </cs-accordion>
          `);
          const [first, second] = el.querySelectorAll<CsAccordionItem>('cs-accordion-item');
          const secondButton = second.shadowRoot!.querySelector<HTMLButtonElement>('[part~="button"]')!;

          await clickOnElement(secondButton);
          await waitUntil(() => second.expanded === true);

          expect(first.expanded).to.be.true;
          expect(second.expanded).to.be.true;
        });
      });

      describe('single-collapsible mode', () => {
        it('should close the open item when another item is opened', async () => {
          const el = await fixture<CsAccordion>(html`
            <cs-accordion mode="single-collapsible">
              <cs-accordion-item label="One" expanded>Content one</cs-accordion-item>
              <cs-accordion-item label="Two">Content two</cs-accordion-item>
            </cs-accordion>
          `);
          const [first, second] = el.querySelectorAll<CsAccordionItem>('cs-accordion-item');
          const secondButton = second.shadowRoot!.querySelector<HTMLButtonElement>('[part~="button"]')!;

          await clickOnElement(secondButton);
          await waitUntil(() => first.expanded === false);

          expect(first.expanded).to.be.false;
          expect(second.expanded).to.be.true;
        });

        it('should collapse the open item when it is clicked again', async () => {
          const el = await fixture<CsAccordion>(html`
            <cs-accordion mode="single-collapsible">
              <cs-accordion-item label="One" expanded>Content one</cs-accordion-item>
              <cs-accordion-item label="Two">Content two</cs-accordion-item>
            </cs-accordion>
          `);
          const [first] = el.querySelectorAll<CsAccordionItem>('cs-accordion-item');
          const firstButton = first.shadowRoot!.querySelector<HTMLButtonElement>('[part~="button"]')!;

          await clickOnElement(firstButton);
          await waitUntil(() => first.expanded === false);

          expect(first.expanded).to.be.false;
        });
      });

      describe('methods', () => {
        it('expandAll() should expand all items', async () => {
          const el = await fixture<CsAccordion>(html`
            <cs-accordion>
              <cs-accordion-item label="One">Content</cs-accordion-item>
              <cs-accordion-item label="Two">Content</cs-accordion-item>
              <cs-accordion-item label="Three">Content</cs-accordion-item>
            </cs-accordion>
          `);
          el.expandAll();
          await el.updateComplete;
          const items = el.querySelectorAll<CsAccordionItem>('cs-accordion-item');
          for (const item of items) {
            expect(item.expanded).to.be.true;
          }
        });

        it('collapseAll() should collapse all items', async () => {
          const el = await fixture<CsAccordion>(html`
            <cs-accordion>
              <cs-accordion-item label="One" expanded>Content</cs-accordion-item>
              <cs-accordion-item label="Two" expanded>Content</cs-accordion-item>
              <cs-accordion-item label="Three" expanded>Content</cs-accordion-item>
            </cs-accordion>
          `);
          el.collapseAll();
          await el.updateComplete;
          const items = el.querySelectorAll<CsAccordionItem>('cs-accordion-item');
          for (const item of items) {
            expect(item.expanded).to.be.false;
          }
        });

        it('expandAll() should be a no-op when mode is single', async () => {
          const el = await fixture<CsAccordion>(html`
            <cs-accordion mode="single">
              <cs-accordion-item label="One">Content</cs-accordion-item>
              <cs-accordion-item label="Two">Content</cs-accordion-item>
            </cs-accordion>
          `);
          el.expandAll();
          await el.updateComplete;
          const items = el.querySelectorAll<CsAccordionItem>('cs-accordion-item');
          for (const item of items) {
            expect(item.expanded).to.be.false;
          }
        });

        it('expandAll() should skip disabled items', async () => {
          const el = await fixture<CsAccordion>(html`
            <cs-accordion>
              <cs-accordion-item label="One">Content</cs-accordion-item>
              <cs-accordion-item label="Two" disabled>Content</cs-accordion-item>
            </cs-accordion>
          `);
          el.expandAll();
          await el.updateComplete;
          const [first, second] = el.querySelectorAll<CsAccordionItem>('cs-accordion-item');
          expect(first.expanded).to.be.true;
          expect(second.expanded).to.be.false;
        });
      });

      describe('keyboard navigation', () => {
        it('should expand when pressing Enter on the trigger button', async () => {
          const el = await fixture<CsAccordion>(html`
            <cs-accordion>
              <cs-accordion-item label="One">Content</cs-accordion-item>
            </cs-accordion>
          `);
          const item = el.querySelector<CsAccordionItem>('cs-accordion-item')!;
          const button = item.shadowRoot!.querySelector<HTMLButtonElement>('[part~="button"]')!;
          button.focus();

          await expectEvent(el, 'cs-accordion-expand', () => sendKeys({ press: 'Enter' }));
          expect(item.expanded).to.be.true;
        });

        it('should expand when pressing Space on the trigger button', async () => {
          const el = await fixture<CsAccordion>(html`
            <cs-accordion>
              <cs-accordion-item label="One">Content</cs-accordion-item>
            </cs-accordion>
          `);
          const item = el.querySelector<CsAccordionItem>('cs-accordion-item')!;
          const button = item.shadowRoot!.querySelector<HTMLButtonElement>('[part~="button"]')!;
          button.focus();

          await expectEvent(el, 'cs-accordion-expand', () => sendKeys({ press: ' ' }));
          expect(item.expanded).to.be.true;
        });

        it('should collapse when pressing Enter on an expanded item', async () => {
          const el = await fixture<CsAccordion>(html`
            <cs-accordion>
              <cs-accordion-item label="One" expanded>Content</cs-accordion-item>
            </cs-accordion>
          `);
          const item = el.querySelector<CsAccordionItem>('cs-accordion-item')!;
          const button = item.shadowRoot!.querySelector<HTMLButtonElement>('[part~="button"]')!;
          button.focus();

          await expectEvent(el, 'cs-accordion-collapse', () => sendKeys({ press: 'Enter' }));
          expect(item.expanded).to.be.false;
        });
      });

      describe('nested accordions', () => {
        it('should leave outer items unchanged when an inner item expands', async () => {
          const outer = await fixture<CsAccordion>(html`
            <cs-accordion>
              <cs-accordion-item id="outerA" label="Outer A" expanded>
                <cs-accordion>
                  <cs-accordion-item id="inner1" label="Inner 1">Inner one</cs-accordion-item>
                  <cs-accordion-item id="inner2" label="Inner 2">Inner two</cs-accordion-item>
                </cs-accordion>
              </cs-accordion-item>
              <cs-accordion-item id="outerB" label="Outer B">Outer two</cs-accordion-item>
            </cs-accordion>
          `);
          const outerA = outer.querySelector<CsAccordionItem>('#outerA')!;
          const outerB = outer.querySelector<CsAccordionItem>('#outerB')!;
          const inner1 = outer.querySelector<CsAccordionItem>('#inner1')!;
          const inner1Button = inner1.shadowRoot!.querySelector<HTMLButtonElement>('[part~="button"]')!;

          await clickOnElement(inner1Button);
          await waitUntil(() => inner1.expanded === true);

          expect(inner1.expanded).to.be.true;
          expect(outerA.expanded).to.be.true;
          expect(outerB.expanded).to.be.false;
        });

        it('should not collapse other outer items when an inner item toggles under outer single mode', async () => {
          const outer = await fixture<CsAccordion>(html`
            <cs-accordion mode="single">
              <cs-accordion-item id="outerA" label="Outer A" expanded>
                <cs-accordion>
                  <cs-accordion-item id="inner1" label="Inner 1">Inner one</cs-accordion-item>
                </cs-accordion>
              </cs-accordion-item>
              <cs-accordion-item id="outerB" label="Outer B">Outer two</cs-accordion-item>
            </cs-accordion>
          `);
          const outerA = outer.querySelector<CsAccordionItem>('#outerA')!;
          const outerB = outer.querySelector<CsAccordionItem>('#outerB')!;
          const inner1 = outer.querySelector<CsAccordionItem>('#inner1')!;
          const inner1Button = inner1.shadowRoot!.querySelector<HTMLButtonElement>('[part~="button"]')!;

          await clickOnElement(inner1Button);
          await waitUntil(() => inner1.expanded === true);

          expect(inner1.expanded).to.be.true;
          expect(outerA.expanded).to.be.true;
          expect(outerB.expanded).to.be.false;
        });

        it('should fire cs-accordion-expand only on the inner accordion when an inner item is triggered', async () => {
          const outer = await fixture<CsAccordion>(html`
            <cs-accordion>
              <cs-accordion-item label="Outer A" expanded>
                <cs-accordion id="inner">
                  <cs-accordion-item id="inner1" label="Inner 1">Inner one</cs-accordion-item>
                </cs-accordion>
              </cs-accordion-item>
            </cs-accordion>
          `);
          const inner = outer.querySelector<CsAccordion>('#inner')!;
          const inner1 = outer.querySelector<CsAccordionItem>('#inner1')!;
          const inner1Button = inner1.shadowRoot!.querySelector<HTMLButtonElement>('[part~="button"]')!;

          const outerSelfSpy = sinon.spy();
          const innerSelfSpy = sinon.spy();
          outer.addEventListener('cs-accordion-expand', (event) => {
            if (event.target === outer) {
              outerSelfSpy();
            }
          });
          inner.addEventListener('cs-accordion-expand', (event) => {
            if (event.target === inner) {
              innerSelfSpy();
            }
          });

          await clickOnElement(inner1Button);
          await waitUntil(() => inner1.expanded === true);

          expect(innerSelfSpy).to.have.been.calledOnce;
          expect(outerSelfSpy).not.to.have.been.called;
        });

        it('should keep ArrowDown focus inside the inner accordion', async () => {
          const outer = await fixture<CsAccordion>(html`
            <cs-accordion>
              <cs-accordion-item label="Outer A" expanded>
                <cs-accordion>
                  <cs-accordion-item id="inner1" label="Inner 1">Inner one</cs-accordion-item>
                  <cs-accordion-item id="inner2" label="Inner 2">Inner two</cs-accordion-item>
                </cs-accordion>
              </cs-accordion-item>
              <cs-accordion-item label="Outer B">Outer two</cs-accordion-item>
            </cs-accordion>
          `);
          const inner1 = outer.querySelector<CsAccordionItem>('#inner1')!;
          const inner2 = outer.querySelector<CsAccordionItem>('#inner2')!;
          const inner1Button = inner1.shadowRoot!.querySelector<HTMLButtonElement>('[part~="button"]')!;

          inner1Button.focus();
          await sendKeys({ press: 'ArrowDown' });

          expect(document.activeElement).to.equal(inner2);
        });

        it('expandAll() on the outer accordion should only expand its direct children', async () => {
          const outer = await fixture<CsAccordion>(html`
            <cs-accordion>
              <cs-accordion-item id="outerA" label="Outer A">
                <cs-accordion>
                  <cs-accordion-item id="inner1" label="Inner 1">Inner one</cs-accordion-item>
                  <cs-accordion-item id="inner2" label="Inner 2">Inner two</cs-accordion-item>
                </cs-accordion>
              </cs-accordion-item>
              <cs-accordion-item id="outerB" label="Outer B">Outer two</cs-accordion-item>
            </cs-accordion>
          `);
          const outerA = outer.querySelector<CsAccordionItem>('#outerA')!;
          const outerB = outer.querySelector<CsAccordionItem>('#outerB')!;
          const inner1 = outer.querySelector<CsAccordionItem>('#inner1')!;
          const inner2 = outer.querySelector<CsAccordionItem>('#inner2')!;

          outer.expandAll();
          await outer.updateComplete;

          expect(outerA.expanded).to.be.true;
          expect(outerB.expanded).to.be.true;
          expect(inner1.expanded).to.be.false;
          expect(inner2.expanded).to.be.false;
        });
      });
    });
  }
});
