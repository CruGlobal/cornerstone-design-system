import { css } from 'lit';

export default css`
  :host {
    --current-text-color: var(--cs-color-brand-on-loud);

    display: block;
    color: var(--cs-color-text-normal);
    -webkit-user-select: none;
    user-select: none;

    position: relative;
    display: flex;
    align-items: center;
    font: inherit;
    padding: 0.5em 1em 0.5em 0.25em;
    border-radius: var(--cs-border-radius-s);
    line-height: var(--cs-line-height-condensed);
    transition: var(--cs-transition-fast) background-color var(--cs-transition-easing);
    cursor: pointer;
  }

  :host(:focus) {
    outline: none;
  }

  @media (hover: hover) {
    :host(:not(:state(disabled), :state(current)):is(:state(hover), :hover)) {
      background-color: var(--cs-color-neutral-fill-normal);
      color: var(--cs-color-neutral-on-normal);
    }
  }

  :host(:state(current)),
  :host(:state(disabled):state(current)) {
    background-color: var(--cs-form-control-activated-color);
    color: var(--current-text-color);
    opacity: 1;
  }

  :host(:state(disabled)) {
    outline: none;
    opacity: 0.5;
    cursor: not-allowed;
  }

  .label {
    flex: 1 1 auto;
    display: inline-block;
  }

  .check {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--cs-font-size-smaller);
    visibility: hidden;
    width: 2em;
  }

  :host(:state(selected)) .check {
    visibility: visible;
  }

  .start,
  .end {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
  }

  /* These are !important because a document-level universal margin reset would otherwise beat them:
     a slotted element belongs to the outer tree. See callout.styles.ts for the full note. */
  .start::slotted(*) {
    margin-inline-end: 0.5em !important;
  }

  .end::slotted(*) {
    margin-inline-start: 0.5em !important;
  }

  @media (forced-colors: active) {
    :host(:hover:not([aria-disabled='true'])) {
      outline: dashed 1px SelectedItem;
      outline-offset: -1px;
    }
  }
`;
