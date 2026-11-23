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

    /*
     * Start content. The slot draws no box, so slotted elements are flex items the host's gap spaces, and an empty
     * slot adds no gap. It sits at the text's size, which is what an icon draws at.
     */
    .start {
      font-size: var(--cs-font-size-smaller);
    }

    /*
     * Hand-off: an avatar is 1.75 times the text, about 0.7 of the tag's height. cs-avatar measures an em size against
     * its own font size, which it sets to 0.4 of that size, so the font size is set here first, at that same 0.4, and
     * the size is given against it. Both still hold if cs-avatar stops setting a font size on its host.
     */
    .start::slotted(cs-avatar) {
      font-size: calc(1.75em * 0.4);
      --cs-avatar-size: calc(1em / 0.4);
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
