// Throwaway probe for the accessibility ruling on the host-ARIA research. Lives only on research/host-aria.
// Measures three things the research did not: what makes WebKit expose a wrapper host as a group (Q8),
// whether visually hidden text in the default slot names a cs-button (Q2), and how each way of hiding a
// cs-input label names the field, before and after hydration (Q7). Run:
//   WTR_CONCURRENCY=1 npx web-test-runner --config web-test-runner.research.config.js --group host-aria-ruling
import { aTimeout, expect } from '@open-wc/testing';
import { executeServerCommand } from '@web/test-runner-commands';
import { ssrFixture } from '@lit-labs/testing/fixtures.js';
import { html } from 'lit';
import { fixtures } from '../../internal/test/fixture.js';

interface AxNode {
  role?: string;
  name?: string;
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
  await aTimeout(50);
  return (await executeServerCommand('ax-node', { selector })) as AxNode;
}

function brief(node: AxNode | undefined) {
  if (!node) return node;
  const { role, name, missing, notInTree } = node;
  return { role, name, missing, notInTree };
}

function record(mode: string, label: string, data: unknown) {
  console.log(`HOSTARIA ${JSON.stringify({ engine, mode, case: label, data })}`);
}

// The runner page loads the default theme only, not the utility classes, so load the one under test.
before(async () => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/dist/bundled/styles/utilities/visually-hidden.css';
  const loaded = new Promise((resolve) => link.addEventListener('load', resolve));
  document.head.append(link);
  await loaded;
});

// Bare custom elements, each adding one property cs-button's host has. Not Lit elements, so they have no
// server render: this block is client-only by design, and the cs-button rows of E10 cover both modes.
class ProbePlain extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).innerHTML = '<button><slot></slot></button>';
  }
}
class ProbeDelegates extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open', delegatesFocus: true }).innerHTML = '<button><slot></slot></button>';
  }
}
class ProbeFormAssociated extends HTMLElement {
  static formAssociated = true;
  internals = this.attachInternals();
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).innerHTML = '<button><slot></slot></button>';
  }
}
class ProbeClick extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).innerHTML = '<button><slot></slot></button>';
    this.addEventListener('click', () => {});
  }
}
class ProbeAll extends HTMLElement {
  static formAssociated = true;
  internals = this.attachInternals();
  constructor() {
    super();
    this.attachShadow({ mode: 'open', delegatesFocus: true }).innerHTML = '<button><slot></slot></button>';
    this.addEventListener('click', () => {});
  }
}
class ProbeState extends HTMLElement {
  internals = this.attachInternals();
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).innerHTML = '<button><slot></slot></button>';
    this.internals.states.add('cs-defined');
  }
}
function pairProbe(delegatesFocus: boolean, formAssociated: boolean, click: boolean) {
  return class extends HTMLElement {
    static formAssociated = formAssociated;
    internals = formAssociated ? this.attachInternals() : undefined;
    constructor() {
      super();
      this.attachShadow({ mode: 'open', delegatesFocus }).innerHTML = '<button><slot></slot></button>';
      if (click) this.addEventListener('click', () => {});
    }
  };
}
customElements.define('probe-df-fa', pairProbe(true, true, false));
customElements.define('probe-df-click', pairProbe(true, false, true));
customElements.define('probe-fa-click', pairProbe(false, true, true));
customElements.define('probe-plain', ProbePlain);
customElements.define('probe-delegates', ProbeDelegates);
customElements.define('probe-form-associated', ProbeFormAssociated);
customElements.define('probe-click', ProbeClick);
customElements.define('probe-all', ProbeAll);
customElements.define('probe-state', ProbeState);

describe('host ARIA ruling: what WebKit exposes as a group (client-only, see above)', () => {
  it('W1-W6 one host property at a time', async () => {
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div id="w1"><button>Save</button></div>
      <div id="w2"><button>Save</button></div>
      <probe-plain id="w3">Save</probe-plain>
      <probe-delegates id="w4">Save</probe-delegates>
      <probe-form-associated id="w5">Save</probe-form-associated>
      <probe-click id="w6">Save</probe-click>
    `;
    document.body.append(wrap);
    wrap.querySelector('#w2')!.addEventListener('click', () => {});
    const result = {
      plainDiv: brief(await ax('#w1')),
      divWithClickListener: brief(await ax('#w2')),
      plainHost: brief(await ax('#w3')),
      delegatesFocusHost: brief(await ax('#w4')),
      formAssociatedHost: brief(await ax('#w5')),
      clickListenerHost: brief(await ax('#w6')),
    };
    record('client-only', 'W1-W6', result);
    wrap.remove();
    if (engine === 'webkit') {
      // None of these alone makes the wrapper a group.
      for (const node of Object.values(result)) expect(node?.role).to.not.equal('group');
    }
  });

  it('W7-W15 display, combined properties, custom states and other cs-* hosts', async () => {
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <probe-plain id="w7" style="display: inline-block">Save</probe-plain>
      <div id="w8" style="display: inline-block"><button>Save</button></div>
      <probe-all id="w9">Save</probe-all>
      <probe-all id="w10" style="display: inline-block">Save</probe-all>
      <probe-state id="w11">Save</probe-state>
      <probe-state id="w12" style="display: inline-block">Save</probe-state>
      <cs-badge id="w13">3</cs-badge>
      <cs-input id="w14" label="Email"></cs-input>
      <cs-button id="w15" style="display: block">Save</cs-button>
    `;
    document.body.append(wrap);
    await Promise.all(
      [
        ...wrap.querySelectorAll<HTMLElement & { updateComplete?: Promise<unknown> }>('cs-badge, cs-input, cs-button'),
      ].map((el) => el.updateComplete),
    );
    const result = {
      plainHostInlineBlock: brief(await ax('#w7')),
      divInlineBlock: brief(await ax('#w8')),
      allHostProperties: brief(await ax('#w9')),
      allHostPropertiesInlineBlock: brief(await ax('#w10')),
      customStateHost: brief(await ax('#w11')),
      customStateHostInlineBlock: brief(await ax('#w12')),
      csBadge: brief(await ax('#w13')),
      csInput: brief(await ax('#w14')),
      csButtonDisplayBlock: brief(await ax('#w15')),
    };
    record('client-only', 'W7-W15', result);
    wrap.remove();
    if (engine === 'webkit') {
      expect(result.allHostProperties.role).to.equal('group');
      expect(result.csInput.role).to.equal('group'); // not specific to cs-button
      expect(result.csBadge.role).to.not.equal('group');
    }
  });

  it('W16-W18 which pair of host properties makes the group', async () => {
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <probe-df-fa id="w16">Save</probe-df-fa>
      <probe-df-click id="w17">Save</probe-df-click>
      <probe-fa-click id="w18">Save</probe-fa-click>
    `;
    document.body.append(wrap);
    const result = {
      delegatesFocusAndFormAssociated: brief(await ax('#w16')),
      delegatesFocusAndClick: brief(await ax('#w17')),
      formAssociatedAndClick: brief(await ax('#w18')),
    };
    record('client-only', 'W16-W18', result);
    wrap.remove();
    if (engine === 'webkit') {
      // delegatesFocus plus form association is the pair; the click listener is not needed.
      expect(result.delegatesFocusAndFormAssociated.role).to.equal('group');
      expect(result.delegatesFocusAndClick.role).to.not.equal('group');
      expect(result.formAssociatedAndClick.role).to.not.equal('group');
    }
  });
});

describe('host ARIA ruling: names from content and hidden labels', () => {
  for (const fixture of fixtures) {
    const mode = fixture.type;

    describe(`with "${mode}" rendering`, () => {
      it('V1 visually hidden text in the default slot extends a cs-button name', async () => {
        const el = await fixture<HTMLElement & { updateComplete: Promise<unknown> }>(html`
          <cs-button id="v1">Edit<span class="cs-visually-hidden"> invoice 42</span></cs-button>
        `);
        await el.updateComplete;
        const span = el.querySelector('span')!;
        const hidden = getComputedStyle(span).position === 'absolute' && span.getBoundingClientRect().width <= 1;
        const button = await ax('#v1 [part~="button"]');
        record(mode, 'V1', { hidden, button: brief(button) });
        expect(hidden).to.be.true;
        expect(button.name).to.equal('Edit invoice 42');
      });

      it('V2 cs-input label attribute with cs-visually-hidden-label names the field', async () => {
        const el = await fixture<HTMLElement & { updateComplete: Promise<unknown> }>(html`
          <cs-input id="v2" class="cs-visually-hidden-label" label="Search"></cs-input>
        `);
        await el.updateComplete;
        const label = el.shadowRoot!.querySelector('label')!;
        const hidden = label.getBoundingClientRect().width <= 1;
        const input = await ax('#v2 input');
        record(mode, 'V2', { hidden, labelAriaHidden: label.getAttribute('aria-hidden'), input: brief(input) });
        expect(hidden).to.be.true;
        expect(input.name).to.equal('Search');
      });

      it('V3 cs-input with a visually hidden slotted label names the field', async () => {
        const el = await fixture<HTMLElement & { updateComplete: Promise<unknown> }>(html`
          <cs-input id="v3"><span slot="label" class="cs-visually-hidden">Search</span></cs-input>
        `);
        await el.updateComplete;
        const label = el.shadowRoot!.querySelector('label')!;
        const input = await ax('#v3 input');
        record(mode, 'V3', { labelAriaHidden: label.getAttribute('aria-hidden'), input: brief(input) });
        expect(input.name).to.equal('Search');
      });

      it('V4 cs-input with only aria-label on the host', async () => {
        const el = await fixture<HTMLElement & { updateComplete: Promise<unknown> }>(html`
          <cs-input id="v4" aria-label="Search"></cs-input>
        `);
        await el.updateComplete;
        const host = await ax('#v4');
        const input = await ax('#v4 input');
        record(mode, 'V4', { host: brief(host), input: brief(input) });
        expect(input.name).to.equal(''); // host aria-label never reaches the field
      });
    });
  }

  it('V5 server output before hydration: label attribute vs slotted label', async () => {
    const byAttribute = await ssrFixture<HTMLElement>(
      html`<cs-input id="v5a" class="cs-visually-hidden-label" label="Search"></cs-input>`,
      { modules: window.serverComponents, base: import.meta.url, hydrate: false },
    );
    const bySlot = await ssrFixture<HTMLElement>(
      html`<cs-input id="v5b"><span slot="label" class="cs-visually-hidden">Search</span></cs-input>`,
      { modules: window.serverComponents, base: import.meta.url, hydrate: false },
    );
    const bySlotFlagged = await ssrFixture<HTMLElement>(
      html`<cs-input id="v5c" ssr-label><span slot="label" class="cs-visually-hidden">Search</span></cs-input>`,
      { modules: window.serverComponents, base: import.meta.url, hydrate: false },
    );
    const result = {
      byAttribute: {
        labelAriaHidden: byAttribute.shadowRoot?.querySelector('label')?.getAttribute('aria-hidden'),
        input: brief(await ax('#v5a input')),
      },
      bySlot: {
        labelAriaHidden: bySlot.shadowRoot?.querySelector('label')?.getAttribute('aria-hidden'),
        input: brief(await ax('#v5b input')),
      },
      bySlotWithSsrLabel: {
        labelAriaHidden: bySlotFlagged.shadowRoot?.querySelector('label')?.getAttribute('aria-hidden'),
        input: brief(await ax('#v5c input')),
      },
    };
    record('ssr-no-hydration', 'V5', result);
    expect(result.byAttribute.labelAriaHidden).to.equal('false');
    expect(result.bySlot.labelAriaHidden).to.equal('true'); // the slot is not detected on the server
    expect(result.bySlotWithSsrLabel.labelAriaHidden).to.equal('false');
  });
});
