/**
 * What `scrollIntoView` in `src/internal/scroll.ts` would need to serve a data grid. Kept beside the spike, not
 * changed in `src/internal/`, because the spike must not touch shipped code. The grid can run either version
 * (`scroll-strategy="cornerstone"` or `"inset"`) so the tests can measure both.
 *
 * Differences from the shared helper:
 *
 * 1. `insets` reserve room for things that cover the scrollport: the sticky header (block start) and pinned columns
 *    (inline start). The shared helper scrolls a cell to the very top edge, under the header.
 * 2. The visible box is measured with `clientWidth`/`clientHeight` and `clientLeft`/`clientTop`, so scrollbars are
 *    excluded. The shared helper uses `offsetWidth`/`offsetHeight`, which include the scrollbar, so a cell at the
 *    bottom or end edge can stop behind it.
 * 3. It scrolls by a delta measured in physical pixels (`scrollBy`) instead of computing an absolute `scrollLeft`,
 *    so it does not care that RTL `scrollLeft` runs from 0 to negative. Inline start becomes the right edge in RTL.
 * 4. Both axes go in one `scrollBy` call, so 'smooth' does not cancel one axis with the other.
 */
export interface ScrollInsets {
  blockStart?: number;
  inlineStart?: number;
  /** Skip the inline axis, for a pinned cell that never scrolls sideways. */
  verticalOnly?: boolean;
}

export function scrollCellIntoView(
  element: HTMLElement,
  container: HTMLElement,
  insets: ScrollInsets = {},
  behavior: ScrollBehavior = 'auto',
) {
  const box = container.getBoundingClientRect();
  const cell = element.getBoundingClientRect();
  const rtl = getComputedStyle(container).direction === 'rtl';

  const top = box.top + container.clientTop + (insets.blockStart ?? 0);
  const bottom = box.top + container.clientTop + container.clientHeight;
  let left = box.left + container.clientLeft;
  let right = left + container.clientWidth;
  if (rtl) {
    right -= insets.inlineStart ?? 0;
  } else {
    left += insets.inlineStart ?? 0;
  }

  let dy = 0;
  if (cell.top < top) {
    dy = cell.top - top;
  } else if (cell.bottom > bottom) {
    dy = cell.bottom - bottom;
  }

  let dx = 0;
  if (insets.verticalOnly) {
    dx = 0;
  } else if (cell.left < left) {
    dx = cell.left - left;
  } else if (cell.right > right) {
    dx = cell.right - right;
  }

  if (dx !== 0 || dy !== 0) {
    container.scrollBy({ left: dx, top: dy, behavior });
  }
}
