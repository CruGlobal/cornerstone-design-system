/**
 * Ports component reference pages from the Eleventy site to this one.
 *
 * The body is copied **byte for byte**. Only front matter is rewritten, because only front matter was
 * Eleventy's: `layout` becomes the collection's job, and `description` comes from the Custom Elements
 * Manifest summary, which the Eleventy layout injected at render time rather than storing in the page.
 * Everything else — the ```html {.example} fences, the raw HTML, the `:::` containers — is handled by
 * the remark plugins, so a page needs no edit to move.
 *
 * It is safe to re-run. A page that already exists here is left alone unless `--force` is passed, so
 * porting the corpus once and then editing pages over time is the intended workflow rather than a
 * hazard. `--force` overwrites, which discards any hand edits, so it names what it is doing.
 *
 * The report is the point as much as the copy. Every page is scanned for the things this site does not
 * yet handle — Nunjucks left in the markdown, `[[Key]]` tokens, links to pages that have not moved,
 * upstream identity — and each page is graded so the page-by-page pass has a work-list rather than a
 * pile. Nothing is silently skipped: a blocked page is reported, not hidden.
 *
 * Usage:
 *   node scripts/port-from-eleventy.js --dry-run     # report only, write nothing
 *   node scripts/port-from-eleventy.js               # port every page not already here
 *   node scripts/port-from-eleventy.js --force       # re-port everything, discarding edits
 *   node scripts/port-from-eleventy.js --page button # one page
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getComponent, loadComponents } from '@cruglobal/cornerstone-build-tools/component-api.js';

const siteDir = dirname(dirname(fileURLToPath(import.meta.url)));
const repoDir = dirname(siteDir);
const sourceDir = join(repoDir, 'docs', 'docs');
const targetDir = join(siteDir, 'src', 'content', 'docs');

/**
 * Front-matter keys Eleventy owned. Anything else is carried across untouched.
 *
 * These are all presentation flags read by that site's templates — whether to show an outline, prose
 * typography, breadcrumbs, a generated title — and Starlight decides each of them itself. `permalink`,
 * `tags` and the `eleventy*` keys drive Eleventy's own routing and collections, which the content
 * collection replaces.
 */
const DROPPED_KEYS = new Set([
  'layout',
  'permalink',
  // `tags` is kept: on the utility pages it carries `styleUtilities` / `layoutUtilities`, which is the
  // only thing that splits the CSS Utilities index into its two grids.
  'override:tags',
  'eleventyNavigation',
  'eleventyExcludeFromCollections',
  'hasOutline',
  'hasProseContent',
  'hasBreadcrumbs',
  'hasFramedMain',
  'hasGeneratedTitle',
  'hasThemeSelector',
  'order',
]);

/**
 * What this site cannot yet render, or renders differently. Each is counted per page so the
 * page-by-page pass can be ordered by cost, and so a silent regression is impossible: if a hazard
 * exists and nothing reports it, the page ships wrong.
 */
const HAZARDS = [
  {
    id: 'nunjucks',
    label: 'Nunjucks template syntax',
    pattern: /\{\{[^}]*\}\}|\{%[^%]*%\}|\{#[\s\S]*?#\}/g,
    blocking: true,
  },
  { id: 'kbd', label: '[[Key]] tokens', pattern: /\[\[[^\]]+\]\]/g, blocking: false },
  { id: 'mark', label: '==highlight== marks', pattern: /==[^=\n]+==/g, blocking: false },
  { id: 'container', label: '::: containers', pattern: /^:::\w+/gm, blocking: false },
  {
    id: 'upstream',
    label: 'upstream identity',
    pattern: /Web Awesome|Shoelace|shoelace\.style|Font Awesome|fontawesome\.com|cornerstone\.com|\bPro\+?\b/g,
    blocking: false,
  },
];

const parseArgs = () => {
  const args = process.argv.slice(2);
  return {
    dryRun: args.includes('--dry-run'),
    force: args.includes('--force'),
    page: args.includes('--page') ? args[args.indexOf('--page') + 1] : null,
    section: args.includes('--section') ? args[args.indexOf('--section') + 1] : null,
  };
};

/**
 * Pages that are deliberately NOT ported.
 *
 * `index.md` is 13 KB of upstream marketing for a commercial product. This site has its own landing
 * page, and the real one is *Write the guides*' job — so porting it would replace something correct
 * with something that has to be deleted again.
 */
const SKIPPED = new Set(['index.md']);

/**
 * Eleventy `site.*` data that is true of this fork, and may therefore be substituted at port time.
 *
 * The allow-list is the point. `docs/_data/site.json` also holds upstream's Discord, X, Bluesky,
 * Mastodon and Threads accounts, `@cornerstone.com` and `@awesome.me` email addresses, a Pro product
 * name, a Kickstarter campaign, and legal paths like `/license/pro` — none of which Cru owns or offers.
 * Substituting those would turn a visible `{{ }}` into an invisible falsehood, which is worse. A page
 * that references anything outside this list keeps its Nunjucks and stays a draft, so the page-by-page
 * pass has to make a decision about it rather than inherit one.
 */
const SITE_VALUES = {
  'site.name': 'Cornerstone Components',
  'site.company': 'Cru',
  'site.tagline': 'The custom-element library of the Cornerstone design system.',
  'site.domain': 'cornerstone.ustech.app',
  'site.github.repo': 'https://github.com/CruGlobal/cornerstone-components',
  'site.github.issues': 'https://github.com/CruGlobal/cornerstone-components/issues',
  'site.github.discussions': 'https://github.com/CruGlobal/cornerstone-components/discussions',
  'site.siblings.fontAwesome.name': 'Font Awesome',
  'site.siblings.fontAwesome.url': 'https://fontawesome.com',
};

/** Replaces the allow-listed `{{ site.* }}` references. Anything else is left to be reported. */
function substituteSiteValues(body) {
  return body.replace(/\{\{-?\s*(site\.[\w.]+)\s*-?\}\}/g, (match, key) => SITE_VALUES[key] ?? match);
}

/** Every markdown page under the Eleventy content root, as paths relative to it. */
function walk(dir, base = dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);

    if (statSync(full).isDirectory()) {
      return walk(full, base);
    }

    const path = relative(base, full);

    return entry.endsWith('.md') && !SKIPPED.has(path) ? [path] : [];
  });
}

/** Splits a page into its front matter and its body, without parsing YAML we do not need to parse. */
function splitFrontMatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(\r?\n[\s\S]*)$/);

  if (!match) {
    throw new Error('No front matter found.');
  }

  return { frontMatter: match[1], body: match[2] };
}

/**
 * Rewrites front matter, preserving key order and every value verbatim.
 *
 * The summary is quoted and collapsed onto one line: CEM summaries are wrapped JSDoc prose, and a bare
 * multi-line YAML scalar is a parse error rather than a long description.
 */
function rewriteFrontMatter(frontMatter, component, { blocked = false } = {}) {
  const lines = frontMatter.split(/\r?\n/);
  const kept = [];
  let dropping = false;

  for (const line of lines) {
    const key = line.match(/^([A-Za-z][\w-]*):/)?.[1];

    if (key) {
      dropping = DROPPED_KEYS.has(key);
    }

    // A dropped key takes its indented continuation lines with it.
    if (!dropping) {
      kept.push(line);
    }
  }

  // A component page takes its description from the manifest summary, which is where the Eleventy
  // layout got it. A guide keeps whatever it authored, because nothing else knows what it is about.
  const summary = component
    ? String(component.summary ?? '')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
    : null;

  const hasDescription = kept.some((line) => line.startsWith('description:'));
  const withDescription = !summary
    ? kept
    : hasDescription
      ? kept.map((line) => (line.startsWith('description:') ? `description: "${summary}"` : line))
      : [...kept, `description: "${summary}"`];

  // A blocked page carries markup this site cannot render — Nunjucks that would reach the reader as
  // literal text. Starlight keeps a draft out of production builds and shows a notice in dev, so the
  // page is here to be edited without being published broken. Clearing the hazard and re-porting with
  // --force drops the flag again.
  const withDraft = blocked
    ? [...withDescription, '# Ported with markup this site cannot render yet. See the port report.', 'draft: true']
    : withDescription;

  return `---\n${withDraft.join('\n')}\n---`;
}

/** Counts every hazard in a page body, ignoring nothing. */
function scan(body) {
  const found = {};

  for (const hazard of HAZARDS) {
    const matches = body.match(hazard.pattern);

    if (matches?.length) {
      found[hazard.id] = { count: matches.length, sample: matches[0].slice(0, 60), blocking: hazard.blocking };
    }
  }

  // Links into the documentation that this site does not serve yet. Counted separately because they
  // are expected during the port rather than a defect: they resolve when the target page moves.
  const links = [...body.matchAll(/\]\((\/docs\/[^)\s]+)\)/g)].map((match) => match[1]);

  if (links.length) {
    found.links = { count: links.length, sample: links[0], blocking: false, targets: [...new Set(links)] };
  }

  return found;
}

const grade = (hazards) => {
  if (Object.values(hazards).some((hazard) => hazard.blocking)) {
    return 'blocked';
  }

  return Object.keys(hazards).length ? 'needs-review' : 'clean';
};

function main() {
  const options = parseArgs();
  const components = loadComponents();

  mkdirSync(targetDir, { recursive: true });

  const files = walk(sourceDir)
    .filter((file) => !options.page || basename(file, '.md') === options.page)
    .filter((file) => !options.section || file.startsWith(`${options.section}/`))
    .sort();

  if (!files.length) {
    console.error(options.page ? `No page named "${options.page}".` : `No pages found in ${sourceDir}.`);
    process.exitCode = 1;
    return;
  }

  const report = [];

  for (const file of files) {
    const name = file.replace(/\.md$/, '');
    const target = join(targetDir, file);
    const row = { name, hazards: {}, action: 'ported' };

    try {
      const source = readFileSync(join(sourceDir, file), 'utf-8');
      const { frontMatter } = splitFrontMatter(source);
      let { body } = splitFrontMatter(source);
      // Only a component page has a manifest entry to draw its description from.
      const component = file.startsWith('components/') ? getComponent(components, `cs-${basename(file, '.md')}`) : null;

      mkdirSync(dirname(target), { recursive: true });

      body = substituteSiteValues(body);
      row.hazards = scan(body);
      row.grade = grade(row.hazards);

      if (existsSync(target) && !options.force) {
        row.action = 'kept';
      } else if (options.dryRun) {
        row.action = row.grade === 'blocked' ? 'would port as draft' : 'would port';
      } else {
        const blocked = row.grade === 'blocked';
        writeFileSync(target, `${rewriteFrontMatter(frontMatter, component, { blocked })}${body}`);
        row.action = blocked ? 'ported as draft' : 'ported';
      }
    } catch (error) {
      row.action = 'failed';
      row.grade = 'blocked';
      row.error = error.message;
    }

    report.push(row);
  }

  print(report, options);
}

function print(report, options) {
  const width = Math.max(...report.map((row) => row.name.length));
  const counts = { clean: 0, 'needs-review': 0, blocked: 0 };

  for (const row of report) {
    counts[row.grade] = (counts[row.grade] ?? 0) + 1;

    const hazards = Object.entries(row.hazards)
      .map(([id, hazard]) => `${id}:${hazard.count}`)
      .join(' ');

    console.log(
      `  ${row.name.padEnd(width)}  ${row.grade.padEnd(12)} ${row.action.padEnd(10)} ${hazards}${row.error ? ` — ${row.error}` : ''}`,
    );
  }

  const ported = report.filter((row) => row.action.startsWith('ported') || row.action.startsWith('would port')).length;
  const kept = report.filter((row) => row.action === 'kept').length;

  console.log(
    `\n${report.length} pages: ${counts.clean} clean, ${counts['needs-review']} need review, ${counts.blocked} blocked.`,
  );
  console.log(
    `${ported} written, ${kept} left alone${options.force ? '' : ' (already ported — pass --force to overwrite)'}.`,
  );

  const totals = {};

  for (const row of report) {
    for (const [id, hazard] of Object.entries(row.hazards)) {
      totals[id] = (totals[id] ?? 0) + hazard.count;
    }
  }

  console.log(
    `\nHazards across the corpus: ${
      Object.entries(totals)
        .sort((a, b) => b[1] - a[1])
        .map(([id, count]) => `${id} ${count}`)
        .join(', ') || 'none'
    }`,
  );
}

main();
