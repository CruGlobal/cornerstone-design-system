export class CsOptionsErrorEvent extends Event {
  readonly detail: CsOptionsErrorEventDetail;

  constructor(detail: CsOptionsErrorEventDetail) {
    super('cs-options-error', { bubbles: true, cancelable: false, composed: true });
    this.detail = detail;
  }
}

interface CsOptionsErrorEventDetail {
  /** What the `dataSource` threw or rejected with. */
  error: unknown;
  /** The request that failed. */
  request: { query: string };
}

declare global {
  interface GlobalEventHandlersEventMap {
    'cs-options-error': CsOptionsErrorEvent;
  }
}
