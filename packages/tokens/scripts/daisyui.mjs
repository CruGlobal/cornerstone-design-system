#!/usr/bin/env node
// Emits libraries/daisyui.css from the sys tokens, so the daisyUI bridge is never a hand-copy.
//
//   node scripts/daisyui.mjs            write libraries/daisyui.css
//   node scripts/daisyui.mjs --check    exit 1 if the committed file differs, or a text role fails AA
//   node scripts/daisyui.mjs --report   print the WCAG contrast of every colour pair
//
// Each slot names a token in DTCG alias form. `{primary.default}` resolves against the theme's
// `sys/<file>.json` (under `_sys.color`); `{_ref.…}` resolves against `ref.json`. A `_ref` alias here
// bypasses sys: those are values the Cru themes shipped before this script existed, kept as they were.

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = join(ROOT, 'libraries', 'daisyui.css');
const AA = 4.5;

const readJSON = (path) => JSON.parse(readFileSync(join(ROOT, path), 'utf8'));
const REF = readJSON('tokens/ref.json');

// Text roles: daisyUI uses each status slot as a fill and also as a text colour (`text-*`, `link-*`,
// soft/outline/dash/ghost variants). The slots are fills; these are the matching text colours.
const TEXT_ROLES = {
  'on-primary-container': '{on-primary-container}',
  'on-info-container': '{on-information-container}',
  'on-success-container': '{on-success-container}',
  'on-warning-container': '{on-warning-container}',
  'on-error-container': '{on-danger-container}',
};

// Fill slots shared by every theme whose values come straight from sys.
const STATUS_FILLS = {
  info: '{information.default}',
  'info-content': '{on-information}',
  success: '{success.default}',
  'success-content': '{on-success}',
  warning: '{warning.default}',
  'warning-content': '{on-warning}',
  error: '{danger.default}',
  'error-content': '{on-danger}',
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

const THEMES = [
  {
    name: 'cru-dark',
    sys: 'cru-dark',
    default: false,
    prefersdark: true,
    scheme: 'dark',
    colors: {
      'base-100': '{background}',
      'base-200': '{surface-bright}',
      'base-300': '{surface-dim}',
      'base-content': '{on-surface}',
      primary: '{primary.default}',
      'primary-content': '{on-primary}',
      secondary: '{_ref.color.cru.orange.500}',
      'secondary-content': '{_ref.color.cru.contrast.black}',
      accent: '{_ref.color.cru.cyan.500}',
      'accent-content': '{_ref.color.cru.contrast.black}',
      neutral: '{_ref.color.cru.graphite.500}',
      'neutral-content': '{_ref.color.cru.contrast.white}',
      info: '{information-on-inverse}',
      'info-content': '{_ref.color.cru.contrast.white}',
      success: '{_ref.color.cru.mint.700}',
      'success-content': '{_ref.color.cru.contrast.white}',
      warning: '{warning-on-inverse}',
      'warning-content': '{_ref.color.cru.contrast.white}',
      error: '{_ref.color.cru.cerise.700}',
      'error-content': '{_ref.color.cru.contrast.white}',
    },
  },
  {
    name: 'cru-light',
    sys: 'cru-light',
    default: true,
    prefersdark: false,
    scheme: 'light',
    colors: {
      'base-100': '{background}',
      'base-200': '{surface-dim}',
      'base-300': '{surface-variant}',
      'base-content': '{on-surface}',
      primary: '{primary.default}',
      'primary-content': '{on-primary}',
      secondary: '{_ref.color.cru.contrast.black}',
      'secondary-content': '{on-secondary}',
      accent: '{_ref.color.cru.cyan.500}',
      'accent-content': '{_ref.color.cru.contrast.black}',
      neutral: '{secondary-container}',
      'neutral-content': '{_ref.color.cru.contrast.white}',
      ...STATUS_FILLS,
    },
  },
  {
    name: 'familylife-light',
    sys: 'fl-light',
    default: false,
    prefersdark: false,
    scheme: 'light',
    colors: {
      'base-100': '{background}',
      'base-200': '{surface-dim}',
      'base-300': '{surface-variant}',
      'base-content': '{on-surface}',
      primary: '{primary.default}',
      'primary-content': '{on-primary}',
      secondary: '{secondary.default}',
      'secondary-content': '{on-secondary}',
      accent: '{information.default}',
      'accent-content': '{on-information}',
      neutral: '{inverse-surface}',
      'neutral-content': '{inverse-on-surface}',
      ...STATUS_FILLS,
    },
  },
  {
    name: 'familylife-dark',
    sys: 'fl-dark',
    default: false,
    prefersdark: false,
    scheme: 'dark',
    colors: {
      'base-100': '{background}',
      'base-200': '{surface-bright}',
      'base-300': '{surface-dim}',
      'base-content': '{on-surface}',
      primary: '{primary.default}',
      'primary-content': '{on-primary}',
      secondary: '{secondary.default}',
      'secondary-content': '{on-secondary}',
      accent: '{information.default}',
      'accent-content': '{on-information}',
      neutral: '{inverse-surface}',
      'neutral-content': '{inverse-on-surface}',
      ...STATUS_FILLS,
    },
  },
];

const get = (obj, path) =>
  path.split('.').reduce((node, key) => node?.[key], obj);

function resolve(alias, sys) {
  let value = alias;
  const seen = new Set();
  while (typeof value === 'string' && value.startsWith('{')) {
    if (seen.has(value)) {
      throw new Error(`alias loop at ${value}`);
    }
    seen.add(value);
    const path = value.slice(1, -1);
    const token = path.startsWith('_ref.')
      ? get(REF, path)
      : path.startsWith('_sys.')
      ? get(sys, path)
      : get(sys, `_sys.color.${path}`);
    if (token?.$value === undefined) {
      throw new Error(`${alias} does not resolve (stuck at ${value})`);
    }
    value = token.$value;
  }
  return String(value).toLowerCase();
}

function resolveTheme(theme) {
  const sys = readJSON(`tokens/sys/${theme.sys}.json`);
  const colors = {};
  for (const [slot, alias] of Object.entries(theme.colors)) {
    colors[slot] = resolve(alias, sys);
  }
  const text = {};
  for (const [slot, alias] of Object.entries(TEXT_ROLES)) {
    text[slot] = resolve(alias, sys);
  }
  return { ...theme, colors, text, sysTokens: sys };
}

function render(themes) {
  const blocks = themes.map((t) => {
    const lines = [
      `  name: "${t.name}";`,
      `  default: ${t.default};`,
      `  prefersdark: ${t.prefersdark};`,
      `  color-scheme: "${t.scheme}";`,
      ...Object.entries(t.colors).map(
        ([slot, hex]) => `  --color-${slot}: ${hex};`
      ),
      '  /* Text colours for daisyUI text uses; the --color-* slots above stay fills. */',
      ...Object.entries(t.text).map(
        ([slot, hex]) => `  --color-${slot}: ${hex};`
      ),
      ...Object.entries(SHAPE).map(([prop, value]) => `  ${prop}: ${value};`),
    ];
    return `@plugin "daisyui/theme" {\n${lines.join('\n')}\n}\n`;
  });
  const header = [
    '/*',
    ' * Cornerstone themes for daisyUI 5. Generated by packages/tokens/scripts/daisyui.mjs from the sys',
    ' * tokens; do not edit by hand.',
    ' *',
    ' * daisyUI uses each status slot (--color-primary, -info, -success, -warning, -error) both as a fill',
    ' * and as a text colour. Those slots are FILLS and many fail WCAG AA as text. For text (text-*,',
    ' * link-*, and the soft, outline, dash and ghost variants) use the matching',
    ' * --color-on-<slot>-container, which passes AA on base-100 and base-200.',
    ' */',
    '',
  ].join('\n');
  return `${header}\n${blocks.join('\n')}`;
}

function luminance(hex) {
  const n = hex.replace('#', '').slice(0, 6);
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(n.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function pairs(theme) {
  const { colors: c, text } = theme;
  const out = [];
  for (const slot of [
    'primary',
    'secondary',
    'accent',
    'neutral',
    'info',
    'success',
    'warning',
    'error',
  ]) {
    out.push({
      kind: 'fill',
      fg: `${slot}-content`,
      bg: slot,
      ratio: contrast(c[`${slot}-content`], c[slot]),
    });
    out.push({
      kind: 'fill-as-text',
      fg: slot,
      bg: 'base-100',
      ratio: contrast(c[slot], c['base-100']),
    });
  }
  const link = resolve('{link.default}', theme.sysTokens);
  out.push({
    kind: 'sys-link',
    fg: `link.default ${link}`,
    bg: 'base-100',
    ratio: contrast(link, c['base-100']),
  });
  for (const slot of Object.keys(text)) {
    for (const bg of ['base-100', 'base-200']) {
      out.push({
        kind: 'text-role',
        fg: slot,
        bg,
        ratio: contrast(text[slot], c[bg]),
      });
    }
  }
  return out;
}

const themes = THEMES.map(resolveTheme);
const css = render(themes);
const args = new Set(process.argv.slice(2));

if (args.has('--report')) {
  for (const t of themes) {
    process.stdout.write(`\n${t.name}\n`);
    for (const p of pairs(t)) {
      const mark = p.ratio >= AA ? '   ' : 'MISS';
      process.stdout.write(
        `  ${mark} ${p.kind.padEnd(13)} ${p.fg.padEnd(28)} on ${p.bg.padEnd(
          10
        )} ${p.ratio.toFixed(2)}:1\n`
      );
    }
  }
} else if (args.has('--check')) {
  const problems = [];
  if (readFileSync(OUT, 'utf8') !== css) {
    problems.push(
      'libraries/daisyui.css is out of date; run `node scripts/daisyui.mjs`.'
    );
  }
  for (const t of themes) {
    for (const p of pairs(t).filter(
      (x) => x.kind === 'text-role' && x.ratio < AA
    )) {
      problems.push(
        `${t.name}: --color-${p.fg} on ${p.bg} is ${p.ratio.toFixed(
          2
        )}:1, under ${AA}:1.`
      );
    }
  }
  if (problems.length > 0) {
    problems.forEach((p) => console.error(p));
    process.exit(1);
  }
} else {
  writeFileSync(OUT, css);
}
