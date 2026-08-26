/**
 * Keeps the library's colour scheme in step with Starlight's.
 *
 * Two systems name the same idea differently. Starlight stamps `data-theme="light|dark"` on `<html>`
 * from a pre-paint script backed by the `starlight-theme` localStorage key. Cornerstone's themes scope
 * their dark values to a `.cs-dark` **class** — `themes/cru.css` declares them for
 * `.cs-dark, .cs-light .cs-invert, …` — so without that class every `cs-*` component renders its light
 * values no matter what Starlight's toggle says. The visible symptom is a dark page frame wrapped
 * around light components.
 *
 * This mirrors one onto the other. It runs inline in `<head>` so the class is present before first
 * paint, and observes the attribute afterwards so the toggle keeps working.
 *
 * `cs-theme-cru` is set here too. The theme's values also apply through `:where(:root)`, so the class
 * is not strictly required — but the design skill's rule 6 is to state the theme on `<html>`, and
 * stating it means a second theme can be added later without this page silently keeping the first.
 *
 * No palette class is set. `.cs-palette-cru` does not exist in any stylesheet, and emitting a class
 * that matches nothing would only look like the sub-brand axis is wired up when it is not.
 */
export const themeSync = `
(() => {
  const root = document.documentElement;

  // Resolved the way Starlight resolves it, rather than by reading the attribute Starlight sets.
  // Astro decides where in <head> each injected script lands, and this one currently lands BEFORE
  // Starlight's provider — so reading data-theme would resolve to light on first paint and only be
  // corrected by the observer below, flashing light components inside a dark frame. Computing it
  // from the same two inputs makes the result independent of that order.
  const resolve = () => {
    const stored = typeof localStorage !== 'undefined' && localStorage.getItem('starlight-theme');
    const theme = stored || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    return root.dataset.theme || theme;
  };

  const apply = () => {
    const dark = resolve() === 'dark';
    root.classList.toggle('cs-dark', dark);
    root.classList.toggle('cs-light', !dark);
    root.classList.add('cs-theme-cru');
  };

  apply();

  // The three-event lifecycle the example panels listen for. An example can be flipped to its own
  // colour scheme with its theme button, which puts cs-light or cs-dark on that preview; when the
  // PAGE scheme then changes, those per-example overrides have to be absorbed back or the example
  // keeps a scheme the reader did not ask for. code-examples.js does that work, and it needs to be
  // told before, during and after — 'change' to tag the previews it will animate, 'applied' to
  // absorb them while the view transition has them captured, 'settled' to clean up.
  const emit = (name) => document.dispatchEvent(new Event(name));

  // Starlight's toggle rewrites the attribute rather than emitting an event of its own.
  new MutationObserver(() => {
    emit('color-scheme-change');
    apply();
    emit('color-scheme-applied');
    emit('color-scheme-settled');
  }).observe(root, { attributeFilter: ['data-theme'] });
})();
`;
