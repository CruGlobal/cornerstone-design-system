#!/usr/bin/env node
// Token validator for Cornerstone Design System.
// Rules: E1-E4 fail; W1-W2 warn. Exits 1 on any error.

import { readFileSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const TOKENS = join(ROOT, 'tokens');

const HEX_RE = /^#[0-9a-fA-F]{3,8}$/;
const RGB_RE = /^(rgb|rgba|hsl|hsla)\(/i;
const ALIAS_RE = /^\{(.+)\}$/;

const errors = [];
const warnings = [];

function err(file, path, msg) {
  errors.push({ file, path, msg });
}

function warn(file, path, msg) {
  warnings.push({ file, path, msg });
}

function readJSON(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function flatten(obj, prefix = '', out = {}) {
  if (obj && typeof obj === 'object' && '$value' in obj && '$type' in obj) {
    out[prefix] = { $type: obj.$type, $value: obj.$value };
    return out;
  }
  if (obj && typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj)) {
      flatten(value, prefix ? `${prefix}.${key}` : key, out);
    }
  }
  return out;
}

function resolveAlias(value) {
  if (typeof value !== 'string') {
    return null;
  }
  const match = value.match(ALIAS_RE);
  return match ? match[1] : null;
}

function isRawColor(value) {
  return (
    typeof value === 'string' && (HEX_RE.test(value) || RGB_RE.test(value))
  );
}

/**
 * Converts a file name into a brand slug. Example: tokens/sys/cru-light.json -> 'cru'
 */
function brandFromSysFile(file) {
  const name = basename(file, '.json');
  return name.split('-')[0];
}

// Load ref + all sys + all cmp.
const refMap = flatten(readJSON(join(TOKENS, 'ref.json')));
const cmpFiles = readdirSync(join(TOKENS, 'cmp'))
  .filter((filename) => filename.endsWith('.json'))
  .map((filename) => join(TOKENS, 'cmp', filename));
const cmpMap = {};
for (const cmpFile of cmpFiles) {
  Object.assign(cmpMap, flatten(readJSON(cmpFile)));
}

const sysFiles = readdirSync(join(TOKENS, 'sys'))
  .filter((filename) => filename.endsWith('.json'))
  .map((filename) => join(TOKENS, 'sys', filename));

function validateLeaf(file, path, leaf, namespace, mergedMap) {
  const { $type, $value } = leaf;
  const aliasPath = resolveAlias($value);

  if (aliasPath) {
    // E4 — dangling alias
    if (!(aliasPath in mergedMap)) {
      err(file, path, `E4 dangling alias: \`{${aliasPath}}\` not found`);
      return;
    }
    // E1/E2 — namespace rules
    if (namespace === '_sys' && !aliasPath.startsWith('_ref.')) {
      err(file, path, `E1 sys must alias _ref, got \`{${aliasPath}}\``);
    }
    if (namespace === '_cmp') {
      if (aliasPath.startsWith('_cmp.')) {
        err(
          file,
          path,
          `E2 cmp may not alias other cmp tokens, got \`{${aliasPath}}\``
        );
      } else if (aliasPath.startsWith('_ref.')) {
        warn(
          file,
          path,
          `cmp aliases _ref directly (skipping _sys): \`{${aliasPath}}\``
        );
      } else if (!aliasPath.startsWith('_sys.')) {
        err(file, path, `E2 cmp must alias _sys, got \`{${aliasPath}}\``);
      }
    }
    // W2 — alias type mismatch
    const target = mergedMap[aliasPath];
    if (target && target.$type !== $type) {
      warn(
        file,
        path,
        `W2 alias type mismatch: ${path} is ${$type} but target is ${target.$type}`
      );
    }
    // W1 — cross-brand alias
    if (namespace === '_sys' && file.includes('/sys/')) {
      const brand = brandFromSysFile(file);
      const match = aliasPath.match(/^_ref\.color\.([a-z-]+)\./);
      if (match) {
        const refBrand = match[1];
        // Only warn when the alias explicitly names a different brand's color palette.
        if (refBrand !== brand) {
          warn(
            file,
            path,
            `W1 cross-brand alias: ${brand}-* mode aliases _ref.color.${refBrand}.*`
          );
        }
      }
    }
  } else {
    // Non-alias literal value
    if (namespace !== '_ref' && $type === 'color' && isRawColor($value)) {
      err(file, path, `E3 raw color literal outside _ref: \`${$value}\``);
    }
  }
}

// 1) Validate ref tokens (no rules other than no dangling self-refs)
for (const [path, leaf] of Object.entries(refMap)) {
  validateLeaf(join(TOKENS, 'ref.json'), path, leaf, '_ref', refMap);
}

// 2) Validate each sys mode file with merged map (ref + this sys file + cmp)
for (const sysFile of sysFiles) {
  const sysMap = flatten(readJSON(sysFile));
  const merged = { ...refMap, ...sysMap, ...cmpMap };
  for (const [path, leaf] of Object.entries(sysMap)) {
    validateLeaf(sysFile, path, leaf, '_sys', merged);
  }
}

// 3) Validate cmp files using ref + ALL sys merged (so any alias to _sys.* must exist in at least the union — same value across modes by convention).
const allSys = {};
for (const sysFile of sysFiles) {
  Object.assign(allSys, flatten(readJSON(sysFile)));
}
for (const cmpFile of cmpFiles) {
  const thisCmp = flatten(readJSON(cmpFile));
  const merged = { ...refMap, ...allSys, ...thisCmp };
  for (const [path, leaf] of Object.entries(thisCmp)) {
    validateLeaf(cmpFile, path, leaf, '_cmp', merged);
  }
}

// Report
const rel = (filePath) => filePath.replace(ROOT + '/', '');

if (errors.length) {
  console.error('\nERRORS:');
  for (const error of errors) {
    console.error(`  ${rel(error.file)}  ${error.path}\n    ${error.msg}`);
  }
}
if (warnings.length) {
  console.error('\nWARNINGS:');
  for (const warning of warnings) {
    console.error(
      `  ${rel(warning.file)}  ${warning.path}\n    ${warning.msg}`
    );
  }
}

console.error(
  `\n${errors.length} error${errors.length === 1 ? '' : 's'}, ${warnings.length} warning${warnings.length === 1 ? '' : 's'}`
);

process.exit(errors.length > 0 ? 1 : 0);
