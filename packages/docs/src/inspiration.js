import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { categoryFor, tiers } from './inspiration-categories.js';

/**
 * The Inspiration library as data: every entry, what it is built from, and where it is used.
 *
 * Everything here is **read from markup, never hand-written** (#144). An entry's frontmatter says only what
 * the markup cannot: its title, description, category, the labels of a Screen's States, the steps of a Flow,
 * and a raise-only `status: experimental`. The rest is derived:
 *
 *   - **Tier** is the folder: `inspiration/patterns/`, `inspiration/screens/`, `inspiration/flows/`.
 *   - **Components** are the `cs-*` tags in a Pattern's `{.example}` fences, in every one of a Screen's
 *     state files, or across every Screen a Flow passes through. Sub-components fold under their parent
 *     using the `parent:` field the component pages already carry (`cs-tab` lists as `cs-tab-group`).
 *   - **Patterns** come from `<!-- pattern: name -->` markers in that same markup.
 *   - **Status** is experimental when any tag the entry uses is `experimental` in the Custom Elements
 *     Manifest, or when the entry raises it. It can never be lowered.
 *   - **Used in** is the reverse of the above: the Screens whose markers name a Pattern, and the Flows
 *     whose steps name a Screen.
 *
 * The page shell (`plugins/remark-inspiration.js`) and the navigation (`sidebar.js`) both read this, so the
 * pill row, the Connections tab and the sidebar's flask cannot disagree about an entry.
 *
 * **Drafts.** The settings slice goes live together (UIUX-209), so its entries are `draft: true` until the
 * last one lands, and a draft may point at an entry that does not exist yet: the settings Flow names Edit
 * profile before Edit profile is written. A draft keeps that reference and the page marks it "not written
 * yet". A **published** entry with a missing reference fails the build, which is the rule #144 set for Flow
 * steps, applied to pattern markers too. Published entries also never list a draft in Used in, since the
 * link would be a 404 once deployed.
 */

const siteDir = dirname(dirname(fileURLToPath(import.meta.url)));

export const defaultPaths = {
  contentDir: join(siteDir, 'src', 'content', 'docs'),
  screensDir: join(siteDir, 'public', 'assets', 'examples', 'inspiration', 'screens'),
};

/** Where a Screen's state files are served from, under the site root. */
export const SCREENS_URL = '/assets/examples/inspiration/screens';

const MARKER = /<!--\s*(\/?)pattern(?::\s*([a-z0-9-]+))?\s*-->/g;

/**
 * Removes every `<!-- pattern: name -->` and `<!-- /pattern -->` marker, with the line it sat on when it
 * had one to itself.
 *
 * The markers are a claim about the markup for this site to read, not part of what a team copies (#148,
 * "Rules for whoever builds it"). Every place that hands markup to a reader goes through this one function,
 * so the rule has one implementation to test.
 */
export const stripPatternMarkers = (html) =>
  html.replace(/^[ \t]*<!--\s*\/?pattern(?::[^>]*?)?\s*-->[ \t]*\r?\n/gm, '').replace(MARKER, '');

/** The pattern names a piece of markup marks, in first-seen order. */
export const patternMarkers = (html) => [
  ...new Set([...html.matchAll(MARKER)].filter((match) => !match[1] && match[2]).map((match) => match[2])),
];

/** Every `cs-*` tag a piece of markup uses, ignoring comments. */
export const tagsIn = (html) =>
  new Set([...html.replace(/<!--[\s\S]*?-->/g, '').matchAll(/<(cs-[a-z0-9]+(?:-[a-z0-9]+)*)[\s/>]/g)].map((m) => m[1]));

/** The live-example fences in a Pattern's markdown, as written. */
export const exampleFences = (markdown) =>
  [...markdown.matchAll(/^```html[ \t]+\{[^}\n]*\.example[^}\n]*\}[^\n]*\n([\s\S]*?)^```/gm)].map((m) => m[1]);

/** `edit-profile` → `Edit profile`, for an entry that is named before it exists. */
export const titleFromSlug = (slug) => slug.replace(/-/g, ' ').replace(/^./, (character) => character.toUpperCase());

/** `a`, `a and b`, `a, b and c`: the house list style, which drops the serial comma like the prototype. */
export function listOf(items) {
  return items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/** Reads `parent:` from every component page, so sub-components can fold under the component they belong to. */
export function readComponentParents(contentDir) {
  const dir = join(contentDir, 'components');

  if (!existsSync(dir)) {
    return new Map();
  }

  return new Map(
    readdirSync(dir)
      .filter((name) => name.endsWith('.md'))
      .map((name) => [`cs-${name.replace(/\.md$/, '')}`, matter(readFileSync(join(dir, name), 'utf-8')).data.parent])
      .filter(([, parent]) => parent)
      .map(([tag, parent]) => [tag, `cs-${parent}`]),
  );
}

/** A Flow step is a Screen slug or `screen.state`. */
function parseStep(step, where) {
  if (typeof step !== 'string' || !/^[a-z0-9-]+(\.[a-z0-9-]+)?$/.test(step)) {
    throw new Error(`${where}: step "${step}" is not a Screen slug or a "screen.state".`);
  }

  const [screen, state] = step.split('.');

  return { screen, state: state ?? null };
}

/**
 * Loads the whole library.
 *
 * @param {object} options
 * @param {string} [options.contentDir] The docs collection root (it holds `inspiration/` and `components/`).
 * @param {string} [options.screensDir] Where Screen state files live.
 * @param {{ tagName: string, status?: string }[]} options.components The manifest's custom elements.
 */
export function loadInspiration({
  contentDir = defaultPaths.contentDir,
  screensDir = defaultPaths.screensDir,
  components,
}) {
  const status = new Map(components.map((component) => [component.tagName, component.status]));
  const parents = readComponentParents(contentDir);
  const fold = (tag) => parents.get(tag) ?? tag;
  const entries = new Map();

  for (const tier of Object.keys(tiers)) {
    const dir = join(contentDir, 'inspiration', tier);

    if (!existsSync(dir)) {
      continue;
    }

    for (const name of readdirSync(dir).filter((file) => file.endsWith('.md') && file !== 'index.md')) {
      const slug = name.replace(/\.md$/, '');
      const id = `${tier}/${slug}`;
      const where = `inspiration/${id}.md`;
      const source = readFileSync(join(dir, name), 'utf-8');
      const { data, content } = matter(source);

      if (data.status !== undefined && data.status !== 'experimental') {
        throw new Error(
          `${where}: status may only be "experimental". It can raise a status the markup does not, never lower one.`,
        );
      }

      if (data.states !== undefined && tier !== 'screens') {
        throw new Error(`${where}: only a Screen has states.`);
      }

      if (tier === 'flows' && !(Array.isArray(data.screens) && data.screens.length > 0)) {
        throw new Error(`${where}: a Flow lists its steps in an ordered \`screens:\` field.`);
      }

      if (data.screens !== undefined && tier !== 'flows') {
        throw new Error(`${where}: only a Flow has a \`screens:\` list.`);
      }

      const states = data.states ?? {};
      let markup = [];

      if (tier === 'patterns') {
        markup = exampleFences(content);
      } else if (tier === 'screens') {
        markup = [slug, ...Object.keys(states).map((state) => `${slug}.${state}`)].map((file) => {
          const path = join(screensDir, `${file}.html`);

          if (!existsSync(path)) {
            throw new Error(`${where}: no state file at public/assets/examples/inspiration/screens/${file}.html.`);
          }

          return readFileSync(path, 'utf-8');
        });
      }

      entries.set(id, {
        id,
        tier,
        slug,
        where,
        href: `/inspiration/${id}`,
        title: data.title ?? slug,
        description: data.description ?? '',
        category: categoryFor(tier, data.category, where),
        draft: data.draft === true,
        raised: data.status === 'experimental',
        states,
        steps: tier === 'flows' ? data.screens.map((step) => parseStep(step, where)) : [],
        markup,
        tags: new Set(markup.flatMap((html) => [...tagsIn(html)])),
        patternNames: [...new Set(markup.flatMap(patternMarkers))],
      });
    }
  }

  const byTitle = (a, b) => a.title.localeCompare(b.title);

  /** One reference from `entry` to `target`, resolved or marked missing. Missing fails a published entry. */
  const resolve = (entry, tier, slug, what) => {
    const target = entries.get(`${tier}/${slug}`);

    if (target && (entry.draft || !target.draft)) {
      return { entry: target, title: target.title, href: target.href };
    }

    if (!entry.draft) {
      throw new Error(
        target
          ? `${entry.where}: ${what} "${slug}" is still a draft, so this published entry would link to a page that is not built.`
          : `${entry.where}: ${what} "${slug}" names no ${tiers[tier].label} at inspiration/${tier}/${slug}.md.`,
      );
    }

    return { entry: target ?? null, title: target?.title ?? titleFromSlug(slug), href: null, missing: !target };
  };

  for (const entry of entries.values()) {
    if (entry.tier === 'flows') {
      entry.steps = entry.steps.map((step) => {
        const screen = resolve(entry, 'screens', step.screen, 'step');

        if (step.state && screen.entry && !(step.state in screen.entry.states)) {
          throw new Error(`${entry.where}: step "${step.screen}.${step.state}" names no State of ${screen.title}.`);
        }

        return {
          ...step,
          ...screen,
          stateLabel: step.state ? (screen.entry?.states[step.state] ?? titleFromSlug(step.state)) : null,
        };
      });

      // A Flow is built from its Screens, and from whatever they are built from.
      entry.tags = new Set(entry.steps.flatMap((step) => [...(step.entry?.tags ?? [])]));
    }

    entry.patterns = entry.patternNames.map((name) => resolve(entry, 'patterns', name, 'pattern marker')).sort(byTitle);
    entry.components = [...new Set([...entry.tags].map(fold))].sort();
    entry.experimental = [...entry.tags].filter((tag) => status.get(tag) === 'experimental').sort();
    entry.status = entry.experimental.length > 0 || entry.raised ? 'experimental' : 'stable';
  }

  for (const entry of entries.values()) {
    const users = [...entries.values()].filter((other) =>
      entry.tier === 'patterns'
        ? other.tier === 'screens' && other.patternNames.includes(entry.slug)
        : entry.tier === 'screens'
          ? other.tier === 'flows' && other.steps.some((step) => step.screen === entry.slug)
          : false,
    );

    entry.usedIn = users
      .filter((other) => entry.draft || !other.draft)
      .sort(byTitle)
      .map((other) => ({ entry: other, title: other.title, href: other.href }));
  }

  return entries;
}
