import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { visit } from 'unist-util-visit';
import { badgeVariant } from '../badge-variants.js';
import { DOCS_BASE_PATH } from '@cruglobal/cornerstone-build-tools/site-url.js';

/**
 * Renders a card grid of child pages on a section's index page.
 *
 * The navigation is one level deep outside the component reference — "Design Tokens", "CSS Utilities"
 * and "Frameworks" are single links, and their children are reached from the page itself. That is the
 * shape the Eleventy sidebar had, and it only works if the index pages actually list their children.
 * On the Eleventy side each one did that with a `{% for %}` loop over a collection; here the loop is a
 * plugin, so adding a page to a section puts it on the section's index without anyone editing the index.
 *
 * Opt in with front matter:
 *
 *   pageIndex: true         list the pages beside this one, for a `<dir>/index.md`
 *   pageIndex: frameworks   list the pages in that directory, for a page that sits outside it
 *
 * The grid is appended to the page, which suits an index that ends with its listing. A page that carries
 * on afterwards puts `::page-index` where the grid belongs instead:
 *
 *   ## AI-Ready Documentation
 *
 *   ::page-index
 *
 *   ## AI Policy
 *
 * Each card carries a page's `sidebar.badge`, so a listing can mark one Recommended or Untested without a
 * second front-matter key. See the note above `BADGE_VARIANTS`.
 *
 * Pages are grouped by `tags`, where the heading is derived from the value — `styleUtilities` becomes
 * "Style Utilities". That reproduces the two grids the utilities index had, without a second
 * front-matter key to describe them. A child with no tag lands in a trailing **Other** group rather
 * than vanishing, mirroring the sidebar's `uncategorized()`: a page added wrong should look wrong, not
 * look absent.
 *
 * The component reference does **not** use this. It was grouped here briefly, by category, until the
 * browse page was rebuilt against upstream's design — where category is a filter and the cards are flat
 * — so that page has its own plugin and this one lost its only reason to group by anything but `tags`.
 */

const contentDir = join(dirname(dirname(dirname(fileURLToPath(import.meta.url)))), 'src', 'content', 'docs');

/** `styleUtilities` → `Style Utilities`. */
const headingFor = (tag) =>
  tag.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/^./, (character) => character.toUpperCase());

function childrenOf(dir) {
  const full = join(contentDir, dir);

  return readdirSync(full)
    .filter((entry) => entry.endsWith('.md') && entry !== 'index.md')
    .filter((entry) => statSync(join(full, entry)).isFile())
    .map((entry) => {
      const { data } = matter(readFileSync(join(full, entry), 'utf-8'));

      return {
        title: data.title ?? entry,
        description: data.description ?? '',
        // A tags value may be a string or a list; only the first matters for grouping.
        tag: Array.isArray(data.tags) ? data.tags[0] : data.tags,
        // Starlight's own `sidebar.badge`, reused here. Most sections in this tree are one level deep —
        // see the note in `sidebar.js` — so their pages have no sidebar entry for a badge to appear beside,
        // and the listing is where a reader actually chooses between them. Reading the same front matter
        // keeps one source of truth, and keeps working if a section ever does get nested.
        badge: data.sidebar?.badge ?? null,
        draft: data.draft === true,
        link: `${DOCS_BASE_PATH}/${dir}/${entry.replace(/\.md$/, '')}`,
      };
    })
    .filter((child) => !child.draft)
    .sort((a, b) => a.title.localeCompare(b.title));
}

const escape = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/**
 * `hover-grow hover-emphasize-border` are docs-site classes, not library utilities — upstream ships them in
 * its documentation site and nowhere in the package, which was checked by searching all 33 stylesheets its
 * docs load and all 13 utility files the library imports. Upstream puts the same pair on every listing card
 * it has: `/docs/frameworks`, `/docs/tokens` and `/docs/utilities` all carry them. Ours had them only on the
 * component browse grid, which is what this fixes.
 *
 * No `cs-link-plain` alongside them: `.page-index-card` already sets `text-decoration: none` and
 * `.page-index-name` sets the colour, so the utility would be redundant. That also matches upstream's own
 * tokens and utilities pages, which use the hover pair alone.
 */

const badgeFor = (badge) =>
  badge
    ? `<cs-badge class="page-index-badge" variant="${escape(badgeVariant(badge.variant))}"` +
      ` appearance="filled" pill>${escape(badge.text)}</cs-badge>`
    : '';

const card = (child) =>
  `<a class="page-index-card hover-grow hover-emphasize-border" href="${child.link}">` +
  `<cs-card>` +
  `<span class="page-index-heading cs-cluster cs-gap-2xs cs-align-items-center">` +
  `<span class="page-index-name">${escape(child.title)}</span>` +
  badgeFor(child.badge) +
  `</span>` +
  (child.description ? `<p class="page-index-summary">${escape(child.description)}</p>` : '') +
  `</cs-card>` +
  `</a>`;

const grid = (children) => `<div class="page-index cs-grid">${children.map(card).join('')}</div>`;

/**
 * The listing's groups, in first-seen tag order, with untagged children last.
 */
function groupsFor(children) {
  const tags = [...new Set(children.map((child) => child.tag).filter(Boolean))];
  const grouped = tags.map((tag) => ({
    label: headingFor(tag),
    items: children.filter((child) => child.tag === tag),
  }));
  const ungrouped = children.filter((child) => !child.tag);

  return ungrouped.length && grouped.length ? [...grouped, { label: 'Other', items: ungrouped }] : grouped;
}

export function remarkPageIndex() {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const processor = this;

  return (tree, file) => {
    const pageIndex = file.data?.astro?.frontmatter?.pageIndex;

    if (!pageIndex) {
      return;
    }

    const path = file.history?.[0] ?? '';
    const slug = relative(contentDir, path).replace(/\.md$/, '');
    const dir = pageIndex === true ? dirname(slug) : String(pageIndex);
    const children = childrenOf(dir);

    if (!children.length) {
      return;
    }

    // A markdown heading rather than raw HTML, deliberately: it lands in the "On this page" aside and
    // takes its id from its own text, so a group is linkable without this plugin minting ids.
    const groups = groupsFor(children);

    const markup = groups.length
      ? groups.map((group) => `## ${group.label}\n\n${grid(group.items)}`).join('\n\n')
      : grid(children);

    const nodes = processor.parse(markup).children;

    // Placed at `::page-index` when the page marks a spot, appended otherwise.
    //
    // Appending is right for a page that *ends* with its listing, which four of the five do. `ai/index.md`
    // does not: its cards belong under "AI-Ready Documentation" and it closes with an "AI Policy" section,
    // so appending put the grid after the sign-off. It had been hiding that by hand-rolling its own grid in
    // the right place — which also rendered every child twice, once by hand and once here.
    //
    // A leaf directive rather than a comment or a heading match, because that is how every other generated
    // block on this site is positioned: `::theme-preview`, `::color-palette`, `::palette-install`.
    /** @type {{ index: number, parent: { children: unknown[] } } | undefined} */
    let marker;

    visit(tree, 'leafDirective', (node, index, parent) => {
      if (node.name === 'page-index') {
        marker = { index, parent };
      }
    });

    if (marker) {
      marker.parent.children.splice(marker.index, 1, ...nodes);
      return;
    }

    tree.children.push(...nodes);
  };
}
