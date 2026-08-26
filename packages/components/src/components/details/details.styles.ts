import { css } from 'lit';

export default css`
  :host {
    --spacing: var(--cs-space-m);
    --show-duration: var(--cs-transition-normal);
    --hide-duration: var(--cs-transition-normal);

    display: block;
  }

  details {
    display: block;
    overflow-anchor: none;
    border: var(--cs-panel-border-width) var(--cs-color-surface-border) var(--cs-panel-border-style);
    background-color: var(--cs-color-surface-default);
    border-radius: var(--cs-panel-border-radius);
    color: var(--cs-color-text-normal);

    /* Print styles */
    @media print {
      background: none;
      border: solid var(--cs-border-width-s) var(--cs-color-surface-border);

      summary {
        list-style: none;
      }
    }
  }

  /* Appearance modifiers */
  :host([appearance='plain']) details {
    background-color: transparent;
    border-color: transparent;
    border-radius: 0;
  }

  :host([appearance='outlined']) details {
    background-color: var(--cs-color-surface-default);
    border-color: var(--cs-color-surface-border);
  }

  :host([appearance='filled']) details {
    background-color: var(--cs-color-neutral-fill-quiet);
    border-color: transparent;
  }

  :host([appearance='filled-outlined']) details {
    background-color: var(--cs-color-neutral-fill-quiet);
    border-color: var(--cs-color-neutral-border-quiet);
  }

  :host([disabled]) details {
    opacity: 0.5;
    cursor: not-allowed;
  }

  summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing);
    padding: var(--spacing); /* Add padding here */
    border-radius: calc(var(--cs-panel-border-radius) - var(--cs-panel-border-width));
    user-select: none;
    -webkit-user-select: none;
    cursor: pointer;

    &::marker,
    &::-webkit-details-marker {
      display: none;
    }

    &:focus {
      outline: none;
    }

    &:focus-visible {
      outline: var(--cs-focus-ring);
      outline-offset: calc(var(--cs-panel-border-width) + var(--cs-focus-ring-offset));
    }
  }

  :host([open]) summary {
    border-end-start-radius: 0;
    border-end-end-radius: 0;
  }

  /* 'Start' icon placement */
  :host([icon-placement='start']) summary {
    flex-direction: row-reverse;
    justify-content: start;
  }

  [part~='icon'] {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    color: var(--cs-color-text-quiet);
    transition: rotate var(--cs-transition-normal) var(--cs-transition-easing);
  }

  :host([open]) [part~='icon'] {
    rotate: 90deg;
  }

  :host([open]:dir(rtl)) [part~='icon'] {
    rotate: -90deg;
  }

  :host([open]) slot[name='expand-icon'],
  :host(:not([open])) slot[name='collapse-icon'] {
    display: none;
  }

  .body.animating {
    overflow: hidden;
  }

  .content {
    display: block;
    box-sizing: border-box; /* Ensure contents don't overflow */
    padding-block-start: var(--spacing);
    padding-inline: var(--spacing); /* Add horizontal padding */
    padding-block-end: var(--spacing); /* Add bottom padding */
  }
`;
