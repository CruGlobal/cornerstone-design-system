# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Layout

An npm workspace of four packages. Root scripts fan out across all of them; per-package scripts do
one package's work.

|                        |                                        |                                                                         |
| ---------------------- | -------------------------------------- | ----------------------------------------------------------------------- |
| `packages/tokens`      | `@cruglobal/cornerstone-design-system` | the design tokens — published, public                                   |
| `packages/components`  | `@cruglobal/cornerstone-components`    | the component library — published, public                               |
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

Both packages release through changesets; `.changeset/config.json` ignores neither. The documentation
site is not published, but its pages are compiled into the agent skills the component library ships, so a
change under `packages/docs/src/content/docs/` changes `@cruglobal/cornerstone-components`' output and
takes a bump like any other.

## Release Flow

Merging to `main` triggers `release.yml`. `changesets/action` will:

1. While changesets are pending → open/update a **"chore: version packages"** PR
2. When that PR is merged → publish to npm with provenance via npm Trusted Publishing (no `NPM_TOKEN` needed; `id-token: write` permission is already configured)

Trusted publishing is configured **per package** on npmjs.com, and npm only lets you configure it for a
package that already exists — so a package's very first version has to be published by hand before OIDC
can take over. `@cruglobal/cornerstone-design-system` did that from CI with a short-lived `NPM_TOKEN`
(added in `ca23090`, removed in `900ea4e`); `@cruglobal/cornerstone-components` did it from a maintainer's
machine, answering an interactive 2FA challenge. Prefer the second for the next one: it creates no standing
credential, and npm removes direct publishing from bypass-2FA tokens in January 2027, leaving OIDC and
staged publishing.

`packages/components` deliberately does **not** set `publishConfig.provenance`. Trusted publishing attaches
a provenance attestation on its own — the flag exists to turn that *off* — while setting it true makes
`npm publish` refuse to run anywhere but a CI runner, which is precisely what a first publish cannot be.
`packages/tokens` still carries the flag; it only ever publishes from CI, so nothing there trips over it.

Neither package runs its test suite at publish time. `prepublishOnly` is `npm run build` in both, because
the release runner installs no browsers — `npm run verify` in `packages/components` ends in a
three-engine Playwright run that would fail there, and CI has already run that exact gate on the commit
being released.

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
