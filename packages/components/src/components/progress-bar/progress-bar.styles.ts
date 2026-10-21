import { css } from 'lit';

export default css`
  :host {
    display: flex;
  }

  .progress-bar {
    flex: 1 1 auto;
    display: flex;
    position: relative;
    overflow: hidden;
    height: var(--cs-progress-bar-track-height, 1rem);
    border-radius: var(--cs-border-radius-pill);
    background-color: var(--cs-track-color, var(--cs-color-neutral-fill-normal));
    color: var(--cs-color-brand-on-loud);
    font-size: var(--cs-font-size-s);
  }

  .indicator {
    width: var(--_percentage);
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--cs-indicator-color, var(--cs-color-brand-fill-loud));
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    line-height: 1;
    font-weight: var(--cs-font-weight-semibold);
    transition: all var(--cs-transition-slow, 200ms) var(--cs-transition-easing, ease);
    user-select: none;
    -webkit-user-select: none;
  }

  /* Indeterminate */
  :host([indeterminate]) .indicator {
    position: absolute;
    inset-block: 0;
    inline-size: 50%;
    animation: cs-progress-indeterminate 2.5s infinite cubic-bezier(0.37, 0, 0.63, 1);
  }

  @media (forced-colors: active) {
    .progress-bar {
      outline: solid 1px SelectedItem;
      background-color: var(--cs-color-surface-default);
    }

    .indicator {
      outline: solid 1px SelectedItem;
      background-color: SelectedItem;
    }
  }

  @keyframes cs-progress-indeterminate {
    0% {
      inset-inline-start: -50%;
    }

    75%,
    100% {
      inset-inline-start: 100%;
    }
  }
`;
