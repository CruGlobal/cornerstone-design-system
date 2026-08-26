import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadComponents } from '@cruglobal/cornerstone-build-tools/component-api.js';
import matter from 'gray-matter';
import { componentCategories } from './component-categories.js';
import { siteSections } from './site-sections.js';

/**
 * The navigation tree.
 *
 * Built rather than configured, for one reason: the component reference is grouped by **category**, and
 * a category is a front-matter field, not a directory. Starlight's `autogenerate` keys off directory
 * structure, so it can only produce one flat alphabetical list of 70 components — which is what this
 * site had, and which is not how anyone looks for a component. Reorganising the files into seven
 * category directories was the alternative, and it would change every component's URL.
 *
 * The other three groups reproduce `docs/_includes/sidebar.njk` — its labels, its order, and its
 * decision about what belongs where.
 *
 * Draft pages are skipped everywhere. Starlight excludes a draft from production builds, so a sidebar
 * entry pointing at one is a link that works in dev and 404s once deployed — the worst kind.
 *
 * Every group is expanded and stays expanded. Starlight renders a group as `<details>`, and `collapsed:
 * false` is what gives it the `open` attribute; the disclosure caret and the click-to-collapse behaviour
 * are then removed in docs.css. The tree is a map of the whole reference, not something to fold away.
 */

const siteDir = dirname(dirname(fileURLToPath(import.meta.url)));
const contentDir = join(siteDir, 'src', 'content', 'docs');

/** Every page in the collection, with the front matter the navigation needs. */
function readPages() {
  const walk = (dir) =>
    readdirSync(dir).flatMap((entry) => {
      const full = join(dir, entry);
      return statSync(full).isDirectory() ? walk(full) : full.endsWith('.md') ? [full] : [];
    });

  return walk(contentDir).map((file) => {
    const slug = relative(contentDir, file).replace(/\.md$/, '');
    const { data } = matter(readFileSync(file, 'utf-8'));

    return {
      slug,
      link: `/${slug.replace(/\/?index$/, '')}`,
      title: data.title ?? slug,
      category: data.category,
      parent: data.parent,
      draft: data.draft === true,
      /**
       * Starlight's own front-matter shape for a page's sidebar entry (`sidebar: { badge: … }`). Read here
       * because this tree is built by hand, so nothing applies it for us — and worth having: a badge is how
       * upstream marks its Pro pages in exactly this position, and it is the one place a "Soon" reads as
       * information rather than as decoration.
       */
      badge: data.sidebar?.badge,
      name: slug.split('/').pop(),
    };
  });
}

/**
 * The section labels, from the one list the subheader also renders, so a label edited in one place
 * changes in both.
 *
 * Three of the four, deliberately. The subheader has a **Components** link; this tree has no Components
 * group, because the seven categories are top-level sections — a component sits two levels from the top
 * rather than three, which is how the Eleventy sidebar read. So the two navigations agree on the section
 * *names* while differing on how the component reference is reached, which is the difference upstream has
 * too: its header links to a browse page, its sidebar lists the categories.
 */
const label = (name) => siteSections.find((section) => section.label === name)?.label ?? name;
const GETTING_STARTED = label('Getting Started');
const THEMING = label('Theming & Utilities');
const RESOURCES = label('Resources');

const pages = readPages();
const published = pages.filter((page) => !page.draft);
const byName = (a, b) => a.title.localeCompare(b.title);

/** One page by slug, or undefined if it is missing or a draft. */
const page = (slug) => published.find((candidate) => candidate.slug === slug);

/**
 * A manual entry, dropped when its page is absent.
 *
 * The Eleventy sidebar shipped three links to pages that do not exist in this fork — a Pro Figma kit, a
 * Pro patterns library, and a `chart` component — on all 133 pages. Resolving each entry against the
 * collection means a missing page removes its own link instead of shipping a dead one.
 */
const entry = (slug, label) => {
  const found = page(slug);
  return found ? { label: label ?? found.title, link: found.link } : null;
};

/**
 * Every page inside a directory, alphabetical, drafts omitted. Used only by Resources, which is a flat
 * list of pages rather than a section with an index.
 */
const group = (label, dir) => {
  const items = published
    .filter((candidate) => candidate.slug.startsWith(`${dir}/`) && !candidate.slug.endsWith('/index'))
    .sort(byName)
    .map((candidate) => ({
      label: candidate.title,
      link: candidate.link,
      ...(candidate.badge ? { badge: candidate.badge } : {}),
    }));

  return items.length ? { label, collapsed: false, items } : null;
};

/**
 * The component reference, by category.
 *
 * A component with a `parent` nests under it — `<cs-tab>` beneath `<cs-tab-group>` — which is what
 * keeps sub-components out of the top level of a category. Starlight has no nesting inside an
 * autogenerated group, which is the other reason this is built by hand.
 *
 * An experimental component is marked with `data-experimental`, which docs.css renders as a quiet
 * marker. The Eleventy sidebar drew a flask icon there, and SidebarList.astro draws the Material Symbols
 * `science` glyph in its place.
 */
function componentGroups() {
  const components = loadComponents();
  const status = new Map(components.map((component) => [component.tagName.replace(/^cs-/, ''), component.status]));

  const reference = published.filter((candidate) => candidate.slug.startsWith('components/'));
  const children = new Map();

  for (const candidate of reference) {
    if (candidate.parent) {
      children.set(candidate.parent, [...(children.get(candidate.parent) ?? []), candidate]);
    }
  }

  /**
   * One component, and its sub-components after it as siblings rather than as a nested group.
   *
   * A Starlight entry is either a link or a group, never both — `{ link, items }` fails the build. Making
   * a parent into a group therefore meant repeating it as its own first child, which read as a heading
   * with a duplicate beneath it. Sub-components are emitted flat instead, carrying `data-nested` so
   * docs.css can indent them against their own rule. That is the shape the Eleventy sidebar had: a
   * parent is an ordinary link, and depth is shown rather than structured.
   *
   * `attrs` is available on link entries and explicitly forbidden on groups (`attrs: z.never()` in
   * Starlight's schema), which is the other reason the flat shape is the workable one.
   */
  const toEntries = (candidate, depth = 0) => {
    const nested = (children.get(candidate.name) ?? []).sort(byName);
    const experimental = status.get(candidate.name) === 'experimental';

    return [
      {
        label: candidate.title,
        link: candidate.link,
        attrs: {
          ...(depth ? { 'data-nested': String(depth) } : {}),
          ...(experimental ? { 'data-experimental': 'true' } : {}),
        },
      },
      ...nested.flatMap((child) => toEntries(child, depth + 1)),
    ];
  };

  return componentCategories
    .map(({ label }) => {
      const items = reference
        .filter((candidate) => candidate.category === label && !candidate.parent)
        .sort(byName)
        .flatMap((candidate) => toEntries(candidate));

      return items.length ? { label, collapsed: false, items } : null;
    })
    .filter(Boolean);
}

/**
 * Component pages with no category, so a new page cannot go missing from the navigation silently.
 *
 * `components/index` is exempt, and deliberately absent from the tree: the tree already lists every
 * component under its category, so a "Browse Components" entry would duplicate all of it. The page is
 * reached from the search dialog's first quick link and from the category badge on every reference
 * page — which is also how the Eleventy site did it, since its sidebar never linked the browse grid
 * either.
 */
function uncategorized() {
  const orphans = published
    .filter((candidate) => candidate.slug.startsWith('components/'))
    .filter((candidate) => candidate.slug !== 'components/index')
    .filter((candidate) => !candidate.parent && !componentCategories.some(({ label }) => label === candidate.category))
    .sort(byName);

  return orphans.length
    ? { label: 'Uncategorized', collapsed: false, items: orphans.map((o) => ({ label: o.title, link: o.link })) }
    : null;
}

export const sidebar = [
  {
    label: GETTING_STARTED,
    items: [
      entry('index', 'Installation'),
      entry('usage', 'Usage'),
      entry('form-controls', 'Forms'),
      entry('localization', 'Localization'),
      // Frameworks and Using with AI are single links, not groups. Outside the component reference the
      // tree is one level deep: a section's children are reached from its index page, which lists them as
      // a card grid (see src/plugins/remark-page-index.js). Putting them in the tree as well duplicates
      // the index page in the navigation and buries the sections that are not nested.
      entry('frameworks', 'Frameworks'),
      entry('ai/index', 'Using with AI'),
      entry('ssr', 'Server Rendering'),
    ].filter(Boolean),
  },
  {
    label: RESOURCES,
    // Every page in resources/, rather than the Eleventy list, because that list named two Pro pages
    // this fork does not have and omitted two pages it does.
    items: [group(RESOURCES, 'resources')?.items ?? []].flat(),
  },
  {
    label: THEMING,
    // The Eleventy sidebar's order, which puts the two pages that show you a theme before the two that
    // explain how to build one.
    items: [
      entry('theming-overview', 'Overview'),
      entry('themes', 'Built-in Themes'),
      entry('color-palettes', 'Color Palettes'),
      entry('tokens/index', 'Design Tokens'),
      entry('customizing', 'Customizing & Theming'),
      entry('utilities/index', 'CSS Utilities'),
    ].filter(Boolean),
  },
  // The component categories are top-level sections, not a "Components" group containing them. That is
  // how the Eleventy sidebar reads: a category heading sits at the same margin as "Getting Started", so a
  // component is two levels from the top rather than three.
  ...componentGroups(),
  uncategorized(),
].filter(Boolean);
