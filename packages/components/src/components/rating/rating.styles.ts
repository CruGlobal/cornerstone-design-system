import { css } from 'lit';

export default css`
  :host {
    display: inline-flex;
    border-radius: var(--cs-border-radius-m);
    vertical-align: middle;
    touch-action: none;
  }

  :host(:focus) {
    outline: none;
  }

  :host(:focus-visible) {
    outline: var(--cs-focus-ring);
    outline-offset: var(--cs-focus-ring-offset);
  }

  .rating {
    position: relative;
    display: inline-flex;
  }

  .symbols {
    display: inline-flex;
    gap: 0.125em;
    position: relative;
    line-height: 0;
    color: var(--cs-rating-symbol-color, var(--cs-color-neutral-on-quiet));
    white-space: nowrap;
    cursor: pointer;
  }

  .symbols > * {
    padding: var(--cs-rating-symbol-spacing, 0.125em);
  }

  .symbol-active,
  .partial-filled {
    color: var(--cs-rating-symbol-color-active, var(--cs-color-yellow-70));
  }

  .partial-symbol-container {
    position: relative;
  }

  .partial-filled {
    position: absolute;
    top: var(--cs-rating-symbol-spacing, 0.125em);
    left: var(--cs-rating-symbol-spacing, 0.125em);
  }

  .symbol {
    transition: scale var(--cs-transition-normal) var(--cs-transition-easing);
    pointer-events: none;
  }

  .symbol-hover {
    scale: 1.2;
  }

  .rating-readonly .symbols {
    cursor: default;
  }

  :host([disabled]) .symbol-hover,
  .rating-readonly .symbol-hover {
    scale: none;
  }

  :host([disabled]) {
    opacity: 0.5;
  }

  :host([disabled]) .symbols {
    cursor: not-allowed;
  }

  /* Forced colors mode */
  @media (forced-colors: active) {
    .symbol-active {
      color: SelectedItem;
    }
  }
`;
