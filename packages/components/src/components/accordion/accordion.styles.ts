import { css } from 'lit';

export default css`
  @layer cs-component {
    :host {
      display: block;
      background-color: var(--cs-color-surface-default);
      border: var(--cs-panel-border-width) var(--cs-panel-border-style) var(--cs-color-surface-border);
      border-radius: var(--cs-panel-border-radius);
      overflow: hidden;
    }

    /* Appearance modifiers */
    :host([appearance='outlined']) {
      background-color: var(--cs-color-surface-default);
      border-color: var(--cs-color-surface-border);
    }

    :host([appearance='filled']) {
      border-color: transparent;
    }

    :host([appearance='filled-outlined']) {
      background-color: var(--cs-color-neutral-fill-quiet);
      border-color: var(--cs-color-neutral-border-quiet);
    }

    :host([appearance='plain']) {
      background-color: transparent;
      border-color: transparent;
      border-radius: 0;
    }
  }
`;
