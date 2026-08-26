import { css } from 'lit';

export default css`
  :host {
    --width: 31rem;
    --spacing: var(--cs-space-l);
    --backdrop-filter: none;
    --show-duration: var(--cs-transition-normal);
    --hide-duration: var(--cs-transition-normal);

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

  .dialog {
    display: flex;
    flex-direction: column;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    width: var(--width);
    max-width: calc(100% - var(--cs-space-2xl));
    max-height: calc(100% - var(--cs-space-2xl));
    color: inherit;
    background-color: var(--cs-color-surface-raised);
    border-radius: var(--cs-panel-border-radius);
    border: none;
    box-shadow: var(--cs-shadow-l);
    padding: 0;
    margin: auto;

    &.show {
      animation: show-dialog var(--show-duration) ease;

      &::backdrop {
        animation: show-backdrop var(--show-duration, 200ms) ease;
      }
    }

    &.hide {
      animation: show-dialog var(--hide-duration) ease reverse;

      &::backdrop {
        animation: show-backdrop var(--hide-duration, 200ms) ease reverse;
      }
    }

    &.pulse {
      animation: pulse 250ms ease;
    }
  }

  .dialog:focus {
    outline: none;
  }

  /* Ensure there's enough vertical padding for phones that don't update vh when chrome appears (e.g. iPhone) */
  @media screen and (max-width: 420px) {
    .dialog {
      max-height: 80vh;
    }
  }

  .open {
    display: flex;
    opacity: 1;
  }

  .header {
    flex: 0 0 auto;
    display: flex;
    flex-wrap: nowrap;

    padding-inline-start: var(--spacing);
    padding-block-end: 0;

    /* Subtract the close button's padding so that the X is visually aligned with the edges of the dialog content */
    padding-inline-end: calc(var(--spacing) - var(--cs-form-control-padding-block));
    padding-block-start: calc(var(--spacing) - var(--cs-form-control-padding-block));
  }

  .title {
    align-self: center;
    flex: 1 1 auto;
    font-family: inherit;
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
    padding-inline-start: var(--spacing);
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
    padding: var(--spacing);
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
    flex: 0 0 auto;
    display: flex;
    flex-wrap: wrap;
    gap: var(--cs-space-xs);
    justify-content: end;
    padding: var(--spacing);
    padding-block-start: 0;
  }

  .footer ::slotted(cs-button:not(:first-of-type)) {
    margin-inline-start: var(--cs-space-xs);
  }

  .dialog::backdrop {
    /*
      NOTE: the ::backdrop element doesn't inherit properly in Safari yet, but it will in 17.4! At that time, we can
      remove the fallback values here.
    */
    background-color: var(--cs-color-overlay-modal, rgb(0 0 0 / 0.25));
    backdrop-filter: var(--backdrop-filter);
  }

  @keyframes pulse {
    0% {
      scale: 1;
    }
    50% {
      scale: 1.02;
    }
    100% {
      scale: 1;
    }
  }

  @keyframes show-dialog {
    from {
      opacity: 0;
      scale: 0.8;
    }
    to {
      opacity: 1;
      scale: 1;
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
    .dialog {
      border: solid 1px white;
    }
  }
`;
