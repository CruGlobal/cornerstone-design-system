---
"@cruglobal/cornerstone-design-system": patch
---

Record the token-shape mapping between the generator's output and the published package at `docs/research/token-shape-mapping.md`.

#117 settled that the generator becomes the single source and this package becomes one of its outputs. #118 asked what that costs in token shape, and #121 waits on the answer. The two DTCG trees share **zero token names** — 1,188 in `packages/tokens/tokens/` against 454 in the generator's `tokens/cru/`, with no overlap even after stripping the leading namespace segment. `_ref`/`_sys`/`_cmp` and `palette`/`roles`/`foundation`/`theme` are not a renaming of one another: the generator interposes a role→hue layer this package does not have, has no component layer for `_cmp`'s 393 tokens, has no `fl` brand, replaces the state axis (`hover`/`pressed`/`focus`) with an emphasis axis (`quiet`/`normal`/`loud`), and models light/dark as a colour-only modifier — which cannot express the three `fl` typography tokens that already vary by mode here.

Where a semantic mapping can be built by hand, the values disagree: 7 of 37 pairs agree in `cru-light`, 2 of 37 in `cru-dark`, and the ones that agree are the brand knob hexes rather than anything derived. The hue ramps overlap on 18 of 180 entries — one key colour per hue, landing at a different, luminance-determined step in each tree.

The brief also records the two facts the breakage decision turns on: nothing in this repo consumes the published variables (zero `--sys-`/`--cmp-`/`--ref-` references under `packages/components/src`, against 104 files using `--cs-`), and `tokens/` is itself published through `exports`, so the namespace strings are a contract alongside the CSS.

Research only — no token, build or tooling change.
