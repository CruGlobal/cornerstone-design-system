export class CsClearEvent extends Event {
  constructor() {
    super('cs-clear', { bubbles: true, cancelable: false, composed: true });
  }
}

declare global {
  interface GlobalEventHandlersEventMap {
    'cs-clear': CsClearEvent;
  }
}
