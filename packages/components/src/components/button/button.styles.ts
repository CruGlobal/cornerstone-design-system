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
    /* A horizontal button group sets 100% so every button fills its row; see button-group.styles.ts. */
    min-height: var(--_button-min-height, auto);
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

  /* Not on icon buttons: the icon is wider than the square's content box, so anything but center shifts it. */
  .button:not(.is-icon-button) {
    justify-content: var(--cs-button-justify-content, center);
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
   * Vertical orientation. An icon-only button has nothing to stack, so it keeps its square.
   */

  :host([orientation='vertical']) .button:not(.is-icon-button) {
    flex-direction: column;
    justify-content: center;
    /* A host stretched by a row is definite, so a group of stacked buttons shares one height. Elsewhere it is auto. */
    height: 100%;
    min-height: var(--cs-form-control-height);
    min-inline-size: var(--cs-form-control-height);
    padding-block: var(--cs-button-stacked-padding-block, var(--cs-form-control-padding-block));
    padding-inline: var(--cs-button-stacked-padding-inline, var(--cs-form-control-padding-inline));
    /* Resolved once here, since both the start margin and the end and caret margins below read it. */
    --_button-stacked-gap: var(--cs-button-stacked-gap, 0.25em);
    line-height: var(--cs-form-control-value-line-height);
    white-space: normal;
    text-align: center;
    overflow-wrap: anywhere;
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
  }

  /* The caret takes the place of an end icon, so it hides what end holds; a badge isn't an icon, so it stays in its
     corner. !important so a page's display on the element can't bring it back; see callout.styles.ts. */
  .button.caret slot[name='end']::slotted(:not(cs-badge)) {
    display: none !important;
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
      /* Hidden with opacity, not visibility, so the label stays in the accessibility tree */
      opacity: 0;

      /* Unlike visibility: hidden, opacity leaves the content clickable */
      pointer-events: none;
    }

    /* Hand-off: the spinner takes the button's text color, whatever a page sets for spinners. */
    cs-spinner {
      --cs-indicator-color: currentColor;
      --cs-track-color: color-mix(in oklab, currentColor, transparent 90%);

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

  /* Stacked, the spacing turns to the block axis; an inline margin left behind pushes the icon off center. */
  :host([orientation='vertical']) .button:not(.is-icon-button) slot[name='start']::slotted(*) {
    margin-inline-end: 0 !important;
    margin-block-end: var(--_button-stacked-gap) !important;
  }

  /* Not a badge: a block margin would move it down from the corner it pins to. */
  :host([orientation='vertical']) .button:not(.is-icon-button) slot[name='end']::slotted(:not(cs-badge)),
  :host([orientation='vertical']) .button:not(.is-icon-button) [part='caret'] {
    margin-inline-start: 0 !important;
    margin-block-start: var(--_button-stacked-gap) !important;
  }
`;
