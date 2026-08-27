---
---

Fix base-path handling for navigation links on the documentation site. No token API change — the docs
site is not published, and `@cruglobal/cornerstone-design-system` ships `build/`, `tokens/` and
`libraries/`, none of which this touches.
