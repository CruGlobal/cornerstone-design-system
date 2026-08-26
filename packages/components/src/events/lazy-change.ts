export class CsLazyChangeEvent extends Event {
  constructor() {
    super('cs-lazy-change', { bubbles: true, cancelable: false, composed: true });
  }
}

declare global {
  interface GlobalEventHandlersEventMap {
    'cs-lazy-change': CsLazyChangeEvent;
  }
}
