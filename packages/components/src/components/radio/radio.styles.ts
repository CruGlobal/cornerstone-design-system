import { css } from 'lit';

export default css`
  :host {
    --checked-icon-color: var(--cs-form-control-activated-color);
    --checked-icon-scale: 0.7;

    color: var(--cs-form-control-value-color);
    display: inline-flex;
    flex-direction: row;
    align-items: top;
    font-family: inherit;
    font-weight: var(--cs-form-control-value-font-weight);
    line-height: var(--cs-form-control-value-line-height);
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
  }

  :host(:focus) {
    outline: none;
  }

  /* When the control isn't checked, hide the circle for Windows High Contrast mode a11y */
  :host(:not(:state(checked))) svg circle {
    opacity: 0;
  }

  [part~='label'] {
    display: inline;
  }

  [part~='hint'] {
    margin-block-start: 0.5em;
  }

  /* Default spacing for default appearance radios */
  :host(:not([appearance='button'])) {
    margin-block: 0.375em; /* Half of the original 0.75em gap on each side */
  }

  :host(:not([appearance='button'])[data-cs-radio-horizontal]) {
    margin-block: 0;
    margin-inline: 0.5em; /* Half of the original 1em gap on each side */
  }

  /* Remove margin from first/last items to prevent extra space */
  :host(:not([appearance='button'])[data-cs-radio-first]) {
    margin-block-start: 0;
    margin-inline-start: 0;
  }

  :host(:not([appearance='button'])[data-cs-radio-last]) {
    margin-block-end: 0;
    margin-inline-end: 0;
  }

  /* Button appearance have no spacing, they get handled by the overlap margins below */
  :host([appearance='button']) {
    margin: 0;
    align-items: center;
    min-height: var(--cs-form-control-height);
    background-color: var(--cs-color-surface-default);
    border: var(--cs-form-control-border-width) var(--cs-form-control-border-style) var(--cs-form-control-border-color);
    border-radius: var(--cs-border-radius-m);
    padding: 0 var(--cs-form-control-padding-inline);
    transition:
      background-color var(--cs-transition-fast),
      border-color var(--cs-transition-fast);
  }

  /* Default appearance */
  :host(:not([appearance='button'])) {
    .control {
      flex: 0 0 auto;
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--cs-form-control-toggle-size);
      height: var(--cs-form-control-toggle-size);
      border-color: var(--cs-form-control-border-color);
      border-radius: 50%;
      border-style: var(--cs-form-control-border-style);
      border-width: var(--cs-form-control-border-width);
      background-color: var(--cs-form-control-background-color);
      color: transparent;
      transition:
        background var(--cs-transition-normal),
        border-color var(--cs-transition-fast),
        box-shadow var(--cs-transition-fast),
        color var(--cs-transition-fast);
      transition-timing-function: var(--cs-transition-easing);

      margin-inline-end: 0.5em;
    }

    .checked-icon {
      display: flex;
      fill: currentColor;
      width: var(--cs-form-control-toggle-size);
      height: var(--cs-form-control-toggle-size);
      scale: var(--checked-icon-scale);
    }
  }

  /* Button appearance */
  :host([appearance='button']) {
    .control {
      display: none;
    }
  }

  /* Checked */
  :host(:state(checked)) .control {
    color: var(--checked-icon-color);
    border-color: var(--cs-form-control-activated-color);
    background-color: var(--cs-form-control-background-color);
  }

  /* Focus */
  :host(:focus-visible) .control {
    outline: var(--cs-focus-ring);
    outline-offset: var(--cs-focus-ring-offset);
  }

  /* Disabled */
  :host(:state(disabled)) {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Horizontal grouping - remove inner border radius */
  :host([appearance='button'][data-cs-radio-horizontal][data-cs-radio-inner]) {
    border-radius: 0;
  }

  :host([appearance='button'][data-cs-radio-horizontal][data-cs-radio-first]) {
    border-start-end-radius: 0;
    border-end-end-radius: 0;
  }

  :host([appearance='button'][data-cs-radio-horizontal][data-cs-radio-last]) {
    border-start-start-radius: 0;
    border-end-start-radius: 0;
  }

  /* Vertical grouping - remove inner border radius */
  :host([appearance='button'][data-cs-radio-vertical][data-cs-radio-inner]) {
    border-radius: 0;
  }

  :host([appearance='button'][data-cs-radio-vertical][data-cs-radio-first]) {
    border-end-start-radius: 0;
    border-end-end-radius: 0;
  }

  :host([appearance='button'][data-cs-radio-vertical][data-cs-radio-last]) {
    border-start-start-radius: 0;
    border-start-end-radius: 0;
  }

  @media (hover: hover) {
    :host([appearance='button']:hover:not(:state(disabled), :state(checked))) {
      background-color: color-mix(in srgb, var(--cs-color-surface-default) 95%, var(--cs-color-mix-hover));
    }
  }

  :host([appearance='button']:focus-visible) {
    outline: var(--cs-focus-ring);
    outline-offset: var(--cs-focus-ring-offset);
  }

  :host([appearance='button']:state(checked)) {
    border-color: var(--cs-form-control-activated-color);
    background-color: var(--cs-color-brand-fill-quiet);
  }

  :host([appearance='button']:state(checked):focus-visible) {
    outline: var(--cs-focus-ring);
    outline-offset: var(--cs-focus-ring-offset);
  }

  /* Button overlap margins */
  :host([appearance='button'][data-cs-radio-horizontal]:not([data-cs-radio-first])) {
    margin-inline-start: calc(-1 * var(--cs-form-control-border-width));
  }

  :host([appearance='button'][data-cs-radio-vertical]:not([data-cs-radio-first])) {
    margin-block-start: calc(-1 * var(--cs-form-control-border-width));
  }

  /* Ensure interactive states are visible above adjacent buttons */
  :host([appearance='button']:hover),
  :host([appearance='button']:state(checked)) {
    position: relative;
    z-index: 1;
  }

  :host([appearance='button']:focus-visible) {
    z-index: 2;
  }
`;
