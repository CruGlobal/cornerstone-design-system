export class CsIncludeErrorEvent extends Event {
  readonly detail: CsIncludeErrorDetail;

  constructor(detail: CsIncludeErrorDetail) {
    super('cs-include-error', { bubbles: true, cancelable: false, composed: true });
    this.detail = detail;
  }
}

interface CsIncludeErrorDetail {
  status: number;
}

declare global {
  interface GlobalEventHandlersEventMap {
    'cs-include-error': CsIncludeErrorEvent;
  }
}
