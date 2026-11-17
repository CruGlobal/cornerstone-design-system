---
'@cruglobal/cornerstone-components': patch
---

Fixed: `<cs-animation>` now rebuilds its animation when `iterationStart` (`iteration-start`) changes after the animation exists. Before, the new value was ignored until another option changed.
