/**
 * Guards the component custom-property surface, the rule decided in GitHub #182:
 *   1. every `@cssproperty` is named for its own component (`--cs-card-spacing` on `cs-card`), for its parent when it
 *      re-declares a property the parent owns (`cs-carousel-item` reads `--cs-carousel-aspect-ratio`), or is one of
 *      the shared names below;
 *   2. no component stylesheet gives a component property a value on `:host`. A declaration there comes from the
 *      component's own tree and beats a value inherited from outside, so a value set on the page, a theme class or a
 *      section would never reach the component. Read the property with a fallback instead.
 *   3. nothing else is set on `:host` either, except a private `--_*` alias or a theme token. Whatever a host carries,
 *      its slotted content inherits, so an unprefixed name there lands in the app's own CSS (cs-page's
 *      `--scroll-margin-top` reached every element of every page);
 *   4. a script writes on its host only a private `--_*` alias or one of the component's documented properties, such
 *      as a height it measures and publishes. A name built from a variable can't be read statically and is listed;
 *   5. a component reads only `--cs-*` and `--_*` properties. An unprefixed name it never sets reads whatever the page
 *      happens to define (`cs-color-picker` read `--color`).
 *
 * Reads the built manifest, so run it after `npm run build`.
 */
import { readFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { globby } from 'globby';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = dirname(__dirname);

// The shared names keep one name across components (#182). `null` means any component may declare it; a set limits
// it to the components where the value is still right when it flows into a child. A name whose right value depends
// on the surface under it can't be shared: the checkbox glyph sits on a filled box and the radio dot on an empty
// control, so one page value for both turned radio dots white on white, and each now has its own.
const SHARED = new Map([
  ['--cs-show-duration', null],
  ['--cs-hide-duration', null],
  ['--cs-track-color', null],
  ['--cs-track-width', null],
  ['--cs-indicator-color', new Set(['cs-progress-bar', 'cs-progress-ring', 'cs-spinner'])],
  ['--cs-checked-icon-scale', null],
  ['--cs-backdrop-filter', null],
]);

function componentsIn(manifest) {
  const components = new Map();
  for (const module of manifest.modules ?? []) {
    for (const declaration of module.declarations ?? []) {
      if (declaration.tagName) {
        components.set(declaration.tagName, new Set((declaration.cssProperties ?? []).map((p) => p.name)));
      }
    }
  }
  return components;
}

// The component a name belongs to: the longest tag it starts with, so `--cs-tab-panel-padding` is `cs-tab-panel`'s
// and not `cs-tab`'s.
function ownerOf(name, tags) {
  let owner = null;
  for (const tag of tags) {
    if (name.startsWith(`--${tag}-`) && (!owner || tag.length > owner.length)) {
      owner = tag;
    }
  }
  return owner;
}

function checkNames(components) {
  const tags = [...components.keys()];
  const problems = new Map();

  for (const [tag, properties] of components) {
    for (const name of properties) {
      let problem = null;

      if (SHARED.has(name)) {
        const allowed = SHARED.get(name);
        if (allowed && !allowed.has(tag)) {
          problem = `${name} is shared by ${[...allowed].join(', ')} only; name it --${tag}-…`;
        }
      } else {
        const owner = ownerOf(name, tags);
        const isParents = owner && owner !== tag && tag.startsWith(`${owner}-`) && components.get(owner).has(name);
        if (owner !== tag && !isParents) {
          problem = owner
            ? `${name} belongs to <${owner}>; name it --${tag}-…, or declare it on <${owner}> if it is the parent's`
            : `${name} is not named for <${tag}>; name it --${tag}-…`;
        }
      }

      if (problem) {
        if (!problems.has(tag)) {
          problems.set(tag, []);
        }
        problems.get(tag).push(problem);
      }
    }
  }

  return problems;
}

// The CSS inside a stylesheet module: every template literal, with `${…}` interpolations blanked out.
function cssOf(source) {
  return [...source.matchAll(/`((?:\\[\s\S]|[^`\\])*)`/g)]
    .map((match) => match[1].replace(/\$\{[^}]*\}/g, '0'))
    .join('\n')
    .replace(/\/\*[\s\S]*?\*\//g, '');
}

// Splits on a separator outside parentheses, brackets and strings.
function splitTopLevel(text, isSeparator) {
  const parts = [];
  let depth = 0;
  let quote = null;
  let current = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quote) {
      current += ch;
      if (ch === quote) {
        quote = null;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === '(' || ch === '[') {
      depth++;
    } else if (ch === ')' || ch === ']') {
      depth--;
    } else if (depth === 0 && isSeparator(ch)) {
      parts.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  parts.push(current);
  return parts.map((part) => part.trim()).filter(Boolean);
}

function resolveSelectors(prelude, parents) {
  const own = splitTopLevel(prelude, (ch) => ch === ',');
  if (!parents) {
    return own;
  }
  return parents.flatMap((parent) =>
    own.map((selector) => (selector.includes('&') ? selector.replaceAll('&', parent) : `${parent} ${selector}`)),
  );
}

// True when a selector's subject, its last compound, is the host itself rather than something inside it.
function targetsHost(selector) {
  const compounds = splitTopLevel(selector, (ch) => /[\s>+~]/.test(ch));
  const subject = compounds.at(-1) ?? '';
  if (subject.includes('::')) {
    return false;
  }
  return /^(:host(-context)?|:(is|where)\(\s*:host)(?![\w-])/.test(subject);
}

// Every declaration made on the host, as { selector, property }.
function hostDeclarations(css) {
  const found = [];
  const stack = [{ selectors: null, keyframes: false }];
  let buffer = '';
  let depth = 0;
  let quote = null;

  const declare = (text) => {
    const context = stack.at(-1);
    const colon = text.indexOf(':');
    if (context.keyframes || !context.selectors || colon === -1) {
      return;
    }
    const property = text.slice(0, colon).trim();
    const selector = context.selectors.find(targetsHost);
    if (property.startsWith('--') && selector) {
      found.push({ selector, property });
    }
  };

  for (const ch of css) {
    if (quote) {
      buffer += ch;
      if (ch === quote) {
        quote = null;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === '(') {
      depth++;
    } else if (ch === ')') {
      depth--;
    } else if (depth === 0 && ch === '{') {
      const prelude = buffer.trim();
      const parent = stack.at(-1);
      if (prelude.startsWith('@')) {
        stack.push({ selectors: parent.selectors, keyframes: /^@(-webkit-)?keyframes\b/.test(prelude) });
      } else {
        stack.push({ selectors: resolveSelectors(prelude, parent.selectors), keyframes: parent.keyframes });
      }
      buffer = '';
      continue;
    } else if (depth === 0 && ch === ';') {
      declare(buffer);
      buffer = '';
      continue;
    } else if (depth === 0 && ch === '}') {
      declare(buffer);
      buffer = '';
      stack.pop();
      continue;
    }
    buffer += ch;
  }

  return found;
}

// The theme's own names, the `--cs-*` properties its stylesheets declare. The shared variant styles re-point the
// colour roles on `:host([variant])` on purpose, the way a `.cs-brand` class does for a section.
async function themeTokens(rootDir) {
  const files = await globby('src/styles/**/*.css', { cwd: rootDir, absolute: true });
  const tokens = new Set();
  for (const file of files) {
    for (const match of (await readFile(file, 'utf8')).matchAll(/(?<![\w-])(--cs-[a-z0-9-]+)\s*:/g)) {
      tokens.add(match[1]);
    }
  }
  return tokens;
}

// Rules 2 and 3. A component property is any documented name, shared name, or name built from a tag.
async function checkHostDeclarations(rootDir, publicNames, tags, tokens) {
  const files = await globby(['src/components/**/*.styles.ts', 'src/styles/component/*.styles.ts'], {
    cwd: rootDir,
    absolute: true,
  });
  const problems = [];
  for (const file of files.sort()) {
    const css = cssOf(await readFile(file, 'utf8'));
    for (const { selector, property } of hostDeclarations(css)) {
      const where = `${relative(rootDir, file)}: ${property} is set on \`${selector}\``;
      if (property.startsWith('--_')) {
        continue;
      }
      if (publicNames.has(property) || ownerOf(property, tags)) {
        problems.push(`${where}; read it with a fallback instead`);
      } else if (!tokens.has(property)) {
        problems.push(`${where}; a private value is named --_${property.slice(2)}`);
      }
    }
  }
  return problems;
}

// Component scripts and stylesheets, without tests or comments.
async function componentSources(rootDir) {
  const files = await globby(['src/components/**/*.ts', 'src/styles/component/*.styles.ts'], {
    cwd: rootDir,
    absolute: true,
  });
  const sources = [];
  for (const file of files.filter((f) => !f.endsWith('.test.ts')).sort()) {
    const text = (await readFile(file, 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '');
    const tag = file.match(/src\/components\/([^/]+)\//)?.[1];
    sources.push({ file: relative(rootDir, file), text, tag: tag ? `cs-${tag}` : null });
  }
  return sources;
}

// What the first argument of a host write names: a literal, a template (as a pattern), or a `const` holding one.
function writtenName(argument, text) {
  const literal = argument.match(/^(['"])(--[^'"]*)\1$/);
  if (literal) {
    return { name: literal[2] };
  }
  const template = argument.match(/^`(--[^`]*)`$/);
  if (template) {
    if (!template[1].includes('${')) {
      return { name: template[1] };
    }
    const pattern = template[1]
      .split(/\$\{[^}]*\}/)
      .map((part) => part.replace(/[.*+?^$()|[\]\\]/g, '\\$&'))
      .join('[a-z0-9-]+');
    return { pattern: new RegExp(`^${pattern}$`), source: template[1] };
  }
  if (/^[A-Za-z_$][\w$]*$/.test(argument)) {
    const bound = [...text.matchAll(new RegExp(`\\bconst\\s+${argument}\\s*=\\s*(['"\`][^'"\`]*['"\`])`, 'g'))];
    if (bound.length === 1) {
      return writtenName(bound[0][1], text);
    }
  }
  return null;
}

// Rule 4.
function checkHostWrites(sources, components) {
  const problems = [];
  const unverifiable = [];
  for (const { file, text, tag } of sources) {
    const documented = components.get(tag) ?? new Set();
    for (const match of text.matchAll(/this\.(?:style\.setProperty|setStyleProperty)\(\s*([^,]+?)\s*,/g)) {
      const written = writtenName(match[1], text);
      if (!written) {
        unverifiable.push(`${file}: ${match[1]}`);
        continue;
      }
      const shown = written.name ?? written.source;
      if (shown.startsWith('--_') || !shown.startsWith('--')) {
        continue;
      }
      const isDocumented = written.name
        ? documented.has(written.name)
        : [...documented].some((name) => written.pattern.test(name));
      if (!isDocumented) {
        problems.push(`${file}: writes ${shown} on its host, which <${tag}> doesn't document`);
      }
    }
  }
  return { problems, unverifiable };
}

// Rule 5.
function checkReads(sources) {
  const problems = [];
  for (const { file, text } of sources) {
    const names = new Set(
      [...text.matchAll(/var\(\s*(--[a-zA-Z0-9-_]+)/g)]
        .map((match) => match[1])
        .filter((name) => !name.startsWith('--cs-') && !name.startsWith('--_')),
    );
    for (const name of [...names].sort()) {
      problems.push(`${file}: reads ${name}, which a page can set; use a --cs-* name or a private --_* one`);
    }
  }
  return problems;
}

export async function check(options = {}) {
  const rootDir = options.rootDir || root;
  const manifestPath = join(rootDir, 'dist/unbundled/custom-elements.json');

  let manifest;
  try {
    manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  } catch {
    console.log(`FAILED: ${relative(rootDir, manifestPath)} is missing. Run \`npm run build\` first.`);
    process.exit(1);
  }

  const components = componentsIn(manifest);
  const nameProblems = checkNames(components);

  for (const tag of [...components.keys()].sort()) {
    if (components.get(tag).size === 0) {
      continue;
    }
    if (nameProblems.has(tag)) {
      console.log(`❌ ${tag} — ${nameProblems.get(tag).join('; ')}`);
    } else {
      console.log(`✅ ${tag}`);
    }
  }

  const publicNames = new Set([...SHARED.keys(), ...[...components.values()].flatMap((names) => [...names])]);
  const tokens = await themeTokens(rootDir);
  const sources = await componentSources(rootDir);
  const hostProblems = await checkHostDeclarations(rootDir, publicNames, [...components.keys()], tokens);
  const writes = checkHostWrites(sources, components);
  const readProblems = checkReads(sources);
  const otherProblems = [...hostProblems, ...writes.problems, ...readProblems];

  console.log('');
  for (const problem of otherProblems) {
    console.log(`❌ ${problem}`);
  }

  if (writes.unverifiable.length > 0) {
    console.log('');
    console.log(
      `ℹ️  ${writes.unverifiable.length} host write(s) name their property from a variable, so can't be checked:`,
    );
    for (const entry of writes.unverifiable) {
      console.log(`      ${entry}`);
    }
  }

  if (nameProblems.size > 0 || otherProblems.length > 0) {
    console.log('');
    console.log(
      `FAILED: ${nameProblems.size} component(s) with misnamed properties, ${hostProblems.length} set on :host, ` +
        `${writes.problems.length} written on a host, ${readProblems.length} unprefixed read(s).`,
    );
    console.log('Name each `@cssproperty` --cs-<component>-<property>, or use a shared name (GitHub #182). Read a');
    console.log('component property with a fallback, `var(--cs-card-spacing, var(--cs-space-l))`, instead of giving');
    console.log('it a value on :host. Anything a component keeps to itself is a private `--_name`.');
    process.exit(1);
  }

  console.log('PASSED: component properties are named for their component, none is set on :host, and every other');
  console.log('custom property a component sets or reads is private or a theme token.');
}

function isRunAsMain() {
  if (import.meta.url.startsWith('file:')) {
    return process.argv[1] === fileURLToPath(import.meta.url);
  }
  return false;
}

if (isRunAsMain()) {
  await check().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
