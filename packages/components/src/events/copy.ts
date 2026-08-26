export class CsCopyEvent extends Event {
  readonly detail: CsCopyErrorEventDetail;
  constructor(detail: CsCopyErrorEventDetail) {
    super('cs-copy', { bubbles: true, cancelable: false, composed: true });
    this.detail = detail;
  }
}

interface CsCopyErrorEventDetail {
  /** The value  that occurred while copying. */
  value: string;
}

declare global {
  interface GlobalEventHandlersEventMap {
    'cs-copy': CsCopyEvent;
  }
}
