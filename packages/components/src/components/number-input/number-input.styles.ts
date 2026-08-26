import { css } from 'lit';

export default css`
  :host(:focus) {
    outline: none;
  }

  .number-field {
    display: flex;
    align-items: stretch;
    justify-content: start;
    position: relative;
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
    padding: 0;
    outline: var(--cs-focus-ring-style) var(--cs-focus-ring-width) transparent;
    outline-offset: var(--cs-focus-ring-offset);

    &:focus-within {
      outline-color: var(--cs-color-focus);
    }

    /* Style disabled inputs */
    &:has(input:disabled) {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }

  /* Appearance modifiers */
  :host([appearance='outlined']) {
    .number-field {
      background-color: var(--cs-form-control-background-color);
      border-color: var(--cs-form-control-border-color);
    }

    .stepper {
      color: var(--cs-color-neutral-on-quiet);

      @media (hover: hover) {
        &:hover:not(:disabled) {
          color: var(--cs-color-neutral-on-quiet);
          background-color: var(--cs-color-neutral-fill-quiet);
        }
      }

      &:active:not(:disabled) {
        color: color-mix(in oklab, var(--cs-color-neutral-on-quiet), var(--cs-color-mix-active));
        background-color: color-mix(in oklab, var(--cs-color-neutral-fill-quiet), var(--cs-color-mix-active));
      }
    }
  }

  :host([appearance='filled']) {
    .number-field {
      background-color: var(--cs-color-neutral-fill-quiet);
      border-color: var(--cs-color-neutral-fill-quiet);
    }

    .stepper {
      color: var(--cs-color-neutral-on-quiet);

      @media (hover: hover) {
        &:hover:not(:disabled) {
          color: var(--cs-color-neutral-on-normal);
          background-color: var(--cs-color-neutral-fill-normal);
        }
      }

      &:active:not(:disabled) {
        color: color-mix(in oklab, var(--cs-color-neutral-on-normal), var(--cs-color-mix-active));
        background-color: color-mix(in oklab, var(--cs-color-neutral-fill-normal), var(--cs-color-mix-active));
      }
    }
  }

  :host([appearance='filled-outlined']) {
    .number-field {
      background-color: var(--cs-color-neutral-fill-quiet);
      border-color: var(--cs-form-control-border-color);
    }

    .stepper {
      color: var(--cs-color-neutral-on-quiet);

      @media (hover: hover) {
        &:hover:not(:disabled) {
          color: var(--cs-color-neutral-on-normal);
          background-color: var(--cs-color-neutral-fill-normal);
        }
      }

      &:active:not(:disabled) {
        color: color-mix(in oklab, var(--cs-color-neutral-on-normal), var(--cs-color-mix-active));
        background-color: color-mix(in oklab, var(--cs-color-neutral-fill-normal), var(--cs-color-mix-active));
      }
    }
  }

  :host([pill]) {
    .number-field,
    .stepper {
      border-radius: var(--cs-border-radius-pill);
    }
  }

  .number-field {
    /* Show autofill styles over the entire number field, not just the native <input> */
    &:has(:autofill),
    &:has(:-webkit-autofill) {
      background-color: var(--cs-color-brand-fill-quiet) !important;
    }

    input {
      flex: auto;
      height: 100%;
      width: auto;
      min-width: 0;
      margin: 0;
      padding: 0 var(--cs-form-control-padding-inline);
      outline: none;
      box-shadow: none;
      border: none;
      background-color: transparent;
      font: inherit;
      transition: inherit;
      cursor: inherit;
      -webkit-appearance: none;

      /* Center-align and use tabular numbers for better alignment */
      text-align: center;
      font-variant-numeric: tabular-nums;

      /* Hide the number spinners in Firefox */
      -moz-appearance: textfield;

      /* Hide the number spinners in Chrome/Safari */
      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
        display: none;
      }

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

    &:focus {
      outline: none;
    }
  }

  .start,
  .end {
    display: inline-flex;
    flex: 1;
    align-items: center;
    cursor: default;

    &::slotted(cs-icon) {
      color: var(--cs-color-neutral-on-quiet);
    }
  }

  .start {
    justify-content: start;
    margin-inline-start: var(--cs-form-control-padding-inline);
  }

  .end {
    justify-content: end;
    margin-inline-end: var(--cs-form-control-padding-inline);
  }

  /*
   * Steppers - horizontal layout with minus on start, plus on end
   */

  .stepper {
    color: var(--cs-color-neutral-on-quiet);
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1 / 1;
    height: calc(100% - var(--cs-form-control-border-width) * 2);
    flex: 0 0 auto;
    border: none;
    border-radius: calc(var(--cs-form-control-border-radius) - var(--cs-form-control-border-width) * 2);
    background: transparent;
    cursor: pointer;
    margin: var(--cs-form-control-border-width);
    padding: 0;
    font-size: inherit;
    transition-property: background-color, color;
    transition-duration: var(--cs-transition-fast);
    transition-timing-function: var(--cs-transition-easing);

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:focus {
      outline: none;
    }
  }

  :host([without-steppers]) .stepper {
    display: none;
  }
`;
