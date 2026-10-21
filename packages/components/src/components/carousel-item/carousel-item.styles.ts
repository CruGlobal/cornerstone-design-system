import { css } from 'lit';

export default css`
  :host {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    width: 100%;
    max-height: 100%;
    /* The carousel's property, so a value set on the carousel reaches every slide. Its default matches the carousel's. */
    aspect-ratio: var(--cs-carousel-aspect-ratio, 16 / 9);
    scroll-snap-align: start;
    scroll-snap-stop: always;
  }

  ::slotted(img) {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover;
  }
`;
