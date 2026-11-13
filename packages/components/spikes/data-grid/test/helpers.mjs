/**
 * Shared Playwright helpers for the spike's browser tests. Chromium only: it is the one engine installed on the
 * machine the spike ran on, and the CDP accessibility tree used below is Chromium's.
 */
import { chromium } from 'playwright';
import { startServer } from '../serve.mjs';

export async function launch() {
  const server = await startServer({ port: 0, quiet: true });
  const browser = await chromium.launch();
  return {
    server,
    browser,
    async close() {
      await browser.close();
      await server.stop();
    },
  };
}

/** Opens the demo, records every live-region announcement, and waits for the grid to draw. */
export async function openGrid(env, query = '?rows=3000') {
  const page = await env.browser.newPage({
    viewport: { width: 1280, height: 800 },
  });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    window.announcements = [];
    new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          const log = node.parentElement?.closest?.('[role="log"]');
          if (log && node.nodeType === 1) {
            window.announcements.push({
              text: node.textContent,
              politeness: log.getAttribute('aria-live'),
            });
          }
        }
      }
    }).observe(document, { childList: true, subtree: true });
  });
  await page.goto(env.server.url + query);
  await page.waitForFunction(() =>
    document.querySelector('cs-data-grid')?.shadowRoot?.querySelector('[role="row"][aria-rowindex="2"]'),
  );
  page.pageErrors = errors;
  return page;
}

/** What has focus, through shadow roots. */
export function focused(page) {
  return page.evaluate(() => {
    let element = document.activeElement;
    while (element?.shadowRoot?.activeElement) {
      element = element.shadowRoot.activeElement;
    }
    return {
      tag: element?.localName,
      role: element?.getAttribute('role'),
      row: element?.closest?.('[data-row]')?.dataset.row,
      col: element?.closest?.('[data-col]')?.dataset.col,
      text: element?.textContent?.trim(),
      value: element?.value,
      id: element?.id,
      inGrid: element?.getRootNode() === document.querySelector('cs-data-grid')?.shadowRoot,
      className: element?.className,
    };
  });
}

/** Puts focus on a cell by row index and column key through the grid's own API. */
export async function focusCell(page, row, column) {
  await page.evaluate(
    async ({ row, column }) => {
      const grid = document.querySelector('cs-data-grid');
      grid.focusCell(row, column);
      await grid.updateComplete;
      await new Promise((resolve) => requestAnimationFrame(resolve));
    },
    { row, column },
  );
}

export function announcements(page) {
  return page.evaluate(() => window.announcements);
}

export function clearAnnouncements(page) {
  return page.evaluate(() => (window.announcements = []));
}

export async function frames(page, count = 2) {
  await page.evaluate(
    (count) =>
      new Promise((resolve) => {
        let left = count;
        const tick = () => (--left <= 0 ? resolve() : requestAnimationFrame(tick));
        requestAnimationFrame(tick);
      }),
    count,
  );
}

/** Name and role of the focused node in Chromium's accessibility tree. */
export async function focusedAccessibleNode(page) {
  const session = await page.context().newCDPSession(page);
  const { nodes } = await session.send('Accessibility.getFullAXTree');
  await session.detach();
  const node = nodes.findLast(
    (candidate) =>
      candidate.role?.value !== 'RootWebArea' &&
      candidate.properties?.some((property) => property.name === 'focused' && property.value.value === true),
  );
  if (!node) {
    return null;
  }
  const property = (name) => node.properties?.find((candidate) => candidate.name === name)?.value.value;
  return {
    role: node.role?.value,
    name: node.name?.value,
    description: node.description?.value,
    invalid: property('invalid'),
    editable: property('editable'),
    readonly: property('readonly'),
  };
}
