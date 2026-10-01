---
'@cruglobal/cornerstone-components': patch
---

Fixed: `check-docs-url.js --fix` now re-points today's docs address after a move. `KNOWN_ROOTS` lists it, and the check fails when the current `homepage` is missing from that list.
