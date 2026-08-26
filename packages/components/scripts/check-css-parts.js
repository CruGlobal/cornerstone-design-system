/**
 * Guards the component CSS-part surface statically (no build):
 *   1. every rendered `part=` has a matching `@csspart`, so docs can't drift from render;
 *   2. every `@csspart` is actually rendered, so docs can't promise a part that does nothing;
 *   3. every name republished through `exportparts` is documented, since a consumer can reach it;
 *   4. every part name is kebab-case, `__` separating a forwarded name from its child's part.
 *
 * A `part=` built from an expression is read as far as it can be: static tokens beside the expression
 * are verified normally, and an expression whose branches are string literals is enumerated. Only the
 * names that genuinely can't be resolved — a variable or a map lookup — exempt a component from check 2.
 */
import { readFile } from 'node:fs/promises';
import { basename, dirname } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { globby } from 'globby';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = dirname(__dirname);

// Any quoted `part=` attribute, expression or not. The lookbehind rejects `exportparts=` and
// `[part=…]` selectors.
// Each quote style is its own alternative: an expression inside a double-quoted attribute may
// contain single quotes, which a shared `[^"']` class would stop at.
const PART_ATTR = /(?<![\w[])part=(?:"([^"]*)"|'([^']*)')/g;
// An unquoted `part=${…}`, whose whole value is one expression.
const PART_ATTR_EXPR = /(?<![\w[])part=(\$\{(?:[^{}]|\{[^{}]*\})*\})/g;
// A `${…}` expression inside a part attribute; one level of nested braces is tolerated.
const EXPRESSION = /\$\{(?:[^{}]|\{[^{}]*\})*\}/g;
// String literals inside such an expression — the names it can actually resolve to.
const EXPRESSION_LITERAL = /'([^']*)'|"([^"]*)"/g;
// A standalone expression that is just a local name, e.g. `${stateIconPart}`.
const BARE_IDENTIFIER = /^\$\{\s*([A-Za-z_$][\w$]*)\s*\}$/;
// Marks where an expression stood, so a name glued to one isn't mistaken for a whole name.
const ELIDED = '\u0000';
const DECLARED_PART = /@csspart\s+(\S+)/g;
// Tombstones for parts that no longer render, kept so the docs can explain the removal.
const DEPRECATED_PART = /@csspart\s+(\S+)\s*-\s*Deprecated\b/g;
// A part name: kebab-case segments, `__` joining a forwarded name to its child's part.
const KEBAB_PART = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:__[a-z0-9]+(?:-[a-z0-9]+)*)*$/;
// `exportparts="inner:outer, bare"` republishes a child's parts under this component's names.
const EXPORTED_PARTS = /exportparts=(["'])([^"'$]+)\1/g;

function collect(source, regex, group) {
  const out = new Set();
  for (const match of source.matchAll(regex)) {
    // One attribute can name several parts: `part="foo bar"`.
    for (const token of match[group].trim().split(/\s+/)) {
      if (token) {
        out.add(token);
      }
    }
  }
  return out;
}

// `part="${stateIconPart}"` is only as opaque as its declaration. A local `const` built from string
// literals names the parts just as plainly as writing them inline would, so read it.
function literalsOf(expression, source) {
  const direct = [...expression.matchAll(EXPRESSION_LITERAL)]
    .map((match) => match[1] ?? match[2])
    .filter((literal) => literal.trim() !== '');
  if (direct.length > 0) {
    return direct;
  }

  const identifier = expression.match(BARE_IDENTIFIER)?.[1];
  if (!identifier) {
    return [];
  }

  // Resolve only an unambiguous binding. `pagination` has both a `const part = …` and a destructured
  // `{ part }` parameter, and picking the wrong one enumerates the wrong names — worse than not
  // enumerating at all, because it turns real parts into phantoms.
  const simple = [...source.matchAll(new RegExp(`\\b(?:const|let|var)\\s+${identifier}\\s*=\\s*([^;\\n]+)`, 'g'))];
  const rebound = new RegExp(`\\b(?:const|let|var)\\s*[{[][^}\\]]*\\b${identifier}\\b|\\b${identifier}\\s*:`).test(
    source,
  );
  if (simple.length !== 1 || rebound) {
    return [];
  }

  return [...simple[0][1].matchAll(EXPRESSION_LITERAL)]
    .map((match) => match[1] ?? match[2])
    .filter((literal) => literal.trim() !== '');
}

// Reads every `part=` attribute, resolving what it can. Returns the names known to render, plus
// whether any name was left unresolved — which is what exempts a component from check 2.
function analyzeRendered(source) {
  const rendered = new Set();
  let unresolved = false;

  const add = (text) => {
    for (const token of text.trim().split(/\s+/)) {
      if (token) {
        rendered.add(token);
      }
    }
  };

  const consider = (value) => {
    const expressions = value.match(EXPRESSION) ?? [];
    let next = 0;

    for (const token of value.replace(EXPRESSION, ELIDED).trim().split(/\s+/)) {
      if (!token) {
        continue;
      }
      const elisions = token.split(ELIDED).length - 1;
      if (elisions === 0) {
        rendered.add(token);
        continue;
      }

      const mine = expressions.slice(next, next + elisions);
      next += elisions;

      // Glued to text, as in `part="${state}-icon"`: the whole name isn't knowable from the literals.
      if (token !== ELIDED) {
        unresolved = true;
        continue;
      }

      // A standalone expression. Enumerable when every branch it can take is a string literal.
      const literals = literalsOf(mine[0], source);
      if (literals.length === 0) {
        unresolved = true;
        continue;
      }
      for (const literal of literals) {
        add(literal);
      }
    }
  };

  for (const match of source.matchAll(PART_ATTR)) {
    consider(match[1] ?? match[2]);
  }
  for (const match of source.matchAll(PART_ATTR_EXPR)) {
    consider(match[1]);
  }

  return { rendered, unresolved };
}

// The name a forwarded part is exposed under: the far side of `inner:outer`, or the whole token.
function collectExported(source) {
  const out = new Set();
  for (const match of source.matchAll(EXPORTED_PARTS)) {
    for (const entry of match[2].split(',')) {
      const exposed = entry.split(':').pop().trim();
      if (exposed) {
        out.add(exposed);
      }
    }
  }
  return out;
}

// Skip tests, styles, and `library.*.ts`: the icon library holds SVG fragments whose `part=`
// belongs to the consuming component (`indeterminate-icon` is a checkbox part, not icon's).
async function readComponentSource(dir) {
  const files = await globby('**/*.ts', { cwd: dir, absolute: true });
  const relevant = files.filter((f) => !/\.(test|styles)\.ts$/.test(f) && !/(^|\/)library\.[^/]+\.ts$/.test(f));
  const contents = await Promise.all(relevant.map((f) => readFile(f, 'utf8')));
  return contents.join('\n');
}

// Rendered but undocumented on purpose — pre-existing gaps to document separately. Empty here; the
// Pro package passes its own through `check({ allowlist })`.
const DEFAULT_ALLOWLIST = {};

export async function check(options = {}) {
  const rootDir = options.rootDir || root;
  const allowlist = options.allowlist ?? DEFAULT_ALLOWLIST;
  const dirs = await globby('src/components/*', {
    cwd: rootDir,
    absolute: true,
    onlyDirectories: true,
  });

  const failures = [];
  const staleAllowlist = [];
  const unverifiable = [];

  for (const dir of dirs.sort()) {
    const name = basename(dir);
    const source = await readComponentSource(dir);

    const { rendered, unresolved } = analyzeRendered(source);
    const declared = collect(source, DECLARED_PART, 1);
    const deprecated = collect(source, DEPRECATED_PART, 1);
    const exported = collectExported(source);
    const allowed = new Set(allowlist[name] ?? []);

    const undocumented = [...rendered].filter((part) => !declared.has(part));
    const gaps = undocumented.filter((part) => !allowed.has(part)).sort();

    // Flag allowlist entries that are now documented, so the list can't rot.
    for (const part of allowed) {
      if (!undocumented.includes(part)) {
        staleAllowlist.push(`${name}: ${part}`);
      }
    }

    if (unresolved) {
      unverifiable.push({ name, declared: declared.size });
    }

    const phantoms = unresolved
      ? []
      : [...declared].filter((part) => !rendered.has(part) && !exported.has(part) && !deprecated.has(part)).sort();

    // A forwarded name is reachable from outside, so it has to be documented like any other.
    const undocumentedForwards = [...exported].filter((part) => !declared.has(part)).sort();

    const malformed = [...new Set([...rendered, ...declared, ...exported])]
      .filter((part) => !KEBAB_PART.test(part))
      .sort();

    const problems = [];
    if (gaps.length > 0) {
      problems.push(`undocumented part(s): ${gaps.join(', ')}`);
    }
    if (phantoms.length > 0) {
      problems.push(`documented but never rendered: ${phantoms.join(', ')}`);
    }
    if (undocumentedForwards.length > 0) {
      problems.push(`forwarded but undocumented: ${undocumentedForwards.join(', ')}`);
    }
    if (malformed.length > 0) {
      problems.push(`not kebab-case: ${malformed.join(', ')}`);
    }

    if (problems.length > 0) {
      failures.push(name);
      console.log(`❌ ${name} — ${problems.join('; ')}`);
    } else {
      console.log(`✅ ${name}`);
    }
  }

  console.log('');
  if (staleAllowlist.length > 0) {
    console.log(`⚠️  ${staleAllowlist.length} stale allowlist entries — now documented, remove from ALLOWLIST:`);
    for (const entry of staleAllowlist) {
      console.log(`      ${entry}`);
    }
    console.log('');
  }

  if (unverifiable.length > 0) {
    const total = unverifiable.reduce((sum, entry) => sum + entry.declared, 0);
    const summary = unverifiable.map((entry) => `${entry.name} (${entry.declared})`).join(', ');
    console.log(`ℹ️  ${unverifiable.length} component(s) build part names dynamically, so ${total} documented`);
    console.log(`    part(s) can't be verified as rendered: ${summary}`);
    console.log('');
  }

  if (failures.length > 0) {
    console.log(`FAILED: part issues across ${failures.length} component(s).`);
    console.log('Add a matching `@csspart <name> - <description>` for any stray `part=`. For a documented');
    console.log("part nothing renders, either render it or drop the tag — unless it's forwarded via");
    console.log('`exportparts` or is a `Deprecated.` tombstone, both of which are already exempt.');
    console.log('Document every name an `exportparts` republishes, and keep part names kebab-case.');
    process.exit(1);
  }

  console.log('PASSED: rendered parts and documented parts match.');
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
