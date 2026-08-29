# Map the generator's token shape onto the published package's

**Status:** research only. Answers #118; feeds the decision in #121. Nothing implemented, nothing changed in either token tree.
**Date:** 2026-08-29
**Question:** do `palette`/`roles`/`foundation`/`theme` and `_ref`/`_sys`/`_cmp` map onto each other cleanly, partially, or not at all?
**Trees compared:**

- **A — the published package.** `packages/tokens/tokens/` on `main` — `ref.json`, `sys/{cru,fl}-{light,dark}.json`, `cmp/*.json` (12 files). Style Dictionary 5.x, published as `@cruglobal/cornerstone-design-system@0.6.0`.
- **B — the generator's output.** `packages/components/tokens/cru/` in the `palette-token-generator` worktree — `palette`, `roles`, `foundation`, `theme`, `cru.resolver.json`, `terrazzo.config.js`. Uncommitted; read, not modified.

**Also inspected:** `packages/tokens/build.mjs`, `packages/tokens/scripts/validate-tokens.mjs`, `packages/tokens/package.json`, `packages/tokens/CHANGELOG.md`, `packages/components/tools/{tokens,tokens-core,palette-core}.mjs`, `packages/components/tools/brands/cru.json`, the three uncommitted changesets in the generator worktree, and issues #117, #118, #121.

---

## Verdict

**Not at all. The two trees share zero token names, and where a human can construct a mapping by hand, the values disagree.**

| Measure | Result |
| --- | --- |
| A's distinct token names | **1,188** (1,887 definitions across the four modes) |
| B's distinct token names | **454** (524 definitions), for the `cru` brand only |
| Names appearing in both | **0** |
| Names appearing in both after stripping the leading namespace segment | **0** |
| A's `_cmp` layer reproducible from B | **0 of 393** — B has no component layer of any kind |
| A's `fl` brand reproducible from B | **0 of 101** `_ref.color.fl.*` — B has no `fl` knob file |
| A's `_sys.color` with any semantic counterpart in B | **37 of 88** (my classification, table below) |
| …of those 37, values that **agree** | **7 of 37** in light, **2 of 37** in dark |

The single fact that most determines whether the published package can survive unbroken:

> **Nothing consumes the published package. The component library does not import it, and does not reference a single one of its variables.**
>
> `packages/components/package.json` has no dependency on `@cruglobal/cornerstone-design-system`. Zero files under `packages/components/src` contain `--sys-`, `--cmp-` or `--ref-`; 104 files contain `--cs-`. The only in-repo references to A's variables are prose — `README.md`, two plugin command files, and the changelog.

So the cost of breaking A is borne entirely by external consumers, none of whom are visible from this repo. The cost of *not* breaking it is that the generator would have to grow a component layer, a second brand, a state axis, an inverse family and a numeric-ladder emitter it does not have — and would still have to reproduce values it currently derives differently.

Two supporting facts the decision should carry:

1. **A has already shipped a breaking change as a `minor`.** PR #55 restructured `_cmp.accordion`, removing three names, and released it as `0.x` minor on the explicit grounds that *"this package is still pre-1.0, where semver permits breaking changes in a minor release"* (`packages/tokens/CHANGELOG.md`). The precedent for breaking A exists and is on the record.
2. **A's public surface is larger than its CSS.** `package.json` `files` includes `tokens/`, and `exports` maps `"./tokens/*.json"`. The DTCG source files — and therefore the literal strings `_ref`, `_sys`, `_cmp` — are a published contract, not just an internal authoring convention. Renaming the namespaces breaks importers of the JSON as well as readers of the CSS variables.

---

## 1. Coverage, both directions

### 1a. What A has that B cannot currently produce

Every one of A's 1,188 names, on a strict reading — there is no name overlap. The useful question is *semantic*: could B supply the value under a rename? Grouped by why not:

| A's tokens | Count | Why B cannot produce them |
| --- | ---: | --- |
| `_cmp.*` — all 12 component files | **393** | **B has no component layer.** Its four files stop at `theme`. Nothing in `tokens-core.mjs` emits per-component ids. The nearest thing is a handful of `foundation.form-control-*` / `tooltip-*` metrics (4 tokens), and 33 further `--cs-form-control-*` / `--cs-tooltip-*` / `--cs-panel-*` / `--cs-button-*` names that are deferred formulas (§4). |
| `_ref.color.fl.*` | **101** | **B has no `fl` brand.** `tools/brands/` contains only `cru.json`. |
| `_ref.string.font-family.*` | **125** | A carries a font table for **eight** brand families (`aia`, `cru`, `fl`, `jfp`, `josh`, `mil`, `unto`, plus `system`) × brand/product × 8 slots. B's `foundation` has 4 font families, for one brand. |
| `_ref.color.cru.*.{50…900}` | **180** | Hue *names* all exist in B (18 of 18), but the **step scale is different and incompatible**: A has 10 steps `50,100…900`; B has 11 steps `05,10,20…90,95`, plus `base` and `key`. Only the key colour survives — see §3. |
| `_ref.color.{cru,fl}.contrast.*` | **42** | White/black/transparent plus an 18-step alpha ladder per brand. B has no opacity ladder and no `transparent` token. |
| `_ref.number.*` + `_sys.number.*` | **273** | A publishes **resolved numeric ladders**; B publishes **scale knobs** and leaves the ladder as a CSS formula. This is the formula problem — §4. |
| `_sys.color.*` with no counterpart | **49 of 88** | Detailed below. |
| `_sys.string.font-family.*` | **7** | A's 7 typographic slots (`display`, `headline`, `title`, `pretitle`, `label`, `body`, `button`) vs B's 4 (`body`, `heading`, `code`, `longform`). Different slot vocabulary, and `code`/`longform` have no A equivalent at all. |

The 49 `_sys.color` names with no counterpart in B, grouped — the pattern matters more than the list:

| Group | Count | Names |
| --- | ---: | --- |
| **Interaction-state variants** | **28** | `{primary,secondary,information,success,warning,danger}.{hover,pressed,focus}`, `{success,warning}.on-pressed`, `action-surface.{hover,pressed,selected}`, `outline.{hover,focus}`, `link.{hover,focus,visited}` |
| **`inverse` / `on-inverse` family** | 9 | `inverse-{surface,surface-dim,on-surface,on-surface-variant,primary}`, `{information,success,warning,danger}-on-inverse` |
| **The `secondary` role** | 4 | `secondary.default`, `on-secondary`, `secondary-container`, `on-secondary-container` |
| **The `action` family** | 3 | `action`, `action-hover`, `action-surface.default` |
| Singletons | 5 | `primary-strong.default`, `disabled.default`, `transparent`, `text.disabled`, `outline.disabled` |

The 28 interaction-state tokens are the structurally important group: **B has no state axis at all.** Its third axis is emphasis (`quiet`/`normal`/`loud`), not state. There is exactly one focus token in B (`theme.color.focus`) against A's six per-role focus tokens plus `outline.focus`.

### 1b. What B has that A has no equivalent for

| B's tokens | Count | Note |
| --- | ---: | --- |
| `role.color.*` — the whole layer | **104** | A has no role→hue indirection. `_sys` aliases `_ref` directly, so "which hue is `danger`" is not a token in A, it is a fact spread across 4 sys files. |
| `palette.color.purple.*` | 13 | Synthesized by the generator (`brand.synthesized.purple`). A has no purple ramp. |
| `role.color.highlight.*` + `theme.color.highlight.*` | 13 + 9 | The `highlight` role does not exist anywhere in A. |
| `palette.color.*.{05,95}` | 38 | Ramp steps beyond A's range. |
| `palette.color.*.base` and `.key` | 38 | The "key step" concept — which step of the ramp is the brand's own colour. A has no such marker; it is implicit in the `500` convention, which B's own output shows is not actually where the key colour lands (§3). |
| `foundation.*-scale` knobs | 8 | `font-size-scale`, `space-scale`, `border-width-scale`, `border-radius-scale`, `shadow-{offset-x,offset-y,blur,spread}-scale`. A has no knobs — it publishes only the resolved ladders. This is the same fact as §4 seen from the other side. |
| `foundation.transition-{slow,normal,fast}` | 3 | **A has no duration tokens at all.** `_ref` carries only `color`, `number` and `string`, and `value/number/unit` in `build.mjs` has no duration branch. |
| `foundation.focus-ring-{style,width,offset}`, `border-radius-{pill,square}`, `border-style` | 6 | No A equivalent. |
| `theme.color.*` emphasis triples | 63 per mode | The `{fill,border,on} × {quiet,normal,loud}` grid. A's nearest equivalents are `X` / `X-container` / `X-outline` / `on-X` — four names where B has nine, drawn on a different axis. |

---

## 2. Do the namespaces map?

**Partially at best, and every partial mapping breaks somewhere load-bearing.**

| A | B | Verdict |
| --- | --- | --- |
| `_ref` | `palette` | **Partial.** Same 18 cru hue names, same authoring role (raw primitives). Breaks on: step scale (10 vs 11 steps, different numbering), the `contrast`/opacity ladder (A only), `purple` (B only), `base`/`key` (B only), and everything non-colour — A's `_ref` also holds 135 numbers and 125 font strings, which in B live in `foundation` or nowhere. |
| — | `roles` | **No counterpart.** B interposes a role→hue layer that A does not have. This is an *extra* level of indirection, not a rename. |
| `_sys` | `theme` + `foundation` | **Partial, and split across two files.** A's `_sys` is one flat semantic layer holding colour *and* metrics *and* fonts; B splits mode-varying colour (`theme`) from mode-independent everything-else (`foundation`). Breaks on: the third axis (state vs emphasis), the contrast idiom (`on-X`/`X-container` vs `fill`/`border`/`on`), the missing roles both ways (`secondary`, `action`, `inverse` in A; `highlight`, `neutral` in B), and the fact that **`theme` is colour-only by construction** — `tokens-core.mjs` writes `{ theme: { $type: 'color', … } }`, so no non-colour token can vary by mode in B (see §5). |
| `_cmp` | — | **No counterpart.** 393 tokens, no destination. |

Two further mismatches that are not about names:

- **The aliasing contract inverts.** A's `validate-tokens.mjs` enforces `_sys → _ref` only (E1) and `_cmp → _sys` only (E2, with `_cmp → _ref` a warning). B's chain is `theme → role → palette`, four levels deep counting `theme`. Run B's tree through A's validator conceptually and every `theme` token is an E1 violation — it aliases `role`, not `palette`.
- **The type systems differ.** A uses `color` (302+88+314), `number` (135+138+79) and `string` (125+7). `string` is **not a DTCG type**, and A encodes every dimension as a bare `number` with units bolted on by the `value/number/unit` transform at build time. B targets the 2025.10 draft properly: `color` objects with `colorSpace`/`components`, plus `dimension`, `fontFamily`, `fontWeight`, `duration` and `strokeStyle`. Terrazzo rejects hex strings outright, which is why B cannot simply adopt A's encoding.

---

## 3. Values, where a token exists in both

**This is the dangerous section, and the answer is: they mostly disagree.**

There are no shared names, so "exists in both" means my hand-built semantic mapping of A's `_sys.color` onto B's `theme.color` — 37 pairs. Resolving both sides fully (A: `_sys` → `_ref` → hex; B: `theme` → `role` → `palette` → hex):

| Mode | Pairs agreeing |
| --- | --- |
| `cru-light` | **7 of 37** |
| `cru-dark` | **2 of 37** |

The seven that agree in light are exactly the ones that are *inputs* rather than derivations — the brand knob hexes and white:

`primary.default` = `#ffd000`, `danger.default` = `#c23c49`, `information.default` = `#007890`, `success.default` = `#24c976`, `warning.default` = `#f08020`, `background` = `#ffffff`, `surface-bright` = `#ffffff`.

In dark only `primary.default` and `success.default` survive, because A *lightens* its status colours for dark mode (`danger.default` → `#d9868e`, `information.default` → `#00c0d8`, `warning.default` → `#f3984a`) while B keeps `fill-loud` at the key colour and moves the quiet/normal steps instead.

Representative disagreements — every one of these is a live consumer-visible colour change:

| A | A's value | B's nearest | B's value |
| --- | --- | --- | --- |
| `_sys.color.on-surface` (light) | `#000000` | `theme.color.text-normal` | `#1d1d1d` |
| `_sys.color.text.secondary` (light) | `#00000099` | `theme.color.text-quiet` | `#565652` |
| `_sys.color.divider` (light) | `#0000001a` | `theme.color.neutral.border-quiet` | `#e5e6e5` |
| `_sys.color.outline.default` (light) | `#969694` | `theme.color.neutral.border-normal` | `#cacaca` |
| `_sys.color.surface-dim` (light) | `#fbfbfb` | `theme.color.surface-lowered` | `#f0efee` |
| `_sys.color.on-primary` (light) | `#000000` | `theme.color.brand.on-loud` | `#261d00` |
| `_sys.color.link.default` (light) | `#007890` | `theme.color.text-link` | `#008192` |

Note the last row. A's `link` role points at **turquoise**; B's knob file sets `"link": "cyan"`. That is a role reassignment, not a rounding difference — and it is one of only two role→hue disagreements. The role maps otherwise agree:

| Role | A (`cru-light`) | B (`brands/cru.json`) | |
| --- | --- | --- | --- |
| brand / primary | `yellow` | `yellow` | agree |
| information | `turquoise` | `turquoise` | agree |
| success | `green` | `green` | agree |
| warning | `orange` | `orange` | agree |
| danger | `cerise` | `cerise` | agree |
| link | `turquoise` | `cyan` | **disagree** |
| secondary | `graphite` | — | no B role |
| highlight | — | `purple` | no A role |
| neutral | — | `gray` | no A role |

Two structural reasons the ramps cannot agree even where the hue does:

- **The step numbering is not a relabelling.** A's key colour sits at `500` for every hue by convention. In B it lands wherever its *luminance* puts it — `navy` at `10`, `olive-drab` at `20`, `ruby` at `30`, `graphite`/`moss` at `40`, `cerise`/`turquoise`/`vermilion` at `50`, `orange`/`pink` at `60`, `cyan`/`green` at `70`, `mint`/`rose`/`yellow` at `80`, `lemon`/`sky` at `90`, `gray` at `95`. There is no arithmetic that turns one scale into the other.
- Across all 18 shared cru hues, **18 of A's 180 ramp entries** carry a hex that appears anywhere in B's same-named ramp — exactly one per hue, the key colour. The other 162 are regenerated by a different ladder.

A related fact that changes what "breaking a value" costs: **A's build output contains no `var()` references.** `build.mjs` never sets `outputReferences`, so `build/css/cru-light.css` is flat literals — `--cmp-button-primary-filled-color-surface` is `#ffd000`, not `var(--sys-color-primary-default)`. The `_ref` → `_sys` → `_cmp` chain is a source-time discipline with no runtime existence, and the emitted variable names are a consumer's entire override surface. A consumer who retargets `--sys-color-primary-default` today changes nothing.

---

## 4. The formula problem, measured against A

`.changeset/dtcg-token-emitter.md` records that a `--cs-*` declared from `calc()`, `color-mix()`, `oklch()` or `round()` is a *formula*, which DTCG cannot express, and is therefore reported rather than emitted. Re-running `node tools/tokens.mjs cru --dry` confirms the count: **100 deferred — 89 mode-independent, 5 light-only, 6 dark-only.**

**None of A's 1,887 token definitions is itself a formula.** Every value is an alias (703), a hex colour (302), a number (135) or a string (48) — verified by scanning all four modes for `calc(`, `color-mix(`, `oklch(`, `round(` and `var(`. So the formula class does not describe anything A currently publishes.

That is the wrong way round, though. The problem for A is not that its values are formulas; it is that **B's only representation of the categories A publishes is a knob plus a formula.** B emits `foundation.space-scale` (one number) where A publishes 52 space tokens. Quantified:

| B's deferred family | Deferred | A's tokens in that category | A count |
| --- | ---: | --- | ---: |
| `--cs-space-*`, `--cs-content-spacing` | 12 | `_ref.number.space.*` (33) + `_sys.number.space.*` (19) | **52** |
| `--cs-font-size-*` | 13 | `_ref.number.font-size.*` (31) + `_sys.number.typography.*.font-size` (21) | **52** |
| `--cs-shadow-*` (offset/blur/spread/composite) | 15 | *A has no shadow geometry tokens* — only `_sys.color.shadow` | 1 (colour) |
| `--cs-border-radius-*` | 4 | `_ref.number.border-radius.*` (9) + `_sys.number.border-radius.*` (8) | **17** |
| `--cs-border-width-*` | 3 | `_ref.number.border-width.*` (5) + `_sys.number.border-width.*` (4) | **9** |
| `--cs-font-weight-{body,heading,code,longform,action}` | 5 | `_sys.number.typography.*.font-weight` (21) | **21** |
| `--cs-form-control-*`, `--cs-tooltip-*`, `--cs-panel-*`, `--cs-button-*` | 33 | `_cmp.text-field` (20), `_cmp.button` (195), `_cmp.paper` (1) … | part of the 393 |
| `--cs-link-decoration-*` | 2 | `_cmp.links` | 5 |
| `--cs-color-{overlay-modal,overlay-inline,shadow,mix-hover,mix-active}`, dark `surface-lowered` | 11 | `_sys.color.scrim`, `_sys.color.shadow` | **2** |
| `--cs-focus-ring`, `--cs-transition-easing` | 2 | — | 0 |

**Totalling A's exposure:** 273 of A's distinct names (135 `_ref.number.*` + 138 `_sys.number.*`) live in categories where B currently produces a knob and a formula rather than tokens. Of those, three sub-categories are worse than deferred — B has **nothing at all**, not even a knob:

- `letter-spacing` — `_ref` 4 + `_sys` 21 = **25 tokens**. No `--cs-letter-spacing-*` exists.
- `size` (icon / control / avatar ladders) — `_ref` 23 + `_sys` 17 = **40 tokens**. B's only `*-size` name is `tooltip-arrow-size`.
- `opacity` — `_ref` 11 + `_sys` 6 = **17 tokens**. No opacity concept in B.

The remaining 191 are recoverable in principle — a knob plus a documented ratio determines the ladder, and an emitter could flatten it — but doing so is precisely what the changeset argues against, because *"emitting the ramp as static values would throw away the runtime rescaling the library gets from it."* A's consumers, by contrast, get static values today and nothing else. **The two packages want opposite things from the same numbers.**

---

## 5. The four modes

**B carries two: `light` and `dark`, for `cru` only.** They are a DTCG resolver modifier — `cru.resolver.json` declares `modifiers.theme` with `contexts.light` / `contexts.dark`, each a `$ref` into a top-level pointer in `theme.tokens.json`. `palette`, `roles` and `foundation` are `sets`, applied unconditionally.

A carries four: `cru-light`, `cru-dark`, `fl-light`, `fl-dark`, as four separate source files emitted under four `[data-brand][data-theme]` selectors. All four share an identical set of 233 names.

What it would take to cover the other two:

1. **`tools/brands/fl.json`.** Mechanically straightforward — the CI job added by the `palette-generator-core` changeset already loops `tools/brands/*.json` rather than naming brands, so a second brand is covered the day its knobs land. But the knobs cannot express what A's `fl` files actually do:
   - A's `fl` role map picks **non-key steps**: `success.default` is `fl.dark-green.300`, `link.default` is `fl.blue.600`. B's role map is hue-only — `roles: { success: "<hue>" }` — and the step comes from the ramp's own luminance placement. Two roles pointing at the same hue at different steps (fl uses `dark-green` for both `primary` and `success`) has no expression in B's knob schema.
   - A's `fl` hue names (`blue`, `cool-gray`, `dark-green`, `off-white`, `soft-black`, plus `orange`, `pink`, `yellow`) are a different palette from `cru`'s, so `fl` would produce a disjoint `palette.color.*` namespace, not a second mode of the same one.
2. **A brand axis in the resolver.** B's resolver has one modifier (`theme`). Four modes means either a second modifier (`brand`) or a second resolver file per brand. The generated `terrazzo.config.js` hardcodes `SELECTORS(name)` for one brand's selector lists; the emitted CSS has no `[data-brand]` dimension.
3. **A way for non-colour tokens to vary by mode — which B cannot currently express at all.** `tokens-core.mjs` writes each mode as `{ theme: { $type: 'color', color: {…} } }`. Everything mode-varying in B is a colour by construction, and `foundation` is mode-independent by construction.

   This is not hypothetical. **A already has three non-colour tokens that vary by light/dark**: `_sys.number.typography.button.{lg,md,sm}.line-height` is `{_ref.number.line-height.140}` in `fl-light` and `{_ref.number.line-height.175}` in `fl-dark`. `cru` has zero such tokens, so the constraint bites only on FamilyLife — but it bites. B would have to move `line-height` out of `foundation` into the mode modifier, and drop the `$type: 'color'` assumption, to reproduce it.

For completeness on how the brands differ in A: `cru-light` vs `fl-light` differ in **112 of 233** tokens — all 88 colours, 17 numbers (typography sizes and weights) and all 7 font families. Brand in A is not a colour-only axis either. Within a brand, `cru-light` vs `cru-dark` differ in 76 tokens, all colour; `fl-light` vs `fl-dark` differ in 78, of which 75 are colour and 3 are the button line-heights above.

---

## Reproduction

Every count above comes from flattening both trees to leaf paths and comparing. The steps:

- **A**, flattened from `packages/tokens/tokens/` on `main`: `ref.json` → 562; each of the four `sys/*.json` → 233 (identical name sets, verified); the twelve `cmp/*.json` → 393 with no cross-file collisions (sum equals union). Distinct names 1,188; definitions 1,887.
- **B**, flattened from `packages/components/tokens/cru/`: `palette` 247, `roles` 104, `foundation` 32, `theme.light` 71, `theme.dark` 70. These match the coverage figures in `.changeset/dtcg-token-emitter.md` exactly (247/285, 104/112, 32/121, 71/75, 70/75) — note that changeset's denominators are declarations in the generator's own `src/styles/**`, **not** anything in A.
- **Deferred formulas:** `node tools/tokens.mjs cru --dry` in the generator worktree. It writes nothing (the `writeFileSync` and the `prettier` call are both gated on `!dry`); the worktree's `git status` is unchanged after running it. Output: 100 deferred, 89 `both` / 5 `light` / 6 `dark`.
- **Value comparison:** resolve A's `_sys.color.X` through `_ref` to a hex, resolve B's `theme.color.Y` through `role` and `palette` to a hex, compare. B's colours are DTCG 2025.10 objects, converted by `round(component * 255)` per channel — the same conversion `toColor()` performs in reverse.

One caveat on scope: the 37-pair semantic mapping in §3 is **my classification**, not a mechanical result. The 0-name-overlap, 18-of-180, 100-deferred, 273-token and per-mode figures are mechanical and do not depend on it.
