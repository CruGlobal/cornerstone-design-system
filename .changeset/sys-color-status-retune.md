---
"@cruglobal/cornerstone-design-system": patch
---

Retarget `_sys.color` values. No token names change; only what they alias.

**Status colour accessibility fixes.** Every status pair now meets WCAG AA in all four modes (previous minimums in brackets):

- `fl-light` / `fl-dark`: `on-<status>-container` had been aliased to the *same* `_ref` as `<status>-container` for all four statuses, rendering text and icons invisible (1.00:1). Now 13.5–16:1.
- `fl-light`: `on-<status>` was `contrast/white` over pale mid-tones — danger measured 1.82:1. Now aliases the hue's `/900`, giving 5.8–8.3:1.
- `cru-dark`: `on-danger` was 3.78:1. Now 4.84:1.
- 11 `<status>-outline` tokens were aliased identically to their own container across `cru-dark`, `fl-light` and `fl-dark`, so the border was invisible.

**Dark-mode status retune.** `cru-dark` and `fl-dark` filled status colours were retargeted for consistent perceptual lightness — the L\* spread across the four statuses drops from 18 points to 7. `cru-dark` success moves off the pastel `cru/mint` ramp to `cru/green`, which is what made it read sage; its container and outline moved with it.

**FamilyLife retune.** `fl-dark` `<status>-container` sat at `hue/900` (L\* 6–15, effectively black) and is now `/800`, or `/600` for `dark-green`. `fl-dark` fills moved off the desaturated dark steps — FL ramps lose chroma as they darken, so anything past `/500` reads muddy. `fl-light` filled L\* spread drops from 37 to 15.

**MOA colour changes** carried over in the same sync: `cru-light` `secondary.*` moves from `orange` to `graphite`, `link.*` from `navy` to `turquoise`; `cru-dark` `link.*` to `sky`; plus `on-secondary`, `secondary-container` and `on-secondary-container` retargets.

`_cmp` tokens for `breadcrumb`, `button`, `card`, `links`, `menu` and `paper` were retargeted onto the renamed `_sys` roles in the same change — 18 aliases in total — which is what keeps `npm run validate` passing.
