import type CsTreeItem from '../components/tree-item/tree-item.js';

export class CsSelectionChangeEvent extends Event {
  readonly detail: CsSelectionChangeEventDetail;

  constructor(detail: CsSelectionChangeEventDetail) {
    super('cs-selection-change', { bubbles: true, cancelable: false, composed: true });
    this.detail = detail;
  }
}

interface CsSelectionChangeEventDetail {
  selection: CsTreeItem[];
}

declare global {
  interface GlobalEventHandlersEventMap {
    'cs-selection-change': CsSelectionChangeEvent;
  }
}
