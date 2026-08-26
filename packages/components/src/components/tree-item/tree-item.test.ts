import { expect, oneEvent, waitUntil } from '@open-wc/testing';
import { html } from 'lit';
import sinon from 'sinon';
import { fixtures } from '../../internal/test/fixture.js';
import type CsTreeItem from './tree-item.js';

describe('<cs-tree-item>', () => {
  for (const fixture of fixtures) {
    describe(`with "${fixture.type}" rendering`, () => {
      describe('accessibility', () => {
        it('should pass accessibility tests', async () => {
          // `role="treeitem"` requires a tree ancestor. Checked inside a role-correct container rather
          // than standalone, which reports a false `aria-required-parent` — and rather than inside a real
          // `<cs-tree>`, which would make this an integration test of the parent's semantics instead.
          const el = await fixture(html`<div role="tree"><cs-tree-item>Node 1</cs-tree-item></div>`);
          await expect(el).to.be.accessible();
        });
      });

      let leafItem: CsTreeItem;
      let parentItem: CsTreeItem;

      beforeEach(async () => {
        leafItem = await fixture(html` <cs-tree-item>Node 1</cs-tree-item> `);
        parentItem = await fixture(html`
          <cs-tree-item>
            Parent Node
            <cs-tree-item>Node 1</cs-tree-item>
            <cs-tree-item>Node 1</cs-tree-item>
          </cs-tree-item>
        `);
      });

      describe('accessibility', () => {
        it('should render with correct ARIA attributes', () => {
          expect(leafItem).to.exist;
          expect(parentItem).to.exist;

          expect(leafItem).to.have.attribute('role', 'treeitem');
          expect(leafItem).to.have.attribute('aria-selected', 'false');
          expect(leafItem).to.have.attribute('aria-disabled', 'false');
        });

        it('should set aria-expanded on parent items', () => {
          expect(parentItem).to.have.attribute('aria-expanded', 'false');
        });

        it('should not set aria-expanded on leaf items', () => {
          expect(leafItem).to.not.have.attribute('aria-expanded');
        });
      });

      describe('properties', () => {
        describe('expanded', () => {
          it('should default to false', () => {
            expect(parentItem.expanded).to.be.false;
          });

          it('should reflect when set', async () => {
            parentItem.expanded = true;
            await parentItem.updateComplete;
            expect(parentItem).to.have.attribute('expanded');
          });

          it('should update aria-expanded when expanded', async () => {
            parentItem.expanded = true;
            await parentItem.updateComplete;
            expect(parentItem).to.have.attribute('aria-expanded', 'true');
          });
        });

        describe('selected', () => {
          it('should default to false', () => {
            expect(leafItem.selected).to.be.false;
          });

          it('should update the aria-selected attribute', async () => {
            leafItem.selected = true;
            await leafItem.updateComplete;
            expect(leafItem).to.have.attribute('aria-selected', 'true');
          });
        });

        describe('disabled', () => {
          it('should default to false', () => {
            expect(leafItem.disabled).to.be.false;
          });

          it('should update the aria-disabled attribute', async () => {
            leafItem.disabled = true;
            await leafItem.updateComplete;
            expect(leafItem).to.have.attribute('aria-disabled', 'true');
          });
        });

        describe('lazy', () => {
          it('should default to false', () => {
            expect(parentItem.lazy).to.be.false;
          });
        });

        describe('isLeaf', () => {
          it('should be true for leaf items', () => {
            expect(leafItem.isLeaf).to.be.true;
          });

          it('should be false for items with children', () => {
            expect(parentItem.isLeaf).to.be.false;
          });
        });
      });

      describe('events', () => {
        it('should emit cs-expand and cs-after-expand when expanding', async () => {
          const expandSpy = sinon.spy();
          const afterExpandSpy = sinon.spy();

          parentItem.addEventListener('cs-expand', expandSpy);
          parentItem.addEventListener('cs-after-expand', afterExpandSpy);

          parentItem.expanded = true;
          await waitUntil(() => expandSpy.calledOnce);
          await waitUntil(() => afterExpandSpy.calledOnce);

          expect(expandSpy).to.have.been.calledOnce;
          expect(afterExpandSpy).to.have.been.calledOnce;
        });

        it('should emit cs-collapse and cs-after-collapse when collapsing', async () => {
          const collapseSpy = sinon.spy();
          const afterCollapseSpy = sinon.spy();

          parentItem.addEventListener('cs-collapse', collapseSpy);
          parentItem.addEventListener('cs-after-collapse', afterCollapseSpy);

          parentItem.expanded = true;
          await oneEvent(parentItem, 'cs-after-expand');

          parentItem.expanded = false;
          await waitUntil(() => collapseSpy.calledOnce);
          await waitUntil(() => afterCollapseSpy.calledOnce);

          expect(collapseSpy).to.have.been.calledOnce;
          expect(afterCollapseSpy).to.have.been.calledOnce;
        });

        it('should emit cs-lazy-change when the lazy attribute changes', async () => {
          const lazyChangeSpy = sinon.spy();

          parentItem.addEventListener('cs-lazy-change', lazyChangeSpy);
          parentItem.lazy = true;

          await waitUntil(() => lazyChangeSpy.calledOnce);
          parentItem.lazy = false;
          await waitUntil(() => lazyChangeSpy.calledOnce);

          expect(lazyChangeSpy).to.have.been.calledTwice;
        });

        it('should not expand when disabled and expand button is clicked', async () => {
          const expandButton: HTMLElement = parentItem.shadowRoot!.querySelector('.expand-button')!;
          parentItem.disabled = true;

          expandButton.click();
          await parentItem.updateComplete;

          expect(parentItem).not.to.have.attribute('expanded');
          expect(parentItem).to.have.attribute('aria-expanded', 'false');
        });
      });

      describe('slots', () => {
        it('should show the expand button for parent items', () => {
          const expandButton = parentItem.shadowRoot?.querySelector('.expand-button');
          expect(expandButton?.childElementCount).to.be.greaterThan(0);
        });
      });

      describe('CSS parts and states', () => {
        it('should set the selected custom state', async () => {
          leafItem.selected = true;
          await leafItem.updateComplete;
          expect(leafItem.customStates.has('selected')).to.be.true;
        });

        it('should set the expanded custom state', async () => {
          leafItem.expanded = true;
          await leafItem.updateComplete;
          expect(leafItem.customStates.has('expanded')).to.be.true;
        });

        it('should set the disabled custom state', async () => {
          leafItem.disabled = true;
          await leafItem.updateComplete;
          expect(leafItem.customStates.has('disabled')).to.be.true;
        });

        it('should set the indeterminate custom state', async () => {
          leafItem.indeterminate = true;
          await leafItem.updateComplete;
          expect(leafItem.customStates.has('indeterminate')).to.be.true;
        });
      });

      describe('animation interruption', () => {
        it('should keep children visible when collapse is interrupted by expand', async () => {
          parentItem.expanded = true;
          await oneEvent(parentItem, 'cs-after-expand');
          const childrenContainer = parentItem.shadowRoot!.querySelector<HTMLElement>('.children')!;

          parentItem.expanded = false;
          await new Promise((resolve) => setTimeout(resolve, 20));
          parentItem.expanded = true;

          await new Promise((resolve) => setTimeout(resolve, 300));

          expect(parentItem.expanded).to.be.true;
          expect(childrenContainer.hidden).to.be.false;
          expect(childrenContainer.style.height).to.equal('auto');
        });

        it('should keep children hidden when expand is interrupted by collapse', async () => {
          const childrenContainer = parentItem.shadowRoot!.querySelector<HTMLElement>('.children')!;

          parentItem.expanded = true;
          await new Promise((resolve) => setTimeout(resolve, 20));
          parentItem.expanded = false;

          await new Promise((resolve) => setTimeout(resolve, 300));

          expect(parentItem.expanded).to.be.false;
          expect(childrenContainer.hidden).to.be.true;
        });

        it('should only fire the final cs-after-expand event when collapse is interrupted by expand', async () => {
          parentItem.expanded = true;
          await oneEvent(parentItem, 'cs-after-expand');

          const afterExpandSpy = sinon.spy();
          const afterCollapseSpy = sinon.spy();
          parentItem.addEventListener('cs-after-expand', afterExpandSpy);
          parentItem.addEventListener('cs-after-collapse', afterCollapseSpy);

          parentItem.expanded = false;
          await new Promise((resolve) => setTimeout(resolve, 20));
          parentItem.expanded = true;

          await new Promise((resolve) => setTimeout(resolve, 300));

          expect(afterExpandSpy.callCount).to.equal(1);
          expect(afterCollapseSpy.callCount).to.equal(0);
        });
      });
    });
  }
});
