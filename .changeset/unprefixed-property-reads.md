---
'@cruglobal/cornerstone-components': patch
---

Fixed: Components no longer read unprefixed custom properties a page happens to define, such as `--color` in `<cs-color-picker>` and `--box-shadow` in `<cs-input>`. A one-row `<cs-textarea>` is now as tall as an input, and a dropdown submenu closes over `--cs-hide-duration` instead of the show duration.
