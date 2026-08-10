---
"@cruglobal/cornerstone-design-system": patch
---

Fix `_sys.number.space.none` and `cru-dark` body font weights.

**`space.none` was not zero.** It aliased `_ref.number.space.2` in `cru-dark`, `fl-light` and `fl-dark` — only `cru-light` was correct — so a token named `none` emitted `2px` in three of four modes. Any component using it for zero padding or gap picked up 2px instead. Now `_ref.number.space.0` everywhere, emitting `0px`.

**`cru-dark` body font weights** were `500` for `typography.body.{lg,md,sm}` where every other cru mode uses `400`, so dark-mode body copy rendered semi-bold. Now `400`, matching `cru-light`. The `500` weight remains correct for the `fl` modes, where Akkurat needs the extra weight at body sizes.

After this change all four `sys/number` subtrees match the Figma file exactly.
