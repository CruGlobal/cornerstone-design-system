---
'@cruglobal/cornerstone-components': patch
---

Fixed: a `cs-dropdown` reopened during its hide animation listens for Escape and clicks outside again, and fires `cs-after-show` rather than `cs-after-hide`.
