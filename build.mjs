import StyleDictionary from 'style-dictionary';
import { readdirSync } from 'node:fs';

// ─── Shared transforms ────────────────────────────────────────────────────

const stripUnderscore = (path) => path.map((p) => p.replace(/^_/, ''));

StyleDictionary.registerTransform({
  name: 'name/css/cornerstone',
  type: 'name',
  transform: (token) => stripUnderscore(token.path).join('-'),
});

// kebab-case key transform for JS/TS/JSON: slash-joined path matching the variable names.
StyleDictionary.registerTransform({
  name: 'name/kebab/cornerstone',
  type: 'name',
  transform: (token) => stripUnderscore(token.path).join('-'),
});

const PX_CATEGORIES = new Set([
  'space', 'size', 'border-radius', 'border-width', 'font-size',
]);

StyleDictionary.registerTransform({
  name: 'value/number/unit',
  type: 'value',
  filter: (token) => token.$type === 'number',
  transform: (token) => {
    const v = token.$value;
    const path = token.path;
    if (path.some((p) => PX_CATEGORIES.has(p))) return `${v}px`;
    if (path.includes('opacity')) return v / 100;
    if (path.includes('line-height')) return v / 100;
    if (path.includes('letter-spacing')) return v === 0 ? 0 : `${v}em`;
    return v;
  },
});

const CSS_TRANSFORMS  = ['name/css/cornerstone', 'value/number/unit', 'color/css'];
const DATA_TRANSFORMS = ['name/css/cornerstone', 'value/number/unit', 'color/css'];

// ─── Platform factories ───────────────────────────────────────────────────

function platformsForRef() {
  return {
    css: {
      transforms: CSS_TRANSFORMS,
      buildPath: 'build/css/',
      files: [{ destination: 'ref.css', format: 'css/variables', options: { selector: ':root' } }],
    },
    scss: {
      transforms: CSS_TRANSFORMS,
      buildPath: 'build/scss/',
      files: [{ destination: '_ref.scss', format: 'scss/variables' }],
    },
    'js-esm': {
      transforms: DATA_TRANSFORMS,
      buildPath: 'build/js/',
      files: [{ destination: 'ref.mjs', format: 'javascript/esm' }],
    },
    'js-cjs': {
      transforms: DATA_TRANSFORMS,
      buildPath: 'build/js/',
      files: [{ destination: 'ref.cjs', format: 'javascript/module' }],
    },
    ts: {
      transforms: DATA_TRANSFORMS,
      buildPath: 'build/js/',
      files: [{ destination: 'ref.d.ts', format: 'typescript/module-declarations' }],
    },
    'json-nested': {
      transforms: DATA_TRANSFORMS,
      buildPath: 'build/json/',
      files: [{ destination: 'ref.json', format: 'json/nested' }],
    },
    'json-flat': {
      transforms: DATA_TRANSFORMS,
      buildPath: 'build/json/',
      files: [{ destination: 'ref.flat.json', format: 'json/flat' }],
    },
  };
}

function platformsForMode(mode, selector) {
  return {
    css: {
      transforms: CSS_TRANSFORMS,
      buildPath: 'build/css/',
      files: [{ destination: `${mode}.css`, format: 'css/variables', options: { selector } }],
    },
    scss: {
      transforms: CSS_TRANSFORMS,
      buildPath: 'build/scss/',
      files: [{ destination: `_${mode}.scss`, format: 'scss/variables' }],
    },
    'js-esm': {
      transforms: DATA_TRANSFORMS,
      buildPath: 'build/js/',
      files: [{ destination: `${mode}.mjs`, format: 'javascript/esm' }],
    },
    'js-cjs': {
      transforms: DATA_TRANSFORMS,
      buildPath: 'build/js/',
      files: [{ destination: `${mode}.cjs`, format: 'javascript/module' }],
    },
    ts: {
      transforms: DATA_TRANSFORMS,
      buildPath: 'build/js/',
      files: [{ destination: `${mode}.d.ts`, format: 'typescript/module-declarations' }],
    },
    'json-nested': {
      transforms: DATA_TRANSFORMS,
      buildPath: 'build/json/',
      files: [{ destination: `${mode}.json`, format: 'json/nested' }],
    },
    'json-flat': {
      transforms: DATA_TRANSFORMS,
      buildPath: 'build/json/',
      files: [{ destination: `${mode}.flat.json`, format: 'json/flat' }],
    },
  };
}

// ─── Build helpers ────────────────────────────────────────────────────────

async function buildRef() {
  const sd = new StyleDictionary({
    source: ['tokens/ref.json'],
    usesDtcg: true,
    platforms: platformsForRef(),
  });
  await sd.buildAllPlatforms();
}

const cmpFiles = readdirSync('tokens/cmp')
  .filter((f) => f.endsWith('.json'))
  .map((f) => `tokens/cmp/${f}`);

async function buildMode(mode, selector) {
  const sd = new StyleDictionary({
    // ref tokens included for alias resolution but not output
    include: ['tokens/ref.json'],
    source: [`tokens/sys/${mode}.json`, ...cmpFiles],
    usesDtcg: true,
    platforms: platformsForMode(mode, selector),
  });
  await sd.buildAllPlatforms();
}

// ─── Run ──────────────────────────────────────────────────────────────────

await buildRef();
await buildMode('cru-light', '[data-brand="cru"][data-theme="light"]');
await buildMode('cru-dark',  '[data-brand="cru"][data-theme="dark"]');
await buildMode('fl-light',  '[data-brand="fl"][data-theme="light"]');
await buildMode('fl-dark',   '[data-brand="fl"][data-theme="dark"]');
