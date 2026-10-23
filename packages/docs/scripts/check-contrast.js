/**
 * Fails when a contrast ratio or colour printed on the site no longer matches the shipped themes.
 *
 * The accessibility page's Known gaps table prints measured numbers: Cru's focus ring is 1.47:1 on white, the
 * default theme's is 2.9951:1. Those are facts about the theme stylesheets, and a theme changes without anyone
 * opening that page. A number that is wrong reads exactly like one that is right, and on that page the number is
 * the claim: it says whether 1.4.11 passes.
 *
 * So a page declares the numbers it prints, in its own front matter, and this recomputes each one.
 *
 * ## Declaring a claim
 *
 * A `contrast` block in the page's front matter. A `[label]` line names where the claims under it are printed: the
 * one table row, paragraph or list item on the built page whose text starts with that label, so a table row is
 * named by its first cell. One claim per line after it, columns split by `|`:
 *
 *     contrast: |
 *       # theme | scheme | foreground | background | printed | precision
 *       [Single-tone focus indicator]
 *       cru     | light  | --cs-color-focus | --cs-color-surface-default | 1.47:1 | 2dp
 *
 *   theme       `default`, `cru`, `fl` (a file in `themes/`), a comma list, or `all`.
 *   scheme      `light`, `dark`, or `both`.
 *   foreground  A custom property. `in .cs-invalid` evaluates it on an element carrying that class, a child of
 *               the themed root, never the root itself. `{a,b}` expands to one pair per value, in the property and
 *               the class alike: `in .cs-{invalid,valid}`. A shorthand such as `--cs-focus-ring` is read for the
 *               one colour in it.
 *   background  A custom property evaluated on the themed root, never in a context, or `-` for a colour claim.
 *               `{a,b}` expands here too.
 *   printed     What the row prints, character for character:
 *                 `1.47:1`             every pair rounds to this, at the precision printed.
 *                 `1.25:1 to 1.48:1`   the lowest and highest pair round to these.
 *                 `#ffd000`            a colour claim: the foreground resolves to this.
 *                 `at least 3:1`       every pair passes. Nothing is printed, so nothing is looked for.
 *                 `below 3:1`          every pair fails. Nothing is printed.
 *                 `is #ffd000`         the foreground resolves to this. Nothing is printed.
 *
 *               A line that prints backs one printed copy in its row. Pairs that share one copy go on one line,
 *               so the row prints each value exactly as many times as it has lines printing it.
 *   precision   Optional, `2dp`. Must agree with the decimals in `printed`; it is there because the claims
 *               arrive written that way, and a disagreement means one of the two is a typo.
 *
 * A row that prints something shaped like a ratio or a colour that is not a measurement of the themes, such as an
 * aspect ratio or an example value, says so under its label instead, with the reason, which is required:
 *
 *       [--cs-border-radius-circle]
 *       not measured | 1:1 | an aspect ratio, not a contrast ratio
 *
 * It is anchored like a claim, so when the text it excuses is gone, it fails as backing nothing.
 *
 * ## What fails
 *
 *   1. A pair no longer rounds to the printed value. The message names the claim, both resolved colours, the
 *      printed value and the unrounded actual one.
 *   2. A pair is on the other side of 3:1 from the printed value. Thresholds do not round up: 2.9951 is a
 *      failure even though it rounds to 3.00, so the side is judged on the unrounded ratio. This is also what
 *      makes a crossing loud, because the prose around the number says "passes" or "fails".
 *   3. A claim's printed value is not in its row, so the claim no longer backs anything there. An exact value is
 *      never found inside a range: `1.48:1` is not in `1.25:1 to 1.48:1`.
 *   4. Any built page prints a ratio, a range or a six- or eight-digit hex colour in a row no claim of its own
 *      backs, or prints one more or fewer times than the lines that print it there: one more is a copy nothing
 *      checks, one fewer is a deleted sentence. Every page is read, not only the ones with claims, because the next
 *      number typed anywhere would otherwise be exactly as unchecked as every number was before. WCAG's own levels
 *      (3:1, 4.5:1, 7:1) are requirements rather than measurements and are exempt.
 *
 * A page is read the way a reader sees it: `<main>`, without displayed source or comments (`withoutDisplayedSource`,
 * shared with `check-tokens.js`), without `<script>`, `<style>` and `<template>`, with inline markup removed so
 * `<strong>2.50</strong>:1` reads as `2.50:1`, and with table cells, paragraphs and list items kept apart.
 *
 * ## How a colour is resolved, and why not in a browser
 *
 * Each theme is loaded the way `theming-overview.md` tells consumers to: `cornerstone.css`, then the theme's own
 * stylesheet stacked after it. Cru's is the one `cornerstone.css` already carries, so it is not loaded twice. The
 * stylesheets are parsed here, imports followed, and the cascade applied for the properties a claim reads: cascade
 * layers in `layers.css` order, specificity, source order and inheritance. A custom property is computed on the
 * element that declares it, with its `var()`s substituted there, and descendants inherit the finished value. So
 * `.cs-invalid` re-points `--cs-color-focus` on the control, while `--cs-focus-ring`, declared at the themed root,
 * reaches the control with the root's focus colour already in it. Values may be hex, `white`, `black`, or
 * `color-mix(in oklab, ...)`.
 *
 * Anything else stops the claim with a named error rather than a guess, but only when it could change the answer.
 * A rule the model cannot decide (a pseudo-class, an attribute, a type on the abstract element), or one inside
 * `@media`, `@supports`, `@container`, `@scope`, `@starting-style` or a nested or anonymous `@layer`, wherever it
 * sits, fails a claim when it sets the property and would win if it applied; one a certain rule outranks is
 * ignored. `!important`, `@property`, an import cycle, a translucent or out-of-gamut mix and an unknown function
 * always stop the claim. A resolver that guessed would print a confident wrong number, which is the defect this
 * file exists to stop.
 *
 * A headless browser would get the cascade right by construction, and was rejected for cost, not accuracy:
 * the docs CI job installs no browser, so it would add a Chromium download to every docs run, while every value
 * a claim reaches today is hex or an OKLab mix, which is plain arithmetic. The numbers were measured in
 * Chromium (computed colour painted to a canvas, read back as 8-bit sRGB), and this reproduces that: an OKLab
 * mix is converted back to sRGB and rounded to 8 bits before its luminance is taken.
 *
 * ## Why the numbers are typed twice
 *
 * The claims block is a hand-kept list, and generating the numbers instead is possible: a remark directive could
 * print each ratio from this same resolver. It was declined, not found impossible. Every number would become markup
 * inside prose that its author writes and rewrites by hand; the directive would still need this resolver; and the
 * scan for undeclared numbers would still be needed, to catch a number typed without the directive. What
 * generation would remove is the second copy, and this file fails whenever the two copies disagree.
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
import { withoutDisplayedSource } from './displayed-source.js';

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

const rel = (file) => relative(componentsDir(), file);

/**
 * Parses a stylesheet and everything it imports into `sheet`, in the order a browser applies them.
 *
 * Only custom property declarations are kept, because nothing else can change what a token resolves to. `stack`
 * is the chain of imports that reached this file, which is how a cycle is caught instead of overflowing.
 */
function parseSheet(file, sheet, stack = []) {
  if (stack.includes(file)) {
    throw new Unresolvable(`import cycle: ${[...stack, file].map(rel).join(' → ')}`);
  }
  if (!existsSync(file)) {
    throw new Unresolvable(
      `${stack.length ? rel(stack.at(-1)) : 'the entry'} imports ${rel(file)}, which does not exist`,
    );
  }
  sheet.files.add(file);
  const text = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const ctx = { file, stack: [...stack, file], layer: null, unsupported: null, selector: null, rule: null };
  parseItems(text, 0, ctx, sheet);
}

function parseItems(text, from, ctx, sheet) {
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
      i = parseBlock(text, stop + 1, prelude, ctx, sheet);
      continue;
    }

    if (prelude.startsWith('@')) {
      atStatement(prelude, ctx, sheet);
    } else if (prelude) {
      declaration(prelude, ctx, sheet);
    }
    i = text[stop] === ';' ? stop + 1 : stop;
  }
  return i;
}

function parseBlock(text, from, prelude, ctx, sheet) {
  if (/^@layer\b/.test(prelude)) {
    const name = prelude.slice('@layer'.length).trim();
    if (name && !/[,.]/.test(name) && !ctx.layer && !ctx.rule && !ctx.unsupported) {
      registerLayer(sheet, name);
      return parseItems(text, from, { ...ctx, layer: name }, sheet);
    }
    // Anonymous, or nested in a layer, a rule or a condition: where it sits in the cascade is not modelled.
    return parseItems(text, from, unsupportedContext(ctx, sheet, prelude), sheet);
  }
  if (CONDITIONAL.test(prelude)) {
    return parseItems(text, from, unsupportedContext(ctx, sheet, prelude), sheet);
  }
  if (prelude.startsWith('@property')) {
    sheet.registered.add(prelude.slice('@property'.length).trim());
    return skipBlock(text, from);
  }
  if (INERT.test(prelude)) {
    return skipBlock(text, from);
  }
  if (prelude.startsWith('@')) {
    throw new Unresolvable(`${rel(ctx.file)}: unknown at-rule \`${prelude}\``);
  }

  const selector = ctx.selector ? nest(ctx.selector, prelude) : prelude;
  return parseItems(text, from, { ...ctx, selector, rule: newRule(sheet, ctx, selector) }, sheet);
}

function newRule(sheet, ctx, selector) {
  const rule = { selector, layer: ctx.layer, unsupported: ctx.unsupported, file: ctx.file, decls: [] };
  sheet.rules.push(rule);
  return rule;
}

/**
 * The context inside a block this cannot place in the cascade. Everything declared in it is marked with what it
 * sits inside. Declarations directly inside one that is nested in a style rule, which CSS Nesting allows, belong
 * to the parent's selector, so they get a marked rule of their own rather than joining the parent's unconditionally.
 */
function unsupportedContext(ctx, sheet, prelude) {
  const unsupported = ctx.unsupported ? `${ctx.unsupported} > ${prelude}` : prelude;
  const inner = { ...ctx, unsupported, rule: null };
  return ctx.selector ? { ...inner, rule: newRule(sheet, inner, ctx.selector) } : inner;
}

function atStatement(prelude, ctx, sheet) {
  if (prelude.startsWith('@import')) {
    const match = /^@import\s+(?:url\(\s*)?['"]?([^'")\s]+)['"]?\s*\)?\s*$/.exec(prelude);
    if (!match || ctx.layer || ctx.rule || ctx.unsupported) {
      throw new Unresolvable(`${rel(ctx.file)}: \`${prelude}\` carries a layer or condition this does not model`);
    }
    parseSheet(resolve(dirname(ctx.file), match[1]), sheet, ctx.stack);
  } else if (prelude.startsWith('@layer')) {
    // Inside a layer, a rule or a condition, the statement only names nested layers, and a block that uses one is
    // marked where it opens. At the top it fixes the order every rule is ranked by.
    if (!ctx.layer && !ctx.rule && !ctx.unsupported) {
      for (const name of prelude.slice('@layer'.length).split(',')) {
        registerLayer(sheet, name.trim());
      }
    }
  } else if (!/^@(charset|namespace)\b/.test(prelude)) {
    throw new Unresolvable(`${rel(ctx.file)}: unknown statement \`${prelude}\``);
  }
}

function declaration(text, ctx, sheet) {
  const colon = text.indexOf(':');
  const prop = text.slice(0, colon).trim();
  if (!prop.startsWith('--')) {
    return;
  }
  if (!ctx.rule) {
    throw new Unresolvable(`${rel(ctx.file)}: \`${prop}\` is declared outside a rule`);
  }
  let value = text.slice(colon + 1).trim();
  const important = /!\s*important$/i.test(value);
  value = value.replace(/!\s*important$/i, '').trim();
  ctx.rule.decls.push({ prop, value, important, order: sheet.order++ });
}

function registerLayer(sheet, name) {
  if (!sheet.layers.includes(name)) {
    sheet.layers.push(name);
  }
}

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
// state. `true` and `false` are certain. `null` means the selector depends on something the model does not have.

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
      if (!/\s/.test(ch)) {
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
        return maxSpecificity(splitTop(part.args, ',').map((s) => parseSelector(s)?.specificity ?? [0, 0, 0]));
      }
      return [0, 1, 0];
    default:
      return [0, 0, 0];
  }
}

// ─── Cascade ─────────────────────────────────────────────────────────────────────────────────────────────────────

/** The stylesheets for one theme: `cornerstone.css`, then the theme stacked after it unless it already carries it. */
function loadTheme(theme) {
  const sheet = { rules: [], layers: [], registered: new Set(), files: new Set(), order: 0, byProp: new Map() };
  parseSheet(entry, sheet);
  const own = join(themesDir, `${theme}.css`);
  if (!sheet.files.has(own)) {
    parseSheet(own, sheet);
  }
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

/**
 * The winning declaration of `prop` on `element`, or undefined when nothing declares it there.
 *
 * A rule the model cannot place, because its selector is undecidable or it sits inside something unmodelled, only
 * stops the claim when it would beat the certain winner if it applied and would change the value. Its specificity
 * is taken as the most specific of its selectors that might match, which is the most it could ever have.
 */
function cascaded(sheet, element, prop) {
  let best;
  const uncertain = [];
  for (const { rule, decl } of sheet.byProp.get(prop) ?? []) {
    const matches = splitTop(rule.selector, ',').map((s) => matchSelector(s, element));
    const result = or(matches.map((m) => m.result));
    if (result === false) {
      continue;
    }
    const origin = `\`${rule.selector.replace(/\s+/g, ' ')}\` in ${rel(rule.file)}`;
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
    const upper = maxSpecificity(matches.filter((m) => m.result !== false).map((m) => m.specificity));
    if (result === null || rule.unsupported) {
      const why = rule.unsupported ? `inside \`${rule.unsupported}\`, which this does not model` : 'and may apply';
      uncertain.push({ ...candidate, specificity: upper, reason: `${origin} sets ${prop} ${why}` });
      continue;
    }
    if (greater(upper, candidate.specificity) > 0) {
      uncertain.push({ ...candidate, specificity: upper, reason: `${origin} may match ${prop} more specifically` });
    }
    if (!best || beats(candidate, best)) {
      best = candidate;
    }
  }
  for (const rival of uncertain) {
    if (!best || (beats(rival, best) && rival.value !== best.value)) {
      throw new Unresolvable(`${rival.reason}, and it would win if it applied`);
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

/**
 * A custom property's computed value on `element`. Declared here, it is computed here, with its `var()`s
 * substituted on this element; otherwise it is the parent's computed value, finished, as CSS inherits it.
 */
function computed(sheet, element, prop, trail = []) {
  if (sheet.registered.has(prop)) {
    throw new Unresolvable(`${prop} is registered with @property, which this does not model`);
  }
  if (trail.includes(prop)) {
    throw new Unresolvable(`${[...trail, prop].join(' → ')} is a cycle`);
  }
  if (element.cache.has(prop)) {
    return element.cache.get(prop);
  }
  const winner = cascaded(sheet, element, prop);
  let value;
  if (winner) {
    value = substitute(sheet, element, winner.value, [...trail, prop]);
  } else if (element.parent) {
    value = computed(sheet, element.parent, prop);
  }
  element.cache.set(prop, value);
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
  const text = value.replace(/\s+/g, ' ').trim().toLowerCase();
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

/** Keywords and lengths a shorthand such as an outline holds beside its colour. */
const LINE_STYLES = new Set([
  'none',
  'hidden',
  'dotted',
  'dashed',
  'solid',
  'double',
  'groove',
  'ridge',
  'inset',
  'outset',
  'auto',
]);
const NOT_A_COLOUR = (part) => LINE_STYLES.has(part) || /^-?[\d.]+[a-z%]*$/.test(part) || /^calc\(/.test(part);

/** The one colour in a value: the value itself, or the single part of a shorthand that is not a style or a length. */
function colourIn(value) {
  const parts = splitTop(value.replace(/\s+/g, ' ').trim().toLowerCase(), ' ').filter(Boolean);
  if (parts.length === 1) {
    return toHex(parts[0]);
  }
  const colours = parts.filter((part) => !NOT_A_COLOUR(part));
  if (colours.length !== 1) {
    throw new Unresolvable(`\`${value}\` has ${colours.length} parts that could be its colour`);
  }
  return toHex(colours[0]);
}

/**
 * `color-mix(in oklab, a p1, b p2)`, per CSS Color 5: a missing percentage is the rest of 100, and a pair that sums
 * past 100 is scaled back down and stays opaque. Only a sum under 100 leaves the result translucent.
 */
function mixOklab(args, text) {
  if (args.length !== 2) {
    throw new Unresolvable(`\`${text}\` does not mix exactly two colours`);
  }
  const stops = args.map((arg) => {
    const percent = /(?:^|\s)(\d+(?:\.\d+)?)%(?:\s|$)/.exec(arg);
    return { color: toHex(percent ? arg.replace(percent[0], ' ') : arg), percent: percent ? Number(percent[1]) : null };
  });
  const [a, b] = stops;
  if (stops.some((s) => s.percent !== null && s.percent > 100)) {
    throw new Unresolvable(`\`${text}\` has a percentage above 100%, which makes it invalid`);
  }
  if (a.percent === null && b.percent === null) {
    a.percent = b.percent = 50;
  } else if (a.percent === null) {
    a.percent = 100 - b.percent;
  } else if (b.percent === null) {
    b.percent = 100 - a.percent;
  }
  const sum = a.percent + b.percent;
  if (sum === 0) {
    throw new Unresolvable(`\`${text}\` has percentages summing to 0, which makes it invalid`);
  }
  if (sum < 100) {
    throw new Unresolvable(`\`${text}\` leaves the result translucent, which has no single contrast ratio`);
  }
  const lab = (hex) => {
    const { L, C, H } = hexToOklch(hex);
    return [L, C * Math.cos((H * Math.PI) / 180), C * Math.sin((H * Math.PI) / 180)];
  };
  const [x, y] = [lab(a.color), lab(b.color)];
  const [L, A, B] = x.map((v, i) => (v * a.percent + y[i] * b.percent) / sum);
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

const NUMBER = '(\\d+(?:\\.\\d+)?)';

/**
 * The printed column, read once. `token` is the text a row must contain, written the way `tokensOf` reads a page,
 * or null for a claim that prints nothing.
 */
function parsePrinted(printed) {
  let match;
  if ((match = new RegExp(`^${NUMBER}:1$`).exec(printed))) {
    return { kind: 'exact', values: [match[1]], threshold: THRESHOLD, token: printed };
  }
  if ((match = new RegExp(`^${NUMBER}:1 to ${NUMBER}:1$`).exec(printed))) {
    return { kind: 'range', values: [match[1], match[2]], threshold: THRESHOLD, token: printed };
  }
  if ((match = new RegExp(`^(at least|below) ${NUMBER}:1$`).exec(printed))) {
    return { kind: match[1] === 'at least' ? 'pass' : 'fail', values: [], threshold: Number(match[2]), token: null };
  }
  if ((match = /^(is )?(#[0-9a-f]{6})$/i.exec(printed))) {
    const hex = match[2].toLowerCase();
    return { kind: 'colour', values: [hex], threshold: THRESHOLD, token: match[1] ? null : hex };
  }
  throw new Unresolvable(`cannot read printed value \`${printed}\``);
}

/** One line of a `contrast` block, or throws with what is wrong with it. */
function parseClaim(line) {
  const columns = line.split('|').map((c) => c.trim());
  if (columns.length < 5 || columns.length > 6) {
    throw new Unresolvable('expected 5 or 6 columns: theme | scheme | foreground | background | printed | precision');
  }
  const [themeText, schemeText, fgText, bgText, printedText, precision] = columns;

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
  const contexts = contextPart
    ? expand(contextPart).map((classes) => {
        if (!/^(\.[-_a-zA-Z0-9]+)+$/.test(classes)) {
          throw new Unresolvable(`context \`${classes}\` should be classes, like \`.cs-invalid\``);
        }
        return classes.split('.').filter(Boolean);
      })
    : [[]];
  if (/\s+in\s+/.test(bgText)) {
    throw new Unresolvable('a background is evaluated on the themed root; only the foreground takes `in .class`');
  }
  const fgs = expand(fgPart);
  const bgs = bgText === '-' ? [null] : expand(bgText);

  const printed = parsePrinted(printedText);
  if ((printed.kind === 'colour') !== (bgText === '-')) {
    throw new Unresolvable('a colour claim, and only a colour claim, takes `-` as its background');
  }
  if (precision) {
    const dp = /^(\d+)dp$/.exec(precision);
    if (!dp || printed.values.some((v) => printed.kind !== 'colour' && decimals(v) !== Number(dp[1]))) {
      throw new Unresolvable(`precision \`${precision}\` does not match \`${printedText}\``);
    }
  }

  const pairs = [];
  for (const theme of themes) {
    for (const scheme of schemes) {
      for (const fg of fgs) {
        for (const context of contexts) {
          for (const bg of bgs) {
            // The last three are filled in by evaluate().
            pairs.push({ theme, scheme, fg, bg, context, fgHex: '', bgHex: '', ratio: NaN });
          }
        }
      }
    }
  }
  return { ...printed, printed: printedText, pairs };
}

const sheets = new Map();

/** The abstract elements a pair is evaluated on: `html.cs-{scheme}`, and a child carrying the context classes. */
function elementFor(theme, scheme, context) {
  if (!sheets.has(theme)) {
    try {
      sheets.set(theme, { sheet: loadTheme(theme), elements: new Map() });
    } catch (error) {
      sheets.set(theme, { error });
    }
  }
  const loaded = sheets.get(theme);
  if (loaded.error) {
    throw loaded.error;
  }
  const key = `${scheme}|${context.join('.')}`;
  if (!loaded.elements.has(key)) {
    const root = { type: 'html', classes: new Set([`cs-${scheme}`]), parent: null, cache: new Map() };
    const element = context.length ? { type: null, classes: new Set(context), parent: root, cache: new Map() } : root;
    loaded.elements.set(key, { sheet: loaded.sheet, root, element });
  }
  return loaded.elements.get(key);
}

const colourOf = (token, pair, onElement) => {
  const { sheet, root, element } = elementFor(pair.theme, pair.scheme, pair.context);
  const value = token.startsWith('--') ? computed(sheet, onElement ? element : root, token) : token;
  if (value === undefined) {
    throw new Unresolvable(`${token} is not defined in ${pair.theme} ${pair.scheme}`);
  }
  return colourIn(value);
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

/** Every way a claim's numbers no longer hold, as messages. */
function judge(claim) {
  const problems = [];
  const t = claim.threshold;
  if (claim.kind === 'colour') {
    for (const pair of claim.pairs.filter((p) => p.fgHex !== claim.values[0])) {
      const said = claim.token ? `printed ${claim.values[0]}` : `claimed \`${claim.printed}\``;
      problems.push(`${describe(pair)}: ${said}, actual ${pair.fgHex}`);
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
    [sorted[0], sorted.at(-1)].forEach((pair, i) => {
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

/**
 * A `contrast` block read into the rows it names. Each entry keeps its printed token even when the rest of the
 * line is broken, so a broken claim is reported once, as broken, rather than again as an undeclared number.
 */
function readClaims(block, label) {
  const sections = [];
  const orphans = [];
  let section = null;
  block.split('\n').forEach((raw, index) => {
    const line = raw.trim();
    if (!line || line.startsWith('#')) {
      return;
    }
    const where = `${label} contrast line ${index + 1}`;
    const heading = /^\[(.+)\]$/.exec(line);
    if (heading) {
      section = { label: heading[1].trim(), where, claims: [], unit: undefined };
      sections.push(section);
      return;
    }
    const entry = { line, where, claim: null, token: null, exempt: null, problems: [] };
    const columns = line.split('|').map((c) => c.trim());
    if (columns[0] === 'not measured') {
      const [token] = tokensOf(columns[1] ?? '');
      entry.token = token ?? null;
      entry.exempt = columns[2] ?? '';
      if (columns.length !== 3 || !token || token !== (token.startsWith('#') ? columns[1].toLowerCase() : columns[1])) {
        entry.problems.push('should be `not measured | <one ratio or hex colour, as printed> | <why it is not one>`');
      } else if (!entry.exempt) {
        entry.problems.push('needs the reason this is not a measurement');
      }
    } else {
      try {
        entry.token = parsePrinted(columns[4] ?? '').token;
      } catch {
        // parseClaim reports it.
      }
    }
    if (!section) {
      entry.problems.push('is not under a `[label]` line naming the row or paragraph that prints it');
      orphans.push(entry);
      return;
    }
    if (entry.exempt !== null) {
      section.claims.push(entry);
      return;
    }
    try {
      entry.claim = parseClaim(line);
      evaluate(entry.claim);
      entry.problems.push(...judge(entry.claim));
    } catch (error) {
      if (!(error instanceof Unresolvable)) {
        throw error;
      }
      entry.claim = null;
      entry.problems.push(`could not check it: ${error.message}`);
    }
    section.claims.push(entry);
  });
  return { label, sections, orphans };
}

// ─── Pages ───────────────────────────────────────────────────────────────────────────────────────────────────────

/** Elements that start a new row, paragraph or list item, so numbers in neighbouring ones are never read as one. */
const BLOCK_TAG =
  /<\/?(?:address|article|aside|blockquote|caption|dd|details|dialog|div|dl|dt|fieldset|figcaption|figure|footer|form|h[1-6]|header|hr|li|main|nav|ol|p|section|summary|table|tbody|tfoot|thead|tr|ul)\b[^>]*>/i;

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const decode = (text) =>
  text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, name) =>
    name[0] !== '#'
      ? (ENTITIES[name.toLowerCase()] ?? whole)
      : String.fromCodePoint(name[1].toLowerCase() === 'x' ? parseInt(name.slice(2), 16) : Number(name.slice(1))),
  );

/**
 * A built page as the text units a reader sees: rows, paragraphs and list items. Table cells and line breaks
 * become spaces; every other inline tag is removed outright, so markup inside a number does not split it.
 */
function unitsOf(html) {
  const main = /<main\b[^>]*>([\s\S]*)<\/main>/i.exec(html)?.[1] ?? html;
  const shown = withoutDisplayedSource(main).replace(/<(script|style|template)\b[\s\S]*?<\/\1\s*>/gi, ' ');
  return shown
    .split(new RegExp(BLOCK_TAG.source, 'gi'))
    .map((chunk) =>
      decode(chunk.replace(/<\/?(?:td|th|br)\b[^>]*>/gi, ' ').replace(/<[^>]*>/g, ''))
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .filter(Boolean);
}

/** Ranges first, so an exact value is never read out of one; then single ratios; then six- or eight-digit hex. */
const TOKEN =
  /(?<![\d.])\d+(?:\.\d+)?:1 to \d+(?:\.\d+)?:1(?!\d)|(?<![\d.])\d+(?:\.\d+)?:1(?!\d)|(?<![\w/&])#(?:[0-9a-f]{8}|[0-9a-f]{6})(?![0-9a-z])/gi;
const tokensOf = (text) =>
  [...text.matchAll(TOKEN)].map(([token]) => (token.startsWith('#') ? token.toLowerCase() : token));
const isRequirement = (token) => /^[\d.]+:1$/.test(token) && REQUIREMENTS.has(token.slice(0, -2));
const excerpt = (unit) => (unit.length > 70 ? `${unit.slice(0, 67)}...` : unit);
const tally = (items) => items.reduce((counts, item) => counts.set(item, (counts.get(item) ?? 0) + 1), new Map());

/** Whether a unit's text opens with the label as whole words: `Forced colors` names `Forced colors, ...` only. */
const startsWithLabel = (unit, label) => unit.startsWith(label) && !/[\p{L}\p{N}]/u.test(unit[label.length] ?? '');

// ─── Run ─────────────────────────────────────────────────────────────────────────────────────────────────────────

const started = performance.now();
const failures = [];

/** Built page → the source page's label, and the claims it declares, for every content page. */
const sourceOf = new Map();
const claimsOf = new Map();
for (const file of readdirSync(contentDir, { recursive: true })
  .map(String)
  .filter((f) => /\.mdx?$/.test(f))
  .sort()) {
  const slug = file.replace(/\.mdx?$/, '').replace(/(^|\/)index$/, '');
  const built = join(distDir, slug, 'index.html');
  const label = relative(siteDir, join(contentDir, file));
  sourceOf.set(built, label);
  const { contrast } = matter(readFileSync(join(contentDir, file), 'utf8')).data;
  if (contrast === undefined) {
    continue;
  }
  if (typeof contrast !== 'string') {
    failures.push(`${label}: \`contrast\` must be a block of lines (\`contrast: |\`), not ${typeof contrast}`);
    continue;
  }
  claimsOf.set(built, readClaims(contrast, label));
  if (!existsSync(built)) {
    failures.push(`${label}: ${relative(siteDir, built)} does not exist. Run \`npm run build\` first.`);
  }
}

const builtPages = existsSync(distDir)
  ? readdirSync(distDir, { recursive: true })
      .map(String)
      .filter((f) => f.endsWith('.html'))
      .sort()
      .map((f) => join(distDir, f))
  : [];
if (!builtPages.length) {
  failures.push(`No built pages under ${relative(siteDir, distDir)}. Run \`npm run build\` first.`);
}

let claimCount = 0;
let pairCount = 0;
let exemptCount = 0;

for (const built of builtPages) {
  const label = sourceOf.get(built) ?? relative(siteDir, built);
  const units = unitsOf(readFileSync(built, 'utf8'));
  const page = claimsOf.get(built);

  /** Unit index → the claims whose row it is. */
  const backers = new Map();
  for (const section of page?.sections ?? []) {
    const hits = units.flatMap((unit, i) => (startsWithLabel(unit, section.label) ? [i] : []));
    if (hits.length !== 1) {
      const found = hits.length ? `${hits.length} rows or paragraphs start` : 'no row or paragraph starts';
      failures.push(`${section.where}: [${section.label}]\n    ${found} with it on the built page`);
      continue;
    }
    section.unit = hits[0];
    backers.set(hits[0], [...(backers.get(hits[0]) ?? []), ...section.claims]);
    const printed = tokensOf(units[hits[0]]);
    for (const claimEntry of section.claims.filter((e) => e.token && !printed.includes(e.token))) {
      claimEntry.problems.push(
        `\`${claimEntry.token}\` is not in [${section.label}], so this claim backs nothing there`,
      );
    }
  }

  // Each line that prints backs one printed copy in its row, so the row must print each value exactly as many times
  // as it has lines for it. One more copy is a number nothing checks; one fewer is a deleted sentence. A copy no
  // line backs at all is reported here; a line with no copy at all is reported on the line, above.
  units.forEach((unit, i) => {
    const printed = tally(tokensOf(unit));
    const declared = tally((backers.get(i) ?? []).map((e) => e.token).filter(Boolean));
    for (const [token, copies] of printed) {
      const lines = declared.get(token) ?? 0;
      if (lines === copies || (lines === 0 && isRequirement(token))) {
        continue;
      }
      failures.push(
        lines === 0
          ? `${label}: prints ${token} in "${excerpt(unit)}", and no claim for that row declares it`
          : `${label}: prints ${token} ${copies} time(s) in "${excerpt(unit)}", but ${lines} line(s) under its ` +
              'label print it; each line backs one printed copy',
      );
    }
  });

  for (const claimEntry of [...(page?.orphans ?? []), ...(page?.sections ?? []).flatMap((s) => s.claims)]) {
    if (claimEntry.claim) {
      claimCount++;
      pairCount += claimEntry.claim.pairs.length;
    } else if (claimEntry.exempt) {
      exemptCount++;
    }
    if (claimEntry.problems.length) {
      failures.push(
        `${claimEntry.where}: ${claimEntry.line}\n${claimEntry.problems.map((p) => `    ${p}`).join('\n')}`,
      );
    }
    if (list && claimEntry.claim) {
      console.log(`${claimEntry.problems.length ? 'FAIL' : 'ok  '} ${claimEntry.line}`);
      for (const pair of claimEntry.claim.pairs) {
        console.log(`       ${describe(pair)}: ${pair.bg ? measured(pair) : pair.fgHex}`);
      }
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
    "A claim is a line in a page's `contrast` front matter, under a `[label]` naming the row that prints it;\n" +
      'scripts/check-contrast.js says what each column means. If a theme changed, fix the number in the prose and\n' +
      'in the claim together. If the number crossed 3:1, the sentence around it needs rewriting, not only the digits.',
  );
  process.exit(1);
}

console.log(
  `PASSED: ${claimCount} contrast claim(s), ${pairCount} colour pair(s) on ${claimsOf.size} page(s) match the ` +
    `shipped themes (${THEMES.join(', ')}), and none of ${builtPages.length} built page(s) prints an undeclared ` +
    `ratio or colour (${exemptCount} declared not measured), in ${elapsed}ms.`,
);
