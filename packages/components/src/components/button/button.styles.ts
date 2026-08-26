import { css } from 'lit';

export default css`
  @layer cs-component {
    :host {
      display: inline-block;

      /* Workaround because Chrome doesn't like :host(:has()) below
       * https://issues.chromium.org/issues/40062355
       * Firefox doesn't like this nested rule, so both are needed */
      &:has(cs-badge) {
        position: relative;
      }
    }

    /* Apply relative positioning only when needed to position cs-badge
     * This avoids creating a new stacking context for every button */
    :host(:has(cs-badge)) {
      position: relative;
    }
  }

  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    user-select: none;
    -webkit-user-select: none;
    white-space: nowrap;
    vertical-align: middle;
    transition-property: background, border, box-shadow, color, opacity, transform;
    transition-duration: var(--cs-transition-fast);
    transition-timing-function: var(--cs-transition-easing);
    transform-origin: center;
    cursor: pointer;
    padding: 0 var(--cs-form-control-padding-inline);
    font-family: inherit;
    font-size: inherit;
    font-weight: var(--cs-font-weight-action);
    height: var(--cs-form-control-height);
    width: 100%;

    background-color: var(--cs-color-fill-loud, var(--cs-color-neutral-fill-loud));

    border-color: transparent;
    color: var(--cs-color-on-loud, var(--cs-color-neutral-on-loud));
    border-start-start-radius: var(--_button-start-start-radius, var(--cs-form-control-border-radius));
    border-start-end-radius: var(--_button-start-end-radius, var(--cs-form-control-border-radius));
    border-end-start-radius: var(--_button-end-start-radius, var(--cs-form-control-border-radius));
    border-end-end-radius: var(--_button-end-end-radius, var(--cs-form-control-border-radius));
    border-style: var(--cs-form-control-border-style);
    border-width: var(--cs-form-control-border-width);
  }

  /* Hover and active transforms */
  .button:not(.disabled):not(.loading) {
    @media (hover: hover) {
      &:hover {
        transform: var(--cs-button-transform-hover);
      }
    }
    &:active {
      transform: var(--cs-button-transform-active);
    }

    @media (prefers-reduced-motion: reduce) {
      &:hover,
      &:active {
        transform: none;
      }
    }
  }

  /* Appearance modifiers */
  :host([appearance='plain']) {
    /* Indentation overrides for grouping */
    margin-inline-start: var(--_button-horizontal-indent);
    margin-block-start: var(--_button-vertical-indent);

    .button {
      color: var(--cs-color-on-quiet, var(--cs-color-neutral-on-quiet));
      background-color: transparent;
      border-color: transparent;
    }
    @media (hover: hover) {
      .button:not(.disabled):not(.loading):hover {
        color: var(--cs-color-on-quiet, var(--cs-color-neutral-on-quiet));
        background-color: var(--cs-color-fill-quiet, var(--cs-color-neutral-fill-quiet));
      }
    }
    .button:not(.disabled):not(.loading):active {
      color: var(--cs-color-on-quiet, var(--cs-color-neutral-on-quiet));
      background-color: color-mix(
        in oklab,
        var(--cs-color-fill-quiet, var(--cs-color-neutral-fill-quiet)),
        var(--cs-color-mix-active)
      );
    }
  }

  :host([appearance='outlined']) {
    /* Indentation overrides for grouping outlined */
    margin-inline-start: var(--_button-horizontal-indent-outlined);
    margin-block-start: var(--_button-vertical-indent-outlined);

    .button {
      color: var(--cs-color-on-quiet, var(--cs-color-neutral-on-quiet));
      background-color: transparent;
      border-color: var(--cs-color-border-loud, var(--cs-color-neutral-border-loud));
    }
    @media (hover: hover) {
      .button:not(.disabled):not(.loading):hover {
        color: var(--cs-color-on-quiet, var(--cs-color-neutral-on-quiet));
        background-color: var(--cs-color-fill-quiet, var(--cs-color-neutral-fill-quiet));
      }
    }
    .button:not(.disabled):not(.loading):active {
      color: var(--cs-color-on-quiet, var(--cs-color-neutral-on-quiet));
      background-color: color-mix(
        in oklab,
        var(--cs-color-fill-quiet, var(--cs-color-neutral-fill-quiet)),
        var(--cs-color-mix-active)
      );
    }
  }

  :host([appearance='filled']) {
    /* Indentation overrides for grouping */
    margin-inline-start: var(--_button-horizontal-indent);
    margin-block-start: var(--_button-vertical-indent);

    .button {
      color: var(--cs-color-on-normal, var(--cs-color-neutral-on-normal));
      background-color: var(--cs-color-fill-normal, var(--cs-color-neutral-fill-normal));
      border-color: transparent;
    }
    @media (hover: hover) {
      .button:not(.disabled):not(.loading):hover {
        color: var(--cs-color-on-normal, var(--cs-color-neutral-on-normal));
        background-color: color-mix(
          in oklab,
          var(--cs-color-fill-normal, var(--cs-color-neutral-fill-normal)),
          var(--cs-color-mix-hover)
        );
      }
    }
    .button:not(.disabled):not(.loading):active {
      color: var(--cs-color-on-normal, var(--cs-color-neutral-on-normal));
      background-color: color-mix(
        in oklab,
        var(--cs-color-fill-normal, var(--cs-color-neutral-fill-normal)),
        var(--cs-color-mix-active)
      );
    }
  }

  :host([appearance='filled-outlined']) {
    /* Indentation overrides for grouping outlined */
    margin-inline-start: var(--_button-horizontal-indent-outlined);
    margin-block-start: var(--_button-vertical-indent-outlined);

    .button {
      color: var(--cs-color-on-normal, var(--cs-color-neutral-on-normal));
      background-color: var(--cs-color-fill-normal, var(--cs-color-neutral-fill-normal));
      border-color: var(--cs-color-border-normal, var(--cs-color-neutral-border-normal));
    }
    @media (hover: hover) {
      .button:not(.disabled):not(.loading):hover {
        color: var(--cs-color-on-normal, var(--cs-color-neutral-on-normal));
        background-color: color-mix(
          in oklab,
          var(--cs-color-fill-normal, var(--cs-color-neutral-fill-normal)),
          var(--cs-color-mix-hover)
        );
      }
    }
    .button:not(.disabled):not(.loading):active {
      color: var(--cs-color-on-normal, var(--cs-color-neutral-on-normal));
      background-color: color-mix(
        in oklab,
        var(--cs-color-fill-normal, var(--cs-color-neutral-fill-normal)),
        var(--cs-color-mix-active)
      );
    }
  }

  :host([appearance='accent']) {
    /* Indentation overrides for grouping */
    margin-inline-start: var(--_button-horizontal-indent);
    margin-block-start: var(--_button-vertical-indent);

    .button {
      color: var(--cs-color-on-loud, var(--cs-color-neutral-on-loud));
      background-color: var(--cs-color-fill-loud, var(--cs-color-neutral-fill-loud));
      border-color: transparent;
    }
    @media (hover: hover) {
      .button:not(.disabled):not(.loading):hover {
        background-color: color-mix(
          in oklab,
          var(--cs-color-fill-loud, var(--cs-color-neutral-fill-loud)),
          var(--cs-color-mix-hover)
        );
      }
    }
    .button:not(.disabled):not(.loading):active {
      background-color: color-mix(
        in oklab,
        var(--cs-color-fill-loud, var(--cs-color-neutral-fill-loud)),
        var(--cs-color-mix-active)
      );
    }
  }

  /* Focus states */
  .button:focus {
    outline: none;
  }

  .button:focus-visible {
    outline: var(--cs-focus-ring);
    outline-offset: var(--cs-focus-ring-offset);
  }

  /* Disabled state */
  :host([disabled]) {
    opacity: 0.5;
    cursor: not-allowed;

    /* When disabled, prevent mouse events from bubbling up from children */
    .button {
      pointer-events: none;
    }
  }

  /* Keep it last so Safari doesn't stop parsing this block */
  .button::-moz-focus-inner {
    border: 0;
  }

  /* Icon buttons */
  .button.is-icon-button {
    outline-offset: 2px;
    width: var(--cs-form-control-height);
    aspect-ratio: 1;
  }

  /* Icon buttons with a caret need to grow to fit both the icon and the caret */
  .button.is-icon-button.caret {
    width: auto;
    aspect-ratio: auto;
    min-width: var(--cs-form-control-height);
  }

  /* Pill modifier */
  :host([pill]) .button {
    border-start-start-radius: var(--_button-start-start-radius, var(--cs-border-radius-pill));
    border-start-end-radius: var(--_button-start-end-radius, var(--cs-border-radius-pill));
    border-end-start-radius: var(--_button-end-start-radius, var(--cs-border-radius-pill));
    border-end-end-radius: var(--_button-end-end-radius, var(--cs-border-radius-pill));
  }

  /*
   * Label
   */

  .start,
  .end {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    pointer-events: none;
  }

  .label {
    display: inline-block;
  }

  .is-icon-button .label {
    display: flex;
    justify-content: center;
  }

  .label::slotted(cs-icon) {
    align-self: center;
  }

  /*
   * Caret modifier
   */

  cs-icon[part='caret'] {
    display: flex;
    align-self: center;
    align-items: center;

    &::part(svg) {
      width: 0.875em;
      height: 0.875em;
    }

    .button:has(&) .end {
      display: none;
    }
  }

  /*
   * Loading modifier
   */

  .loading {
    position: relative;
    cursor: wait;

    .start,
    .label,
    .end,
    .caret {
      visibility: hidden;
    }

    cs-spinner {
      --indicator-color: currentColor;
      --track-color: color-mix(in oklab, currentColor, transparent 90%);

      position: absolute;
      font-size: 1em;
      height: 1em;
      width: 1em;
      top: calc(50% - 0.5em);
      left: calc(50% - 0.5em);
    }
  }

  /*
   * Badges
   */

  .button ::slotted(cs-badge) {
    border-color: var(--cs-color-surface-default);
    position: absolute;
    inset-block-start: 0;
    inset-inline-end: 0;
    translate: 50% -50%;
    pointer-events: none;
  }

  :host(:dir(rtl)) ::slotted(cs-badge) {
    translate: -50% -50%;
  }

  /*
  * Button spacing
  */

  /* These are !important because a document-level universal margin reset would otherwise beat them:
     a slotted element belongs to the outer tree. See callout.styles.ts for the full note. */
  slot[name='start']::slotted(*) {
    margin-inline-end: 0.75em !important;
  }

  slot[name='end']::slotted(*),
  .button:not(.visually-hidden-label) [part='caret'] {
    margin-inline-start: 0.75em !important;
  }
`;
