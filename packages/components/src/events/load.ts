export class CsLoadEvent extends Event {
  constructor() {
    super('cs-load', { bubbles: true, cancelable: false, composed: true });
  }
}

declare global {
  interface GlobalEventHandlersEventMap {
    'cs-load': CsLoadEvent;
  }
}
