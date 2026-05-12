# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
npm run validate       # lint the token tree (exits 1 on any error)
npm run build          # compile tokens → build/ via Style Dictionary
npm run version        # consume changesets → bump package.json + write CHANGELOG.md
npm run release        # publish to npm (runs automatically via release.yml)
npx changeset          # interactively add a changeset before merging a PR
npx changeset status   # preview what the next version bump would be
```

`build/` is gitignored. Built artifacts live only in the published npm package.

## Token Architecture

Tokens are organized in three layers with strict aliasing rules enforced by `npm run validate`:

```
tokens/
  ref.json          # _ref.*  — raw primitives (hex colors, unitless numbers, font strings)
  sys/
    cru-light.json  # _sys.*  — semantic aliases per brand × theme mode
    cru-dark.json
    fl-light.json
    fl-dark.json
  cmp/
    *.json          # _cmp.*  — component-level aliases
```

**Aliasing rules (validated, not just convention):**
- `_sys` tokens must alias `_ref` tokens only
- `_cmp` tokens must alias `_sys` tokens only (direct `_ref` aliases produce a warning; `_cmp`→`_cmp` is an error)
- Raw color literals are only allowed in `_ref`

All files use [W3C DTCG](https://design-tokens.github.io/community-group/format/) format (`$type` / `$value`).

## Build Pipeline

`build.mjs` runs Style Dictionary 4.x (`usesDtcg: true`) across five platform sets:

| Input | CSS selector |
|---|---|
| `tokens/ref.json` | `:root` |
| `tokens/sys/cru-light.json` | `[data-brand="cru"][data-theme="light"]` |
| `tokens/sys/cru-dark.json` | `[data-brand="cru"][data-theme="dark"]` |
| `tokens/sys/fl-light.json` | `[data-brand="fl"][data-theme="light"]` |
| `tokens/sys/fl-dark.json` | `[data-brand="fl"][data-theme="dark"]` |

Each set outputs CSS variables, SCSS variables, ESM, CJS, TypeScript declarations, and nested/flat JSON under `build/`.

Two custom transforms are registered in `build.mjs`: `name/css/cornerstone` (strips leading `_` from path segments and joins with `-`) and `value/number/unit` (applies `px`, opacity ratio, or `em` based on the token path).

## Changeset Rules

Every PR that touches the token API needs a changeset:
- **major** — removing or renaming a `_sys` or `_cmp` token
- **minor** — adding a new token, mode, or component
- **patch** — changing a value (color tweak, alias retarget that keeps the public name)

PRs that only change scripts/tooling with no token API impact can use `npx changeset add --empty`.

## Release Flow

Merging to `main` triggers `release.yml`. `changesets/action` will:
1. While changesets are pending → open/update a **"chore: version packages"** PR
2. When that PR is merged → publish to npm with provenance via npm Trusted Publishing (no `NPM_TOKEN` needed; `id-token: write` permission is already configured)

## Syncing Tokens from Figma

Use the `/pull-tokens` slash command (requires the Figma plugin for Claude Code — install via `/plugins`). It change-detects via per-subtree FNV-1a hashes and only re-pulls what changed. See `.claude/commands/pull-tokens.md` for the full protocol.

**Known limitation:** The `use_figma` tool has a ~20 KB response budget. When multiple `sys/color/<mode>` subtrees change simultaneously, extract them one mode at a time to avoid silent truncation (see issue #23).