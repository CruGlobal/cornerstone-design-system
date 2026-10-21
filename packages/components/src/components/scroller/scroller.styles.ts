import { css } from 'lit';

export default css`
  :host {
    /* private (defined dynamically) */
    --_start-shadow-opacity: 0;
    --_end-shadow-opacity: 0;

    display: block;
    position: relative;
    max-width: 100%;
    overflow: hidden;
    isolation: isolate;
  }

  :host([orientation='vertical']) {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  #content {
    z-index: 1; /* below shadows */
    border-radius: inherit;
    scroll-behavior: smooth;
    scrollbar-width: thin;

    /* Prevent text in mobile Safari from being larger when the container width larger than the viewport */
    -webkit-text-size-adjust: 100%;

    &:focus {
      outline: none;
    }

    &:focus-visible {
      outline: var(--cs-focus-ring);
      outline-offset: var(--cs-focus-ring-offset);
    }
  }

  :host([without-scrollbar]) #content {
    scrollbar-width: none;
  }

  :host([orientation='horizontal']) #content {
    overflow-x: auto;
    overflow-y: hidden;
  }

  :host([orientation='vertical']) #content {
    flex: 1 1 auto;
    min-height: 0; /* This is crucial for flex children to respect overflow */
    overflow-x: hidden;
    overflow-y: auto;
  }

  #start-shadow,
  #end-shadow {
    z-index: 2;
  }

  #start-shadow {
    opacity: var(--_start-shadow-opacity);
  }

  #end-shadow {
    opacity: var(--_end-shadow-opacity);
  }

  /* Horizontal shadows */
  :host([orientation='horizontal']) {
    #start-shadow,
    #end-shadow {
      position: absolute;
      top: 0;
      bottom: 0;
      width: var(--cs-scroller-shadow-size, 2rem);
      pointer-events: none;
    }

    #start-shadow {
      &:dir(ltr) {
        left: 0;
        background: linear-gradient(
          to right,
          var(--cs-scroller-shadow-color, var(--cs-color-surface-default)),
          transparent 100%
        );
      }

      &:dir(rtl) {
        right: 0;
        background: linear-gradient(
          to left,
          var(--cs-scroller-shadow-color, var(--cs-color-surface-default)),
          transparent 100%
        );
      }
    }

    #end-shadow {
      &:dir(ltr) {
        right: 0;
        background: linear-gradient(
          to left,
          var(--cs-scroller-shadow-color, var(--cs-color-surface-default)),
          transparent 100%
        );
      }

      &:dir(rtl) {
        left: 0;
        background: linear-gradient(
          to right,
          var(--cs-scroller-shadow-color, var(--cs-color-surface-default)),
          transparent 100%
        );
      }
    }
  }

  /* Vertical shadows */
  :host([orientation='vertical']) {
    #start-shadow,
    #end-shadow {
      position: absolute;
      right: 0;
      left: 0;
      height: var(--cs-scroller-shadow-size, 2rem);
      pointer-events: none;
    }

    #start-shadow {
      top: 0;
      background: linear-gradient(
        to bottom,
        var(--cs-scroller-shadow-color, var(--cs-color-surface-default)),
        transparent 100%
      );
    }

    #end-shadow {
      bottom: 0;
      background: linear-gradient(
        to top,
        var(--cs-scroller-shadow-color, var(--cs-color-surface-default)),
        transparent 100%
      );
    }
  }
`;
