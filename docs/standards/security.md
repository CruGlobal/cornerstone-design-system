# Security — Focus Areas

A generic baseline, followed by Cornerstone's own concerns; keep both.

**Authentication & authorization boundaries**

- Every server endpoint, background job, and privileged action independently verifies the caller's
  identity — never trusts a user id, tenant id, or role passed in from the client
- Authorization is enforced at the data layer (row/tenant scoping, ACL check), not only by hiding UI
- Look for: endpoints added without a session/permission check; ownership checks that compare
  against client-supplied identifiers; policy changes that widen who can read or write a record

**Privileged clients & credentials**

- Admin/service-level clients that bypass normal access control must stay server-only and must never
  be importable from browser or otherwise untrusted code
- Look for: privileged clients imported into client-side modules; secrets read in code that ships to
  the browser; credentials committed to the repo or baked into build artifacts

**Secrets exposure**

- Server-only environment variables must not be exposed through client-visible prefixes, build-time
  inlining, or error payloads
- Look for: new environment-variable references; API keys or tokens in logs, error messages, HTTP
  responses, or analytics events

**Input validation & injection**

- Untrusted input (request bodies, query params, headers, webhooks, third-party payloads, file
  uploads) is validated against an explicit schema before use
- Look for: raw string interpolation into SQL/shell/HTML/templates; parsers fed unvalidated JSON;
  client-side validation with no server-side counterpart; unbounded sizes and counts

**Cross-site and browser-surface risks**

- Look for: raw-HTML injection sinks; unsanitized user content rendered as markup; open redirects
  where a redirect target comes from a query parameter without an allowlist check; missing CSRF
  protection on state-changing requests; weakened CSP or security headers

**Session & cookie handling**

- Look for: session cookies missing `HttpOnly`/`Secure`/`SameSite`; tokens stored where scripts can
  read them; sessions that are not invalidated on logout, password change, or privilege change;
  long-lived or non-rotating credentials

**Webhooks & third-party integrations**

- Look for: webhook handlers that parse and act on a payload before verifying the signature against
  the raw body; missing replay protection; secrets or tokens forwarded to the client

**Supply chain & CI**

- Look for: new dependencies (who maintains them, what they pull in); CI workflow changes that widen
  permission scopes, echo secrets, or let untrusted contributors trigger privileged jobs; changes to
  the review configuration itself that weaken risk scoring or strip checks

## Cornerstone — Repo-Specific Focus Areas

This repository has no server, no database and no authentication. The generic sections on sessions,
cookies, webhooks and injection rarely apply; when they do not, say "N/A" rather than inventing a
concern. What this document protects here is the **release**, the **CI**, the **supply chain**, and the
**agent prompts that ship to consumers**.

**Applies when the diff touches** `.github/**`, `.changeset/config.json`, any `.npmrc`, `.tool-versions`,
`package.json`, `packages/*/package.json`, `package-lock.json`, `.claude-plugin/**`, `plugins/**`, `.claude/**`,
`docs/standards/**`, `packages/components/ast-grep/**`, `packages/components/sgconfig.yml`,
`packages/components/scripts/build.js`, `packages/build-tools/**`, or
`packages/components/src/components/{markdown,include,icon}/**`, or any line carrying `publishConfig`,
`provenance`, `NPM_TOKEN`, `id-token`, `pull_request_target`, `permissions:`, `secrets.`, `overrides`,
`prepublishOnly`, `innerHTML`, `unsafeHTML`, `unsafeSVG`, `eval(` or `new Function(`.

**What ships, and from where**

- Two public npm packages publish from `release.yml` through npm Trusted Publishing (OIDC).
  `prepublishOnly` is `npm run build` in both and is never `verify`: the release runner installs no
  browsers, and CI has already run the full gate on the commit being released.
- Provenance is declared in exactly one place, `packages/tokens/package.json`'s `publishConfig`. A root
  `.npmrc` carrying `provenance=true` failed the component library's first publish. Any new `.npmrc`, any
  `provenance` flag outside that manifest, and any `NPM_TOKEN` reference is a finding.
- Each `package.json`'s `files` list decides what the tarball contains; `exports` decides what resolves.
  A diff to either changes what consumers download or import.
- `@cruglobal/cornerstone-components` ships agent skills generated from `packages/docs` pages
  (`SKILL_PAGES` in `packages/components/scripts/agent-skill.js`) and from every `components/*.md`. A
  change to those pages is package output.

**CI permissions and triggers**

- `ci.yml` runs with `contents: read`. `release.yml` is the only workflow with
  `contents: write, pull-requests: write, id-token: write`; `pages.yml` has `pages: write, id-token: write`.
  A job gaining a `write` it did not have, a `pull_request_target` trigger, or a secret echoed to a log is
  a finding.
- `ci.yml` uses `cancel-in-progress: true`, which is safe only because nothing in it deploys or publishes.
  `pages.yml` deliberately uses `cancel-in-progress: false`. Do not copy the first into a workflow that
  deploys.
- No model API key lives in this repository's secrets. A workflow that adds one is a finding until the team
  has decided to run a model in CI.
- Nothing reviews a Dependabot PR on its own; review it like any other.
- `main`'s branch protection names one check, `CI gate` (the `gate` job in `ci.yml`). It runs
  `if: always()`, needs every other job, and passes when each succeeded or was skipped. A job left out of
  its `needs:` is not gated, and a `gate` without `if: always()` is skipped when a job fails, which a
  required check counts as a pass.
- What is skipped is decided by `packages/build-tools/affected.js`, which the `changes` job runs, so a
  rule there that misses a path is a gate that passes without running. A new path the library or the site
  reads (a workspace package, a root config) joins its path lists in the same diff, with a test. Its
  `browser` gate keeps Markdown out of the browser suite; a diff that makes a `.md` file an input to a
  component's runtime breaks that.
- Actions are pinned by tag, not commit SHA. One is third-party: `changesets/action@v1` in `release.yml`,
  which holds `contents: write`, `pull-requests: write` and `id-token: write`. The test image is pulled by tag too, and `release.yml` installs `npm@latest`. A new
  third-party action or image, or a moved tag, is reviewed like a new dependency.
- `agent-review-approve.yml` calls `CruGlobal/agent-review`'s reusable `approve.yml` and `withdraw.yml`, which
  run with `pull-requests: write` and call that repo's actions at `@main`. The caller is pinned to a commit
  SHA; a change that moves it to a branch or tag, widens its `permissions:`, adds a step that checks out the
  pull request's code (it runs on `pull_request_target`), or sets `auto_approve` is a finding until the PR
  body says why.

**Dependencies**

- `playwright` is pinned exactly in both `packages/components` and `packages/docs`, and `ci.yml`'s test
  shards run in the `mcr.microsoft.com/playwright:v<version>-noble` image. The image tag is
  read from the lockfile by `packages/build-tools/affected.js`, so it follows the two manifests; a
  version written into `ci.yml` by hand is a finding (#282 is what a stale one cost). A bump to `lit`,
  `esbuild`, `playwright`, `@web/test-runner*`, `style-dictionary`, `astro`, `@astrojs/starlight`,
  `typescript`, `axe-core` or `@ast-grep/cli` deserves a read of its changelog, not a rubber stamp.
- A `package-lock.json` diff with no `package.json` diff is resolution drift or a hand edit.
- A package declares what it uses in its own manifest; "it ran locally" is not evidence, because npm
  hoisting decides which copy resolves (see `architecture.md`).
- Astro, Starlight and the site have to resolve one shared copy of `@astrojs/markdown-remark`.
  `check:markdown-remark` runs before every docs build and fails when a lockfile nests a second one
  (UIUX-134). The fix is the site's range and a regenerated lockfile, as #273 did, never an exemption.

**Browser-surface sinks**

- `cs-markdown` and `cs-include` fetch and render external content, and `cs-icon` resolves icon URLs. Flag
  any new `innerHTML`, `unsafeHTML`, `unsafeSVG` or `eval`-shaped sink, and any widening of what those
  three accept.

**The prompts and the standards are a trust surface**

- `plugins/**` ships to every consumer who installs the `cru` marketplace. A weakened refusal, a wider tool
  permission, or a marketplace outside CruGlobal is a finding.
- `plugins/cornerstone/hooks/session-start.sh` is shell that runs in every consumer project with the
  `cornerstone` plugin on. It reads stdin's `cwd`, runs `git rev-parse`, and reads the project's
  `package.json` and the installed package's; `clean()` limits the version to version characters before it
  goes into the JSON it prints. A change that reads anything else, writes a file, reaches the network, or
  prints a value without `clean()` is a finding.
- `.claude-plugin/marketplace.json` lists one plugin from outside this repository, `mattpocock-skills`,
  pinned by `ref` and `sha` (#207), and `allowCrossMarketplaceDependenciesOn` names only
  `claude-plugins-official`. A new outside source, a source without a `sha`, a moved pin, or a wider
  allow-list is a dependency bump: read what the skills at the new commit tell an agent to do.
- `.claude/` (the settings, rules and commands every session loads, and agent-review's `.claude/review/`
  config, whose `rules/` are symlinks to `docs/standards/`) and `docs/standards/` steer every future session
  and review. A change that loosens a standard, lowers a lane's severity, drops a trigger, widens
  `excluded_paths`, removes an ast-grep rule, or turns a rule symlink into a copy says why in the PR body.
- Branch protection is declared in `cru-terraform`
  (`github/CruGlobal/repos/cornerstone-design-system/github.tf`), not here. A PR that assumes a different
  rule set is wrong about what happens at merge.

---

## Mined from merged PR history

Rules derived from 96 merged PRs: #49–#169 (October 2026) and #228–#329 (November 2026). Each carries
the PRs it came from.

- **Publish and install settings are governed from more than one file.** A PR that changes anything
  `npm publish` or `npm ci` reads (`publishConfig`, `prepublishOnly`, any `.npmrc`, `.changeset/config.json`,
  the root `overrides`, `.github/dependabot.yml`) lists every config source in precedence order, and a
  publish-setting change shows `npm publish --dry-run` from the machine class the publish will run on.
  Pin a version exactly in the package that uses it rather than in a root `overrides` block, which
  Dependabot does not edit (#95 and #281 could not merge) (#282 was a stale root pin
  outliving a Playwright bump). The chain here: a root
  `.npmrc` added believing it enabled provenance (it is on by default under OIDC and only blocks local
  publishes), reasoning about one package's `publishConfig` while the root file still applied to every
  package, a failed bootstrap publish, then the deletion.
  <!-- evidence: PR #103, #110, #112 -->
- **Workflow hygiene with teeth.** A `pull_request:` trigger carries no `branches:` filter (the old
  `branches: [main]` ran no CI at all on stacked PRs); a gate that compares against a branch uses
  the pull request's own base (`HEAD^1` of its merge checkout, or `github.event.pull_request.base.ref`),
  never `origin/main`; every `${{ github.event.* }}` value reaches a
  `run:` step through `env:`, never inline, since ref names may carry `$` and `;`; and a job behind a
  job-level `if:` must not be one a required status check names, because a skipped job satisfies the rule.
  Since #329 the required check is `CI gate`, which counts a skipped job as passed, so the same hole now
  opens through a path filter that misses a file.
  <!-- evidence: PR #84, #86, #89, #94, #98 -->

- **Playwright moves in two places.** See Dependencies above: both packages' exact pin. `ci.yml`'s
  container tag follows the lockfile. A root `overrides` entry for it does not come back, and a major bump in a package family
  (`@web/test-runner-playwright` 1.x next to `@web/test-runner` 0.19) is read against the lockfile for a
  nested second copy. #241's bump ran under a stale 1.52 override until #282.
  <!-- evidence: PR #241, #264, #282 -->
- **The release PR's CI waits for a person.** changesets' "chore: version packages" PR is pushed with
  `GITHUB_TOKEN`, so GitHub holds its `pull_request` CI run for approval instead of starting it: #231, #236
  and #263 were approved and published with that run never started, and #232's changelog sorter first ran
  for real inside #231. Merging that PR is the deploy, so the held run is approved by hand (CLAUDE.md,
  Release Flow), and `CI gate` reports only after that. A dispatched run does not count: #300's checks did
  not show one (#334, reverted in #335). Flag a `release.yml` or branch-protection change that would merge
  or publish a release without that run, or that automates approving it.
  <!-- evidence: PR #231, #232, #236, #263, #300, #334 -->
- **A Dependabot PR gets a written review.** For a major bump or a new-releaser maintainer change, the
  review notes the maintainer change, the new `engines` against `.tool-versions`, any ESM-only switch in
  release tooling (which only `release.yml` exercises), and the lockfile's new `node_modules/*` entries and
  transitive majors. #241 to #244 were approved with empty reviews within a minute of each other.
  <!-- evidence: PR #240, #241, #242, #243, #244 -->
- **The CI gate and its filters stay whole.** A diff that adds, removes or renames a `ci.yml` job changes the
  `gate` job's `needs:` with it, and a gate added to `packages/build-tools/affected.js` gets a job that reads it; that
  module's tests fail when the two disagree. A check that validates output built from `packages/docs/src/content/docs/**`
  runs in a job that docs-only PRs trigger (#277 moved `verify:skills` for this).
  <!-- evidence: PR #229, #277, #329 -->
- **Query and stored values reach markup only through an allowlist.** A docs page or inline script that
  writes a URL parameter or `localStorage` value into markup (`document.write`, `innerHTML`) looks it up in
  a build-time table with `Object.hasOwn` and writes the table's value, never the raw input, as
  `showcase.astro` and `src/brands.js` do.
  <!-- evidence: PR #250, #253 -->
