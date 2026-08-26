export class CsExpandEvent extends Event {
  constructor() {
    super('cs-expand', { bubbles: true, cancelable: false, composed: true });
  }
}

declare global {
  interface GlobalEventHandlersEventMap {
    'cs-expand': CsExpandEvent;
  }
}
