---
'@cruglobal/cornerstone-components': patch
---

Fixed: CI runs the component tests in Playwright's container image instead of installing browser libraries on each shard, so a slow Ubuntu mirror no longer stalls them. No package output changes.
