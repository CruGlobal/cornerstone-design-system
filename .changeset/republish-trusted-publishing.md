---
"@cruglobal/cornerstone-design-system": patch
---

Fix the release pipeline so the package publishes via npm trusted publishing (OIDC). The previous version was versioned but never published because the publish step failed authentication and an empty changeset then blocked the retry. This patch routes the release through the normal changesets flow.
