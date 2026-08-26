/**
 * Checks that every `<cs-*>` element the documentation uses is a component this library actually ships.
 *
 * An unknown custom element is not an error in HTML. The browser parses it, keeps it in the DOM as an
 * `HTMLUnknownElement`-adjacent inert box, and renders its children — so a page referencing a component
 * that does not exist looks *almost* right, with one control quietly missing. Nothing logs.
 *
 * The failure that motivated this was worse than a missing control. `popup.md` used `<cs-combobox>`, a Pro
 * component this fork does not ship, in five examples — and each example's script opened with
 * `await customElements.whenDefined('cs-combobox')`. That promise can never resolve, so **every line after
 * it never ran** and all five interactive demos were inert. The page had been `draft: true` for the whole
 * time, which is the second half of the problem: `check-pages` and `check-tokens` both read `dist/`, and a
 * draft is never built, so no check had ever looked at it.
 *
 * This reads **source**, so drafts are covered. A draft is where this class of defect hides longest: it is
 * gated precisely because nobody is looking at it, and it is inherited whole by whoever publishes it.
 *
 * Two sources of truth, both derived rather than listed:
 *
 *   - The component set is `src/components/*`, so adding or removing a component updates this check.
 *   - `customElements.whenDefined('cs-…')` and `document.querySelector('cs-…')` are scanned too, because
 *     the tag can be named in script without ever appearing as markup — which is exactly how the popup
 *     demos hung.
 *
 * Fenced code blocks are **not** skipped. A ```html fence on a component page is either a live
 * `{.example}` or a snippet a reader will copy; naming a component that does not exist is wrong in both.
 *
 * **Inline code spans are** skipped, because a backticked `<cs-data-grid>` in prose is a *mention*, not a
 * use — the changelog legitimately names Pro components whose orphan event classes this fork removed, and
 * flagging that would be flagging an accurate sentence. A mention that recommends a component nobody can
 * install is still wrong, but it is a broken cross-reference rather than an inert element, and it is the
 * link checker's to catch.
 *
 * Exits non-zero listing every unknown tag and the pages that use it.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const siteDir = dirname(dirname(fileURLToPath(import.meta.url)));
// The components package: a sibling in the workspace, not the parent directory.
const repoRoot = join(dirname(siteDir), 'components');
const contentDir = join(siteDir, 'src', 'content', 'docs');

/**
 * Tags that are not components and never will be.
 *
 * `cs-show`, `cs-hide` and friends are event names, which appear in prose as `cs-after-hide` and match the
 * same shape as a tag. They are listed rather than pattern-matched so a real component named after an
 * event would still be caught.
 */
const NOT_COMPONENTS = new Set([
  // event names, which share the shape of a tag
  'cs-show',
  'cs-hide',
  'cs-after-show',
  'cs-after-hide',
  'cs-change',
  // the generic placeholder the contributing guide uses in its test-fixture example
  'cs-component',
]);

const shipped = new Set(
  readdirSync(join(repoRoot, 'src', 'components'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => `cs-${entry.name}`),
);

function markdownFiles(dir) {
  const out = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);

    if (entry.isDirectory()) {
      out.push(...markdownFiles(path));
    } else if (extname(entry.name) === '.md') {
      out.push(path);
    }
  }

  return out;
}

const files = markdownFiles(contentDir);
const unknown = new Map();
let drafts = 0;
let tagCount = 0;

for (const path of files) {
  const text = readFileSync(path, 'utf-8');
  const frontMatter = /^---\n([\s\S]*?)\n---/.exec(text);

  if (frontMatter && /^draft: *true/m.test(frontMatter[1])) {
    drafts += 1;
  }

  const used = new Set();

  // A backticked tag is prose about a component, not a use of one.
  const markup = text.replace(/`[^`\n]*`/g, '');

  // markup
  for (const [, tag] of markup.matchAll(/<(cs-[a-z0-9-]+)[\s/>]/g)) {
    used.add(tag);
  }

  // script: a tag named as a string is just as load-bearing, and `whenDefined` on a missing one hangs
  for (const [, tag] of text.matchAll(
    /(?:whenDefined|querySelector(?:All)?|createElement)\(\s*['"`](cs-[a-z0-9-]+)/g,
  )) {
    used.add(tag);
  }

  for (const tag of used) {
    tagCount += 1;

    if (shipped.has(tag) || NOT_COMPONENTS.has(tag)) {
      continue;
    }

    if (!unknown.has(tag)) {
      unknown.set(tag, new Set());
    }

    unknown.get(tag).add(relative(contentDir, path));
  }
}

if (unknown.size === 0) {
  console.log(
    `\n${files.length} pages checked (${drafts} draft${drafts === 1 ? '' : 's'}), ` +
      `${tagCount} component references, all ship.\n`,
  );
  process.exit(0);
}

console.error(`\n${unknown.size} component${unknown.size === 1 ? '' : 's'} referenced but not shipped:\n`);

for (const [tag, paths] of [...unknown].sort()) {
  console.error(`  <${tag}>`);

  for (const path of [...paths].sort()) {
    console.error(`      ${path}`);
  }

  console.error('');
}

console.error('An unknown custom element renders as an inert box, and `whenDefined` on one never resolves.\n');
process.exit(1);
