/**
 * Rough performance numbers for the spike: `node spikes/data-grid/test/perf.mjs` from `packages/components`.
 * Headless Chromium on the developer's machine, with and without 4x CPU throttling. Indicative only.
 */
import { chromium } from 'playwright';
import { startServer } from '../serve.mjs';

const server = await startServer({ port: 0, quiet: true });
const browser = await chromium.launch();
const results = [];

for (const throttle of [1, 4]) {
  for (const rows of [5000, 10000]) {
    const page = await browser.newPage({
      viewport: { width: 1280, height: 800 },
    });
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: throttle });
    await page.goto(`${server.url}?rows=${rows}`);
    await page.waitForFunction(() => typeof window.renderMs === 'number');
    const renderMs = await page.evaluate(() => window.renderMs);

    const scroll = await page.evaluate(
      () =>
        new Promise((resolve) => {
          const scroller = document.querySelector('cs-data-grid').shadowRoot.querySelector('[role="grid"]');
          const deltas = [];
          let last = performance.now();
          let frame = 0;
          const step = (now) => {
            deltas.push(now - last);
            last = now;
            scroller.scrollTop += 400; // about 9 rows per frame, a fast flick
            if (++frame < 300) {
              requestAnimationFrame(step);
            } else {
              resolve(deltas.slice(1));
            }
          };
          requestAnimationFrame(step);
        }),
    );
    scroll.sort((a, b) => a - b);

    const jumps = await page.evaluate(async () => {
      const grid = document.querySelector('cs-data-grid');
      const scroller = grid.shadowRoot.querySelector('[role="grid"]');
      const times = [];
      for (let i = 0; i < 50; i++) {
        const start = performance.now();
        scroller.scrollTop = Math.floor(Math.random() * scroller.scrollHeight);
        scroller.dispatchEvent(new Event('scroll'));
        await grid.updateComplete;
        times.push(performance.now() - start);
      }
      return times.sort((a, b) => a - b);
    });

    const keys = await page.evaluate(async () => {
      const grid = document.querySelector('cs-data-grid');
      grid.focusCell(0, 'amount');
      await grid.updateComplete;
      return true;
    });
    const keyStart = Date.now();
    for (let i = 0; i < 200; i++) {
      await page.keyboard.press('ArrowDown');
    }
    const keyMs = (Date.now() - keyStart) / 200;

    await cdp.send('HeapProfiler.collectGarbage');
    const heap = await cdp.send('Runtime.getHeapUsage');
    const dom = await page.evaluate(() => ({
      rows: document.querySelector('cs-data-grid').shadowRoot.querySelectorAll('[role="row"]').length,
      nodes: document.querySelector('cs-data-grid').shadowRoot.querySelectorAll('*').length,
    }));
    const pct = (list, p) => list[Math.min(list.length - 1, Math.floor(list.length * p))];
    results.push({
      throttle: `${throttle}x`,
      rows,
      renderMs: Math.round(renderMs),
      scrollFrameMs: {
        median: pct(scroll, 0.5).toFixed(1),
        p95: pct(scroll, 0.95).toFixed(1),
        max: scroll.at(-1).toFixed(1),
      },
      framesOver33ms: scroll.filter((delta) => delta > 33.4).length,
      jumpUpdateMs: {
        median: pct(jumps, 0.5).toFixed(1),
        p95: pct(jumps, 0.95).toFixed(1),
      },
      arrowKeyMsPerPress: keyMs.toFixed(1),
      heapUsedMB: (heap.usedSize / 1048576).toFixed(1),
      renderedRows: dom.rows,
      shadowElements: dom.nodes,
      ok: keys,
    });
    await page.close();
  }
}

process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
await browser.close();
await server.stop();
