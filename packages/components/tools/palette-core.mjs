/**
 * The palette generator's pure core: a brand's key colours in, three stylesheets out.
 *
 * Split out of `palette.mjs` so the same code runs in Node and in a browser. Everything here is a
 * pure function of its arguments — the two reference stylesheets it derives its spec from are
 * **passed in** rather than read from disk, which is the only thing that made this Node-only. The
 * CLI in `palette.mjs` reads them with `readFileSync`; the docs site imports them with `?raw`.
 *
 * Entry point is `generate()`. `deriveSpec()` is separate because deriving the ladder from the
 * reference palette is the expensive part, and a UI turning knobs wants to do it once and reuse it.
 *
 * ## What it holds constant, and why it matters
 *
 * The ramp is a **WCAG relative luminance ladder**, not a perceptual one. Measured across upstream's ten
 * hand-authored palettes, at ten of eleven steps luminance is the quantity held constant across hues, and
 * step 50 sits at Y ~= 0.1786 for every hue — exactly 4.58 to 4.62 against white. The documented contract
 * (a difference of 40 gives 3:1, 50 gives 4.5:1, 60 gives 7:1) rides on that. So each step's lightness is
 * *solved* for its luminance target rather than interpolated; OKLCH governs chroma and hue only.
 *
 * ## The floating key
 *
 * A brand colour is placed at the step whose luminance it already has, rather than pinned at the midpoint.
 * Pinning is what crushes one side of a ramp: the reference ramps average 6.3x unevenness (worst 30.2x)
 * against 2.6x for upstream's own. The brand's hex is written verbatim at its step, so it survives exactly.
 *
 * ## Two generation modes
 *
 *   from a key    - one colour. Hue and chroma come from it; every other step is solved.
 *   fitted        - several colours, which is the normal case for a neutral. Each supplied value is written
 *                   verbatim at the step whose luminance it matches; the rest are solved at zero chroma.
 *
 * Gamut mapping reduces chroma at constant lightness, so it can never disturb the ladder.
 */

const STEPS = [5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95];
const NEUTRAL_CHROMA = 0.03;

// ─── colour maths ─────────────────────────────────────────────────────────
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const gam = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const channels = (hex) => {
  const n = hex.replace('#', '');
  const f = n.length === 3 ? [...n].map((c) => c + c).join('') : n;
  return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16) / 255);
};

/** WCAG 2.1 relative luminance — the quantity the ladder holds. */
const luminance = (hex) => {
  const [r, g, b] = channels(hex).map(lin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return Math.round(((x + 0.05) / (y + 0.05)) * 100) / 100;
};

function hexToOklch(hex) {
  const [r, g, b] = channels(hex).map(lin);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  let H = (Math.atan2(B, A) * 180) / Math.PI;
  if (H < 0) {
    H += 360;
  }
  return { L, C: Math.hypot(A, B), H };
}

function oklchToLinear({ L, C, H }) {
  const h = (H * Math.PI) / 180;
  const A = C * Math.cos(h);
  const B = C * Math.sin(h);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const inGamut = (rgb) => rgb.every((c) => c >= -0.0001 && c <= 1.0001);

/** Reduce chroma, never lightness, so the luminance ladder is never disturbed. */
function oklchToHex(lch) {
  let { C } = lch;
  const { L, H } = lch;
  if (!inGamut(oklchToLinear({ L, C, H }))) {
    let lo = 0;
    let hi = C;
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(oklchToLinear({ L, C: mid, H }))) {
        lo = mid;
      } else {
        hi = mid;
      }
    }
    C = lo;
  }
  const rgb = oklchToLinear({ L, C, H });
  const hex = rgb
    .map((c) =>
      Math.round(Math.min(1, Math.max(0, gam(c))) * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('');
  return { hex: `#${hex}`, clipped: C < lch.C - 1e-6 };
}

/** Solve for the OKLCH lightness whose rendered colour hits `targetY` at this chroma and hue. */
function solveForLuminance(targetY, C, H) {
  let lo = 0;
  let hi = 1;
  let best = null;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const out = oklchToHex({ L: mid, C, H });
    best = out;
    if (luminance(out.hex) < targetY) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return best;
}

// ─── the spec, derived from upstream's own palettes ────────────────────────
const UPSTREAM_HUES = ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'indigo', 'purple', 'pink', 'gray'];

/**
 * The ladder, chroma profile and step lookup, derived from the reference palette.
 *
 * Was module-level state built from a `readFileSync` at import time. Taking the stylesheet as an
 * argument is what makes this module loadable in a browser; the derivation itself is unchanged.
 */
export function deriveSpec(referencePaletteCss) {
  const upstreamCss = referencePaletteCss;

  const upstreamKeyStep = {};
  for (const m of upstreamCss.matchAll(/--cs-color-([a-z]+)-key:\s*([0-9]+)/g)) {
    upstreamKeyStep[m[1]] = Number(m[2]);
  }

  const upstream = {};
  for (const hue of UPSTREAM_HUES) {
    upstream[hue] = {};
    for (const m of upstreamCss.matchAll(new RegExp(`--cs-color-${hue}-([0-9]+):\\s*(#[0-9a-f]{6})`, 'gi'))) {
      upstream[hue][Number(m[1])] = m[2].toLowerCase();
    }
  }

  /** Target luminance per step: the mean across upstream's ten hues. */
  const Y_LADDER = Object.fromEntries(
    STEPS.map((s) => [s, UPSTREAM_HUES.reduce((a, h) => a + luminance(upstream[h][s]), 0) / UPSTREAM_HUES.length]),
  );

  /** Chroma falloff by signed distance from the key, averaged after aligning each hue on its own key. */
  const CHROMA_PROFILE = (() => {
    const buckets = new Map();
    for (const hue of UPSTREAM_HUES) {
      const ik = STEPS.indexOf(upstreamKeyStep[hue]);
      const ck = hexToOklch(upstream[hue][upstreamKeyStep[hue]]).C;
      STEPS.forEach((s, i) => {
        const d = i - ik;
        if (!buckets.has(d)) {
          buckets.set(d, []);
        }
        buckets.get(d).push(hexToOklch(upstream[hue][s]).C / ck);
      });
    }
    return new Map([...buckets].map(([d, v]) => [d, v.reduce((a, b) => a + b) / v.length]));
  })();

  const profileAt = (d) => {
    const ds = [...CHROMA_PROFILE.keys()].sort((a, b) => a - b);
    return CHROMA_PROFILE.get(Math.max(ds[0], Math.min(ds.at(-1), d)));
  };

  const stepForLuminance = (y) =>
    STEPS.reduce((b, s) => (Math.abs(Y_LADDER[s] - y) < Math.abs(Y_LADDER[b] - y) ? s : b), STEPS[0]);

  return { upstream, upstreamKeyStep, Y_LADDER, CHROMA_PROFILE, profileAt, stepForLuminance };
}

// ─── generation ───────────────────────────────────────────────────────────
// ─── generation ───────────────────────────────────────────────────────────
/** One key colour: hue and chroma from it, every other step solved for its luminance target. */
export function fromKey(spec, keyHex) {
  const { stepForLuminance, Y_LADDER, profileAt } = spec;
  const key = hexToOklch(keyHex);
  const keyStep = stepForLuminance(luminance(keyHex));
  const ik = STEPS.indexOf(keyStep);
  const steps = {};
  const clipped = [];
  STEPS.forEach((s, i) => {
    if (s === keyStep) {
      steps[s] = keyHex.toLowerCase();
      return;
    }
    const r = solveForLuminance(Y_LADDER[s], key.C * profileAt(i - ik), key.H);
    steps[s] = r.hex;
    if (r.clipped) {
      clipped.push(s);
    }
  });
  return { steps, keyStep, clipped, mode: 'key' };
}

/**
 * Several supplied colours: each written verbatim at its step, the rest solved at zero chroma.
 *
 * The scale is shared, but every supplied hue keeps its *own* step as its key — `-key` drives the
 * `-gte-60` auto-contrast decision, so a near-white neutral and a mid one must not report the same one.
 */
export function fitted(spec, points) {
  const { stepForLuminance, Y_LADDER } = spec;
  const ownStep = Object.fromEntries(
    Object.entries(points).map(([hue, hex]) => [hue, stepForLuminance(luminance(hex))]),
  );
  const pinned = new Map(Object.entries(points).map(([hue, hex]) => [ownStep[hue], hex.toLowerCase()]));
  const steps = {};
  for (const s of STEPS) {
    steps[s] = pinned.get(s) ?? solveForLuminance(Y_LADDER[s], 0, 0).hex;
  }
  return { steps, pinned: [...pinned.keys()].sort((a, b) => a - b), ownStep, clipped: [], mode: 'fitted' };
}

/** A hue the brand does not define: upstream's hue angle at the brand's own mean chroma. */
export function synthesized(spec, upstreamHue, brandChroma) {
  const { upstream, upstreamKeyStep, Y_LADDER } = spec;
  const u = hexToOklch(upstream[upstreamHue][upstreamKeyStep[upstreamHue]]);
  const keyStep = upstreamKeyStep[upstreamHue];
  const key = solveForLuminance(Y_LADDER[keyStep], brandChroma, u.H).hex;
  return { ...fromKey(spec, key), synthesizedFrom: upstreamHue };
}

/** Upstream's documented step-difference contract, checked as measured contrast. */
export function checkContract(steps) {
  const out = [];
  for (const [diff, min] of [
    [40, 3],
    [50, 4.5],
    [60, 7],
  ]) {
    for (const a of STEPS) {
      const b = a + diff;
      if (!STEPS.includes(b)) {
        continue;
      }
      const got = contrast(steps[a], steps[b]);
      if (got < min) {
        out.push({ a, b, diff, min, got });
      }
    }
  }
  return out;
}
export { STEPS, luminance, contrast, hexToOklch, NEUTRAL_CHROMA };

// ─── variants ─────────────────────────────────────────────────────────────
/**
 * The role→hue layer, replicating `color/variants/` for this brand's hues.
 *
 * Two jobs, both upstream's:
 *
 *   the default   `:where(:root)` maps each role at this brand's chosen hue. Something has to say
 *                 "brand means yellow", and this is where upstream says it.
 *   the pickers   `.cs-{role}-{hue}` re-points one role at another hue without redefining tokens or
 *                 swapping the whole palette. A documented capability — see the "Changing Variant
 *                 Colors" section of the color tokens page — so it is replicated rather than dropped.
 *
 * Upstream offers ten hues per role because its three palettes all name the same ten. A brand names its
 * own, so the picker list is this brand's hues rather than upstream's — which is the difference between
 * offering a Cru author `.cs-brand-cerise` and offering them `.cs-brand-indigo`, a hue Cru does not have.
 */
export function buildVariants(brandName, brand, ramps) {
  const roleMap = { ...brand.roles, link: brand.link };
  const hues = Object.keys(ramps);
  const ownStep = (hue) => (ramps[hue].mode === 'fitted' ? ramps[hue].ownStep[hue] : ramps[hue].keyStep);

  const mapping = (role, hue) => {
    const out = [];
    for (const st of [...STEPS].reverse()) {
      const q = String(st).padStart(2, '0');
      out.push(`    --cs-color-${role}-${q}: var(--cs-color-${hue}-${q});`);
    }
    out.push(`    --cs-color-${role}: var(--cs-color-${hue}-${String(ownStep(hue)).padStart(2, '0')});`);
    out.push(`    --cs-color-${role}-key: ${ownStep(hue)};`);
    out.push(`    --cs-color-${role}-on: var(--cs-color-${hue}-on);`);
    return out;
  };

  const out = [];
  out.push(`/* Generated by tools/palette.mjs from tools/brands/${brandName}.json — do not edit by hand.`);
  out.push(' *');
  out.push(' * Which hue plays each semantic role, and the classes that let an author change one. The');
  out.push(' * `:where(:root)` block is the default; each `.cs-{role}-{hue}` class re-points a single role,');
  out.push(' * which is the capability the color tokens page documents as "Changing Variant Colors".');
  out.push(' */');
  out.push("@import url('../../layers.css');");
  out.push('');
  out.push('@layer cs-color-variant {');

  for (const [role, hue] of Object.entries(roleMap)) {
    if (!ramps[hue]) {
      throw new Error(`role ${role} names hue ${hue}, which this brand does not define`);
    }
    out.push(`  /* ${role} — defaults to ${hue} */`);
    out.push('  :where(:root), /* default */');
    out.push(`  .cs-${role}-${hue} {`);
    out.push(...mapping(role, hue));
    out.push('  }');
    out.push('');
    for (const alt of hues) {
      if (alt === hue) {
        continue;
      }
      out.push(`  .cs-${role}-${alt} {`);
      out.push(...mapping(role, alt));
      out.push('  }');
      out.push('');
    }
  }

  out.push('}');
  return { css: out.join('\n'), roleCount: Object.keys(roleMap).length, hueCount: hues.length };
}

// ─── theme ────────────────────────────────────────────────────────────────
/**
 * The attention grid, per mode. Steps are upstream's, with three rules ticket 05 changed:
 *
 *   fill-loud   the role's own key step, so the loudest fill *is* the brand colour. Pinned at 50 it was
 *               only the brand colour when the key happened to sit there — Cru's rendered a dark olive.
 *   border-loud step 50 for every role **except brand**, which reads its own key step. Quiet and normal keep
 *               the grid's steps — see the note on `borderStepsFor`, which is where that was got wrong once.
 *   on-loud     follows the key's lightness — dark text at step 60 or above, white below. Upstream's
 *               hardcoded white is correct only for keys below 60.
 *
 * `neutral` is exempt from the first and third: its loud is a high-contrast inverse chip, not a brand fill.
 *
 * ## The brand's loud border and the focus ring are the brand colour
 *
 * **The dev's call, made against these numbers.** Step 50 was chosen because it is the only step in Cru's
 * yellow ramp that clears 1.4.11's 3:1 in *both* modes — `#8e7300` measures 4.56 on white and 4.11 on
 * `#121212`, where step 60 is 2.99 on white and the key is 1.47. But it renders as a dark olive rather than
 * as Cru's gold, which is the thing the same ticket fixed for `fill-loud`.
 *
 * Reading the key step instead gives `#ffd000`:
 *
 *   dark mode   12.73 against `#121212` — three times the requirement, and a clear improvement on 4.11.
 *   light mode  1.47 against white. Below 3:1, and the trade being accepted: the ring reads as the brand
 *               rather than as a darkened version of it.
 *
 * **This is a known, recorded exception to the WCAG 2.2 AA claim** *The accessibility bar* put in the docs,
 * not an oversight. The compliant way to have both is a two-tone indicator — a brand band paired with a dark
 * one, so the dark band carries the 3:1 — which that ticket refused only because its prerequisite token did
 * not exist. It is 39 `outline: var(--cs-focus-ring)` sites away, and it is the follow-up if the light-mode
 * contrast is wanted back.
 *
 * Brand only, deliberately. Every role reading its key here would leave `neutral`'s loud border at 1.06 on
 * white and `success`'s near 2 — invisible boundaries on an `appearance="outlined"` control, which is the one
 * thing `border-loud` is read by.
 */
const GRID = {
  light: { fillQuiet: 95, fillNormal: 90, borderQuiet: 90, borderNormal: 80, onQuiet: 40, onNormal: 30 },
  dark: { fillQuiet: 10, fillNormal: 20, borderQuiet: 20, borderNormal: 30, onQuiet: 60, onNormal: 70 },
};
const NEUTRAL_LOUD = { light: { fill: 20, on: 'white' }, dark: { fill: 90, on: 5 } };
const BORDER_LOUD = 50;

/** The roles whose loud border is their own key step rather than `BORDER_LOUD`. See the note above. */
const BORDER_LOUD_FROM_KEY = new Set(['brand']);
const LINK_STEP = { light: 50, dark: 60 };

const pad = (n) => String(n).padStart(2, '0');
const roleVar = (role, step) => `var(--cs-color-${role}-${pad(step)})`;

/**
 * The three border steps for a role, quiet → normal → loud.
 *
 * **Each border is judged against the fill it is paired with, not against the other borders.** The
 * appearance matrix is what decides this: `filled-outlined` puts `border-normal` on `fill-normal`,
 * `outlined` puts `border-loud` on the bare surface, and the two never sit next to each other. So the grid's
 * offset is the thing to preserve — a border one step darker than its own fill — and a collision *between*
 * two border tokens is harmless.
 *
 * That was learned the hard way. `border-loud` moving onto the key made it equal `border-normal`, both 80;
 * deriving the quieter two from the key to separate them pushed them to 95 and 90, which are exactly
 * `fill-quiet` and `fill-normal` — so both borders became invisible against their own fills, at a measured
 * 1.00, and `filled-outlined` lost its outline on button, badge, callout and toast. Chasing monotonicity
 * between the border tokens broke the constraint that actually matters.
 *
 * So only `loud` moves. `border-normal` stays a step darker than `fill-normal` (1.17 against it) and
 * `border-quiet` a step darker than `fill-quiet` (1.12). `border-normal` and `border-loud` are both 80 for
 * Cru, which is fine: `outlined` and `filled-outlined` stay distinct through their fills.
 */
function borderStepsFor(role, mode, keyStep) {
  const g = GRID[mode];
  const loud = BORDER_LOUD_FROM_KEY.has(role) ? keyStep : BORDER_LOUD;

  return { quiet: g.borderQuiet, normal: g.borderNormal, loud };
}

export function gridFor(role, mode, keyStep) {
  const g = GRID[mode];
  const isNeutral = role === 'neutral';
  const border = borderStepsFor(role, mode, keyStep);
  const fillLoud = isNeutral ? NEUTRAL_LOUD[mode].fill : keyStep;
  const onLoud = isNeutral
    ? NEUTRAL_LOUD[mode].on === 'white'
      ? 'white'
      : roleVar(role, NEUTRAL_LOUD[mode].on)
    : keyStep >= 60
      ? roleVar(role, 10)
      : 'white';
  return [
    [`fill-quiet`, roleVar(role, g.fillQuiet)],
    [`fill-normal`, roleVar(role, g.fillNormal)],
    [`fill-loud`, roleVar(role, fillLoud)],
    [`border-quiet`, roleVar(role, border.quiet)],
    [`border-normal`, roleVar(role, border.normal)],
    [`border-loud`, roleVar(role, border.loud)],
    [`on-quiet`, roleVar(role, g.onQuiet)],
    [`on-normal`, roleVar(role, g.onNormal)],
    [`on-loud`, onLoud],
  ];
}

/** Non-role colour, reproducing the reference theme's definitions against role aliases. */
export function surfaceFor(mode, brandKeyStep) {
  if (mode === 'light') {
    return [
      ['surface-raised', 'white'],
      ['surface-default', 'white'],
      ['surface-lowered', roleVar('neutral', 95)],
      ['surface-border', roleVar('neutral', 90)],
      ['text-normal', roleVar('neutral', 10)],
      ['text-quiet', roleVar('neutral', 40)],
      ['text-link', roleVar('link', LINK_STEP.light)],
      ['overlay-modal', `color-mix(in oklab, ${roleVar('neutral', 5)} 50%, transparent)`],
      ['overlay-inline', `color-mix(in oklab, ${roleVar('neutral', 80)} 25%, transparent)`],
      [
        'shadow',
        `color-mix(in oklab, ${roleVar('neutral', 5)} calc(var(--cs-shadow-blur-scale) * 4% + 8%), transparent)`,
      ],
      ['focus', roleVar('brand', brandKeyStep)],
      ['mix-hover', 'oklch(from currentColor calc(1 - l) c h) 10%'],
      ['mix-active', 'var(--cs-color-surface-default) 10%'],
    ];
  }
  return [
    ['surface-raised', roleVar('neutral', 10)],
    ['surface-default', roleVar('neutral', 5)],
    ['surface-lowered', 'color-mix(in oklab, var(--cs-color-surface-default), black 20%)'],
    ['surface-border', roleVar('neutral', 20)],
    ['text-normal', roleVar('neutral', 95)],
    ['text-quiet', roleVar('neutral', 60)],
    ['text-link', roleVar('link', LINK_STEP.dark)],
    ['overlay-modal', 'color-mix(in oklab, black 60%, transparent)'],
    ['overlay-inline', `color-mix(in oklab, ${roleVar('neutral', 50)} 10%, transparent)`],
    [
      'shadow',
      'color-mix(in oklab, var(--cs-color-surface-lowered) calc(var(--cs-shadow-blur-scale) * 32% + 40%), transparent)',
    ],
    ['focus', roleVar('brand', brandKeyStep)],
    ['mix-hover', 'oklch(from currentColor calc(1 - l) c h) 20%'],
    ['mix-active', 'var(--cs-color-surface-default) 20%'],
  ];
}

export const SELECTORS = (brand) => ({
  light: [
    ':where(:root)',
    `.cs-theme-${brand}`,
    '.cs-light',
    '.cs-dark .cs-invert',
    `.cs-light .cs-theme-${brand}`,
    `.cs-dark .cs-theme-${brand}.cs-invert`,
    `.cs-dark .cs-theme-${brand} .cs-invert`,
  ],
  dark: [
    '.cs-dark',
    '.cs-light .cs-invert',
    `.cs-dark .cs-theme-${brand}`,
    `.cs-light .cs-theme-${brand}.cs-invert`,
    `.cs-light .cs-theme-${brand} .cs-invert`,
  ],
});

/**
 * The mode-independent block, carried from the reference theme with a brand's own values written over it.
 *
 * Most of this block is structure — the ratios that build the spacing, type, border and shadow ramps are
 * upstream's, and a brand that changed them would be redesigning the system rather than branding it. What
 * a brand does get is the **knobs those ramps multiply**: every family here is `<scale> × ratio`, so
 * `--cs-border-radius-scale: 0` squares off every corner in the library, and `--cs-space-scale: 1.15`
 * loosens every gap, with the relationships between the steps untouched.
 *
 * `fonts` and `metrics` are the same mechanism — substitute a declaration the reference theme already
 * makes. They are separate arguments only because fonts predate the rest and every brand sets them.
 *
 * A name that the reference theme does not define throws rather than being ignored: a typo'd knob that
 * silently does nothing is the worst outcome for a generator whose whole job is deriving one file from
 * a handful of values.
 */
export function carriedBlock(referenceThemeCss, fonts, metrics = {}) {
  const ref = referenceThemeCss;
  const start = ref.indexOf('  :where(:root),\n  .cs-theme-default,\n  .cs-light,\n  .cs-dark,\n  .cs-invert {');
  if (start === -1) {
    throw new Error("could not locate the reference theme's mode-independent block");
  }
  const open = ref.indexOf('{', start);
  let depth = 0;
  let end = open;
  for (let i = open; i < ref.length; i++) {
    if (ref[i] === '{') {
      depth++;
    } else if (ref[i] === '}') {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  let body = ref.slice(open + 1, end);
  const substitute = (name, value, strict) => {
    const re = new RegExp(`(--cs-${name}:)[^;]*;`);
    if (re.test(body)) {
      body = body.replace(re, `$1 ${value};`);
    } else if (strict) {
      throw new Error(`brand sets --cs-${name}, which the reference theme does not define`);
    }
  };
  for (const [prop, value] of Object.entries(fonts)) {
    substitute(`font-family-${prop}`, value, false);
  }
  for (const [name, value] of Object.entries(metrics)) {
    substitute(name, value, true);
  }
  return body.replace(/\n$/, '');
}

export function buildTheme(referenceThemeCss, brandName, brand, ramps) {
  const roles = Object.keys(brand.roles);
  const keyStepOf = (role) => {
    const hue = brand.roles[role];
    return ramps[hue].mode === 'fitted' ? ramps[hue].ownStep[hue] : ramps[hue].keyStep;
  };
  const sel = SELECTORS(brandName);
  const out = [];

  out.push(`/* Generated by tools/palette.mjs from tools/brands/${brandName}.json — do not edit by hand.`);
  out.push(' *');
  out.push(' * Colour is generated from the palette; everything below the colour blocks is carried from the');
  out.push(' * reference theme, because scales, spacing ratios, shadow geometry and control metrics are');
  out.push(" * structure rather than brand. Font families are the exception — those are this brand's own.");
  out.push(' *');
  out.push(` * Roles: ${roles.map((r) => `${r} → ${brand.roles[r]}`).join(', ')}, link → ${brand.link}.`);
  out.push(' */');
  out.push(`@import url('../layers.css');`);
  out.push(`@import url('../color/palettes/${brandName}.css');`);
  out.push(`@import url('../color/variants/${brandName}.css');`);
  out.push('');
  out.push('@layer cs-theme {');

  for (const mode of ['light', 'dark']) {
    out.push(sel[mode].map((x) => `  ${x}`).join(',\n') + ' {');
    out.push(`    color-scheme: ${mode};`);
    out.push('    color: var(--cs-color-text-normal);');
    out.push('');
    for (const [prop, value] of surfaceFor(mode, keyStepOf('brand'))) {
      out.push(`    --cs-color-${prop}: ${value};`);
    }
    out.push('');
    for (const role of roles) {
      out.push(`    /* ${role} */`);
      for (const [slot, value] of gridFor(role, mode, keyStepOf(role))) {
        out.push(`    --cs-color-${role}-${slot}: ${value};`);
      }
      out.push('');
    }
    out.push('  }');
    out.push('');
  }

  out.push(
    sel.light
      .slice(0, 3)
      .concat([`.cs-dark`, `.cs-invert`])
      .map((x) => `  ${x}`)
      .join(',\n') + ' {',
  );
  out.push(carriedBlock(referenceThemeCss, brand.fonts ?? {}, brand.metrics ?? {}));
  out.push('  }');
  out.push('}');
  return out.join('\n');
}

// ─── palette ──────────────────────────────────────────────────────────────
/** The hue ramps as a stylesheet. Lifted out of the CLI unchanged. */
export function buildPalette(brandName, ramps) {
  const lines = [];
  lines.push(`/* Generated by tools/palette.mjs from tools/brands/${brandName}.json — do not edit by hand.`);
  lines.push(' *');
  lines.push(" * Each step's lightness is solved for a WCAG luminance target, so the documented step-difference");
  lines.push(" * contract holds by construction: 40 apart gives 3:1, 50 gives 4.5:1, 60 gives 7:1. The brand's own");
  lines.push(' * colours are written verbatim at the step whose luminance they already have.');
  lines.push(' */');
  // Not base.css: that exists so upstream's three palettes can share the `-gte-60`/`-on` machinery, which
  // works because they all name the same ten hues. Brands name their own, so there is nothing to factor out
  // and the machinery is generated below. Role mapping lives in `color/variants/`, as it does upstream.
  lines.push("@import url('../../layers.css');");
  lines.push('');
  lines.push('@layer cs-color-palette {');
  lines.push('  :where(:root),');
  lines.push('  :host {');
  for (const [hue, r] of Object.entries(ramps)) {
    const own = r.mode === 'fitted' ? r.ownStep[hue] : r.keyStep;
    const pinned = r.mode === 'fitted' ? r.pinned : [r.keyStep];
    lines.push(`    /* ${hue}${r.synthesizedFrom ? ` — synthesized from upstream ${r.synthesizedFrom}` : ''} */`);
    for (const s of [...STEPS].reverse()) {
      const pad = String(s).padStart(2, '0');
      const o = hexToOklch(r.steps[s]);
      const note = pinned.includes(s) ? ' /* brand value */' : '';
      lines.push(
        `    --cs-color-${hue}-${pad}: ${r.steps[s]};${note}` +
          (note ? '' : ` /* oklch(${(o.L * 100).toFixed(3)}% ${o.C.toFixed(5)} ${o.H.toFixed(2)}) */`),
      );
    }
    lines.push(`    --cs-color-${hue}: var(--cs-color-${hue}-${String(own).padStart(2, '0')});`);
    lines.push(`    --cs-color-${hue}-key: ${own};`);
    lines.push('');
  }
  // Auto-contrast, reproducing base.css's mechanism for this brand's hues. `-gte-60` resolves to 100%
  // when the key sits at step 60 or above and 0% below, which picks a dark on-colour for a light key and
  // white for a dark one.
  lines.push('    /* Auto-contrast: dark text on a light key, white on a dark one. */');
  for (const hue of Object.keys(ramps)) {
    lines.push(`    --cs-color-${hue}-gte-60: calc(100% - (clamp(0, 60 - var(--cs-color-${hue}-key), 1) * 100%));`);
  }
  lines.push('');
  for (const hue of Object.keys(ramps)) {
    lines.push(
      `    --cs-color-${hue}-on: color-mix(in oklab, var(--cs-color-${hue}-10) var(--cs-color-${hue}-gte-60), white);`,
    );
  }
  lines.push('');

  lines.push('  }');
  lines.push('}');
  const css = lines.join('\n');
  return css;
}

// ─── ramps ────────────────────────────────────────────────────────────────
/**
 * A brand's hues as solved ramps: chromatic hues from their key, neutrals fitted as one scale, and
 * any synthesized hue placed at the brand's own chroma register rather than upstream's louder one.
 */
export function buildRamps(spec, brand) {
  const neutralHues = new Set(Object.keys(brand.neutralPoints ?? {}));

  // The brand's chroma register: the mean of its chromatic keys. A synthesized hue arrives in this
  // register rather than upstream's, which is louder.
  const chromas = Object.entries(brand.hues)
    .filter(([, hex]) => hexToOklch(hex).C > NEUTRAL_CHROMA)
    .map(([, hex]) => hexToOklch(hex).C);
  const brandChroma = chromas.reduce((a, c) => a + c, 0) / chromas.length;

  const ramps = {};
  for (const [hue, hex] of Object.entries(brand.hues)) {
    ramps[hue] = neutralHues.has(hue) ? null : fromKey(spec, hex);
  }
  // Neutrals are one fitted scale; each supplied point pins its own step.
  if (brand.neutralPoints) {
    const fit = fitted(spec, brand.neutralPoints);
    for (const hue of neutralHues) {
      ramps[hue] = fit;
    }
  }
  for (const [hue, from] of Object.entries(brand.synthesized ?? {})) {
    ramps[hue] = synthesized(spec, from, brandChroma);
  }

  return { ramps, brandChroma };
}

// ─── entry point ──────────────────────────────────────────────────────────
/**
 * A brand's knobs in, the three stylesheets out, plus what a caller needs to report on the result.
 *
 * The only function either caller needs. Diagnostics are returned as data rather than printed so
 * that the CLI can format them for a terminal and the docs UI can render them as a table.
 */
export function generate({ referencePaletteCss, referenceThemeCss, brandName, brand, spec }) {
  const resolved = spec ?? deriveSpec(referencePaletteCss);
  const { ramps, brandChroma } = buildRamps(resolved, brand);

  const diagnostics = Object.entries(ramps).map(([hue, r]) => ({
    hue,
    mode: r.mode,
    where: r.mode === 'fitted' ? `${r.ownStep[hue]} of ${r.pinned.join(',')}` : String(r.keyStep),
    clipped: r.clipped.length,
    failures: checkContract(r.steps),
    synthesizedFrom: r.synthesizedFrom ?? null,
  }));

  const variants = buildVariants(brandName, brand, ramps);

  return {
    ramps,
    brandChroma,
    diagnostics,
    failures: diagnostics.reduce((a, d) => a + d.failures.length, 0),
    files: {
      palette: buildPalette(brandName, ramps),
      variants: variants.css,
      theme: buildTheme(referenceThemeCss, brandName, brand, ramps),
    },
    variantCounts: { roleCount: variants.roleCount, hueCount: variants.hueCount },
  };
}
