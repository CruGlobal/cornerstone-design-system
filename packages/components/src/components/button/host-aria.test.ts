// Throwaway research tests for issue #230 ("Decide how cs-* controls take ARIA set on the host").
// Lives only on the research/host-aria branch. Records how each engine exposes ARIA set on a cs-button host
// today, in both render modes. Run:
//   WTR_CONCURRENCY=1 npx web-test-runner --config web-test-runner.research.config.js --group host-aria
import { aTimeout, expect } from '@open-wc/testing';
import { executeServerCommand } from '@web/test-runner-commands';
import { ssrFixture } from '@lit-labs/testing/fixtures.js';
import { html } from 'lit';
import { unsafeStatic, html as staticHtml } from 'lit/static-html.js';
import { fixtures } from '../../internal/test/fixture.js';
import type CsButton from './button.js';

interface AxNode {
  role?: string;
  name?: string;
  description?: string;
  missing?: boolean;
  notInTree?: boolean;
  children?: AxNode[];
}

const engine = (() => {
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'firefox';
  if (ua.includes('Chrome')) return 'chromium';
  return 'webkit';
})();

async function ax(selector: string): Promise<AxNode> {
  await aTimeout(50); // let the engine's accessibility tree catch up with the DOM
  return (await executeServerCommand('ax-node', { selector })) as AxNode;
}

async function cdp(expression: string) {
  if (engine !== 'chromium') return undefined;
  await aTimeout(50);
  return executeServerCommand('cdp-ax', { expression });
}

function brief(node: AxNode | undefined) {
  if (!node) return node;
  const { role, name, description, missing, notInTree } = node;
  return { role, name, description, missing, notInTree, children: node.children?.map((c) => `${c.role}:${c.name}`) };
}

function record(mode: string, label: string, data: unknown) {
  console.log(`HOSTARIA ${JSON.stringify({ engine, mode, case: label, data })}`);
}

const inner = (el: Element) => el.shadowRoot!.querySelector<HTMLElement>('[part~="button"]')!;

describe('host ARIA research: today', () => {
  for (const fixture of fixtures) {
    const mode = fixture.type;

    describe(`with "${mode}" rendering`, () => {
      it('E1 aria-label on a cs-button host around a labelled icon', async () => {
        const el = await fixture<CsButton>(html`
          <cs-button id="e1" aria-label="Account menu">
            <cs-icon library="system" name="keyboard_arrow_down" label="Settings"></cs-icon>
          </cs-button>
        `);
        await el.updateComplete;
        const host = await ax('#e1');
        const button = await ax('#e1 [part~="button"]');
        record(mode, 'E1', {
          innerHasAriaLabel: inner(el).hasAttribute('aria-label'),
          host: brief(host),
          button: brief(button),
          cdpHost: await cdp(`document.getElementById('e1')`),
        });
        expect(inner(el).hasAttribute('aria-label')).to.be.false;
        expect(button.name).to.equal('Settings');
        expect(host.name).to.equal('Account menu'); // the generic wrapper takes the name, in every engine
      });

      it('E2 the same host with ElementInternals role none, then presentation', async () => {
        const el = await fixture<CsButton>(html`
          <cs-button id="e2" aria-label="Account menu">
            <cs-icon library="system" name="keyboard_arrow_down" label="Settings"></cs-icon>
          </cs-button>
        `);
        await el.updateComplete;
        el.internals.role = 'none';
        const none = await ax('#e2');
        el.internals.role = 'presentation';
        const presentation = await ax('#e2');
        el.internals.role = null;
        el.removeAttribute('aria-label');
        el.internals.role = 'none';
        const noneNoLabel = await ax('#e2');
        record(mode, 'E2', { none: brief(none), presentation: brief(presentation), noneNoLabel: brief(noneNoLabel) });
        expect(none.name).to.equal('Account menu');
        expect(presentation.name).to.equal('Account menu');
      });

      it('E3 cs-tooltip anchored to a cs-button, closed then open', async () => {
        const wrap = await fixture<HTMLDivElement>(html`
          <div>
            <cs-button id="e3">Save</cs-button>
            <cs-tooltip id="e3-tip" for="e3">Save your work</cs-tooltip>
          </div>
        `);
        const el = wrap.querySelector<CsButton>('#e3')!;
        const tip = wrap.querySelector<HTMLElement & { open: boolean; updateComplete: Promise<unknown> }>('#e3-tip')!;
        await el.updateComplete;
        await tip.updateComplete;
        const closed = await ax('#e3 [part~="button"]');
        tip.open = true;
        await tip.updateComplete;
        await aTimeout(200);
        const opened = await ax('#e3 [part~="button"]');
        record(mode, 'E3', {
          hostLabelledBy: el.getAttribute('aria-labelledby'),
          innerLabelledBy: inner(el).getAttribute('aria-labelledby'),
          closed: brief(closed),
          opened: brief(opened),
          cdpInner: await cdp(`document.getElementById('e3').shadowRoot.querySelector('[part~="button"]')`),
        });
        expect(el.getAttribute('aria-labelledby')).to.equal('e3-tip');
        expect(inner(el).hasAttribute('aria-labelledby')).to.be.false;
        expect(closed.name).to.equal('Save');
        expect(opened.name).to.equal('Save'); // tooltip text never reaches the cs-button
      });

      it('E4 control: cs-tooltip anchored to a native button, closed then open', async () => {
        const wrap = await fixture<HTMLDivElement>(html`
          <div>
            <button id="e4">Save</button>
            <cs-tooltip id="e4-tip" for="e4">Save your work</cs-tooltip>
          </div>
        `);
        const tip = wrap.querySelector<HTMLElement & { open: boolean; updateComplete: Promise<unknown> }>('#e4-tip')!;
        await tip.updateComplete;
        const closed = await ax('#e4');
        tip.open = true;
        await tip.updateComplete;
        await aTimeout(200);
        const opened = await ax('#e4');
        record(mode, 'E4', {
          labelledBy: wrap.querySelector('#e4')!.getAttribute('aria-labelledby'),
          closed: brief(closed),
          opened: brief(opened),
        });
        expect(closed.name).to.equal('Save'); // tooltip body is hidden while closed
        expect(opened.name).to.equal('Save your work');
      });

      it('E5 aria-current on a cs-button href host', async () => {
        const el = await fixture<CsButton>(html`
          <cs-button id="e5" href="/home" aria-current="page">Home</cs-button>
        `);
        await el.updateComplete;
        const link = inner(el);
        record(mode, 'E5', {
          innerTag: link.localName,
          innerAriaCurrent: link.getAttribute('aria-current'),
          hostAriaCurrent: el.getAttribute('aria-current'),
          hostAx: brief(await ax('#e5')),
          linkAx: brief(await ax('#e5 [part~="button"]')),
          cdpHost: await cdp(`document.getElementById('e5')`),
          cdpLink: await cdp(`document.getElementById('e5').shadowRoot.querySelector('a')`),
          cdpNativeCurrent: await cdp(
            `(() => { const a = document.createElement('a'); a.href = '/x'; a.textContent = 'x'; a.setAttribute('aria-current', 'page'); document.body.append(a); return a; })()`,
          ),
        });
        expect(link.localName).to.equal('a');
        expect(link.hasAttribute('aria-current')).to.be.false;
      });

      it('E6 aria-describedby on a cs-button host', async () => {
        const wrap = await fixture<HTMLDivElement>(html`
          <div>
            <cs-button id="e6" aria-describedby="e6-desc">Delete</cs-button>
            <p id="e6-desc">This cannot be undone.</p>
          </div>
        `);
        const el = wrap.querySelector<CsButton>('#e6')!;
        await el.updateComplete;
        record(mode, 'E6', { host: brief(await ax('#e6')), button: brief(await ax('#e6 [part~="button"]')) });
      });

      it('E7 ElementInternals ariaLabel on the host does not reach the inner button', async () => {
        const el = await fixture<CsButton>(html` <cs-button id="e7">Save</cs-button> `);
        await el.updateComplete;
        el.internals.ariaLabel = 'Via internals';
        record(mode, 'E7', { host: brief(await ax('#e7')), button: brief(await ax('#e7 [part~="button"]')) });
        expect((await ax('#e7 [part~="button"]')).name).to.equal('Save');
        expect((await ax('#e7')).name).to.equal('Via internals');
      });

      it('E8 element reflection from the inner button outward to light DOM', async () => {
        const wrap = await fixture<HTMLDivElement>(html`
          <div>
            <cs-button id="e8"
              ><cs-icon library="system" name="keyboard_arrow_down" label="Settings"></cs-icon
            ></cs-button>
            <span id="e8-name">Account menu</span>
            <p id="e8-desc">Opens your account settings.</p>
            <cs-tooltip id="e8-tip" for="e8-other">Tooltip text</cs-tooltip>
            <span id="e8-other"></span>
          </div>
        `);
        const el = wrap.querySelector<CsButton>('#e8')!;
        await el.updateComplete;
        const button = inner(el) as HTMLElement & {
          ariaLabelledByElements: Element[] | null;
          ariaDescribedByElements: Element[] | null;
        };
        const supported = 'ariaLabelledByElements' in Element.prototype;
        let afterSpan: AxNode | undefined;
        let afterTooltip: AxNode | undefined;
        let getterRoundTrip: number | undefined;
        if (supported) {
          button.ariaLabelledByElements = [wrap.querySelector('#e8-name')!];
          button.ariaDescribedByElements = [wrap.querySelector('#e8-desc')!];
          getterRoundTrip = button.ariaLabelledByElements?.length;
          afterSpan = await ax('#e8 [part~="button"]');
          button.ariaLabelledByElements = [wrap.querySelector('#e8-tip')!];
          afterTooltip = await ax('#e8 [part~="button"]');
        }
        record(mode, 'E8', {
          supported,
          attrAfterSet: button.getAttribute('aria-labelledby'),
          getterRoundTrip,
          afterSpan: brief(afterSpan),
          afterTooltipClosed: brief(afterTooltip),
        });
        expect(supported).to.be.true;
        expect(afterSpan!.name).to.equal('Account menu');
        if (engine !== 'webkit') expect(afterSpan!.description).to.equal('Opens your account settings.');
        expect(afterTooltip!.name).to.equal('Settings');
      });

      it('E9 aria-current set by cs-breadcrumb on its last item', async () => {
        const el = await fixture<HTMLElement>(html`
          <cs-breadcrumb id="e9">
            <cs-breadcrumb-item href="/">Home</cs-breadcrumb-item>
            <cs-breadcrumb-item id="e9-last" href="/docs">Docs</cs-breadcrumb-item>
          </cs-breadcrumb>
        `);
        await (el as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete;
        await aTimeout(50);
        const last = el.querySelector('#e9-last')!;
        const link = last.shadowRoot!.querySelector('a');
        record(mode, 'E9', {
          hostAriaCurrent: last.getAttribute('aria-current'),
          innerTag: link?.localName,
          innerAriaCurrent: link?.getAttribute('aria-current'),
        });
        expect(last.getAttribute('aria-current')).to.equal('page');
        expect(link?.getAttribute('aria-current')).to.be.null;
      });
    });
  }
});

describe('host ARIA research: baseline additions', () => {
  for (const fixture of fixtures) {
    const mode = fixture.type;

    describe(`with "${mode}" rendering`, () => {
      it('E10 a plain cs-button host with no ARIA', async () => {
        const el = await fixture<CsButton>(html` <cs-button id="e10">Save</cs-button> `);
        await el.updateComplete;
        record(mode, 'E10', { host: brief(await ax('#e10')) });
      });

      it('E13 author role="presentation" attribute on a cs-button host with aria-label', async () => {
        const el = await fixture<CsButton>(html`
          <cs-button id="e13" role="presentation" aria-label="Account menu">
            <cs-icon library="system" name="keyboard_arrow_down" label="Settings"></cs-icon>
          </cs-button>
        `);
        await el.updateComplete;
        record(mode, 'E13', { host: brief(await ax('#e13')) });
        expect((await ax('#e13')).name).to.equal('Account menu');
      });

      it('E14 control: a native button labelled by an element that is itself hidden', async () => {
        await fixture<HTMLDivElement>(html`
          <div>
            <button id="e14">Save</button>
            <span id="e14-tip" hidden>Save your work</span>
            <button id="e14b">Save</button>
            <span id="e14b-tip"><span hidden>Save your work</span></span>
          </div>
        `);
        document.getElementById('e14')!.setAttribute('aria-labelledby', 'e14-tip');
        document.getElementById('e14b')!.setAttribute('aria-labelledby', 'e14b-tip');
        record(mode, 'E14', {
          referencedNodeHidden: brief(await ax('#e14')),
          referencedNodeVisibleChildHidden: brief(await ax('#e14b')),
        });
        expect((await ax('#e14')).name).to.equal('Save your work');
        expect((await ax('#e14b')).name).to.equal('Save');
      });

      it('E15 cs-tooltip wired straight onto the role element, never the host', async () => {
        const wrap = await fixture<HTMLDivElement>(html`
          <div>
            <cs-button id="e15"
              ><cs-icon library="system" name="keyboard_arrow_down" label="Settings"></cs-icon
            ></cs-button>
            <cs-button id="e15d">Delete</cs-button>
            <span id="e15-anchor">a</span>
            <cs-tooltip id="e15-tip" for="e15-anchor">Account menu</cs-tooltip>
            <span id="e15d-anchor">b</span>
            <cs-tooltip id="e15d-tip" for="e15d-anchor">This cannot be undone</cs-tooltip>
          </div>
        `);
        const name = wrap.querySelector<CsButton>('#e15')!;
        const desc = wrap.querySelector<CsButton>('#e15d')!;
        const tip = wrap.querySelector<HTMLElement & { open: boolean; updateComplete: Promise<unknown> }>('#e15-tip')!;
        const dtip = wrap.querySelector<HTMLElement & { open: boolean; updateComplete: Promise<unknown> }>(
          '#e15d-tip',
        )!;
        await name.updateComplete;
        await desc.updateComplete;
        (inner(name) as HTMLElement & { ariaLabelledByElements: Element[] }).ariaLabelledByElements = [tip];
        (inner(desc) as HTMLElement & { ariaDescribedByElements: Element[] }).ariaDescribedByElements = [dtip];
        const closedName = await ax('#e15 [part~="button"]');
        const closedDesc = await ax('#e15d [part~="button"]');
        tip.open = true;
        dtip.open = true;
        await tip.updateComplete;
        await dtip.updateComplete;
        await aTimeout(200);
        const openName = await ax('#e15 [part~="button"]');
        const openDesc = await ax('#e15d [part~="button"]');
        tip.open = false;
        dtip.open = false;
        await aTimeout(200);
        tip.style.display = 'none';
        dtip.style.display = 'none';
        const hiddenHostName = await ax('#e15 [part~="button"]');
        const hiddenHostDesc = await ax('#e15d [part~="button"]');
        record(mode, 'E15', {
          hostAttrs: [...name.attributes].map((a) => a.name).filter((n) => n.startsWith('aria')),
          wrapper: brief(await ax('#e15')),
          closedName: brief(closedName),
          openName: brief(openName),
          hiddenHostName: brief(hiddenHostName),
          closedDesc: brief(closedDesc),
          openDesc: brief(openDesc),
          hiddenHostDesc: brief(hiddenHostDesc),
        });
        expect(closedName.name).to.equal('Settings'); // closed tooltip body is hidden, so it lends nothing
        expect(openName.name).to.equal('Account menu');
        expect(hiddenHostName.name).to.equal('Account menu'); // a hidden host is used when referenced directly
        expect((await ax('#e15')).name).to.equal(''); // nothing ARIA on the wrapper
        if (engine !== 'webkit') {
          expect(Boolean(closedDesc.description)).to.be.false;
          expect(openDesc.description).to.equal('This cannot be undone');
          expect(hiddenHostDesc.description).to.equal('This cannot be undone');
        }
      });

      it('E11 control: aria-describedby on a native button', async () => {
        await fixture<HTMLDivElement>(html`
          <div>
            <button id="e11" aria-describedby="e11-desc">Delete</button>
            <p id="e11-desc">This cannot be undone.</p>
          </div>
        `);
        record(mode, 'E11', { button: brief(await ax('#e11')) });
        // WebKit's snapshot never reports a description, even for a native button: an instrument limit.
        expect(Boolean((await ax('#e11')).description)).to.equal(engine !== 'webkit');
      });

      it('E12 axe on a cs-button with aria-label on the host', async () => {
        const el = await fixture<CsButton>(html`
          <cs-button id="e12" aria-label="Account menu">
            <cs-icon library="system" name="keyboard_arrow_down" label="Settings"></cs-icon>
          </cs-button>
        `);
        await el.updateComplete;
        let axe = 'pass';
        try {
          await expect(el).to.be.accessible();
        } catch (error) {
          axe = String((error as Error).message).slice(0, 400);
        }
        record(mode, 'E12', { axe });
        expect(axe).to.equal('pass'); // axe does not flag ARIA on a custom-element host
      });
    });
  }
});

type Proto = CsButton & { label?: string; current?: string };

for (const tag of ['cs-proto-keep-button', 'cs-proto-strip-button']) {
  const short = tag === 'cs-proto-keep-button' ? 'keep' : 'strip';
  const t = unsafeStatic(tag);

  describe(`host ARIA research: prototype ${tag}`, () => {
    for (const fixture of fixtures) {
      const mode = fixture.type;

      describe(`with "${mode}" rendering`, () => {
        it(`P1-${short} aria-label on the host around a labelled icon`, async () => {
          const wrap = await fixture<HTMLDivElement>(
            staticHtml`<div><${t} id="p1" aria-label="Account menu"><cs-icon library="system" name="keyboard_arrow_down" label="Settings"></cs-icon></${t}></div>`,
          );
          // Attribute set in markup, so the server sees it too.
          const el = wrap.querySelector<Proto>('#p1')!;
          await el.updateComplete;
          const before = await ax('#p1 [part~="button"]');
          const hostBefore = await ax('#p1');
          const hostHasAttr = el.hasAttribute('aria-label');
          let axe = 'pass';
          try {
            await expect(el).to.be.accessible();
          } catch (error) {
            axe = String((error as Error).message).slice(0, 300);
          }
          // An app clearing the label, as a framework does when the bound value becomes undefined.
          el.removeAttribute('aria-label');
          await el.updateComplete;
          const afterRemove = await ax('#p1 [part~="button"]');
          record(mode, `P1-${short}`, {
            hostHasAttr,
            host: brief(hostBefore),
            button: brief(before),
            axe,
            afterRemove: brief(afterRemove),
          });
          expect(before.name).to.equal('Account menu');
          expect(axe).to.equal('pass');
          if (short === 'keep') {
            expect(hostHasAttr).to.be.true;
            expect(hostBefore.name).to.equal('Account menu'); // the wrapper is named too
            expect(afterRemove.name).to.equal('Settings'); // removal round-trips
          } else {
            expect(hostHasAttr).to.be.false;
            expect(hostBefore.name).to.equal('');
            expect(afterRemove.name).to.equal('Account menu'); // stale: removal of a stripped attribute is invisible
          }
        });

        it(`P2-${short} cs-tooltip on the prototype, closed, open, then removed`, async () => {
          const wrap = await fixture<HTMLDivElement>(
            staticHtml`<div><${t} id="p2">Save</${t}><cs-tooltip id="p2-tip" for="p2">Save your work</cs-tooltip></div>`,
          );
          const el = wrap.querySelector<Proto>('#p2')!;
          const tip = wrap.querySelector<HTMLElement & { open: boolean; updateComplete: Promise<unknown> }>('#p2-tip')!;
          await el.updateComplete;
          await tip.updateComplete;
          await el.updateComplete;
          const closed = await ax('#p2 [part~="button"]');
          tip.open = true;
          await tip.updateComplete;
          await aTimeout(200);
          const opened = await ax('#p2 [part~="button"]');
          const hostLabelledByAfterAttach = el.getAttribute('aria-labelledby');
          tip.remove();
          await el.updateComplete;
          await aTimeout(50);
          const removed = await ax('#p2 [part~="button"]');
          record(mode, `P2-${short}`, {
            hostLabelledByAfterAttach,
            closed: brief(closed),
            opened: brief(opened),
            afterTooltipRemoved: brief(removed),
            innerRefsAfterRemove:
              (
                el.shadowRoot!.querySelector('[part~="button"]') as HTMLElement & {
                  ariaLabelledByElements: Element[] | null;
                }
              ).ariaLabelledByElements?.length ?? 0,
          });
          expect(closed.name).to.equal('Save');
          expect(opened.name).to.equal('Save your work');
          expect(removed.name).to.equal('Save');
        });

        it(`P7-${short} cs-tooltip retargeted to another element while it stays connected`, async () => {
          const wrap = await fixture<HTMLDivElement>(
            staticHtml`<div><${t} id="p7">Save</${t}><button id="p7-other">Other</button><cs-tooltip id="p7-tip" for="p7" open>Save your work</cs-tooltip></div>`,
          );
          const el = wrap.querySelector<Proto>('#p7')!;
          const tip = wrap.querySelector<HTMLElement & { for: string; updateComplete: Promise<unknown> }>('#p7-tip')!;
          await el.updateComplete;
          await tip.updateComplete;
          await aTimeout(200);
          await el.updateComplete;
          const before = await ax('#p7 [part~="button"]');
          tip.for = 'p7-other';
          await tip.updateComplete;
          await el.updateComplete;
          await aTimeout(200);
          record(mode, `P7-${short}`, {
            before: brief(before),
            afterRetarget: brief(await ax('#p7 [part~="button"]')),
            otherAfterRetarget: brief(await ax('#p7-other')),
          });
          expect(before.name).to.equal('Save your work');
          expect((await ax('#p7 [part~="button"]')).name).to.equal(short === 'keep' ? 'Save' : 'Save your work');
        });

        it(`P3-${short} aria-current on an href host, then cleared`, async () => {
          const el = await fixture<Proto>(staticHtml`<${t} id="p3" href="/home" aria-current="page">Home</${t}>`);
          await el.updateComplete;
          const link = el.shadowRoot!.querySelector('[part~="button"]')!;
          const set = link.getAttribute('aria-current');
          el.removeAttribute('aria-current');
          await el.updateComplete;
          record(mode, `P3-${short}`, {
            innerTag: link.localName,
            innerCurrent: set,
            hostCurrentAfterUpdate: el.hasAttribute('aria-current'),
            innerCurrentAfterHostRemove: el.shadowRoot!.querySelector('[part~="button"]')!.getAttribute('aria-current'),
          });
          expect(set).to.equal('page');
          expect(el.shadowRoot!.querySelector('[part~="button"]')!.getAttribute('aria-current')).to.equal(
            short === 'keep' ? null : 'page',
          );
        });

        it(`P4-${short} aria-describedby on the host`, async () => {
          const wrap = await fixture<HTMLDivElement>(
            staticHtml`<div><${t} id="p4" aria-describedby="p4-desc">Delete</${t}><p id="p4-desc">This cannot be undone.</p></div>`,
          );
          const el = wrap.querySelector<Proto>('#p4')!;
          await el.updateComplete;
          record(mode, `P4-${short}`, {
            host: brief(await ax('#p4')),
            button: brief(await ax('#p4 [part~="button"]')),
          });
          if (engine !== 'webkit') {
            expect((await ax('#p4 [part~="button"]')).description).to.equal('This cannot be undone.');
            expect(Boolean((await ax('#p4')).description)).to.equal(short === 'keep'); // wrapper described too
          }
        });

        it(`P5-${short} properties: label and current`, async () => {
          const el = await fixture<Proto>(
            staticHtml`<${t} id="p5" href="/home" label="Home page" current="page">Home</${t}>`,
          );
          await el.updateComplete;
          const link = el.shadowRoot!.querySelector('[part~="button"]')!;
          record(mode, `P5-${short}`, {
            innerLabel: link.getAttribute('aria-label'),
            innerCurrent: link.getAttribute('aria-current'),
            host: brief(await ax('#p5')),
            link: brief(await ax('#p5 [part~="button"]')),
          });
          expect(link.getAttribute('aria-label')).to.equal('Home page');
          expect(link.getAttribute('aria-current')).to.equal('page');
        });
      });
    }

    it(`P6-${short} server output before hydration`, async () => {
      const el = await ssrFixture<Proto>(
        staticHtml`<${t} id="p6" href="/home" aria-label="Home page" aria-current="page" aria-describedby="x">Home</${t}>`,
        { modules: window.serverComponents, base: import.meta.url, hydrate: false },
      );
      const link = el.shadowRoot?.querySelector('[part~="button"]');
      const propsEl = await ssrFixture<Proto>(
        staticHtml`<${t} id="p6b" href="/home" label="Home page" current="page">Home</${t}>`,
        { modules: window.serverComponents, base: import.meta.url, hydrate: false },
      );
      const propsLink = propsEl.shadowRoot?.querySelector('[part~="button"]');
      record('ssr-no-hydration', `P6-${short}`, {
        hasShadow: Boolean(el.shadowRoot),
        hostAttrs: [...el.attributes].map((a) => a.name).filter((n) => n.startsWith('aria')),
        innerAriaLabel: link?.getAttribute('aria-label'),
        innerAriaCurrent: link?.getAttribute('aria-current'),
        innerAriaDescribedBy: link?.getAttribute('aria-describedby'),
        propsInnerAriaLabel: propsLink?.getAttribute('aria-label'),
        propsInnerAriaCurrent: propsLink?.getAttribute('aria-current'),
        linkAx: brief(await ax('#p6 [part~="button"]')),
      });
      expect(link?.getAttribute('aria-label')).to.equal('Home page');
      expect(link?.getAttribute('aria-current')).to.equal('page');
      expect(link?.getAttribute('aria-describedby')).to.be.null; // IDREFs cannot be forwarded by the server
      expect(propsLink?.getAttribute('aria-label')).to.equal('Home page');
      expect(propsLink?.getAttribute('aria-current')).to.equal('page');
    });
  });
}
