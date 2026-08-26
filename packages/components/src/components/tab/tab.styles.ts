import { css } from 'lit';

export default css`
  :host {
    display: inline-block;
    color: var(--cs-color-neutral-on-quiet);
    font-weight: var(--cs-font-weight-action);
  }

  .tab {
    display: inline-flex;
    align-items: center;
    font: inherit;
    padding: 1em 1.5em;
    white-space: nowrap;
    user-select: none;
    -webkit-user-select: none;
    cursor: pointer;
    transition: color var(--cs-transition-fast) var(--cs-transition-easing);

    /* These are !important because a document-level universal margin reset would otherwise beat them:
     a slotted element belongs to the outer tree. See callout.styles.ts for the full note. */
    ::slotted(cs-icon:first-child) {
      margin-inline-end: 0.5em !important;
    }

    ::slotted(cs-icon:last-child) {
      margin-inline-start: 0.5em !important;
    }
  }

  @media (hover: hover) {
    :host(:hover:not([disabled])) .tab {
      color: currentColor;
    }
  }

  :host(:focus) {
    outline: transparent;
  }

  :host(:focus-visible) .tab {
    outline: var(--cs-focus-ring);
    outline-offset: calc(-1 * var(--cs-border-width-l) - var(--cs-focus-ring-offset));
  }

  :host([active]:not([disabled])) {
    color: var(--cs-color-brand-on-quiet);
  }

  :host([disabled]) .tab {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (forced-colors: active) {
    :host([active]:not([disabled])) {
      outline: solid 1px transparent;
      outline-offset: -3px;
    }
  }
`;
