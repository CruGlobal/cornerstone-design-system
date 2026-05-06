---
description: Diff-pull design tokens from the linked Figma file — only re-fetches subtrees that actually changed.
allowed-tools:
  - Bash(node:*)
  - Bash(npm:*)
  - Bash(npx:*)
  - Bash(grep:*)
  - Bash(rm:*)
  - Read
  - Write
  - Edit
---

# Pull tokens from Figma (change-detecting)

Goal: snapshot the linked Figma file's variable collections (`Reference`, `System`, `Component`) into this repo's W3C DTCG token files **without re-fetching everything every run.** A single `use_figma` discovery call hashes each subtree in Figma; the agent compares those hashes to ones computed locally from `tokens/*.json`; only the subtrees that diverge get re-extracted.

Steady state (nothing changed in Figma): 1 `use_figma` call, 0 file writes, 0 build, exits in seconds.

The Figma file is `https://www.figma.com/design/MPjEsALOqWMDRR4osVK6NR/Cru-Design-System` (`fileKey: MPjEsALOqWMDRR4osVK6NR`). If `$ARGUMENTS` is provided it MAY override the file URL — otherwise default to the file above.

## Mandatory prerequisite

Before any `use_figma` call, invoke the `figma:figma-use` skill via the Skill tool. The Figma MCP server's instructions require this; skipping causes hard-to-debug failures.

## Subtree map (the unit of diffing)

24 fixed subtree keys, fine-grained enough that typical edits localize to one. The key string is also the value the agent compares against on both sides:

| Subtree key | Figma variables | Destination file |
|---|---|---|
| `ref/color/cru` | `_ref/color/cru/*` | `tokens/ref.json` |
| `ref/color/fl` | `_ref/color/fl/*` | `tokens/ref.json` |
| `ref/number` | `_ref/number/*` | `tokens/ref.json` |
| `ref/string` | `_ref/string/*` | `tokens/ref.json` |
| `sys/color/<mode>` | `_sys/color/*` per mode | `tokens/sys/<mode>.json` |
| `sys/number/<mode>` | `_sys/number/*` per mode | `tokens/sys/<mode>.json` |
| `sys/string/<mode>` | `_sys/string/*` per mode | `tokens/sys/<mode>.json` |
| `cmp/<component>` | `_cmp/<component>/*` | `tokens/cmp/<component>.json` |

A subtree key absent from the Figma manifest but present on disk → that subtree (or whole file, if it's a removed component) needs deletion. A key present in Figma but missing on disk → new content; pull it.

## Step 1 — Discovery (one `use_figma` call)

Paste the script in [#discovery-snippet](#discovery-snippet) verbatim into `use_figma`. It returns `{ subtreeKey: 8charHex, ... }` for every subtree present in the file. ~24 entries × ~30 chars ≈ 1KB return. No alias resolution needed because alias targets serialize as `{name.with.dots}` directly — identical to the on-disk form.

If the file lacks the expected three collections (`Reference`, `System`, `Component`), stop and surface the discrepancy.

## Step 2 — Local hash (no tool calls)

Import `subtreeHashesFromFiles` programmatically inside the inline diff script in [#diff-recipe](#diff-recipe) — that computes the local manifest and diffs it against Figma in one shot. The script is the source of truth for the canonical leaf record format; the discovery snippet must stay byte-identical or hashes drift.

## Step 3 — Diff

Three buckets:

- **Unchanged** (hash matches): skip.
- **Changed** (hash differs): targeted re-pull.
- **Removed from Figma** (key on disk, not in manifest): the agent must remove that subtree from the file (or delete the file outright if it's a `cmp/<component>.json` that's now empty).
- **New in Figma** (key in manifest, not on disk): pull it; the file may need to be created.

If the diff is empty, print `tokens are in sync with Figma` and exit. Skip Steps 4–7.

## Step 4 — Targeted extraction (0..N `use_figma` calls)

For each changed/new subtree key, run [#extraction-snippet](#extraction-snippet) with the corresponding `PREFIX` (and `MODE` for `sys/*`). The snippet returns the DTCG subtree exactly the way the existing files are shaped.

If a subtree's return exceeds the ~20K budget, fall back to the historical chunk strategy for that subtree only (e.g. for `sys/color/<mode>` plus `sys/number/<mode>` plus `sys/string/<mode>` — but you'll usually only have one of those three in the diff at a time).

## Step 5 — Surgical merge

For each changed subtree the agent pulled, **replace** that subtree's branch in the on-disk JSON file (do **not** deep-merge — deep-merge leaves deleted leaves in place). Concretely:

- `ref/color/cru` → replace `tokens/ref.json` → `_ref.color.cru` with the new branch.
- `sys/color/<mode>` → replace `tokens/sys/<mode>.json` → `_sys.color`.
- `cmp/<component>` → replace the entire `tokens/cmp/<component>.json` body (`_cmp.<component>`).

For removed subtrees, delete the corresponding branch (and the file, if the file is now empty).

Write the result back with 2-space indent and trailing newline. Skip writing if the resulting tree is byte-identical to disk.

## Step 6 — Validate / build / changeset (only if anything changed)

Run `npm run validate`. If it exits non-zero, surface the errors and stop — do not continue to build.

Run `npm run build`. Verify all 5 modes produced fresh CSS/JS/JSON/SCSS under `build/`.

Run `npx changeset` interactively. Recommend:
- **major**: removing or renaming a `_sys` or `_cmp` token.
- **minor**: adding a new token / mode / component.
- **patch**: changing a value (color shade tweak, alias retargeting that doesn't change the public name).

If the user is just snapshotting Figma without an API-shaping decision, default to **patch**.

## Step 7 — Print diff summary

`git status --short tokens/` and `git diff --stat tokens/`. Do NOT auto-commit, branch, or push. The user owns the PR.

---

## Discovery snippet

Paste this verbatim into the `code` parameter of `use_figma` for Step 1. Returns a `{ subtreeKey: 8charHex }` map. **The `fnv1a`, `dtcgType`, `colorToHex`, `dtcgValueFor`, `subtreeKey`, and `leafRecord` functions here MUST match `scripts/token-hash.mjs` byte-for-byte — drift breaks the diff.**

```js
function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

function dtcgType(t) {
  if (t === 'COLOR') return 'color';
  if (t === 'FLOAT') return 'number';
  if (t === 'STRING') return 'string';
  if (t === 'BOOLEAN') return 'boolean';
  return 'string';
}
function colorToHex({ r, g, b, a = 1 }) {
  const h = n => Math.round(n * 255).toString(16).padStart(2, '0');
  return a < 1 ? `#${h(r)}${h(g)}${h(b)}${h(a)}` : `#${h(r)}${h(g)}${h(b)}`;
}

function leafRecord(name, $type, $value) {
  return `${name}\t${$type}\t${String($value)}\n`;
}

function subtreeKey(varName, modeName) {
  const segs = varName.split('/').filter(Boolean);
  if (segs[0] === '_ref') {
    if (segs[1] === 'color') return `ref/color/${segs[2]}`;
    if (segs[1] === 'number') return 'ref/number';
    if (segs[1] === 'string') return 'ref/string';
    return null;
  }
  if (segs[0] === '_sys') {
    if (segs[1] === 'color' || segs[1] === 'number' || segs[1] === 'string') {
      return `sys/${segs[1]}/${modeName}`;
    }
    return null;
  }
  if (segs[0] === '_cmp') return `cmp/${segs[1]}`;
  return null;
}

const collections = await figma.variables.getLocalVariableCollectionsAsync();
const allVarsById = {};
for (const c of collections) {
  for (const id of c.variableIds) {
    const v = await figma.variables.getVariableByIdAsync(id);
    if (v) allVarsById[v.id] = v;
  }
}

function dtcgValueFor(figmaType, raw) {
  if (raw && typeof raw === 'object' && raw.type === 'VARIABLE_ALIAS') {
    const tgt = allVarsById[raw.id];
    if (!tgt) return null;
    return `{${tgt.name.split('/').join('.')}}`;
  }
  if (figmaType === 'COLOR') return colorToHex(raw);
  return raw;
}

const buckets = {};
for (const c of collections) {
  for (const id of c.variableIds) {
    const v = allVarsById[id];
    if (!v) continue;
    for (const mode of c.modes) {
      const key = subtreeKey(v.name, mode.name);
      if (!key) continue;
      const dottedName = v.name.split('/').filter(Boolean).join('.');
      const $type = dtcgType(v.resolvedType);
      const raw = v.valuesByMode[mode.modeId];
      const $value = dtcgValueFor(v.resolvedType, raw);
      if ($value === null) continue;
      (buckets[key] ||= []).push(leafRecord(dottedName, $type, $value));
    }
  }
}

const out = {};
for (const [key, recs] of Object.entries(buckets)) {
  recs.sort();
  out[key] = fnv1a(recs.join(''));
}
const sorted = {};
for (const k of Object.keys(out).sort()) sorted[k] = out[k];
return sorted;
```

## Diff recipe

After the discovery call, compute the local manifest and diff in one shot:

```sh
node -e "
import('./scripts/token-hash.mjs').then(m => {
  const local = m.subtreeHashesFromFiles('./tokens');
  const remote = $REMOTE;  // paste the discovery return verbatim as a JS object literal
  const allKeys = new Set([...Object.keys(local), ...Object.keys(remote)]);
  const changed = [], removed = [], added = [];
  for (const k of allKeys) {
    if (!(k in remote)) removed.push(k);
    else if (!(k in local)) added.push(k);
    else if (local[k] !== remote[k]) changed.push(k);
  }
  console.log(JSON.stringify({changed, added, removed}, null, 2));
});
"
```

Or just diff the two manifests by eye if there are only a handful of mismatches.

## Extraction snippet

For Step 4. The agent supplies `PREFIX` (e.g. `'_sys/color/'`) and optionally `MODE_NAME` (for sys subtrees). Returns the DTCG subtree at that prefix. Reuse the same `dtcgType`/`colorToHex`/`dtcgValueFor` definitions from the discovery snippet above when pasting — they're identical.

```js
// AGENT FILLS THESE IN:
const PREFIX = '_sys/color/';     // e.g. '_ref/color/cru/', '_cmp/button/', '_sys/number/'
const MODE_NAME = 'cru-light';    // ignored for ref/* and cmp/*; required for sys/*

const collections = await figma.variables.getLocalVariableCollectionsAsync();

const allVarsById = {};
for (const c of collections) {
  for (const id of c.variableIds) {
    const v = await figma.variables.getVariableByIdAsync(id);
    if (v) allVarsById[v.id] = v;
  }
}

function dtcgType(t) {
  if (t === 'COLOR') return 'color';
  if (t === 'FLOAT') return 'number';
  if (t === 'STRING') return 'string';
  if (t === 'BOOLEAN') return 'boolean';
  return 'string';
}
function colorToHex({ r, g, b, a = 1 }) {
  const h = n => Math.round(n * 255).toString(16).padStart(2, '0');
  return a < 1 ? `#${h(r)}${h(g)}${h(b)}${h(a)}` : `#${h(r)}${h(g)}${h(b)}`;
}
function dtcgValueFor(figmaType, raw) {
  if (raw && typeof raw === 'object' && raw.type === 'VARIABLE_ALIAS') {
    const tgt = allVarsById[raw.id];
    if (!tgt) return null;
    return `{${tgt.name.split('/').join('.')}}`;
  }
  if (figmaType === 'COLOR') return colorToHex(raw);
  return raw;
}
function nest(target, segments, leaf) {
  let node = target;
  for (let i = 0; i < segments.length - 1; i++) {
    const seg = segments[i];
    if (!node[seg] || typeof node[seg] !== 'object' || ('$value' in node[seg])) node[seg] = {};
    node = node[seg];
  }
  node[segments[segments.length - 1]] = leaf;
}

const root = {};
let count = 0;

for (const c of collections) {
  // Find the matching mode by name when needed; for non-mode subtrees there's only one.
  const mode = c.modes.find(m => m.name === MODE_NAME) || c.modes[0];
  for (const id of c.variableIds) {
    const v = allVarsById[id];
    if (!v || !v.name.startsWith(PREFIX)) continue;
    const segments = v.name.split('/').filter(Boolean);
    const raw = v.valuesByMode[mode.modeId];
    const value = dtcgValueFor(v.resolvedType, raw);
    if (value === null && raw && raw.type === 'VARIABLE_ALIAS') continue;
    nest(root, segments, { $type: dtcgType(v.resolvedType), $value: value });
    count++;
  }
}

return { count, root };
```

The returned `root` is shaped like the on-disk file's branch (e.g. `{ _sys: { color: { ... } } }`). The agent splices this branch into the existing file, replacing whatever was there.

## Notes for the agent

- **Hash drift is the failure mode to watch for.** If discovery says `cmp/button` matches but you can see in Figma that you just edited it, the canonicalization broke. Re-check the snippet against `scripts/token-hash.mjs` for byte-level drift in the `leafRecord` / `colorToHex` / value-stringification rules.
- **Worst case is no worse than the old flow** — if everything changed, you re-pull all 24 subtrees. That's roughly the old call count, so we don't regress.
- **The discovery call still iterates every variable.** That's fundamental for hashing. It's still one call, no chunking, no alias resolution side trip.
- **First pull on an empty/uninitialized repo**: every subtree shows up as "new" on the Figma side and the agent pulls them all. Normal one-time cost.
- **The build step is non-incremental**, so when *anything* changes we rebuild all 5 modes. That's fine — the cost of `npm run build` is small relative to `use_figma` round-trips.
- This command writes JSON only. CSS / SCSS / JS / TS / JSON-resolved outputs are derived by `npm run build` after extraction.
