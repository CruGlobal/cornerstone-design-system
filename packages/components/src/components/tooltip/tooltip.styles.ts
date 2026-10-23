import { css } from 'lit';

export default css`
  :host {
    /** These styles are added so we don't interfere in the DOM. */
    display: inline-block;
    position: absolute;

    /** Defaults for inherited CSS properties */
    color: var(--cs-tooltip-content-color, var(--cs-color-surface-default));
    font-size: var(--cs-tooltip-font-size, var(--cs-font-size-s));
    line-height: var(--cs-tooltip-line-height, var(--cs-line-height-normal));
    text-align: start;
    white-space: normal;
  }

  .tooltip {
    /* The border color defaults to the background, and the arrow shares both with the body, so each default is
       written once here. Prefixed because this element is a <cs-popup>, whose own tree inherits them. */
    --_tooltip-background-color: var(--cs-tooltip-background-color, var(--cs-color-text-normal));
    --_tooltip-border-color: var(--cs-tooltip-border-color, var(--_tooltip-background-color));
    --_tooltip-border-width: var(--cs-tooltip-border-width, var(--cs-border-width-s));

    /* Hand-off: the popup draws the arrow, so it takes the tooltip's values rather than its own defaults. */
    --cs-popup-arrow-size: var(--cs-tooltip-arrow-size, 0.375rem);
    --cs-popup-arrow-color: var(--_tooltip-background-color);
    --cs-popup-border-width: var(--_tooltip-border-width);
  }

  .tooltip::part(popup) {
    z-index: 1000;
  }

  .tooltip[placement^='top']::part(popup) {
    transform-origin: bottom;
  }

  .tooltip[placement^='bottom']::part(popup) {
    transform-origin: top;
  }

  .tooltip[placement^='left']::part(popup) {
    transform-origin: right;
  }

  .tooltip[placement^='right']::part(popup) {
    transform-origin: left;
  }

  .body {
    display: block;
    width: max-content;
    max-width: var(--cs-tooltip-max-width, 30ch);
    border-radius: var(--cs-tooltip-border-radius, var(--cs-border-radius-s));
    background-color: var(--_tooltip-background-color);
    border: var(--_tooltip-border-width) var(--cs-tooltip-border-style, var(--cs-border-style))
      var(--_tooltip-border-color);
    padding: 0.25em 0.5em;
    user-select: none;
    -webkit-user-select: none;
  }

  .tooltip {
    /* Inset box-shadow, not a border: Safari seams a clip-path edge that runs along a border. */
    &::part(arrow) {
      box-shadow: inset calc(-1 * var(--_tooltip-border-width)) calc(-1 * var(--_tooltip-border-width)) 0 0
        var(--_tooltip-border-color);
    }
  }
`;
