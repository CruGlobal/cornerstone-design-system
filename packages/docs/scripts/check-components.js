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
 * **Standalone HTML examples are scanned too**: every `.html` file under `public/assets/examples/`. Those
 * files never pass through the markdown pipeline. They are served as they are and loaded into a frame,
 * which is how the inspiration library's Screens are built (#144 names them
 * `inspiration/screens/<name>.html` and `<name>.<state>.html`, and #149 puts their checks here). A
 * `<cs-buton>` in one renders nothing, and no other check reads them. They get the same markup and script
 * patterns, with one difference: backticks are **not** stripped, because in an HTML file a backtick opens
 * a JavaScript template literal, and markup inside one is a real use rather than prose. HTML files are
 * reported by their path from the site root, so they read `public/assets/examples/...` beside the pages.
 *
 * Exits non-zero listing every unknown tag and the files that use it.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';
import { componentsDir } from '@cruglobal/cornerstone-build-tools/workspace.js';
import { fileURLToPath } from 'node:url';

const siteDir = dirname(dirname(fileURLToPath(import.meta.url)));
const componentsRoot = componentsDir();
const contentDir = join(siteDir, 'src', 'content', 'docs');
const examplesDir = join(siteDir, 'public', 'assets', 'examples');

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
  readdirSync(join(componentsRoot, 'src', 'components'), {
    withFileTypes: true,
  })
    .filter((entry) => entry.isDirectory())
    .map((entry) => `cs-${entry.name}`),
);

function filesWithExtension(dir, extension) {
  const out = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);

    if (entry.isDirectory()) {
      out.push(...filesWithExtension(path, extension));
    } else if (extname(entry.name) === extension) {
      out.push(path);
    }
  }

  return out;
}

const files = filesWithExtension(contentDir, '.md');
const htmlFiles = filesWithExtension(examplesDir, '.html');
const unknown = new Map();
let drafts = 0;
let tagCount = 0;

/**
 * Records every `cs-*` tag `text` uses. `markup` is the text to search for elements, which for a page has
 * its inline code spans removed; script patterns are always searched in the full text.
 */
function scan(text, markup, label) {
  const used = new Set();

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

    unknown.get(tag).add(label);
  }
}

for (const path of files) {
  const text = readFileSync(path, 'utf-8');
  const frontMatter = /^---\n([\s\S]*?)\n---/.exec(text);

  if (frontMatter && /^draft: *true/m.test(frontMatter[1])) {
    drafts += 1;
  }

  // A backticked tag is prose about a component, not a use of one.
  const markup = text.replace(/`[^`\n]*`/g, '');

  scan(text, markup, relative(contentDir, path));
}

// In HTML a backtick opens a template literal, so nothing is stripped.
for (const path of htmlFiles) {
  const text = readFileSync(path, 'utf-8');

  scan(text, text, relative(siteDir, path));
}

if (unknown.size === 0) {
  console.log(
    `\n${files.length} pages checked (${drafts} draft${drafts === 1 ? '' : 's'}), ` +
      `${htmlFiles.length} HTML example${htmlFiles.length === 1 ? '' : 's'}, ` +
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
