// Throwaway runner config for the host-ARIA research (issue #230). Lives only on research/host-aria.
//
// Adds two commands the shared config does not have:
//   ax-node   - the engine's own accessibility node for a selector, via Playwright's
//               page.accessibility.snapshot (Chromium over CDP, Firefox and WebKit over Playwright's
//               patched protocols). Playwright CSS selectors pierce open shadow roots.
//   cdp-ax    - Chromium only: the raw CDP AXNode for an element found by a JS expression, to see the
//               properties CDP reports (role, name, description, relations).
//
// Run one group: WTR_CONCURRENCY=1 npx web-test-runner --config web-test-runner.research.config.js --group host-aria
import base from './web-test-runner.config.js';

function researchCommands() {
  return {
    name: 'host-aria-research-commands',
    async executeCommand({ command, payload, session }) {
      if (command === 'ax-node') {
        const page = session.browser.getPage(session.id);
        const handle = await page.$(payload.selector);
        if (!handle) {
          return { missing: true };
        }
        const snapshot = await page.accessibility.snapshot({ root: handle, interestingOnly: false });
        return snapshot ?? { notInTree: true };
      }

      if (command === 'cdp-ax') {
        const page = session.browser.getPage(session.id);
        if (session.browser.name && !/chrom/i.test(session.browser.name)) {
          return { unsupported: true };
        }
        let client;
        try {
          client = await page.context().newCDPSession(page);
        } catch {
          return { unsupported: true };
        }
        const { result } = await client.send('Runtime.evaluate', { expression: payload.expression });
        if (!result.objectId) {
          return { missing: true };
        }
        const { nodes } = await client.send('Accessibility.getPartialAXTree', {
          objectId: result.objectId,
          fetchRelatives: false,
        });
        await client.detach();
        const node = nodes[0];
        return {
          ignored: node.ignored,
          role: node.role?.value,
          name: node.name?.value,
          description: node.description?.value,
          properties: (node.properties || []).map(
            (p) => `${p.name}=${JSON.stringify(p.value?.value ?? p.value?.relatedNodes?.length)}`,
          ),
        };
      }

      return undefined;
    },
  };
}

export default {
  ...base,
  plugins: [...base.plugins, researchCommands()],
};
