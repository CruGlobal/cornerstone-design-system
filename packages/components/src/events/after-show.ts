export class CsAfterShowEvent extends Event {
  constructor() {
    super('cs-after-show', { bubbles: true, cancelable: false, composed: true });
  }
}

declare global {
  interface GlobalEventHandlersEventMap {
    'cs-after-show': CsAfterShowEvent;
  }
}
