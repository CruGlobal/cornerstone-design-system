/**
 * Keeps the navigation's scroll position across a route change.
 *
 * This site does full page loads — there is no `ClientRouter` and no view transitions — so every click
 * rebuilds the document, and a navigation scrolled halfway down snapped back to the top on arrival. The
 * sidebar is one static tree (`sidebar.js` exports a single `sidebar` array used on every page), so the
 * position is meaningful across pages and worth carrying: a global offset in `sessionStorage`.
 *
 * **The scroller is `cs-page`'s `menu` part, not anything this site renders.** `page.styles.ts` gives
 * `[part~='menu']` `position: sticky`, a `max-height` of the viewport minus the chrome, and `overflow: auto`,
 * so the element that actually scrolls lives inside the component's shadow root. That is why this reaches
 * through `shadowRoot` — the alternative would be a second scroll container of our own inside the slot,
 * which would nest two scrollers and give the sticky one nothing to do.
 *
 * Restoring is safe against a shorter tree: assigning past the maximum clamps, so a long offset carried onto
 * a page with less navigation lands at the bottom rather than out of bounds. And there is no
 * `scroll-behavior: smooth` anywhere in the site's CSS, so the assignment is instant rather than animated.
 *
 * Two guards matter:
 *
 *   - **Only save when the menu can actually scroll.** A `template: splash` page slots no navigation, and on
 *     mobile the tree moves into `cs-page`'s drawer, so in both cases the menu measures zero overflow. Saving
 *     there would write a 0 over a real position and reintroduce the bug on the way back.
 *   - **Save on `pagehide`, not `beforeunload`.** `pagehide` fires for the back/forward cache too, and does
 *     not opt the page out of it the way a `beforeunload` listener can.
 *
 * The capture-phase click listener is belt and braces: `pagehide` is reliable in current browsers, but it is
 * the one event that a navigation can outrun, and a click inside the navigation is the moment the position
 * is worth keeping.
 *
 * With nothing stored — a first visit, or a new session — the navigation's own entry for this page is
 * brought into view instead, so a deep page does not open with its place in the tree scrolled off screen.
 * On a page the tree does not list, that falls back to the section containing it.
 */

const KEY = 'cs-nav-scroll';

const menuElement = async () => {
  const page = document.querySelector('cs-page');

  if (!page) {
    return null;
  }

  await customElements.whenDefined('cs-page');
  await page.updateComplete;

  return page.shadowRoot?.querySelector('[part~="menu"]') ?? null;
};

const menu = await menuElement();

if (menu) {
  const scrollable = () => menu.scrollHeight > menu.clientHeight;
  const stored = sessionStorage.getItem(KEY);

  if (stored !== null && scrollable()) {
    menu.scrollTop = Number(stored);
  } else {
    // Queried on the document, not on `menu`: the navigation is slotted, so the links are light-DOM children
    // of `cs-page` rather than descendants of the shadow element that scrolls them.
    const links = [...document.querySelectorAll('[slot="navigation"] a[href]')];

    // A page one level deep is deliberately absent from the tree — `sidebar.js` keeps non-reference sections
    // one level deep — so `aria-current` finds nothing on `/tokens/color`. Fall back to the entry that
    // *contains* it, which is the longest href this path starts with. `/` prefixes everything, so it sorts
    // last and only wins when nothing better matches.
    const current =
      links.find((link) => link.getAttribute('aria-current') === 'page') ??
      links
        .filter((link) => location.pathname.startsWith(link.getAttribute('href')))
        .sort((a, b) => b.getAttribute('href').length - a.getAttribute('href').length)[0];

    // `block: 'nearest'` rather than `center` so it only moves when the link is genuinely out of view — a
    // navigation that already fits stays put instead of being recentred for no reason.
    current?.scrollIntoView({ block: 'nearest' });
  }

  const save = () => {
    if (scrollable()) {
      // Rounded: a fractional `scrollTop` is legal but stores as `1403.5`, which reads like a bug later.
      sessionStorage.setItem(KEY, String(Math.round(menu.scrollTop)));
    }
  };

  addEventListener('pagehide', save);
  menu.addEventListener('click', save, { capture: true });
}
