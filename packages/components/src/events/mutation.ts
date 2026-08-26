export class CsMutationEvent extends Event {
  readonly detail: CsMutationEventDetail;

  constructor(detail: CsMutationEventDetail) {
    super('cs-mutation', { bubbles: true, cancelable: false, composed: true });
    this.detail = detail;
  }
}

interface CsMutationEventDetail {
  mutationList: MutationRecord[];
}

declare global {
  interface GlobalEventHandlersEventMap {
    'cs-mutation': CsMutationEvent;
  }
}
