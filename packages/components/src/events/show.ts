export class CsShowEvent extends Event {
  constructor() {
    super('cs-show', { bubbles: true, cancelable: true, composed: true });
  }
}

declare global {
  interface GlobalEventHandlersEventMap {
    'cs-show': CsShowEvent;
  }
}
