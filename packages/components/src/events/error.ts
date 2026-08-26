export class CsErrorEvent extends Event {
  constructor() {
    super('cs-error', { bubbles: true, cancelable: false, composed: true });
  }
}

declare global {
  interface GlobalEventHandlersEventMap {
    'cs-error': CsErrorEvent;
  }
}
