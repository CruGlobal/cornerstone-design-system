# Standards — Checklist

A generic baseline, followed by Cornerstone's own checklist; both apply. Every item is mandatory unless the
repo's own conventions override it. Check each **bold group** below and raise anything non-compliant as a
finding.

**Exports & Naming**

- [ ] Export style matches the repo's convention (named vs default) — don't introduce a second style
- [ ] File and directory naming follows the existing convention (casing, suffixes, special filenames
      the framework requires)
- [ ] Public identifiers are descriptive; abbreviations match ones already used in the codebase
- [ ] Imports use the repo's alias/path convention rather than deep relative traversal

**Types**

- [ ] No escape hatches that disable type checking in new code (untyped `any`-equivalents, suppression
      comments) without an inline comment explaining why
- [ ] No non-null/force-unwrap assertions on values that can legitimately be absent — check explicitly
- [ ] Types are derived from a single source of truth rather than hand-duplicated alongside it

**Input & Forms**

- [ ] User input is validated with the repo's established validation approach, not ad-hoc checks
- [ ] Every client-side validation rule has a server-side counterpart
- [ ] Submit/confirm actions are disabled or guarded while in flight so they can't double-fire

**Data**

- [ ] Writes invalidate or update the cached data they affect
- [ ] Cache/query keys are stable, descriptive, and scoped to the resource and its inputs
- [ ] Queries rely on the real authorization boundary, not on a client-side filter

**Dates & Numbers**

- [ ] Date math uses the repo's chosen date library and format conventions, not ad-hoc arithmetic
- [ ] Numeric formatting and rounding happen at the display boundary, consistently

**Testing**

- [ ] Every new function, hook, and non-trivial component has a test in the repo's conventional
      location
- [ ] Tests use the repo's runner and mocking idioms
- [ ] Test code is typed as strictly as production code

**Code Quality**

- [ ] Lint, type-check, and format commands pass
- [ ] No debug output left behind (console/print statements, debuggers, `TODO` without a tracked issue
      reference)
- [ ] No unused imports, variables, or dead parameters
- [ ] No commented-out code blocks (delete, don't comment)
- [ ] No empty catch blocks that swallow errors silently
- [ ] Package-manager usage matches the repo's lockfile (don't mix tools)

## Cornerstone — Repo-Specific Checklist

Check each bold group below alongside the generic ones. The canonical conventions are
`packages/docs/src/content/docs/resources/contributing.md` (component structure, parts, slots, form
controls, SSR) and `packages/components/CLAUDE.md` (the mechanical rules most often missed). Point at them;
do not restate them. The groups **Input & Forms**, **Data** and **Dates & Numbers** above are N/A in this
repository unless a diff genuinely introduces one of those concerns.

### Commands (quote these exactly; don't invent equivalents)

| Purpose                                                                   | Command                                                              |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Lint the token tree                                                       | `npm run validate --workspace @cruglobal/cornerstone-design-system`  |
| Library static gate (prettier, build, eslint, cspell, tsc, four checks)   | `npm run verify:static --workspace @cruglobal/cornerstone-components` |
| Library browser suite                                                     | `npm test --workspace @cruglobal/cornerstone-components`             |
| Library full gate                                                         | `npm run verify --workspace @cruglobal/cornerstone-components`       |
| Docs site gate                                                            | `npm run verify --workspace cornerstone-docs-site`                   |
| One component, watching                                                   | `npm run test:component -- --watch --group <name>`                   |
| New component                                                             | `npm run create`                                                     |
| Add a changeset                                                           | `npx changeset`                                                      |

**What lint already enforces** (do not re-flag): Prettier; ESLint `import-x/order` with no blank lines
between groups; `no-console` (warn and error allowed); `eqeqeq` with `null: ignore`, a recorded exception
(`x == null` is the one type-safe loose compare and 51 of 52 sites use it), so do not "fix" it;
`@typescript-eslint/no-explicit-any` as an error in `src` and off in tests; `curly`, `no-var`,
`prefer-const`; cspell over `src` and `scripts`; `tsc --noEmit` under NodeNext, which also rejects a
relative import missing its `.js` extension.

### **Components**

- [ ] Extends `CornerstoneElement` or `CornerstoneFormAssociatedElement`, never `LitElement`; styles on
      `static css`
- [ ] Multi-word properties declare `attribute: 'kebab-case'`; boolean props default `false` and read
      `with-*` / `without-*`
- [ ] Event handlers are `handle<Subject>` taking `event`; custom events are one class per file in
      `src/events/`, named `cs-<kebab>`, `composed: true`
- [ ] Class names inside the shadow root follow BEM; parts are kebab-case with `__` for a forwarded child
      part; no part on a `<slot>` or on slot fallback content
- [ ] Component custom properties are unprefixed (`--color`) and scoped to `:host`; `--cs-` is reserved
      for the global theme
- [ ] `label` and `hint` are a slot whose fallback is the attribute, and `aria-labelledby` points at the
      rendered element rather than reading `this.label`
- [ ] `private` on private members; no `public`; member order per contributing.md
- [ ] Every JSDoc tag the manifest needs: `@summary`, `@documentation` (derived, never typed), `@status`,
      `@since` (the version it lands in), `@dependency`, `@slot`, `@event`, `@csspart`, `@cssstate`,
      `@cssproperty`

### **Changesets**

- [ ] Present, with a real bump; never `--empty` and never an empty frontmatter
- [ ] First word is `Fixed:`, `Added:`, `Changed:`, `Removed:`, `Breaking:` or `Deprecated:`; one category
      per file
- [ ] Body is the change, in one or two lines or a short bullet list; the reasoning is in the PR description
- [ ] Bump matches the change: major removes or renames a `_sys`/`_cmp` token or a `stable` component's
      public surface; minor adds a token, mode or component; patch changes a value, fixes a bug, or is
      tooling. Both packages are `fixed` to one version, so any bump moves both
- [ ] Each round of changes on a shipped component takes its own patch rather than folding into the
      earlier bump

### **Vocabulary**

- [ ] Uses `packages/components/GLOSSARY.md` terms: *Cornerstone Components* for the library and *Cornerstone*
      only for the whole; *ministry* and *sub-brand*, not tenant; *palette* and *theme* as separate axes;
      *brand* for the variant and *primary* only for the action colour
- [ ] Comments carry the non-obvious *why* in one line; a comment restating the next line is deleted

### **Pull request**

- [ ] The description stands alone: what moved, what was considered and rejected, what was verified
- [ ] Every file in `gh pr diff --name-only` is accounted for in the body

---

## Mined from merged PR history

Rules derived from 46 merged PRs (#49–#169). Each carries the PRs it came from. The first two are the most
repeated defect in this repository's history.

- **AI failure mode: the changeset essay.** A `.changeset/*.md` body is one or two lines or a short bullet
  list, leads with its category prefix, and carries no rationale paragraph, no "Verified" line, no contrast
  ratios, no table beyond a removed-to-replacement mapping, and no recap of review rounds. Flag a body over
  roughly 60 words. One category per file: a PR that both adds and fixes writes two changesets rather than
  nesting one under the other, because `remark-changelog.js` reads only the first line's prefix.
  Twenty-two changesets in this range ran 150 to 500 words and were trimmed after release, several within a
  day of the rule landing in `CLAUDE.md`.
  <!-- evidence: PR #50, #51, #52, #54, #55, #56, #57, #83, #84, #85, #86, #88, #89, #90, #91, #92, #93, #110, #112, #113, #114, #116, #130, #137, #138, #139, #141, #162 -->
- **The bump matches what the package ships.** A diff confined to `plugins/**`, `.github/**`, `docs/**`,
  `CLAUDE.md` or `.changeset/*.md` is a `patch` with a one-line body, never `minor` and never an empty
  frontmatter (an empty changeset writes nothing to the changelog, so its prose is dead text). `minor` is a
  new token, mode or component. A body that says `BREAKING` while the frontmatter says `minor` is blocked
  until `CLAUDE.md` records a pre-1.0 clause: #50 and #55 shipped `_sys`/`_cmp` removals as minor by
  agreement in the thread, and `CLAUDE.md` still says major. Docs pages reach the package only through
  `SKILL_PAGES` and `components/*.md`; a docs-only changeset says in its first line whether package output
  changes.
  <!-- evidence: PR #50, #55, #76, #83, #84, #85, #86, #88, #89, #90, #91, #97, #98, #100, #103, #109, #110, #137, #140, #161 -->
- **One concern per PR, and the diff is the one the body describes.** A fix found while doing something
  else gets its own PR and changeset. Reject a body with an "Also in this PR" section, a changeset that
  needs two prefixes, a `CLAUDE.md` policy edit riding on a feature, or a diff whose
  `gh pr diff --name-only` lists files the body never mentions. Never push to a branch after its PR merges;
  a follow-up is a new branch off `origin/main`. Base every PR on `main`: a stack retargeted onto a
  reviewed branch carried eight PRs under one two-file review.
  <!-- evidence: PR #55, #83, #84, #85, #137, #138, #153, #162, #165, #169 -->
- **AI failure mode: "verified" by a command that does not exercise the change.** A verification section
  names the command that runs the changed path, and cites a tool only for what it measures:
  `npm run validate` proves aliasing legality, `scripts/token-hash.mjs` proves Figma parity, `npm pack`
  never runs the provenance check, and none of them measures contrast (a 1.46:1 indicator shipped behind
  "0 errors, 0 warnings"). For a markdown-only or plugin-only diff, verification is loading the plugin or
  a `grep -rn` for dangling references, not `npm run build`.
  <!-- evidence: PR #50, #51, #52, #53, #54, #76, #81, #83, #110, #112, #114, #137 -->
- **Deferred work needs an issue number before the thread resolves.** A body that lists review findings
  under "follow-up commits coming" or defers with "tracked separately", or a thread that ends on "latent
  risk" or "possibly worth its own fix", gets a `#NNN` or `UIUX-NNN` per item, or the fix lands in the
  diff. Of the items deferred this way across eleven PRs, one landed.
  <!-- evidence: PR #49, #50, #51, #52, #53, #88, #89, #90, #91, #92, #94 -->
- **Prose next to changed behaviour is part of the diff.** A PR that changes how releases, the changelog
  or a directory layout works updates the instructions describing the old way in the same diff.
  `packages/components/CLAUDE.md` still tells an agent to hand-edit an Unreleased changelog section that
  `::changelog` replaced; `contributing.md`, which ships inside the agent skill, still names `docs-site/`;
  a dependency's major version written into prose went stale on the next bump.
  <!-- evidence: PR #81, #94, #138, #163 -->
