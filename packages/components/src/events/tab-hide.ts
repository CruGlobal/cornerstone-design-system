export class CsTabHideEvent extends Event {
  readonly detail: CsTabHideEventDetail;

  constructor(detail: CsTabHideEventDetail) {
    super('cs-tab-hide', { bubbles: true, cancelable: false, composed: true });
    this.detail = detail;
  }
}

interface CsTabHideEventDetail {
  name: string;
}

declare global {
  interface GlobalEventHandlersEventMap {
    'cs-tab-hide': CsTabHideEvent;
  }
}
