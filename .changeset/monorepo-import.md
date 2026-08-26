---
---

Bring the component library and its documentation site into this repo as sibling packages.

No release: `@cruglobal/cornerstone-design-system` publishes `build/`, `tokens/` and `libraries/`, and none of them change here. What changed in that package is its `package.json` — the changeset scripts and dependencies moved to the workspace root — which is tooling rather than published output.

`@cruglobal/cornerstone-components` is in `ignore` for now. It has never been published, and whether it goes to npm under a paid org or to GitHub Packages is an open question; until that is settled, `changeset publish` should not try to release it.
