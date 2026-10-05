# Documentation & Agent Skills — Focus Areas

`packages/docs` is an Astro/Starlight site deployed to GitHub Pages and never published. Its pages are
also package output: `SKILL_PAGES` in `packages/components/scripts/agent-skill.js` and every
`components/*.md` compile into the agent skills and `llms.txt` that `@cruglobal/cornerstone-components`
ships. **A page is finished when nothing on it can drift**: it is generated from the source it describes,
or a check fails when it stops being true.

**Trigger this review when the diff touches** `packages/docs/**`, the skill generators
(`scripts/agent-skill*`, `scripts/design-skill*`, `scripts/llms.js`), `check-docs-url.js`,
`build-tools/site-url.js`, or any line carrying `SKILL_PAGES`, `{.example`, `:::`, `hasAnatomy`, `remark`,
`homepage`, `cruglobal.github.io`, `llms.txt` or `@documentation`.

---

**Generated beats hand-maintained**

Navigation is built from front matter. Every component's API reference is rendered from the Custom
Elements Manifest by `remark-component-api.js`. Released changelog entries render from `CHANGELOG.md`
through `::changelog`; only the 0.1.0 fork entry is hand-written. Section indexes list their own
directories. Look for: a hand-written API table on a component page; a hand-edited "Unreleased" changelog
section; a list a plugin could have generated. A hand-maintained list is accepted only with the sentence
that says why generation was impossible.

**Which pages ship**

A change to a `SKILL_PAGES` page or a `components/*.md` page changes `@cruglobal/cornerstone-components`'
output and takes a changeset like code does. A change to any other page does not reach the package; its
changeset says so in its first line.

**Examples are live, and there are hundreds**

A fence flagged `{.example}` renders a running component with a resizer and theme toggles, and is copied
verbatim into the skill. An example that no longer runs still renders, just wrongly, and nothing logs.
Look for: a fence using a component the library does not ship (`check-components.js` catches the tag; it
cannot catch a prop that does nothing); a value appended to `var(--cs-shadow-m)` (the shorthand already
ends in a colour, so the declaration is invalid); an icon name not in Material Symbols (renders nothing).
When a component page changes, the PR says it loaded the page.

**Directives and fences the plugins define**

Starlight knows `note`, `tip`, `caution` and `danger`. Everything else (`:::added`, `::changelog`,
`::roadmap`, `{.example .anatomy}`) is a remark plugin in `packages/docs/src/plugins/`. A new `:::name`
without a handler renders a bare `<div>` for the page's whole life. A construct the plugin set does not
handle needs the plugin and an assertion in `scripts/check-pages.js` against the built HTML in the same
diff.

**One address, one base path**

Every URL derives from `packages/components/package.json`'s `homepage` through `build-tools/site-url.js`;
`check-docs-url.js` fails the build on a literal, but it globs `packages/components` only. Every site path
(`href`, `src`, `value`, redirect, sidebar link) is built with `path()` from `src/site-sections.js` in
Astro code or `DOCS_BASE_PATH` in remark plugins; a bare `/components` is a 404 under the Pages base path
and renders fine on a developer's machine. Repository links derive from `package.json`'s `repository`, as
`remark-roadmap.js` does.

**The anatomy renderer is roadmap**

Twenty-six pages flag an anatomy example and `check-anatomy.js` validates the flag, but nothing renders it
(UIUX-118). Describe it in the future tense; do not add a page that depends on it.

**The checks are the gate**

`npm run verify --workspace cornerstone-docs-site` runs Prettier, `astro check`, the build, then
`check:assets`, `check:pages`, `check:tokens`, `check:components` and `check:anatomy`. A page is not
"working" until that ran. Each check asserts an invariant over the built output; a diff that narrows one to
an allowlist is a finding.

**Storybook is roadmap** (UIUX-117, UIUX-91). Future tense.

---

### Documentation Checklist

- Nothing hand-maintained that a plugin generates: Yes/No/N/A
- Shipped pages (`SKILL_PAGES`, `components/*.md`) identified and the changeset says so: Yes/No/N/A
- Every changed example loaded and its computed style checked, not only built: Yes/No/N/A
- New directives have a plugin and a `check-pages.js` assertion: Yes/No/N/A
- No literal address or bare root path: Yes/No/N/A
- `npm run verify` for the docs site ran: Yes/No/N/A

---

## Mined from merged PR history

Rules derived from 46 merged PRs (#49–#169). Each carries the PRs it came from.

- **The base path flows through one helper for every path, not only assets.** `href`, `src`, `poster`,
  `cs-dropdown-item` values, redirects and sidebar links all 404'd on the first Pages deploy; #97 needed a
  second commit for the `value=` case the first missed; #100 was a third shape of the same bug. Any
  `/`-leading literal under `packages/docs/public/**` or `packages/docs/src/**` derives from `path()` or
  `DOCS_BASE_PATH`. `check-asset-paths.js`'s regex enumerates section slugs by hand while
  `site-sections.js` owns that list; derive one from the other.
  <!-- evidence: PR #94, #97, #98, #100 -->
- **A directive or example is shipped output; check that it rendered, not that it built.** `:::added` and
  its siblings shipped as unlabelled `<div><ul>` through three releases before anyone looked; an
  `{.example}` fence with an invalid shadow declaration shipped into the skill. A new `:::name` needs a
  handler in `src/plugins/` and a `check-pages.js` assertion in the same diff; a changed example is loaded
  in a browser.
  <!-- evidence: PR #138, #162, #169 -->
- **Literal links and stale paths outside the check's reach.** `check-docs-url.js` covers
  `packages/components` only, so `.github/ISSUE_TEMPLATE/config.yml`, `support.md` and `usage.md` carried
  hard-coded repository URLs that were fixed by hand; `contributing.md`, which ships in the skill, still
  named `docs-site/` after the move to `packages/docs`; a dependency's major version in `CLAUDE.md` went
  stale on the next bump. A move or rename greps `packages/docs/src/content/docs/**` and both `CLAUDE.md`
  files for the old path; repository links derive from `package.json`; `CLAUDE.md`'s claim that the check
  catches a literal "anywhere" is narrowed to what it globs.
  <!-- evidence: PR #81, #94, #110, #137, #161, #162, #165 -->
