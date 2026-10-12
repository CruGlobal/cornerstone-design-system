---
'@cruglobal/cornerstone-components': patch
---

Fixed: Component tests no longer wait a fixed time for an animation or a frame. They finish the animation, or step a faked frame clock, so a busy CI runner can't fail them, and check each animation's configured length against its duration token instead of timing it. Tests only; the published package is unchanged.
