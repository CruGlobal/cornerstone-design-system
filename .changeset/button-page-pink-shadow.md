---
'@cruglobal/cornerstone-components': patch
---

Fixed: the button page's Customizing example now builds its pink shadow from the shadow geometry longhands. It appended a colour to `--cs-shadow-m`, which already ends in one, so the declaration held two colours, was invalid, and the shadow never rendered.
