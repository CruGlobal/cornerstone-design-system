/**
 * The two controls on an Inspiration page's pill row.
 *
 * The page is built by `src/plugins/remark-inspiration.js`; this only opens what is already there.
 *
 *   - **The Experimental pill** is a `<button aria-expanded>` that shows or hides the one line under the pill
 *     row naming why. A disclosure rather than a tooltip, because a tooltip does not work on touch and cannot
 *     hold the links the line carries (#148, decision 2).
 *   - **"and N more"** in Used in opens the Connections tab, where the list is in full. A link with a
 *     `data-inspiration-tab` attribute names the tab to open, and focus moves to that tab so a keyboard or
 *     screen reader user lands where the list is, not back at the top of the page. A URL whose hash names a
 *     tab (`#connections`) opens it on arrival, and again whenever the hash changes.
 *
 * Loaded on every page from `astro.config.mjs`, like `component-browser.js`, so it leaves at once on any
 * page without the shell.
 */

const reasoning = document.querySelector('.inspiration-reasoning');

if (reasoning) {
  const status = document.querySelector('.inspiration-status');

  status?.addEventListener('click', () => {
    const open = status.getAttribute('aria-expanded') !== 'true';
    const reason = document.getElementById(status.getAttribute('aria-controls'));

    status.setAttribute('aria-expanded', String(open));

    if (reason) {
      reason.hidden = !open;
    }
  });

  /** Opens a reasoning tab by its panel name. `false` when the page has no such tab. */
  const openTab = (name, { focus }) => {
    const tab = reasoning.querySelector(`cs-tab[panel="${CSS.escape(name)}"]`);

    if (!tab) {
      return false;
    }

    reasoning.setAttribute('active', name);

    if (focus) {
      customElements.whenDefined('cs-tab').then(() => {
        tab.scrollIntoView({ block: 'center' });
        tab.focus({ preventScroll: true });
      });
    }

    return true;
  };

  document.addEventListener('click', (event) => {
    const link = event.target instanceof Element ? event.target.closest('[data-inspiration-tab]') : null;

    if (link && openTab(link.dataset.inspirationTab, { focus: true })) {
      event.preventDefault();
    }
  });

  /** Opens the tab the address names, if any. Never moves focus, so Back and Forward do not jump around. */
  const openFromHash = () => {
    if (location.hash.length <= 1) {
      return;
    }

    let name;

    try {
      name = decodeURIComponent(location.hash.slice(1));
    } catch {
      return; // a broken escape such as `#%E0` names no tab, so the page stays on its default one
    }

    openTab(name, { focus: false });
  };

  openFromHash();
  // Back, Forward and a plain in-page link change the hash without a reload.
  window.addEventListener('hashchange', openFromHash);
}
