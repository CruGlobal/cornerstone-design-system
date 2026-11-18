export class CsOptionsRequestEvent extends Event {
  readonly detail: CsOptionsRequestEventDetail;

  constructor(detail: CsOptionsRequestEventDetail) {
    super('cs-options-request', { bubbles: true, cancelable: false, composed: true });
    this.detail = detail;
  }
}

interface CsOptionsRequestEventDetail {
  /** The text to load options for. Empty when the list has just opened. */
  query: string;
  /** Aborted when a newer request replaces this one, or when the list closes. */
  signal: AbortSignal;
}

declare global {
  interface GlobalEventHandlersEventMap {
    'cs-options-request': CsOptionsRequestEvent;
  }
}
