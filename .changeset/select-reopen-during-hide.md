---
'@cruglobal/cornerstone-components': patch
---

Fixed: `<cs-select>`, `<cs-tooltip>` and `<cs-popover>` no longer hide their content when reopened during the close animation, and no longer emit `cs-after-show` when closed during the open animation. Cancelling `cs-hide` on `<cs-select>` now keeps it open.
