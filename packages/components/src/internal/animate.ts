/** Same as `el.animate()`, except returns a promise that doesn't throw an error when the animation is canceled. */
export async function animate(el: Element, keyframes: Keyframe[], options?: KeyframeAnimationOptions) {
  return el.animate(keyframes, options).finished.catch(() => {
    /* suppress errors in Safari */
  });
}

/**
 * Applies a class to the specified element to animate it. The class is removed after the animation finishes and then
 * the promise resolves. If the class starts no animation on the element, such as under reduced motion, it is removed
 * on the next frame instead.
 *
 * Only an animation on the element itself counts. Animation events bubble, so one that ends or is cancelled on
 * anything inside it, whether slotted content or its own shadow children, reaches its listeners too, and so does one
 * on its pseudo-elements, with the element itself as the target. All of them are ignored.
 */
export function animateWithClass(el: Element, className: string) {
  return new Promise<void>((resolve) => {
    const controller = new AbortController();
    const { signal } = controller;

    if (el.classList.contains(className)) {
      resolve();
      return;
    }
    el.classList.add(className);

    let resolved = false;
    const onEnd = () => {
      if (resolved) {
        return;
      }
      resolved = true;
      el.classList.remove(className);
      resolve();
      controller.abort();
    };

    const handleAnimationEnd = (event: Event) => {
      if (event.target === el && !(event as AnimationEvent).pseudoElement) {
        onEnd();
      }
    };

    // Not `once`: that removes a listener after any event, including one ignored above, and the element's own end
    // would never be heard. Aborting the signal in `onEnd()` removes both.
    el.addEventListener('animationend', handleAnimationEnd, { signal });
    el.addEventListener('animationcancel', handleAnimationEnd, { signal });

    // if there are no animations or animation is set to 0ms, end immediately. `getAnimations()` without `subtree`
    // counts the same animations the listener does: the element's own, not its pseudo-elements' or descendants'.
    requestAnimationFrame(() => {
      if (!resolved && el.getAnimations().length === 0) {
        onEnd();
      }
    });
  });
}

/** Parses a CSS duration and returns the number of milliseconds. */
export function parseDuration(duration: number | string) {
  duration = duration.toString().toLowerCase();

  if (duration.indexOf('ms') > -1) {
    return parseFloat(duration) || 0;
  }

  if (duration.indexOf('s') > -1) {
    return (parseFloat(duration) || 0) * 1000;
  }

  return parseFloat(duration) || 0;
}

/**
 * Reads the first of `properties` that is set on `el`, the way nested `var()` fallbacks resolve in a stylesheet.
 * `getPropertyValue()` has no fallback of its own: an unset property reads as an empty string, which
 * `parseDuration()` turns into 0ms.
 */
export function getCustomProperty(el: Element, ...properties: string[]) {
  const styles = getComputedStyle(el);
  for (const property of properties) {
    const value = styles.getPropertyValue(property).trim();
    if (value) {
      return value;
    }
  }
  return '';
}

/** Tells if the user has enabled the "reduced motion" setting in their browser or OS. */
export function prefersReducedMotion() {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  return query.matches;
}
