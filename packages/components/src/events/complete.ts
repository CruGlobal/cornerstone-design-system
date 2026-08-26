export class CsCompleteEvent extends Event {
  constructor() {
    super('cs-complete', { bubbles: true, cancelable: true, composed: true });
  }
}

declare global {
  interface GlobalEventHandlersEventMap {
    'cs-complete': CsCompleteEvent;
  }
}
