export class CsHideEvent extends Event {
  readonly detail: CsHideEventDetails | undefined;

  constructor(detail?: CsHideEventDetails) {
    super('cs-hide', { bubbles: true, cancelable: true, composed: true });
    this.detail = detail;
  }
}

interface CsHideEventDetails {
  source: Element;
}

declare global {
  interface GlobalEventHandlersEventMap {
    'cs-hide': CsHideEvent;
  }
}
