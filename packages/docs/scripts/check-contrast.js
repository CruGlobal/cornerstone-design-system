/**
 * Fails when a contrast ratio or colour printed on a page no longer matches the shipped themes.
 *
 * The accessibility page's Known gaps table prints measured numbers: Cru's focus ring is 1.47:1 on white, the
 * default theme's is 2.9951:1. Those are facts about `packages/components/src/styles/themes/*.css`, and a theme
 * changes without anyone opening that page. A number that is wrong reads exactly like one that is right, and on
 * that page the number is the claim: it says whether 1.4.11 passes.
 *
 * So a page declares the numbers it prints, in its own front matter, and this recomputes each one.
 *
 * ## Declaring a claim
 *
 * A `contrast` block in the page's front matter, one claim per line, columns split by `|`:
 *
 *     contrast: |
 *       # theme | scheme | foreground | background | printed | precision
 *       cru     | light  | --cs-color-focus | --cs-color-surface-default | 1.47:1 | 2dp
 *
 *   theme       `default`, `cru`, `fl` (a file in `themes/`), a comma list, or `all`.
 *   scheme      `light`, `dark`, or `both`.
 *   foreground  A custom property. `in .cs-invalid` evaluates it on an element carrying that class, for a
 *               token a class re-points. `{a,b}` expands to one pair per value.
 *   background  The same, or `-` for a colour claim.
 *   printed     What the page prints, character for character:
 *                 `1.47:1`             every pair rounds to this, at the precision printed.
 *                 `1.25:1 to 1.48:1`   the lowest and highest pair round to these.
 *                 `#ffd000`            a colour claim: the foreground resolves to this.
 *                 `at least 3:1`       every pair passes. Nothing is printed, so nothing is looked for.
 *                 `below 3:1`          every pair fails.
 *   precision   Optional, `2dp`. Must agree with the decimals in `printed`; it is there because the claims
 *               arrive written that way, and a disagreement means one of the two is a typo.
 *
 * The prose stays prose. Nothing on the page is wrapped or generated, because the page's author rewrites these
 * rows by hand and the numbers sit inside sentences that say what they mean.
 *
 * ## What fails
 *
 *   1. A pair no longer rounds to the printed value. The message names the claim, both resolved colours, the
 *      printed value and the unrounded actual one.
 *   2. A pair is on the other side of 3:1 from the printed value. Thresholds do not round up: 2.9951 is a
 *      failure even though it rounds to 3.00, so the side is judged on the unrounded ratio. This is also what
 *      makes a crossing loud, because the prose around the number says "passes" or "fails".
 *   3. A printed value is not on the built page, so the claim no longer backs anything.
 *   4. The page prints a ratio or a six-digit hex colour that no claim declares. Without this, the next number
 *      added to the table would be exactly as unchecked as every number was before. WCAG's own thresholds
 *      (3:1, 4.5:1, 7:1) are requirements rather than measurements and are exempt.
 *
 * ## How a colour is resolved, and why not in a browser
 *
 * Each theme is evaluated as a consumer loads it: `cornerstone.css`, with its `themes/*.css` import pointed at
 * the theme under test. The stylesheets are parsed here, imports followed, and the cascade applied for the
 * properties a claim reads: cascade layers in `layers.css` order, specificity, source order, inheritance, and
 * `var()` substituted on the element that declares it, which is what lets `.cs-invalid` re-point
 * `--cs-color-focus` on a descendant. Values may be hex, `white`, `black`, or `color-mix(in oklab, ...)`.
 *
 * Anything else stops the claim with a named error rather than a guess: a selector this cannot decide (a
 * pseudo-class, an attribute, a type on the abstract element), a rule inside `@media`, `!important`, an
 * `@property` registration, an unknown function. A resolver that guessed would print a confident wrong number,
 * which is the defect this file exists to stop.
 *
 * A headless browser would get the cascade right by construction, and was rejected for cost, not accuracy:
 * the docs CI job installs no browser, so it would add a Chromium download to every docs run, while every value
 * a claim reaches today is hex or an OKLab mix, which is plain arithmetic. The numbers were measured in
 * Chromium (computed colour painted to a canvas, read back as 8-bit sRGB), and this reproduces that: an OKLab
 * mix is converted back to sRGB and rounded to 8 bits before its luminance is taken.
 *
 * The colour maths is `packages/components/tools/palette.mjs`'s, imported rather than copied, because that file
 * generates the brand ramps from the same WCAG luminance and the same OKLab matrices. `contrast()` there rounds
 * to two places, and this page prints four, so the ratio is taken from `luminance()` unrounded.
 *
 * A claim names tokens, not components. It says `--cs-color-neutral-fill-normal`, not "a filled `cs-button`",
 * so which token a component paints is the claim's author's reading of that component, and is not checked here.
 *
 * Usage:
 *   node scripts/check-contrast.js            after `npm run build`
 *   node scripts/check-contrast.js --list     also print every claim with its resolved values
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { componentsDir } from '@cruglobal/cornerstone-build-tools/workspace.js';
import matter from 'gray-matter';

const siteDir = dirname(dirname(fileURLToPath(import.meta.url)));
const contentDir = join(siteDir, 'src', 'content', 'docs');
const distDir = join(siteDir, 'dist');
const stylesDir = join(componentsDir(), 'src', 'styles');
const entry = join(stylesDir, 'cornerstone.css');
const themesDir = join(stylesDir, 'themes');

const { luminance, hexToOklch, oklchToHex } = await import(
  pathToFileURL(join(componentsDir(), 'tools', 'palette.mjs')).href
);

/** 1.4.11's ratio for non-text contrast, which is what every claim on the page measures. */
const THRESHOLD = 3;

/** WCAG's own requirement levels. Printing one states a requirement, not a measurement. */
const REQUIREMENTS = new Set(['3', '4.5', '7']);

const THEMES = readdirSync(themesDir)
  .filter((file) => file.endsWith('.css'))
  .map((file) => file.slice(0, -4))
  .sort();

const list = process.argv.includes('--list');

// ─── CSS ─────────────────────────────────────────────────────────────────────────────────────────────────────────

/** An error in the stylesheets or a claim, as opposed to a claim that is simply wrong. */
class Unresolvable extends Error {}

/** The index of the first of `stops` at nesting depth 0, outside strings, parentheses and brackets. */
function scanTo(text, from, stops) {
  let depth = 0;
  let quote = null;
  for (let i = from; i < text.length; i++) {
    const ch = text[i];
    if (quote) {
      if (ch === '\\') {
        i++;
      } else if (ch === quote) {
        quote = null;
      }
    } else if (depth === 0 && stops.includes(ch)) {
      // Before the depth bookkeeping, so `)` can be what is being looked for.
      return i;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === '(' || ch === '[') {
      depth++;
    } else if (ch === ')' || ch === ']') {
      depth--;
    }
  }
  return text.length;
}

/** The index just past the `}` that closes a block opened before `from`. */
function skipBlock(text, from) {
  let i = from;
  for (let depth = 1; depth > 0 && i < text.length; i++) {
    const stop = scanTo(text, i, '{}');
    i = stop;
    depth += text[stop] === '{' ? 1 : -1;
  }
  return i;
}

/** Splits on `separator` at depth 0. */
function splitTop(text, separator) {
  const parts = [];
  let from = 0;
  for (let at = scanTo(text, 0, separator); ; at = scanTo(text, from, separator)) {
    parts.push(text.slice(from, at).trim());
    if (at >= text.length) {
      return parts;
    }
    from = at + 1;
  }
}

/** Blocks whose contents set no custom property on an element, so they are stepped over whole. */
const INERT =
  /^@(-webkit-)?(keyframes|font-face|page|counter-style|font-feature-values|font-palette-values|position-try|view-transition)\b/;

/** Blocks whose contents apply only under a condition this check does not model. */
const CONDITIONAL = /^@(media|supports|container|scope|starting-style)\b/;

/**
 * Parses a stylesheet and everything it imports into `sheet`, in the order a browser applies them.
 *
 * Only custom property declarations are kept, because nothing else can change what a token resolves to.
 * `swapTheme` replaces any `themes/*.css` import with the theme under test.
 */
function parseSheet(file, sheet, swapTheme) {
  const text = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  parseItems(text, 0, { file, layer: null, conditional: null, selector: null, rule: null }, sheet, swapTheme);
}

function parseItems(text, from, ctx, sheet, swapTheme) {
  let i = from;
  while (i < text.length) {
    while (i < text.length && /\s/.test(text[i])) {
      i++;
    }
    if (i >= text.length) {
      return i;
    }
    if (text[i] === '}') {
      return i + 1;
    }
    const stop = scanTo(text, i, ';{}');
    const prelude = text.slice(i, stop).trim();

    if (text[stop] === '{') {
      i = parseBlock(text, stop + 1, prelude, ctx, sheet, swapTheme);
      continue;
    }

    if (prelude.startsWith('@')) {
      atStatement(prelude, ctx, sheet, swapTheme);
    } else if (prelude) {
      declaration(prelude, ctx, sheet);
    }
    i = text[stop] === ';' ? stop + 1 : stop;
  }
  return i;
}

function parseBlock(text, from, prelude, ctx, sheet, swapTheme) {
  if (prelude.startsWith('@layer')) {
    const name = prelude.slice('@layer'.length).trim();
    if (!name || ctx.layer) {
      throw new Unresolvable(`${where(ctx)}: anonymous or nested layer \`${prelude}\` is not modelled`);
    }
    registerLayer(sheet, name);
    return parseItems(text, from, { ...ctx, layer: name }, sheet, swapTheme);
  }
  if (CONDITIONAL.test(prelude)) {
    return parseItems(text, from, { ...ctx, conditional: prelude }, sheet, swapTheme);
  }
  if (prelude.startsWith('@property')) {
    sheet.registered.add(prelude.slice('@property'.length).trim());
    return skipBlock(text, from);
  }
  if (INERT.test(prelude)) {
    return skipBlock(text, from);
  }
  if (prelude.startsWith('@')) {
    throw new Unresolvable(`${where(ctx)}: unknown at-rule \`${prelude}\``);
  }

  const selector = ctx.selector ? nest(ctx.selector, prelude) : prelude;
  const rule = { selector, layer: ctx.layer, conditional: ctx.conditional, file: ctx.file, decls: [] };
  sheet.rules.push(rule);
  return parseItems(text, from, { ...ctx, selector, rule }, sheet, swapTheme);
}

function atStatement(prelude, ctx, sheet, swapTheme) {
  if (prelude.startsWith('@import')) {
    const match = /^@import\s+(?:url\(\s*)?['"]?([^'")\s]+)['"]?\s*\)?\s*$/.exec(prelude);
    if (!match) {
      throw new Unresolvable(`${where(ctx)}: \`${prelude}\` carries a layer or condition this does not model`);
    }
    let target = resolve(dirname(ctx.file), match[1]);
    if (swapTheme && dirname(target) === themesDir) {
      target = join(themesDir, `${swapTheme}.css`);
    }
    parseSheet(target, sheet, swapTheme);
  } else if (prelude.startsWith('@layer')) {
    for (const name of prelude.slice('@layer'.length).split(',')) {
      registerLayer(sheet, name.trim());
    }
  } else if (!/^@(charset|namespace)\b/.test(prelude)) {
    throw new Unresolvable(`${where(ctx)}: unknown statement \`${prelude}\``);
  }
}

function declaration(text, ctx, sheet) {
  const colon = text.indexOf(':');
  const prop = text.slice(0, colon).trim();
  if (!prop.startsWith('--')) {
    return;
  }
  if (!ctx.rule) {
    throw new Unresolvable(`${where(ctx)}: \`${prop}\` is declared outside a rule`);
  }
  let value = text.slice(colon + 1).trim();
  const important = /!\s*important$/i.test(value);
  value = value.replace(/!\s*important$/i, '').trim();
  ctx.rule.decls.push({ prop, value, important, order: sheet.order++ });
}

function registerLayer(sheet, name) {
  if (name.includes('.')) {
    throw new Unresolvable(`nested layer \`${name}\` is not modelled`);
  }
  if (!sheet.layers.includes(name)) {
    sheet.layers.push(name);
  }
}

const where = (ctx) => relative(componentsDir(), ctx.file);

/** The selector a nested rule stands for, per CSS Nesting: `&` is the parent, and no `&` means a descendant. */
function nest(parent, child) {
  return splitTop(child, ',')
    .map((part) => (part.includes('&') ? part.replaceAll('&', `:is(${parent})`) : `:is(${parent}) ${part}`))
    .join(', ');
}

// ─── Selectors ───────────────────────────────────────────────────────────────────────────────────────────────────
//
// Matching is three-valued, because the elements here are abstract. The root is `html` carrying the scheme's
// class; a context such as `.cs-invalid` is an element of unknown type inside it, with no id, no attributes and no
// state. `true` and `false` are certain. `null` means the selector depends on something the model does not have,
// and a rule that might match that way stops any claim that reads what it declares.

const and = (values) => (values.includes(false) ? false : values.includes(null) ? null : true);
const or = (values) => (values.includes(true) ? true : values.includes(null) ? null : false);

/** Splits a complex selector into compounds and the combinators between them. */
function parseComplex(selector) {
  const compounds = [];
  const combinators = [];
  let current = '';
  let pending = null;
  let depth = 0;
  const flush = () => {
    if (current) {
      if (compounds.length) {
        combinators.push(pending ?? ' ');
      }
      compounds.push(current);
      current = '';
      pending = null;
    }
  };
  for (const ch of selector.trim()) {
    if (ch === '(' || ch === '[') {
      depth++;
    } else if (ch === ')' || ch === ']') {
      depth--;
    }
    if (depth === 0 && /[\s>+~]/.test(ch)) {
      flush();
      if (ch !== ' ' && !/\s/.test(ch)) {
        pending = ch;
      }
      continue;
    }
    current += ch;
  }
  flush();
  return { compounds, combinators };
}

/** Splits a compound selector into its simple selectors. */
function parseCompound(compound) {
  const parts = [];
  let i = 0;
  const ident = () => {
    const match = /^-?[_a-zA-Z][-_a-zA-Z0-9]*/.exec(compound.slice(i));
    if (!match) {
      throw new Unresolvable(`cannot parse selector \`${compound}\``);
    }
    i += match[0].length;
    return match[0];
  };
  while (i < compound.length) {
    const ch = compound[i];
    if (ch === '*') {
      i++;
      parts.push({ kind: 'universal' });
    } else if (ch === '.') {
      i++;
      parts.push({ kind: 'class', name: ident() });
    } else if (ch === '#') {
      i++;
      parts.push({ kind: 'id', name: ident() });
    } else if (ch === '[') {
      const end = scanTo(compound, i + 1, ']');
      parts.push({ kind: 'attribute', text: compound.slice(i, end + 1) });
      i = end + 1;
    } else if (ch === ':') {
      const element = compound[i + 1] === ':';
      i += element ? 2 : 1;
      const name = ident().toLowerCase();
      let args = null;
      if (compound[i] === '(') {
        const end = scanTo(compound, i + 1, ')');
        args = compound.slice(i + 1, end);
        i = end + 1;
      }
      parts.push({ kind: element ? 'pseudo-element' : 'pseudo-class', name, args });
    } else {
      parts.push({ kind: 'type', name: ident().toLowerCase() });
    }
  }
  return parts;
}

const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const greater = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
const maxSpecificity = (list) => list.reduce((best, s) => (greater(s, best) > 0 ? s : best), [0, 0, 0]);

const parsedSelectors = new Map();

/** A complex selector parsed once, or null when it cannot be parsed, which matches as unknown. */
function parseSelector(selector) {
  if (!parsedSelectors.has(selector)) {
    let parsed = null;
    try {
      const complex = parseComplex(selector);
      const parts = complex.compounds.map(parseCompound);
      const specificity = parts.flat().reduce((sum, part) => add(sum, simpleSpecificity(part)), [0, 0, 0]);
      parsed = { ...complex, parts, specificity };
    } catch {
      // Left null on purpose: see matchSelector.
    }
    parsedSelectors.set(selector, parsed);
  }
  return parsedSelectors.get(selector);
}

/** `{ result, specificity }` for one complex selector against an element. */
function matchSelector(selector, element) {
  const parsed = parseSelector(selector);
  if (!parsed) {
    return { result: null, specificity: [0, 0, 0] };
  }
  return { result: matchFrom(parsed, parsed.parts.length - 1, element), specificity: parsed.specificity };
}

function matchFrom(parsed, index, element) {
  const own = and(parsed.parts[index].map((part) => matchSimple(part, element)));
  if (own === false || index === 0) {
    return own;
  }
  const combinator = parsed.combinators[index - 1];
  if (combinator === '>') {
    return and([own, element.parent ? matchFrom(parsed, index - 1, element.parent) : false]);
  }
  if (combinator === ' ') {
    const ancestors = [];
    for (let up = element.parent; up; up = up.parent) {
      ancestors.push(matchFrom(parsed, index - 1, up));
    }
    return and([own, or(ancestors)]);
  }
  // Siblings are not modelled.
  return and([own, null]);
}

const matchList = (list, element) => or(splitTop(list, ',').map((s) => matchSelector(s, element).result));

function matchSimple(part, element) {
  switch (part.kind) {
    case 'universal':
      return true;
    case 'class':
      return element.classes.has(part.name);
    case 'id':
      return false;
    case 'type':
      return element.type ? element.type === part.name : null;
    case 'pseudo-element':
      return false;
    case 'pseudo-class':
      switch (part.name) {
        case 'root':
          return element.parent === null;
        case 'where':
        case 'is':
          return matchList(part.args, element);
        case 'not': {
          const inner = matchList(part.args, element);
          return inner === null ? null : !inner;
        }
        case 'host':
        case 'host-context':
          // A shadow root's host. The tokens are resolved in the document, where `:host` matches nothing.
          return false;
        default:
          return null;
      }
    default:
      return null;
  }
}

function simpleSpecificity(part) {
  switch (part.kind) {
    case 'id':
      return [1, 0, 0];
    case 'class':
    case 'attribute':
      return [0, 1, 0];
    case 'type':
    case 'pseudo-element':
      return [0, 0, 1];
    case 'pseudo-class':
      if (part.name === 'where') {
        return [0, 0, 0];
      }
      if (['is', 'not', 'has'].includes(part.name)) {
        return maxSpecificity(
          splitTop(part.args, ',').map((s) => {
            try {
              return parseComplex(s)
                .compounds.map(parseCompound)
                .flat()
                .reduce((sum, p) => add(sum, simpleSpecificity(p)), [0, 0, 0]);
            } catch {
              return [0, 0, 0];
            }
          }),
        );
      }
      return [0, 1, 0];
    default:
      return [0, 0, 0];
  }
}

// ─── Cascade ─────────────────────────────────────────────────────────────────────────────────────────────────────

/** The stylesheets for one theme, as `cornerstone.css` loads them with that theme swapped in. */
function loadTheme(theme) {
  const sheet = { rules: [], layers: [], registered: new Set(), order: 0 };
  parseSheet(entry, sheet, theme);
  sheet.byProp = new Map();
  for (const rule of sheet.rules) {
    for (const decl of rule.decls) {
      if (!sheet.byProp.has(decl.prop)) {
        sheet.byProp.set(decl.prop, []);
      }
      sheet.byProp.get(decl.prop).push({ rule, decl });
    }
  }
  return sheet;
}

/** The winning declaration of `prop` on `element`, or undefined when nothing declares it there. */
function cascaded(sheet, element, prop) {
  let best;
  for (const { rule, decl } of sheet.byProp.get(prop) ?? []) {
    const matches = splitTop(rule.selector, ',').map((s) => matchSelector(s, element));
    const result = or(matches.map((m) => m.result));
    if (result === false) {
      continue;
    }
    const origin = `\`${rule.selector}\` in ${relative(componentsDir(), rule.file)}`;
    if (result === null) {
      throw new Unresolvable(`cannot tell whether ${origin} applies, and it sets ${prop}`);
    }
    if (rule.conditional) {
      throw new Unresolvable(`${origin} sets ${prop} inside \`${rule.conditional}\`, which this does not model`);
    }
    if (decl.important) {
      throw new Unresolvable(`${origin} sets ${prop} with !important, which this does not model`);
    }
    const candidate = {
      value: decl.value,
      // Unlayered styles beat every layer; among layers, the one declared later wins.
      layer: rule.layer === null ? Infinity : sheet.layers.indexOf(rule.layer),
      specificity: maxSpecificity(matches.filter((m) => m.result === true).map((m) => m.specificity)),
      order: decl.order,
    };
    if (!best || beats(candidate, best)) {
      best = candidate;
    }
  }
  return best;
}

/** Cascade order for normal declarations: layer, then specificity, then source order. */
function beats(a, b) {
  if (a.layer !== b.layer) {
    return a.layer > b.layer;
  }
  const bySpecificity = greater(a.specificity, b.specificity);
  return bySpecificity !== 0 ? bySpecificity > 0 : a.order > b.order;
}

/** A custom property's computed value: its cascaded value with `var()` substituted on this element, or inherited. */
function computed(sheet, element, prop, trail = []) {
  if (sheet.registered.has(prop)) {
    throw new Unresolvable(`${prop} is registered with @property, which this does not model`);
  }
  if (trail.includes(prop)) {
    throw new Unresolvable(`${[...trail, prop].join(' → ')} is a cycle`);
  }
  const key = prop;
  if (element.cache.has(key)) {
    return element.cache.get(key);
  }
  const winner = cascaded(sheet, element, prop);
  let value;
  if (winner) {
    value = substitute(sheet, element, winner.value, [...trail, prop]);
  } else if (element.parent) {
    value = computed(sheet, element.parent, prop, trail);
  }
  element.cache.set(key, value);
  return value;
}

function substitute(sheet, element, value, trail) {
  const at = value.indexOf('var(');
  if (at === -1) {
    return value;
  }
  const end = scanTo(value, at + 4, ')');
  const inner = value.slice(at + 4, end);
  const comma = scanTo(inner, 0, ',');
  const name = inner.slice(0, comma).trim();
  const fallback = comma < inner.length ? inner.slice(comma + 1) : null;
  let replacement = computed(sheet, element, name, trail);
  if (replacement === undefined) {
    if (fallback === null) {
      throw new Unresolvable(`${trail.at(-1)} reads ${name}, which nothing defines here`);
    }
    replacement = substitute(sheet, element, fallback.trim(), trail);
  }
  return substitute(sheet, element, value.slice(0, at) + replacement + value.slice(end + 1), trail);
}

// ─── Colour ──────────────────────────────────────────────────────────────────────────────────────────────────────

const NAMED = { white: '#ffffff', black: '#000000' };

/** A resolved value as 8-bit sRGB hex: what a browser paints, and what the page's numbers were measured from. */
function toHex(value) {
  const text = value.trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(text)) {
    return text;
  }
  if (/^#[0-9a-f]{3}$/.test(text)) {
    return `#${[...text.slice(1)].map((c) => c + c).join('')}`;
  }
  if (NAMED[text]) {
    return NAMED[text];
  }
  const mix = /^color-mix\(\s*in\s+([a-z-]+)\s*,(.*)\)$/s.exec(text);
  if (mix) {
    if (mix[1] !== 'oklab') {
      throw new Unresolvable(`\`${text}\` mixes in ${mix[1]}; only oklab is modelled`);
    }
    return mixOklab(splitTop(mix[2], ','), text);
  }
  throw new Unresolvable(`cannot evaluate \`${text}\` as a colour`);
}

function mixOklab(args, text) {
  if (args.length !== 2) {
    throw new Unresolvable(`\`${text}\` does not mix exactly two colours`);
  }
  const stops = args.map((arg) => {
    const percent = /(?:^|\s)(\d+(?:\.\d+)?)%(?:\s|$)/.exec(arg);
    return { color: toHex(percent ? arg.replace(percent[0], ' ') : arg), percent: percent ? Number(percent[1]) : null };
  });
  const [a, b] = stops;
  if (a.percent === null && b.percent === null) {
    a.percent = b.percent = 50;
  } else if (a.percent === null) {
    a.percent = 100 - b.percent;
  } else if (b.percent === null) {
    b.percent = 100 - a.percent;
  }
  if (a.percent + b.percent !== 100) {
    throw new Unresolvable(`\`${text}\` leaves the result translucent, which has no single contrast ratio`);
  }
  const lab = (hex) => {
    const { L, C, H } = hexToOklch(hex);
    return [L, C * Math.cos((H * Math.PI) / 180), C * Math.sin((H * Math.PI) / 180)];
  };
  const [x, y] = [lab(a.color), lab(b.color)];
  const [L, A, B] = x.map((v, i) => (v * a.percent + y[i] * b.percent) / 100);
  let H = (Math.atan2(B, A) * 180) / Math.PI;
  if (H < 0) {
    H += 360;
  }
  const result = oklchToHex({ L, C: Math.hypot(A, B), H });
  if (result.clipped) {
    // palette.mjs would reduce chroma to bring it back; a browser might map it differently, and then the
    // number on the page would depend on which.
    throw new Unresolvable(`\`${text}\` lands outside sRGB, and how a browser brings it back is not modelled`);
  }
  return result.hex;
}

/** WCAG 2 contrast, unrounded. */
function ratio(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

// ─── Claims ──────────────────────────────────────────────────────────────────────────────────────────────────────

const expand = (text) => {
  const brace = /\{([^{}]+)\}/.exec(text);
  return brace ? brace[1].split(',').flatMap((alt) => expand(text.replace(brace[0], alt.trim()))) : [text.trim()];
};

const decimals = (number) => (number.includes('.') ? number.split('.')[1].length : 0);

/** One line of a `contrast` block, or throws with what is wrong with it. */
function parseClaim(line) {
  const columns = line.split('|').map((c) => c.trim());
  if (columns.length < 5 || columns.length > 6) {
    throw new Unresolvable('expected 5 or 6 columns: theme | scheme | foreground | background | printed | precision');
  }
  const [themeText, schemeText, fgText, bgText, printed, precision] = columns;

  const themes = themeText === 'all' ? THEMES : themeText.split(',').map((t) => t.trim());
  for (const theme of themes) {
    if (!THEMES.includes(theme)) {
      throw new Unresolvable(`theme \`${theme}\` is not one of ${THEMES.join(', ')}`);
    }
  }
  const schemes = schemeText === 'both' ? ['light', 'dark'] : schemeText.split(',').map((s) => s.trim());
  for (const scheme of schemes) {
    if (!['light', 'dark'].includes(scheme)) {
      throw new Unresolvable(`scheme \`${scheme}\` is not light, dark or both`);
    }
  }

  const [fgPart, contextPart] = fgText.split(/\s+in\s+/);
  const context = contextPart ? contextPart.split('.').filter(Boolean) : [];
  if (contextPart && !/^(\.[-_a-zA-Z0-9]+)+$/.test(contextPart.trim())) {
    throw new Unresolvable(`context \`${contextPart}\` should be classes, like \`.cs-invalid\``);
  }
  const fgs = expand(fgPart);
  const bgs = bgText === '-' ? [null] : expand(bgText);

  let kind;
  let values;
  let threshold = THRESHOLD;
  const NUMBER = '(\\d+(?:\\.\\d+)?)';
  let match;
  if ((match = new RegExp(`^${NUMBER}:1$`).exec(printed))) {
    kind = 'exact';
    values = [match[1]];
  } else if ((match = new RegExp(`^${NUMBER}:1 to ${NUMBER}:1$`).exec(printed))) {
    kind = 'range';
    values = [match[1], match[2]];
  } else if ((match = new RegExp(`^(at least|below) ${NUMBER}:1$`).exec(printed))) {
    kind = match[1] === 'at least' ? 'pass' : 'fail';
    threshold = Number(match[2]);
    values = [];
  } else if (/^#[0-9a-f]{6}$/i.test(printed)) {
    kind = 'colour';
    values = [printed.toLowerCase()];
  } else {
    throw new Unresolvable(`cannot read printed value \`${printed}\``);
  }
  if ((kind === 'colour') !== (bgText === '-')) {
    throw new Unresolvable('a colour claim, and only a colour claim, takes `-` as its background');
  }
  if (precision) {
    const dp = /^(\d+)dp$/.exec(precision);
    if (!dp || values.some((v) => kind !== 'colour' && decimals(v) !== Number(dp[1]))) {
      throw new Unresolvable(`precision \`${precision}\` does not match \`${printed}\``);
    }
  }

  const pairs = [];
  for (const theme of themes) {
    for (const scheme of schemes) {
      for (const fg of fgs) {
        for (const bg of bgs) {
          // The last three are filled in by evaluate().
          pairs.push({ theme, scheme, fg, bg, context, fgHex: '', bgHex: '', ratio: NaN });
        }
      }
    }
  }
  return { kind, values, threshold, printed, pairs };
}

const sheets = new Map();

/** The abstract elements a pair is evaluated on: `html.cs-{scheme}`, and a child carrying the context classes. */
function elementFor(theme, scheme, context) {
  if (!sheets.has(theme)) {
    sheets.set(theme, { sheet: loadTheme(theme), elements: new Map() });
  }
  const { sheet, elements } = sheets.get(theme);
  const key = `${scheme}|${context.join('.')}`;
  if (!elements.has(key)) {
    const root = { type: 'html', classes: new Set([`cs-${scheme}`]), parent: null, cache: new Map() };
    const element = context.length ? { type: null, classes: new Set(context), parent: root, cache: new Map() } : root;
    elements.set(key, { sheet, root, element });
  }
  return elements.get(key);
}

const colourOf = (token, pair, onElement) => {
  const { sheet, root, element } = elementFor(pair.theme, pair.scheme, pair.context);
  const target = onElement ? element : root;
  const value = token.startsWith('--') ? computed(sheet, target, token) : token;
  if (value === undefined) {
    throw new Unresolvable(`${token} is not defined in ${pair.theme} ${pair.scheme}`);
  }
  return toHex(value);
};

/** Resolves every pair of a claim. The context applies to the foreground; the background is the page around it. */
function evaluate(claim) {
  for (const pair of claim.pairs) {
    pair.fgHex = colourOf(pair.fg, pair, true);
    if (pair.bg) {
      pair.bgHex = colourOf(pair.bg, pair, false);
      pair.ratio = ratio(pair.fgHex, pair.bgHex);
    }
  }
}

const describe = (pair) =>
  `${pair.theme} ${pair.scheme} ${pair.fg}${pair.context.length ? ` in .${pair.context.join('.')}` : ''}` +
  (pair.bg ? ` on ${pair.bg}` : '');
const measured = (pair) => `${pair.fgHex} on ${pair.bgHex}, unrounded ${pair.ratio.toFixed(4)}:1`;
const side = (value, threshold) => (value >= threshold ? 'passes' : 'fails');

/** Every way a claim no longer holds, as messages. */
function judge(claim) {
  const problems = [];
  const t = claim.threshold;
  if (claim.kind === 'colour') {
    for (const pair of claim.pairs.filter((p) => p.fgHex !== claim.values[0])) {
      problems.push(`${describe(pair)}: printed ${claim.values[0]}, actual ${pair.fgHex}`);
    }
  } else if (claim.kind === 'exact') {
    const [printed] = claim.values;
    for (const pair of claim.pairs) {
      const rounded = pair.ratio.toFixed(decimals(printed));
      if (rounded !== printed) {
        problems.push(`${describe(pair)}: printed ${printed}:1, actual ${rounded}:1 (${measured(pair)})`);
      }
      if (side(pair.ratio, t) !== side(Number(printed), t)) {
        problems.push(
          `${describe(pair)}: printed ${printed}:1 ${side(Number(printed), t)} ${t}:1, but the unrounded ` +
            `${pair.ratio.toFixed(4)}:1 ${side(pair.ratio, t)}, so the prose around it is wrong too`,
        );
      }
    }
  } else if (claim.kind === 'range') {
    const sorted = [...claim.pairs].sort((a, b) => a.ratio - b.ratio);
    const ends = [sorted[0], sorted.at(-1)];
    ends.forEach((pair, i) => {
      const printed = claim.values[i];
      const rounded = pair.ratio.toFixed(decimals(printed));
      if (rounded !== printed) {
        problems.push(
          `${i ? 'highest' : 'lowest'} pair is now ${describe(pair)}: printed ${printed}:1, ` +
            `actual ${rounded}:1 (${measured(pair)})`,
        );
      }
    });
    const [low, high] = claim.values.map(Number);
    const expected = high < t ? 'fails' : low >= t ? 'passes' : null;
    for (const pair of expected ? claim.pairs : []) {
      if (side(pair.ratio, t) !== expected) {
        problems.push(
          `${describe(pair)}: the range ${expected} ${t}:1, but this pair ${side(pair.ratio, t)} (${measured(pair)})`,
        );
      }
    }
  } else {
    const expected = claim.kind === 'pass' ? 'passes' : 'fails';
    for (const pair of claim.pairs.filter((p) => side(p.ratio, t) !== expected)) {
      problems.push(
        `${describe(pair)}: claimed \`${claim.printed}\`, but it ${side(pair.ratio, t)} (${measured(pair)})`,
      );
    }
  }
  return problems;
}

/** Where the claim's text should appear on the page, or null for a claim that prints nothing. */
function printedText(claim) {
  return ['exact', 'range', 'colour'].includes(claim.kind) ? claim.printed : null;
}

const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Whether the page prints `text` as a whole value: `1:1` is not found inside `2.1:1`, nor `3:1` inside `3:10`. */
const onPage = (text, pageText) =>
  text.startsWith('#')
    ? new RegExp(`${escape(text)}(?![0-9a-z])`, 'i').test(pageText)
    : new RegExp(`(?<![\\d.])${escape(text)}(?!\\d|\\.\\d)`).test(pageText);

/** Every ratio and hex colour a claim line prints, read from the line itself so a broken claim still counts. */
const printedIn = (line) => {
  const printed = line.split('|')[4] ?? '';
  return /^\s*(at least|below)\b/.test(printed)
    ? []
    : [...printed.matchAll(/\d+(?:\.\d+)?:1|#[0-9a-f]{6}/gi)].map(([value]) => value.toLowerCase());
};

/** The built page's readable text: `<main>`, code blocks dropped, tags stripped, entities decoded. */
function readPage(slug) {
  const file = join(distDir, slug, 'index.html');
  if (!existsSync(file)) {
    throw new Unresolvable(`${relative(siteDir, file)} does not exist. Run \`npm run build\` first.`);
  }
  const html = readFileSync(file, 'utf8');
  const main = /<main\b[^>]*>([\s\S]*?)<\/main>/.exec(html)?.[1] ?? html;
  return main
    .replace(/<pre\b[\s\S]*?<\/pre>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ');
}

// ─── Run ─────────────────────────────────────────────────────────────────────────────────────────────────────────

const started = performance.now();
const pages = readdirSync(contentDir, { recursive: true })
  .map(String)
  .filter((file) => /\.mdx?$/.test(file))
  .sort()
  .map((file) => ({ file, data: matter(readFileSync(join(contentDir, file), 'utf8')).data }))
  .filter(({ data }) => data.contrast !== undefined);

const failures = [];
let claimCount = 0;
let pairCount = 0;

for (const { file, data } of pages) {
  const label = relative(siteDir, join(contentDir, file));
  if (typeof data.contrast !== 'string') {
    failures.push(`${label}: \`contrast\` must be a block of lines (\`contrast: |\`), not ${typeof data.contrast}`);
    continue;
  }
  const slug = file.replace(/\.mdx?$/, '').replace(/(^|\/)index$/, '');
  let pageText;
  try {
    pageText = readPage(slug);
  } catch (error) {
    failures.push(`${label}: ${error.message}`);
    continue;
  }

  const declared = new Set();
  data.contrast.split('\n').forEach((raw, index) => {
    const line = raw.trim();
    if (!line || line.startsWith('#')) {
      return;
    }
    const name = `${label} contrast line ${index + 1}: ${line}`;
    printedIn(line).forEach((value) => declared.add(value));
    let claim;
    try {
      claim = parseClaim(line);
      evaluate(claim);
    } catch (error) {
      if (!(error instanceof Unresolvable)) {
        throw error;
      }
      failures.push(`${name}\n    could not check it: ${error.message}`);
      return;
    }
    claimCount++;
    pairCount += claim.pairs.length;
    const problems = judge(claim);
    const text = printedText(claim);
    if (text) {
      if (!onPage(text, pageText)) {
        problems.push(`\`${text}\` is not on the built page, so this claim no longer backs anything there`);
      }
    }
    if (problems.length) {
      failures.push(`${name}\n${problems.map((p) => `    ${p}`).join('\n')}`);
    }
    if (list) {
      const status = problems.length ? 'FAIL' : 'ok  ';
      console.log(`${status} ${line}`);
      for (const pair of claim.pairs) {
        console.log(`       ${describe(pair)}: ${pair.bg ? measured(pair) : pair.fgHex}`);
      }
    }
  });

  for (const [, number] of pageText.matchAll(/(?<![\d.])(\d+(?:\.\d+)?):1(?!\d)/g)) {
    if (!REQUIREMENTS.has(number) && !declared.has(`${number}:1`)) {
      failures.push(`${label}: the page prints ${number}:1, and no line of its \`contrast\` front matter declares it`);
      declared.add(`${number}:1`);
    }
  }
  for (const [hex] of pageText.matchAll(/#[0-9a-f]{6}(?![0-9a-z])/gi)) {
    if (!declared.has(hex.toLowerCase())) {
      failures.push(`${label}: the page prints ${hex}, and no line of its \`contrast\` front matter declares it`);
      declared.add(hex.toLowerCase());
    }
  }
}

const elapsed = Math.round(performance.now() - started);

if (failures.length) {
  console.error(`${failures.length} contrast claim problem(s):\n`);
  for (const failure of failures) {
    console.error(`  ✗ ${failure}\n`);
  }
  console.error(
    "A claim is a line in the page's `contrast` front matter; scripts/check-contrast.js says what each column means.\n" +
      'If a theme changed, fix the number in the prose and in the claim together. If the number crossed 3:1, the\n' +
      'sentence around it needs rewriting, not only the digits.',
  );
  process.exit(1);
}

console.log(
  `PASSED: ${claimCount} contrast claim(s), ${pairCount} colour pair(s) on ${pages.length} page(s) match the ` +
    `shipped themes (${THEMES.join(', ')}) in ${elapsed}ms.`,
);
