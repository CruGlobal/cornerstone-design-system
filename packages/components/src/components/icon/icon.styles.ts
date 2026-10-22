import { css } from 'lit';

export default css`
  :host {
    --_rotate-angle: 0deg;

    box-sizing: content-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    vertical-align: -0.125em;
  }

  /* #region Canvas — the box the icon is centered within. Orthogonal to font-size. */

  /* Fixed width (default): 1.25em × 1em (20 × 16px) */
  :host(:not([canvas])),
  :host([canvas='fixed']) {
    width: 1.25em;
    height: 1em;
    min-width: 1.25em; /* <-- this is what Safari respects for intrinsic */
    min-height: 1em;
  }

  /* Auto: hug the icon's width. \`auto-width\` is the deprecated alias for canvas="auto". */
  :host([canvas='auto']),
  :host([auto-width]:not([canvas])) {
    width: auto;
    height: 1em;
  }

  /* Square: 1.25em × 1.25em (20 × 20px) */
  :host([canvas='square']) {
    width: 1.25em;
    height: 1.25em;
    min-width: 1.25em;
    min-height: 1.25em;
  }

  /* Roomy: 1.5em × 1.5em (24 × 24px) */
  :host([canvas='roomy']) {
    width: 1.5em;
    height: 1.5em;
    min-width: 1.5em;
    min-height: 1.5em;
  }

  /* #endregion */

  svg {
    /* NOTE: Avoid setting fill here. A stylesheet rule beats SVG presentation attributes, breaking stroke-based
       libraries like Lucide (fill="none" stroke="currentColor") and attribute-based mutators (issue #1733). The default
       library applies fill="currentColor" in its mutator instead. */
    height: 1em;
    overflow: visible;
    width: auto;

    /*
     * Material Symbols draws every icon inside a 24dp box with a 20dp live area, so at a given font-size its ink lands
     * about 17% smaller than ink-cropped artwork would. 24 / 20 = 1.2 puts it back without moving the canvas, so no
     * layout reflows. Set --cs-icon-scale to 1 to render the artwork at its native size.
     *
     * The default lives in the var() fallback rather than on :host so an ancestor can set it — a declaration on :host
     * comes from this tree and beats a value inherited from the outer one, which would leave the property tunable
     * only on the element itself.
     */
    scale: var(--cs-icon-scale, 1.2);
  }

  /* Rotation */
  :host([rotate]) {
    transform: rotate(var(--_rotate-angle, 0deg));
  }

  /* Flipping */
  :host([flip='x']) {
    transform: scaleX(-1);
  }
  :host([flip='y']) {
    transform: scaleY(-1);
  }
  :host([flip='both']) {
    transform: scale(-1, -1);
  }

  /* Rotation and Flipping combined */
  :host([rotate][flip='x']) {
    transform: rotate(var(--_rotate-angle, 0deg)) scaleX(-1);
  }
  :host([rotate][flip='y']) {
    transform: rotate(var(--_rotate-angle, 0deg)) scaleY(-1);
  }
  :host([rotate][flip='both']) {
    transform: rotate(var(--_rotate-angle, 0deg)) scale(-1, -1);
  }

  /* #region Animations — ported from Font Awesome 7.3 (--fa-* props mapped to cs-icon's --cs-icon-* names) */

  :host([animation='beat']) {
    animation-name: beat;
    animation-delay: var(--cs-icon-animation-delay, 0s);
    animation-direction: var(--cs-icon-animation-direction, normal);
    animation-duration: var(--cs-icon-animation-duration, 1s);
    animation-iteration-count: var(--cs-icon-animation-iteration-count, infinite);
    animation-timing-function: var(--cs-icon-animation-timing, ease-in-out);
  }

  :host([animation='bounce']) {
    animation-name: bounce;
    animation-delay: var(--cs-icon-animation-delay, 0s);
    animation-direction: var(--cs-icon-animation-direction, normal);
    animation-duration: var(--cs-icon-animation-duration, 1s);
    animation-iteration-count: var(--cs-icon-animation-iteration-count, infinite);
    animation-timing-function: var(--cs-icon-animation-timing, cubic-bezier(0.28, 0.84, 0.42, 1));
  }

  :host([animation='fade']) {
    animation-name: fade;
    animation-delay: var(--cs-icon-animation-delay, 0s);
    animation-direction: var(--cs-icon-animation-direction, normal);
    animation-duration: var(--cs-icon-animation-duration, 1s);
    animation-iteration-count: var(--cs-icon-animation-iteration-count, infinite);
    animation-timing-function: var(--cs-icon-animation-timing, ease-in-out);
  }

  :host([animation='beat-fade']) {
    animation-name: beat-fade;
    animation-delay: var(--cs-icon-animation-delay, 0s);
    animation-direction: var(--cs-icon-animation-direction, normal);
    animation-duration: var(--cs-icon-animation-duration, 1s);
    animation-iteration-count: var(--cs-icon-animation-iteration-count, infinite);
    animation-timing-function: var(--cs-icon-animation-timing, ease-in-out);
  }

  :host([animation='flip']) {
    animation-name: flip;
    animation-delay: var(--cs-icon-animation-delay, 0s);
    animation-direction: var(--cs-icon-animation-direction, normal);
    animation-duration: var(--cs-icon-animation-duration, 1.5s);
    animation-iteration-count: var(--cs-icon-animation-iteration-count, infinite);
    animation-timing-function: var(--cs-icon-animation-timing, ease-in-out);
  }

  :host([animation='flip-360']) {
    animation-name: flip-360;
    animation-delay: var(--cs-icon-animation-delay, 0s);
    animation-direction: var(--cs-icon-animation-direction, normal);
    animation-duration: var(--cs-icon-animation-duration, 1s);
    animation-iteration-count: var(--cs-icon-animation-iteration-count, infinite);
    animation-timing-function: var(--cs-icon-animation-timing, ease-in-out);
  }

  :host([animation='shake']) {
    animation-name: shake;
    animation-delay: var(--cs-icon-animation-delay, 0s);
    animation-direction: var(--cs-icon-animation-direction, normal);
    animation-duration: var(--cs-icon-animation-duration, 0.75s);
    animation-iteration-count: var(--cs-icon-animation-iteration-count, infinite);
    animation-timing-function: var(--cs-icon-animation-timing, ease-in-out);
  }

  :host([animation='spin']) {
    animation-name: spin;
    animation-delay: var(--cs-icon-animation-delay, 0s);
    animation-direction: var(--cs-icon-animation-direction, normal);
    animation-duration: var(--cs-icon-animation-duration, 2s);
    animation-iteration-count: var(--cs-icon-animation-iteration-count, infinite);
    animation-timing-function: var(--cs-icon-animation-timing, linear);
  }

  :host([animation='spin-pulse']) {
    animation-name: spin;
    animation-delay: var(--cs-icon-animation-delay, 0s);
    animation-direction: var(--cs-icon-animation-direction, normal);
    animation-duration: var(--cs-icon-animation-duration, 1s);
    animation-iteration-count: var(--cs-icon-animation-iteration-count, infinite);
    animation-timing-function: var(--cs-icon-animation-timing, steps(8));
  }

  /* spin-reverse is FA's reverse modifier expressed as a standalone value; reverse any spin via --cs-icon-animation-direction: reverse */
  :host([animation='spin-reverse']) {
    animation-name: spin;
    animation-delay: var(--cs-icon-animation-delay, 0s);
    animation-direction: var(--cs-icon-animation-direction, reverse);
    animation-duration: var(--cs-icon-animation-duration, 2s);
    animation-iteration-count: var(--cs-icon-animation-iteration-count, infinite);
    animation-timing-function: var(--cs-icon-animation-timing, linear);
  }

  :host([animation='spin-snap']) {
    animation-name: spin-snap;
    animation-delay: var(--cs-icon-animation-delay, 0s);
    animation-direction: var(--cs-icon-animation-direction, normal);
    animation-duration: var(--cs-icon-animation-duration, 3s);
    animation-iteration-count: var(--cs-icon-animation-iteration-count, infinite);
    animation-timing-function: var(--cs-icon-animation-timing, linear);
  }

  :host([animation='spin-snap-4']) {
    animation-name: spin-snap-4;
    animation-delay: var(--cs-icon-animation-delay, 0s);
    animation-direction: var(--cs-icon-animation-direction, normal);
    animation-duration: var(--cs-icon-animation-duration, 2.4s);
    animation-iteration-count: var(--cs-icon-animation-iteration-count, infinite);
    animation-timing-function: var(--cs-icon-animation-timing, linear);
  }

  :host([animation='spin-snap-8']) {
    animation-name: spin-snap-8;
    animation-delay: var(--cs-icon-animation-delay, 0s);
    animation-direction: var(--cs-icon-animation-direction, normal);
    animation-duration: var(--cs-icon-animation-duration, 4s);
    animation-iteration-count: var(--cs-icon-animation-iteration-count, infinite);
    animation-timing-function: var(--cs-icon-animation-timing, linear);
  }

  :host([animation='buzz']) {
    animation-name: buzz;
    animation-delay: var(--cs-icon-animation-delay, 0s);
    animation-direction: var(--cs-icon-animation-direction, normal);
    animation-duration: var(--cs-icon-animation-duration, 0.6s);
    animation-iteration-count: var(--cs-icon-animation-iteration-count, infinite);
    animation-timing-function: var(--cs-icon-animation-timing, linear);
  }

  :host([animation='wag']) {
    animation-name: wag;
    animation-delay: var(--cs-icon-animation-delay, 0s);
    animation-direction: var(--cs-icon-animation-direction, normal);
    animation-duration: var(--cs-icon-animation-duration, 0.9s);
    animation-iteration-count: var(--cs-icon-animation-iteration-count, infinite);
    animation-timing-function: var(--cs-icon-animation-timing, ease-out);
    transform-origin: bottom center;
  }

  :host([animation='float']) {
    animation-name: float;
    animation-delay: var(--cs-icon-animation-delay, 0s);
    animation-direction: var(--cs-icon-animation-direction, normal);
    animation-duration: var(--cs-icon-animation-duration, 3s);
    animation-iteration-count: var(--cs-icon-animation-iteration-count, infinite);
    animation-timing-function: var(--cs-icon-animation-timing, ease-in-out);
    will-change: transform;
  }

  :host([animation='swing']) {
    animation-name: swing;
    animation-delay: var(--cs-icon-animation-delay, 0s);
    animation-direction: var(--cs-icon-animation-direction, normal);
    animation-duration: var(--cs-icon-animation-duration, 1.2s);
    animation-iteration-count: var(--cs-icon-animation-iteration-count, infinite);
    animation-timing-function: var(--cs-icon-animation-timing, ease-out);
    transform-origin: top center;
  }

  :host([animation='jello']) {
    animation-name: jello;
    animation-delay: var(--cs-icon-animation-delay, 0s);
    animation-direction: var(--cs-icon-animation-direction, normal);
    animation-duration: var(--cs-icon-animation-duration, 0.9s);
    animation-iteration-count: var(--cs-icon-animation-iteration-count, infinite);
    animation-timing-function: var(--cs-icon-animation-timing, ease-out);
  }

  @media (prefers-reduced-motion: reduce) {
    :host([animation='beat']),
    :host([animation='bounce']),
    :host([animation='fade']),
    :host([animation='beat-fade']),
    :host([animation='flip']),
    :host([animation='flip-360']),
    :host([animation='shake']),
    :host([animation='spin']),
    :host([animation='spin-pulse']),
    :host([animation='spin-reverse']),
    :host([animation='spin-snap']),
    :host([animation='spin-snap-4']),
    :host([animation='spin-snap-8']),
    :host([animation='buzz']),
    :host([animation='wag']),
    :host([animation='float']),
    :host([animation='swing']),
    :host([animation='jello']) {
      animation: none !important;
      transition: none !important;
    }
  }

  /* #endregion */

  /* #region Keyframes — ported verbatim from Font Awesome 7.3 */

  @keyframes beat {
    0% {
      transform: scale(1);
    }
    25% {
      transform: scale(calc(1.25 * var(--cs-icon-beat-scale, 1.25)));
    }
    45% {
      transform: scale(calc(1.22 * var(--cs-icon-beat-scale, 1.22)));
    }
    65% {
      transform: scale(calc(1.25 * var(--cs-icon-beat-scale, 1.25)));
    }
    90% {
      transform: scale(1);
    }
  }

  @keyframes bounce {
    0% {
      transform: scale(1, 1) translateY(0);
      /* No fallback by design (ported from FA 7.3): the first segment uses the user's --cs-icon-animation-timing or the CSS
         initial ease, while the explicit cubic-beziers on later stops drive the bounce physics. */
      animation-timing-function: var(--cs-icon-animation-timing);
    }
    14% {
      transform: scale(var(--cs-icon-bounce-start-scale-x, 1.06), var(--cs-icon-bounce-start-scale-y, 0.94))
        translateY(var(--cs-icon-bounce-anticipation, 3px));
      animation-timing-function: cubic-bezier(0.33, 0, 0.66, 0.33);
    }
    32% {
      transform: scale(var(--cs-icon-bounce-jump-scale-x, 0.94), var(--cs-icon-bounce-jump-scale-y, 1.12))
        translateY(calc(-1 * var(--cs-icon-bounce-height, 0.5em)));
      animation-timing-function: cubic-bezier(0.33, 0.66, 0.66, 1);
    }
    52% {
      transform: scale(1, 1) translateY(calc(-1 * var(--cs-icon-bounce-height, 0.5em) * 1.1));
      animation-timing-function: cubic-bezier(0.5, 0, 1, 0.5);
    }
    70% {
      transform: scale(var(--cs-icon-bounce-land-scale-x, 1.06), var(--cs-icon-bounce-land-scale-y, 0.92)) translateY(0);
      animation-timing-function: cubic-bezier(0.33, 0.33, 0.66, 1);
    }
    85% {
      transform: scale(0.98, 1.04) translateY(calc(-2px * var(--cs-icon-bounce-rebound, 1)));
      animation-timing-function: cubic-bezier(0.33, 0, 0.66, 1);
    }
    100% {
      transform: scale(1, 1) translateY(0);
    }
  }

  @keyframes fade {
    0% {
      opacity: 1;
      transform: scale(1);
      animation-timing-function: cubic-bezier(0.2, 0, 0.4, 1);
    }
    40% {
      opacity: var(--cs-icon-fade-opacity, 0.4);
      transform: scale(0.98);
      animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes beat-fade {
    0% {
      opacity: var(--cs-icon-beat-fade-opacity, 0.4);
      transform: scale(1);
      animation-timing-function: cubic-bezier(0.2, 0, 0.4, 1);
    }
    25% {
      opacity: calc(var(--cs-icon-beat-fade-opacity, 0.4) + 0.4);
      transform: scale(var(--cs-icon-beat-fade-scale, 1.28));
      animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
    }
    45% {
      opacity: 1;
      transform: scale(var(--cs-icon-beat-fade-scale, 1.25));
      animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }
    65% {
      opacity: calc(var(--cs-icon-beat-fade-opacity, 0.4) + 0.4);
      transform: scale(var(--cs-icon-beat-fade-scale, 1.28));
      animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
    }
    100% {
      opacity: var(--cs-icon-beat-fade-opacity, 0.4);
      transform: scale(1);
    }
  }

  @keyframes flip {
    0% {
      transform: perspective(2em) scale(1)
        rotate3d(var(--cs-icon-flip-x, 0), var(--cs-icon-flip-y, 1), var(--cs-icon-flip-z, 0), 0deg);
      animation-timing-function: cubic-bezier(0.2, 0, 0.4, 1);
    }
    8% {
      transform: perspective(2em) scale(var(--cs-icon-flip-anticipation-scale, 0.95))
        rotate3d(var(--cs-icon-flip-x, 0), var(--cs-icon-flip-y, 1), var(--cs-icon-flip-z, 0), 0deg);
      animation-timing-function: cubic-bezier(0.33, 0, 0.66, 0.33);
    }
    35% {
      transform: perspective(2em) scale(1)
        rotate3d(
          var(--cs-icon-flip-x, 0),
          var(--cs-icon-flip-y, 1),
          var(--cs-icon-flip-z, 0),
          calc(var(--cs-icon-flip-angle, -360deg) * 0.6)
        );
      animation-timing-function: linear;
    }
    65% {
      transform: perspective(2em) scale(1)
        rotate3d(
          var(--cs-icon-flip-x, 0),
          var(--cs-icon-flip-y, 1),
          var(--cs-icon-flip-z, 0),
          calc(var(--cs-icon-flip-angle, -360deg) * 0.5)
        );
      animation-timing-function: cubic-bezier(0.33, 0.66, 0.66, 1);
    }
    92% {
      transform: perspective(2em) scale(1)
        rotate3d(
          var(--cs-icon-flip-x, 0),
          var(--cs-icon-flip-y, 1),
          var(--cs-icon-flip-z, 0),
          calc(var(--cs-icon-flip-angle, -360deg) * var(--cs-icon-flip-overshoot, 1.04))
        );
      animation-timing-function: cubic-bezier(0.33, 0, 0.66, 1);
    }
    100% {
      transform: perspective(2em) scale(1)
        rotate3d(
          var(--cs-icon-flip-x, 0),
          var(--cs-icon-flip-y, 1),
          var(--cs-icon-flip-z, 0),
          var(--cs-icon-flip-angle, -360deg)
        );
    }
  }

  @keyframes flip-360 {
    0% {
      transform: perspective(2em) scale(1)
        rotate3d(var(--cs-icon-flip-x, 0), var(--cs-icon-flip-y, 1), var(--cs-icon-flip-z, 0), 0deg);
      animation-timing-function: cubic-bezier(0.2, 0, 0.4, 1);
    }
    8% {
      transform: perspective(2em) scale(var(--cs-icon-flip-anticipation-scale, 0.95))
        rotate3d(var(--cs-icon-flip-x, 0), var(--cs-icon-flip-y, 1), var(--cs-icon-flip-z, 0), 0deg);
      animation-timing-function: cubic-bezier(0.33, 0, 0.66, 0.33);
    }
    50% {
      transform: perspective(2em) scale(1)
        rotate3d(
          var(--cs-icon-flip-x, 0),
          var(--cs-icon-flip-y, 1),
          var(--cs-icon-flip-z, 0),
          calc(var(--cs-icon-flip-angle, -360deg) * 0.6)
        );
      animation-timing-function: cubic-bezier(0.33, 0.66, 0.66, 1);
    }
    80% {
      transform: perspective(2em) scale(1)
        rotate3d(
          var(--cs-icon-flip-x, 0),
          var(--cs-icon-flip-y, 1),
          var(--cs-icon-flip-z, 0),
          calc(var(--cs-icon-flip-angle, -360deg) * var(--cs-icon-flip-overshoot, 1.04))
        );
      animation-timing-function: cubic-bezier(0.33, 0, 0.66, 1);
    }
    100% {
      transform: perspective(2em) scale(1)
        rotate3d(
          var(--cs-icon-flip-x, 0),
          var(--cs-icon-flip-y, 1),
          var(--cs-icon-flip-z, 0),
          var(--cs-icon-flip-angle, -360deg)
        );
    }
  }

  @keyframes shake {
    0% {
      transform: rotate(0deg);
      animation-timing-function: cubic-bezier(0.2, 0, 0.8, 1);
    }
    8% {
      transform: rotate(35deg) translateX(1px);
      animation-timing-function: cubic-bezier(0.3, 0, 0.7, 1);
    }
    20% {
      transform: rotate(-22deg) translateX(-1px);
      animation-timing-function: cubic-bezier(0.3, 0, 0.7, 1);
    }
    35% {
      transform: rotate(15deg) translateX(1px);
      animation-timing-function: cubic-bezier(0.3, 0, 0.7, 1);
    }
    50% {
      transform: rotate(-9deg);
      animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
    }
    65% {
      transform: rotate(5deg);
      animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
    }
    78% {
      transform: rotate(-3deg);
      animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
    }
    90% {
      transform: rotate(1deg);
      animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }
    100% {
      transform: rotate(0deg);
    }
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes spin-snap {
    0% {
      transform: rotate(0deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    12% {
      transform: rotate(60deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    16.67% {
      transform: rotate(60deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    28.67% {
      transform: rotate(120deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    33.33% {
      transform: rotate(120deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    45.33% {
      transform: rotate(180deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    50% {
      transform: rotate(180deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    62% {
      transform: rotate(240deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    66.67% {
      transform: rotate(240deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    78.67% {
      transform: rotate(300deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    83.33% {
      transform: rotate(300deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    95.33% {
      transform: rotate(360deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes spin-snap-4 {
    0% {
      transform: rotate(0deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    15% {
      transform: rotate(90deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    25% {
      transform: rotate(90deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    40% {
      transform: rotate(180deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    50% {
      transform: rotate(180deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    65% {
      transform: rotate(270deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    75% {
      transform: rotate(270deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    90% {
      transform: rotate(360deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes spin-snap-8 {
    0% {
      transform: rotate(0deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    9% {
      transform: rotate(45deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    12.5% {
      transform: rotate(45deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    21.5% {
      transform: rotate(90deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    25% {
      transform: rotate(90deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    34% {
      transform: rotate(135deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    37.5% {
      transform: rotate(135deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    46.5% {
      transform: rotate(180deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    50% {
      transform: rotate(180deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    59% {
      transform: rotate(225deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    62.5% {
      transform: rotate(225deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    71.5% {
      transform: rotate(270deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    75% {
      transform: rotate(270deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    84% {
      transform: rotate(315deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    87.5% {
      transform: rotate(315deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    96.5% {
      transform: rotate(360deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes buzz {
    0% {
      transform: translateX(0) rotate(0deg);
      animation-timing-function: cubic-bezier(0.1, 0, 0.9, 1);
    }
    5% {
      transform: translateX(var(--cs-icon-buzz-distance, 4px)) rotate(0.5deg);
    }
    10% {
      transform: translateX(calc(-1 * var(--cs-icon-buzz-distance, 4px))) rotate(-0.5deg);
    }
    15% {
      transform: translateX(var(--cs-icon-buzz-distance, 4px)) rotate(0.3deg);
    }
    20% {
      transform: translateX(calc(-1 * var(--cs-icon-buzz-distance, 4px))) rotate(-0.3deg);
    }
    25% {
      transform: translateX(calc(var(--cs-icon-buzz-distance, 4px) * 0.7)) rotate(0.2deg);
    }
    30% {
      transform: translateX(calc(-1 * var(--cs-icon-buzz-distance, 4px) * 0.7)) rotate(-0.2deg);
    }
    35% {
      transform: translateX(calc(var(--cs-icon-buzz-distance, 4px) * 0.4)) rotate(0.1deg);
    }
    40% {
      transform: translateX(0) rotate(0deg);
    }
    100% {
      transform: translateX(0) rotate(0deg);
    }
  }

  @keyframes wag {
    0% {
      transform: rotate(0deg);
      animation-timing-function: cubic-bezier(0.2, 0, 0.6, 1);
    }
    12% {
      transform: rotate(var(--cs-icon-wag-angle, 12deg));
      animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }
    24% {
      transform: rotate(2deg);
      animation-timing-function: cubic-bezier(0.2, 0, 0.6, 1);
    }
    36% {
      transform: rotate(calc(var(--cs-icon-wag-angle, 12deg) * 0.85));
      animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }
    48% {
      transform: rotate(1deg);
      animation-timing-function: cubic-bezier(0.2, 0, 0.6, 1);
    }
    58% {
      transform: rotate(calc(var(--cs-icon-wag-angle, 12deg) * 0.6));
      animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }
    68% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(0deg);
    }
  }

  @keyframes float {
    0% {
      transform: translateY(0) translateX(0) rotate(0deg)
        scale(var(--cs-icon-float-squash-x, 1.02), var(--cs-icon-float-squash-y, 0.98));
      animation-timing-function: cubic-bezier(0.33, 0, 0.66, 0.33);
    }
    15% {
      transform: translateY(calc(-0.4 * var(--cs-icon-float-height, 6px))) translateX(var(--cs-icon-float-drift, 1px))
        rotate(var(--cs-icon-float-tilt, 1deg)) scale(1, 1);
      animation-timing-function: cubic-bezier(0.33, 0.66, 0.66, 1);
    }
    35% {
      transform: translateY(calc(-1 * var(--cs-icon-float-height, 6px))) translateX(0) rotate(0deg)
        scale(var(--cs-icon-float-stretch-x, 0.98), var(--cs-icon-float-stretch-y, 1.03));
      animation-timing-function: cubic-bezier(0.5, 0, 0.5, 0);
    }
    50% {
      transform: translateY(calc(-0.92 * var(--cs-icon-float-height, 6px)))
        translateX(calc(-0.5 * var(--cs-icon-float-drift, 1px))) rotate(calc(-0.5 * var(--cs-icon-float-tilt, 1deg)))
        scale(0.995, 1.01);
      animation-timing-function: cubic-bezier(0.33, 0, 0.66, 0.33);
    }
    70% {
      transform: translateY(calc(-0.3 * var(--cs-icon-float-height, 6px)))
        translateX(calc(-1 * var(--cs-icon-float-drift, 1px))) rotate(calc(-1 * var(--cs-icon-float-tilt, 1deg)))
        scale(1, 1);
      animation-timing-function: cubic-bezier(0.33, 0.66, 0.66, 1);
    }
    90% {
      transform: translateY(calc(0.05 * var(--cs-icon-float-height, 6px))) translateX(0) rotate(0deg)
        scale(var(--cs-icon-float-squash-x, 1.02), var(--cs-icon-float-squash-y, 0.98));
      animation-timing-function: cubic-bezier(0.33, 0, 0.66, 1);
    }
    100% {
      transform: translateY(0) translateX(0) rotate(0deg)
        scale(var(--cs-icon-float-squash-x, 1.02), var(--cs-icon-float-squash-y, 0.98));
    }
  }

  @keyframes swing {
    0% {
      transform: rotate(0deg);
      animation-timing-function: cubic-bezier(0.2, 0, 0.8, 1);
    }
    8% {
      transform: rotate(var(--cs-icon-swing-angle, 22deg));
      animation-timing-function: cubic-bezier(0.3, 0, 0.7, 1);
    }
    18% {
      transform: rotate(calc(-1 * var(--cs-icon-swing-angle, 22deg) * 0.85));
      animation-timing-function: cubic-bezier(0.3, 0, 0.7, 1);
    }
    28% {
      transform: rotate(calc(var(--cs-icon-swing-angle, 22deg) * 0.65));
      animation-timing-function: cubic-bezier(0.35, 0, 0.65, 1);
    }
    38% {
      transform: rotate(calc(-1 * var(--cs-icon-swing-angle, 22deg) * 0.45));
      animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
    }
    48% {
      transform: rotate(calc(var(--cs-icon-swing-angle, 22deg) * 0.25));
      animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
    }
    56% {
      transform: rotate(calc(-1 * var(--cs-icon-swing-angle, 22deg) * 0.1));
      animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
    }
    64% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(0deg);
    }
  }

  @keyframes jello {
    0% {
      transform: scale(1, 1);
      animation-timing-function: cubic-bezier(0.2, 0, 0.8, 1);
    }
    12% {
      transform: scale(var(--cs-icon-jello-scale-x, 1.15), calc(2 - var(--cs-icon-jello-scale-x, 1.15)));
      animation-timing-function: cubic-bezier(0.3, 0, 0.7, 1);
    }
    24% {
      transform: scale(calc(2 - var(--cs-icon-jello-scale-y, 1.12)), var(--cs-icon-jello-scale-y, 1.12));
      animation-timing-function: cubic-bezier(0.3, 0, 0.7, 1);
    }
    36% {
      transform: scale(
        calc(1 + (var(--cs-icon-jello-scale-x, 1.15) - 1) * 0.5),
        calc(2 - (1 + (var(--cs-icon-jello-scale-x, 1.15) - 1) * 0.5))
      );
      animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
    }
    48% {
      transform: scale(
        calc(2 - (1 + (var(--cs-icon-jello-scale-y, 1.12) - 1) * 0.3)),
        calc(1 + (var(--cs-icon-jello-scale-y, 1.12) - 1) * 0.3)
      );
      animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
    }
    58% {
      transform: scale(1.02, 0.98);
      animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }
    68% {
      transform: scale(1, 1);
    }
    100% {
      transform: scale(1, 1);
    }
  }

  /* #endregion */
`;
