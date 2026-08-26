import { css } from 'lit';

export default css`
  :host {
    display: flex;
    position: relative;
    align-items: center;
    padding: 0.5em 1em;
    border-radius: var(--cs-border-radius-s);
    isolation: isolate;
    color: var(--cs-color-text-normal);
    line-height: var(--cs-line-height-condensed);
    cursor: pointer;
    transition:
      var(--cs-transition-fast) background-color var(--cs-transition-easing),
      var(--cs-transition-fast) color var(--cs-transition-easing);
  }

  @media (hover: hover) {
    :host(:hover:not(:state(disabled))) {
      background-color: var(--cs-color-neutral-fill-normal);
    }
  }

  :host(:state(submenu-open)) {
    background-color: var(--cs-color-neutral-fill-normal);
  }

  :host(:focus-visible) {
    z-index: 1;
    outline: var(--cs-focus-ring);
    background-color: var(--cs-color-neutral-fill-normal);
  }

  :host(:state(disabled)),
  :host([disabled]) {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Danger variant */
  :host([variant='danger']),
  :host([variant='danger']) #details {
    color: var(--cs-color-danger-on-quiet);
  }

  @media (hover: hover) {
    :host([variant='danger']:hover) {
      background-color: var(--cs-color-danger-fill-normal);
      color: var(--cs-color-danger-on-normal);
    }
  }

  :host([variant='danger']:state(submenu-open)),
  :host([variant='danger']:focus-visible) {
    background-color: var(--cs-color-danger-fill-normal);
    color: var(--cs-color-danger-on-normal);
  }

  :host([checkbox-adjacent]) {
    padding-inline-start: 2em;
  }

  /* Only add padding when item actually has a submenu */
  :host([submenu-adjacent]:not(:state(has-submenu))) #details {
    padding-inline-end: 0;
  }

  :host(:state(has-submenu)[submenu-adjacent]) #details {
    padding-inline-end: 1.75em;
  }

  #check {
    visibility: hidden;
    margin-inline-start: -1.5em;
    margin-inline-end: 0.5em;
    font-size: var(--cs-font-size-smaller);
  }

  :host(:state(checked)) #check {
    visibility: visible;
  }

  #icon ::slotted(*) {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    margin-inline-end: 0.75em !important;
    font-size: var(--cs-font-size-smaller);
  }

  #label {
    flex: 1 1 auto;
    min-width: 0;
  }

  #details {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: end;
    color: var(--cs-color-text-quiet);
    font-size: var(--cs-font-size-smaller) !important;
  }

  #details ::slotted(*) {
    margin-inline-start: 2em !important;
  }

  /* Submenu indicator icon */
  #submenu-indicator {
    position: absolute;
    inset-inline-end: 1em;
    color: var(--cs-color-neutral-on-quiet);
    font-size: var(--cs-font-size-smaller);
  }

  /* Flip chevron icon when RTL */
  :host(:dir(rtl)) #submenu-indicator {
    transform: scaleX(-1);
  }

  /* Submenu styles */
  #submenu {
    display: flex;
    z-index: 10;
    position: absolute;
    top: 0;
    left: 0;
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

    /* Override default popover styles */
    &[popover] {
      margin: 0;
      inset: auto;
      padding: 0.25em;
      overflow: visible;
      border-radius: var(--cs-border-radius-m);
    }

    &.show {
      animation: submenu-show var(--show-duration, var(--cs-transition-fast)) ease;
    }

    &.hide {
      animation: submenu-show var(--show-duration, var(--cs-transition-fast)) ease reverse;
    }

    /* Submenu placement transform origins */
    &[data-placement^='top'] {
      transform-origin: bottom;
    }

    &[data-placement^='bottom'] {
      transform-origin: top;
    }

    &[data-placement^='left'] {
      transform-origin: right;
    }

    &[data-placement^='right'] {
      transform-origin: left;
    }

    &[data-placement='left-start'] {
      transform-origin: right top;
    }

    &[data-placement='left-end'] {
      transform-origin: right bottom;
    }

    &[data-placement='right-start'] {
      transform-origin: left top;
    }

    &[data-placement='right-end'] {
      transform-origin: left bottom;
    }

    /* Safe triangle styling */
    &::before {
      display: none;
      z-index: 9;
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background-color: transparent;
      content: '';
      clip-path: polygon(
        var(--safe-triangle-cursor-x, 0) var(--safe-triangle-cursor-y, 0),
        var(--safe-triangle-submenu-start-x, 0) var(--safe-triangle-submenu-start-y, 0),
        var(--safe-triangle-submenu-end-x, 0) var(--safe-triangle-submenu-end-y, 0)
      );
      pointer-events: auto; /* Enable mouse events on the triangle */
    }

    &[data-visible]::before {
      display: block;
    }
  }

  ::slotted(cs-dropdown-item) {
    font-size: inherit;
  }

  ::slotted(cs-divider) {
    --spacing: 0.25em;
  }

  @keyframes submenu-show {
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
