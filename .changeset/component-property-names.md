---
'@cruglobal/cornerstone-components': minor
---

Breaking: Every component custom property is renamed to `--cs-<component>-<property>` or one of seven shared names (`--spacing` on `<cs-card>` is now `--cs-card-spacing`), and none is set on the host, so each can be set on the page, a section or one element. The layout utilities' `--min-column-size`, `--flank-size` and `--content-percentage` become `--cs-grid-min-column-size`, `--cs-flank-size` and `--cs-flank-content-percentage`, and the themes no longer set `--cs-tooltip-*`, so your own CSS that reads one outside a `<cs-tooltip>` gets nothing.
