/** Spike event: a cell's value was committed (Enter, Tab or picking a lookup option). */
export class CsCellCommitEvent extends Event {
  readonly detail: {
    row: number;
    rowId: string | number;
    column: string;
    value: unknown;
    oldValue: unknown;
  };

  constructor(detail: CsCellCommitEvent['detail']) {
    super('cs-cell-commit', {
      bubbles: true,
      cancelable: false,
      composed: true,
    });
    this.detail = detail;
  }
}

declare global {
  interface GlobalEventHandlersEventMap {
    'cs-cell-commit': CsCellCommitEvent;
  }
}
