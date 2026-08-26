export class CsAfterExpandEvent extends Event {
  constructor() {
    super('cs-after-expand', { bubbles: true, cancelable: false, composed: true });
  }
}

declare global {
  interface GlobalEventHandlersEventMap {
    'cs-after-expand': CsAfterExpandEvent;
  }
}
