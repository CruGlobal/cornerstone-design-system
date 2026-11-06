---
'@cruglobal/cornerstone-components': patch
---

Fixed: `cs-option` no longer waits on a `cs-combobox` element that is never registered, a promise that held a callback per option for the life of the page. Its parent lookups now name `cs-select` alone.
