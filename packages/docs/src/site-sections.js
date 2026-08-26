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
export const siteSections = [
  {
    label: 'Getting Started',
    link: '/',
    match: ['/usage', '/form-controls', '/frameworks', '/ai', '/ssr', '/localization'],
  },
  { label: 'Components', link: '/components', match: ['/components'] },
  {
    label: 'Theming & Utilities',
    link: '/themes',
    match: ['/themes', '/color-palettes', '/tokens', '/utilities', '/customizing', '/theming-overview'],
  },
  { label: 'Resources', link: '/resources', match: ['/resources'] },
];

/**
 * The section a path belongs to, or undefined.
 *
 * Longest prefix wins, so `/components` cannot claim a page that a more specific section also matches.
 * The root is special-cased: every path starts with `/`, so it can only match exactly.
 */
export function sectionFor(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/';

  if (path === '/') {
    return siteSections[0];
  }

  return siteSections
    .flatMap((section) => section.match.map((prefix) => ({ section, prefix })))
    .filter(({ prefix }) => prefix !== '/' && (path === prefix || path.startsWith(`${prefix}/`)))
    .sort((a, b) => b.prefix.length - a.prefix.length)[0]?.section;
}
