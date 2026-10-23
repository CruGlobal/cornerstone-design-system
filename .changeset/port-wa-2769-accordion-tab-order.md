---
'@cruglobal/cornerstone-components': patch
---

Fixed: every enabled `cs-accordion-item` header is in the page's tab sequence, following the W3C accordion pattern, instead of a roving tabindex that exposed only one. Arrow keys, Home and End still move between headers.
