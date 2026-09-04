---
"@cruglobal/cornerstone-components": patch
---

Fixed: The changelog page lists released versions instead of one `## Unreleased` block.

- `0.1.1` and `0.1.2` are generated from `CHANGELOG.md`; `0.1.0` stays hand-written as the fork
- Each entry's category renders as its bullet icon, with a legend
- Issue and pull request references render as badges
- Duplicate category blocks merged, and version anchors fixed to `#v0-1-2`
