import { css } from 'lit';

export default css`
  :host {
    /*
     * These properties are computed to account for the arrow's dimensions after being rotated 45º. The constant
     * 0.7071 is derived from sin(45) to calculate the length of the arrow after rotation.
     *
     * The diamond will be translated inward by --_arrow-base-offset, the border thickness, to centralise it on
     * the inner edge of the popup border. This also means we need to increase the size of the arrow by the
     * same amount to compensate.
     *
     * A diamond shaped clipping mask is used to avoid overlap of popup content. This extends slightly inward so
     * the popup border is covered with no sub-pixel rounding artifacts. The diamond corners are mitred at 22.5º
     * to properly merge any arrow border with the popup border. The constant 1.4142 is derived from 1 + tan(22.5).
     *
     * Each reads a public property with its default, so nothing here stops a value set on an ancestor.
     */
    --_arrow-size: var(--cs-popup-arrow-size, 0.375rem);
    --_arrow-base-offset: var(--cs-popup-border-width, 0px);
    --_arrow-size-diagonal: calc((var(--_arrow-size) + var(--_arrow-base-offset)) * 0.7071);
    --_arrow-padding-offset: calc(var(--_arrow-size-diagonal) - var(--_arrow-size));
    --_arrow-size-div: calc(var(--_arrow-size-diagonal) * 2);
    --_arrow-clipping-corner: calc(var(--_arrow-base-offset) * 1.4142);

    display: contents;
  }

  .popup {
    position: absolute;
    isolation: isolate;
    max-width: var(--cs-popup-auto-size-available-width, none);
    max-height: var(--cs-popup-auto-size-available-height, none);

    /* Clear UA styles for [popover] */
    :where(&) {
      inset: unset;
      padding: unset;
      margin: unset;
      width: unset;
      height: unset;
      color: unset;
      background: unset;
      border: unset;
      overflow: unset;
    }
  }

  .popup-fixed {
    position: fixed;
  }

  .popup:not(.popup-active) {
    display: none;
  }

  .arrow {
    position: absolute;
    width: var(--_arrow-size-div);
    height: var(--_arrow-size-div);
    background: var(--cs-popup-arrow-color, black);
    z-index: 3;
    clip-path: polygon(
      var(--_arrow-clipping-corner) 100%,
      var(--_arrow-base-offset) calc(100% - var(--_arrow-base-offset)),
      calc(var(--_arrow-base-offset) - 2px) calc(100% - var(--_arrow-base-offset)),
      calc(100% - var(--_arrow-base-offset)) calc(var(--_arrow-base-offset) - 2px),
      calc(100% - var(--_arrow-base-offset)) var(--_arrow-base-offset),
      100% var(--_arrow-clipping-corner),
      100% 100%
    );
    rotate: 45deg;
  }

  :host([data-current-placement|='left']) .arrow {
    rotate: -45deg;
  }

  :host([data-current-placement|='right']) .arrow {
    rotate: 135deg;
  }

  :host([data-current-placement|='bottom']) .arrow {
    rotate: 225deg;
  }

  /* Hover bridge */
  .popup-hover-bridge:not(.popup-hover-bridge-visible) {
    display: none;
  }

  .popup-hover-bridge {
    position: fixed;
    z-index: 899;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    clip-path: polygon(
      var(--_hover-bridge-top-left-x, 0) var(--_hover-bridge-top-left-y, 0),
      var(--_hover-bridge-top-right-x, 0) var(--_hover-bridge-top-right-y, 0),
      var(--_hover-bridge-bottom-right-x, 0) var(--_hover-bridge-bottom-right-y, 0),
      var(--_hover-bridge-bottom-left-x, 0) var(--_hover-bridge-bottom-left-y, 0)
    );
  }

  /* Built-in animations */
  .show {
    animation: show var(--cs-show-duration, var(--cs-transition-fast)) ease;
  }

  .hide {
    animation: show var(--cs-hide-duration, var(--cs-transition-fast)) ease reverse;
  }

  @keyframes show {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .show-with-scale {
    animation: show-with-scale var(--cs-show-duration, var(--cs-transition-fast)) ease;
  }

  .hide-with-scale {
    animation: show-with-scale var(--cs-hide-duration, var(--cs-transition-fast)) ease reverse;
  }

  @keyframes show-with-scale {
    from {
      opacity: 0;
      scale: 0.8;
    }
    to {
      opacity: 1;
      scale: 1;
    }
  }

  /* Reduced motion wins over any duration, including one a page sets for every component. Time input, tooltip, select, color picker and popover all animate with these classes. */
  @media (prefers-reduced-motion: reduce) {
    .show,
    .hide,
    .show-with-scale,
    .hide-with-scale {
      animation-duration: 0ms;
    }
  }
`;
