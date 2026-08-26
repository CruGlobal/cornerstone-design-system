import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getComponent, loadComponents } from '@cruglobal/cornerstone-build-tools/component-api.js';
import matter from 'gray-matter';
import { componentCategories } from '../component-categories.js';

/**
 * The components browse page: a hero, a filter toolbar, and a card per component.
 *
 * Modelled on upstream's `/docs/components`, measured rather than approximated. Its shape there is a
 * full-bleed hero holding the title, a one-line description and a pill search field; a toolbar of
 * controls; then a stretch-aligned grid of cards, each carrying a name, the tag name in monospace, a
 * summary, and a footer of two badges. Cards are flat and alphabetical — category is a *filter*, not a
 * grouping, which is also why this fork's Eleventy site linked its category badge to
 * `?category={slug}`.
 *
 * **Two of upstream's controls are deliberately absent.** Its `All | Free | Pro` segmented control
 * filters a distinction this fork does not have — the package manifest decision deleted Pro
 * throughout — so it would be a filter over one value. And its "Data Viz" category is already
 * documented as dropped in component-categories.js, since no component here uses it.
 *
 * This owns the whole page, `<h1>` included, so that the title sits inside the hero where upstream has
 * it. `PageTitle.astro` renders nothing for this slug; the `id="_top"` the skip link targets moves
 * here with it. The front-matter `title` still names the browser tab and the search index, so the tab
 * reads "Browse Components" while the hero reads "Build with N Components" — the same split upstream
 * has.
 *
 * Everything except the prose is derived: the card count, each card's status and version from the
 * manifest, the category options from component-categories.js. Adding a component puts it on this page
 * with no edit here, which is the same property `remarkPageIndex` has for the other section indexes.
 */

const siteDir = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const contentDir = join(siteDir, 'src', 'content', 'docs');
const componentsDir = join(contentDir, 'components');

/** The one page this plugin builds. Keyed in `PageTitle.astro` too, which suppresses its own title. */
export const BROWSER_SLUG = 'components/index';

const escape = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * A manifest summary is markdown, and a card shows text.
 *
 * `<cs-accordion-item>`'s summary names its parent in a code span, which rendered as literal backticks
 * on the card. The Eleventy grid ran the summary through `inlineMarkdown | striptags`, which is the same
 * answer arrived at differently: render nothing, just drop the markers. Only code spans and emphasis
 * appear in the 70 summaries, so this does not need a markdown parser.
 */
const plain = (value) =>
  String(value)
    .replace(/`/g, '')
    .replace(/\*\*?([^*]+)\*\*?/g, '$1');

/**
 * Every published component page, with the front matter and manifest fields a card shows.
 *
 * A sub-component is included: the sidebar nests `<cs-tab>` under `<cs-tab-group>` because a tree has
 * somewhere to nest it, but a flat browse grid has not, and someone looking for "tab" should find it.
 */
function readComponents() {
  const manifest = loadComponents();

  return readdirSync(componentsDir)
    .filter((entry) => entry.endsWith('.md') && entry !== 'index.md')
    .map((entry) => {
      const name = entry.replace(/\.md$/, '');
      const { data } = matter(readFileSync(join(componentsDir, entry), 'utf-8'));
      const component = getComponent(manifest, `cs-${name}`);

      return {
        name,
        title: data.title ?? name,
        category: data.category ?? '',
        draft: data.draft === true,
        // The summary rather than the front-matter description, matching upstream and the Eleventy
        // grid. It is the `@summary` JSDoc, so it is the component's own one-line account of itself.
        summary: plain(component.summary ?? data.description ?? ''),
        status: component.status ?? '',
        since: component.since ?? '',
      };
    })
    .filter((component) => !component.draft)
    .sort((a, b) => a.title.localeCompare(b.title));
}

/** `3.7` → `003007`, so a string compare orders versions numerically. */
const sortableVersion = (since) =>
  String(since)
    .split('.')
    .map((part) => part.padStart(3, '0'))
    .join('');

function statusBadge(status) {
  if (status === 'stable') {
    return '<cs-badge variant="brand" pill><cs-icon name="check" slot="start"></cs-icon>Stable</cs-badge>';
  }

  if (status === 'experimental') {
    return (
      '<cs-badge variant="warning" appearance="filled" pill>' +
      '<cs-icon name="science" slot="start"></cs-icon>Experimental</cs-badge>'
    );
  }

  return '';
}

/**
 * One card.
 *
 * The data attributes are what the toolbar filters on, so the script never reads rendered text — a
 * filter that scraped the DOM would break the moment a card's markup changed. `data-search` carries the
 * name and the summary pre-lowercased, since that is the only field the search box needs.
 */
function card(component) {
  const badges = [
    statusBadge(component.status),
    component.since
      ? `<cs-badge variant="neutral" appearance="filled" pill>Since ${escape(component.since)}</cs-badge>`
      : '',
  ]
    .filter(Boolean)
    .join('');

  return (
    `<a class="component-card-link cs-link-plain hover-grow hover-emphasize-border"` +
    ` href="/components/${escape(component.name)}"` +
    ` data-name="${escape(component.title.toLowerCase())}"` +
    ` data-category="${escape(component.category)}"` +
    ` data-status="${escape(component.status)}"` +
    ` data-since="${escape(sortableVersion(component.since))}"` +
    ` data-search="${escape(`${component.title} ${component.name} ${component.summary}`.toLowerCase())}">` +
    `<cs-card class="component-card" has-footer>` +
    // Two nested stacks and upstream's own gaps: `s` between the identity block and the summary, `2xs`
    // between the name and its tag. Upstream wraps the inner stack in `wa-flank:end` so a Pro badge can
    // sit at the end of the name's row; there is no Pro here, so that flank would be a wrapper around a
    // single child and is left out.
    `<div class="cs-stack cs-gap-s">` +
    `<div class="cs-stack cs-gap-2xs">` +
    // An `<h3>`, as upstream has it — a card title is a heading, and this page turns its contents list
    // off, so 68 of them outline nothing.
    //
    // `cs-heading-l` carries the heading family, weight, condensed leading and balance. The tag is
    // `cs-font-size-s cs-color-text-quiet`, which is also upstream's pair, and deliberately not
    // `cs-caption-s`: `[class*='cs-caption']` sets `font-family: var(--cs-font-family-body)`, which
    // overrode `cs-native`'s `code { font-family: var(--cs-font-family-code) }` and rendered the tag name
    // in Inter — losing the one thing that makes it read as code. There is no `cs-font-family-*` utility
    // to put it back with.
    `<h3 class="cs-heading-l">${escape(component.title)}</h3>` +
    `<code class="appearance-plain cs-font-size-s cs-color-text-quiet">&lt;cs-${escape(component.name)}&gt;</code>` +
    `</div>` +
    `<p class="cs-color-text-quiet cs-body-s">${escape(component.summary)}</p>` +
    `</div>` +
    `<div class="component-card-footer cs-cluster cs-gap-2xs" slot="footer">${badges}</div>` +
    `</cs-card>` +
    `</a>`
  );
}

/** The hero: the page's `<h1>`, its description, and the search field, centred on a surface band. */
function hero(components, description) {
  return (
    `<div class="component-browser-hero cs-not-prose cs-text-center">` +
    `<div class="cs-stack cs-gap-m cs-align-items-center">` +
    `<h1 id="_top" class="cs-heading-3xl">Build with ${components.length} Components</h1>` +
    `<p class="component-browser-lede cs-body-l cs-text-wrap-balance">${escape(description)}</p>` +
    `<cs-input class="component-browser-search cs-visually-hidden-label" type="search" pill with-clear` +
    ` label="Filter components by name" placeholder="Find a component to use…">` +
    `<cs-icon name="search" slot="start"></cs-icon>` +
    `</cs-input>` +
    `</div>` +
    `</div>`
  );
}

/**
 * The toolbar: category, an Experimental toggle, and a sort order.
 *
 * The category options come from component-categories.js so this cannot drift from the sidebar's
 * sections or the badge on each reference page. "Release Date" sorts on the manifest's `since`,
 * newest first, which is what upstream's option of that name does.
 *
 * Upstream's controls carry no visible label, and an unlabelled control fails the WCAG 2.2 AA bar the
 * accessibility ticket set. Both are satisfied by giving each control a real `label` and hiding it
 * with `cs-visually-hidden-label`, a utility built for exactly this — it targets `::part(label)` and
 * `::part(form-control-label)` — rather than reaching for `aria-label`.
 */
function toolbar() {
  const options = componentCategories
    .map(({ label, slug }) => `<cs-option value="${escape(slug)}">${escape(label)}</cs-option>`)
    .join('');

  return (
    `<div class="component-browser-toolbar cs-cluster cs-gap-xl cs-align-items-center cs-not-prose">` +
    `<cs-select class="component-browser-category cs-visually-hidden-label" value="" label="Category" size="s">` +
    `<cs-icon name="category" slot="start"></cs-icon>` +
    `<cs-option value="">All Categories</cs-option>${options}</cs-select>` +
    `<cs-select class="component-browser-sort cs-visually-hidden-label" value="name" label="Sort by" size="s">` +
    `<cs-icon name="sort" slot="start"></cs-icon>` +
    `<cs-option value="name">Name</cs-option>` +
    `<cs-option value="since">Release Date</cs-option>` +
    `</cs-select>` +
    `<cs-checkbox class="component-browser-experimental" size="s" checked>Experimental</cs-checkbox>` +
    `</div>`
  );
}

export function remarkComponentBrowser() {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const processor = this;

  return (tree, file) => {
    const path = file.history?.[0] ?? '';

    if (!path.endsWith(join('content', 'docs', `${BROWSER_SLUG}.md`))) {
      return;
    }

    const components = readComponents();
    const { description = '' } = file.data?.astro?.frontmatter ?? {};

    // One `cs-stack` owns the rhythm between the bands, rather than a `margin-block-end` on each of
    // them — the utility is what the gap is for, and it keeps the spacing in the markup beside the
    // thing it spaces.
    const markup =
      `<div class="cs-stack cs-gap-xl">` +
      hero(components, description) +
      toolbar() +
      `<div class="component-browser-grid cs-grid cs-align-items-stretch cs-gap-l cs-not-prose">` +
      components.map(card).join('') +
      `</div>` +
      // Announced rather than merely shown: the grid is filtered live, so a screen reader needs to
      // hear that a query matched nothing.
      `<p class="component-browser-empty cs-body-m cs-color-text-quiet cs-text-center" role="status" hidden>` +
      `No components match that search.</p>` +
      `</div>`;

    // The authored body stays — it is the prose above the grid — and this goes after it.
    tree.children.push(...processor.parse(markup).children);
  };
}
