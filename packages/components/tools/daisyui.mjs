#!/usr/bin/env node
/**
 * Emits the daisyUI 5 themes in `packages/tokens/libraries/daisyui.css` from the brand knobs, so an app
 * styled with daisyUI shows the same colours as the `cs-*` components beside it.
 *
 *   node tools/daisyui.mjs            write the file
 *   node tools/daisyui.mjs --check    exit 1 if the committed file differs, or a text role fails AA
 *   node tools/daisyui.mjs --report   print the WCAG contrast of every colour pair
 *
 * Source is `tools/brands/<brand>.json`, through the same ramps and role grid `palette.mjs` uses for the
 * component themes. Each daisyUI slot names a `cs-*` theme token (`success-fill-loud`, `surface-lowered`);
 * this script resolves that token to a hex for each mode. Nothing here is a hand-copied value.
 *
 * The file stays in the token package for now because MOA copies it from there. Where library bridges
 * should live is an open question for the standard (tokens-and-theming.md, lines 35-36).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildRamps, gridFor, hexToOklch, luminance, oklchToHex, readBrand, surfaceFor } from './palette.mjs';

const ROOT = new URL('../../..', import.meta.url).pathname.replace(/\/$/, '');
const OUT = join(ROOT, 'packages/tokens/libraries/daisyui.css');
const AA = 4.5;

// daisyUI 5.5's soft variants (alert-soft, badge-soft, btn-soft) mix 8% or 10% of the slot colour into
// base-100. The text roles are checked on both, as well as on base-100 and base-200.
const SOFT_MIX = [8, 10];

const THEMES = [
  { name: 'cru-dark', brand: 'cru', mode: 'dark', default: false, prefersdark: true },
  { name: 'cru-light', brand: 'cru', mode: 'light', default: true, prefersdark: false },
  { name: 'familylife-light', brand: 'fl', mode: 'light', default: false, prefersdark: false },
  { name: 'familylife-dark', brand: 'fl', mode: 'dark', default: false, prefersdark: false },
];

// daisyUI slot → `cs-*` theme token. A slot and its `-content` are a fill and the text that sits on it.
// `cs-*` has no secondary role; secondary reads neutral's loud fill until the design team names one.
const SLOTS = {
  'base-100': 'surface-default',
  'base-200': 'surface-lowered',
  'base-300': 'surface-border',
  'base-content': 'text-normal',
  primary: 'brand-fill-loud',
  'primary-content': 'brand-on-loud',
  secondary: 'neutral-fill-loud',
  'secondary-content': 'neutral-on-loud',
  accent: 'highlight-fill-loud',
  'accent-content': 'highlight-on-loud',
  neutral: 'neutral-fill-loud',
  'neutral-content': 'neutral-on-loud',
  info: 'information-fill-loud',
  'info-content': 'information-on-loud',
  success: 'success-fill-loud',
  'success-content': 'success-on-loud',
  warning: 'warning-fill-loud',
  'warning-content': 'warning-on-loud',
  error: 'danger-fill-loud',
  'error-content': 'danger-on-loud',
};

// Text colours for daisyUI's text uses of each status slot: text-*, link-*, and the soft, outline, dash
// and ghost variants. `on-quiet` is what the components use for text on the surface and on quiet fills.
const TEXT_ROLES = {
  'on-primary-container': ['brand-on-quiet', 'primary'],
  'on-info-container': ['information-on-quiet', 'info'],
  'on-success-container': ['success-on-quiet', 'success'],
  'on-warning-container': ['warning-on-quiet', 'warning'],
  'on-error-container': ['danger-on-quiet', 'error'],
};

const SHAPE = {
  '--radius-selector': '0rem',
  '--radius-field': '0rem',
  '--radius-box': '0rem',
  '--size-selector': '0.25rem',
  '--size-field': '0.25rem',
  '--border': '2px',
  '--depth': '0',
  '--noise': '0',
};

// ─── colour ───────────────────────────────────────────────────────────────
const toLab = (hex) => {
  const { L, C, H } = hexToOklch(hex);
  const h = (H * Math.PI) / 180;
  return { L, a: C * Math.cos(h), b: C * Math.sin(h) };
};

/** CSS `color-mix(in oklab, a pa%, b)`, resolved to a hex. */
function mixOklab(a, b, pa) {
  const [x, y, t] = [toLab(a), toLab(b), pa / 100];
  const L = x.L * t + y.L * (1 - t);
  const A = x.a * t + y.a * (1 - t);
  const B = x.b * t + y.b * (1 - t);
  const C = Math.hypot(A, B);
  const H = ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360;
  return oklchToHex({ L, C, H }).hex;
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (hi + 0.05) / (lo + 0.05);
}

// ─── resolving cs-* tokens ────────────────────────────────────────────────
function themeTokens(brandName, mode) {
  const brand = readBrand(brandName);
  const { ramps } = buildRamps(brand);
  const hueOf = (role) => (role === 'link' ? brand.link : brand.roles[role]);
  const keyStepOf = (role) => {
    const r = ramps[hueOf(role)];
    return r.mode === 'fitted' ? r.ownStep[hueOf(role)] : r.keyStep;
  };

  const raw = new Map(surfaceFor(mode, keyStepOf('brand')));
  for (const role of Object.keys(brand.roles)) {
    for (const [slot, value] of gridFor(role, mode, keyStepOf(role))) {
      raw.set(`${role}-${slot}`, value);
    }
  }

  const resolve = (value) => {
    const v = value.trim();
    if (v === 'white') {
      return '#ffffff';
    }
    if (v === 'black') {
      return '#000000';
    }
    let m = v.match(/^var\(--cs-color-([a-z-]+?)-(\d\d)\)$/);
    if (m && (brand.roles[m[1]] || m[1] === 'link')) {
      return ramps[hueOf(m[1])].steps[Number(m[2])];
    }
    m = v.match(/^var\(--cs-color-([a-z-]+)\)$/);
    if (m && raw.has(m[1])) {
      return resolve(raw.get(m[1]));
    }
    m = v.match(/^color-mix\(in oklab, (.+), (\S+) (\d+)%\)$/);
    if (m) {
      return mixOklab(resolve(m[2]), resolve(m[1]), Number(m[3]));
    }
    throw new Error(`${brandName} ${mode}: cannot resolve "${v}"`);
  };

  return (token) => {
    if (!raw.has(token)) {
      throw new Error(`${brandName} ${mode}: no cs-* token "${token}"`);
    }
    return resolve(raw.get(token)).toLowerCase();
  };
}

function resolveTheme(theme) {
  const token = themeTokens(theme.brand, theme.mode);
  const colors = Object.fromEntries(Object.entries(SLOTS).map(([slot, t]) => [slot, token(t)]));
  const text = Object.fromEntries(Object.entries(TEXT_ROLES).map(([slot, [t]]) => [slot, token(t)]));
  return { ...theme, colors, text };
}

// ─── output ───────────────────────────────────────────────────────────────
function render(themes) {
  const header = [
    '/*',
    ' * Cornerstone themes for daisyUI 5. Generated by packages/components/tools/daisyui.mjs from the brand',
    ' * knobs in packages/components/tools/brands/, so these match the cs-* components. Do not edit by hand.',
    ' *',
    ' * daisyUI uses each status slot (--color-primary, -info, -success, -warning, -error) both as a fill',
    ' * and as a text colour. Those slots are FILLS and several fail WCAG AA as text. For text (text-*,',
    ' * link-*, and the soft, outline, dash and ghost variants) use the matching',
    ' * --color-on-<slot>-container, which passes AA on base-100, base-200 and the soft tints.',
    ' */',
    '',
  ].join('\n');
  const blocks = themes.map((t) => {
    const lines = [
      `  name: "${t.name}";`,
      `  default: ${t.default};`,
      `  prefersdark: ${t.prefersdark};`,
      `  color-scheme: "${t.mode}";`,
      ...Object.entries(t.colors).map(([slot, hex]) => `  --color-${slot}: ${hex};`),
      '  /* Text colours for daisyUI text uses; the --color-* slots above stay fills. */',
      ...Object.entries(t.text).map(([slot, hex]) => `  --color-${slot}: ${hex};`),
      ...Object.entries(SHAPE).map(([prop, value]) => `  ${prop}: ${value};`),
    ];
    return `@plugin "daisyui/theme" {\n${lines.join('\n')}\n}\n`;
  });
  return `${header}\n${blocks.join('\n')}`;
}

function pairs(theme) {
  const { colors: c, text } = theme;
  const out = [];
  for (const slot of ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error']) {
    out.push({ kind: 'fill', fg: `${slot}-content`, bg: slot, ratio: contrast(c[`${slot}-content`], c[slot]) });
    out.push({ kind: 'fill-as-text', fg: slot, bg: 'base-100', ratio: contrast(c[slot], c['base-100']) });
  }
  for (const [role, [, slot]] of Object.entries(TEXT_ROLES)) {
    const backs = [
      ['base-100', c['base-100']],
      ['base-200', c['base-200']],
      ...SOFT_MIX.map((p) => [`${slot}-soft-${p}%`, mixOklab(c[slot], c['base-100'], p)]),
    ];
    for (const [bg, hex] of backs) {
      out.push({ kind: 'text-role', fg: role, bg, ratio: contrast(text[role], hex) });
    }
  }
  return out;
}

const themes = THEMES.map(resolveTheme);
const css = render(themes);
const args = new Set(process.argv.slice(2));

if (args.has('--report')) {
  for (const t of themes) {
    console.log(`\n${t.name}`);
    for (const p of pairs(t)) {
      const mark = p.ratio >= AA ? '    ' : 'MISS';
      console.log(`  ${mark} ${p.kind.padEnd(13)} ${p.fg.padEnd(22)} on ${p.bg.padEnd(16)} ${p.ratio.toFixed(2)}:1`);
    }
  }
} else if (args.has('--check')) {
  const problems = [];
  if (readFileSync(OUT, 'utf8') !== css) {
    problems.push(
      'packages/tokens/libraries/daisyui.css is out of date; run `node packages/components/tools/daisyui.mjs`.',
    );
  }
  for (const t of themes) {
    for (const p of pairs(t).filter((x) => x.kind === 'text-role' && x.ratio < AA)) {
      problems.push(`${t.name}: --color-${p.fg} on ${p.bg} is ${p.ratio.toFixed(2)}:1, under ${AA}:1.`);
    }
  }
  if (problems.length > 0) {
    problems.forEach((p) => console.error(p));
    process.exit(1);
  }
} else {
  writeFileSync(OUT, css);
}
