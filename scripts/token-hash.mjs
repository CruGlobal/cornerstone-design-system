#!/usr/bin/env node
// Per-subtree hashing for tokens/*.json — used by /pull-tokens to detect what
// changed in Figma without re-pulling everything. The Figma-side discovery
// script must compute identical hashes; keep the canonical-leaf format below
// in lockstep with the snippet in .claude/commands/pull-tokens.md.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';

export function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
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

// Map a (file, dotted-leaf-name) to its subtree key.
// Subtree keys mirror the prefixes used by the Figma-side extractor:
//   ref/color/cru    ref/color/fl    ref/number    ref/string
//   sys/color/<mode> sys/number/<mode> sys/string/<mode>
//   cmp/<component>
export function subtreeKey(file, leafPath) {
  const segs = leafPath.split('.');
  if (file.endsWith('/ref.json') || basename(file) === 'ref.json') {
    if (segs[0] !== '_ref') { return null; }
    switch (segs[1]) {
      case 'color': return `ref/color/${segs[2]}`;
      case 'number': return 'ref/number';
      case 'string': return 'ref/string';
      default: return null;
    }
  }
  if (file.includes('/sys/')) {
    if (segs[0] !== '_sys') { return null; }
    const mode = basename(file, '.json');
    switch (segs[1]) {
      case 'color':
      case 'number':
      case 'string':
        return `sys/${segs[1]}/${mode}`;
      default: return null;
    }
  }
  if (file.includes('/cmp/')) {
    if (segs[0] !== '_cmp') { return null; }
    return `cmp/${basename(file, '.json')}`;
  }
  return null;
}

// Canonical leaf record. MUST match the Figma-side `leafRecord()` in
// .claude/commands/pull-tokens.md verbatim.
export function leafRecord(name, $type, $value) {
  return `${name}\t${$type}\t${String($value)}\n`;
}

function hashFileIntoMap(file, push) {
  const flat = flatten(JSON.parse(readFileSync(file, 'utf8')));
  for (const [name, leaf] of Object.entries(flat)) {
    push(subtreeKey(file, name), leafRecord(name, leaf.$type, leaf.$value));
  }
}

function hashDirIntoMap(dir, push) {
  if (!existsSync(dir)) { return; }
  for (const filename of readdirSync(dir).filter(f => f.endsWith('.json'))) {
    hashFileIntoMap(join(dir, filename), push);
  }
}

export function subtreeHashesFromFiles(tokensDir) {
  // bucket: subtreeKey -> array of leaf records (we'll sort + hash at the end)
  const buckets = {};
  const push = (key, rec) => {
    if (!key) { return; }
    (buckets[key] ||= []).push(rec);
  };

  const refFile = join(tokensDir, 'ref.json');
  if (existsSync(refFile)) { hashFileIntoMap(refFile, push); }

  hashDirIntoMap(join(tokensDir, 'sys'), push);
  hashDirIntoMap(join(tokensDir, 'cmp'), push);

  const out = {};
  for (const [key, recs] of Object.entries(buckets)) {
    recs.sort();
    out[key] = fnv1a(recs.join(''));
  }
  return out;
}

// CLI: `node scripts/token-hash.mjs` prints the manifest for tokens/.
if (import.meta.url === `file://${process.argv[1]}`) {
  const tokensDir = join(process.argv[1], '..', '..', 'tokens');
  const manifest = subtreeHashesFromFiles(tokensDir);
  for (const subtree of Object.keys(manifest).sort()) {
    process.stdout.write(`${manifest[subtree]}  ${subtree}\n`);
  }
}
