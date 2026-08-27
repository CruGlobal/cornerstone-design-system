---
"@cruglobal/cornerstone-design-system": minor
---

Add the `cornerstone-dev` plugin — the contributor tier from the persona architecture spec (#67) — and register it in the `cru` marketplace.

It ships as a bundle-only plugin for now: no agents or skills of its own, just a `dependencies` array pulling in `cornerstone@cru` (the front door), `cornerstone-skills@cru` (the forked engineering skills), and `figma@claude-plugins-official`. Installing it is how a contributor gets all three at once, which is why the tier exists — the four contributor personas move in on top of this in follow-up PRs.

`allowCrossMarketplaceDependenciesOn: ["claude-plugins-official"]` is added to `marketplace.json` because the `figma` dependency crosses marketplaces, and dependencies on an unlisted marketplace are blocked at install rather than warned about.
