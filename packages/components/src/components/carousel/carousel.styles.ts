import { css } from 'lit';

export default css`
  :host {
    display: flex;
  }

  .carousel {
    display: grid;
    grid-template-columns: min-content 1fr min-content;
    grid-template-rows: 1fr min-content;
    grid-template-areas:
      '. slides .'
      '. pagination .';
    gap: var(--cs-space-m);
    align-items: center;
    min-height: 100%;
    min-width: 100%;
    position: relative;
  }

  .pagination {
    grid-area: pagination;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--cs-space-s);
    padding-block: var(--cs-space-3xs);
  }

  .slides {
    grid-area: slides;

    display: grid;
    height: 100%;
    width: 100%;
    align-items: center;
    justify-items: center;
    overflow: auto;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
    aspect-ratio: calc(var(--cs-carousel-aspect-ratio, 16 / 9) * var(--_slides-per-page));
    border-radius: var(--cs-border-radius-m);

    --_slide-size: calc(
      (100% - (var(--_slides-per-page) - 1) * var(--cs-carousel-slide-gap, var(--cs-space-m, 1rem))) /
        var(--_slides-per-page)
    );
  }

  /*
   * While a looping carousel that initialized inside a hidden container waits to scroll past its leading clones, hide
   * the slides and pagination to avoid flashing the wrong slide and active dot, then fade them in once the carousel has
   * positioned itself.
   */
  .slides,
  .pagination {
    transition: opacity var(--cs-transition-fast) ease;
  }

  .slides-awaiting-position,
  .pagination-awaiting-position {
    opacity: 0;
    transition: none;
  }

  @media (prefers-reduced-motion) {
    :where(.slides) {
      scroll-behavior: auto;
    }
  }

  .slides-horizontal {
    grid-auto-flow: column;
    grid-auto-columns: var(--_slide-size);
    grid-auto-rows: 100%;
    column-gap: var(--cs-carousel-slide-gap, var(--cs-space-m, 1rem));
    scroll-snap-type: x mandatory;
    scroll-padding-inline: var(--cs-carousel-scroll-hint, 0px);
    padding-inline: var(--cs-carousel-scroll-hint, 0px);
    overflow-y: hidden;
  }

  .slides-vertical {
    grid-auto-flow: row;
    grid-auto-columns: 100%;
    grid-auto-rows: var(--_slide-size);
    row-gap: var(--cs-carousel-slide-gap, var(--cs-space-m, 1rem));
    scroll-snap-type: y mandatory;
    scroll-padding-block: var(--cs-carousel-scroll-hint, 0px);
    padding-block: var(--cs-carousel-scroll-hint, 0px);
    overflow-x: hidden;
  }

  :host([vertical]) ::slotted(cs-carousel-item) {
    height: 100%;
  }

  .slides::-webkit-scrollbar {
    display: none;
  }

  .navigation {
    grid-area: navigation;
    display: contents;
    font-size: var(--cs-font-size-l);
  }

  .navigation-button {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    background: none;
    border: none;
    border-radius: var(--cs-border-radius-m);
    font-size: inherit;
    color: var(--cs-color-text-quiet);
    padding: var(--cs-space-xs);
    cursor: pointer;
    transition: var(--cs-transition-normal) color;
    appearance: none;
  }

  .navigation-button-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .navigation-button-previous {
    grid-column: 1;
    grid-row: 1;
  }

  .navigation-button-next {
    grid-column: 3;
    grid-row: 1;
  }

  .pagination-item {
    display: block;
    cursor: pointer;
    background: none;
    border: 0;
    border-radius: var(--cs-border-radius-circle);
    width: var(--cs-space-s);
    height: var(--cs-space-s);
    background-color: var(--cs-color-neutral-fill-normal);
    padding: 0;
    margin: 0;
    transition: transform var(--cs-transition-slow);
  }

  .pagination-item-active {
    background-color: var(--cs-form-control-activated-color);
    transform: scale(1.25);
  }

  /* Focus styles */
  .slides:focus-visible,
  .navigation-button:focus-visible,
  .pagination-item:focus-visible {
    outline: var(--cs-focus-ring);
    outline-offset: var(--cs-focus-ring-offset);
  }
`;
