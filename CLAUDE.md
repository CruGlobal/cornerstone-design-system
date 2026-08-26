# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Layout

An npm workspace of four packages. Root scripts fan out across all of them; per-package scripts do
one package's work.

|                        |                                        |                                                                         |
| ---------------------- | -------------------------------------- | ----------------------------------------------------------------------- |
| `packages/tokens`      | `@cruglobal/cornerstone-design-system` | the design tokens — published, public                                   |
| `packages/components`  | `@cruglobal/cornerstone-components`    | the component library — restricted, not yet published                   |
| `packages/docs`        | —                                      | the Astro documentation site — deploys to GitHub Pages, never published |
| `packages/build-tools` | —                                      | modules the library and the docs share — private, never published       |

Paths in this file are relative to `packages/tokens` unless stated otherwise.

## Commands

```sh
# whole workspace
npm run build          # build every package (slow — includes the component library)
npm run verify         # every package's own gate; the component suite is ~35 minutes
npx changeset          # interactively add a changeset before merging a PR
npx changeset status   # preview what the next version bump would be

# one package
npm run validate --workspace @cruglobal/cornerstone-design-system   # lint the token tree
npm run build    --workspace @cruglobal/cornerstone-design-system   # tokens → build/ via Style Dictionary
npm run verify   --workspace @cruglobal/cornerstone-components      # the library's full gate
npm run build    --workspace cornerstone-docs-site                  # the documentation site
```

`packages/tokens/build/`, `packages/components/dist/` and `packages/docs/dist/` are all gitignored.
Built artifacts live only in the published packages and the deployed site.

`packages/components` has its own `CLAUDE.md`; read it before working in there.

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

`packages/tokens/build.mjs` runs Style Dictionary 5.x (`usesDtcg: true`) across five platform sets:

| Input                             | CSS selector                             |
| --------------------------------- | ---------------------------------------- |
| `packages/tokens/tokens/ref.json` | `:root`                                  |
| `tokens/sys/cru-light.json`       | `[data-brand="cru"][data-theme="light"]` |
| `tokens/sys/cru-dark.json`        | `[data-brand="cru"][data-theme="dark"]`  |
| `tokens/sys/fl-light.json`        | `[data-brand="fl"][data-theme="light"]`  |
| `tokens/sys/fl-dark.json`         | `[data-brand="fl"][data-theme="dark"]`   |

Each set outputs CSS variables, SCSS variables, ESM, CJS, TypeScript declarations, and nested/flat JSON under `build/`.

Two custom transforms are registered in `packages/tokens/build.mjs`: `name/css/cornerstone` (strips leading `_` from path segments and joins with `-`) and `value/number/unit` (applies `px`, opacity ratio, or `em` based on the token path).

## Changeset Rules

Every PR that touches the token API needs a changeset:

- **major** — removing or renaming a `_sys` or `_cmp` token
- **minor** — adding a new token, mode, or component
- **patch** — changing a value (color tweak, alias retarget that keeps the public name)

PRs that only change scripts/tooling with no token API impact can use `npx changeset add --empty`.

`@cruglobal/cornerstone-components` is in `.changeset/config.json`'s `ignore` list: it has never been
published, and whether it goes to npm under a paid organisation or to GitHub Packages is unsettled.
Until that is decided, changesets must not try to release it.

## Release Flow

Merging to `main` triggers `release.yml`. `changesets/action` will:

1. While changesets are pending → open/update a **"chore: version packages"** PR
2. When that PR is merged → publish to npm with provenance via npm Trusted Publishing (no `NPM_TOKEN` needed; `id-token: write` permission is already configured)

## Syncing Tokens from Figma

Use the `/pull-tokens` slash command (requires the Figma plugin for Claude Code — install via `/plugins`). It change-detects via per-subtree FNV-1a hashes and only re-pulls what changed. See `.claude/commands/pull-tokens.md` for the full protocol.

**Known limitation:** The `use_figma` tool has a ~20 KB response budget. When multiple `sys/color/<mode>` subtrees change simultaneously, extract them one mode at a time to avoid silent truncation (see issue #23).

## Documentation Site

`packages/docs` is an Astro/Starlight site published to GitHub Pages at
https://cruglobal.github.io/cornerstone-design-system/ by `.github/workflows/pages.yml`, which runs on
push to `main`. Pages is configured in Terraform (`cru-terraform`, `github/CruGlobal/repos/cornerstone-design-system`)
with `build_type = "workflow"` — not a branch source, which would run Jekyll and drop Astro's `_astro/`
directory.

Every documentation URL derives from `packages/components/package.json`'s `homepage`, by way of
`packages/build-tools/site-url.js`. Change it there, nowhere else; `scripts/check-docs-url.js` fails the
build if a literal address appears anywhere.
