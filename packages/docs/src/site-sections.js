/**
 * The site's top-level sections, in reading order.
 *
 * One list, read by two navigations: the subheader renders it as a row of links, and `sidebar.js` takes
 * its group labels from it. That is the point of the file — upstream's header nav and its sidebar agree
 * because they are the same four sections, and ours cannot drift into disagreeing if the labels have a
 * single home.
 *
 * `match` is the set of path prefixes that count as "inside" a section, used to mark the current one.
 * It is explicit rather than derived from `link`, because a section's pages do not all live under its
 * landing page: Getting Started owns `/usage` and `/frameworks`, which share no prefix with `/`.
 */
/**
 * The base the site is served under, without a trailing slash. `import.meta.env.BASE_URL` rather than
 * `build-tools/site-url.js`: this module is imported by components that Vite bundles, and anything that
 * derives a path from its own `import.meta.url` resolves against the bundle's location once bundled.
 * Astro substitutes this at build time, so it survives.
 */
const BASE = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');

/** A site path, prefixed with the base. An empty base leaves it untouched. */
export const path = (p) => `${BASE}${p}`;

/** A pathname as the browser sees it, reduced to the shape `match` prefixes are written in. */
export const stripBase = (pathname) =>
  BASE && pathname.startsWith(BASE) ? pathname.slice(BASE.length) || '/' : pathname;

export const siteSections = [
  {
    label: 'Getting Started',
    link: path('/'),
    match: ['/usage', '/form-controls', '/frameworks', '/ai', '/ssr', '/localization'],
  },
  { label: 'Components', link: path('/components'), match: ['/components'] },
  {
    label: 'Theming & Utilities',
    link: path('/themes'),
    match: ['/themes', '/color-palettes', '/tokens', '/utilities', '/customizing', '/theming-overview'],
  },
  { label: 'Resources', link: path('/resources'), match: ['/resources'] },
];

/**
 * The section a path belongs to, or undefined.
 *
 * Longest prefix wins, so `/components` cannot claim a page that a more specific section also matches.
 * The root is special-cased: every path starts with `/`, so it can only match exactly.
 */
export function sectionFor(pathname) {
  // The browser's pathname includes the base path; `match` prefixes are written without it.
  const path = stripBase(pathname).replace(/\/+$/, '') || '/';

  if (path === '/') {
    return siteSections[0];
  }

  return siteSections
    .flatMap((section) => section.match.map((prefix) => ({ section, prefix })))
    .filter(({ prefix }) => prefix !== '/' && (path === prefix || path.startsWith(`${prefix}/`)))
    .sort((a, b) => b.prefix.length - a.prefix.length)[0]?.section;
}
