/** Spike event: `submit()` ran. `detail.ok` is false when rows still had errors. */
export class CsBatchSubmitEvent extends Event {
  readonly detail: { ok: boolean; errorCount: number; rowCount: number };

  constructor(detail: CsBatchSubmitEvent['detail']) {
    super('cs-batch-submit', {
      bubbles: true,
      cancelable: false,
      composed: true,
    });
    this.detail = detail;
  }
}

declare global {
  interface GlobalEventHandlersEventMap {
    'cs-batch-submit': CsBatchSubmitEvent;
  }
}
