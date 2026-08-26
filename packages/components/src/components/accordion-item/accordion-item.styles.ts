import { css } from 'lit';

export default css`
  @layer cs-component {
    :host {
      --spacing: var(--cs-space-m);
      --show-duration: var(--cs-transition-normal);
      --hide-duration: var(--cs-transition-normal);
      --easing: var(--cs-transition-easing);

      display: block;
    }

    :host(:not(:first-child)) {
      border-top: var(--cs-panel-border-width) var(--cs-panel-border-style) var(--cs-color-surface-border);
    }

    :host([appearance='filled']) {
      background-color: var(--cs-color-neutral-fill-quiet);
    }

    :host([appearance='filled']:not(:first-child)) {
      margin-block-start: var(--cs-panel-border-width);
      border-top: none;
    }

    [part~='heading'] {
      margin: 0;
      font: inherit;
    }

    [part~='button'] {
      display: flex;
      align-items: center;
      gap: var(--spacing);
      padding: var(--spacing);
      width: 100%;
      background: none;
      border: none;
      cursor: pointer;
      text-align: start;
      color: var(--cs-color-text-normal);
      font: inherit;
      font-weight: var(--cs-font-weight-semibold);

      &:focus {
        outline: none;
      }

      &:focus-visible {
        outline: var(--cs-focus-ring);
        /* Inset by the full ring width + offset so the parent's overflow:hidden doesn't clip it */
        outline-offset: calc(0px - var(--cs-focus-ring-width) - var(--cs-focus-ring-offset));
      }
    }

    /* Icon at end (default) */
    :host([icon-placement='end']) [part~='button'] {
      justify-content: space-between;
    }

    /* Icon at start */
    :host([icon-placement='start']) [part~='button'] {
      flex-direction: row-reverse;
      justify-content: flex-end;
    }

    :host([disabled]) {
      opacity: 0.5;
      cursor: not-allowed;
    }

    :host([disabled]) [part~='button'] {
      cursor: not-allowed;
      pointer-events: none;
    }

    :host(:first-child) [part~='button'] {
      border-top-left-radius: var(--cs-panel-border-radius);
      border-top-right-radius: var(--cs-panel-border-radius);
    }

    :host(:last-child:not([expanded])) [part~='button'] {
      border-bottom-left-radius: var(--cs-panel-border-radius);
      border-bottom-right-radius: var(--cs-panel-border-radius);
    }

    [part~='icon'] {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      color: var(--cs-color-text-quiet);
      transition: rotate var(--hide-duration) var(--easing);
    }

    :host([expanded]) [part~='icon'] {
      rotate: 90deg;
      transition-duration: var(--show-duration);
    }

    :host([expanded]:dir(rtl)) [part~='icon'] {
      rotate: -90deg;
    }

    .body {
      overflow: hidden;
      color: var(--cs-color-text-quiet);
    }

    :host([expanded]) .body:not(.animating) {
      overflow: visible;
    }

    .content {
      display: block;
      padding: 0 var(--spacing) var(--spacing);
    }
  }
`;
