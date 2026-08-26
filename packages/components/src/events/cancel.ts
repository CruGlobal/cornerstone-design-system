export class CsCancelEvent extends Event {
  constructor() {
    super('cs-cancel', { bubbles: true, cancelable: false, composed: true });
  }
}

declare global {
  interface GlobalEventHandlersEventMap {
    'cs-cancel': CsCancelEvent;
  }
}
