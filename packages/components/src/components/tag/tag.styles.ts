import { css } from 'lit';

export default css`
  @layer cs-component {
    :host {
      display: inline-flex;
      gap: 0.5em;
      border-radius: var(--cs-border-radius-m);
      align-items: center;
      background-color: var(--cs-color-fill-quiet, var(--cs-color-neutral-fill-quiet));
      border-color: var(--cs-color-border-normal, var(--cs-color-neutral-border-normal));
      border-style: var(--cs-border-style);
      border-width: var(--cs-border-width-s);
      color: var(--cs-color-on-quiet, var(--cs-color-neutral-on-quiet));
      font-size: inherit;
      line-height: 1;
      white-space: nowrap;
      user-select: none;
      -webkit-user-select: none;
      height: calc(var(--cs-form-control-height) * 0.8);
      line-height: calc(var(--cs-form-control-height) - var(--cs-form-control-border-width) * 2);
      padding: 0 0.75em;
    }

    /* Appearance modifiers */
    :host([appearance='outlined']) {
      color: var(--cs-color-on-quiet, var(--cs-color-neutral-on-quiet));
      background-color: transparent;
      border-color: var(--cs-color-border-loud, var(--cs-color-neutral-border-loud));
    }

    :host([appearance='filled']) {
      color: var(--cs-color-on-quiet, var(--cs-color-neutral-on-quiet));
      background-color: var(--cs-color-fill-quiet, var(--cs-color-neutral-fill-quiet));
      border-color: transparent;
    }

    :host([appearance='filled-outlined']) {
      color: var(--cs-color-on-quiet, var(--cs-color-neutral-on-quiet));
      background-color: var(--cs-color-fill-quiet, var(--cs-color-neutral-fill-quiet));
      border-color: var(--cs-color-border-normal, var(--cs-color-neutral-border-normal));
    }

    :host([appearance='accent']) {
      color: var(--cs-color-on-loud, var(--cs-color-neutral-on-loud));
      background-color: var(--cs-color-fill-loud, var(--cs-color-neutral-fill-loud));
      border-color: transparent;
    }
  }

  .content {
    font-size: var(--cs-font-size-smaller);
  }

  [part='remove-button'] {
    line-height: 1;
  }

  [part='remove-button']::part(button) {
    padding: 0;
    height: 1em;
    width: 1em;
    color: currentColor;
  }

  @media (hover: hover) {
    :host(:hover) > [part='remove-button']::part(button) {
      background-color: transparent;
      color: color-mix(in oklab, currentColor, var(--cs-color-mix-hover));
    }
  }

  :host(:active) > [part='remove-button']::part(button) {
    background-color: transparent;
    color: color-mix(in oklab, currentColor, var(--cs-color-mix-active));
  }

  /*
   * Pill modifier
   */
  :host([pill]) {
    border-radius: var(--cs-border-radius-pill);
  }
`;
