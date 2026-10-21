---
'@cruglobal/cornerstone-components': minor
---

Breaking: Components no longer set unprefixed custom properties on their host for app CSS to inherit. `<cs-page>` drops `--scroll-margin-top` (anchors still clear the header) and stops writing a footer height, and `<cs-qr-code>`'s `--corner-color` is now the documented `--cs-qr-code-corner-color`.
