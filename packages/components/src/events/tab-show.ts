export class CsTabShowEvent extends Event {
  readonly detail: CsTabShowEventDetail;

  constructor(detail: CsTabShowEventDetail) {
    super('cs-tab-show', { bubbles: true, cancelable: false, composed: true });
    this.detail = detail;
  }
}

interface CsTabShowEventDetail {
  name: string;
}

declare global {
  interface GlobalEventHandlersEventMap {
    'cs-tab-show': CsTabShowEvent;
  }
}
