import { readdirSync } from 'node:fs';
import StyleDictionary from 'style-dictionary';

// ─── Shared transforms ────────────────────────────────────────────────────

const stripUnderscore = (path) =>
  path.map((segment) => segment.replace(/^_/, ''));

StyleDictionary.registerTransform({
  name: 'name/css/cornerstone',
  type: 'name',
  transform: (token) => stripUnderscore(token.path).join('-')
});

const PX_CATEGORIES = new Set([
  'space',
  'size',
  'border-radius',
  'border-width',
  'font-size'
]);

StyleDictionary.registerTransform({
  name: 'value/number/unit',
  type: 'value',
  filter: (token) => token.$type === 'number',
  transform: (token) => {
    const value = token.$value;
    const path = token.path;
    if (path.some((segment) => PX_CATEGORIES.has(segment))) {
      return `${value}px`;
    }
    if (path.includes('opacity')) {
      return value / 100;
    }
    if (path.includes('line-height')) {
      return value / 100;
    }
    if (path.includes('letter-spacing')) {
      return value === 0 ? 0 : `${value}em`;
    }
    return value;
  }
});

const TRANSFORMS = ['name/css/cornerstone', 'value/number/unit', 'color/css'];

// ─── Platform factories ───────────────────────────────────────────────────

function platformsForRef() {
  return {
    css: {
      transforms: TRANSFORMS,
      buildPath: 'build/css/',
      files: [
        {
          destination: 'ref.css',
          format: 'css/variables',
          options: { selector: ':root' }
        }
      ]
    },
    scss: {
      transforms: TRANSFORMS,
      buildPath: 'build/scss/',
      files: [{ destination: '_ref.scss', format: 'scss/variables' }]
    },
    'js-esm': {
      transforms: TRANSFORMS,
      buildPath: 'build/js/',
      files: [{ destination: 'ref.mjs', format: 'javascript/esm' }]
    },
    'js-cjs': {
      transforms: TRANSFORMS,
      buildPath: 'build/js/',
      files: [{ destination: 'ref.cjs', format: 'javascript/module' }]
    },
    ts: {
      transforms: TRANSFORMS,
      buildPath: 'build/js/',
      files: [
        { destination: 'ref.d.ts', format: 'typescript/module-declarations' }
      ]
    },
    'json-nested': {
      transforms: TRANSFORMS,
      buildPath: 'build/json/',
      files: [{ destination: 'ref.json', format: 'json/nested' }]
    },
    'json-flat': {
      transforms: TRANSFORMS,
      buildPath: 'build/json/',
      files: [{ destination: 'ref.flat.json', format: 'json/flat' }]
    }
  };
}

function platformsForMode(mode, selector) {
  return {
    css: {
      transforms: TRANSFORMS,
      buildPath: 'build/css/',
      files: [
        {
          destination: `${mode}.css`,
          format: 'css/variables',
          options: { selector }
        }
      ]
    },
    scss: {
      transforms: TRANSFORMS,
      buildPath: 'build/scss/',
      files: [{ destination: `_${mode}.scss`, format: 'scss/variables' }]
    },
    'js-esm': {
      transforms: TRANSFORMS,
      buildPath: 'build/js/',
      files: [{ destination: `${mode}.mjs`, format: 'javascript/esm' }]
    },
    'js-cjs': {
      transforms: TRANSFORMS,
      buildPath: 'build/js/',
      files: [{ destination: `${mode}.cjs`, format: 'javascript/module' }]
    },
    ts: {
      transforms: TRANSFORMS,
      buildPath: 'build/js/',
      files: [
        {
          destination: `${mode}.d.ts`,
          format: 'typescript/module-declarations'
        }
      ]
    },
    'json-nested': {
      transforms: TRANSFORMS,
      buildPath: 'build/json/',
      files: [{ destination: `${mode}.json`, format: 'json/nested' }]
    },
    'json-flat': {
      transforms: TRANSFORMS,
      buildPath: 'build/json/',
      files: [{ destination: `${mode}.flat.json`, format: 'json/flat' }]
    }
  };
}

// ─── Build helpers ────────────────────────────────────────────────────────

async function buildRef() {
  const styleDictionary = new StyleDictionary({
    source: ['tokens/ref.json'],
    usesDtcg: true,
    platforms: platformsForRef()
  });
  await styleDictionary.buildAllPlatforms();
}

const cmpFiles = readdirSync('tokens/cmp')
  .filter((filename) => filename.endsWith('.json'))
  .map((filename) => `tokens/cmp/${filename}`);

async function buildMode(mode, selector) {
  const styleDictionary = new StyleDictionary({
    // ref tokens included for alias resolution but not output
    include: ['tokens/ref.json'],
    source: [`tokens/sys/${mode}.json`, ...cmpFiles],
    usesDtcg: true,
    platforms: platformsForMode(mode, selector)
  });
  await styleDictionary.buildAllPlatforms();
}

// ─── Run ──────────────────────────────────────────────────────────────────

await buildRef();
await buildMode('cru-light', '[data-brand="cru"][data-theme="light"]');
await buildMode('cru-dark', '[data-brand="cru"][data-theme="dark"]');
await buildMode('fl-light', '[data-brand="fl"][data-theme="light"]');
await buildMode('fl-dark', '[data-brand="fl"][data-theme="dark"]');
