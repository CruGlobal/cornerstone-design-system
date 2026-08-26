import { css } from 'lit';

export default css`
  :host {
    --pulse-color: var(--cs-color-fill-loud, var(--cs-color-brand-fill-loud));

    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.375em 0.625em;
    color: var(--cs-color-on-loud, var(--cs-color-brand-on-loud));
    font-size: max(var(--cs-font-size-3xs), 0.75em);
    font-weight: var(--cs-font-weight-semibold);
    line-height: 1;
    vertical-align: middle;
    white-space: nowrap;
    background-color: var(--cs-color-fill-loud, var(--cs-color-brand-fill-loud));
    border-color: transparent;
    border-radius: var(--cs-border-radius-s);
    border-style: var(--cs-border-style);
    border-width: var(--cs-border-width-s);
    user-select: none;
    -webkit-user-select: none;
    cursor: inherit;

    min-width: 1.25em; /* <-- this is what Safari respects for intrinsic */
    min-height: 1em;
  }

  /* Appearance modifiers */
  :host([appearance='outlined']) {
    --pulse-color: var(--cs-color-border-loud, var(--cs-color-brand-border-loud));

    color: var(--cs-color-on-quiet, var(--cs-color-brand-on-quiet));
    background-color: transparent;
    border-color: var(--cs-color-border-loud, var(--cs-color-brand-border-loud));
  }

  :host([appearance='filled']) {
    --pulse-color: var(--cs-color-fill-normal, var(--cs-color-brand-fill-normal));

    color: var(--cs-color-on-normal, var(--cs-color-brand-on-normal));
    background-color: var(--cs-color-fill-normal, var(--cs-color-brand-fill-normal));
    border-color: transparent;
  }

  :host([appearance='filled-outlined']) {
    --pulse-color: var(--cs-color-border-normal, var(--cs-color-brand-border-normal));

    color: var(--cs-color-on-normal, var(--cs-color-brand-on-normal));
    background-color: var(--cs-color-fill-normal, var(--cs-color-brand-fill-normal));
    border-color: var(--cs-color-border-normal, var(--cs-color-brand-border-normal));
  }

  :host([appearance='accent']) {
    --pulse-color: var(--cs-color-fill-loud, var(--cs-color-brand-fill-loud));

    color: var(--cs-color-on-loud, var(--cs-color-brand-on-loud));
    background-color: var(--cs-color-fill-loud, var(--cs-color-brand-fill-loud));
    border-color: transparent;
  }

  /* Pill modifier */
  :host([pill]) {
    border-radius: var(--cs-border-radius-pill);
  }

  /* Pulse attention */
  :host([attention='pulse']) {
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 var(--pulse-color);
    }
    70% {
      box-shadow: 0 0 0 0.5rem transparent;
    }
    100% {
      box-shadow: 0 0 0 0 transparent;
    }
  }

  /* Bounce attention */
  :host([attention='bounce']) {
    animation: bounce 1s cubic-bezier(0.28, 0.84, 0.42, 1) infinite;
  }

  @keyframes bounce {
    0%,
    20%,
    50%,
    80%,
    100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-5px);
    }
    60% {
      transform: translateY(-2px);
    }
  }

  /* Prevents vertical space when icons with vertical-align are slotted in - https://github.com/shoelace-style/webawesome/issues/2280 */
  [part='start'],
  [part='end'] {
    line-height: 0;
  }

  /* These are !important because a document-level universal margin reset would otherwise beat them:
     a slotted element belongs to the outer tree. See callout.styles.ts for the full note. */
  slot[name='start']::slotted(*) {
    margin-inline-end: 0.375em !important;
  }

  slot[name='end']::slotted(*) {
    margin-inline-start: 0.375em !important;
  }
`;
