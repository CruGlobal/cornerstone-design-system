/** Fired when the user commits a new value. Read the value from the element that fired it. */
export class CsChangeEvent extends Event {
  constructor() {
    super('cs-change', { bubbles: true, cancelable: false, composed: true });
  }
}

declare global {
  interface GlobalEventHandlersEventMap {
    'cs-change': CsChangeEvent;
  }
}
