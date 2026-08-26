import { css } from 'lit';

export default css`
  :host {
    --show-duration: var(--cs-transition-fast);
    --hide-duration: var(--cs-transition-fast);
    --column-item-height: 2.25em;
    --column-width: 3em;
  }

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
    --show-duration: inherit;
    --hide-duration: inherit;

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

  /* Popup body — bordered card with the column listboxes. */
  .popup-body {
    display: inline-flex;
    flex-direction: column;
    background-color: var(--cs-color-surface-raised);
    border: var(--cs-border-style) var(--cs-border-width-s) var(--cs-color-surface-border);
    border-radius: var(--cs-border-radius-m);
    box-shadow: var(--cs-shadow-m);
    color: var(--cs-color-text-normal);
    font-size: inherit;
    padding: var(--cs-space-2xs);
  }

  .columns {
    display: inline-flex;
    gap: var(--cs-space-2xs);
    align-items: stretch;
  }

  .column {
    display: flex;
    flex-direction: column;
    width: var(--column-width);
    max-height: calc(var(--column-item-height) * 7);
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
    flex: 0 0 var(--column-item-height);
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

  /* Input wrapper */
  .input-wrapper {
    flex: 1;
    display: flex;
    width: 100%;
    min-width: 0;
    align-items: center;
    min-height: var(--cs-form-control-height);
    background-color: var(--cs-form-control-background-color);
    border-color: var(--cs-form-control-border-color);
    border-radius: var(--cs-form-control-border-radius);
    border-style: var(--cs-form-control-border-style);
    border-width: var(--cs-form-control-border-width);
    color: var(--cs-form-control-value-color);
    cursor: text;
    font-family: inherit;
    font-weight: var(--cs-form-control-value-font-weight);
    line-height: var(--cs-form-control-value-line-height);
    padding: 0 var(--cs-form-control-padding-inline);
    transition:
      background-color var(--cs-transition-normal),
      border-color var(--cs-transition-normal),
      outline-color var(--cs-transition-fast);
    transition-timing-function: var(--cs-transition-easing);
    outline: var(--cs-focus-ring-style) var(--cs-focus-ring-width) transparent;
    outline-offset: var(--cs-focus-ring-offset);
  }

  :host([pill]) .input-wrapper {
    border-radius: var(--cs-border-radius-pill);
  }

  :host(:focus-within) .input-wrapper {
    outline-color: var(--cs-color-focus);
  }

  :host(:state(disabled)) .input-wrapper {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Appearance variants */
  :host([appearance='filled']) .input-wrapper,
  :host([appearance='filled-outlined']) .input-wrapper {
    background-color: var(--cs-color-surface-lowered);
  }

  :host([appearance='filled']) .input-wrapper {
    border-color: transparent;
  }

  /* Segmented input — same patterns as cs-date-input. */
  .segments {
    flex: 1;
    min-width: 0;
    display: inline-flex;
    align-items: center;
    flex-wrap: nowrap;
    color: inherit;
    font: inherit;
    font-variant-numeric: tabular-nums;
    caret-color: transparent;
  }

  .segment {
    display: inline-block;
    padding: 0 0.15em;
    margin: 0;
    background: transparent;
    border: none;
    outline: none;
    color: inherit;
    font: inherit;
    text-align: center;
    cursor: text;
    user-select: none;
    white-space: nowrap;
    border-radius: var(--cs-border-radius-s);
    transition:
      background-color var(--cs-transition-fast),
      color var(--cs-transition-fast);
  }

  .segment.empty {
    color: var(--cs-color-text-quiet);
  }

  /* Focus style — applies to keyboard *and* pointer focus so a click always shows the selection. Soft brand fill
     reads as "selected" without competing with the popup's loud selected items. */
  .segment:focus {
    background-color: var(--cs-color-brand-fill-quiet);
    color: var(--cs-color-brand-on-quiet);
    outline: none;
  }

  .segment.empty:focus {
    color: var(--cs-color-brand-on-quiet);
  }

  .segment-literal {
    display: inline-block;
    color: var(--cs-color-text-quiet);
    white-space: pre;
    user-select: none;
  }

  :host([disabled]) .segment,
  :host([readonly]) .segment {
    cursor: inherit;
  }

  /* Hidden form-value input (anchored under the wrapper for native validity tooltips). */
  .value-input {
    position: absolute;
    inset-inline-start: var(--cs-form-control-padding-inline);
    inset-block-start: 50%;
    transform: translateY(-50%);
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
    border: none;
    padding: 0;
    margin: 0;
  }

  /* Trailing buttons (.clear-button, .expand-button), the .expand-icon box, and the start/end
     decoration slots are shared with <cs-date-input> via segmentedFieldStyles so both pickers
     stay on <cs-select>'s trailing optical axis. See segmented-field.styles.ts. */

  /* Animations */
  .time-input-popup::part(popup).show {
    animation: cs-time-input-show var(--show-duration) var(--cs-transition-easing);
  }

  .time-input-popup::part(popup).hide {
    animation: cs-time-input-hide var(--hide-duration) var(--cs-transition-easing);
  }

  @keyframes cs-time-input-show {
    from {
      opacity: 0;
      transform: scale(0.97);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes cs-time-input-hide {
    from {
      opacity: 1;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(0.97);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    :host {
      --show-duration: 0ms;
      --hide-duration: 0ms;
    }
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
