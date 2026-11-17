export class CsCreateEvent extends Event {
  readonly detail: CsCreateEventDetail;

  constructor(detail: CsCreateEventDetail) {
    super('cs-create', { bubbles: true, cancelable: true, composed: true });
    this.detail = detail;
  }
}

interface CsCreateEventDetail {
  /** The text the user typed, trimmed. */
  inputValue: string;
}

declare global {
  interface GlobalEventHandlersEventMap {
    'cs-create': CsCreateEvent;
  }
}
