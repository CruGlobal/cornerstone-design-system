// Throwaway research tests for issue #230. Lives only on research/host-aria.
// Does any engine expose Reference Target, and with it on, what reaches the inner element?
import { aTimeout } from '@open-wc/testing';
import { executeServerCommand } from '@web/test-runner-commands';

const engine = navigator.userAgent.includes('Firefox')
  ? 'firefox'
  : navigator.userAgent.includes('Chrome')
    ? 'chromium'
    : 'webkit';
const ver = (navigator.userAgent.match(/(Chrome|Firefox|Version)\/([\d.]+)/) || [])[2];

async function ax(selector: string) {
  await aTimeout(50);
  const n = (await executeServerCommand('ax-node', { selector })) as {
    role?: string;
    name?: string;
    description?: string;
  };
  return n ? { role: n.role, name: n.name, description: n.description } : n;
}

class RtInput extends HTMLElement {
  constructor() {
    super();
    let root: ShadowRoot;
    try {
      root = this.attachShadow({ mode: 'open', referenceTarget: 'inner' } as ShadowRootInit);
    } catch {
      root = this.attachShadow({ mode: 'open' });
    }
    root.innerHTML = '<input id="inner">';
  }
}
customElements.define('rt-input', RtInput);

describe('reference target research', () => {
  it('R1 support and behaviour', async () => {
    const supported = 'referenceTarget' in ShadowRoot.prototype;
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <label for="r1">Email</label><rt-input id="r1"></rt-input>
      <span id="r2-name">Search the site</span><rt-input id="r2" aria-labelledby="r2-name"></rt-input>
      <rt-input id="r3" aria-label="Phone"></rt-input>
      <rt-input id="r4"></rt-input><button id="r4-btn" aria-controls="r4">Clear</button>
    `;
    document.body.append(wrap);
    const result = {
      engine,
      ver,
      supported,
      rootReferenceTarget: (document.getElementById('r1')!.shadowRoot as ShadowRoot & { referenceTarget?: string })
        .referenceTarget,
      labelForPointingAtHost: await ax('#r1 #inner'),
      hostAriaLabelledByOutward: await ax('#r2 #inner'),
      hostAriaLabelString: await ax('#r3 #inner'),
    };
    console.log(`HOSTARIA ${JSON.stringify({ engine, mode: 'client-only', case: 'R1', data: result })}`);
    if (!supported) {
      // Nothing crosses without Reference Target.
      if (result.labelForPointingAtHost.name !== '') throw new Error('label for crossed without reference target');
    } else {
      // Reference Target redirects references TO the host, never attributes ON it.
      if (result.labelForPointingAtHost.name !== 'Email')
        throw new Error('label for did not reach the reference target');
      if (result.hostAriaLabelString.name !== '') throw new Error('host aria-label reached the inner input');
      if (result.hostAriaLabelledByOutward.name !== '') throw new Error('host aria-labelledby reached the inner input');
    }
    wrap.remove();
  });
});
