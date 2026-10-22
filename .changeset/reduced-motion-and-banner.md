---
'@cruglobal/cornerstone-components': patch
---

Fixed: Every animation that reads `--cs-show-duration` or `--cs-hide-duration` now finishes at once when the user prefers reduced motion, including `<cs-time-input>`'s popup. Anchors in a `<cs-page>` clear a sticky banner as well as the header, and `<cs-skeleton>` stays visible in forced colors mode.
