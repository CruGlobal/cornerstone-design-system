export class CsPageChangeEvent extends Event {
  readonly detail: CsPageChangeEventDetail;

  constructor(detail: CsPageChangeEventDetail) {
    super('cs-page-change', { bubbles: true, cancelable: true, composed: true });
    this.detail = detail;
  }
}

interface CsPageChangeEventDetail {
  /** The page that will become active if the event isn't canceled. */
  page: number;
  /** The current page size. */
  pageSize: number;
}

declare global {
  interface GlobalEventHandlersEventMap {
    'cs-page-change': CsPageChangeEvent;
  }
}
