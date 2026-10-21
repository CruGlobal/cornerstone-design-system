/** Same as `el.animate()`, except returns a promise that doesn't throw an error when the animation is canceled. */
export async function animate(el: Element, keyframes: Keyframe[], options?: KeyframeAnimationOptions) {
  return el.animate(keyframes, options).finished.catch(() => {
    /* suppress errors in Safari */
  });
}

/**
 * Applies a class to the specified element to animate it. The class is removed after the animation finishes and then
 * the promise resolves. If a timeout is provided, the class will be removed and the animation will
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

    el.addEventListener('animationend', onEnd, { once: true, signal });
    el.addEventListener('animationcancel', onEnd, { once: true, signal });

    // if there are no animations or animation is set to 0ms, end immediately
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
