import { css } from 'lit';

export default css`
  :host {
    --show-duration: var(--cs-transition-fast);
    --hide-duration: var(--cs-transition-fast);
    display: contents;
  }

  #menu {
    display: flex;
    flex-direction: column;
    width: max-content;
    margin: 0;
    padding: 0.25em;
    border: var(--cs-border-style) var(--cs-border-width-s) var(--cs-color-surface-border);
    border-radius: var(--cs-border-radius-m);
    background-color: var(--cs-color-surface-raised);
    box-shadow: var(--cs-shadow-m);
    color: var(--cs-color-text-normal);
    text-align: start;
    user-select: none;
    overflow: auto;
    max-width: var(--auto-size-available-width) !important;
    max-height: var(--auto-size-available-height) !important;

    &.show {
      animation: show var(--show-duration) ease;
    }

    &.hide {
      animation: show var(--hide-duration) ease reverse;
    }

    ::slotted(h1),
    ::slotted(h2),
    ::slotted(h3),
    ::slotted(h4),
    ::slotted(h5),
    ::slotted(h6) {
      display: block !important;
      margin: 0.25em 0 !important;
      padding: 0.25em 0.75em !important;
      color: var(--cs-color-text-quiet);
      font-family: var(--cs-font-family-body) !important;
      font-weight: var(--cs-font-weight-semibold) !important;
      font-size: var(--cs-font-size-smaller) !important;
    }

    ::slotted(cs-divider) {
      --spacing: 0.25em; /* Component-specific, left as-is */
    }
  }

  cs-popup[data-current-placement^='top'] #menu {
    transform-origin: bottom;
  }

  cs-popup[data-current-placement^='bottom'] #menu {
    transform-origin: top;
  }

  cs-popup[data-current-placement^='left'] #menu {
    transform-origin: right;
  }

  cs-popup[data-current-placement^='right'] #menu {
    transform-origin: left;
  }

  cs-popup[data-current-placement='left-start'] #menu {
    transform-origin: right top;
  }

  cs-popup[data-current-placement='left-end'] #menu {
    transform-origin: right bottom;
  }

  cs-popup[data-current-placement='right-start'] #menu {
    transform-origin: left top;
  }

  cs-popup[data-current-placement='right-end'] #menu {
    transform-origin: left bottom;
  }

  @keyframes show {
    from {
      scale: 0.9;
      opacity: 0;
    }
    to {
      scale: 1;
      opacity: 1;
    }
  }
`;
