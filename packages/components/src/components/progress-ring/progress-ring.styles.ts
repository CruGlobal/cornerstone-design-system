import { css } from 'lit';

export default css`
  :host {
    display: inline-flex;
  }

  .progress-ring {
    /* The indicator's width defaults to the track's, so the track's default is written once here. */
    --_track-width: var(--cs-track-width, 0.25em); /* avoid using rems here */
    --_indicator-width: var(--cs-progress-ring-indicator-width, var(--_track-width));

    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .image {
    width: var(--cs-progress-ring-size, 8rem);
    height: var(--cs-progress-ring-size, 8rem);
    rotate: -90deg;
    transform-origin: 50% 50%;
  }

  .track,
  .indicator {
    --_radius: calc(var(--cs-progress-ring-size, 8rem) / 2 - max(var(--_track-width), var(--_indicator-width)) * 0.5);
    --_circumference: calc(var(--_radius) * 2 * 3.141592654);

    fill: none;
    r: var(--_radius);
    cx: calc(var(--cs-progress-ring-size, 8rem) / 2);
    cy: calc(var(--cs-progress-ring-size, 8rem) / 2);
  }

  .track {
    stroke: var(--cs-track-color, var(--cs-color-neutral-fill-normal));
    stroke-width: var(--_track-width);
  }

  .indicator {
    stroke: var(--cs-indicator-color, var(--cs-color-brand-fill-loud));
    stroke-width: var(--_indicator-width);
    stroke-linecap: round;
    transition-property: stroke-dashoffset;
    transition-duration: var(--cs-progress-ring-indicator-transition-duration, 0.35s);
    stroke-dasharray: var(--_circumference) var(--_circumference);
    stroke-dashoffset: calc(var(--_circumference) - var(--_percentage) * var(--_circumference));
  }

  .label {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    text-align: center;
    user-select: none;
    -webkit-user-select: none;
  }
`;
