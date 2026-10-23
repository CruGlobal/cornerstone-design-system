import { css } from 'lit';

export default css`
  :host {
    display: flex;
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 1rem;
  }

  .indicator {
    /* The sheen's default derives from the skeleton's color, so both are written once here. */
    --_color: var(--cs-skeleton-color, var(--cs-color-neutral-fill-normal));
    --_sheen-color: var(--cs-skeleton-sheen-color, color-mix(in oklab, var(--_color), var(--cs-color-surface-raised)));

    flex: 1 1 auto;
    background: var(--_color);
    border-radius: var(--cs-border-radius-pill);
  }

  :host([effect='sheen']) .indicator {
    background: linear-gradient(270deg, var(--_sheen-color), var(--_color), var(--_color), var(--_sheen-color));
    background-size: 400% 100%;
    animation: sheen 8s ease-in-out infinite;
  }

  :host([effect='pulse']) .indicator {
    animation: pulse 2s ease-in-out 0.5s infinite;
  }

  /* Forced colors mode turns any other color into Canvas, which hides the skeleton, so GrayText wins over a page's. */
  @media (forced-colors: active) {
    .indicator {
      --_color: GrayText;
    }
  }

  @keyframes sheen {
    0% {
      background-position: 200% 0;
    }
    to {
      background-position: -200% 0;
    }
  }

  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.4;
    }
    100% {
      opacity: 1;
    }
  }
`;
