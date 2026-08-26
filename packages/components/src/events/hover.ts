interface CsHoverEventDetail {
  phase: 'start' | 'move' | 'end';
  value: number;
}

export class CsHoverEvent extends Event {
  readonly detail: CsHoverEventDetail;

  constructor(detail: CsHoverEventDetail) {
    super('cs-hover', { bubbles: true, cancelable: false, composed: true });
    this.detail = detail;
  }
}

declare global {
  interface GlobalEventHandlersEventMap {
    'cs-hover': CsHoverEvent;
  }
}
