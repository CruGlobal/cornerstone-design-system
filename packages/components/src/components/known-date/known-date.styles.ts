import { css } from 'lit';

export default css`
  :host {
    display: block;
    container-type: inline-size;
    container-name: known-date;
  }

  [part~='fieldset'],
  .fieldset {
    border: 0;
    padding: 0;
    margin: 0;
    min-inline-size: 0;
  }

  legend[part~='legend'] {
    padding: 0;
    display: block;
  }

  /* The legend's inner span carries the form-control-label part so the existing form-control styles
     (including the required asterisk) apply consistently across browsers. */
  .label {
    display: inline-block;
  }

  [part~='fields'] {
    display: flex;
    gap: var(--cs-space-xs);
    align-items: start;
    inline-size: 100%;
    min-inline-size: 0;
  }

  [part~='field'] {
    display: flex;
    flex-direction: column;
    flex: 1 1 0;
    min-inline-size: 0;
  }

  /* Day and month each hold two digits; year holds four. Bias the flex distribution so the year
     field gets roughly twice the share of the row but all three still grow and shrink together. */
  [part~='field-month'],
  [part~='field-day'] {
    min-inline-size: 2.5em;
  }

  [part~='field-year'] {
    flex-grow: 2;
    min-inline-size: 6em;
  }

  /* Per-field labels match the hint's typography and spacing exactly (the same 0.5em offset other
     form controls use between their input and hint) so the gap below each input reads as native. */
  [part~='field-label'] {
    color: var(--cs-form-control-hint-color);
    font-weight: var(--cs-form-control-hint-font-weight);
    line-height: var(--cs-form-control-hint-line-height);
    font-size: var(--cs-font-size-smaller);
    margin-block-start: 0.5em;
  }

  /* Each input is styled to match cs-input's .text-field wrapper directly — same border, height,
     padding, focus ring, and appearance variants. The host doesn't compose cs-input instances because
     we want three discrete native inputs (no clear/password slots, simpler DOM), but the visual contract
     is identical. */
  [part~='field-input'] {
    -webkit-appearance: none;
    appearance: none;
    box-sizing: border-box;
    height: var(--cs-form-control-height);
    inline-size: 100%;
    min-inline-size: 0;
    border-style: var(--cs-form-control-border-style);
    border-width: var(--cs-form-control-border-width);
    border-color: var(--cs-form-control-border-color);
    border-radius: var(--cs-form-control-border-radius);
    background-color: var(--cs-form-control-background-color);
    color: var(--cs-form-control-value-color);
    font-family: inherit;
    font-size: inherit;
    font-weight: var(--cs-form-control-value-font-weight);
    line-height: var(--cs-form-control-value-line-height);
    padding: 0 var(--cs-form-control-padding-inline);
    outline: var(--cs-focus-ring-style) var(--cs-focus-ring-width) transparent;
    outline-offset: var(--cs-focus-ring-offset);
    transition:
      background-color var(--cs-transition-normal),
      border-color var(--cs-transition-normal),
      outline-color var(--cs-transition-fast);
    transition-timing-function: var(--cs-transition-easing);
  }

  [part~='field-input']:focus {
    outline-color: var(--cs-color-focus);
  }

  /* When the fields row gets too narrow to comfortably hold three side-by-side inputs, stack them
     vertically. The threshold reflects the smallest width at which all three inputs still fit a
     four-digit year plus padding without truncation. */
  @container known-date (inline-size < 300px) {
    [part~='fields'] {
      flex-direction: column;
      align-items: stretch;
    }
  }

  /* Suppress the native number spin buttons so a paste that briefly looks like a number can't show them. */
  [part~='field-input']::-webkit-outer-spin-button,
  [part~='field-input']::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Hide the mirror used for native form-data + constraint validation. */
  .value-input {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    opacity: 0;
    pointer-events: none;
    border: 0;
    padding: 0;
    margin: 0;
    clip: rect(0 0 0 0);
    overflow: hidden;
  }

  /* Appearances — mirror cs-input's .text-field appearance variants exactly. */
  :host([appearance='outlined']) [part~='field-input'] {
    background-color: var(--cs-form-control-background-color);
    border-color: var(--cs-form-control-border-color);
  }

  :host([appearance='filled']) [part~='field-input'] {
    background-color: var(--cs-color-neutral-fill-quiet);
    border-color: var(--cs-color-neutral-fill-quiet);
  }

  :host([appearance='filled-outlined']) [part~='field-input'] {
    background-color: var(--cs-color-neutral-fill-quiet);
    border-color: var(--cs-form-control-border-color);
  }

  :host([pill]) [part~='field-input'] {
    border-radius: var(--cs-border-radius-pill) !important;
  }

  /* Disabled — mirror cs-input's :has(:disabled) opacity treatment. */
  :host(:state(disabled)) [part~='field'],
  [part~='field-input']:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;
