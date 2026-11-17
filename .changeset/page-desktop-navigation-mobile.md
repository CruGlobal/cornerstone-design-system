---
'@cruglobal/cornerstone-components': patch
---

Fixed: `<cs-page>` now hides content in the `desktop-navigation-header`, `desktop-navigation` and `desktop-navigation-footer` slots on mobile. Before, it stayed beside the main content, and the docs said to add `cs-desktop-only` to it.
