---
'@cruglobal/cornerstone-components': patch
---

Fixed: `check-docs-url.js --fix` now re-points today's docs address after a move, and a second run no longer doubles the path. `KNOWN_ROOTS` lists the current `homepage`, and the check fails when it is missing.
