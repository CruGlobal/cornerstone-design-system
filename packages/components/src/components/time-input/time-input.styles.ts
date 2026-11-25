import { css } from 'lit';

export default css`
  :host(:state(disabled)) {
    cursor: not-allowed;
  }

  /* Popup */
  .time-input-popup {
    flex: 1 1 auto;
    display: inline-flex;
    width: 100%;
    position: relative;
    vertical-align: middle;

    &::part(popup) {
      z-index: 900;
    }

    &[data-current-placement^='top']::part(popup) {
      transform-origin: bottom;
    }

    &[data-current-placement^='bottom']::part(popup) {
      transform-origin: top;
    }
  }

  /* The popup body's card, the input wrapper and the segments are shared with <cs-date-input> via
     segmentedFieldStyles. See segmented-field.styles.ts. */

  .columns {
    display: inline-flex;
    gap: var(--cs-space-2xs);
    align-items: stretch;
  }

  .column {
    display: flex;
    flex-direction: column;
    width: var(--cs-time-input-column-width, 3em);
    max-height: calc(var(--cs-time-input-column-item-height, 2.25em) * 7);
    overflow-y: auto;
    scroll-snap-type: y mandatory;
    scrollbar-width: none;
    /* Don't let column scroll bubble to the page. */
    overscroll-behavior: contain;
    outline: none;
    border-radius: var(--cs-border-radius-s);
  }

  .column::-webkit-scrollbar {
    display: none;
  }

  .column:focus-visible {
    outline: var(--cs-focus-ring-style) var(--cs-focus-ring-width) var(--cs-color-focus);
    outline-offset: 2px;
  }

  .column-item {
    flex: 0 0 var(--cs-time-input-column-item-height, 2.25em);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font: inherit;
    font-variant-numeric: tabular-nums;
    cursor: pointer;
    scroll-snap-align: center;
    border-radius: var(--cs-border-radius-s);
    color: var(--cs-color-text-normal);
    background: transparent;
    border: none;
    padding: 0;
    user-select: none;
    transition:
      background-color var(--cs-transition-fast),
      color var(--cs-transition-fast);
  }

  .column-item:hover:not([aria-disabled='true']):not([aria-selected='true']) {
    background-color: var(--cs-color-neutral-fill-quiet);
  }

  .column-item[aria-selected='true'] {
    background-color: var(--cs-color-brand-fill-loud);
    color: var(--cs-color-brand-on-loud);
  }

  .column-item[aria-disabled='true'] {
    color: var(--cs-color-text-quiet);
    cursor: not-allowed;
  }

  /* Footer / Now button */
  .popup-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--cs-space-xs);
    margin-top: var(--cs-space-xs);
    padding-top: var(--cs-space-xs);
    border-top: var(--cs-border-style) var(--cs-border-width-s) var(--cs-color-surface-border);
  }

  .now-button {
    appearance: none;
    background: transparent;
    border: var(--cs-border-style) var(--cs-border-width-s) var(--cs-color-surface-border);
    border-radius: var(--cs-border-radius-s);
    padding: var(--cs-space-2xs) var(--cs-space-s);
    font: inherit;
    color: inherit;
    cursor: pointer;
    transition: background-color var(--cs-transition-fast);
  }

  .now-button:hover {
    background-color: var(--cs-color-neutral-fill-quiet);
  }

  .now-button:focus-visible {
    outline: var(--cs-focus-ring-style) var(--cs-focus-ring-width) var(--cs-color-focus);
    outline-offset: 2px;
  }

  /* Trailing buttons (.clear-button, .expand-button), the .expand-icon box, and the start/end
     decoration slots are shared with <cs-date-input> via segmentedFieldStyles so both pickers
     stay on <cs-select>'s trailing optical axis. See segmented-field.styles.ts. */

  /* The popup's show and hide are cs-popup's own, which honors reduced motion itself. */
  @media (prefers-reduced-motion: reduce) {
    .column {
      scroll-behavior: auto;
    }
  }

  /* Visually hidden helper */
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`;
