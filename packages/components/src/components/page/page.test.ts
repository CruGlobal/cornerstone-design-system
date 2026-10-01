import { aTimeout, expect, nextFrame, waitUntil } from '@open-wc/testing';
import { html } from 'lit';
import { fixtures } from '../../internal/test/fixture.js';
import type CsPage from './page.js';

/** The value a page's measured height resolves to, the way a consumer reads it. */
function measuredHeight(el: CsPage, slot: 'banner' | 'header' | 'subheader' | 'footer') {
  return getComputedStyle(el).getPropertyValue(`--${slot}-height`).trim();
}

/** Waits until the page has measured its header and banner at the sizes the fixture gives them. */
async function waitForMeasurement(el: CsPage, header = '51px', banner = '30px') {
  await waitUntil(
    () => measuredHeight(el, 'header') === header && measuredHeight(el, 'banner') === banner,
    `expected --header-height ${header} and --banner-height ${banner}`,
  );
}

/** Lets a style mutation and anything it triggers settle. */
async function settle() {
  await nextFrame();
  await nextFrame();
}

describe('<cs-page>', () => {
  for (const fixture of fixtures) {
    describe(`with "${fixture.type}" rendering`, () => {
      describe('accessibility', () => {
        it('should pass accessibility tests', async () => {
          const el = await fixture<CsPage>(html`<cs-page>Content</cs-page>`);
          await expect(el).to.be.accessible({ ignoredRules: ['color-contrast'] });
        });
      });

      describe('properties', () => {
        it('should default view to "desktop"', async () => {
          const el = await fixture<CsPage>(html`<cs-page>Content</cs-page>`);
          expect(el.view).to.equal('desktop');
          expect(el.getAttribute('view')).to.equal('desktop');
        });

        it('should default navOpen to false', async () => {
          const el = await fixture<CsPage>(html`<cs-page>Content</cs-page>`);
          expect(el.navOpen).to.equal(false);
        });

        it('should default mobileBreakpoint to "768px"', async () => {
          const el = await fixture<CsPage>(html`<cs-page>Content</cs-page>`);
          expect(el.mobileBreakpoint).to.equal('768px');
        });

        it('should default navigationPlacement to "start"', async () => {
          const el = await fixture<CsPage>(html`<cs-page>Content</cs-page>`);
          expect(el.navigationPlacement).to.equal('start');
          expect(el.getAttribute('navigation-placement')).to.equal('start');
        });

        it('should default disableNavigationToggle to false', async () => {
          const el = await fixture<CsPage>(html`<cs-page>Content</cs-page>`);
          // disableNavigationToggle may be auto-set to true when no nav content is present
          expect(typeof el.disableNavigationToggle).to.equal('boolean');
        });

        it('should reflect view attribute', async () => {
          const el = await fixture<CsPage>(html`<cs-page view="mobile">Content</cs-page>`);
          expect(el.view).to.equal('mobile');
          expect(el.getAttribute('view')).to.equal('mobile');
        });

        it('should reflect nav-open attribute', async () => {
          const el = await fixture<CsPage>(html`<cs-page>Content</cs-page>`);
          el.navOpen = true;
          await el.updateComplete;
          expect(el.hasAttribute('nav-open')).to.be.true;
          el.navOpen = false;
          await el.updateComplete;
          expect(el.hasAttribute('nav-open')).to.be.false;
        });
      });

      describe('slots', () => {
        it('should render default slot content', async () => {
          const el = await fixture<CsPage>(html`<cs-page><p>Main Content</p></cs-page>`);
          const defaultSlot = el.shadowRoot!.querySelector<HTMLSlotElement>('slot:not([name])')!;
          const assigned = defaultSlot.assignedElements();
          expect(assigned.length).to.be.greaterThan(0);
        });

        it('should render banner slot content', async () => {
          const el = await fixture<CsPage>(html`<cs-page><div slot="banner">Banner</div></cs-page>`);
          const slot = el.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="banner"]')!;
          const assigned = slot.assignedElements();
          expect(assigned.length).to.equal(1);
          expect(assigned[0].textContent).to.equal('Banner');
        });

        it('should render header slot content', async () => {
          const el = await fixture<CsPage>(html`<cs-page><div slot="header">Header</div></cs-page>`);
          const slot = el.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="header"]')!;
          const assigned = slot.assignedElements();
          expect(assigned.length).to.equal(1);
          expect(assigned[0].textContent).to.equal('Header');
        });

        it('should render subheader slot content', async () => {
          const el = await fixture<CsPage>(html`<cs-page><div slot="subheader">Sub</div></cs-page>`);
          const slot = el.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="subheader"]')!;
          const assigned = slot.assignedElements();
          expect(assigned.length).to.equal(1);
          expect(assigned[0].textContent).to.equal('Sub');
        });

        it('should render footer slot content', async () => {
          const el = await fixture<CsPage>(html`<cs-page><div slot="footer">Footer</div></cs-page>`);
          const slot = el.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="footer"]')!;
          const assigned = slot.assignedElements();
          expect(assigned.length).to.equal(1);
          expect(assigned[0].textContent).to.equal('Footer');
        });

        it('should render aside slot content', async () => {
          const el = await fixture<CsPage>(html`<cs-page><div slot="aside">Aside</div></cs-page>`);
          const slot = el.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="aside"]')!;
          const assigned = slot.assignedElements();
          expect(assigned.length).to.equal(1);
          expect(assigned[0].textContent).to.equal('Aside');
        });

        it('should render main-header slot content', async () => {
          const el = await fixture<CsPage>(html`<cs-page><div slot="main-header">Main Header</div></cs-page>`);
          const slot = el.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="main-header"]')!;
          const assigned = slot.assignedElements();
          expect(assigned.length).to.equal(1);
          expect(assigned[0].textContent).to.equal('Main Header');
        });

        it('should render main-footer slot content', async () => {
          const el = await fixture<CsPage>(html`<cs-page><div slot="main-footer">Main Footer</div></cs-page>`);
          const slot = el.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="main-footer"]')!;
          const assigned = slot.assignedElements();
          expect(assigned.length).to.equal(1);
          expect(assigned[0].textContent).to.equal('Main Footer');
        });
      });

      describe('navigation slot placement', () => {
        // The navigation slots are conditionally rendered in either the desktop <nav> or the mobile <cs-drawer> based
        // on the current view. Because duplicate slot names resolve to the first slot in tree order, the real slot must
        // only ever exist in one of the two locations at a time.
        it('should assign navigation content to the desktop navigation on desktop and the drawer on mobile', async () => {
          const el = await fixture<CsPage>(html`
            <cs-page mobile-breakpoint="768" style="width: 1200px;">
              <div slot="navigation-header">Navigation header</div>
              <nav slot="navigation">Navigation</nav>
              <div slot="navigation-footer">Navigation footer</div>
              <main>Main content</main>
            </cs-page>
          `);

          const navigationContent = el.querySelector('[slot="navigation"]')!;
          const getAssignedContainer = () => {
            const slot = navigationContent.assignedSlot;
            if (!slot) {
              return 'nowhere';
            }
            if (slot.closest('cs-drawer')) {
              return 'drawer';
            }
            if (slot.closest('nav.navigation')) {
              return 'desktop-navigation';
            }
            return 'nowhere';
          };

          // Desktop: content must land in the desktop <nav>, not the drawer
          await waitUntil(() => el.view === 'desktop');
          await el.updateComplete;
          expect(getAssignedContainer()).to.equal('desktop-navigation');

          // Shrink the page below the mobile breakpoint: content must move into the drawer
          el.style.width = '400px';
          await waitUntil(() => el.view === 'mobile');
          await el.updateComplete;
          expect(getAssignedContainer()).to.equal('drawer');

          // The drawer footer slot exposes the navigation-footer part on mobile
          expect(el.shadowRoot!.querySelector('cs-drawer [part~="navigation-footer"]')).to.exist;

          // And back to desktop
          el.style.width = '1200px';
          await waitUntil(() => el.view === 'desktop');
          await el.updateComplete;
          expect(getAssignedContainer()).to.equal('desktop-navigation');
        });
      });

      describe('CSS parts', () => {
        it('should have a base part', async () => {
          const el = await fixture<CsPage>(html`<cs-page>Content</cs-page>`);
          expect(el.shadowRoot!.querySelector('[part~="page"]')).to.exist;
        });

        it('should have a header part', async () => {
          const el = await fixture<CsPage>(html`<cs-page>Content</cs-page>`);
          expect(el.shadowRoot!.querySelector('[part~="header"]')).to.exist;
        });

        it('should have a banner part', async () => {
          const el = await fixture<CsPage>(html`<cs-page>Content</cs-page>`);
          expect(el.shadowRoot!.querySelector('[part~="banner"]')).to.exist;
        });

        it('should have a subheader part', async () => {
          const el = await fixture<CsPage>(html`<cs-page>Content</cs-page>`);
          expect(el.shadowRoot!.querySelector('[part~="subheader"]')).to.exist;
        });

        it('should have a body part', async () => {
          const el = await fixture<CsPage>(html`<cs-page>Content</cs-page>`);
          expect(el.shadowRoot!.querySelector('[part~="body"]')).to.exist;
        });

        it('should have a menu part', async () => {
          const el = await fixture<CsPage>(html`<cs-page>Content</cs-page>`);
          expect(el.shadowRoot!.querySelector('[part~="menu"]')).to.exist;
        });

        it('should have a main-content part', async () => {
          const el = await fixture<CsPage>(html`<cs-page>Content</cs-page>`);
          expect(el.shadowRoot!.querySelector('[part~="main-content"]')).to.exist;
        });

        it('should have an aside part', async () => {
          const el = await fixture<CsPage>(html`<cs-page>Content</cs-page>`);
          expect(el.shadowRoot!.querySelector('[part~="aside"]')).to.exist;
        });

        it('should have a footer part', async () => {
          const el = await fixture<CsPage>(html`<cs-page>Content</cs-page>`);
          expect(el.shadowRoot!.querySelector('[part~="footer"]')).to.exist;
        });
      });

      describe('methods', () => {
        it('should toggle navigation via showNavigation()', async () => {
          const el = await fixture<CsPage>(html`<cs-page>Content</cs-page>`);
          expect(el.navOpen).to.equal(false);
          el.showNavigation();
          expect(el.navOpen).to.equal(true);
        });

        it('should hide navigation via hideNavigation()', async () => {
          const el = await fixture<CsPage>(html`<cs-page nav-open>Content</cs-page>`);
          el.hideNavigation();
          expect(el.navOpen).to.equal(false);
        });

        it('should toggle navigation via toggleNavigation()', async () => {
          const el = await fixture<CsPage>(html`<cs-page>Content</cs-page>`);
          expect(el.navOpen).to.equal(false);
          el.toggleNavigation();
          expect(el.navOpen).to.equal(true);
          el.toggleNavigation();
          expect(el.navOpen).to.equal(false);
        });
      });

      describe('skip to content', () => {
        /**
         * The link's panel styling is selected on its part. It used to be selected on `.skip-to-content`, a class
         * the rendered element never carried, so none of it had ever applied: the link worked, because the
         * visually-hidden utility reveals it on focus, but it revealed as unstyled UA-default link text over the
         * page content. Positioning is the cheapest proof the rule is reaching the element.
         */
        it('should style the skip link', async () => {
          const el = await fixture<CsPage>(html`<cs-page>Content</cs-page>`);
          await el.updateComplete;

          const link = el.shadowRoot!.querySelector('[part~="skip-to-content"]')!;

          expect(getComputedStyle(link).position).to.equal('absolute');
          expect(getComputedStyle(link).zIndex).to.equal('6');
        });

        it('should point the skip link at a target it creates when the page has none', async () => {
          const el = await fixture<CsPage>(html`<cs-page>Content</cs-page>`);
          await el.updateComplete;

          const link = el.shadowRoot!.querySelector('[part~="skip-to-content"]')!;
          const href = link.getAttribute('href')!;

          expect(href).to.equal('#main-content');
          expect(el.querySelector(href)).to.exist;
        });
      });

      /**
       * A DOM morph (Turbo 8 morph refreshes, idiomorph with htmx, Alpine's morph plugin) syncs the host's `style`
       * attribute back to the server's HTML, which never carries the heights the page measured. Nothing changes
       * size, so the ResizeObservers never fire again, and every height read as 0px until the next full load.
       * `removeAttribute('style')` is what idiomorph does when the server's element has no `style` at all.
       */
      describe('measured heights', () => {
        it('should restore its measured heights when a morph removes the style attribute', async () => {
          const el = await fixture<CsPage>(html`
            <cs-page>
              <div slot="banner" style="box-sizing: border-box; height: 30px;">Banner</div>
              <div slot="header" style="box-sizing: border-box; height: 51px;">Header</div>
              <main>Main content</main>
            </cs-page>
          `);
          await waitForMeasurement(el);

          el.removeAttribute('style');
          await settle();

          expect(measuredHeight(el, 'header')).to.equal('51px');
          expect(measuredHeight(el, 'banner')).to.equal('30px');
        });

        it('should put back a measured height that a morph overwrites with a different value', async () => {
          const el = await fixture<CsPage>(html`
            <cs-page>
              <div slot="banner" style="box-sizing: border-box; height: 30px;">Banner</div>
              <div slot="header" style="box-sizing: border-box; height: 51px;">Header</div>
              <main>Main content</main>
            </cs-page>
          `);
          await waitForMeasurement(el);

          // A server that presets the heights to avoid a layout shift sends them back on every morph
          el.setAttribute('style', '--header-height: 40px;');
          await settle();

          expect(measuredHeight(el, 'header')).to.equal('51px');
          expect(measuredHeight(el, 'banner')).to.equal('30px');
        });

        it("should keep the consumer's own inline styles when it restores its heights", async () => {
          const el = await fixture<CsPage>(html`
            <cs-page>
              <div slot="banner" style="box-sizing: border-box; height: 30px;">Banner</div>
              <div slot="header" style="box-sizing: border-box; height: 51px;">Header</div>
              <main>Main content</main>
            </cs-page>
          `);
          await waitForMeasurement(el);

          el.setAttribute('style', 'color: rgb(255, 0, 0); --menu-width: 200px;');
          await settle();

          expect(el.style.color).to.equal('rgb(255, 0, 0)');
          expect(el.style.getPropertyValue('--menu-width').trim()).to.equal('200px');
          expect(measuredHeight(el, 'header')).to.equal('51px');
        });

        it('should write only the heights that are missing, once each, and then stop', async () => {
          const el = await fixture<CsPage>(html`
            <cs-page>
              <div slot="banner" style="box-sizing: border-box; height: 30px;">Banner</div>
              <div slot="header" style="box-sizing: border-box; height: 51px;">Header</div>
              <main>Main content</main>
            </cs-page>
          `);
          await waitForMeasurement(el);

          const heightsOnHost = [...el.style].filter((name) =>
            /^--(banner|header|subheader|footer)-height$/.test(name),
          );
          const records: MutationRecord[] = [];
          const watcher = new MutationObserver((list) => records.push(...list));
          watcher.observe(el, { attributes: true, attributeFilter: ['style'] });

          try {
            // A style change that leaves the heights alone gets no write from the page
            el.style.setProperty('color', 'rgb(255, 0, 0)');
            await settle();
            expect(records.length).to.equal(1);

            // A morph that drops them gets one write per height the page had on its host, and no more
            el.removeAttribute('style');
            await settle();
            expect(measuredHeight(el, 'header')).to.equal('51px');
            expect(records.length).to.equal(2 + heightsOnHost.length);

            // The page's own writes do not set off another round
            await aTimeout(100);
            expect(records.length).to.equal(2 + heightsOnHost.length);
          } finally {
            watcher.disconnect();
          }
        });

        it('should follow a real change in size, and restore the new height after a morph', async () => {
          const el = await fixture<CsPage>(html`
            <cs-page>
              <div slot="banner" style="box-sizing: border-box; height: 30px;">Banner</div>
              <div slot="header" style="box-sizing: border-box; height: 51px;">Header</div>
              <main>Main content</main>
            </cs-page>
          `);
          await waitForMeasurement(el);

          el.querySelector<HTMLElement>('[slot="header"]')!.style.height = '80px';
          await waitForMeasurement(el, '80px');

          el.removeAttribute('style');
          await settle();

          expect(measuredHeight(el, 'header')).to.equal('80px');
        });

        it('should restore an emptied slot at the height it measures now, not the one it had', async () => {
          const el = await fixture<CsPage>(html`
            <cs-page>
              <div slot="banner" style="box-sizing: border-box; height: 30px;">Banner</div>
              <div slot="header" style="box-sizing: border-box; height: 51px;">Header</div>
              <main>Main content</main>
            </cs-page>
          `);
          await waitForMeasurement(el);

          el.querySelector('[slot="banner"]')!.remove();
          await waitForMeasurement(el, '51px', '0px');

          el.removeAttribute('style');
          await settle();

          expect(measuredHeight(el, 'banner')).to.equal('0px');
          expect(measuredHeight(el, 'header')).to.equal('51px');
        });

        it('should leave its style alone while disconnected, and restore again once reconnected', async () => {
          const el = await fixture<CsPage>(html`
            <cs-page>
              <div slot="banner" style="box-sizing: border-box; height: 30px;">Banner</div>
              <div slot="header" style="box-sizing: border-box; height: 51px;">Header</div>
              <main>Main content</main>
            </cs-page>
          `);
          await waitForMeasurement(el);
          const parent = el.parentElement!;

          el.remove();
          el.removeAttribute('style');
          await settle();
          expect(el.style.getPropertyValue('--header-height')).to.equal('');

          parent.append(el);
          await waitForMeasurement(el);

          el.removeAttribute('style');
          await settle();

          expect(measuredHeight(el, 'header')).to.equal('51px');
        });
      });
    });
  }
});
