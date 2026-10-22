import { css } from 'lit';

export default css`
  :host {
    display: none;
  }

  /*
   * Out of flow, so opening the dialog cannot move anything around it. The visible panel is a native dialog element
   * opened with showModal(), which lives in the top layer and is positioned against the viewport, so the host's own
   * box paints nothing — but while it was in flow it was still a flex/grid item wherever the host sat, and opening
   * the dialog added a gap that nudged its siblings.
   *
   * The width stays full-viewport rather than zero. RenderedWatcher spots third-party CSS hiding the dialog through
   * ResizeObserver size changes, and the panel's max-width resolves against this box, so collapsing it would flatten
   * both of those signals and the modal would never resume. Height is zero because nothing here paints.
   */
  :host([open]) {
    display: block;
    position: fixed;
    inset-inline: 0;
    height: 0;
  }

  .drawer {
    display: flex;
    flex-direction: column;
    top: 0;
    inset-inline-start: 0;
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    overflow: hidden;
    color: inherit;
    background-color: var(--cs-color-surface-raised);
    border: none;
    box-shadow: var(--cs-shadow-l);
    overflow: auto;
    padding: 0;
    margin: 0;
    animation-duration: var(--cs-show-duration, var(--cs-transition-normal));
    animation-timing-function: ease;

    &.show::backdrop {
      animation: show-backdrop var(--cs-show-duration, var(--cs-transition-normal, 200ms)) ease;
    }

    &.hide::backdrop {
      animation: show-backdrop var(--cs-hide-duration, var(--cs-transition-normal, 200ms)) ease reverse;
    }

    &.show.top {
      animation: show-drawer-from-top var(--cs-show-duration, var(--cs-transition-normal)) ease;
    }

    &.hide.top {
      animation: show-drawer-from-top var(--cs-hide-duration, var(--cs-transition-normal)) ease reverse;
    }

    &.show.end {
      animation: show-drawer-from-end var(--cs-show-duration, var(--cs-transition-normal)) ease;

      &:dir(rtl) {
        animation-name: show-drawer-from-start;
      }
    }

    &.hide.end {
      animation: show-drawer-from-end var(--cs-hide-duration, var(--cs-transition-normal)) ease reverse;

      &:dir(rtl) {
        animation-name: show-drawer-from-start;
      }
    }

    &.show.bottom {
      animation: show-drawer-from-bottom var(--cs-show-duration, var(--cs-transition-normal)) ease;
    }

    &.hide.bottom {
      animation: show-drawer-from-bottom var(--cs-hide-duration, var(--cs-transition-normal)) ease reverse;
    }

    &.show.start {
      animation: show-drawer-from-start var(--cs-show-duration, var(--cs-transition-normal)) ease;

      &:dir(rtl) {
        animation-name: show-drawer-from-end;
      }
    }

    &.hide.start {
      animation: show-drawer-from-start var(--cs-hide-duration, var(--cs-transition-normal)) ease reverse;

      &:dir(rtl) {
        animation-name: show-drawer-from-end;
      }
    }

    &.pulse {
      animation: pulse 250ms ease;
    }
  }

  .drawer:focus {
    outline: none;
  }

  .top {
    top: 0;
    inset-inline-end: auto;
    bottom: auto;
    inset-inline-start: 0;
    width: 100%;
    height: var(--cs-drawer-size, 25rem);
  }

  .end {
    top: 0;
    inset-inline-end: 0;
    bottom: auto;
    inset-inline-start: auto;
    width: var(--cs-drawer-size, 25rem);
    height: 100%;
  }

  .bottom {
    top: auto;
    inset-inline-end: auto;
    bottom: 0;
    inset-inline-start: 0;
    width: 100%;
    height: var(--cs-drawer-size, 25rem);
  }

  .start {
    top: 0;
    inset-inline-end: auto;
    bottom: auto;
    inset-inline-start: 0;
    width: var(--cs-drawer-size, 25rem);
    height: 100%;
  }

  .header {
    display: flex;
    flex-wrap: nowrap;
    padding-inline-start: var(--cs-drawer-spacing, var(--cs-space-l));
    padding-block-end: 0;

    /* Subtract the close button's padding so that the X is visually aligned with the edges of the dialog content */
    padding-inline-end: calc(var(--cs-drawer-spacing, var(--cs-space-l)) - var(--cs-form-control-padding-block));
    padding-block-start: calc(var(--cs-drawer-spacing, var(--cs-space-l)) - var(--cs-form-control-padding-block));
  }

  .title {
    align-self: center;
    flex: 1 1 auto;
    font: inherit;
    font-size: var(--cs-font-size-l);
    font-weight: var(--cs-font-weight-heading);
    line-height: var(--cs-line-height-condensed);
    margin: 0;
  }

  .header-actions {
    align-self: start;
    display: flex;
    flex-shrink: 0;
    flex-wrap: wrap;
    justify-content: end;
    gap: var(--cs-space-2xs);
    padding-inline-start: var(--cs-drawer-spacing, var(--cs-space-l));
  }

  .header-actions cs-button,
  .header-actions ::slotted(cs-button) {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
  }

  .body {
    flex: 1 1 auto;
    display: block;
    padding: var(--cs-drawer-spacing, var(--cs-space-l));
    overflow: auto;
    -webkit-overflow-scrolling: touch;

    &:focus {
      outline: none;
    }

    &:focus-visible {
      outline: var(--cs-focus-ring);
      outline-offset: var(--cs-focus-ring-offset);
    }
  }

  .footer {
    display: flex;
    flex-wrap: wrap;
    gap: var(--cs-space-xs);
    justify-content: end;
    padding: var(--cs-drawer-spacing, var(--cs-space-l));
    padding-block-start: 0;
  }

  .footer ::slotted(cs-button:not(:last-of-type)) {
    margin-inline-end: var(--cs-space-xs);
  }

  .drawer::backdrop {
    /*
        NOTE: the ::backdrop element doesn't inherit properly in Safari yet, but it will in 17.4! At that time, we can
        remove the fallback values here.
      */
    background-color: var(--cs-color-overlay-modal, rgb(0 0 0 / 0.25));
    backdrop-filter: var(--cs-backdrop-filter, none);
  }

  @keyframes pulse {
    0% {
      scale: 1;
    }
    50% {
      scale: 1.01;
    }
    100% {
      scale: 1;
    }
  }

  @keyframes show-drawer {
    from {
      opacity: 0;
      scale: 0.8;
    }
    to {
      opacity: 1;
      scale: 1;
    }
  }

  @keyframes show-drawer-from-top {
    from {
      opacity: 0;
      translate: 0 -100%;
    }
    to {
      opacity: 1;
      translate: 0 0;
    }
  }

  @keyframes show-drawer-from-end {
    from {
      opacity: 0;
      translate: 100%;
    }
    to {
      opacity: 1;
      translate: 0 0;
    }
  }

  @keyframes show-drawer-from-bottom {
    from {
      opacity: 0;
      translate: 0 100%;
    }
    to {
      opacity: 1;
      translate: 0 0;
    }
  }

  @keyframes show-drawer-from-start {
    from {
      opacity: 0;
      translate: -100% 0;
    }
    to {
      opacity: 1;
      translate: 0 0;
    }
  }

  @keyframes show-backdrop {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @media (forced-colors: active) {
    .drawer {
      border: solid 1px white;
    }
  }

  /* Reduced motion wins over any duration, including one a page sets for every component. Matches the placement rules' specificity, which name a class for each side. */
  @media (prefers-reduced-motion: reduce) {
    .drawer:is(.show, .hide):is(.top, .end, .bottom, .start),
    .drawer:is(.show, .hide)::backdrop {
      animation-duration: 0ms;
    }
  }
`;
