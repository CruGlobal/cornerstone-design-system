import { expect } from '@open-wc/testing';
import { parseDuration } from '../animate.js';

/** A CSS animation is named by its keyframes, a transition by its longhand property, an `animate()` call by its id. */
function timingOf(animation: Animation) {
  const effect = animation.effect as KeyframeEffect;
  const { duration, delay = 0 } = effect.getComputedTiming();
  let name = animation.id || 'animate()';

  if ('animationName' in animation) {
    name = (animation as CSSAnimation).animationName;
  } else if ('transitionProperty' in animation) {
    name = (animation as CSSTransition).transitionProperty;
  }

  return { name: effect.pseudoElement ? `${effect.pseudoElement} ${name}` : name, duration: Number(duration), delay };
}

/** The finite animations and transitions on `el` and its pseudo-elements, but not on its descendants. */
function timingsOn(el: Element, name?: RegExp) {
  return el
    .getAnimations({ subtree: true })
    .filter((animation) => (animation.effect as KeyframeEffect | null)?.target === el)
    .filter((animation) => animation.effect?.getComputedTiming().endTime !== Infinity)
    .map(timingOf)
    .filter((timing) => !name || name.test(timing.name));
}

function describeElement(el: Element) {
  return [el.localName, ...el.classList].join('.');
}

/**
 * Asserts that `el` starts animating, and that every animation and transition on it and on its pseudo-elements is set
 * to run exactly as long as the custom property `property` resolves to on `el`, with no delay.
 *
 * It reads the configured timing, never the clock, so it makes the check a fixed wait used to make by accident (an
 * animation that ran long outlasted the wait) without racing the frame loop. Call it straight after the change that
 * starts the animation, before anything awaits a frame: a finished animation drops out of `getAnimations()`, and a
 * stalled frame can carry a short one past its end. It waits for the animation a microtask at a time, so a component
 * that starts it an update or two after the change is still caught, while no frame can pass.
 *
 * `name` narrows the check to the animations whose name matches, for an element that runs several at different
 * speeds. Infinite animations, such as a caret's blink, are never checked.
 */
export async function expectAnimationDuration(el: Element, property: string, { name }: { name?: RegExp } = {}) {
  const value = getComputedStyle(el).getPropertyValue(property);
  expect(value.trim(), `${property} should resolve to a duration on ${describeElement(el)}`).to.not.equal('');
  const expected = parseDuration(value);

  // A microtask never yields to rendering, so however many of these turns run, the animation cannot advance.
  let timings = timingsOn(el, name);
  for (let turn = 0; turn < 50 && timings.length === 0; turn++) {
    await Promise.resolve();
    timings = timingsOn(el, name);
  }

  expect(timings, `${describeElement(el)} should be animating${name ? ` ${name}` : ''}`).to.not.be.empty;

  // The detail goes in the message: chai truncates an array this long to `[ Array(1) ]` in its own.
  const mismatches = timings
    .filter((timing) => timing.duration !== expected || timing.delay !== 0)
    .map(
      (timing) => `${timing.name} runs ${timing.duration}ms${timing.delay ? ` after a ${timing.delay}ms delay` : ''}`,
    );

  expect(
    mismatches,
    `${describeElement(el)} should animate for ${property} (${expected}ms) with no delay, but ${mismatches.join(', ')}`,
  ).to.be.empty;
}

/**
 * Asserts that `el` takes on `className` and moves for no time with it: every animation and transition on it and on
 * its pseudo-elements runs 0ms with no delay, or is gone. For the reduced-motion paths, which shorten the component's
 * own animation to nothing rather than skipping the class, so its after event still follows.
 *
 * Waiting for the class first is what keeps this from passing before anything has happened. Call it straight after
 * the change that adds the class, as with `expectAnimationDuration`.
 */
export async function expectNoMotion(el: Element, className: string) {
  for (let turn = 0; turn < 50 && !el.classList.contains(className); turn++) {
    await Promise.resolve();
  }
  expect(el.classList.contains(className), `${describeElement(el)} should take on .${className}`).to.be.true;

  const moving = timingsOn(el)
    .filter((timing) => timing.duration > 0 || timing.delay > 0)
    .map((timing) => `${timing.name} runs ${timing.duration}ms`);
  expect(moving, `${describeElement(el)} should not move, but ${moving.join(', ')}`).to.be.empty;
}
