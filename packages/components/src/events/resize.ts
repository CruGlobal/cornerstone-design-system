export class CsResizeEvent extends Event {
  readonly detail: CsResizeEventDetail;

  constructor(detail: CsResizeEventDetail) {
    super('cs-resize', { bubbles: true, cancelable: false, composed: true });
    this.detail = detail;
  }
}

interface CsResizeEventDetail {
  entries: ResizeObserverEntry[];
}

declare global {
  interface GlobalEventHandlersEventMap {
    'cs-resize': CsResizeEvent;
  }
}
