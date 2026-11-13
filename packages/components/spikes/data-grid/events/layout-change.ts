import type { DataGridLayout } from '../grid-navigation.js';

/** Spike event: column order, pinning or widths changed. `detail.layout` is the same JSON the `layout` getter returns. */
export class CsLayoutChangeEvent extends Event {
  readonly detail: { layout: DataGridLayout };

  constructor(detail: CsLayoutChangeEvent['detail']) {
    super('cs-layout-change', {
      bubbles: true,
      cancelable: false,
      composed: true,
    });
    this.detail = detail;
  }
}

declare global {
  interface GlobalEventHandlersEventMap {
    'cs-layout-change': CsLayoutChangeEvent;
  }
}
