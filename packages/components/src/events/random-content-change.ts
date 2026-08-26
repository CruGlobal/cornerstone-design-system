export class CsContentChangeEvent extends Event {
  readonly detail: CsContentChangeEventDetails;

  constructor(detail: CsContentChangeEventDetails) {
    super('cs-content-change', { bubbles: true, cancelable: false, composed: true });
    this.detail = detail;
  }
}

interface CsContentChangeEventDetails {
  /** The elements currently shown after the selection. */
  items: Element[];
}

declare global {
  interface GlobalEventHandlersEventMap {
    'cs-content-change': CsContentChangeEvent;
  }
}
