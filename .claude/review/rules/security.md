# Security — Focus Areas

Generic baseline. `/agent-review:init` appends the repo-specific concerns; keep both.

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

<!-- init: extend this file with repo-specific focus areas and evidence links -->

## Cornerstone — Repo-Specific Focus Areas

This repository has no server, no database and no authentication. The generic sections on sessions,
cookies, webhooks and injection rarely apply; when they do not, say "N/A" rather than inventing a
concern. What this lane protects here is the **release**, the **CI**, the **supply chain**, and the
**agent prompts that ship to consumers**.

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

- `ci.yml` runs with `contents: read, pull-requests: read`. `release.yml` is the only workflow with
  `contents: write, pull-requests: write, id-token: write`; `pages.yml` has `pages: write, id-token: write`.
  A job gaining a `write` it did not have, a `pull_request_target` trigger, or a secret echoed to a log is
  a finding.
- `ci.yml` uses `cancel-in-progress: true`, which is safe only because nothing in it deploys or publishes.
  `pages.yml` deliberately uses `cancel-in-progress: false`. Do not copy the first into a workflow that
  deploys.
- The `agent-review*.yml` callers use reusable workflows from `CruGlobal/agent-review@main`. A change to
  which repository or ref they call is a trust change, and a change to `auto_approve` or `rollout_mode`
  changes who can merge.
- Dependabot PRs receive no repository secrets, so they are never robot-reviewed. A human reviews them.

**Dependencies**

- Playwright is pinned by the root `overrides` and ignored in `.github/dependabot.yml`; the two move
  together. A bump to `lit`, `esbuild`, `playwright`, `@web/test-runner*`, `style-dictionary`, `astro`,
  `@astrojs/starlight` or `typescript` deserves a read of its changelog, not a rubber stamp.
- A `package-lock.json` diff with no `package.json` diff is resolution drift or a hand edit.
- A package declares what it uses in its own manifest; "it ran locally" is not evidence, because npm
  hoisting decides which copy resolves (see `rules/architecture.md`).

**Browser-surface sinks**

- `cs-markdown` and `cs-include` fetch and render external content, and `cs-icon` resolves icon URLs. Flag
  any new `innerHTML`, `unsafeHTML`, `unsafeSVG` or `eval`-shaped sink, and any widening of what those
  three accept.

**The prompts and the review are a trust surface**

- `plugins/**` ships to every consumer who installs the `cru` marketplace. A weakened refusal, a wider tool
  permission, or a marketplace outside CruGlobal is a finding.
- `.claude/review/**` and `.claude/settings.json` gate every future review. A change that lowers a lane's
  severity, removes a static rule, or widens `excluded_paths` says why in the PR body.
- Branch protection is declared in `cru-terraform`
  (`github/CruGlobal/repos/cornerstone-design-system/github.tf`), not here. A PR that assumes a different
  rule set is wrong about what happens at merge.

---

## Mined from merged PR history

Rules derived from 46 merged PRs (#49–#169). Each carries the PRs it came from.

- **Publish and install settings are governed from more than one file.** A PR that changes anything
  `npm publish` or `npm ci` reads (`publishConfig`, `prepublishOnly`, any `.npmrc`, `.changeset/config.json`,
  the root `overrides`, `.github/dependabot.yml`) lists every config source in precedence order, and a
  publish-setting change shows `npm publish --dry-run` from the machine class the publish will run on.
  Pair a root `overrides` pin with a matching Dependabot `ignore` in the same PR. The chain here: a root
  `.npmrc` added believing it enabled provenance (it is on by default under OIDC and only blocks local
  publishes), reasoning about one package's `publishConfig` while the root file still applied to every
  package, a failed bootstrap publish, then the deletion.
  <!-- evidence: PR #103, #110, #112 -->
- **Workflow hygiene with teeth.** A `pull_request:` trigger carries no `branches:` filter (the old
  `branches: [main]` ran no CI at all on stacked PRs); a gate that compares against a branch uses
  `github.event.pull_request.base.ref`, never `origin/main`; every `${{ github.event.* }}` value reaches a
  `run:` step through `env:`, never inline, since ref names may carry `$` and `;`; and a job behind a
  job-level `if:` must not be one a required status check names, because a skipped job satisfies the rule.
  <!-- evidence: PR #84, #86, #89, #94, #98 -->
