---
'@cruglobal/cornerstone-components': patch
---

Changed: `tools/daisyui.mjs` generates the token package's daisyUI themes from the brand knobs, and `npm run verify` checks them. `tools/palette.mjs` now exports `buildRamps` so both tools share one source. The generated palettes and themes don't change.
