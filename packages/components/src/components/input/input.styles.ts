import { css } from 'lit';

export default css`
  :host {
    border-width: 0;
  }

  :host(:focus) {
    outline: none;
  }

  .text-field {
    display: flex;
    align-items: stretch;
    justify-content: start;
    position: relative;
    transition: inherit;
    height: var(--cs-form-control-height);
    border-color: var(--cs-form-control-border-color);
    border-radius: var(--cs-form-control-border-radius);
    border-style: var(--cs-form-control-border-style);
    border-width: var(--cs-form-control-border-width);
    cursor: text;
    color: var(--cs-form-control-value-color);
    font-size: inherit;
    font-family: inherit;
    font-weight: var(--cs-form-control-value-font-weight);
    line-height: var(--cs-form-control-value-line-height);
    vertical-align: middle;
    width: 100%;
    transition:
      background-color var(--cs-transition-normal),
      border-color var(--cs-transition-normal),
      outline-color var(--cs-transition-fast);
    transition-timing-function: var(--cs-transition-easing);
    background-color: var(--cs-form-control-background-color);
    box-shadow: var(--box-shadow);
    padding: 0 var(--cs-form-control-padding-inline);
    outline: var(--cs-focus-ring-style) var(--cs-focus-ring-width) transparent;
    outline-offset: var(--cs-focus-ring-offset);

    &:focus-within {
      outline-color: var(--cs-color-focus);
    }

    /* Style disabled inputs */
    &:has(:disabled) {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }

  /* Appearance modifiers */
  :host([appearance='outlined']) .text-field {
    background-color: var(--cs-form-control-background-color);
    border-color: var(--cs-form-control-border-color);
  }

  :host([appearance='filled']) .text-field {
    background-color: var(--cs-color-neutral-fill-quiet);
    border-color: var(--cs-color-neutral-fill-quiet);
  }

  :host([appearance='filled-outlined']) .text-field {
    background-color: var(--cs-color-neutral-fill-quiet);
    border-color: var(--cs-form-control-border-color);
  }

  :host([pill]) .text-field {
    border-radius: var(--cs-border-radius-pill) !important;
  }

  .text-field {
    /* Show autofill styles over the entire text field, not just the native <input> */
    &:has(:autofill),
    &:has(:-webkit-autofill) {
      background-color: var(--cs-color-brand-fill-quiet) !important;
    }

    input,
    textarea {
      /*
      Fixes an alignment issue with placeholders.
      https://github.com/shoelace-style/webawesome/issues/342
    */
      height: 100%;

      padding: 0;
      border: none;
      outline: none;
      box-shadow: none;
      margin: 0;
      cursor: inherit;
      -webkit-appearance: none;
      font: inherit;

      /* Turn off Safari's autofill styles */
      &:-webkit-autofill,
      &:-webkit-autofill:hover,
      &:-webkit-autofill:focus,
      &:-webkit-autofill:active {
        -webkit-background-clip: text;
        background-color: transparent;
        -webkit-text-fill-color: inherit;
      }
    }
  }

  input {
    flex: 1 1 auto;
    min-width: 0;
    height: 100%;
    transition: inherit;

    /* prettier-ignore */
    background-color: rgb(118 118 118 / 0); /* ensures proper placeholder styles in webkit's date input */
    height: calc(var(--cs-form-control-height) - var(--border-width) * 2);
    padding-block: 0;
    color: inherit;

    &:autofill {
      &,
      &:hover,
      &:focus,
      &:active {
        box-shadow: none;
        caret-color: var(--cs-form-control-value-color);
      }
    }

    &::placeholder {
      color: var(--cs-form-control-placeholder-color);
      user-select: none;
      -webkit-user-select: none;
    }

    &::-webkit-search-decoration,
    &::-webkit-search-cancel-button,
    &::-webkit-search-results-button,
    &::-webkit-search-results-decoration {
      -webkit-appearance: none;
    }

    &:focus {
      outline: none;
    }
  }

  textarea {
    &:autofill {
      &,
      &:hover,
      &:focus,
      &:active {
        box-shadow: none;
        caret-color: var(--cs-form-control-value-color);
      }
    }

    &::placeholder {
      color: var(--cs-form-control-placeholder-color);
      user-select: none;
      -webkit-user-select: none;
    }
  }

  .start,
  .end {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    cursor: default;

    &::slotted(cs-icon) {
      color: var(--cs-color-neutral-on-quiet);
    }
  }

  /* These are !important because a document-level universal margin reset would otherwise beat them:
     a slotted element belongs to the outer tree. See callout.styles.ts for the full note. */
  .start::slotted(*) {
    margin-inline-end: var(--cs-form-control-padding-inline) !important;
  }

  .end::slotted(*) {
    margin-inline-start: var(--cs-form-control-padding-inline) !important;
  }

  /*
   * Clearable + Password Toggle
   */

  .clear,
  .password-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: inherit;
    color: var(--cs-color-neutral-on-quiet);
    border: none;
    background: none;
    padding: 0;
    transition: var(--cs-transition-normal) color;
    cursor: pointer;
    margin-inline-start: var(--cs-form-control-padding-inline);

    @media (hover: hover) {
      &:hover {
        color: color-mix(in oklab, currentColor, var(--cs-color-mix-hover));
      }
    }

    &:active {
      color: color-mix(in oklab, currentColor, var(--cs-color-mix-active));
    }

    &:focus {
      outline: none;
    }
  }

  /* Don't show the browser's password toggle in Edge */
  ::-ms-reveal {
    display: none;
  }

  /* Hide the built-in number spinner */
  :host([without-spin-buttons]) input[type='number'] {
    -moz-appearance: textfield;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      display: none;
    }
  }
`;
