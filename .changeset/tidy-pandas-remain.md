---
"@cruglobal/cornerstone-components": patch
---

The changelog page now shows released versions, and its categories render at all.

Two defects, one page. **Nothing was cut into releases**: everything sat under a single `## Unreleased` while
`0.1.0`, `0.1.1` and `0.1.2` shipped, on a page whose own intro promises that "each release on this page
follows the Keep a Changelog convention". **And every category was invisible** — `:::added`, `:::changed`,
`:::removed`, `:::fixed` and `:::breaking` are not Starlight aside types, so remark-directive rendered them as
bare `<div>`s with no label and no styling. A reader saw one undifferentiated wall of bullets, which is how
three separate `:::changed` blocks, three `:::fixed`, two `:::removed` and one block holding nothing but an
orphaned sub-bullet all survived in the same section unnoticed.

`0.1.1` and `0.1.2` are now generated. changesets already writes `packages/components/CHANGELOG.md` at every
bump, and this page had been restating it by hand — so `remark-changelog.js` renders it instead, and a version
reaches the page by being released rather than by being remembered. The commit hash and the "Thanks
@maintainer!" line are dropped; the pull request link stays, because that is where the reasoning is.

`0.1.0` stays hand-written below the marker: it is the Web Awesome fork, 48 entries that predate changesets
and exist in no generated file. Its duplicate blocks are merged to one per category, ordered breaking-first
because that is what a reader upgrading needs first. The orphaned bullet — "the real event surface is 41
classes, not 58" — is reattached to the entry it belongs to rather than the one it had drifted next to, and a
`[]` left by an unwritten link is gone.

Version headings now state their own ids. Astro's slugger drops the dots, so `## 0.1.2` was anchored at
`#012`; a release is the thing people link to on a changelog, so it is `#v0-1-2` now.

Docs-site only: `resources/changelog.md` is not one of the pages `SKILL_PAGES` compiles into the shipped agent
skill, so nothing in the package's output changes.
