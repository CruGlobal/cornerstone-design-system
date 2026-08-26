export class CsLazyLoadEvent extends Event {
  constructor() {
    super('cs-lazy-load', { bubbles: true, cancelable: false, composed: true });
  }
}

declare global {
  interface GlobalEventHandlersEventMap {
    'cs-lazy-load': CsLazyLoadEvent;
  }
}
