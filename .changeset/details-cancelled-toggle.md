---
'@cruglobal/cornerstone-components': patch
---

Fixed: `<cs-details>` now finishes opening when a `cs-hide` is cancelled mid-animation, and finishes closing when a `cs-show` is cancelled mid-animation. Before, it stayed stuck in its animating state and never fired `cs-after-show` or `cs-after-hide`.
