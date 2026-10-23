import { css } from 'lit';

export default css`
  /* The label carries this when the slider has no label, and the two range-thumb bound names always do.
     It was referenced before it existed, so an unlabelled slider's label element was never hidden. */
  .vh {
    position: absolute;
    width: 1px;
    height: 1px;
    clip-path: inset(50%);
    overflow: hidden;
    white-space: nowrap;
  }

  :host([orientation='vertical']) {
    width: auto;
  }

  #label:has(~ .vertical) {
    display: block;
    order: 2;
    max-width: none;
    text-align: center;
  }

  #description:has(~ .vertical) {
    order: 3;
    text-align: center;
  }

  /* Add extra space between slider and label, when present */
  #label.has-label ~ #slider {
    &.horizontal {
      margin-block-start: 0.5em;
    }
    &.vertical {
      margin-block-end: 0.5em;
    }
  }

  #slider {
    touch-action: none;

    &:focus {
      outline: none;
    }

    &:focus-visible:not(.disabled) #thumb,
    &:focus-visible:not(.disabled) #thumb-min,
    &:focus-visible:not(.disabled) #thumb-max {
      outline: var(--cs-focus-ring);
      /* intentionally no offset due to border */
    }
  }

  #track {
    position: relative;
    border-radius: 9999px;
    background: var(--cs-color-neutral-fill-normal);
    isolation: isolate;
  }

  /* Orientation */
  .horizontal #track {
    height: var(--cs-slider-track-size, 0.5em);
  }

  .vertical #track {
    order: 1;
    width: var(--cs-slider-track-size, 0.5em);
    height: 200px;
  }

  /* Disabled */
  .disabled #track {
    cursor: not-allowed;
    opacity: 0.5;
  }

  /* Indicator */
  #indicator {
    position: absolute;
    border-radius: inherit;
    background-color: var(--cs-form-control-activated-color);

    &:dir(ltr) {
      right: calc(100% - max(var(--_start), var(--_end)));
      left: min(var(--_start), var(--_end));
    }

    &:dir(rtl) {
      right: min(var(--_start), var(--_end));
      left: calc(100% - max(var(--_start), var(--_end)));
    }
  }

  .horizontal #indicator {
    top: 0;
    height: 100%;
  }

  .vertical #indicator {
    top: calc(100% - var(--_end));
    bottom: var(--_start);
    left: 0;
    width: 100%;
  }

  /* Thumbs */
  #thumb,
  #thumb-min,
  #thumb-max {
    z-index: 3;
    position: absolute;
    width: var(--cs-slider-thumb-width, 1.4em);
    height: var(--cs-slider-thumb-height, 1.4em);
    border: solid 0.125em var(--cs-color-surface-default);
    border-radius: 50%;
    background-color: var(--cs-form-control-activated-color);
    cursor: pointer;
  }

  .disabled #thumb,
  .disabled #thumb-min,
  .disabled #thumb-max {
    cursor: inherit;
  }

  .horizontal #thumb,
  .horizontal #thumb-min,
  .horizontal #thumb-max {
    top: calc(50% - var(--cs-slider-thumb-height, 1.4em) / 2);

    &:dir(ltr) {
      right: auto;
      left: calc(var(--_position) - var(--cs-slider-thumb-width, 1.4em) / 2);
    }

    &:dir(rtl) {
      right: calc(var(--_position) - var(--cs-slider-thumb-width, 1.4em) / 2);
      left: auto;
    }
  }

  .vertical #thumb,
  .vertical #thumb-min,
  .vertical #thumb-max {
    bottom: calc(var(--_position) - var(--cs-slider-thumb-height, 1.4em) / 2);
    left: calc(50% - var(--cs-slider-thumb-width, 1.4em) / 2);
  }

  /* Range-specific thumb styles */
  :host([range]) {
    #thumb-min:focus-visible,
    #thumb-max:focus-visible {
      z-index: 4; /* Ensure focused thumb appears on top */
      outline: var(--cs-focus-ring);
      /* intentionally no offset due to border */
    }
  }

  /* Markers */
  #markers {
    pointer-events: none;
  }

  .marker {
    z-index: 2;
    position: absolute;
    width: var(--cs-slider-marker-width, 0.1875em);
    height: var(--cs-slider-marker-height, 0.1875em);
    border-radius: 50%;
    background-color: var(--cs-color-surface-default);
  }

  .marker:first-of-type,
  .marker:last-of-type {
    display: none;
  }

  .horizontal .marker {
    top: calc(50% - var(--cs-slider-marker-height, 0.1875em) / 2);
    left: calc(var(--_position) - var(--cs-slider-marker-width, 0.1875em) / 2);
  }

  .vertical .marker {
    top: calc(var(--_position) - var(--cs-slider-marker-height, 0.1875em) / 2);
    left: calc(50% - var(--cs-slider-marker-width, 0.1875em) / 2);
  }

  /* Marker labels */
  #references {
    position: relative;

    slot {
      display: flex;
      justify-content: space-between;
      height: 100%;
    }

    ::slotted(*) {
      color: var(--cs-color-text-quiet);
      font-size: 0.875em;
      line-height: 1;
    }
  }

  .horizontal {
    #references {
      margin-block-start: 0.5em;
    }
  }

  .vertical {
    display: flex;
    margin-inline: auto;

    #track {
      order: 1;
    }

    #references {
      order: 2;
      width: min-content;
      margin-inline-start: 0.75em;

      slot {
        flex-direction: column;
      }
    }
  }

  .vertical #references slot {
    flex-direction: column;
  }
`;
