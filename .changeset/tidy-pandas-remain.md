---
"@cruglobal/cornerstone-components": patch
---

The changelog page shows released versions instead of one `## Unreleased` block, and its categories render.

- `0.1.1` and `0.1.2` are generated from the CHANGELOG changesets already writes, so a version reaches the page by being released
- `0.1.0` stays hand-written — it is the Web Awesome fork, and predates changesets
- Each entry carries its category as its bullet icon, with a legend explaining them
- Issue and pull request references are badges
- Duplicate category blocks merged, an orphaned bullet reattached, and version anchors stated: `#v0-1-2`, not `#012`

Docs-site only — `resources/changelog.md` is not compiled into the shipped agent skill.
