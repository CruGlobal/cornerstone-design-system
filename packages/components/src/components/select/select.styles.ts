import { css } from 'lit';

export default css`
  :host {
    --tag-max-size: 10ch;
    --show-duration: var(--cs-transition-fast);
    --hide-duration: var(--cs-transition-fast);
  }

  /* Add ellipses to multi select options */
  :host cs-tag::part(content) {
    display: initial;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    max-width: var(--tag-max-size);
  }

  :host .disabled [part~='combobox'] {
    opacity: 0.5;
    cursor: not-allowed;
    outline: none;
  }

  :host .enabled:is(.open, :focus-within) [part~='combobox'] {
    outline-color: var(--cs-color-focus);
  }

  /** The popup */
  .select {
    flex: 1 1 auto;
    display: inline-flex;
    width: 100%;
    position: relative;
    vertical-align: middle;

    /* Pass through from select to the popup */
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

  /* Combobox */
  .combobox {
    flex: 1;
    display: flex;
    width: 100%;
    min-width: 0;
    align-items: center;
    justify-content: start;

    min-height: var(--cs-form-control-height);

    background-color: var(--cs-form-control-background-color);
    border-color: var(--cs-form-control-border-color);
    border-radius: var(--cs-form-control-border-radius);
    border-style: var(--cs-form-control-border-style);
    border-width: var(--cs-form-control-border-width);
    color: var(--cs-form-control-value-color);
    cursor: pointer;
    font-family: inherit;
    font-weight: var(--cs-form-control-value-font-weight);
    line-height: var(--cs-form-control-value-line-height);
    overflow: hidden;
    padding: 0 var(--cs-form-control-padding-inline);
    position: relative;
    vertical-align: middle;
    transition:
      background-color var(--cs-transition-normal),
      border-color var(--cs-transition-normal),
      outline-color var(--cs-transition-fast);
    transition-timing-function: var(--cs-transition-easing);
    outline: var(--cs-focus-ring-style) var(--cs-focus-ring-width) transparent;
    outline-offset: var(--cs-focus-ring-offset);

    /* Pills */
    :host([pill]) & {
      border-radius: var(--cs-border-radius-pill);
    }
  }

  /* Appearance modifiers */
  :host([appearance='outlined']) .combobox {
    background-color: var(--cs-form-control-background-color);
    border-color: var(--cs-form-control-border-color);
  }

  :host([appearance='filled']) .combobox {
    background-color: var(--cs-color-neutral-fill-quiet);
    border-color: var(--cs-color-neutral-fill-quiet);
  }

  :host([appearance='filled-outlined']) .combobox {
    background-color: var(--cs-color-neutral-fill-quiet);
    border-color: var(--cs-form-control-border-color);
  }

  .display-input {
    position: relative;
    width: 100%;
    font: inherit;
    border: none;
    background: none;
    line-height: var(--cs-form-control-value-line-height);
    color: var(--cs-form-control-value-color);
    cursor: inherit;
    overflow: hidden;
    padding: 0;
    margin: 0;
    -webkit-appearance: none;

    &:focus {
      outline: none;
    }

    &::placeholder {
      color: var(--cs-form-control-placeholder-color);
    }
  }

  /* Manage spacing when tags are present */
  :host([multiple]) {
    --_padding-with-tags: calc(var(--cs-form-control-height) * 0.1 - var(--cs-form-control-border-width));

    & .combobox:has(.tags cs-tag) {
      padding-block: var(--_padding-with-tags);
      padding-inline-start: var(--_padding-with-tags);
    }
  }

  /* Visually hide the display input when multiple is enabled */
  :host([multiple]) .combobox:has(.tags cs-tag) .display-input {
    position: absolute;
    z-index: -1;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
  }

  .value-input {
    position: absolute;
    z-index: -1;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    padding: 0;
    margin: 0;
  }

  .tags {
    display: flex;
    flex: 1;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.25em;

    /* These are !important because a document-level universal margin reset would otherwise beat them:
     a slotted element belongs to the outer tree. See callout.styles.ts for the full note. */
    &::slotted(cs-tag) {
      cursor: pointer !important;
    }

    .disabled &,
    .disabled &::slotted(cs-tag) {
      cursor: not-allowed !important;
    }
  }

  /* Start and End */

  .start,
  .end {
    flex: 0;
    display: inline-flex;
    align-items: center;
    color: var(--cs-color-neutral-on-quiet);
  }

  .end::slotted(*) {
    margin-inline-start: var(--cs-form-control-padding-inline) !important;
  }

  .start::slotted(*) {
    margin-inline-end: var(--cs-form-control-padding-inline) !important;
  }

  :host([multiple]) .combobox:has(.tags cs-tag) .start::slotted(*) {
    margin-inline-start: calc(var(--cs-form-control-padding-inline) - var(--_padding-with-tags)) !important;
  }

  /* Clear button */
  [part~='clear-button'] {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: inherit;
    color: var(--cs-color-neutral-on-quiet);
    border: none;
    background: none;
    padding: 0;
    transition: color var(--cs-transition-normal);
    cursor: pointer;
    margin-inline-start: var(--cs-form-control-padding-inline);

    &:focus {
      outline: none;
    }

    @media (hover: hover) {
      &:hover {
        color: color-mix(in oklab, currentColor, var(--cs-color-mix-hover));
      }
    }

    &:active {
      color: color-mix(in oklab, currentColor, var(--cs-color-mix-active));
    }
  }

  /* Expand icon */
  .expand-icon {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    color: var(--cs-color-neutral-on-quiet);
    transition: rotate var(--cs-transition-slow) var(--cs-transition-easing);
    rotate: 0deg;
    margin-inline-start: var(--cs-form-control-padding-inline);

    .open & {
      rotate: -180deg;
    }
  }

  /* Listbox */
  .listbox {
    display: block;
    position: relative;
    font: inherit;
    box-shadow: var(--cs-shadow-m);
    background: var(--cs-color-surface-raised);
    border-color: var(--cs-color-surface-border);
    border-radius: var(--cs-border-radius-m);
    border-style: var(--cs-border-style);
    border-width: var(--cs-border-width-s);
    padding: 0.25em;
    overflow: auto;
    overscroll-behavior: none;

    /* Make sure it adheres to the popup's auto size */
    max-width: var(--auto-size-available-width);
    max-height: var(--auto-size-available-height);

    &::slotted(cs-divider) {
      --spacing: 0.5em;
    }
  }

  /* Space options with half the listbox's padding */
  .listbox slot:not([name]) {
    display: flex;
    flex-direction: column;
    gap: 0.125em;
  }

  slot:not([name])::slotted(small) {
    display: block;
    font-size: var(--cs-font-size-smaller);
    font-weight: var(--cs-font-weight-semibold);
    color: var(--cs-color-text-quiet);
    padding-block: 0.5em;
    padding-inline: 2.25em;
  }
`;
