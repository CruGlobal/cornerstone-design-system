# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Layout

An npm workspace of four packages. Root scripts fan out across all of them; per-package scripts do
one package's work.

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

**Aliasing rules (validated, not just convention):**

- `_sys` tokens must alias `_ref` tokens only
- `_cmp` tokens must alias `_sys` tokens only (direct `_ref` aliases produce a warning; `_cmp`→`_cmp` is an error)
- Raw color literals are only allowed in `_ref`

All files use [W3C DTCG](https://design-tokens.github.io/community-group/format/) format (`$type` / `$value`).

## Changeset Rules

Every PR that touches the token API needs a changeset:

- **major** — removing or renaming a `_sys` or `_cmp` token
- **minor** — adding a new token, mode, or component
- **patch** — changing a value (color tweak, alias retarget that keeps the public name)

PRs that only change scripts/tooling with no token API impact still take a real bump and a real
description — never `npx changeset add --empty`.

**Keep the description to the change, not the reasoning behind it.** A changeset body is copied verbatim
into `CHANGELOG.md`, which npm, GitHub and the docs changelog all render, so an essay here is an essay on
three surfaces. A line or two, or a short bullet list; the rationale belongs in the PR description, which
every changelog entry links to. The first four entries reached 74-519 words each and had to be rewritten.

**The pull request description carries the reasoning, and enough of it to stand alone.** A reviewer should
be able to judge the change without opening the diff: what moved, what was considered and rejected, and what
was verified. Every changelog entry links to its pull request, so this is also where a reader lands when the
one-line summary is not enough — the two are a pair, and the brevity above only works because the depth is
here.

**Lead the summary with its category** — `Fixed:`, `Added:`, `Changed:`, `Removed:`, `Breaking:` or
`Deprecated:`. A changeset records the bump it causes, and a bump level is not a category: `patch` covers a
bug fix, a chore and a tooling tweak alike. The prefix is what lets the docs changelog give a generated entry
the same bullet icon an authored one gets; it reads as ordinary prose in the `CHANGELOG.md` npm and GitHub
render, and `remark-changelog.js` strips it there. An entry without one still publishes fine — it just keeps
a plain bullet rather than being guessed at.

Both packages release through changesets; `.changeset/config.json` ignores neither. The documentation
site is not published, but its pages are compiled into the agent skills the component library ships, so a
change under `packages/docs/src/content/docs/` changes `@cruglobal/cornerstone-components`' output and
takes a bump like any other.

## Release Flow

Merging to `main` triggers `release.yml`. `changesets/action` will:

1. While changesets are pending → open/update a **"chore: version packages"** PR
2. When that PR is merged → publish to npm with provenance via npm Trusted Publishing (no `NPM_TOKEN` needed; `id-token: write` permission is already configured)

Why a first publish is done by hand, where provenance is declared (and why not in a root `.npmrc`), and why
`prepublishOnly` only builds: `.claude/rules/release-publishing.md`, which loads when release config is touched.

## Syncing Tokens from Figma

Use the `/pull-tokens` slash command (requires the Figma plugin for Claude Code — install via `/plugins`). It change-detects via per-subtree FNV-1a hashes and only re-pulls what changed. See `.claude/commands/pull-tokens.md` for the full protocol, including its known `use_figma` size limit.

## Documentation Site

`packages/docs` is an Astro/Starlight site published to GitHub Pages at
https://cruglobal.github.io/cornerstone-design-system/ by `.github/workflows/pages.yml`, which runs on
push to `main`. Pages is configured in Terraform (`cru-terraform`, `github/CruGlobal/repos/cornerstone-design-system`)
with `build_type = "workflow"` — not a branch source, which would run Jekyll and drop Astro's `_astro/`
directory.

Every documentation URL derives from `packages/components/package.json`'s `homepage`, by way of
`packages/build-tools/site-url.js`. Change it there, nowhere else; `scripts/check-docs-url.js` fails the
build if a literal address appears anywhere.

## Agent skills

Paths in this section are relative to the repo root, not `packages/tokens`.

### Issue tracker

Issues live in this repo's GitHub Issues, reached through the `gh` CLI — including wayfinder maps and their
child tickets. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, each label string equal to its own name. See `docs/agents/triage-labels.md`.

### Domain docs

Multi-context: a root `CONTEXT-MAP.md` points at one `CONTEXT.md` per package, with root-level `docs/adr/` for
decisions no single package owns. See `docs/agents/domain.md`.
