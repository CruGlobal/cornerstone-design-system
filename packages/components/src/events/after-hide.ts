export class CsAfterHideEvent extends Event {
  constructor() {
    super('cs-after-hide', { bubbles: true, cancelable: false, composed: true });
  }
}

declare global {
  interface GlobalEventHandlersEventMap {
    'cs-after-hide': CsAfterHideEvent;
  }
}
