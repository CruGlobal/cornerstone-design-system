export class CsAfterCollapseEvent extends Event {
  constructor() {
    super('cs-after-collapse', { bubbles: true, cancelable: false, composed: true });
  }
}

declare global {
  interface GlobalEventHandlersEventMap {
    'cs-after-collapse': CsAfterCollapseEvent;
  }
}
