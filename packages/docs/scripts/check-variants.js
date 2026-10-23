/**
 * Fails when the docs show some of the colour roles a component takes but not all of them.
 *
 * `highlight` and `information` were added to six components' `variant` and reached none of their pages: every
 * Variant example and every prose list kept the five roles it was written with, and nothing failed. A page that
 * shows five of seven roles renders fine and reads as the full set.
 *
 * Two rules, each derived rather than listed:
 *
 *   1. **The Variant example shows every value.** A component is checked when it applies the shared colour-role
 *      styles (`variants.styles.js`), which is what makes its `variant` a colour role rather than something else:
 *      `cs-icon`'s `variant` picks a glyph style and `cs-dropdown-item`'s marks a destructive item, and neither
 *      imports them. The values come from the component's `variant` attribute in the Custom Elements Manifest. Its
 *      page must have a `### Variant` section, and the `{.example}` fences there must set each value on the
 *      component. An element with no `variant` counts as the manifest's default.
 *   2. **A list of colour roles names all of them.** The roles are every value rule 1's components take. A
 *      paragraph that names three or more of them, each in backticks or bold, is a list of them, and so is a
 *      `::color-scales` `scales` attribute. Either must name every role; other names, such as `link`, may sit
 *      beside them. Two roles in one paragraph is a comparison, not a list, so it is left alone. This covers the
 *      docs pages and the agent-skill sources that ship beside them.
 *
 * Reads source, not `dist/`, so drafts are covered, and needs the library built for its manifest.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { loadComponents } from '@cruglobal/cornerstone-build-tools/component-api.js';
import { componentsDir, docsDir, repoDir } from '@cruglobal/cornerstone-build-tools/workspace.js';

const contentDir = join(docsDir(), 'src', 'content', 'docs');
const skillSourceDirs = ['agent-skill', 'design-skill'].map((dir) => join(componentsDir(), 'scripts', dir));

const FENCE_OPEN = /^\s*(`{3,})/;
const FENCE_CLOSE = /^\s*(`{3,})\s*$/;
const EXAMPLE_FENCE = /^\s*`{3,}\s*html\b.*\{[^}]*\.example\b/;
const HEADING = /^#{1,3}\s/;
const VARIANT_HEADING = /^###\s+Variant\s*$/;
const COLOR_SCALES = /::color-scales\{[^}]*\bscales="([^"]*)"/g;
const SHARED_STYLES = /from\s+['"][./]*styles\/component\/variants\.styles\.js['"]/;
const LIST_MINIMUM = 3;

const markdownFiles = (dir) =>
  readdirSync(dir, { encoding: 'utf8', recursive: true })
    .filter((file) => file.endsWith('.md'))
    .map((file) => join(dir, file))
    .sort();

/**
 * Each line's place relative to code fences: `open` (with its info string), `inside`, `close` or `prose`. A fence
 * closes only on a bare run of at least as many backticks as opened it, so the contributing guide's four-backtick
 * fence around an example fence stays one block.
 */
function fenceStates(lines) {
  let openLength = 0;

  return lines.map((line) => {
    if (openLength > 0) {
      const close = FENCE_CLOSE.exec(line);
      if (close && close[1].length >= openLength) {
        openLength = 0;
        return 'close';
      }
      return 'inside';
    }
    const open = FENCE_OPEN.exec(line);
    if (open) {
      openLength = open[1].length;
      return 'open';
    }
    return 'prose';
  });
}

/** A file's lines with front matter and fenced code blanked, so line numbers still match the source. */
function proseLines(source) {
  const lines = source.split('\n');
  const states = fenceStates(lines);
  const frontMatterEnd = lines[0] === '---' ? lines.indexOf('---', 1) : -1;

  return lines.map((line, index) => (index <= frontMatterEnd || states[index] !== 'prose' ? '' : line));
}

/** The literal values of a manifest `variant` type such as `'brand' | 'neutral'`, or null for any other type. */
function literalUnion(typeText = '') {
  const parts = typeText
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean);
  const values = parts.map((part) => /^(['"])(.*)\1$/.exec(part)?.[2]);

  return values.length > 0 && values.every((value) => value != null) ? values : null;
}

/** Every value the `{.example}` fences in a page's `### Variant` section set on `tag`, or null with no section. */
function variantExampleValues(source, tag, defaultValue) {
  const lines = source.split('\n');
  const states = fenceStates(lines);
  let hasSection = false;
  let inSection = false;
  let inExample = false;
  let exampleCount = 0;
  let html = '';
  let headingLine = 0;

  for (const [index, line] of lines.entries()) {
    if (states[index] === 'open') {
      inExample = inSection && EXAMPLE_FENCE.test(line);
      exampleCount += inExample ? 1 : 0;
      continue;
    }
    if (states[index] === 'inside') {
      html += inExample ? `${line}\n` : '';
      continue;
    }
    if (states[index] === 'close') {
      inExample = false;
      continue;
    }
    if (VARIANT_HEADING.test(line)) {
      hasSection = inSection = true;
      headingLine = index + 1;
    } else if (inSection && HEADING.test(line)) {
      break;
    }
  }

  if (!hasSection) {
    return null;
  }

  const values = new Set();
  // The boundary keeps `cs-toast` from matching `cs-toast-item`.
  for (const [, attributes] of html.matchAll(new RegExp(`<${tag}(?![\\w-])([^>]*)>`, 'g'))) {
    const value = /(?:^|\s)variant\s*=\s*(["'])(.*?)\1/.exec(attributes)?.[2] ?? defaultValue;
    if (value) {
      values.add(value);
    }
  }
  return { values, exampleCount, headingLine };
}

/** Rule 1's components: each one's tag, page and the values its manifest `variant` takes. */
function colorRoleComponents(problems) {
  const manifest = loadComponents();
  const components = [];

  for (const entry of readdirSync(join(componentsDir(), 'src', 'components'), { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }
    const source = readFileSync(join(componentsDir(), 'src', 'components', entry.name, `${entry.name}.ts`), 'utf8');
    if (!SHARED_STYLES.test(source)) {
      continue;
    }

    const tag = `cs-${entry.name}`;
    const attribute = manifest
      .find((component) => component.tagName === tag)
      ?.attributes?.find((a) => a.name === 'variant');
    const values = literalUnion(attribute?.type?.text);
    if (!values) {
      problems.push(
        `<${tag}> applies the colour-role styles, but the manifest gives its \`variant\` as ${attribute ? `\`${attribute.type?.text}\`` : 'missing'}, not a union of role names`,
      );
      continue;
    }
    components.push({
      tag,
      page: join(contentDir, 'components', `${entry.name}.md`),
      values,
      defaultValue: literalUnion(attribute.default)?.[0],
    });
  }
  return components;
}

function checkVariantExample({ tag, page, values, defaultValue }) {
  let source;
  try {
    source = readFileSync(page, 'utf8');
  } catch {
    return [`<${tag}> has no page at ${relative(repoDir(), page)}`];
  }

  const found = variantExampleValues(source, tag, defaultValue);
  const where = relative(repoDir(), page);
  if (!found) {
    return [`${where} has no \`### Variant\` section; add one whose example sets ${tag}'s ${values.length} variants`];
  }
  if (found.exampleCount === 0) {
    return [`${where}:${found.headingLine}: the \`### Variant\` section has no \`{.example}\` fence`];
  }
  return values
    .filter((value) => !found.values.has(value))
    .map((value) => `${where}:${found.headingLine}: the Variant example never sets variant="${value}" on <${tag}>`);
}

/** Rule 2 over one file: each paragraph and `::color-scales` list that names some roles must name all of them. */
function checkRoleLists(file, roles) {
  const problems = [];
  const where = relative(repoDir(), file);
  const lines = proseLines(readFileSync(file, 'utf8'));
  let lists = 0;

  const judge = (named, line, what) => {
    const present = roles.filter((role) => named.has(role));
    if (present.length < LIST_MINIMUM) {
      return;
    }
    lists++;
    const missing = roles.filter((role) => !named.has(role));
    if (missing.length > 0) {
      problems.push(
        `${where}:${line}: ${what} names ${present.length} of the ${roles.length} colour roles; add ${missing.map((role) => `\`${role}\``).join(', ')}`,
      );
    }
  };

  // A paragraph is reported at the first line that names a role, which in a long list item is not its first line.
  let named = new Set();
  let firstRoleLine = null;
  const endParagraph = () => {
    if (firstRoleLine != null) {
      judge(named, firstRoleLine, 'this paragraph');
    }
    named = new Set();
    firstRoleLine = null;
  };

  for (const [index, line] of lines.entries()) {
    for (const [, scales] of line.matchAll(COLOR_SCALES)) {
      judge(new Set(scales.trim().split(/\s+/)), index + 1, '`::color-scales`');
    }
    if (line.trim() === '' || HEADING.test(line)) {
      endParagraph();
      continue;
    }
    for (const match of line.matchAll(/`([^`]+)`|\*\*([^*]+)\*\*/g)) {
      const name = match[1] ?? match[2];
      named.add(name);
      if (firstRoleLine == null && roles.includes(name)) {
        firstRoleLine = index + 1;
      }
    }
  }
  endParagraph();

  return { problems, lists };
}

export function check() {
  const problems = [];
  const components = colorRoleComponents(problems);

  if (components.length === 0 && problems.length === 0) {
    problems.push(
      'no component imports styles/component/variants.styles.js, so nothing was checked; update SHARED_STYLES if it moved',
    );
  }

  for (const component of components) {
    const found = checkVariantExample(component);
    problems.push(...found);
    console.log(`${found.length === 0 ? '✅' : '❌'} ${component.tag}`);
  }

  const roles = [...new Set(components.flatMap((component) => component.values))];
  const files = [contentDir, ...skillSourceDirs].flatMap(markdownFiles);
  let lists = 0;
  for (const file of files) {
    const result = checkRoleLists(file, roles);
    problems.push(...result.problems);
    lists += result.lists;
  }

  console.log('');
  if (problems.length > 0) {
    for (const problem of problems) {
      console.log(`❌ ${problem}`);
    }
    console.log('');
    console.log(`FAILED: ${problems.length} variant problem(s).`);
    console.log(
      `Show every value the manifest gives a component's \`variant\`, and name all ${roles.length} roles in any list of them.`,
    );
    process.exit(1);
  }

  // The counts make a check that looked at nothing visible, as check-anatomy's do.
  console.log(
    `PASSED: ${components.length} colour-role component page(s) show every variant in their Variant example, and ${lists} list(s) of colour roles across ${files.length} file(s) name all ${roles.length}.`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  check();
}
