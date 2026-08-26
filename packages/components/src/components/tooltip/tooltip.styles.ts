import { css } from 'lit';

export default css`
  :host {
    --max-width: 30ch;

    /** These styles are added so we don't interfere in the DOM. */
    display: inline-block;
    position: absolute;

    /** Defaults for inherited CSS properties */
    color: var(--cs-tooltip-content-color);
    font-size: var(--cs-tooltip-font-size);
    line-height: var(--cs-tooltip-line-height);
    text-align: start;
    white-space: normal;
  }

  .tooltip {
    --arrow-size: var(--cs-tooltip-arrow-size);
    --arrow-color: var(--cs-tooltip-background-color);
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
    max-width: var(--max-width);
    border-radius: var(--cs-tooltip-border-radius);
    background-color: var(--cs-tooltip-background-color);
    border: var(--cs-tooltip-border-width) var(--cs-tooltip-border-style) var(--cs-tooltip-border-color);
    padding: 0.25em 0.5em;
    user-select: none;
    -webkit-user-select: none;
  }

  .tooltip {
    --popup-border-width: var(--cs-tooltip-border-width);

    /* Inset box-shadow, not a border: Safari seams a clip-path edge that runs along a border. */
    &::part(arrow) {
      box-shadow: inset calc(-1 * var(--cs-tooltip-border-width)) calc(-1 * var(--cs-tooltip-border-width)) 0 0
        var(--cs-tooltip-border-color);
    }
  }
`;
