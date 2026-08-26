import { css } from 'lit';

export default css`
  :host {
    --accent-width: 4px;
    --show-duration: var(--cs-transition-normal);
    --hide-duration: var(--cs-transition-normal);
    --accent-color: var(--cs-color-fill-loud);

    display: block;
    pointer-events: auto;
  }

  /* Sizes */
  :host([size='xs']) {
    --padding: var(--cs-space-xs);
  }
  :host([size='s']) {
    --padding: var(--cs-space-s);
  }
  :host([size='m']) {
    --padding: var(--cs-space-m);
  }
  :host([size='l']) {
    --padding: var(--cs-space-l);
  }
  :host([size='xl']) {
    --padding: var(--cs-space-xl);
  }

  .toast-item {
    display: flex;
    align-items: stretch;
    background: var(--cs-color-surface-raised);
    border: var(--cs-border-width-s) solid var(--cs-color-surface-border);
    border-radius: var(--cs-border-radius-m);
    box-shadow: var(--cs-shadow-l);
    overflow: hidden;
  }

  /* Animations */
  .toast-item.show {
    animation: toast-show var(--show-duration) var(--cs-transition-easing) forwards;
  }

  .toast-item.hide {
    animation: toast-hide var(--hide-duration) var(--cs-transition-easing) forwards;
  }

  @keyframes toast-show {
    from {
      opacity: 0;
      translate: 0 -0.5rem;
    }
    to {
      opacity: 1;
      translate: 0;
    }
  }

  @keyframes toast-hide {
    from {
      opacity: 1;
      translate: 0;
    }
    to {
      opacity: 0;
      translate: 0 -0.5rem;
    }
  }

  /* Accent line */
  .accent {
    flex: 0 0 auto;
    width: var(--accent-width);
    background: var(--accent-color);
  }

  /* Icon - only show if slot has content */
  .icon {
    display: flex;
    align-items: center;
    padding: var(--padding, var(--cs-space-m));
    padding-inline-end: 0;
    color: var(--accent-color);
    font-size: 1.25em;
  }

  .toast-item:not(.toast-item--has-icon) .icon {
    display: none;
  }

  /* Content */
  .content {
    flex: 1 1 auto;
    align-self: center;
    min-width: 0;
    padding: var(--padding, var(--cs-space-m));
    color: var(--cs-color-text-normal);
  }

  /* Close button */
  .close-button {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    align-self: stretch;
    padding-inline: var(--padding, var(--cs-space-m));
    background: transparent;
    border: none;
    border-start-end-radius: var(--border-radius);
    border-end-end-radius: var(--border-radius);
    color: var(--cs-color-neutral-on-quiet);
    font-size: inherit;
    cursor: pointer;
    transition: background-color var(--cs-transition-fast);

    @media (hover: hover) {
      &:hover {
        color: color-mix(in oklab, currentColor, var(--cs-color-mix-hover));
      }
    }

    &:focus {
      outline: none;
    }

    &:focus-visible {
      outline: var(--cs-focus-ring);
      outline-offset: calc(var(--cs-focus-ring-width) * -1);
    }
  }

  /* Progress ring styling */
  cs-progress-ring {
    --size: var(--cs-form-control-height);
    --track-width: 0.125rem;
    --indicator-width: 0.125rem;
    --track-color: var(--cs-color-neutral-fill-quiet);
    --indicator-color: var(--accent-color);
    --indicator-transition-duration: 50ms;
  }

  /* Hide progress ring indicator when no duration */
  .toast-item:not(.toast-item--has-duration) cs-progress-ring {
    --track-color: transparent;
    --indicator-color: transparent;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .toast-item.show,
    .toast-item.hide {
      animation: none;
    }
  }
`;
