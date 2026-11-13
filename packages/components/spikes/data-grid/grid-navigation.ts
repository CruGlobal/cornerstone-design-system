/**
 * Pure grid maths for the `cs-data-grid` spike (UIUX-340). No DOM, so `test/navigation.test.mjs` tests it directly.
 *
 * Two functions here are adapted from litgrid (https://github.com/tipolox/litgrid, MIT, commit 2ab7ee2):
 *
 * - `getVirtualWindow` is adapted from `createVirtualizer().getState()` in
 *   `packages/grid-renderer/src/virtualization/createVirtualizer.ts`.
 * - `getTabTarget` is adapted from `DataGrid.getTabNavigationCell()` in
 *   `packages/grid-web/src/components/DataGrid.ts`.
 *
 * Copyright (c) 2026 Tipolox. Licensed under the MIT License; the full notice is in `LICENSE-litgrid` next to this
 * file. Everything else in this file is Cornerstone's own.
 */

export interface GridCell {
  row: number;
  column: number;
}

export interface GridShape {
  rowCount: number;
  columnCount: number;
}

export interface VirtualWindowOptions {
  scrollTop: number;
  viewportHeight: number;
  rowHeight: number;
  rowCount: number;
  overscan: number;
}

export interface VirtualWindow {
  /** First rendered row index, inclusive. */
  start: number;
  /** Last rendered row index, exclusive. */
  end: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/** Which rows to draw for a scroll position. Adapted from litgrid's fixed-height virtualizer. */
export function getVirtualWindow(options: VirtualWindowOptions): VirtualWindow {
  const rowCount = Math.max(0, options.rowCount);
  const rowHeight = Math.max(1, options.rowHeight);
  const overscan = Math.max(0, options.overscan);
  const visibleCount = Math.max(1, Math.ceil(Math.max(0, options.viewportHeight) / rowHeight));
  const maxStart = Math.max(0, rowCount - visibleCount);
  const baseStart = clamp(Math.floor(options.scrollTop / rowHeight), 0, maxStart);
  const start = clamp(baseStart - overscan, 0, rowCount);
  const end = clamp(baseStart + visibleCount + overscan, start, rowCount);
  return { start, end };
}

/**
 * The rows to render: the virtual window plus the active row, sorted and unique.
 *
 * This is the fix for litgrid's recycling bug. The active row (which holds focus, and the editor when editing) is
 * always in the list, and the list is always in ascending order, so a keyed `repeat` never has to move or recreate
 * that row's DOM while the window slides past it. DOM order also stays equal to visual order.
 */
export function getRenderedRows(window: VirtualWindow, activeRow: number, rowCount: number): number[] {
  const rows: number[] = [];
  const keepActive = activeRow >= 0 && activeRow < rowCount;
  if (keepActive && activeRow < window.start) {
    rows.push(activeRow);
  }
  for (let index = window.start; index < window.end; index++) {
    rows.push(index);
  }
  if (keepActive && activeRow >= window.end) {
    rows.push(activeRow);
  }
  return rows;
}

/**
 * The cell Tab (direction 1) or Shift+Tab (direction -1) moves to, wrapping across rows. Returns `null` past the
 * last or first cell, which means "let the browser move focus out of the grid". Adapted from litgrid.
 */
export function getTabTarget(active: GridCell, direction: -1 | 1, shape: GridShape): GridCell | null {
  const { rowCount, columnCount } = shape;
  if (rowCount === 0 || columnCount === 0) {
    return null;
  }
  const next = active.row * columnCount + active.column + direction;
  if (next < 0 || next >= rowCount * columnCount) {
    return null;
  }
  return { row: Math.floor(next / columnCount), column: next % columnCount };
}

export interface ArrowOptions {
  key: string;
  ctrlKey: boolean;
  rtl: boolean;
  pageSize: number;
}

/**
 * The cell an arrow, Home, End, Page Up or Page Down key moves to, or `null` when the key is not a movement key.
 * Arrows do not wrap. Left and Right swap in RTL, the same inversion `SegmentedFieldController` applies; Home and End
 * stay logical.
 */
export function getArrowTarget(active: GridCell, options: ArrowOptions, shape: GridShape): GridCell | null {
  const lastRow = shape.rowCount - 1;
  const lastColumn = shape.columnCount - 1;
  if (lastRow < 0 || lastColumn < 0) {
    return null;
  }
  const forward = options.rtl ? -1 : 1;
  let { row, column } = active;

  switch (options.key) {
    case 'ArrowUp':
      row -= 1;
      break;
    case 'ArrowDown':
      row += 1;
      break;
    case 'ArrowLeft':
      column -= forward;
      break;
    case 'ArrowRight':
      column += forward;
      break;
    case 'Home':
      column = 0;
      if (options.ctrlKey) {
        row = 0;
      }
      break;
    case 'End':
      column = lastColumn;
      if (options.ctrlKey) {
        row = lastRow;
      }
      break;
    case 'PageUp':
      row -= Math.max(1, options.pageSize);
      break;
    case 'PageDown':
      row += Math.max(1, options.pageSize);
      break;
    default:
      return null;
  }

  return { row: clamp(row, 0, lastRow), column: clamp(column, 0, lastColumn) };
}

export interface LookupOption {
  value: string;
  label: string;
}

/** Options whose code or name contains the query, codes that start with it first. */
export function filterOptions(options: LookupOption[], query: string, limit = 50): LookupOption[] {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return options.slice(0, limit);
  }
  const starts: LookupOption[] = [];
  const contains: LookupOption[] = [];
  for (const option of options) {
    const value = option.value.toLowerCase();
    const label = option.label.toLowerCase();
    if (value.startsWith(needle)) {
      starts.push(option);
    } else if (value.includes(needle) || label.includes(needle)) {
      contains.push(option);
    }
    if (starts.length >= limit) {
      break;
    }
  }
  return [...starts, ...contains].slice(0, limit);
}

export interface DataGridLayout {
  version: 1;
  /** Column keys in display order. */
  order: string[];
  /** Column keys pinned to the inline-start edge. Pinned columns always render first, in `order`'s order. */
  pinned: string[];
  /** Column widths in `em`, keyed by column key. */
  widths: Record<string, number>;
}

/**
 * Reconciles a saved layout with the columns that exist now: unknown keys drop, new columns append, bad widths fall
 * back. A layout saved last month must not break the grid after a column is added or removed.
 */
export function normalizeLayout(
  layout: Partial<DataGridLayout> | null | undefined,
  columns: { key: string; width?: number }[],
): DataGridLayout {
  const known = new Set(columns.map((column) => column.key));
  const order = (layout?.order ?? []).filter((key, index, all) => known.has(key) && all.indexOf(key) === index);
  for (const column of columns) {
    if (!order.includes(column.key)) {
      order.push(column.key);
    }
  }
  const pinnedSet = new Set((layout?.pinned ?? []).filter((key) => known.has(key)));
  const widths: Record<string, number> = {};
  for (const column of columns) {
    const saved = layout?.widths?.[column.key];
    widths[column.key] = typeof saved === 'number' && saved > 0 && saved < 100 ? saved : (column.width ?? 8);
  }
  const pinned = order.filter((key) => pinnedSet.has(key));
  const ordered = [...pinned, ...order.filter((key) => !pinnedSet.has(key))];
  return { version: 1, order: ordered, pinned, widths };
}

/** Moves a column one step earlier (-1) or later (1) within its own pinned or unpinned block. */
export function moveColumn(layout: DataGridLayout, key: string, delta: -1 | 1): DataGridLayout {
  const order = [...layout.order];
  const from = order.indexOf(key);
  const to = from + delta;
  if (from < 0 || to < 0 || to >= order.length) {
    return layout;
  }
  const pinned = layout.pinned.includes(key);
  if (layout.pinned.includes(order[to]) !== pinned) {
    return layout;
  }
  [order[from], order[to]] = [order[to], order[from]];
  return {
    ...layout,
    order,
    pinned: order.filter((k) => layout.pinned.includes(k)),
  };
}

/** Pins or unpins a column. Pinning moves it to the end of the pinned block; unpinning to the start of the rest. */
export function setPinned(layout: DataGridLayout, key: string, pinned: boolean): DataGridLayout {
  if (!layout.order.includes(key) || layout.pinned.includes(key) === pinned) {
    return layout;
  }
  const pinnedKeys = pinned ? [...layout.pinned, key] : layout.pinned.filter((k) => k !== key);
  const rest = layout.order.filter((k) => !pinnedKeys.includes(k));
  return { ...layout, order: [...pinnedKeys, ...rest], pinned: pinnedKeys };
}
