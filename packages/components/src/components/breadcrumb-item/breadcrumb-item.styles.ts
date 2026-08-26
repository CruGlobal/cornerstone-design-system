import { css } from 'lit';

export default css`
  :host {
    color: var(--cs-color-text-link);
    display: inline-flex;
    align-items: center;
    font: inherit;
    font-weight: var(--cs-font-weight-action);
    line-height: var(--cs-line-height-normal);
    white-space: nowrap;
  }

  :host(:last-of-type) {
    color: var(--cs-color-text-quiet);
  }

  .label {
    display: inline-block;
    font: inherit;
    text-decoration: none;
    color: currentColor;
    background: none;
    border: none;
    border-radius: var(--cs-border-radius-m);
    padding: 0;
    margin: 0;
    cursor: pointer;
    transition: color var(--cs-transition-normal) var(--cs-transition-easing);
  }

  @media (hover: hover) {
    :host(:not(:last-of-type)) .label:hover {
      color: color-mix(in oklab, currentColor, var(--cs-color-mix-hover));
    }
  }

  :host(:not(:last-of-type)) .label:active {
    color: color-mix(in oklab, currentColor, var(--cs-color-mix-active));
  }

  .label:focus {
    outline: none;
  }

  .label:focus-visible {
    outline: var(--cs-focus-ring);
    outline-offset: var(--cs-focus-ring-offset);
  }

  .start,
  .end {
    display: none;
    flex: 0 0 auto;
    display: flex;
    align-items: center;
  }

  .start,
  .end {
    display: inline-flex;
    color: var(--cs-color-text-quiet);
  }

  /* These are !important because a document-level universal margin reset would otherwise beat them:
     a slotted element belongs to the outer tree. See callout.styles.ts for the full note. */
  ::slotted([slot='start']) {
    margin-inline-end: var(--cs-space-s) !important;
  }

  ::slotted([slot='end']) {
    margin-inline-start: var(--cs-space-s) !important;
  }

  :host(:last-of-type) .separator {
    display: none;
  }

  .separator {
    color: var(--cs-color-text-quiet);
    display: inline-flex;
    align-items: center;
    margin: 0 var(--cs-space-s);
    user-select: none;
    -webkit-user-select: none;
  }
`;
