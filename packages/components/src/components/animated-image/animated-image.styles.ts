import { css } from 'lit';

export default css`
  :host {
    display: inline-flex;
    position: relative;
    cursor: pointer;
  }

  img {
    display: block;
    width: 100%;
    height: 100%;
  }

  img[aria-hidden='true'] {
    display: none;
  }

  .control-box {
    /* The icon's default size derives from the box's, so the box's is written once here. */
    --_control-box-size: var(--cs-animated-image-control-box-size, 3rem);

    display: flex;
    position: absolute;
    align-items: center;
    justify-content: center;
    top: calc(50% - var(--_control-box-size) / 2);
    right: calc(50% - var(--_control-box-size) / 2);
    width: var(--_control-box-size);
    height: var(--_control-box-size);
    font-size: calc(var(--cs-animated-image-icon-size, calc(var(--_control-box-size) * 0.625)) * 0.75);
    background: none;
    border: solid var(--cs-border-width-s) currentColor;
    background-color: rgb(0 0 0 / 50%);
    border-radius: var(--cs-border-radius-circle);
    color: white;
    pointer-events: none;
    transition: opacity var(--cs-transition-normal) var(--cs-transition-easing);
  }

  @media (hover: hover) {
    :host([play]:hover) .control-box {
      opacity: 1;
    }
  }

  :where(:host([play]:not(:hover))) .control-box {
    opacity: 0;
  }

  :host([play]) slot[name='play-icon'],
  :host(:not([play])) slot[name='pause-icon'] {
    display: none;
  }

  /* Show control box on keyboard focus */
  .animated-image {
    &:focus {
      outline: none;
    }

    &:focus-visible .control-box {
      opacity: 1;
      outline: var(--cs-focus-ring);
      outline-offset: var(--cs-focus-ring-offset);
    }
  }
`;
