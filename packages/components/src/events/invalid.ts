export class CsInvalidEvent extends Event {
  constructor() {
    super('cs-invalid', { bubbles: true, cancelable: false, composed: true });
  }
}

declare global {
  interface GlobalEventHandlersEventMap {
    'cs-invalid': CsInvalidEvent;
  }
}
