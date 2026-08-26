export class CsRemoveEvent extends Event {
  constructor() {
    super('cs-remove', { bubbles: true, cancelable: false, composed: true });
  }
}

declare global {
  interface GlobalEventHandlersEventMap {
    'cs-remove': CsRemoveEvent;
  }
}
