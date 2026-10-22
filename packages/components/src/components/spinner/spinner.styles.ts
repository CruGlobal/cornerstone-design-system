import { css } from 'lit';

export default css`
  :host {
    --_size: 1em;

    /*
      Resizing a spinner element using anything but font-size will break the animation because the animation uses em
      units. Therefore, if a spinner is used in a flex container without \`flex: none\` applied, the spinner can
      grow/shrink and break the animation. The use of \`flex: none\` on the host element prevents this by always having
      the spinner sized according to its actual dimensions.
    */
    flex: none;
    display: inline-flex;
    width: var(--_size);
    height: var(--_size);
  }

  svg {
    width: 100%;
    height: 100%;
    aspect-ratio: 1;
    animation: spin var(--cs-spinner-speed, 2s) linear infinite;
  }

  .track,
  .indicator {
    --_radius: calc(var(--_size) / 2 - var(--cs-track-width, 2px) / 2);
    --_circumference: calc(var(--_radius) * 2 * 3.141592654);

    cx: calc(var(--_size) / 2);
    cy: calc(var(--_size) / 2);
    r: var(--_radius);
    fill: none;
    stroke-width: var(--cs-track-width, 2px);
  }

  .track {
    stroke: var(--cs-track-color, var(--cs-color-neutral-fill-normal));
  }

  .indicator {
    stroke: var(--cs-indicator-color, var(--cs-color-brand-fill-loud));
    stroke-linecap: round;
    stroke-dasharray: calc(0.597 * var(--_circumference)), calc(0.796 * var(--_circumference));
    stroke-dashoffset: calc(-0.04 * var(--_circumference));
    animation: dash 1.5s ease-in-out infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes dash {
    0% {
      stroke-dasharray: calc(0.008 * var(--_circumference)), calc(1.194 * var(--_circumference));
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: calc(0.716 * var(--_circumference)), calc(1.194 * var(--_circumference));
      stroke-dashoffset: calc(-0.278 * var(--_circumference));
    }
    100% {
      stroke-dasharray: calc(0.716 * var(--_circumference)), calc(1.194 * var(--_circumference));
      stroke-dashoffset: calc(-0.987 * var(--_circumference));
    }
  }
`;
