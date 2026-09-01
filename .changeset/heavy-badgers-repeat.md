---
"@cruglobal/cornerstone-components": patch
---

Every component's `@since` now reads `0.1`, the version it actually shipped in.

The tag ranged from `1.0` to `3.11` across the 70 components — 100 of the 140 occurrences said `2.0` — and
none of those numbers were this package's. They were Web Awesome's, inherited by the fork and never
rewritten, which the changelog already noted from the other direction: "the version resets to `0.1.0`;
`3.11.0` was Web Awesome's number, inherited rather than chosen."

It is not an internal detail. `@since` reaches the Custom Elements Manifest and from there the Since badge
on all 70 reference pages and the browse grid's cards, so the documentation told a consumer on `0.1.2` that
`<cs-button>` had been available since `2.0`. The scaffold template in `scripts/plop/templates` has emitted
`@since 0.1` since it was written, so the sources were the ones out of step with the convention.

Every component here arrived in one commit and first shipped in `0.1.0`, so they all take the same value.
That makes the browse grid's "Release Date" sort a no-op for now — the honest state of a library one minor
version old — and it starts distinguishing components the first time one lands in a later release.
