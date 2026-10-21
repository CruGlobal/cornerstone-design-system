import { css } from 'lit';

export default css`
  :host {
    /* Private: the divider's width is read here and in the grid template the script writes on the host, so its
       default is written once. A value set on an ancestor still reaches it. */
    --_divider-width: var(--cs-split-panel-divider-width, 0.25rem);

    display: grid;
  }

  .start,
  .end {
    overflow: hidden;
  }

  .divider {
    flex: 0 0 var(--_divider-width);
    display: flex;
    position: relative;
    align-items: center;
    justify-content: center;
    background-color: var(--cs-color-neutral-border-normal);
    color: var(--cs-color-neutral-on-normal);
    z-index: 1;
  }

  .divider:focus {
    outline: none;
  }

  :host(:not([disabled])) .divider:focus-visible {
    outline: var(--cs-focus-ring);
  }

  :host([disabled]) .divider {
    cursor: not-allowed;
  }

  /* Horizontal */
  :host(:not([orientation='vertical'], [disabled])) .divider {
    cursor: col-resize;
  }

  :host(:not([orientation='vertical'])) .divider::after {
    display: flex;
    content: '';
    position: absolute;
    height: 100%;
    left: calc(var(--cs-split-panel-divider-hit-area, 0.75rem) / -2 + var(--_divider-width) / 2);
    width: var(--cs-split-panel-divider-hit-area, 0.75rem);
  }

  /* Vertical */
  :host([orientation='vertical']) {
    flex-direction: column;
  }

  :host([orientation='vertical']:not([disabled])) .divider {
    cursor: row-resize;
  }

  :host([orientation='vertical']) .divider::after {
    content: '';
    position: absolute;
    width: 100%;
    top: calc(var(--cs-split-panel-divider-hit-area, 0.75rem) / -2 + var(--_divider-width) / 2);
    height: var(--cs-split-panel-divider-hit-area, 0.75rem);
  }

  @media (forced-colors: active) {
    .divider {
      outline: solid 1px transparent;
    }
  }
`;
