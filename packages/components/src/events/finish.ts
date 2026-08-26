export class CsFinishEvent extends Event {
  constructor() {
    super('cs-finish', { bubbles: true, cancelable: false, composed: true });
  }
}

declare global {
  interface GlobalEventHandlersEventMap {
    'cs-finish': CsFinishEvent;
  }
}
