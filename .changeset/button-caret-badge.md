---
'@cruglobal/cornerstone-components': patch
---

Fixed: `cs-button` with `with-caret` keeps a `cs-badge` in its `end` slot, so it shows and its text joins the button's accessible name; the caret still hides anything else there.
