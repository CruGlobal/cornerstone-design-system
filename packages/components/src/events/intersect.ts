/** Emitted when an element's intersection state changes. */
export class CsIntersectEvent extends Event {
  readonly detail?: CsIntersectEventDetail;

  constructor(detail?: CsIntersectEventDetail) {
    super('cs-intersect', { bubbles: true, cancelable: false, composed: true });
    this.detail = detail;
  }
}

interface CsIntersectEventDetail {
  entry?: IntersectionObserverEntry;
}

declare global {
  interface GlobalEventHandlersEventMap {
    'cs-intersect': CsIntersectEvent;
  }
}
