import { css } from 'lit';

export default css`
  :host {
    --checked-icon-color: var(--cs-color-brand-on-loud);
    --checked-icon-scale: 0.8;

    display: inline-flex;
    color: var(--cs-form-control-value-color);
    font-family: inherit;
    font-weight: var(--cs-form-control-value-font-weight);
    line-height: var(--cs-form-control-value-line-height);
    user-select: none;
    -webkit-user-select: none;
  }

  [part~='control'] {
    display: inline-flex;
    flex: 0 0 auto;
    position: relative;
    align-items: center;
    justify-content: center;
    width: var(--cs-form-control-toggle-size);
    height: var(--cs-form-control-toggle-size);
    border-color: var(--cs-form-control-border-color);
    border-radius: min(
      calc(var(--cs-form-control-toggle-size) * 0.375),
      var(--cs-border-radius-s)
    ); /* min prevents entirely circular checkbox */
    border-style: var(--cs-border-style);
    border-width: var(--cs-form-control-border-width);
    background-color: var(--cs-form-control-background-color);
    transition:
      background var(--cs-transition-normal),
      border-color var(--cs-transition-fast),
      box-shadow var(--cs-transition-fast),
      color var(--cs-transition-fast);
    transition-timing-function: var(--cs-transition-easing);

    margin-inline-end: 0.5em;
  }

  [part~='checkbox'] {
    display: flex;
    align-items: flex-start;
    position: relative;
    color: currentColor;
    vertical-align: middle;
    cursor: pointer;
  }

  [part~='label'] {
    display: inline;
  }

  /* Checked */
  [part~='control']:has(:checked, :indeterminate) {
    color: var(--checked-icon-color);
    border-color: var(--cs-form-control-activated-color);
    background-color: var(--cs-form-control-activated-color);
  }

  /* Focus */
  [part~='control']:has(> input:focus-visible:not(:disabled)) {
    outline: var(--cs-focus-ring);
    outline-offset: var(--cs-focus-ring-offset);
  }

  /* Disabled */
  :host [part~='checkbox']:has(input:disabled) {
    opacity: 0.5;
    cursor: not-allowed;
  }

  input {
    position: absolute;
    padding: 0;
    margin: 0;
    height: 100%;
    width: 100%;
    opacity: 0;
    pointer-events: none;
  }

  [part~='icon'] {
    display: flex;
    scale: var(--checked-icon-scale);

    /* Without this, Safari renders the icon slightly to the left */
    &::part(svg) {
      translate: 0.0009765625em;
    }

    input:not(:checked, :indeterminate) + & {
      visibility: hidden;
    }
  }

  :host([required]) [part~='label']::after {
    content: var(--cs-form-control-required-content);
    color: var(--cs-form-control-required-content-color);
    margin-inline-start: var(--cs-form-control-required-content-offset);
  }
`;
