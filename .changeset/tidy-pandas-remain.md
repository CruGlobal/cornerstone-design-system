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

Categories are now carried the way upstream carries them, because it is the better pattern: the category
name is screen-reader-only and each entry takes its category as the bullet itself — a wrench beside a line
says "bug fix" without a heading repeating it fifteen times. `build` is the wrench, `cleaning_services` the
broom, `add` the plus, `warning` the triangle and `close` the cross; they are Material Symbols equivalents of
upstream's Font Awesome names, since the fork changed icon libraries, and every one is verified to exist —
a Material Symbols name that does not renders nothing at all rather than falling back.

Upstream's one weakness is that nothing explains the wrench: there is no legend on their page. `::changelog-legend`
renders one here from the same table the bullets read, listing only the categories the page actually uses.

Issue and pull request references are badges rather than bracketed numbers, carrying GitHub's own iconography
— `adjust` for an issue, `merge` for a pull request — and the reference moves to the end of the summary, where
it stops separating the reader from the sentence. A generated release keeps its bump badge and plain bullets:
a changeset records the bump it causes, not whether each entry fixed something or added it, and deriving a
wrench from `patch` would be a guess.

Version headings now state their own ids. Astro's slugger drops the dots, so `## 0.1.2` was anchored at
`#012`; a release is the thing people link to on a changelog, so it is `#v0-1-2` now.

Docs-site only: `resources/changelog.md` is not one of the pages `SKILL_PAGES` compiles into the shipped agent
skill, so nothing in the package's output changes.
