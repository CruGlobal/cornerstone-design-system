import { css } from 'lit';

export default css`
  :host {
    --arrow-size: 0.375rem;
    --max-width: 25rem;
    --show-duration: var(--cs-transition-fast);
    --hide-duration: var(--cs-transition-fast);

    display: contents;

    /** Defaults for inherited CSS properties */
    font-size: var(--cs-font-size-m);
    line-height: var(--cs-line-height-normal);
    text-align: start;
    white-space: normal;
  }

  /* The native dialog element */
  .dialog {
    display: none;
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    border: none;
    background: transparent;
    overflow: visible;
    pointer-events: none;

    &:focus {
      outline: none;
    }

    &[open] {
      display: block;
    }
  }

  /* The <cs-popup> element */
  .popover {
    --arrow-size: inherit;
    --popup-border-width: var(--cs-panel-border-width);
    --show-duration: inherit;
    --hide-duration: inherit;

    pointer-events: auto;

    /* Inset box-shadow, not a border: Safari seams a clip-path edge that runs along a border. */
    &::part(arrow) {
      background-color: var(--cs-color-surface-default);
      border: none;
      box-shadow: inset calc(-1 * var(--cs-panel-border-width)) calc(-1 * var(--cs-panel-border-width)) 0 0
        var(--cs-color-surface-border);
    }
  }

  .popover[placement^='top']::part(popup) {
    transform-origin: bottom;
  }

  .popover[placement^='bottom']::part(popup) {
    transform-origin: top;
  }

  .popover[placement^='left']::part(popup) {
    transform-origin: right;
  }

  .popover[placement^='right']::part(popup) {
    transform-origin: left;
  }

  /* Body */
  .body {
    display: flex;
    flex-direction: column;
    width: auto;
    max-width: min(var(--max-width), 100vw);
    padding: var(--cs-space-l);
    background-color: var(--cs-color-surface-default);
    border: var(--cs-panel-border-width) solid var(--cs-color-surface-border);
    border-radius: var(--cs-panel-border-radius);
    border-style: var(--cs-panel-border-style);
    box-shadow: var(--cs-shadow-l);
    color: var(--cs-color-text-normal);
    user-select: none;
    -webkit-user-select: none;
  }
`;
