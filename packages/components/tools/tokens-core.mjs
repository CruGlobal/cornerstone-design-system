/**
 * Emits a brand's generated palette and theme as DTCG token files plus a resolver.
 *
 * The same knobs that produce `src/styles/**` produce these, from the same ramps in the same run —
 * so the token files are a second rendering of one source rather than a parallel definition that
 * could disagree. Terrazzo turns them back into CSS, and into everything else that needs the values:
 * the published package, the MUI and daisyUI adapters, Figma.
 *
 * ## Not everything that defines a `var()` is a token
 *
 * A `--cs-*` declared from a literal or from a single `var()` is a token — a value, or an alias.
 * A `--cs-*` declared from a `calc()`, `color-mix()` or `oklch()` over other variables is a
 * *formula*, and DTCG has no way to say it. `--cs-color-<hue>-on` is `color-mix()` over two other
 * variables; `--cs-space-m` is `calc(var(--cs-space-scale) * 1rem)`. Their inputs are the tokens;
 * they themselves are derived at use time, and flattening them to static values would throw away
 * the runtime rescaling the library gets from them.
 *
 * So those are **deferred**: reported back rather than emitted, for the caller to keep as CSS. The
 * count is part of the output because a formula silently becoming a token is exactly the regression
 * this split exists to prevent.
 *
 * ## Id scheme
 *
 * Ids are namespaced by layer — `palette.*`, `role.*`, `theme.*` — so a Terrazzo `exclude` glob can
 * send each to its own stylesheet and its own cascade layer. The CSS variable name drops that first
 * segment, which is what `variableName` in the generated config does; `base` is dropped entirely so
 * `palette.color.yellow.base` reaches CSS as `--cs-color-yellow`, the name the palette already uses
 * for a hue's key step.
 */

const SCHEMA = 'https://www.designtokens.org/schemas/2025.10/format.json';
const RESOLVER_SCHEMA = 'https://www.designtokens.org/schemas/2025.10/resolver.json';

const pad = (n) => String(n).padStart(2, '0');

/** Hex to DTCG's 2025.10 colour object. Terrazzo rejects hex strings outright, and `legacyHex` puts them back. */
export function toColor(hex) {
  const n = hex.replace('#', '');
  const f = n.length === 3 ? [...n].map((c) => c + c).join('') : n;
  return {
    colorSpace: 'srgb',
    components: [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16) / 255),
  };
}

const WHITE = { colorSpace: 'srgb', components: [1, 1, 1] };

/**
 * A generated CSS value to a DTCG `$value`, or `null` if it is a formula rather than a token.
 *
 * The three shapes the theme grid produces are a role reference, the literal `white`, and a
 * `color-mix()`/`oklch()` expression. Only the first two are expressible.
 */
export function toValue(css, roles) {
  const ref = /^var\(--cs-color-([a-z-]+)-(\d{2})\)$/.exec(css.trim());
  if (ref && roles.has(ref[1])) {
    return { $value: `{role.color.${ref[1]}.${ref[2]}}` };
  }
  if (css.trim() === 'white') {
    return { $value: WHITE };
  }
  return null;
}

/** The hue ramps: every step a literal, plus the key step as an alias and as a number. */
function paletteFile(ramps) {
  const color = {};
  for (const [hue, r] of Object.entries(ramps)) {
    const own = r.mode === 'fitted' ? r.ownStep[hue] : r.keyStep;
    const group = { $type: 'color' };
    for (const s of [...Object.keys(r.steps)].map(Number).sort((a, b) => b - a)) {
      group[pad(s)] = { $value: toColor(r.steps[s]) };
    }
    group.base = { $value: `{palette.color.${hue}.${pad(own)}}` };
    group.key = { $type: 'number', $value: own };
    color[hue] = group;
  }
  return { $schema: SCHEMA, palette: { color } };
}

/** The role→hue layer: which hue each role points at, as aliases into the palette. */
function rolesFile(brand, ramps) {
  const roleMap = { ...brand.roles, link: brand.link };
  const color = {};
  for (const [role, hue] of Object.entries(roleMap)) {
    const r = ramps[hue];
    const own = r.mode === 'fitted' ? r.ownStep[hue] : r.keyStep;
    const group = { $type: 'color' };
    for (const s of [...Object.keys(r.steps)].map(Number).sort((a, b) => b - a)) {
      group[pad(s)] = { $value: `{palette.color.${hue}.${pad(s)}}` };
    }
    group.base = { $value: `{palette.color.${hue}.${pad(own)}}` };
    group.key = { $type: 'number', $value: own };
    color[role] = group;
  }
  return { $schema: SCHEMA, role: { color } };
}

/**
 * The per-mode semantic layer: the role × {fill,border,on} × {quiet,normal,loud} grid and the
 * surface, text and overlay colours, as aliases into the role layer.
 *
 * Light and dark share every name and differ only in what they point at, which is precisely a
 * resolver modifier — one file, two top-level contexts a `$ref` can address by JSON pointer.
 */
function themeFile(brand, ramps, gridFor, surfaceFor, roles, deferred) {
  const out = { $schema: SCHEMA };
  const keyStepOf = (role) => {
    const hue = brand.roles[role];
    return ramps[hue].mode === 'fitted' ? ramps[hue].ownStep[hue] : ramps[hue].keyStep;
  };

  for (const mode of ['light', 'dark']) {
    const color = {};
    for (const [prop, css] of surfaceFor(mode, keyStepOf('brand'))) {
      const value = toValue(css, roles);
      if (value) {
        color[prop] = value;
      } else {
        deferred.push({ mode, name: `--cs-color-${prop}`, value: css });
      }
    }
    for (const role of Object.keys(brand.roles)) {
      const group = {};
      for (const [slot, css] of gridFor(role, mode, keyStepOf(role))) {
        const value = toValue(css, roles);
        if (value) {
          group[slot] = value;
        } else {
          deferred.push({ mode, name: `--cs-color-${role}-${slot}`, value: css });
        }
      }
      color[role] = group;
    }
    out[mode] = { theme: { $type: 'color', color } };
  }
  return out;
}

/**
 * How each mode-independent name is typed.
 *
 * A table rather than inference from the value, because inference is exactly what gets this wrong:
 * `--cs-border-style: solid` and `--cs-button-transform-hover: none` are both bare keywords, and only
 * the first is a `strokeStyle`. Anything not matched here is deferred rather than guessed.
 */
const FOUNDATION_TYPES = [
  [/^font-family-/, 'fontFamily'],
  [/^font-weight-(light|normal|semibold|bold)$/, 'fontWeight'],
  [/^(line-height-|.*-scale$|font-size-scale$)/, 'number'],
  [/^transition-(slow|normal|fast)$/, 'duration'],
  [/^(border-style|focus-ring-style)$/, 'strokeStyle'],
];

const DIMENSION = /^(-?[0-9.]+)(px|rem|em)$/;
const DURATION = /^(-?[0-9.]+)(ms|s)$/;

/**
 * The mode-independent block as tokens: the scale knobs, font stacks and control metrics that do not
 * change between light and dark.
 *
 * Most of this block is formulas — `--cs-space-m` is `calc(var(--cs-space-scale) * 1rem)` and the
 * whole ramp is like it. The knob is `--cs-space-scale`, and that is what is emitted; the ramp stays
 * a formula so changing one number still rescales everything at use time.
 */
function foundationFile(carried, deferred) {
  const decls = [...carried.matchAll(/(--cs-[a-z0-9-]+)\s*:\s*([^;]+);/g)].map((m) => [
    m[1].replace('--cs-', ''),
    m[2].trim().replace(/\s+/g, ' '),
  ]);

  const out = {};
  for (const [name, value] of decls) {
    if (/calc\(|color-mix\(|oklch\(|round\(|var\(/.test(value)) {
      deferred.push({ mode: 'both', name: `--cs-${name}`, value });
      continue;
    }
    const $type = FOUNDATION_TYPES.find(([re]) => re.test(name))?.[1];
    let $value;
    if ($type === 'fontFamily') {
      $value = value.split(',').map((f) => f.trim().replace(/^['"]|['"]$/g, ''));
    } else if ($type === 'fontWeight' || $type === 'number') {
      $value = Number(value);
    } else if ($type === 'duration') {
      const m = DURATION.exec(value);
      $value = m && { value: Number(m[1]), unit: m[2] };
    } else if ($type === 'strokeStyle') {
      $value = value;
    } else {
      const m = DIMENSION.exec(value);
      if (m) {
        out[name] = { $type: 'dimension', $value: { value: Number(m[1]), unit: m[2] } };
        continue;
      }
    }
    if ($type && $value !== undefined && $value !== null && !Number.isNaN($value)) {
      out[name] = { $type, $value };
    } else {
      deferred.push({ mode: 'both', name: `--cs-${name}`, value });
    }
  }
  return { $schema: SCHEMA, foundation: out };
}

/**
 * The resolver: what is always applied, and what forks.
 *
 * The palette and the role map are sets because a brand has exactly one of each. Light and dark are
 * a modifier because they are alternate values for the same names — the distinction the DTCG
 * resolver spec draws, and the one the cascade already drew with `.cs-light` / `.cs-dark`.
 */
function resolverFile(brandName) {
  return {
    $schema: RESOLVER_SCHEMA,
    version: '2025.10',
    name: `Cornerstone — ${brandName}`,
    resolutionOrder: [
      { $ref: '#/sets/palette' },
      { $ref: '#/sets/roles' },
      { $ref: '#/sets/foundation' },
      { $ref: '#/modifiers/theme' },
    ],
    sets: {
      palette: { sources: [{ $ref: 'palette.tokens.json' }] },
      roles: { sources: [{ $ref: 'roles.tokens.json' }] },
      foundation: { sources: [{ $ref: 'foundation.tokens.json' }] },
    },
    modifiers: {
      theme: {
        default: 'light',
        contexts: {
          light: [{ $ref: 'theme.tokens.json#light' }],
          dark: [{ $ref: 'theme.tokens.json#dark' }],
        },
      },
    },
  };
}

/**
 * A brand's ramps in, DTCG token files out.
 *
 * `gridFor` and `surfaceFor` are passed in rather than imported so this module stays independent of
 * how the theme is laid out — and so a caller can emit tokens for a theme it built differently.
 */
export function buildTokens({ brandName, brand, ramps, gridFor, surfaceFor, carried }) {
  const roles = new Set([...Object.keys(brand.roles), 'link']);
  const deferred = [];
  const theme = themeFile(brand, ramps, gridFor, surfaceFor, roles, deferred);

  return {
    files: {
      'palette.tokens.json': paletteFile(ramps),
      'roles.tokens.json': rolesFile(brand, ramps),
      'theme.tokens.json': theme,
      'foundation.tokens.json': foundationFile(carried, deferred),
      [`${brandName}.resolver.json`]: resolverFile(brandName),
    },
    deferred,
  };
}
