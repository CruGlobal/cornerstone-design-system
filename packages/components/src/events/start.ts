export class CsStartEvent extends Event {
  constructor() {
    super('cs-start', { bubbles: true, cancelable: false, composed: true });
  }
}

declare global {
  interface GlobalEventHandlersEventMap {
    'cs-start': CsStartEvent;
  }
}
