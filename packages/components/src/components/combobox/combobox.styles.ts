import { css } from 'lit';

export default css`
  @layer cs-component {
    /* Add ellipses to tags */
    :host cs-tag::part(content) {
      display: initial;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      max-width: var(--cs-combobox-tag-max-size, 10ch);
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
    .combobox-popup {
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
      cursor: text;
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

    /* Tags and the text field share one row, and wrap onto more as tags are added */
    .input-area {
      flex: 1 1 auto;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.25em;
      min-width: 0;
    }

    .display-input {
      flex: 1 1 4em;
      min-width: 4em;
      font: inherit;
      border: none;
      background: none;
      line-height: var(--cs-form-control-value-line-height);
      color: var(--cs-form-control-value-color);
      cursor: inherit;
      padding: 0;
      margin: 0;
      -webkit-appearance: none;

      &:focus {
        outline: none;
      }

      &::placeholder {
        color: var(--cs-form-control-placeholder-color);
      }

      .disabled & {
        cursor: not-allowed;
      }
    }

    /*
     * Manage spacing when tags are present. Load-bearing, and copied from cs-select: a tag is 0.8 of the control
     * height (tag.styles.ts), and this pads 0.1 above and below, so a row of tags is as tall as an empty field.
     */
    :host([multiple]) {
      --_padding-with-tags: calc(var(--cs-form-control-height) * 0.1 - var(--cs-form-control-border-width));

      & .combobox:has(.tags cs-tag) {
        padding-block: var(--_padding-with-tags);
        padding-inline-start: var(--_padding-with-tags);
      }
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.25em;
      max-width: 100%;
    }

    /* Start and End */
    .start,
    .end {
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      color: var(--cs-color-neutral-on-quiet);
    }

    /* These are !important because a document-level universal margin reset would otherwise beat them:
       a slotted element belongs to the outer tree. See callout.styles.ts for the full note. */
    slot[name='end']::slotted(*) {
      margin-inline-start: var(--cs-form-control-padding-inline) !important;
    }

    slot[name='start']::slotted(*) {
      margin-inline-end: var(--cs-form-control-padding-inline) !important;
    }

    :host([multiple]) .combobox:has(.tags cs-tag) slot[name='start']::slotted(*) {
      margin-inline-start: calc(var(--cs-form-control-padding-inline) - var(--_padding-with-tags)) !important;
    }

    /* Clear button */
    [part~='clear-button'] {
      flex: 0 0 auto;
      display: inline-flex;
      align-self: stretch;
      align-items: center;
      justify-content: center;
      min-inline-size: 1.5em;
      font-size: inherit;
      color: var(--cs-color-neutral-on-quiet);
      border: none;
      background: none;
      padding: 0;
      transition: color var(--cs-transition-normal);
      cursor: pointer;
      /* The box is wider than the glyph, so overhang half that growth on each side. Keeps the glyph
         on the same trailing axis as cs-select's and cs-input's clear buttons. */
      margin-inline-start: calc(var(--cs-form-control-padding-inline) - 0.125em);
      margin-inline-end: -0.125em;

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

    /* Tags pad the combobox on the block axis; reach over that padding so the column still clears edge to edge. */
    :host([multiple]) .combobox:has(.tags cs-tag) [part~='clear-button'] {
      margin-block: calc(-1 * var(--_padding-with-tags));
    }

    /* Loading spinner in the field */
    .spinner {
      flex: 0 0 auto;
      margin-inline-start: var(--cs-form-control-padding-inline);
    }

    /* Expand icon */
    .expand-icon {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      color: var(--cs-color-neutral-on-quiet);
      cursor: pointer;
      transition: rotate var(--cs-transition-slow) var(--cs-transition-easing);
      rotate: 0deg;
      margin-inline-start: var(--cs-form-control-padding-inline);

      .open & {
        rotate: -180deg;
      }

      .disabled & {
        cursor: not-allowed;
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
      max-width: var(--cs-popup-auto-size-available-width);
      max-height: var(--cs-popup-auto-size-available-height);
    }

    /* Space options with half the listbox's padding */
    .options {
      display: flex;
      flex-direction: column;
      gap: 0.125em;
    }

    /* Hand-off: the listbox sets its dividers' spacing, so a page-level value doesn't loosen it. */
    slot:not([name])::slotted(cs-divider) {
      --cs-divider-spacing: 0.5em;
    }

    slot:not([name])::slotted(small) {
      display: block;
      font-size: var(--cs-font-size-smaller);
      font-weight: var(--cs-font-weight-semibold);
      color: var(--cs-color-text-quiet);
      padding-block: 0.5em;
      padding-inline: 2.25em;
    }

    /*
     * Filtering hides group labels and dividers with the hidden attribute, but the browser's [hidden] rule loses to
     * any author display, the rule above included. random-content.styles.ts has the same note.
     */
    slot:not([name])::slotted([hidden]) {
      display: none !important;
    }

    /* A status row stands in for the options, padded like one so the text lines up with option labels. */
    .status {
      padding: 0.5em 1em 0.5em 2.25em;
      color: var(--cs-color-text-normal);
      line-height: var(--cs-line-height-condensed);
    }
  }
`;
