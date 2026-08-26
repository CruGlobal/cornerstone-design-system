export class CsRepositionEvent extends Event {
  constructor() {
    super('cs-reposition', { bubbles: true, cancelable: false, composed: true });
  }
}

declare global {
  interface GlobalEventHandlersEventMap {
    'cs-reposition': CsRepositionEvent;
  }
}
