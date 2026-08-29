---
"@cruglobal/cornerstone-design-system": patch
---

Split the palette generator's pure core out of its CLI, and gate the committed stylesheets against it in CI.

`tools/palette.mjs` did two jobs in one file: reading its inputs from disk and generating a brand's palette, variants and theme from them. Two `readFileSync` calls at module scope — the reference palette it derives the luminance ladder from, and the reference theme it carries the mode-independent block from — were the only thing that made any of it Node-only. `tools/palette-core.mjs` now takes both stylesheets as arguments and is a pure function of them; `palette.mjs` is the Node wrapper that reads the three inputs, prints the report and writes the result. The colour maths is copied verbatim rather than retyped, and regenerating Cru reproduces all three committed stylesheets byte-for-byte.

The reason for the split is that the same generator has to run in a browser: the planned theme-generator UI on the documentation site imports the core directly and passes the reference stylesheets in with Astro's `?raw`. `deriveSpec()` is exposed separately because deriving the ladder is the expensive part and a UI turning knobs wants to do it once.

A new `generated-theme` CI job closes the gap that made those files untrustworthy. They are generated but committed, and nothing regenerated them, so nothing stopped the knobs in `tools/brands/<brand>.json` and the stylesheets they produce from drifting apart. The job regenerates every brand and fails on a diff, which catches both directions — knobs changed without regenerating, and a generated file edited by hand. It loops over `tools/brands/*.json` rather than naming brands, so a second brand is covered the day its knobs land, and it runs in seconds behind its own path filter rather than inside the ~35 minute component gate.
