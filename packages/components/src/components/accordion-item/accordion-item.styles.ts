import { css } from 'lit';

export default css`
  @layer cs-component {
    :host {
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
      gap: var(--cs-accordion-item-spacing, var(--cs-space-m));
      padding: var(--cs-accordion-item-spacing, var(--cs-space-m));
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
      transition: rotate var(--cs-hide-duration, var(--cs-transition-normal))
        var(--cs-accordion-item-easing, var(--cs-transition-easing));
    }

    :host([expanded]) [part~='icon'] {
      rotate: 90deg;
      transition-duration: var(--cs-show-duration, var(--cs-transition-normal));
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

    /* Reduced motion wins over any duration, including one a page sets for every component. The expanded rule names the host, so it is listed too. */
    @media (prefers-reduced-motion: reduce) {
      [part~='icon'],
      :host([expanded]) [part~='icon'] {
        transition-duration: 0ms;
      }
    }

    .content {
      display: block;
      padding: 0 var(--cs-accordion-item-spacing, var(--cs-space-m)) var(--cs-accordion-item-spacing, var(--cs-space-m));
    }
  }
`;
