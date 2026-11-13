import './data-grid.js';
import type CsDataGrid from './data-grid.js';
import { columns, makeRows } from './sample-data.js';

/**
 * Demo wiring. Query string: `?rows=5000`, `?dir=rtl`, `?scroll=cornerstone`. A save fails when the amount is 13,
 * so the failed-save path can be tried by hand.
 */
const params = new URLSearchParams(location.search);
const count = Number(params.get('rows') ?? 5000);
const grid = document.querySelector<CsDataGrid>('cs-data-grid')!;
const LAYOUT_KEY = 'cs-data-grid-spike-layout';

if (params.get('dir') === 'rtl') {
  document.documentElement.dir = 'rtl';
}
if (params.get('scroll') === 'cornerstone') {
  grid.scrollStrategy = 'cornerstone';
}

const started = performance.now();
grid.columns = columns;
grid.rows = makeRows(count, Math.max(0, count - 50));
grid.layout = { pinned: ['line', 'donor'] };
grid.saveHandler = ({ value, column }) =>
  new Promise((resolve, reject) =>
    setTimeout(
      () =>
        column === 'amount' && value === 13 ? reject(new Error('Amount 13 is blocked by the test server.')) : resolve(),
      150,
    ),
  );
grid.updateComplete.then(() => {
  requestAnimationFrame(() => {
    (window as unknown as { renderMs: number }).renderMs = performance.now() - started;
  });
});

const columnSelect = document.querySelector<HTMLSelectElement>('#column')!;
for (const column of columns) {
  columnSelect.add(new Option(column.label, column.key));
}

const actions: Record<string, () => void> = {
  earlier: () => grid.moveColumn(columnSelect.value, -1),
  later: () => grid.moveColumn(columnSelect.value, 1),
  pin: () => grid.pinColumn(columnSelect.value, true),
  unpin: () => grid.pinColumn(columnSelect.value, false),
  save: () => {
    try {
      localStorage.setItem(LAYOUT_KEY, JSON.stringify(grid.layout));
    } catch {
      /* storage blocked: nothing to save to */
    }
  },
  restore: () => {
    try {
      const saved = localStorage.getItem(LAYOUT_KEY);
      if (saved) {
        grid.layout = JSON.parse(saved);
      }
    } catch {
      /* storage blocked or bad JSON: keep the current layout */
    }
  },
  reset: () => (grid.layout = { pinned: ['line', 'donor'] }),
  submit: () => grid.submit(),
  dark: () => document.documentElement.classList.toggle('cs-dark'),
  brand: () => {
    const link = document.querySelector<HTMLLinkElement>('#fl-theme')!;
    link.disabled = !link.disabled;
  },
  rtl: () => (document.documentElement.dir = document.documentElement.dir === 'rtl' ? 'ltr' : 'rtl'),
};

document.querySelector('#toolbar')!.addEventListener('click', (event) => {
  const action = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-action]')?.dataset.action;
  if (action) {
    actions[action]?.();
  }
});

grid.addEventListener('cs-layout-change', (event) => {
  document.querySelector('#layout-json')!.textContent = JSON.stringify(event.detail.layout);
});
