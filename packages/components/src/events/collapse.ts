export class CsCollapseEvent extends Event {
  constructor() {
    super('cs-collapse', { bubbles: true, cancelable: false, composed: true });
  }
}

declare global {
  interface GlobalEventHandlersEventMap {
    'cs-collapse': CsCollapseEvent;
  }
}
