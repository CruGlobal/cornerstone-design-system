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

Two kinds of PR take no changeset at all: Dependabot PRs (a `dependabot/` branch) and lockfile-only PRs,
whose diff changes `package-lock.json` and no `package.json`.
Neither changes what a consumer installs. The test is that last point: a Dependabot PR that moves a
`dependencies` or `peerDependencies` range in `packages/components/package.json` or
`packages/tokens/package.json` does change it, so it takes a patch changeset (`Changed: …`) pushed to its
branch before merge. A `devDependencies` bump never does.

CI's `Changeset present` job checks these rules by running `packages/build-tools/changeset-gate.js`, which
has a test for each one. It reads "lockfile-only" strictly: `package-lock.json` is the only file changed.

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
`Deprecated:`, the set `packages/build-tools/changelog-categories.js` defines. A changeset records the bump it
causes, and a bump level is not a category: `patch` covers a bug fix, a chore and a tooling tweak alike. The
prefix is what sorts the release: `npm run version` runs `packages/build-tools/sort-changelog.js` after
`changeset version`, which files each entry under a `### Fixed`-style heading and drops the prefix the
heading now states, so the release PR, GitHub, npm and the docs changelog all read by category. An entry
without one still publishes fine — it lands under `### Other changes` rather than being guessed at.

Both packages release through changesets; `.changeset/config.json` ignores neither. The documentation
site is not published, but its pages are compiled into the agent skills the component library ships, so a
change under `packages/docs/src/content/docs/` changes `@cruglobal/cornerstone-components`' output and
takes a bump like any other.

## Release Flow

Merging to `main` triggers `release.yml`. `changesets/action` will:

1. While changesets are pending → open/update a **"chore: version packages"** PR
2. When that PR is merged → publish to npm with provenance via npm Trusted Publishing (no `NPM_TOKEN` needed; `id-token: write` permission is already configured)

Merging the release PR is Cornerstone's deploy, and a maintainer does it by hand. The bot's pushes leave
that PR's CI run waiting for approval, so: approve the run for the PR's current head commit ("Approve and
run workflows" on the PR), wait for `CI gate`, approve the PR, merge. Every merge to `main` re-pushes the
PR, which holds a new run and dismisses the earlier approval, so do all four steps right before
publishing. Never automate them.

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
`packages/build-tools/site-url.js`. Change it there, nowhere else. Treat a typed address as unchecked:
`packages/components/scripts/check-docs-url.js` runs in that package's `npm run verify` and checks only what
its rules and its `globbySync` call name.

## Agent skills

Paths in this section are relative to the repo root, not `packages/tokens`.

### Issue tracker

Issues live in this repo's GitHub Issues, reached through the `gh` CLI — including wayfinder maps and their
child tickets. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, each label string equal to its own name. See `docs/agents/triage-labels.md`.

### Domain docs

Multi-context: a root `GLOSSARY-MAP.md` points at one `GLOSSARY.md` per package. Decisions are resolved issues,
and the rule each one sets lives in `docs/standards/` with a link back. See `docs/agents/domain.md`.

### Code review

Review a branch with the `code-review` skill against a fixed point such as `main`. The standards it checks
against live in `docs/standards/`, one file per area, each saying which paths it applies to. The ast-grep rules
in `packages/components/ast-grep/` run in that package's `npm run lint`, locally and in CI, so a review leaves
what they catch to them.

## Who approves and merges

Paths in this section are relative to the repo root. A maintainer is anyone with write access.

Who did the work decides who approves the pull request. Each work item in Jira (`UIUX`) carries one tier label,
set by a person during planning: `agent-alone` (an agent runs it end to end), `agent-builds` (an agent builds it
while a named person shapes it) or `human-leads` (only a person takes it). An agent opens pull requests under the
GitHub account of the person running it, so GitHub cannot tell an agent's pull request from that person's own; the
`needs-human-approval` label is the marker. agent-review's approve action (`approval.cjs` in
CruGlobal/agent-review, called by `.github/workflows/agent-review-approve.yml`) will not approve while a person's
copy of that label is on the pull request, and never removes it.

- **An agent's pull request**, for `agent-alone` or `agent-builds` work: the agent runs `/agent-review:review`
  and posts the report. Once `CI gate` has passed (`gh pr checks <n> --watch`), the report is clean and the bot
  has approved, and `needs-human-approval` is still absent, the agent turns on auto-merge with
  `gh pr merge <n> --auto --merge`. If the repo refuses auto-merge, it leaves the merge to a maintainer. Never
  `--admin` or any other bypass.
- **A contributor's own pull request**, with no agent (`human-leads` work): add `needs-human-approval` when
  opening it. agent-review still reviews it, but the bot will not approve it. Another maintainer approves it
  before it merges, since GitHub never lets an author approve their own pull request; only a maintainer with
  bypass rights may merge without that.
- **Any pull request carrying `needs-human-approval`**, whoever added it (a contributor, an agent, or agent-review
  for the paths `human_approval` lists in `.claude/review/config.yml`, which keep an agent from changing its own
  instructions or guardrails and merging the change): a maintainer approves and merges it; an agent never does.
  Adding the label does not withdraw an approval the bot already gave, so if auto-merge is on, also run
  `gh pr merge <n> --disable-auto`.
- **The release pull request** is the deploy (Release Flow). A maintainer approves its CI run, approves it and
  merges it; an agent never does.
