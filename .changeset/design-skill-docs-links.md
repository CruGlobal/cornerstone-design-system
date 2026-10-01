---
'@cruglobal/cornerstone-components': patch
---

Fixed: the `cornerstone-design` agent skill's links to the documentation site. Fourteen of them pointed under a `/docs/` path the site does not have, so each one was a 404. `verify:skills` now checks absolute docs links as well as relative ones.
