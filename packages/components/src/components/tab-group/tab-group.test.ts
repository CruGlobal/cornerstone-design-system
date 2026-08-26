import { aTimeout, expect, waitUntil } from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import { html } from 'lit';
import type { HTMLTemplateResult } from 'lit';
import sinon from 'sinon';
import { expectEvent } from '../../internal/test/expect-event.js';
import { clientFixture, fixtures } from '../../internal/test/fixture.js';
import { clickOnElement } from '../../internal/test/pointer-utilities.js';
import type CsTab from '../tab/tab.js';
import type CsTabPanel from '../tab-panel/tab-panel.js';
import type CsTabGroup from './tab-group.js';

const getActiveTab = (tabGroup: CsTabGroup): CsTab | undefined => {
  return Array.from(tabGroup.querySelectorAll('cs-tab')).find((tab) => tab.active);
};

const getActivePanel = (tabGroup: CsTabGroup): CsTabPanel | undefined => {
  return Array.from(tabGroup.querySelectorAll('cs-tab-panel')).find((panel) => panel.active);
};

const waitForScrollButtonsToBeRendered = async (tabGroup: CsTabGroup): Promise<void> => {
  await waitUntil(() => {
    const scrollButtons = tabGroup.shadowRoot?.querySelectorAll('cs-button');
    return scrollButtons?.length === 2;
  });
};

const generateTabs = (n: number): HTMLTemplateResult[] => {
  const result: HTMLTemplateResult[] = [];
  for (let i = 0; i < n; i++) {
    result.push(
      html`<cs-tab panel="tab-${i}">Tab ${i}</cs-tab> <cs-tab-panel name="tab-${i}">Content of tab ${i}</cs-tab-panel>`,
    );
  }
  return result;
};

describe('<cs-tab-group>', () => {
  for (const fixture of fixtures) {
    describe(`with "${fixture.type}" rendering`, () => {
      describe('accessibility', () => {
        it('should be accessible', async () => {
          const tabGroup = await fixture<CsTabGroup>(html`
            <cs-tab-group>
              <cs-tab panel="general">General</cs-tab>
              <cs-tab-panel name="general">This is the general tab panel.</cs-tab-panel>
            </cs-tab-group>
          `);
          await expect(tabGroup).to.be.accessible();
        });

        it('should have role="tablist" on the tabs container', async () => {
          const tabGroup = await fixture<CsTabGroup>(html`
            <cs-tab-group>
              <cs-tab panel="general">General</cs-tab>
              <cs-tab-panel name="general">This is the general tab panel.</cs-tab-panel>
            </cs-tab-group>
          `);
          const tablist = tabGroup.shadowRoot!.querySelector('[role="tablist"]');
          expect(tablist).to.exist;
        });

        it('should set aria-controls on tabs and aria-labelledby on panels', async () => {
          const tabGroup = await fixture<CsTabGroup>(html`
            <cs-tab-group>
              <cs-tab panel="general">General</cs-tab>
              <cs-tab panel="custom">Custom</cs-tab>
              <cs-tab-panel name="general">General content</cs-tab-panel>
              <cs-tab-panel name="custom">Custom content</cs-tab-panel>
            </cs-tab-group>
          `);

          const tabs = tabGroup.querySelectorAll('cs-tab');
          const panels = tabGroup.querySelectorAll('cs-tab-panel');

          // Wait for syncTabsAndPanels to assign ARIA attributes
          await waitUntil(() => tabs[0].getAttribute('aria-controls') !== null);

          // Each tab should have aria-controls pointing to its panel
          tabs.forEach((tab) => {
            expect(tab.getAttribute('aria-controls')).to.not.be.null;
          });

          // Each panel should have aria-labelledby pointing to its tab
          panels.forEach((panel) => {
            expect(panel.getAttribute('aria-labelledby')).to.not.be.null;
          });
        });
      });

      describe('properties', () => {
        it('should default placement to top', async () => {
          const tabGroup = await fixture<CsTabGroup>(html`
            <cs-tab-group>
              <cs-tab panel="general">General</cs-tab>
              <cs-tab-panel name="general">Content</cs-tab-panel>
            </cs-tab-group>
          `);
          expect(tabGroup.placement).to.equal('top');
        });

        it('should default activation to auto', async () => {
          const tabGroup = await fixture<CsTabGroup>(html`
            <cs-tab-group>
              <cs-tab panel="general">General</cs-tab>
              <cs-tab-panel name="general">Content</cs-tab-panel>
            </cs-tab-group>
          `);
          expect(tabGroup.activation).to.equal('auto');
        });

        it('should default withoutScrollControls to false', async () => {
          const tabGroup = await fixture<CsTabGroup>(html`
            <cs-tab-group>
              <cs-tab panel="general">General</cs-tab>
              <cs-tab-panel name="general">Content</cs-tab-panel>
            </cs-tab-group>
          `);
          expect(tabGroup.withoutScrollControls).to.be.false;
        });

        it('should reflect the active property', async () => {
          const tabGroup = await fixture<CsTabGroup>(html`
            <cs-tab-group>
              <cs-tab panel="general">General</cs-tab>
              <cs-tab panel="custom">Custom</cs-tab>
              <cs-tab-panel name="general">General content</cs-tab-panel>
              <cs-tab-panel name="custom">Custom content</cs-tab-panel>
            </cs-tab-group>
          `);

          await waitUntil(() => getActiveTab(tabGroup));
          tabGroup.active = 'custom';
          await tabGroup.updateComplete;
          expect(tabGroup.getAttribute('active')).to.equal('custom');
        });

        it('should show the first tab as active by default', async () => {
          const tabGroup = await fixture<CsTabGroup>(html`
            <cs-tab-group>
              <cs-tab panel="general">General</cs-tab>
              <cs-tab panel="custom">Custom</cs-tab>
              <cs-tab-panel name="general">General content</cs-tab-panel>
              <cs-tab-panel name="custom">Custom content</cs-tab-panel>
            </cs-tab-group>
          `);

          await waitUntil(() => getActiveTab(tabGroup));
          const activeTab = getActiveTab(tabGroup);
          expect(activeTab).to.exist;
          expect(activeTab!.panel).to.equal('general');
        });

        it('should show the specified tab when active is set initially', async () => {
          const tabGroup = await fixture<CsTabGroup>(html`
            <cs-tab-group active="custom">
              <cs-tab panel="general">General</cs-tab>
              <cs-tab panel="custom">Custom</cs-tab>
              <cs-tab-panel name="general">General content</cs-tab-panel>
              <cs-tab-panel name="custom">Custom content</cs-tab-panel>
            </cs-tab-group>
          `);

          await waitUntil(() => {
            const active = getActiveTab(tabGroup);
            return active?.panel === 'custom';
          });
          const activeTab = getActiveTab(tabGroup);
          expect(activeTab!.panel).to.equal('custom');
        });
      });

      describe('events', () => {
        it('should emit cs-tab-show and cs-tab-hide when clicking a tab', async () => {
          const tabGroup = await fixture<CsTabGroup>(html`
            <cs-tab-group>
              <cs-tab panel="general">General</cs-tab>
              <cs-tab panel="custom">Custom</cs-tab>
              <cs-tab-panel name="general">General content</cs-tab-panel>
              <cs-tab-panel name="custom">Custom content</cs-tab-panel>
            </cs-tab-group>
          `);

          await waitUntil(() => getActiveTab(tabGroup));
          const customTab = tabGroup.querySelectorAll('cs-tab')[1];

          const events = await expectEvent(tabGroup, ['cs-tab-hide', 'cs-tab-show'], () => clickOnElement(customTab));

          const hideEvent = events[0] as CustomEvent;
          const showEvent = events[1] as CustomEvent;
          expect(hideEvent.detail.name).to.equal('general');
          expect(showEvent.detail.name).to.equal('custom');
        });

        it('should emit cs-tab-show when setting active programmatically', async () => {
          const tabGroup = await fixture<CsTabGroup>(html`
            <cs-tab-group>
              <cs-tab panel="general">General</cs-tab>
              <cs-tab panel="custom">Custom</cs-tab>
              <cs-tab-panel name="general">General content</cs-tab-panel>
              <cs-tab-panel name="custom">Custom content</cs-tab-panel>
            </cs-tab-group>
          `);

          await waitUntil(() => getActiveTab(tabGroup));

          const events = await expectEvent(tabGroup, 'cs-tab-show', () => {
            tabGroup.active = 'custom';
          });
          const showEvent = events[0] as CustomEvent;
          expect(showEvent.detail.name).to.equal('custom');
        });

        it('should not emit events when clicking the already-active tab', async () => {
          const tabGroup = await fixture<CsTabGroup>(html`
            <cs-tab-group>
              <cs-tab panel="general">General</cs-tab>
              <cs-tab panel="custom">Custom</cs-tab>
              <cs-tab-panel name="general">General content</cs-tab-panel>
              <cs-tab-panel name="custom">Custom content</cs-tab-panel>
            </cs-tab-group>
          `);

          await waitUntil(() => getActiveTab(tabGroup));

          const showSpy = sinon.spy();
          const hideSpy = sinon.spy();
          tabGroup.addEventListener('cs-tab-show', showSpy);
          tabGroup.addEventListener('cs-tab-hide', hideSpy);

          const generalTab = tabGroup.querySelectorAll('cs-tab')[0];
          await clickOnElement(generalTab);
          await aTimeout(0);

          expect(showSpy).not.to.have.been.called;
          expect(hideSpy).not.to.have.been.called;
        });

        it('should not emit events when clicking a disabled tab', async () => {
          const tabGroup = await fixture<CsTabGroup>(html`
            <cs-tab-group>
              <cs-tab panel="general">General</cs-tab>
              <cs-tab panel="disabled" disabled>Disabled</cs-tab>
              <cs-tab-panel name="general">General content</cs-tab-panel>
              <cs-tab-panel name="disabled">Disabled content</cs-tab-panel>
            </cs-tab-group>
          `);

          await waitUntil(() => getActiveTab(tabGroup));

          const showSpy = sinon.spy();
          const hideSpy = sinon.spy();
          tabGroup.addEventListener('cs-tab-show', showSpy);
          tabGroup.addEventListener('cs-tab-hide', hideSpy);

          const disabledTab = tabGroup.querySelectorAll('cs-tab')[1];
          await clickOnElement(disabledTab);
          await aTimeout(0);

          expect(showSpy).not.to.have.been.called;
          expect(hideSpy).not.to.have.been.called;
        });

        it('should emit cs-tab-show via the active property on a tab', async () => {
          const tabGroup = await fixture<CsTabGroup>(html`
            <cs-tab-group>
              <cs-tab slot="nav" panel="general">General</cs-tab>
              <cs-tab slot="nav" panel="custom">Custom</cs-tab>
              <cs-tab-panel name="general">General content</cs-tab-panel>
              <cs-tab-panel name="custom">Custom content</cs-tab-panel>
            </cs-tab-group>
          `);

          await waitUntil(() => getActiveTab(tabGroup));

          const customTab = tabGroup.querySelectorAll('cs-tab')[1];

          const events = await expectEvent(tabGroup, 'cs-tab-show', () => {
            customTab.active = true;
          });
          const showEvent = events[0] as CustomEvent;
          expect(showEvent.detail.name).to.equal('custom');
        });
      });

      describe('slots', () => {
        it('should render tabs in the nav slot', async () => {
          const tabGroup = await fixture<CsTabGroup>(html`
            <cs-tab-group>
              <cs-tab panel="general">General</cs-tab>
              <cs-tab panel="custom">Custom</cs-tab>
              <cs-tab-panel name="general">General content</cs-tab-panel>
              <cs-tab-panel name="custom">Custom content</cs-tab-panel>
            </cs-tab-group>
          `);

          const tabs = tabGroup.querySelectorAll('cs-tab');
          expect(tabs).to.have.length(2);
          tabs.forEach((tab) => expect(tab).to.be.visible);
        });

        it('should render tab panels in the default slot', async () => {
          const tabGroup = await fixture<CsTabGroup>(html`
            <cs-tab-group>
              <cs-tab panel="general">General</cs-tab>
              <cs-tab-panel name="general">General content</cs-tab-panel>
            </cs-tab-group>
          `);

          const bodyPart = tabGroup.shadowRoot!.querySelector('[part="body"]');
          expect(bodyPart).to.exist;
          const defaultSlot = bodyPart?.querySelector('slot:not([name])');
          expect(defaultSlot).to.be.instanceOf(HTMLSlotElement);
        });
      });

      describe('keyboard navigation', () => {
        it('should select the next tab with ArrowRight', async () => {
          const tabGroup = await fixture<CsTabGroup>(html`
            <cs-tab-group>
              <cs-tab panel="general">General</cs-tab>
              <cs-tab panel="custom">Custom</cs-tab>
              <cs-tab-panel name="general">General content</cs-tab-panel>
              <cs-tab-panel name="custom">Custom content</cs-tab-panel>
            </cs-tab-group>
          `);

          await waitUntil(() => getActiveTab(tabGroup));
          const generalTab = tabGroup.querySelectorAll('cs-tab')[0];
          generalTab.focus();

          const events = await expectEvent(tabGroup, 'cs-tab-show', () => sendKeys({ press: 'ArrowRight' }));
          const showEvent = events[0] as CustomEvent;
          expect(showEvent.detail.name).to.equal('custom');
        });

        it('should select the previous tab with ArrowLeft', async () => {
          const tabGroup = await fixture<CsTabGroup>(html`
            <cs-tab-group>
              <cs-tab panel="general">General</cs-tab>
              <cs-tab panel="custom">Custom</cs-tab>
              <cs-tab-panel name="general">General content</cs-tab-panel>
              <cs-tab-panel name="custom">Custom content</cs-tab-panel>
            </cs-tab-group>
          `);

          await waitUntil(() => getActiveTab(tabGroup));

          // Activate custom tab first
          tabGroup.active = 'custom';
          await waitUntil(() => getActiveTab(tabGroup)?.panel === 'custom');
          const customTab = tabGroup.querySelectorAll('cs-tab')[1];
          customTab.focus();

          const events = await expectEvent(tabGroup, 'cs-tab-show', () => sendKeys({ press: 'ArrowLeft' }));
          const showEvent = events[0] as CustomEvent;
          expect(showEvent.detail.name).to.equal('general');
        });

        it('should wrap around when pressing ArrowRight on the last tab', async () => {
          const tabGroup = await fixture<CsTabGroup>(html`
            <cs-tab-group>
              <cs-tab panel="general">General</cs-tab>
              <cs-tab panel="custom">Custom</cs-tab>
              <cs-tab-panel name="general">General content</cs-tab-panel>
              <cs-tab-panel name="custom">Custom content</cs-tab-panel>
            </cs-tab-group>
          `);

          await waitUntil(() => getActiveTab(tabGroup));

          // Activate the last tab
          tabGroup.active = 'custom';
          await waitUntil(() => getActiveTab(tabGroup)?.panel === 'custom');
          const customTab = tabGroup.querySelectorAll('cs-tab')[1];
          customTab.focus();

          const events = await expectEvent(tabGroup, 'cs-tab-show', () => sendKeys({ press: 'ArrowRight' }));
          const showEvent = events[0] as CustomEvent;
          expect(showEvent.detail.name).to.equal('general');
        });

        it('should select the first tab with Home', async () => {
          const tabGroup = await fixture<CsTabGroup>(html`
            <cs-tab-group>
              <cs-tab panel="general">General</cs-tab>
              <cs-tab panel="custom">Custom</cs-tab>
              <cs-tab panel="advanced">Advanced</cs-tab>
              <cs-tab-panel name="general">General content</cs-tab-panel>
              <cs-tab-panel name="custom">Custom content</cs-tab-panel>
              <cs-tab-panel name="advanced">Advanced content</cs-tab-panel>
            </cs-tab-group>
          `);

          await waitUntil(() => getActiveTab(tabGroup));

          // Activate the last tab
          tabGroup.active = 'advanced';
          await waitUntil(() => getActiveTab(tabGroup)?.panel === 'advanced');
          const advancedTab = tabGroup.querySelectorAll('cs-tab')[2];
          advancedTab.focus();

          const events = await expectEvent(tabGroup, 'cs-tab-show', () => sendKeys({ press: 'Home' }));
          const showEvent = events[0] as CustomEvent;
          expect(showEvent.detail.name).to.equal('general');
        });

        it('should select the last tab with End', async () => {
          const tabGroup = await fixture<CsTabGroup>(html`
            <cs-tab-group>
              <cs-tab panel="general">General</cs-tab>
              <cs-tab panel="custom">Custom</cs-tab>
              <cs-tab panel="advanced">Advanced</cs-tab>
              <cs-tab-panel name="general">General content</cs-tab-panel>
              <cs-tab-panel name="custom">Custom content</cs-tab-panel>
              <cs-tab-panel name="advanced">Advanced content</cs-tab-panel>
            </cs-tab-group>
          `);

          await waitUntil(() => getActiveTab(tabGroup));
          const generalTab = tabGroup.querySelectorAll('cs-tab')[0];
          generalTab.focus();

          const events = await expectEvent(tabGroup, 'cs-tab-show', () => sendKeys({ press: 'End' }));
          const showEvent = events[0] as CustomEvent;
          expect(showEvent.detail.name).to.equal('advanced');
        });

        it('should skip disabled tabs with arrow keys', async () => {
          const tabGroup = await fixture<CsTabGroup>(html`
            <cs-tab-group>
              <cs-tab panel="general">General</cs-tab>
              <cs-tab panel="disabled" disabled>Disabled</cs-tab>
              <cs-tab panel="custom">Custom</cs-tab>
              <cs-tab-panel name="general">General content</cs-tab-panel>
              <cs-tab-panel name="disabled">Disabled content</cs-tab-panel>
              <cs-tab-panel name="custom">Custom content</cs-tab-panel>
            </cs-tab-group>
          `);

          await waitUntil(() => getActiveTab(tabGroup));
          const generalTab = tabGroup.querySelectorAll('cs-tab')[0];
          generalTab.focus();

          const events = await expectEvent(tabGroup, 'cs-tab-show', () => sendKeys({ press: 'ArrowRight' }));
          const showEvent = events[0] as CustomEvent;
          expect(showEvent.detail.name).to.equal('custom');
        });

        it('should only focus but not activate tabs with arrow keys in manual activation mode', async () => {
          const tabGroup = await fixture<CsTabGroup>(html`
            <cs-tab-group activation="manual">
              <cs-tab panel="general">General</cs-tab>
              <cs-tab panel="custom">Custom</cs-tab>
              <cs-tab-panel name="general">General content</cs-tab-panel>
              <cs-tab-panel name="custom">Custom content</cs-tab-panel>
            </cs-tab-group>
          `);

          await waitUntil(() => getActiveTab(tabGroup));
          const generalTab = tabGroup.querySelectorAll('cs-tab')[0];
          generalTab.focus();

          // Arrow should move focus but not activate
          const showSpy = sinon.spy();
          tabGroup.addEventListener('cs-tab-show', showSpy);
          await sendKeys({ press: 'ArrowRight' });
          await aTimeout(0);

          // The general tab should still be active
          expect(getActiveTab(tabGroup)!.panel).to.equal('general');
          expect(showSpy).not.to.have.been.called;

          // Now press Enter to activate the focused tab
          const events = await expectEvent(tabGroup, 'cs-tab-show', () => sendKeys({ press: 'Enter' }));
          const showEvent = events[0] as CustomEvent;
          expect(showEvent.detail.name).to.equal('custom');
        });

        it('should activate a tab with Space in manual mode', async () => {
          const tabGroup = await fixture<CsTabGroup>(html`
            <cs-tab-group activation="manual">
              <cs-tab panel="general">General</cs-tab>
              <cs-tab panel="custom">Custom</cs-tab>
              <cs-tab-panel name="general">General content</cs-tab-panel>
              <cs-tab-panel name="custom">Custom content</cs-tab-panel>
            </cs-tab-group>
          `);

          await waitUntil(() => getActiveTab(tabGroup));
          const generalTab = tabGroup.querySelectorAll('cs-tab')[0];
          generalTab.focus();

          // Move focus without activating
          await sendKeys({ press: 'ArrowRight' });
          await aTimeout(0);

          // Now activate with Space
          const events = await expectEvent(tabGroup, 'cs-tab-show', () => sendKeys({ press: ' ' }));
          const showEvent = events[0] as CustomEvent;
          expect(showEvent.detail.name).to.equal('custom');
        });

        it('should use ArrowUp/ArrowDown for start/end placement', async () => {
          const tabGroup = await fixture<CsTabGroup>(html`
            <cs-tab-group placement="start">
              <cs-tab panel="general">General</cs-tab>
              <cs-tab panel="custom">Custom</cs-tab>
              <cs-tab-panel name="general">General content</cs-tab-panel>
              <cs-tab-panel name="custom">Custom content</cs-tab-panel>
            </cs-tab-group>
          `);

          await waitUntil(() => getActiveTab(tabGroup));
          const generalTab = tabGroup.querySelectorAll('cs-tab')[0];
          generalTab.focus();

          const events = await expectEvent(tabGroup, 'cs-tab-show', () => sendKeys({ press: 'ArrowDown' }));
          const showEvent = events[0] as CustomEvent;
          expect(showEvent.detail.name).to.equal('custom');
        });
      });

      describe('tab selection', () => {
        it('should select a tab by clicking on it', async () => {
          const tabGroup = await fixture<CsTabGroup>(html`
            <cs-tab-group>
              <cs-tab panel="general">General</cs-tab>
              <cs-tab panel="custom">Custom</cs-tab>
              <cs-tab-panel name="general">General content</cs-tab-panel>
              <cs-tab-panel name="custom">Custom content</cs-tab-panel>
            </cs-tab-group>
          `);

          await waitUntil(() => getActiveTab(tabGroup));
          const customTab = tabGroup.querySelectorAll('cs-tab')[1];
          await clickOnElement(customTab);

          await waitUntil(() => getActiveTab(tabGroup)?.panel === 'custom');
          expect(getActiveTab(tabGroup)!.panel).to.equal('custom');
          expect(getActivePanel(tabGroup)!.name).to.equal('custom');
        });

        it('should select a tab by setting the active property', async () => {
          const tabGroup = await fixture<CsTabGroup>(html`
            <cs-tab-group>
              <cs-tab panel="general">General</cs-tab>
              <cs-tab panel="custom">Custom</cs-tab>
              <cs-tab-panel name="general">General content</cs-tab-panel>
              <cs-tab-panel name="custom">Custom content</cs-tab-panel>
            </cs-tab-group>
          `);

          await waitUntil(() => getActiveTab(tabGroup));

          tabGroup.active = 'custom';
          await waitUntil(() => getActiveTab(tabGroup)?.panel === 'custom');
          expect(getActiveTab(tabGroup)!.panel).to.equal('custom');
        });

        it('should not change if a disabled tab is clicked', async () => {
          const tabGroup = await fixture<CsTabGroup>(html`
            <cs-tab-group>
              <cs-tab panel="general">General</cs-tab>
              <cs-tab panel="disabled" disabled>Disabled</cs-tab>
              <cs-tab-panel name="general">General content</cs-tab-panel>
              <cs-tab-panel name="disabled">Disabled content</cs-tab-panel>
            </cs-tab-group>
          `);

          await waitUntil(() => getActiveTab(tabGroup));

          const disabledTab = tabGroup.querySelectorAll('cs-tab')[1];
          await clickOnElement(disabledTab);
          await aTimeout(0);

          expect(getActiveTab(tabGroup)!.panel).to.equal('general');
        });

        it('should only show one active panel at a time', async () => {
          const tabGroup = await fixture<CsTabGroup>(html`
            <cs-tab-group>
              <cs-tab panel="general">General</cs-tab>
              <cs-tab panel="custom">Custom</cs-tab>
              <cs-tab panel="advanced">Advanced</cs-tab>
              <cs-tab-panel name="general">General content</cs-tab-panel>
              <cs-tab-panel name="custom">Custom content</cs-tab-panel>
              <cs-tab-panel name="advanced">Advanced content</cs-tab-panel>
            </cs-tab-group>
          `);

          await waitUntil(() => getActiveTab(tabGroup));

          const activePanels = () => Array.from(tabGroup.querySelectorAll('cs-tab-panel')).filter((p) => p.active);

          expect(activePanels()).to.have.length(1);

          tabGroup.active = 'custom';
          await waitUntil(() => getActiveTab(tabGroup)?.panel === 'custom');
          expect(activePanels()).to.have.length(1);
          expect(activePanels()[0].name).to.equal('custom');
        });
      });

      describe('placement', () => {
        it('should show the nav above the body by default (top)', async () => {
          const tabGroup = await fixture<CsTabGroup>(html`
            <cs-tab-group>
              <cs-tab panel="general">General</cs-tab>
              <cs-tab-panel name="general">Content</cs-tab-panel>
            </cs-tab-group>
          `);

          await aTimeout(0);
          const nav = tabGroup.shadowRoot!.querySelector<HTMLElement>('[part=nav]')!;
          const body = tabGroup.shadowRoot!.querySelector<HTMLElement>('[part=body]')!;
          expect(body.getBoundingClientRect().top).to.be.greaterThanOrEqual(nav.getBoundingClientRect().bottom);
        });

        it('should show the nav below the body when placement is bottom', async () => {
          const tabGroup = await fixture<CsTabGroup>(html`
            <cs-tab-group placement="bottom">
              <cs-tab panel="general">General</cs-tab>
              <cs-tab-panel name="general">Content</cs-tab-panel>
            </cs-tab-group>
          `);

          await aTimeout(0);
          const nav = tabGroup.shadowRoot!.querySelector<HTMLElement>('[part=nav]')!;
          const body = tabGroup.shadowRoot!.querySelector<HTMLElement>('[part=body]')!;
          expect(body.getBoundingClientRect().bottom).to.be.lessThanOrEqual(nav.getBoundingClientRect().top);
        });

        it('should show the nav to the left of the body when placement is start', async () => {
          const tabGroup = await fixture<CsTabGroup>(html`
            <cs-tab-group placement="start">
              <cs-tab panel="general">General</cs-tab>
              <cs-tab-panel name="general">Content</cs-tab-panel>
            </cs-tab-group>
          `);

          await aTimeout(0);
          const nav = tabGroup.shadowRoot!.querySelector<HTMLElement>('[part=nav]')!;
          const body = tabGroup.shadowRoot!.querySelector<HTMLElement>('[part=body]')!;
          expect(body.getBoundingClientRect().left).to.be.greaterThanOrEqual(nav.getBoundingClientRect().right);
        });

        it('should show the nav to the right of the body when placement is end', async () => {
          const tabGroup = await fixture<CsTabGroup>(html`
            <cs-tab-group placement="end">
              <cs-tab panel="general">General</cs-tab>
              <cs-tab-panel name="general">Content</cs-tab-panel>
            </cs-tab-group>
          `);

          await aTimeout(0);
          const nav = tabGroup.shadowRoot!.querySelector<HTMLElement>('[part=nav]')!;
          const body = tabGroup.shadowRoot!.querySelector<HTMLElement>('[part=body]')!;
          expect(body.getBoundingClientRect().right).to.be.lessThanOrEqual(nav.getBoundingClientRect().left);
        });
      });

      describe('scrolling behavior', () => {
        before(() => {
          const errorHandler = window.onerror;
          window.onerror = (event: string | Event, source?: string, lineno?: number, colno?: number, error?: Error) => {
            if ((event as string).includes('ResizeObserver') || event === 'Script error.') {
              return true;
            } else if (errorHandler) {
              return errorHandler(event, source, lineno, colno, error);
            } else {
              return true;
            }
          };
        });

        it('should show scroll buttons when tabs overflow', async () => {
          const tabGroup = await clientFixture<CsTabGroup>(html`<cs-tab-group>${generateTabs(30)}</cs-tab-group>`);
          await waitForScrollButtonsToBeRendered(tabGroup);

          const scrollButtons = tabGroup.shadowRoot?.querySelectorAll('cs-button');
          expect(scrollButtons).to.have.length(2);
          tabGroup.disconnectedCallback();
        });

        it('should not show scroll buttons when withoutScrollControls is true', async () => {
          const tabGroup = await clientFixture<CsTabGroup>(html`<cs-tab-group>${generateTabs(30)}</cs-tab-group>`);
          tabGroup.withoutScrollControls = true;
          await aTimeout(0);

          const scrollButtons = tabGroup.shadowRoot?.querySelectorAll('cs-button');
          expect(scrollButtons).to.have.length(0);
        });

        it('should not show scroll buttons when all tabs fit', async () => {
          const tabGroup = await clientFixture<CsTabGroup>(html`<cs-tab-group>${generateTabs(2)}</cs-tab-group>`);
          await aTimeout(0);

          const scrollButtons = tabGroup.shadowRoot?.querySelectorAll('cs-button');
          expect(scrollButtons).to.have.length(0);
        });
      });

      describe('CSS parts and states', () => {
        it('should expose the base part', async () => {
          const tabGroup = await fixture<CsTabGroup>(html`
            <cs-tab-group>
              <cs-tab panel="general">General</cs-tab>
              <cs-tab-panel name="general">Content</cs-tab-panel>
            </cs-tab-group>
          `);
          expect(tabGroup.shadowRoot!.querySelector('[part~="tab-group"]')).to.exist;
        });

        it('should expose the nav part', async () => {
          const tabGroup = await fixture<CsTabGroup>(html`
            <cs-tab-group>
              <cs-tab panel="general">General</cs-tab>
              <cs-tab-panel name="general">Content</cs-tab-panel>
            </cs-tab-group>
          `);
          expect(tabGroup.shadowRoot!.querySelector('[part~="nav"]')).to.exist;
        });

        it('should expose the tabs part', async () => {
          const tabGroup = await fixture<CsTabGroup>(html`
            <cs-tab-group>
              <cs-tab panel="general">General</cs-tab>
              <cs-tab-panel name="general">Content</cs-tab-panel>
            </cs-tab-group>
          `);
          expect(tabGroup.shadowRoot!.querySelector('[part~="tabs"]')).to.exist;
        });

        it('should expose the body part', async () => {
          const tabGroup = await fixture<CsTabGroup>(html`
            <cs-tab-group>
              <cs-tab panel="general">General</cs-tab>
              <cs-tab-panel name="general">Content</cs-tab-panel>
            </cs-tab-group>
          `);
          expect(tabGroup.shadowRoot!.querySelector('[part~="body"]')).to.exist;
        });
      });

      it('should not throw error when unmounted too fast', async () => {
        const el = await fixture(html`<div></div>`);
        el.innerHTML = '<cs-tab-group></cs-tab-group>';
        el.innerHTML = '';
      });
    });
  }
});
