export class CsSelectEvent extends Event {
  readonly detail;

  constructor(detail: CsSelectEventDetail) {
    super('cs-select', { bubbles: true, cancelable: true, composed: true });
    this.detail = detail;
  }
}

interface CsSelectEventDetail {
  item: Element;
}

declare global {
  interface GlobalEventHandlersEventMap {
    'cs-select': CsSelectEvent;
  }
}
