export class CsAfterPageChangeEvent extends Event {
  readonly detail: CsAfterPageChangeEventDetail;

  constructor(detail: CsAfterPageChangeEventDetail) {
    super('cs-after-page-change', { bubbles: true, cancelable: false, composed: true });
    this.detail = detail;
  }
}

interface CsAfterPageChangeEventDetail {
  page: number;
  pageSize: number;
}

declare global {
  interface GlobalEventHandlersEventMap {
    'cs-after-page-change': CsAfterPageChangeEvent;
  }
}
