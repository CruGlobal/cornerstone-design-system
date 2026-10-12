import { nextFrame } from '@open-wc/testing';

/**
 * Every animation and transition on `el`, on its descendants, and inside every shadow root beneath them.
 *
 * `getAnimations({ subtree: true })` stops at shadow boundaries, and a component's animations nearly always run
 * on an element inside its shadow root, so this walks into each one. Calling `getAnimations()` also flushes
 * pending style, so a transition the last state change started is already in the list.
 */
export function getAnimationsDeep(el: Element): Animation[] {
  const animations = new Set(el.getAnimations({ subtree: true }));

  for (const node of [el, ...el.querySelectorAll('*')]) {
    for (const child of node.shadowRoot?.children ?? []) {
      for (const animation of getAnimationsDeep(child)) {
        animations.add(animation);
      }
    }
  }

  return [...animations];
}

/**
 * Jumps every finite animation and transition on `el`, its descendants and their shadow roots to its end, so a
 * test reads the settled state without waiting for the browser to get there.
 *
 * A fixed wait for an animation races the frame loop, and a loaded machine stalls it: WebKit on a busy CI runner
 * has gone longer than a 150 ms transition without a frame, so the transition had not even started when the test
 * read the style. Finishing is deterministic in every engine. A Web Animations `finished` promise
 * settles straight away; a CSS `animationend` or `transitionend` event still waits for the next frame, so a test
 * that needs one should await the event after calling this, not a timer.
 *
 * Infinite animations, such as a spinner's, are left running, since `finish()` throws on them.
 */
export function finishAnimations(el: Element) {
  for (const animation of getAnimationsDeep(el)) {
    if (animation.effect?.getComputedTiming().endTime !== Infinity) {
      animation.finish();
    }
  }
}

/**
 * Finishes `el`'s animations, then waits one frame, so whatever the component does when they end has run.
 *
 * For a component that waits on `animationend` (everything built on `animateWithClass`), finishing alone is not
 * enough: the event is only dispatched in the next rendering update. That update sends animation events before it
 * runs animation frame callbacks, so one frame is exactly enough, and the wait is for that frame rather than for a
 * guess at the animation's length.
 */
export async function settleAnimations(el: Element) {
  finishAnimations(el);
  await nextFrame();
}
