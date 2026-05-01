# Figma Variables & Styles Roadmap

> Comprehensive build checklist for the Cornerstone Design System in Figma.
> Aligned with **Design Token Rules.md** — token tiers (ref → sys → cmp), brand namespacing, and domain taxonomy.

---

## Table of Contents

1. [Architecture Decisions](#1-architecture-decisions)
2. [Collection & Mode Map](#2-collection--mode-map)
3. [Phase 1 — Reference Variables](#3-phase-1--reference-variables)
4. [Phase 2 — System Variables](#4-phase-2--system-variables)
5. [Phase 3 — Component Variables](#5-phase-3--component-variables)
6. [Phase 4 — Figma Styles (non-variable)](#6-phase-4--figma-styles-non-variable)
7. [Phase 5 — Wiring & Validation](#7-phase-5--wiring--validation)

---

## 1. Architecture Decisions

### Variables vs. Styles

Figma variables support four types: **Color**, **Number**, **String**, **Boolean**. Anything that doesn't reduce to one of these must be a **Figma Style** instead.

| Domain | Figma construct | Why |
|---|---|---|
| [color (ref + sys + cmp)](#3a-collection-refcolor) | **Variable (Color)** | Single color value; supports aliasing and modes |
| [space](#space-scale) | **Variable (Number)** | Single numeric value (px) |
| [size](#size-scale) | **Variable (Number)** | Single numeric value (px) |
| [border-radius](#border-radius-scale) | **Variable (Number)** | Single numeric value (px) |
| [border-width](#border-width-scale) | **Variable (Number)** | Single numeric value (px) |
| [opacity](#opacity-scale) | **Variable (Number)** | Single numeric value (0–1) |
| [z-index](#z-index-scale) | **Variable (Number)** | Single numeric value |
| [font-family](#3c-collection-refstring) | **Variable (String)** | Text value |
| [font-weight](#typography-number-primitives) | **Variable (Number)** | Numeric weight (400, 700, etc.) |
| [font-size](#typography-number-primitives) | **Variable (Number)** | Single numeric value (px) |
| [line-height](#typography-number-primitives) | **Variable (Number)** | Single numeric value (px or %) |
| [letter-spacing](#typography-number-primitives) | **Variable (Number)** | Single numeric value (px or %) |
| [typography (composite)](#6-phase-4--figma-styles-non-variable) | **Text Style** | Combines font-family, size, weight, line-height, letter-spacing — Figma variables cannot express composites |
| [elevation / shadow](#6-phase-4--figma-styles-non-variable) | **Effect Style** | Composite (x, y, blur, spread, color) — no variable equivalent |
| [gradient](#6-phase-4--figma-styles-non-variable) | **Color Style** | Figma variables don't support gradients |
| motion / easing | **Not in Figma** | Document in token JSON only; Figma has no motion primitive |
| time / duration | **Not in Figma** | Document in token JSON only |
| icons | **Not in Figma** | Handled via component instances, not variables or styles |

### Mode Strategy

Figma allows one active mode per collection per frame. The token system needs **two dimensions** (brand + theme). We carry the brand dimension in two different ways depending on the tier:

```
┌──────────────────────────────┐
│  ref/color                   │  1 default mode
│  (raw hue palettes)          │  Brand carried in the GROUP path:
│                              │    color/cru/yellow/500
│                              │    color/fl/yellow/500
│  Each brand owns its own     │  Includes brand-specific contrast
│  groups (hues, contrast,     │  and neutrals — no shared neutral
│  neutrals).                  │  family between brands.
└──────────────┬───────────────┘
               │ aliases ↓ (sys mode picks the right brand's ref group)
┌──────────────▼───────────────┐
│  sys/color                   │  Modes = Brand × Theme
│  (semantic roles)            │  cru-light │ cru-dark │ fl-light │ fl-dark
│                              │  (currently 2 brands × 2 themes = 4 modes)
│  "primary" aliases a         │
│  DIFFERENT ref group per     │
│  brand mode.                 │
└──────────────┬───────────────┘
               │ aliases ↓
┌──────────────▼───────────────┐
│  cmp/color                   │  No modes (brand-agnostic)
│  (component parts)           │  aliases → sys/color
└──────────────────────────────┘
```

**How brand-switching works:**

1. `ref/color` is a single-mode collection where each brand has its own subtree. Cru's palette lives under `ref/color/cru/*` (lemon, yellow, orange, … plus its own gray/graphite neutrals and contrast/opacity group). FL's palette lives under `ref/color/fl/*` with FL's own hues, neutrals, and contrast group. Brand-specific naming and value sets live side-by-side without modes.

2. `sys/color` carries the brand×theme dimension. Each mode aliases semantic roles to whichever `ref/color/{brand}/*` group is appropriate. So `cru-light` mode aliases `sys/color/primary/default` → `ref/color/cru/yellow/500`, while `fl-light` mode aliases the same role to an FL-owned hue.

3. `cmp/color` has **no modes**. It aliases `sys/color`, so brand + theme changes cascade automatically.

> **Why ref/color uses brand groups instead of brand modes:** Mode-based ref/color forced every brand mode to populate the full superset of hue names, with neutral fallbacks for hues a brand doesn't own. With brand-as-group, each brand's palette stands on its own with its own naming (e.g., FL has `dark-green`, `soft-black`, `off-white`, `cool-gray` — names Cru doesn't use). It also keeps the file lighter when reading/writing to Figma via the plugin, which matters during day-to-day token work.
>
> **Why sys/color still needs brand×theme modes:** Semantic roles like "primary" must alias different ref groups per brand AND per theme (light primary ≠ dark primary). 2 brands × 2 themes = 4 modes today. Adding a brand later is one new pair of modes; Figma Enterprise supports up to 40 modes per collection.

### Brands in scope

**Currently built:** `cru` · `fl`

**Deferred:** `mil` · `aia` · `jfp` · `unto` · `josh` — these were removed from the active build to keep token files small and reduce token consumption when reading/writing through the Figma plugin. They will be added back as new `ref/color/{brand}/*` groups and new `sys/color` mode pairs when their palettes are audited.

**Alias brands (ccci, camp, city)** continue to resolve to `cru`; they do not get their own ref groups or sys modes unless a unique override emerges.

---

## 2. Collection & Mode Map

Summary of every Figma variable collection. Counts reflect brands currently in scope (cru, fl).

| # | Collection name | Variable type | Modes | Description |
|---|---|---|---|---|
| 1 | `ref/color` | Color | 1 default | Brand palettes organized into per-brand groups (`color/cru/*`, `color/fl/*`). Each brand owns its own hues, neutrals, and contrast/opacity groups. |
| 2 | `ref/number` | Number | 1 default | Raw spacing steps (positive + negative), size steps, base radii, border widths, opacity, font-size, line-height, font-weight, letter-spacing. Shared across brands. |
| 3 | `ref/string` | String | 1 default | Font family names organized into per-brand groups (`font-family/cru/*`, `font-family/fl/*`) plus shared `font-family/system/*` fallbacks. |
| 4 | `sys/color` | Color | 4 (`cru-light`, `cru-dark`, `fl-light`, `fl-dark`) | Semantic color roles aliasing the appropriate `ref/color/{brand}/*` group. Two new modes added per future brand. |
| 5 | `sys/number` | Number | 1 default | Semantic spacing (positive + negative), sizing, border-radius, border-width, typography numbers, opacity. Shared across brands. |
| 6 | `sys/string` | String | 4 (matches `sys/color`) | Semantic font-family roles by typography role (display, headline, title, pretitle, label, body, button) aliasing `ref/string/font-family/{brand}/*`. |
| 7 | `cmp` | Mixed (Color + Number) | None (1 default) | All component tokens — colors, dimensions, radii — organized by component. Brand-agnostic; aliases sys layer. |

---

## 3. Phase 1 — Reference Variables

### 3A. Collection: `ref/color`

**Type:** Color
**Modes:** 1 default
**Scoping:** All scopes (fill, stroke, etc.) — primitives should be available everywhere for flexibility.

This collection is **single-mode**. Brand palettes are organized as **groups within the color group**: `ref/color/cru/*` and `ref/color/fl/*` live side-by-side. Each brand owns:

- Its **hue scales** (Cru's lemon/yellow/orange/…, FL's blue/dark-green/…)
- Its **own neutrals** (e.g., Cru's `gray` and `graphite`; FL's `cool-gray` and `soft-black`/`off-white`) — neutrals are not shared between brands.
- Its **own contrast group** (`ref/color/{brand}/contrast/{black,white}` plus the `contrast/opacity/{black,white}-{10..90}` ramps).

> **Important:** These are raw, non-semantic hue names — the actual named colors from each brand's palette (lemon, yellow, cyan, navy, blue, dark-green, etc.), not roles like "primary." Semantic assignment happens at the `sys/color` tier.

#### Color palette variables

Each hue uses a **10-step scale: `50, 100, 200, 300, 400, 500, 600, 700, 800, 900`**. Step 500 is the brand-specified source color; lighter steps (50–400) are tints, darker steps (600–900) are shades.

#### Hue-to-brand usage map

Each row below is a hue group that exists under exactly one brand path (e.g., the "lemon" row only exists at `ref/color/cru/lemon/*` because FL doesn't use that hue). Adding a brand is purely additive — new groups appear under `ref/color/{brand}/*` without affecting existing brands.

| Brand | Hue groups present in `ref/color/{brand}/*` |
|---|---|
| `cru` | lemon, yellow, orange, vermilion, rose, pink, cerise, ruby, sky, cyan, turquoise, navy, mint, green, moss, olive-drab, gray, graphite, contrast |
| `fl` | yellow, orange, pink, blue, dark-green, soft-black, off-white, cool-gray, contrast |
| `mil` · `aia` · `jfp` · `unto` · `josh` | *deferred — palettes not yet audited or built* |

> **Action item:** As each new brand's palette is audited, create `ref/color/{brand}/*` with the hues that brand actually owns. No fallback values are needed since each brand's groups are independent.

#### Contrast colors (per brand)

Each brand owns its own contrast group at `ref/color/{brand}/contrast/*`. These are not hue scales — they are fixed black/white plus opacity ramps used for overlays, scrims, and text-on-image. The group repeats per brand so a brand can adjust its base black/white if needed without affecting other brands.

The structure below repeats under both `ref/color/cru/contrast/*` and `ref/color/fl/contrast/*`:

- [x] `contrast/white` → #FFFFFF
- [x] `contrast/black` → #000000
- [x] `contrast/opacity/white-90` → #FFFFFF @ 90%
- [x] `contrast/opacity/white-80` → #FFFFFF @ 80%
- [x] `contrast/opacity/white-70` → #FFFFFF @ 70%
- [x] `contrast/opacity/white-60` → #FFFFFF @ 60%
- [x] `contrast/opacity/white-50` → #FFFFFF @ 50%
- [x] `contrast/opacity/white-40` → #FFFFFF @ 40%
- [x] `contrast/opacity/white-30` → #FFFFFF @ 30%
- [x] `contrast/opacity/white-20` → #FFFFFF @ 20%
- [x] `contrast/opacity/white-10` → #FFFFFF @ 10%
- [x] `contrast/opacity/black-90` → #000000 @ 90%
- [x] `contrast/opacity/black-80` → #000000 @ 80%
- [x] `contrast/opacity/black-70` → #000000 @ 70%
- [x] `contrast/opacity/black-60` → #000000 @ 60%
- [x] `contrast/opacity/black-50` → #000000 @ 50%
- [x] `contrast/opacity/black-40` → #000000 @ 40%
- [x] `contrast/opacity/black-30` → #000000 @ 30%
- [x] `contrast/opacity/black-20` → #000000 @ 20%
- [x] `contrast/opacity/black-10` → #000000 @ 10%

---

#### Hue scales

Each hue group below has 10 steps. Cru's values are defined; other brand modes populate their own values or get fallbacks.

> **Path note:** Examples below show paths under `ref/color/cru/*`. The same hue may exist under `ref/color/fl/*` with FL's own values where the hue name overlaps (e.g., `yellow`, `orange`, `pink`).

**Cru — Warm family**

**lemon** *(Cru 500: #FFE378)*

- [ ] `ref/color/cru/lemon/50`
- [ ] `ref/color/cru/lemon/100`
- [ ] `ref/color/cru/lemon/200`
- [ ] `ref/color/cru/lemon/300`
- [ ] `ref/color/cru/lemon/400`
- [ ] `ref/color/cru/lemon/500` → #FFE378
- [ ] `ref/color/cru/lemon/600`
- [ ] `ref/color/cru/lemon/700`
- [ ] `ref/color/cru/lemon/800`
- [ ] `ref/color/cru/lemon/900`

**yellow** *(Cru 500: #FFD000)*

- [ ] `ref/color/yellow/50` → #FFFDF2
- [ ] `ref/color/yellow/100` → #FFF3BF
- [ ] `ref/color/yellow/200` → #FFEB91
- [ ] `ref/color/yellow/300` → #FFE261
- [ ] `ref/color/yellow/400` → #FFD930
- [ ] `ref/color/yellow/500` → #FFD000
- [ ] `ref/color/yellow/600` → #CCA600
- [ ] `ref/color/yellow/700` → #997D00
- [ ] `ref/color/yellow/800` → #665300
- [ ] `ref/color/yellow/900` → #332A00

**orange** *(Cru 500: #F08020)*

- [ ] `ref/color/orange/50`
- [ ] `ref/color/orange/100`
- [ ] `ref/color/orange/200`
- [ ] `ref/color/orange/300`
- [ ] `ref/color/orange/400`
- [ ] `ref/color/orange/500` → #F08020
- [ ] `ref/color/orange/600`
- [ ] `ref/color/orange/700`
- [ ] `ref/color/orange/800`
- [ ] `ref/color/orange/900`

**vermilion** *(Cru 500: #D34400)*

- [ ] `ref/color/vermilion/50`
- [ ] `ref/color/vermilion/100`
- [ ] `ref/color/vermilion/200`
- [ ] `ref/color/vermilion/300`
- [ ] `ref/color/vermilion/400`
- [ ] `ref/color/vermilion/500` → #D34400
- [ ] `ref/color/vermilion/600`
- [ ] `ref/color/vermilion/700`
- [ ] `ref/color/vermilion/800`
- [ ] `ref/color/vermilion/900`

---

**Pink family**

**rose** *(Cru 500: #FFB4C8)*

- [ ] `ref/color/rose/50`
- [ ] `ref/color/rose/100`
- [ ] `ref/color/rose/200`
- [ ] `ref/color/rose/300`
- [ ] `ref/color/rose/400`
- [ ] `ref/color/rose/500` → #FFB4C8
- [ ] `ref/color/rose/600`
- [ ] `ref/color/rose/700`
- [ ] `ref/color/rose/800`
- [ ] `ref/color/rose/900`

**pink** *(Cru 500: #EA657F)*

- [ ] `ref/color/pink/50`
- [ ] `ref/color/pink/100`
- [ ] `ref/color/pink/200`
- [ ] `ref/color/pink/300`
- [ ] `ref/color/pink/400`
- [ ] `ref/color/pink/500` → #EA657F
- [ ] `ref/color/pink/600`
- [ ] `ref/color/pink/700`
- [ ] `ref/color/pink/800`
- [ ] `ref/color/pink/900`

**cerise** *(Cru 500: #C23C49)*

- [ ] `ref/color/cerise/50`
- [ ] `ref/color/cerise/100`
- [ ] `ref/color/cerise/200`
- [ ] `ref/color/cerise/300`
- [ ] `ref/color/cerise/400`
- [ ] `ref/color/cerise/500` → #C23C49
- [ ] `ref/color/cerise/600`
- [ ] `ref/color/cerise/700`
- [ ] `ref/color/cerise/800`
- [ ] `ref/color/cerise/900`

**ruby** *(Cru 500: #991313)*

- [ ] `ref/color/ruby/50`
- [ ] `ref/color/ruby/100`
- [ ] `ref/color/ruby/200`
- [ ] `ref/color/ruby/300`
- [ ] `ref/color/ruby/400`
- [ ] `ref/color/ruby/500` → #991313
- [ ] `ref/color/ruby/600`
- [ ] `ref/color/ruby/700`
- [ ] `ref/color/ruby/800`
- [ ] `ref/color/ruby/900`

---

**Cool family**

**sky** *(Cru 500: #89EFF7)*

- [ ] `ref/color/sky/50`
- [ ] `ref/color/sky/100`
- [ ] `ref/color/sky/200`
- [ ] `ref/color/sky/300`
- [ ] `ref/color/sky/400`
- [ ] `ref/color/sky/500` → #89EFF7
- [ ] `ref/color/sky/600`
- [ ] `ref/color/sky/700`
- [ ] `ref/color/sky/800`
- [ ] `ref/color/sky/900`

**cyan** *(Cru 500: #00C0D8)*

- [ ] `ref/color/cyan/50`
- [ ] `ref/color/cyan/100`
- [ ] `ref/color/cyan/200`
- [ ] `ref/color/cyan/300`
- [ ] `ref/color/cyan/400`
- [ ] `ref/color/cyan/500` → #00C0D8
- [ ] `ref/color/cyan/600`
- [ ] `ref/color/cyan/700`
- [ ] `ref/color/cyan/800`
- [ ] `ref/color/cyan/900`

**turquoise** *(Cru 500: #007890)*

- [ ] `ref/color/turquoise/50`
- [ ] `ref/color/turquoise/100`
- [ ] `ref/color/turquoise/200`
- [ ] `ref/color/turquoise/300`
- [ ] `ref/color/turquoise/400`
- [ ] `ref/color/turquoise/500` → #007890
- [ ] `ref/color/turquoise/600`
- [ ] `ref/color/turquoise/700`
- [ ] `ref/color/turquoise/800`
- [ ] `ref/color/turquoise/900`

**navy** *(Cru 500: #1F1F47)*

- [ ] `ref/color/navy/50`
- [ ] `ref/color/navy/100`
- [ ] `ref/color/navy/200`
- [ ] `ref/color/navy/300`
- [ ] `ref/color/navy/400`
- [ ] `ref/color/navy/500` → #1F1F47
- [ ] `ref/color/navy/600`
- [ ] `ref/color/navy/700`
- [ ] `ref/color/navy/800`
- [ ] `ref/color/navy/900`

---

**Green family**

**mint** *(Cru 500: #88E4B6)*

- [ ] `ref/color/mint/50`
- [ ] `ref/color/mint/100`
- [ ] `ref/color/mint/200`
- [ ] `ref/color/mint/300`
- [ ] `ref/color/mint/400`
- [ ] `ref/color/mint/500` → #88E4B6
- [ ] `ref/color/mint/600`
- [ ] `ref/color/mint/700`
- [ ] `ref/color/mint/800`
- [ ] `ref/color/mint/900`

**green** *(Cru 500: #24C976)*

- [ ] `ref/color/green/50`
- [ ] `ref/color/green/100`
- [ ] `ref/color/green/200`
- [ ] `ref/color/green/300`
- [ ] `ref/color/green/400`
- [ ] `ref/color/green/500` → #24C976
- [ ] `ref/color/green/600`
- [ ] `ref/color/green/700`
- [ ] `ref/color/green/800`
- [ ] `ref/color/green/900`

**moss** *(Cru 500: #476052)*

- [ ] `ref/color/moss/50`
- [ ] `ref/color/moss/100`
- [ ] `ref/color/moss/200`
- [ ] `ref/color/moss/300`
- [ ] `ref/color/moss/400`
- [ ] `ref/color/moss/500` → #476052
- [ ] `ref/color/moss/600`
- [ ] `ref/color/moss/700`
- [ ] `ref/color/moss/800`
- [ ] `ref/color/moss/900`

**olive-drab** *(Cru 500: #2E3A33)*

- [ ] `ref/color/olive-drab/50`
- [ ] `ref/color/olive-drab/100`
- [ ] `ref/color/olive-drab/200`
- [ ] `ref/color/olive-drab/300`
- [ ] `ref/color/olive-drab/400`
- [ ] `ref/color/olive-drab/500` → #2E3A33
- [ ] `ref/color/olive-drab/600`
- [ ] `ref/color/olive-drab/700`
- [ ] `ref/color/olive-drab/800`
- [ ] `ref/color/olive-drab/900`

---

**Neutral family**

**gray** *(Cru 500 range around #F0EFEE source)*

- [ ] `ref/color/gray/50`
- [ ] `ref/color/gray/100`
- [ ] `ref/color/gray/200`
- [ ] `ref/color/gray/300`
- [ ] `ref/color/gray/400`
- [ ] `ref/color/gray/500`
- [ ] `ref/color/gray/600`
- [ ] `ref/color/gray/700`
- [ ] `ref/color/gray/800`
- [ ] `ref/color/gray/900`

**graphite** *(Cru 500 range around #565652 source)*

- [ ] `ref/color/graphite/50`
- [ ] `ref/color/graphite/100`
- [ ] `ref/color/graphite/200`
- [ ] `ref/color/graphite/300`
- [ ] `ref/color/graphite/400`
- [ ] `ref/color/graphite/500`
- [ ] `ref/color/graphite/600`
- [ ] `ref/color/graphite/700`
- [ ] `ref/color/graphite/800`
- [ ] `ref/color/graphite/900`

> **Total ref/color variables (current):** Cru: 18 hue scales × 10 steps + 22 contrast = **202 variables**. FL: 8 hue/neutral groups × 10 steps + 22 contrast = **~102 variables**. Single mode, so total cell count = total variables.
>
> **Naming note:** Use Figma's `/` group separator for hierarchy. `ref/color/cru/yellow/500` displays as nested groups in the variables panel.
>
> **Adding a brand:** Create a new `ref/color/{brand}/*` subtree with the hues that brand owns, plus that brand's own contrast group. No fallbacks needed since brand groups are independent.

#### Example: How sys/color aliases ref/color per brand

| sys/color variable | `cru-light` mode aliases → | `fl-light` mode aliases → |
|---|---|---|
| `sys/color/primary/default` | `ref/color/cru/yellow/500` | `ref/color/fl/blue/500` |
| `sys/color/primary/hover` | `ref/color/cru/yellow/400` | `ref/color/fl/blue/400` |
| `sys/color/secondary/default` | `ref/color/cru/orange/500` | `ref/color/fl/orange/500` |
| `sys/color/surface/default` | `ref/color/cru/gray/50` | `ref/color/fl/cool-gray/50` |

> Each brand×theme mode in `sys/color` defines which `ref/color/{brand}/*` group maps to each semantic role. Note that aliases include the brand segment, since `ref/color` no longer uses brand modes.

---

### 3B. Collection: `ref/number`

**Type:** Number
**Modes:** 1 default mode (add brand modes only if brands diverge)
**Scoping:** Set per-variable (see notes).

#### Space scale

Raw spacing primitives in px. These are your base building blocks.

- [x] `ref/number/space/0` → 0
- [x] `ref/number/space/0` → 0
- [x] `ref/number/space/1` → 1
- [x] `ref/number/space/2` → 2
- [x] `ref/number/space/4` → 4
- [x] `ref/number/space/6` → 6
- [x] `ref/number/space/8` → 8
- [x] `ref/number/space/10` → 10
- [x] `ref/number/space/12` → 12
- [x] `ref/number/space/16` → 16
- [x] `ref/number/space/20` → 20
- [x] `ref/number/space/24` → 24
- [x] `ref/number/space/32` → 32
- [x] `ref/number/space/40` → 40
- [x] `ref/number/space/48` → 48
- [x] `ref/number/space/56` → 56
- [x] `ref/number/space/64` → 64
- [x] `ref/number/space/80` → 80
- [x] `ref/number/space/96` → 96
- [x] `ref/number/space/120` → 120
- [x] `ref/number/space/160` → 160

> **Scoping:** Gap, padding (all sides), item spacing.

#### Negative space scale

Raw negative spacing primitives for overlap layouts (e.g., stacked avatars, overlapping cards). Mirror of the positive scale with negative values.

- [x] `ref/number/space/-2` → -2
- [x] `ref/number/space/-4` → -4
- [x] `ref/number/space/-6` → -6
- [x] `ref/number/space/-8` → -8
- [x] `ref/number/space/-10` → -10
- [x] `ref/number/space/-12` → -12
- [x] `ref/number/space/-16` → -16
- [x] `ref/number/space/-20` → -20
- [x] `ref/number/space/-24` → -24
- [x] `ref/number/space/-32` → -32

> **Scoping:** Gap, item spacing (negative values produce overlap).

#### Size scale

Raw dimension primitives for widths, heights, icon sizes, control sizes.

- [ ] `ref/number/size/0` → 0
- [ ] `ref/number/size/4` → 4
- [ ] `ref/number/size/8` → 8
- [ ] `ref/number/size/12` → 12
- [ ] `ref/number/size/16` → 16
- [ ] `ref/number/size/20` → 20
- [ ] `ref/number/size/24` → 24
- [ ] `ref/number/size/28` → 28
- [ ] `ref/number/size/32` → 32
- [ ] `ref/number/size/36` → 36
- [ ] `ref/number/size/40` → 40
- [ ] `ref/number/size/44` → 44
- [ ] `ref/number/size/48` → 48
- [ ] `ref/number/size/56` → 56
- [ ] `ref/number/size/64` → 64
- [ ] `ref/number/size/72` → 72
- [ ] `ref/number/size/80` → 80
- [ ] `ref/number/size/96` → 96
- [ ] `ref/number/size/120` → 120
- [ ] `ref/number/size/160` → 160
- [ ] `ref/number/size/240` → 240
- [ ] `ref/number/size/320` → 320
- [ ] `ref/number/size/480` → 480

> **Scoping:** Width, height.

#### Border radius scale

Uses scaled steps, includes 9999 for pill shape.

- [x] `ref/border-radius/0` → 0
- [x] `ref/border-radius/2` → 2
- [x] `ref/border-radius/4` → 4
- [x] `ref/border-radius/8` → 8
- [x] `ref/border-radius/12` → 12
- [x] `ref/border-radius/16` → 16
- [x] `ref/border-radius/20` → 20
- [x] `ref/border-radius/24` → 24
- [x] `ref/border-radius/9999` → 9999

> **Scoping:** Corner radius.
> **Note:** Semantic corner radius sizes defined at system level. Per corner overrides defined at component level.

#### Border width scale

- [x] `ref/number/border-width/0` → 0
- [x] `ref/number/border-width/1` → 1
- [x] `ref/number/border-width/2` → 2
- [x] `ref/number/border-width/3` → 3
- [x] `ref/number/border-width/4` → 4

> **Scoping:** Stroke weight (individual strokes).

#### Opacity scale

Per `csds.tokens.json`, uses 0–10 steps with values 0–100.

- [x] `ref/opacity/0` → 0
- [x] `ref/opacity/1` → 10
- [x] `ref/opacity/2` → 20
- [x] `ref/opacity/3` → 30
- [x] `ref/opacity/4` → 40
- [x] `ref/opacity/5` → 50
- [x] `ref/opacity/6` → 60
- [x] `ref/opacity/7` → 70
- [x] `ref/opacity/8` → 80
- [x] `ref/opacity/9` → 90
- [x] `ref/opacity/10` → 100

> **Scoping:** Opacity.

#### Typography number primitives

Raw type scale values. These feed into `sys/number` semantic tokens and ultimately into Text Styles.

**Font size (px):**

- [x] `ref/number/font-size/10` → 10
- [x] `ref/number/font-size/11` → 11
- [x] `ref/number/font-size/12` → 12
- [x] `ref/number/font-size/14` → 14
- [x] `ref/number/font-size/16` → 16
- [x] `ref/number/font-size/18` → 18
- [x] `ref/number/font-size/20` → 20
- [x] `ref/number/font-size/22` → 22
- [x] `ref/number/font-size/24` → 24
- [x] `ref/number/font-size/28` → 28
- [x] `ref/number/font-size/32` → 32
- [x] `ref/number/font-size/36` → 36
- [x] `ref/number/font-size/40` → 40
- [x] `ref/number/font-size/48` → 48
- [x] `ref/number/font-size/56` → 56
- [x] `ref/number/font-size/64` → 64
- [x] `ref/number/font-size/72` → 72

> **Scoping:** Font size (if supported; otherwise leave unscoped).

**Line height (unitless number intended to be %):**
x
- [x] `ref/number/line-height/100` → 100 (100%)
- [x] `ref/number/line-height/110` → 110
- [x] `ref/number/line-height/120` → 120
- [x] `ref/number/line-height/125` → 125
- [x] `ref/number/line-height/130` → 130
- [x] `ref/number/line-height/140` → 140
- [x] `ref/number/line-height/150` → 150
- [x] `ref/number/line-height/160` → 160
- [x] `ref/number/line-height/175` → 175
- [x] `ref/number/line-height/200` → 200

> **Scoping:** Line height.
> **Note**: Figma doesn't allow unit suffixes. For now, we must represent the % as a number until they add support.

**Font weight:**

- [x] `ref/number/font-weight/100` → 100 (Thin)
- [x] `ref/number/font-weight/200` → 200 (Extra Light)
- [x] `ref/number/font-weight/300` → 300 (Light)
- [x] `ref/number/font-weight/400` → 400 (Regular)
- [x] `ref/number/font-weight/500` → 500 (Medium)
- [x] `ref/number/font-weight/600` → 600 (Semi Bold)
- [x] `ref/number/font-weight/700` → 700 (Bold)
- [x] `ref/number/font-weight/800` → 800 (Extra Bold)
- [x] `ref/number/font-weight/900` → 900 (Black)

> **Scoping note:** Text Styles consume the weight variable. Results may vary depending on the font family selected.

**Letter spacing (px):**

- [x] `ref/number/letter-spacing/tight` → -0.5
- [x] `ref/number/letter-spacing/wide` → 0.5
- [x] `ref/number/letter-spacing/wider` → 1.0

> **Scoping:** Letter spacing (if supported).

---

### 3C. Collection: `ref/string`

**Type:** String
**Modes:** 7 brands (font families differ per brand)

Per `csds.tokens.json`, font families are organized into tiers: system-ui fallbacks, web-safe fallbacks, plain (default cross-brand), and brand-specific.

#### Font family — system-ui (fallbacks)

- [x] `ref/font-family/system-ui/sans` → `ui-sans-serif`
- [x] `ref/font-family/system-ui/serif` → `ui-serif`
- [x] `ref/font-family/system-ui/mono` → `ui-monospace`

#### Font family — web-safe (fallbacks)

- [x] `ref/font-family/web-safe/sans` → `Arial`
- [x] `ref/font-family/web-safe/serif` → `Times New Roman`
- [x] `ref/font-family/web-safe/mono` → `Courier New`

#### Font family — plain (default cross-brand)

- [x] `ref/font-family/plain/sans` → `Noto Sans`
- [x] `ref/font-family/plain/serif` → `Noto Serif`
- [x] `ref/font-family/plain/mono` → `Roboto Mono`

#### Font family — brand (per-brand primary typefaces)

These are empty by default and populated per brand mode.

- [x] `ref/font-family/brand/sans-primary`
- [x] `ref/font-family/brand/sans-secondary`
- [x] `ref/font-family/brand/serif-primary`
- [x] `ref/font-family/brand/serif-secondary`
- [x] `ref/font-family/brand/mono-primary`
- [x] `ref/font-family/brand/mono-secondary`

#### Font family — brand product (product/app-specific overrides)

- [x] `ref/font-family/brand/product/sans-primary`
- [x] `ref/font-family/brand/product/sans-secondary`
- [x] `ref/font-family/brand/product/serif-primary`
- [x] `ref/font-family/brand/product/serif-secondary`
- [x] `ref/font-family/brand/product/mono-primary`
- [x] `ref/font-family/brand/product/mono-secondary`

> **Scoping note:** Figma doesn't allow binding a string variable to font-family on the canvas. These exist for code export and documentation. Actual font binding happens through Text Styles.

---

## 4. Phase 2 — System Variables

> **Audit status (2026-05-01):** The sys tier has been built for `cru-light` · `cru-dark` · `fl-light` · `fl-dark` (4 modes). Counts below reflect actual JSON in `tokens/sys/*.json`: **214 sys tokens per mode**, broken down as 67 color + 140 number + 7 string. Items marked `[x]` are present in all 4 modes; `[ ]` are still missing or pending.
>
> Several roles have been **renamed** or restructured from earlier roadmap drafts. Where that's the case, an "Audit note" calls it out so we can decide whether to align the roadmap to the build or revise the build.

### 4A. Collection: `sys/color`

**Type:** Color
**Modes (currently built):** `cru-light` · `cru-dark` · `fl-light` · `fl-dark`
**All values alias → `ref/color/{brand}/*` variables.**

> **Structural note:** Built tokens use a `default` slot for the base value of a role (e.g., `sys/color/primary/default`) rather than putting the base on the role itself. State variants (`hover`, `pressed`, `focus`, `disabled`) and "on-X" variants are siblings under the same role group. The roadmap below has been updated to match.

#### Primary

- [x] `sys/color/primary/default`
- [x] `sys/color/primary/hover`
- [x] `sys/color/primary/pressed`
- [x] `sys/color/primary/focus`
- [x] `sys/color/primary/disabled`
- [x] `sys/color/primary/on-primary`
- [x] `sys/color/primary/inverse-on-primary`
- [x] `sys/color/primary/primary-container`
- [x] `sys/color/primary/on-primary-container`

> **Audit note:** `inverse-on-primary` (built) is non-standard relative to Material's role model — decide whether to keep it or fold it into a separate `inverse-primary` group.

#### Secondary

- [x] `sys/color/secondary/default`
- [x] `sys/color/secondary/hover`
- [x] `sys/color/secondary/pressed`
- [x] `sys/color/secondary/focus`
- [x] `sys/color/secondary/disabled`
- [x] `sys/color/secondary/on-secondary`
- [x] `sys/color/secondary/secondary-container`
- [x] `sys/color/secondary/on-secondary-container`

#### Tertiary

- [x] `sys/color/tertiary/default`
- [x] `sys/color/tertiary/hover`
- [x] `sys/color/tertiary/pressed`
- [x] `sys/color/tertiary/focus`
- [x] `sys/color/tertiary/disabled`
- [x] `sys/color/tertiary/on-tertiary`
- [x] `sys/color/tertiary/container`
- [x] `sys/color/tertiary/on-tertiary-container`

> **Audit note:** Container is named `tertiary/container` (no `tertiary-` prefix) while primary/secondary use `primary-container`/`secondary-container`. Inconsistency — recommend renaming to `tertiary/tertiary-container` to match.

#### Information *(was: Info)*

- [x] `sys/color/information/default`
- [x] `sys/color/information/hover`
- [x] `sys/color/information/pressed`
- [x] `sys/color/information/focus`
- [x] `sys/color/information/container`
- [ ] `sys/color/information/on-information`
- [ ] `sys/color/information/on-information-container`

> **Audit note:** Renamed `info` → `information` in the build. The container naming also drops the role prefix (`information/container` rather than `information/information-container`). Decide on final naming and align.

#### Success

- [x] `sys/color/success/default`
- [x] `sys/color/success/hover`
- [x] `sys/color/success/pressed`
- [x] `sys/color/success/focus`
- [x] `sys/color/success/container`
- [ ] `sys/color/success/on-success`
- [ ] `sys/color/success/on-success-container`

#### Warning

- [x] `sys/color/warning/default`
- [x] `sys/color/warning/hover`
- [x] `sys/color/warning/pressed`
- [x] `sys/color/warning/focus`
- [x] `sys/color/warning/error-container`
- [ ] `sys/color/warning/on-warning`
- [ ] `sys/color/warning/on-warning-container`

> **Audit note (bug):** The container variable is mis-named `warning/error-container` — should be `warning/warning-container`. Fix in the build.

#### Danger *(was: Error)*

- [x] `sys/color/danger/default`
- [x] `sys/color/danger/hover`
- [x] `sys/color/danger/pressed`
- [x] `sys/color/danger/focus`
- [x] `sys/color/danger/error-container`
- [ ] `sys/color/danger/on-danger`
- [ ] `sys/color/danger/on-danger-container`

> **Audit note:** Renamed `error` → `danger` in the build, but the container is still named `error-container` — pick one term (danger or error) and align everywhere.

#### Surface

- [x] `sys/color/surface/default`
- [x] `sys/color/surface/variant`
- [x] `sys/color/surface/on-surface`
- [x] `sys/color/surface/on-surface-variant`
- [x] `sys/color/surface/container`
- [x] `sys/color/surface/inverse-surface`
- [x] `sys/color/surface/inverse-on-surface`
- [x] `sys/color/surface/inverse-on-surface-variant`
- [x] `sys/color/surface/dim`
- [x] `sys/color/surface/bright`
- [x] `sys/color/surface/hover`
- [x] `sys/color/surface/selected`
- [x] `sys/color/surface-container/lowest`
- [x] `sys/color/surface-container/low`
- [x] `sys/color/surface-container/high`
- [x] `sys/color/surface-container/highest`
- [ ] `sys/color/surface/on-surface/hover`
- [ ] `sys/color/surface/on-surface/disabled`
- [ ] `sys/color/surface/on-surface-variant/hover`

> **Audit note:** `surface/container` (single) coexists with `surface-container/{lowest..highest}` (the M3 elevation ramp). `surface-container` is at the same level as `surface` rather than nested under it. Confirm intentional vs flatten.
> Built `surface/selected` aliases `cyan.50` in `cru-light` — that's a primary-tinted selection, not a brand-neutral surface tint. Verify per brand mode.

#### Background

- [x] `sys/color/background/default`
- [x] `sys/color/background/on-background`

#### Text *(new — not in original roadmap)*

- [x] `sys/color/text/primary`
- [x] `sys/color/text/secondary`
- [x] `sys/color/text/disabled`

> **Audit note:** Built `text/secondary` and `text/disabled` in `cru-light` alias `_ref.color.fl.contrast.opacity.black-60` and `black-40` — Cru tokens are pointing into FL's contrast group. **Bug to fix.** Each brand mode should alias its own brand's contrast group.

#### Action *(new — not in original roadmap)*

- [x] `sys/color/action`

> **Audit note:** In `cru-light` aliases `_ref.color.fl.contrast.opacity.black-60` — same cross-brand alias bug as `text/*`. Also: a single `action` variable without states (hover/pressed/disabled) feels under-spec'd. Decide its purpose vs `primary` or expand it.

#### Divider *(new — not in original roadmap)*

- [x] `sys/color/divider`

> **Audit note:** Same FL cross-alias bug in `cru-light` (`fl.contrast.opacity.black-10`). Also: this looks like the M3 `outline-variant` role — decide whether to keep `divider` as a separate token or merge with an `outline` group below.

#### Transparent

- [x] `sys/color/transparent` (`#ffffff00`)

#### Outline *(not yet built)*

- [ ] `sys/color/outline/default`
- [ ] `sys/color/outline/hover`
- [ ] `sys/color/outline/focus`
- [ ] `sys/color/outline/disabled`
- [ ] `sys/color/outline-variant/default`
- [ ] `sys/color/outline-variant/hover`

#### Scrim & Shadow *(not yet built)*

- [ ] `sys/color/scrim`
- [ ] `sys/color/shadow`

#### Inverse *(not yet built as a separate group)*

- [ ] `sys/color/inverse-primary`

> Inverse-on-primary, inverse-surface, inverse-on-surface, and inverse-on-surface-variant are built **inside** their respective role groups. Decide whether to consolidate into a top-level `inverse/*` group.

#### Link *(not yet built)*

- [ ] `sys/color/link/default`
- [ ] `sys/color/link/hover`
- [ ] `sys/color/link/visited`
- [ ] `sys/color/link/focus`

> **Currently built:** **67 color variables × 4 modes = 268 cell values.**
> **Cross-cutting bugs to fix:** (1) `text/*`, `action`, and `divider` in `cru-*` modes alias FL's contrast group; (2) `warning/error-container` and `danger/error-container` use the `error-container` name even though the role was renamed; (3) container naming is inconsistent (some are `{role}-container`, some are `container`).

---

### 4B. Collection: `sys/number`

**Type:** Number
**Modes:** 1 default (shared across brands — spacing, sizing, radii, and typography numbers are identical for cru and fl)
**Values alias → `ref/number` variables.**

#### Semantic spacing

A single role-agnostic scale using t-shirt sizes. Values alias the raw `ref/number/space/*` steps. The system tier does **not** encode spatial role (padding, gap, inset, etc.) — that responsibility belongs to the component tier, where `cmp/*/padding/*`, `cmp/*/gap`, etc. reference these tokens.

> **Rationale:** In Figma, designers apply these tokens to auto layout padding and gap fields. The role is implicit in *where* the token is applied, not in the token name itself. This keeps the sys scale simple and avoids duplicating the same values across inline/stack/inset/gap groups. Component tokens (`cmp` tier) name the role explicitly for code translation.

**Space scale**

| Token | Value | Ref alias | Built |
|---|---|---|---|
| `sys/number/space/none` | 0 | `ref/number/space/0` | [x] |
| `sys/number/space/3xs` | 2 | `ref/number/space/2` | [x] |
| `sys/number/space/2xs` | 4 | `ref/number/space/4` | [x] |
| `sys/number/space/xs` | 8 | `ref/number/space/8` | [x] |
| `sys/number/space/sm` | 12 | `ref/number/space/12` | [x] |
| `sys/number/space/md` | 16 | `ref/number/space/16` | [x] |
| `sys/number/space/lg` | 24 | `ref/number/space/24` | [x] |
| `sys/number/space/xl` | 32 | `ref/number/space/32` | [x] |
| `sys/number/space/2xl` | 40 | `ref/number/space/40` | [x] |
| `sys/number/space/3xl` | 56 | `ref/number/space/56` | [x] |

**Scoping:** Gap, padding (all sides), item spacing.

**Negative space** *(for pull/overlap/negative margin use cases)*

| Token | Expected value | Built alias | Status |
|---|---|---|---|
| `sys/number/space/neg/3xs` | -2 | `ref/number/space/-2` | [x] |
| `sys/number/space/neg/2xs` | -4 | `ref/number/space/-4` | [x] |
| `sys/number/space/neg/xs` | -8 | `ref/number/space/-8` | [x] |
| `sys/number/space/neg/sm` | -12 | `ref/number/space/-16` | [x] **bug** |
| `sys/number/space/neg/md` | -16 | `ref/number/space/-20` | [x] **bug** |
| `sys/number/space/neg/lg` | -24 | `ref/number/space/-24` | [x] |
| `sys/number/space/neg/xl` | -32 | `ref/number/space/-32` | [x] |
| `sys/number/space/neg/2xl` | -40 | `ref/number/space/-40` | [x] |
| `sys/number/space/neg/3xl` | -56 | `ref/number/space/-56` | [x] |

> **Audit note (bug):** `neg/sm` and `neg/md` don't mirror their positive counterparts. `neg/sm` should alias `ref/number/space/-12` (currently `-16`); `neg/md` should alias `ref/number/space/-16` (currently `-20`). Fix in the build.

**Scoping:** Gap, padding (all sides), item spacing.

> **Note:** Figma variables support negative numbers. Negative space tokens are useful for overlapping elements, pull margins, and stack offsets in auto layout.

#### Semantic sizing

**Icon sizes**

- [x] `sys/number/size/icon/xs` (12)
- [x] `sys/number/size/icon/sm` (16)
- [x] `sys/number/size/icon/md` (20)
- [x] `sys/number/size/icon/lg` (24)
- [x] `sys/number/size/icon/xl` (32)
- [x] `sys/number/size/icon/2xl` (40)

**Control heights** *(buttons, inputs, etc.)*

- [x] `sys/number/size/control/xs` (24)
- [x] `sys/number/size/control/sm` (32)
- [x] `sys/number/size/control/md` (40)
- [x] `sys/number/size/control/lg` (48)
- [x] `sys/number/size/control/xl` (56)

**Avatar sizes**

- [x] `sys/number/size/avatar/xs` (24)
- [x] `sys/number/size/avatar/sm` (32)
- [x] `sys/number/size/avatar/md` (40)
- [x] `sys/number/size/avatar/lg` (56)
- [x] `sys/number/size/avatar/xl` (80)
- [x] `sys/number/size/avatar/2xl` (120)

#### Semantic border radius

Built path is `sys/number/border-radius/*` (not `sys/number/radius/*`). Roadmap and existing component-level tokens (`cmp/*/radius`) need to align — pick one name and update the other side.

- [x] `sys/number/border-radius/none` → `ref/number/border-radius/0`
- [x] `sys/number/border-radius/xs` → `ref/number/border-radius/2`
- [x] `sys/number/border-radius/sm` → `ref/number/border-radius/4`
- [x] `sys/number/border-radius/md` → `ref/number/border-radius/8`
- [x] `sys/number/border-radius/lg` → `ref/number/border-radius/12`
- [x] `sys/number/border-radius/xl` → `ref/number/border-radius/16`
- [x] `sys/number/border-radius/2xl` → `ref/number/border-radius/24`
- [x] `sys/number/border-radius/full` → `ref/number/border-radius/9999`

#### Semantic border width

- [x] `sys/number/border-width/none` → 0
- [x] `sys/number/border-width/thin` → 1
- [x] `sys/number/border-width/medium` → 2
- [x] `sys/number/border-width/thick` → 4

> **Audit note:** `thick` aliases `ref/number/border-width/4` rather than `/3`. The ref scale has both 3 and 4 — verify which step `thick` should resolve to and remove the unused step (or keep both with semantic names like `thick`/`thicker`).

#### Semantic typography numbers

Each typography role × scale exposes four numeric variables: `font-size`, `line-height`, `font-weight`, `letter-spacing`. They alias `ref/number/font-size/*`, `ref/number/line-height/*`, `ref/number/font-weight/*`, and `ref/number/letter-spacing/*`.

**Built roles (7):** `display`, `headline`, `title`, `pretitle`, `label`, `body`, `button`. Each role has 3 scales (`lg`, `md`, `sm`) and 4 properties = **84 typography number variables.**

| Role | Scale | font-size | line-height | font-weight | letter-spacing | Built |
|---|---|---|---|---|---|---|
| display | lg | 108 | 110 | 700 | tight | [x] |
| display | md | 88 | 110 | 700 | tight | [x] |
| display | sm | 72 | 110 | 700 | tight | [x] |
| headline | lg | 60 | 110 | 700 | default | [x] |
| headline | md | 48 | 110 | 700 | default | [x] |
| headline | sm | 40 | 110 | 700 | default | [x] |
| title | lg | 32 | 110 | 700 | default | [x] |
| title | md | 24 | 110 | 500 | default | [x] |
| title | sm | 20 | 110 | 500 | default | [x] |
| pretitle | lg | 18 | 110 | 500 | default | [x] |
| pretitle | md | 16 | 110 | 500 | default | [x] |
| pretitle | sm | 14 | 110 | 500 | default | [x] |
| label | lg | 20 | 110 | 500 | wider | [x] |
| label | md | 16 | 110 | 500 | wider | [x] |
| label | sm | 12 | 110 | 500 | wider | [x] |
| body | lg | 18 | 175 | 400 | default | [x] |
| body | md | 16 | 175 | 400 | default | [x] |
| body | sm | 12 | 175 | 400 | default | [x] |
| button | lg | 14 | 140 | 700 | default | [x] |
| button | md | 12 | 140 | 700 | default | [x] |
| button | sm | 12 | 140 | 700 | default | [x] |

> **Audit notes:**
> - **`pretitle` and `button` are new** roles not in the original roadmap. Decide whether to keep both at sys (versus folding `button` into a `label` style or moving it to cmp).
> - `body/sm` font-size is **12px**, the same as `label/sm` and `button/md`/`button/sm` — `body/sm` text at 12px with 175% line-height is a tight read; verify intent.
> - `letter-spacing/default` is 0 in ref but defined as a named token. Keep or use the literal 0 to avoid an alias hop.
> - 3 scales per role × 7 roles = 21 text styles per brand at the styles tier (Section 6A still lists 5 roles × 3 scales = 15). Update Section 6A to match.

#### Semantic opacity

| Token | Built alias | Built value |
|---|---|---|
| `sys/number/opacity/disabled` | `ref/number/opacity/40` | 0.40 |
| `sys/number/opacity/hover-overlay` | `ref/number/opacity/10` | 0.10 |
| `sys/number/opacity/pressed-overlay` | `ref/number/opacity/20` | 0.20 |
| `sys/number/opacity/focus-overlay` | `ref/number/opacity/10` | 0.10 |
| `sys/number/opacity/dragged-overlay` | `ref/number/opacity/20` | 0.20 |
| `sys/number/opacity/scrim` | `ref/number/opacity/30` | 0.30 |

> **Audit note:** Built values diverge from Material 3's recommendations (0.38/0.08/0.12/0.12/0.16/0.32). The ref scale only has 0/10/20/…/100 — to match M3 exactly we'd need additional ref steps (8, 12, 16, 32, 38). Decide: round to the existing 10-step scale (current build) or extend the ref scale.

---

### 4C. Collection: `sys/string`

**Type:** String
**Modes:** 4 (`cru-light`, `cru-dark`, `fl-light`, `fl-dark`) — same modes as `sys/color`. Each mode aliases `ref/string/font-family/{brand}/*`.

#### Semantic font family — by typography role

Built by typography role (one per role) rather than by generic `brand`/`plain`/`code` slots. Each role can resolve to a different family per brand.

| Token | `cru-*` modes alias → | Built |
|---|---|---|
| `sys/string/font-family/display` | `ref/string/font-family/cru/brand/sans-primary` | [x] |
| `sys/string/font-family/headline` | `ref/string/font-family/cru/brand/sans-primary` | [x] |
| `sys/string/font-family/title` | `ref/string/font-family/cru/brand/sans-primary` | [x] |
| `sys/string/font-family/pretitle` | `ref/string/font-family/cru/brand/sans-secondary` | [x] |
| `sys/string/font-family/label` | `ref/string/font-family/cru/brand/sans-secondary` | [x] |
| `sys/string/font-family/body` | `ref/string/font-family/cru/brand/sans-secondary` | [x] |
| `sys/string/font-family/button` | `ref/string/font-family/cru/brand/sans-secondary` | [x] |

> **Audit notes:**
> - The role list mirrors `sys/number/typography/*` — keep the two in sync. If `pretitle`/`button` change at sys/number, change here too.
> - In Figma, Text Styles set the actual font-family directly. These string variables exist for code export and to make per-role family swaps explicit per brand mode.
> - Add `mono` (or similar) when a code-style role is needed.

---

## 5. Phase 3 — Component Variables

### Collection: `cmp`

**Type:** Mixed (Color + Number)
**Modes:** None (1 default). Brand-agnostic — color values alias `sys/color`, number values alias `sys/number`, so brand + theme switching is inherited automatically.

Component tokens use the structure: `cmp/{component}/{variant?}/{part}` and optionally `/{state}`.

> **Naming convention:** No brand prefix. Use Figma `/` groups for hierarchy. Every token for a given component lives together in this single collection — colors and dimensions side by side, grouped by component.

---

#### Button

**Colors — Filled**

- [ ] `cmp/button/filled/container` → sys/color/primary
- [ ] `cmp/button/filled/container/hover` → sys/color/primary/hover
- [ ] `cmp/button/filled/container/pressed` → sys/color/primary/pressed
- [ ] `cmp/button/filled/container/focus` → sys/color/primary/focus
- [ ] `cmp/button/filled/container/disabled` → sys/color/primary/disabled
- [ ] `cmp/button/filled/label` → sys/color/on-primary
- [ ] `cmp/button/filled/label/disabled` → sys/color/on-primary (with disabled opacity)
- [ ] `cmp/button/filled/icon` → sys/color/on-primary

**Colors — Outlined**

- [ ] `cmp/button/outlined/container` → sys/color/surface
- [ ] `cmp/button/outlined/container/hover` → sys/color/surface (+ hover overlay)
- [ ] `cmp/button/outlined/container/pressed`
- [ ] `cmp/button/outlined/container/focus`
- [ ] `cmp/button/outlined/container/disabled`
- [ ] `cmp/button/outlined/outline` → sys/color/outline
- [ ] `cmp/button/outlined/outline/focus` → sys/color/primary
- [ ] `cmp/button/outlined/outline/disabled` → sys/color/outline/disabled
- [ ] `cmp/button/outlined/label` → sys/color/primary
- [ ] `cmp/button/outlined/label/disabled`
- [ ] `cmp/button/outlined/icon` → sys/color/primary

**Colors — Tonal**

- [ ] `cmp/button/tonal/container` → sys/color/secondary-container
- [ ] `cmp/button/tonal/container/hover`
- [ ] `cmp/button/tonal/container/pressed`
- [ ] `cmp/button/tonal/container/focus`
- [ ] `cmp/button/tonal/container/disabled`
- [ ] `cmp/button/tonal/label` → sys/color/on-secondary-container
- [ ] `cmp/button/tonal/label/disabled`
- [ ] `cmp/button/tonal/icon` → sys/color/on-secondary-container

**Colors — Text (ghost)**

- [ ] `cmp/button/text/container/hover`
- [ ] `cmp/button/text/container/pressed`
- [ ] `cmp/button/text/container/focus`
- [ ] `cmp/button/text/label` → sys/color/primary
- [ ] `cmp/button/text/label/disabled`
- [ ] `cmp/button/text/icon` → sys/color/primary

**Dimensions**

- [ ] `cmp/button/height` → sys/number/size/control/md
- [ ] `cmp/button/padding-inline` → sys/number/space/lg
- [ ] `cmp/button/gap` → sys/number/space/sm
- [ ] `cmp/button/radius` → sys/number/radius/full
- [ ] `cmp/button/icon-size` → sys/number/size/icon/md
- [ ] `cmp/button/sm/height` → sys/number/size/control/sm
- [ ] `cmp/button/sm/padding-inline` → sys/number/space/md
- [ ] `cmp/button/lg/height` → sys/number/size/control/lg
- [ ] `cmp/button/lg/padding-inline` → sys/number/space/xl
- [ ] `cmp/button/border-width` → sys/number/border-width/thin

---

#### Text Field / Input

**Colors — Filled**

- [ ] `cmp/textfield/filled/container` → sys/color/surface-container/highest
- [ ] `cmp/textfield/filled/container/hover`
- [ ] `cmp/textfield/filled/container/disabled`
- [ ] `cmp/textfield/filled/label` → sys/color/on-surface-variant
- [ ] `cmp/textfield/filled/label/focus` → sys/color/primary
- [ ] `cmp/textfield/filled/label/error` → sys/color/error
- [ ] `cmp/textfield/filled/input-text` → sys/color/on-surface
- [ ] `cmp/textfield/filled/input-text/disabled`
- [ ] `cmp/textfield/filled/placeholder` → sys/color/on-surface-variant
- [ ] `cmp/textfield/filled/indicator` → sys/color/on-surface-variant
- [ ] `cmp/textfield/filled/indicator/focus` → sys/color/primary
- [ ] `cmp/textfield/filled/indicator/error` → sys/color/error
- [ ] `cmp/textfield/filled/indicator/disabled`
- [ ] `cmp/textfield/filled/supporting-text` → sys/color/on-surface-variant
- [ ] `cmp/textfield/filled/supporting-text/error` → sys/color/error

**Colors — Outlined**

- [ ] `cmp/textfield/outlined/container`
- [ ] `cmp/textfield/outlined/outline` → sys/color/outline
- [ ] `cmp/textfield/outlined/outline/hover` → sys/color/on-surface
- [ ] `cmp/textfield/outlined/outline/focus` → sys/color/primary
- [ ] `cmp/textfield/outlined/outline/error` → sys/color/error
- [ ] `cmp/textfield/outlined/outline/disabled`
- [ ] `cmp/textfield/outlined/label` → sys/color/on-surface-variant
- [ ] `cmp/textfield/outlined/label/focus` → sys/color/primary
- [ ] `cmp/textfield/outlined/label/error` → sys/color/error
- [ ] `cmp/textfield/outlined/input-text` → sys/color/on-surface
- [ ] `cmp/textfield/outlined/placeholder` → sys/color/on-surface-variant
- [ ] `cmp/textfield/outlined/supporting-text` → sys/color/on-surface-variant
- [ ] `cmp/textfield/outlined/supporting-text/error` → sys/color/error

**Dimensions**

- [ ] `cmp/textfield/height` → sys/number/size/control/lg
- [ ] `cmp/textfield/padding-inline` → sys/number/space/md
- [ ] `cmp/textfield/radius` → sys/number/radius/xs (top only for filled)
- [ ] `cmp/textfield/outlined/radius` → sys/number/radius/sm
- [ ] `cmp/textfield/border-width` → sys/number/border-width/thin
- [ ] `cmp/textfield/border-width/focus` → sys/number/border-width/medium
- [ ] `cmp/textfield/gap` → sys/number/space/xs

---

#### Card

**Colors**

- [ ] `cmp/card/elevated/container` → sys/color/surface-container/low
- [ ] `cmp/card/elevated/container/hover`
- [ ] `cmp/card/filled/container` → sys/color/surface-container/highest
- [ ] `cmp/card/filled/container/hover`
- [ ] `cmp/card/outlined/container` → sys/color/surface
- [ ] `cmp/card/outlined/outline` → sys/color/outline-variant
- [ ] `cmp/card/outlined/outline/hover`
- [ ] `cmp/card/headline` → sys/color/on-surface
- [ ] `cmp/card/subhead` → sys/color/on-surface-variant
- [ ] `cmp/card/supporting-text` → sys/color/on-surface-variant

**Dimensions**

- [ ] `cmp/card/radius` → sys/number/radius/lg
- [ ] `cmp/card/padding` → sys/number/space/md

---

#### Chip

**Colors**

- [ ] `cmp/chip/assist/container` → sys/color/surface
- [ ] `cmp/chip/assist/outline` → sys/color/outline
- [ ] `cmp/chip/assist/label` → sys/color/on-surface
- [ ] `cmp/chip/filter/container/selected` → sys/color/secondary-container
- [ ] `cmp/chip/filter/label` → sys/color/on-surface
- [ ] `cmp/chip/filter/label/selected` → sys/color/on-secondary-container
- [ ] `cmp/chip/input/container` → sys/color/surface
- [ ] `cmp/chip/input/label` → sys/color/on-surface

**Dimensions**

- [ ] `cmp/chip/height` → sys/number/size/control/sm
- [ ] `cmp/chip/padding-inline` → sys/number/space/md
- [ ] `cmp/chip/radius` → sys/number/radius/sm
- [ ] `cmp/chip/gap` → sys/number/space/xs
- [ ] `cmp/chip/border-width` → sys/number/border-width/thin
- [ ] `cmp/chip/icon-size` → sys/number/size/icon/md

---

#### Checkbox

**Colors**

- [ ] `cmp/checkbox/container/selected` → sys/color/primary
- [ ] `cmp/checkbox/container/unselected` → transparent
- [ ] `cmp/checkbox/outline/unselected` → sys/color/on-surface-variant
- [ ] `cmp/checkbox/outline/unselected/hover` → sys/color/on-surface
- [ ] `cmp/checkbox/checkmark` → sys/color/on-primary
- [ ] `cmp/checkbox/container/disabled`
- [ ] `cmp/checkbox/container/error` → sys/color/error

**Dimensions**

- [ ] `cmp/checkbox/size` → sys/number/size/icon/md (18–20)
- [ ] `cmp/checkbox/radius` → sys/number/radius/xs
- [ ] `cmp/checkbox/border-width` → sys/number/border-width/medium

---

#### Radio Button

**Colors**

- [ ] `cmp/radio/outer/selected` → sys/color/primary
- [ ] `cmp/radio/outer/unselected` → sys/color/on-surface-variant
- [ ] `cmp/radio/outer/hover` → sys/color/on-surface
- [ ] `cmp/radio/inner/selected` → sys/color/primary
- [ ] `cmp/radio/outer/disabled`
- [ ] `cmp/radio/outer/error` → sys/color/error

**Dimensions**

- [ ] `cmp/radio/size` → sys/number/size/icon/md
- [ ] `cmp/radio/border-width` → sys/number/border-width/medium

---

#### Switch / Toggle

**Colors**

- [ ] `cmp/switch/track/selected` → sys/color/primary
- [ ] `cmp/switch/track/unselected` → sys/color/surface-variant
- [ ] `cmp/switch/track/disabled`
- [ ] `cmp/switch/handle/selected` → sys/color/on-primary
- [ ] `cmp/switch/handle/unselected` → sys/color/outline
- [ ] `cmp/switch/handle/disabled`

**Dimensions**

- [ ] `cmp/switch/track-width` (52)
- [ ] `cmp/switch/track-height` (32)
- [ ] `cmp/switch/track-radius` → sys/number/radius/full
- [ ] `cmp/switch/handle-size` (24)
- [ ] `cmp/switch/handle-size/selected` (28)

---

#### Top App Bar

**Colors**

- [ ] `cmp/top-app-bar/container` → sys/color/surface
- [ ] `cmp/top-app-bar/container/scrolled` → sys/color/surface-container
- [ ] `cmp/top-app-bar/headline` → sys/color/on-surface
- [ ] `cmp/top-app-bar/icon` → sys/color/on-surface-variant

**Dimensions**

- [ ] `cmp/top-app-bar/height` (64)

---

#### Navigation Bar (bottom)

**Colors**

- [ ] `cmp/nav-bar/container` → sys/color/surface-container
- [ ] `cmp/nav-bar/icon/active` → sys/color/on-secondary-container
- [ ] `cmp/nav-bar/icon/inactive` → sys/color/on-surface-variant
- [ ] `cmp/nav-bar/indicator` → sys/color/secondary-container
- [ ] `cmp/nav-bar/label/active` → sys/color/on-surface
- [ ] `cmp/nav-bar/label/inactive` → sys/color/on-surface-variant

**Dimensions**

- [ ] `cmp/nav-bar/height` (80)
- [ ] `cmp/nav-bar/icon-size` → sys/number/size/icon/lg
- [ ] `cmp/nav-bar/indicator-width` (64)
- [ ] `cmp/nav-bar/indicator-height` (32)
- [ ] `cmp/nav-bar/indicator-radius` → sys/number/radius/full

---

#### Navigation Rail

**Colors**

- [ ] `cmp/nav-rail/container` → sys/color/surface
- [ ] `cmp/nav-rail/icon/active` → sys/color/on-secondary-container
- [ ] `cmp/nav-rail/icon/inactive` → sys/color/on-surface-variant
- [ ] `cmp/nav-rail/indicator` → sys/color/secondary-container
- [ ] `cmp/nav-rail/label/active` → sys/color/on-surface
- [ ] `cmp/nav-rail/label/inactive` → sys/color/on-surface-variant

**Dimensions**

- [ ] `cmp/nav-rail/width` (80)

---

#### Navigation Drawer

**Colors**

- [ ] `cmp/nav-drawer/container` → sys/color/surface-container/low
- [ ] `cmp/nav-drawer/headline` → sys/color/on-surface-variant
- [ ] `cmp/nav-drawer/item/active` → sys/color/secondary-container
- [ ] `cmp/nav-drawer/item/label/active` → sys/color/on-secondary-container
- [ ] `cmp/nav-drawer/item/label/inactive` → sys/color/on-surface-variant
- [ ] `cmp/nav-drawer/item/icon/active` → sys/color/on-secondary-container
- [ ] `cmp/nav-drawer/item/icon/inactive` → sys/color/on-surface-variant

**Dimensions**

- [ ] `cmp/nav-drawer/width` (360)

---

#### Tabs

**Colors**

- [ ] `cmp/tabs/container` → sys/color/surface
- [ ] `cmp/tabs/indicator` → sys/color/primary
- [ ] `cmp/tabs/label/active` → sys/color/primary
- [ ] `cmp/tabs/label/inactive` → sys/color/on-surface-variant
- [ ] `cmp/tabs/icon/active` → sys/color/primary
- [ ] `cmp/tabs/icon/inactive` → sys/color/on-surface-variant

**Dimensions**

- [ ] `cmp/tabs/height` (48)
- [ ] `cmp/tabs/indicator-height` (3)
- [ ] `cmp/tabs/padding-inline` → sys/number/space/md

---

#### Dialog / Modal

**Colors**

- [ ] `cmp/dialog/container` → sys/color/surface-container/high
- [ ] `cmp/dialog/headline` → sys/color/on-surface
- [ ] `cmp/dialog/supporting-text` → sys/color/on-surface-variant
- [ ] `cmp/dialog/scrim` → sys/color/scrim

**Dimensions**

- [ ] `cmp/dialog/radius` → sys/number/radius/2xl
- [ ] `cmp/dialog/padding` → sys/number/space/xl
- [ ] `cmp/dialog/min-width` (280)
- [ ] `cmp/dialog/max-width` (560)

---

#### Snackbar / Toast

**Colors**

- [ ] `cmp/snackbar/container` → sys/color/inverse-surface
- [ ] `cmp/snackbar/label` → sys/color/inverse-on-surface
- [ ] `cmp/snackbar/action` → sys/color/inverse-primary

**Dimensions**

- [ ] `cmp/snackbar/radius` → sys/number/radius/sm
- [ ] `cmp/snackbar/padding` → sys/number/space/md
- [ ] `cmp/snackbar/min-width` (344)

---

#### Tooltip

**Colors**

- [ ] `cmp/tooltip/container` → sys/color/inverse-surface
- [ ] `cmp/tooltip/label` → sys/color/inverse-on-surface

**Dimensions**

- [ ] `cmp/tooltip/padding-inline` → sys/number/space/sm
- [ ] `cmp/tooltip/padding-block` → sys/number/space/xs
- [ ] `cmp/tooltip/radius` → sys/number/radius/sm

---

#### Badge

**Colors**

- [ ] `cmp/badge/container` → sys/color/error
- [ ] `cmp/badge/label` → sys/color/on-error

**Dimensions**

- [ ] `cmp/badge/size` (16)
- [ ] `cmp/badge/dot-size` (6)
- [ ] `cmp/badge/radius` → sys/number/radius/full

---

#### Divider

- [ ] `cmp/divider/color` → sys/color/outline-variant *(color)*
- [ ] `cmp/divider/thickness` → sys/number/border-width/thin *(number)*

---

#### Progress Indicator

**Colors**

- [ ] `cmp/progress/indicator` → sys/color/primary
- [ ] `cmp/progress/track` → sys/color/surface-container/highest

**Dimensions**

- [ ] `cmp/progress/linear/height` (4)
- [ ] `cmp/progress/linear/radius` → sys/number/radius/full
- [ ] `cmp/progress/circular/size` (48)
- [ ] `cmp/progress/circular/stroke-width` (4)

---

#### FAB (Floating Action Button)

**Colors**

- [ ] `cmp/fab/primary/container` → sys/color/primary-container
- [ ] `cmp/fab/primary/icon` → sys/color/on-primary-container
- [ ] `cmp/fab/secondary/container` → sys/color/secondary-container
- [ ] `cmp/fab/secondary/icon` → sys/color/on-secondary-container
- [ ] `cmp/fab/tertiary/container` → sys/color/tertiary-container
- [ ] `cmp/fab/tertiary/icon` → sys/color/on-tertiary-container
- [ ] `cmp/fab/surface/container` → sys/color/surface-container/high
- [ ] `cmp/fab/surface/icon` → sys/color/primary

**Dimensions**

- [ ] `cmp/fab/size` (56)
- [ ] `cmp/fab/sm/size` (40)
- [ ] `cmp/fab/lg/size` (96)
- [ ] `cmp/fab/radius` → sys/number/radius/lg
- [ ] `cmp/fab/lg/radius` → sys/number/radius/2xl
- [ ] `cmp/fab/icon-size` → sys/number/size/icon/lg

---

#### Icon Button

**Colors**

- [ ] `cmp/icon-button/standard/icon` → sys/color/on-surface-variant
- [ ] `cmp/icon-button/standard/icon/hover`
- [ ] `cmp/icon-button/filled/container` → sys/color/primary
- [ ] `cmp/icon-button/filled/icon` → sys/color/on-primary
- [ ] `cmp/icon-button/tonal/container` → sys/color/secondary-container
- [ ] `cmp/icon-button/tonal/icon` → sys/color/on-secondary-container
- [ ] `cmp/icon-button/outlined/outline` → sys/color/outline
- [ ] `cmp/icon-button/outlined/icon` → sys/color/on-surface-variant

**Dimensions**

- [ ] `cmp/icon-button/size` (40)
- [ ] `cmp/icon-button/icon-size` → sys/number/size/icon/lg
- [ ] `cmp/icon-button/radius` → sys/number/radius/full
- [ ] `cmp/icon-button/border-width` → sys/number/border-width/thin

---

#### Menu

**Colors**

- [ ] `cmp/menu/container` → sys/color/surface-container
- [ ] `cmp/menu/item/label` → sys/color/on-surface
- [ ] `cmp/menu/item/icon` → sys/color/on-surface-variant
- [ ] `cmp/menu/item/hover` → sys/color/on-surface (8% overlay)
- [ ] `cmp/menu/divider` → sys/color/outline-variant

**Dimensions**

- [ ] `cmp/menu/min-width` (112)
- [ ] `cmp/menu/max-width` (280)
- [ ] `cmp/menu/item-height` (48)
- [ ] `cmp/menu/padding-block` → sys/number/space/xs
- [ ] `cmp/menu/item-padding-inline` → sys/number/space/md
- [ ] `cmp/menu/radius` → sys/number/radius/sm

---

#### Bottom Sheet

**Colors**

- [ ] `cmp/bottom-sheet/container` → sys/color/surface-container/low
- [ ] `cmp/bottom-sheet/handle` → sys/color/on-surface-variant
- [ ] `cmp/bottom-sheet/scrim` → sys/color/scrim

**Dimensions**

- [ ] `cmp/bottom-sheet/radius` → sys/number/radius/2xl (top corners)
- [ ] `cmp/bottom-sheet/handle-width` (32)
- [ ] `cmp/bottom-sheet/handle-height` (4)
- [ ] `cmp/bottom-sheet/handle-radius` → sys/number/radius/full

---

#### Banner

**Colors**

- [ ] `cmp/banner/container` → sys/color/surface
- [ ] `cmp/banner/supporting-text` → sys/color/on-surface
- [ ] `cmp/banner/icon` → sys/color/primary

---

#### Accordion / Collapse

**Colors**

- [ ] `cmp/accordion/container` → sys/color/surface
- [ ] `cmp/accordion/container/focus` → sys/color/surface-container/low
- [ ] `cmp/accordion/header` → sys/color/on-surface
- [ ] `cmp/accordion/header/hover` → sys/color/on-surface
- [ ] `cmp/accordion/content` → sys/color/on-surface-variant
- [ ] `cmp/accordion/divider` → sys/color/outline-variant
- [ ] `cmp/accordion/icon` → sys/color/on-surface-variant

**Dimensions**

- [ ] `cmp/accordion/padding-inline` → sys/number/space/md
- [ ] `cmp/accordion/padding-block` → sys/number/space/md
- [ ] `cmp/accordion/gap` → sys/number/space/sm
- [ ] `cmp/accordion/icon-size` → sys/number/size/icon/md
- [ ] `cmp/accordion/border-width` → sys/number/border-width/thin
- [ ] `cmp/accordion/radius` → sys/number/radius/md

---

#### Alert

**Colors**

- [ ] `cmp/alert/info/container` → sys/color/info-container
- [ ] `cmp/alert/info/icon` → sys/color/info
- [ ] `cmp/alert/info/label` → sys/color/on-info-container
- [ ] `cmp/alert/success/container` → sys/color/success-container
- [ ] `cmp/alert/success/icon` → sys/color/success
- [ ] `cmp/alert/success/label` → sys/color/on-success-container
- [ ] `cmp/alert/warning/container` → sys/color/warning-container
- [ ] `cmp/alert/warning/icon` → sys/color/warning
- [ ] `cmp/alert/warning/label` → sys/color/on-warning-container
- [ ] `cmp/alert/error/container` → sys/color/error-container
- [ ] `cmp/alert/error/icon` → sys/color/error
- [ ] `cmp/alert/error/label` → sys/color/on-error-container
- [ ] `cmp/alert/neutral/container` → sys/color/surface-container
- [ ] `cmp/alert/neutral/icon` → sys/color/on-surface-variant
- [ ] `cmp/alert/neutral/label` → sys/color/on-surface

**Dimensions**

- [ ] `cmp/alert/padding-inline` → sys/number/space/md
- [ ] `cmp/alert/padding-block` → sys/number/space/md
- [ ] `cmp/alert/gap` → sys/number/space/md
- [ ] `cmp/alert/radius` → sys/number/radius/md
- [ ] `cmp/alert/icon-size` → sys/number/size/icon/lg
- [ ] `cmp/alert/border-width` → sys/number/border-width/thin

---

#### Avatar

**Colors**

- [ ] `cmp/avatar/placeholder/container` → sys/color/surface-variant
- [ ] `cmp/avatar/placeholder/icon` → sys/color/on-surface-variant
- [ ] `cmp/avatar/placeholder/label` → sys/color/on-surface-variant
- [ ] `cmp/avatar/outline` → sys/color/outline-variant
- [ ] `cmp/avatar/status/online` → sys/color/success
- [ ] `cmp/avatar/status/offline` → sys/color/on-surface/disabled

**Dimensions**

- [ ] `cmp/avatar/xs` → sys/number/size/avatar/xs
- [ ] `cmp/avatar/sm` → sys/number/size/avatar/sm
- [ ] `cmp/avatar/md` → sys/number/size/avatar/md
- [ ] `cmp/avatar/lg` → sys/number/size/avatar/lg
- [ ] `cmp/avatar/xl` → sys/number/size/avatar/xl
- [ ] `cmp/avatar/2xl` → sys/number/size/avatar/2xl
- [ ] `cmp/avatar/radius` → sys/number/radius/full
- [ ] `cmp/avatar/outline-width` → sys/number/border-width/medium
- [ ] `cmp/avatar/status-size` (12)
- [ ] `cmp/avatar/group-overlap` (-8)

---

#### Autocomplete / Combobox

**Colors**

- [ ] `cmp/autocomplete/container` → sys/color/surface
- [ ] `cmp/autocomplete/input-text` → sys/color/on-surface
- [ ] `cmp/autocomplete/placeholder` → sys/color/on-surface-variant
- [ ] `cmp/autocomplete/outline` → sys/color/outline
- [ ] `cmp/autocomplete/outline/focus` → sys/color/primary
- [ ] `cmp/autocomplete/label` → sys/color/on-surface-variant
- [ ] `cmp/autocomplete/label/focus` → sys/color/primary
- [ ] `cmp/autocomplete/listbox/container` → sys/color/surface-container
- [ ] `cmp/autocomplete/listbox/item` → sys/color/on-surface
- [ ] `cmp/autocomplete/listbox/item/hover` → sys/color/on-surface (8% overlay)
- [ ] `cmp/autocomplete/listbox/item/selected` → sys/color/secondary-container
- [ ] `cmp/autocomplete/listbox/item/selected/label` → sys/color/on-secondary-container
- [ ] `cmp/autocomplete/listbox/empty` → sys/color/on-surface-variant

**Dimensions**

- [ ] `cmp/autocomplete/height` → sys/number/size/control/lg
- [ ] `cmp/autocomplete/padding-inline` → sys/number/space/md
- [ ] `cmp/autocomplete/radius` → sys/number/radius/sm
- [ ] `cmp/autocomplete/border-width` → sys/number/border-width/thin
- [ ] `cmp/autocomplete/border-width/focus` → sys/number/border-width/medium
- [ ] `cmp/autocomplete/listbox/max-height` (320)
- [ ] `cmp/autocomplete/listbox/radius` → sys/number/radius/sm
- [ ] `cmp/autocomplete/listbox/item-height` (48)
- [ ] `cmp/autocomplete/listbox/padding-block` → sys/number/space/xs

---

#### Breadcrumbs

**Colors**

- [ ] `cmp/breadcrumbs/label` → sys/color/on-surface-variant
- [ ] `cmp/breadcrumbs/label/current` → sys/color/on-surface
- [ ] `cmp/breadcrumbs/link` → sys/color/link
- [ ] `cmp/breadcrumbs/link/hover` → sys/color/link/hover
- [ ] `cmp/breadcrumbs/separator` → sys/color/on-surface-variant

**Dimensions**

- [ ] `cmp/breadcrumbs/gap` → sys/number/space/xs
- [ ] `cmp/breadcrumbs/icon-size` → sys/number/size/icon/sm

---

#### Calendar / Date Picker

**Colors**

- [ ] `cmp/calendar/container` → sys/color/surface-container
- [ ] `cmp/calendar/header/label` → sys/color/on-surface
- [ ] `cmp/calendar/header/icon` → sys/color/on-surface-variant
- [ ] `cmp/calendar/day/label` → sys/color/on-surface
- [ ] `cmp/calendar/day/label/today` → sys/color/primary
- [ ] `cmp/calendar/day/selected/container` → sys/color/primary
- [ ] `cmp/calendar/day/selected/label` → sys/color/on-primary
- [ ] `cmp/calendar/day/range/container` → sys/color/primary-container
- [ ] `cmp/calendar/day/range/label` → sys/color/on-primary-container
- [ ] `cmp/calendar/day/hover` → sys/color/on-surface (8% overlay)
- [ ] `cmp/calendar/day/disabled` → sys/color/on-surface/disabled
- [ ] `cmp/calendar/day/outside-month` → sys/color/on-surface-variant
- [ ] `cmp/calendar/weekday/label` → sys/color/on-surface-variant

**Dimensions**

- [ ] `cmp/calendar/radius` → sys/number/radius/lg
- [ ] `cmp/calendar/padding` → sys/number/space/md
- [ ] `cmp/calendar/day-size` (40)
- [ ] `cmp/calendar/day-radius` → sys/number/radius/full
- [ ] `cmp/calendar/gap` → sys/number/space/xs
- [ ] `cmp/calendar/header-height` (48)

---

#### Carousel

**Colors**

- [ ] `cmp/carousel/container` → sys/color/surface
- [ ] `cmp/carousel/indicator/active` → sys/color/primary
- [ ] `cmp/carousel/indicator/inactive` → sys/color/outline-variant
- [ ] `cmp/carousel/nav-button/container` → sys/color/surface-container/high
- [ ] `cmp/carousel/nav-button/icon` → sys/color/on-surface

**Dimensions**

- [ ] `cmp/carousel/gap` → sys/number/space/md
- [ ] `cmp/carousel/radius` → sys/number/radius/lg
- [ ] `cmp/carousel/indicator-size` (8)
- [ ] `cmp/carousel/indicator-radius` → sys/number/radius/full
- [ ] `cmp/carousel/indicator-gap` → sys/number/space/xs
- [ ] `cmp/carousel/nav-button-size` (40)
- [ ] `cmp/carousel/nav-button-radius` → sys/number/radius/full

---

#### Chat Bubble

**Colors**

- [ ] `cmp/chat/bubble/sent/container` → sys/color/primary-container
- [ ] `cmp/chat/bubble/sent/label` → sys/color/on-primary-container
- [ ] `cmp/chat/bubble/received/container` → sys/color/surface-container
- [ ] `cmp/chat/bubble/received/label` → sys/color/on-surface
- [ ] `cmp/chat/header` → sys/color/on-surface-variant
- [ ] `cmp/chat/footer` → sys/color/on-surface-variant
- [ ] `cmp/chat/timestamp` → sys/color/on-surface-variant

**Dimensions**

- [ ] `cmp/chat/bubble/padding-inline` → sys/number/space/md
- [ ] `cmp/chat/bubble/padding-block` → sys/number/space/sm
- [ ] `cmp/chat/bubble/radius` → sys/number/radius/lg
- [ ] `cmp/chat/bubble/max-width` (320)
- [ ] `cmp/chat/gap` → sys/number/space/sm
- [ ] `cmp/chat/avatar-size` → sys/number/size/avatar/sm

---

#### Dock (fixed bottom action bar)

**Colors**

- [ ] `cmp/dock/container` → sys/color/surface-container
- [ ] `cmp/dock/icon/active` → sys/color/primary
- [ ] `cmp/dock/icon/inactive` → sys/color/on-surface-variant
- [ ] `cmp/dock/label/active` → sys/color/primary
- [ ] `cmp/dock/label/inactive` → sys/color/on-surface-variant
- [ ] `cmp/dock/indicator` → sys/color/primary

**Dimensions**

- [ ] `cmp/dock/height` (64)
- [ ] `cmp/dock/icon-size` → sys/number/size/icon/lg
- [ ] `cmp/dock/padding-inline` → sys/number/space/md
- [ ] `cmp/dock/gap` → sys/number/space/lg

---

#### Dropdown

**Colors**

- [ ] `cmp/dropdown/trigger/label` → sys/color/on-surface
- [ ] `cmp/dropdown/trigger/icon` → sys/color/on-surface-variant
- [ ] `cmp/dropdown/content/container` → sys/color/surface-container
- [ ] `cmp/dropdown/content/label` → sys/color/on-surface
- [ ] `cmp/dropdown/content/item/hover` → sys/color/on-surface (8% overlay)

**Dimensions**

- [ ] `cmp/dropdown/content/min-width` (192)
- [ ] `cmp/dropdown/content/radius` → sys/number/radius/sm
- [ ] `cmp/dropdown/content/padding-block` → sys/number/space/xs
- [ ] `cmp/dropdown/content/item-height` (40)
- [ ] `cmp/dropdown/content/item-padding-inline` → sys/number/space/md

---

#### Fieldset

**Colors**

- [ ] `cmp/fieldset/container` → sys/color/surface
- [ ] `cmp/fieldset/outline` → sys/color/outline-variant
- [ ] `cmp/fieldset/legend` → sys/color/on-surface
- [ ] `cmp/fieldset/description` → sys/color/on-surface-variant

**Dimensions**

- [ ] `cmp/fieldset/padding` → sys/number/space/lg
- [ ] `cmp/fieldset/radius` → sys/number/radius/md
- [ ] `cmp/fieldset/border-width` → sys/number/border-width/thin
- [ ] `cmp/fieldset/gap` → sys/number/space/md

---

#### File Input

**Colors**

- [ ] `cmp/file-input/container` → sys/color/surface
- [ ] `cmp/file-input/button/container` → sys/color/surface-container/highest
- [ ] `cmp/file-input/button/label` → sys/color/on-surface
- [ ] `cmp/file-input/placeholder` → sys/color/on-surface-variant
- [ ] `cmp/file-input/outline` → sys/color/outline
- [ ] `cmp/file-input/outline/focus` → sys/color/primary
- [ ] `cmp/file-input/outline/error` → sys/color/error
- [ ] `cmp/file-input/outline/disabled`

**Dimensions**

- [ ] `cmp/file-input/height` → sys/number/size/control/lg
- [ ] `cmp/file-input/radius` → sys/number/radius/sm
- [ ] `cmp/file-input/border-width` → sys/number/border-width/thin
- [ ] `cmp/file-input/padding-inline` → sys/number/space/md

---

#### Footer

**Colors**

- [ ] `cmp/footer/container` → sys/color/surface-container
- [ ] `cmp/footer/heading` → sys/color/on-surface
- [ ] `cmp/footer/label` → sys/color/on-surface-variant
- [ ] `cmp/footer/link` → sys/color/link
- [ ] `cmp/footer/link/hover` → sys/color/link/hover
- [ ] `cmp/footer/divider` → sys/color/outline-variant

**Dimensions**

- [ ] `cmp/footer/padding-inline` → sys/number/space/xl
- [ ] `cmp/footer/padding-block` → sys/number/space/2xl
- [ ] `cmp/footer/gap` → sys/number/space/xl
- [ ] `cmp/footer/column-gap` → sys/number/space/2xl

---

#### Hero

**Colors**

- [ ] `cmp/hero/container` → sys/color/surface
- [ ] `cmp/hero/overlay` → sys/color/scrim
- [ ] `cmp/hero/headline` → sys/color/on-surface
- [ ] `cmp/hero/supporting-text` → sys/color/on-surface-variant

**Dimensions**

- [ ] `cmp/hero/min-height` (480)
- [ ] `cmp/hero/padding-inline` → sys/number/space/2xl
- [ ] `cmp/hero/padding-block` → sys/number/space/3xl
- [ ] `cmp/hero/content-max-width` (640)
- [ ] `cmp/hero/gap` → sys/number/space/lg

---

#### Kbd (keyboard key)

**Colors**

- [ ] `cmp/kbd/container` → sys/color/surface-container/highest
- [ ] `cmp/kbd/label` → sys/color/on-surface
- [ ] `cmp/kbd/outline` → sys/color/outline-variant

**Dimensions**

- [ ] `cmp/kbd/min-width` (24)
- [ ] `cmp/kbd/height` (24)
- [ ] `cmp/kbd/padding-inline` → sys/number/space/xs
- [ ] `cmp/kbd/radius` → sys/number/radius/xs
- [ ] `cmp/kbd/border-width` → sys/number/border-width/thin

---

#### Link

**Colors**

- [ ] `cmp/link/label` → sys/color/link
- [ ] `cmp/link/label/hover` → sys/color/link/hover
- [ ] `cmp/link/label/visited` → sys/color/link/visited
- [ ] `cmp/link/label/focus` → sys/color/link/focus
- [ ] `cmp/link/underline` → sys/color/link
- [ ] `cmp/link/underline/hover` → sys/color/link/hover

**Dimensions**

- [ ] `cmp/link/underline-offset` (2)
- [ ] `cmp/link/underline-thickness` → sys/number/border-width/thin

---

#### List

**Colors**

- [ ] `cmp/list/container` → sys/color/surface
- [ ] `cmp/list/item/container` → sys/color/surface
- [ ] `cmp/list/item/container/hover` → sys/color/on-surface (8% overlay)
- [ ] `cmp/list/item/container/selected` → sys/color/secondary-container
- [ ] `cmp/list/item/headline` → sys/color/on-surface
- [ ] `cmp/list/item/supporting-text` → sys/color/on-surface-variant
- [ ] `cmp/list/item/leading-icon` → sys/color/on-surface-variant
- [ ] `cmp/list/item/trailing-icon` → sys/color/on-surface-variant
- [ ] `cmp/list/item/trailing-text` → sys/color/on-surface-variant
- [ ] `cmp/list/divider` → sys/color/outline-variant

**Dimensions**

- [ ] `cmp/list/item/min-height/one-line` (48)
- [ ] `cmp/list/item/min-height/two-line` (64)
- [ ] `cmp/list/item/min-height/three-line` (88)
- [ ] `cmp/list/item/padding-inline` → sys/number/space/md
- [ ] `cmp/list/item/padding-block` → sys/number/space/sm
- [ ] `cmp/list/item/gap` → sys/number/space/md
- [ ] `cmp/list/item/leading-size` → sys/number/size/icon/lg
- [ ] `cmp/list/item/avatar-size` → sys/number/size/avatar/sm

---

#### Loading / Skeleton

**Colors**

- [ ] `cmp/loading/spinner` → sys/color/primary
- [ ] `cmp/loading/spinner/on-primary` → sys/color/on-primary
- [ ] `cmp/skeleton/container` → sys/color/surface-container/highest
- [ ] `cmp/skeleton/shimmer` → sys/color/surface-container/low

**Dimensions**

- [ ] `cmp/loading/sm` (16)
- [ ] `cmp/loading/md` (24)
- [ ] `cmp/loading/lg` (48)
- [ ] `cmp/loading/xl` (64)
- [ ] `cmp/skeleton/radius` → sys/number/radius/sm
- [ ] `cmp/skeleton/height/text` (16)
- [ ] `cmp/skeleton/height/heading` (24)
- [ ] `cmp/skeleton/height/image` (200)
- [ ] `cmp/skeleton/radius/circle` → sys/number/radius/full

---

#### Pagination

**Colors**

- [ ] `cmp/pagination/item/container` → sys/color/surface
- [ ] `cmp/pagination/item/container/hover` → sys/color/surface-container
- [ ] `cmp/pagination/item/container/active` → sys/color/primary
- [ ] `cmp/pagination/item/label` → sys/color/on-surface
- [ ] `cmp/pagination/item/label/active` → sys/color/on-primary
- [ ] `cmp/pagination/item/label/disabled` → sys/color/on-surface/disabled
- [ ] `cmp/pagination/nav-icon` → sys/color/on-surface-variant
- [ ] `cmp/pagination/nav-icon/disabled` → sys/color/on-surface/disabled

**Dimensions**

- [ ] `cmp/pagination/item-size` (40)
- [ ] `cmp/pagination/item-radius` → sys/number/radius/sm
- [ ] `cmp/pagination/gap` → sys/number/space/xs
- [ ] `cmp/pagination/icon-size` → sys/number/size/icon/md

---

#### Popover

**Colors**

- [ ] `cmp/popover/container` → sys/color/surface-container
- [ ] `cmp/popover/headline` → sys/color/on-surface
- [ ] `cmp/popover/supporting-text` → sys/color/on-surface-variant

**Dimensions**

- [ ] `cmp/popover/min-width` (200)
- [ ] `cmp/popover/max-width` (360)
- [ ] `cmp/popover/padding` → sys/number/space/md
- [ ] `cmp/popover/radius` → sys/number/radius/md
- [ ] `cmp/popover/gap` → sys/number/space/sm

---

#### Range Slider

**Colors**

- [ ] `cmp/range/track` → sys/color/surface-container/highest
- [ ] `cmp/range/track/active` → sys/color/primary
- [ ] `cmp/range/thumb` → sys/color/primary
- [ ] `cmp/range/thumb/hover` → sys/color/primary/hover
- [ ] `cmp/range/thumb/disabled` → sys/color/on-surface/disabled
- [ ] `cmp/range/track/disabled` → sys/color/on-surface/disabled
- [ ] `cmp/range/value-label/container` → sys/color/primary
- [ ] `cmp/range/value-label/label` → sys/color/on-primary

**Dimensions**

- [ ] `cmp/range/track-height` (4)
- [ ] `cmp/range/track-radius` → sys/number/radius/full
- [ ] `cmp/range/thumb-size` (20)
- [ ] `cmp/range/thumb-radius` → sys/number/radius/full
- [ ] `cmp/range/value-label-size` (28)
- [ ] `cmp/range/value-label-radius` → sys/number/radius/full

---

#### Rating

**Colors**

- [ ] `cmp/rating/icon/active` → sys/color/warning
- [ ] `cmp/rating/icon/inactive` → sys/color/on-surface/disabled
- [ ] `cmp/rating/icon/hover` → sys/color/warning/hover

**Dimensions**

- [ ] `cmp/rating/icon-size` → sys/number/size/icon/lg
- [ ] `cmp/rating/gap` → sys/number/space/xs

---

#### Select

**Colors**

- [ ] `cmp/select/container` → sys/color/surface
- [ ] `cmp/select/label` → sys/color/on-surface-variant
- [ ] `cmp/select/label/focus` → sys/color/primary
- [ ] `cmp/select/label/error` → sys/color/error
- [ ] `cmp/select/value` → sys/color/on-surface
- [ ] `cmp/select/placeholder` → sys/color/on-surface-variant
- [ ] `cmp/select/outline` → sys/color/outline
- [ ] `cmp/select/outline/hover` → sys/color/on-surface
- [ ] `cmp/select/outline/focus` → sys/color/primary
- [ ] `cmp/select/outline/error` → sys/color/error
- [ ] `cmp/select/outline/disabled`
- [ ] `cmp/select/icon` → sys/color/on-surface-variant
- [ ] `cmp/select/supporting-text` → sys/color/on-surface-variant
- [ ] `cmp/select/supporting-text/error` → sys/color/error
- [ ] `cmp/select/menu/container` → sys/color/surface-container
- [ ] `cmp/select/menu/item` → sys/color/on-surface
- [ ] `cmp/select/menu/item/hover` → sys/color/on-surface (8% overlay)
- [ ] `cmp/select/menu/item/selected` → sys/color/secondary-container

**Dimensions**

- [ ] `cmp/select/height` → sys/number/size/control/lg
- [ ] `cmp/select/padding-inline` → sys/number/space/md
- [ ] `cmp/select/radius` → sys/number/radius/sm
- [ ] `cmp/select/border-width` → sys/number/border-width/thin
- [ ] `cmp/select/border-width/focus` → sys/number/border-width/medium
- [ ] `cmp/select/icon-size` → sys/number/size/icon/md
- [ ] `cmp/select/menu/max-height` (320)
- [ ] `cmp/select/menu/radius` → sys/number/radius/sm
- [ ] `cmp/select/menu/item-height` (48)

---

#### Stat

**Colors**

- [ ] `cmp/stat/container` → sys/color/surface
- [ ] `cmp/stat/value` → sys/color/on-surface
- [ ] `cmp/stat/title` → sys/color/on-surface-variant
- [ ] `cmp/stat/description` → sys/color/on-surface-variant
- [ ] `cmp/stat/icon` → sys/color/primary
- [ ] `cmp/stat/trend/positive` → sys/color/success
- [ ] `cmp/stat/trend/negative` → sys/color/error

**Dimensions**

- [ ] `cmp/stat/padding` → sys/number/space/md
- [ ] `cmp/stat/gap` → sys/number/space/xs
- [ ] `cmp/stat/icon-size` → sys/number/size/icon/xl

---

#### Stepper / Steps

**Colors**

- [ ] `cmp/stepper/step/container/completed` → sys/color/primary
- [ ] `cmp/stepper/step/container/active` → sys/color/primary
- [ ] `cmp/stepper/step/container/pending` → sys/color/surface-container/highest
- [ ] `cmp/stepper/step/label/completed` → sys/color/on-primary
- [ ] `cmp/stepper/step/label/active` → sys/color/on-primary
- [ ] `cmp/stepper/step/label/pending` → sys/color/on-surface-variant
- [ ] `cmp/stepper/step/title` → sys/color/on-surface
- [ ] `cmp/stepper/step/title/pending` → sys/color/on-surface-variant
- [ ] `cmp/stepper/step/description` → sys/color/on-surface-variant
- [ ] `cmp/stepper/connector/completed` → sys/color/primary
- [ ] `cmp/stepper/connector/pending` → sys/color/outline-variant

**Dimensions**

- [ ] `cmp/stepper/step-size` (32)
- [ ] `cmp/stepper/step-radius` → sys/number/radius/full
- [ ] `cmp/stepper/connector-height` → sys/number/border-width/medium
- [ ] `cmp/stepper/gap` → sys/number/space/sm
- [ ] `cmp/stepper/icon-size` → sys/number/size/icon/sm

---

#### Table

**Colors**

- [ ] `cmp/table/container` → sys/color/surface
- [ ] `cmp/table/header/container` → sys/color/surface-container
- [ ] `cmp/table/header/label` → sys/color/on-surface
- [ ] `cmp/table/row/container` → sys/color/surface
- [ ] `cmp/table/row/container/hover` → sys/color/on-surface (4% overlay)
- [ ] `cmp/table/row/container/selected` → sys/color/secondary-container
- [ ] `cmp/table/row/container/striped` → sys/color/surface-container/lowest
- [ ] `cmp/table/cell/label` → sys/color/on-surface
- [ ] `cmp/table/divider` → sys/color/outline-variant
- [ ] `cmp/table/sort-icon` → sys/color/on-surface-variant
- [ ] `cmp/table/sort-icon/active` → sys/color/primary

**Dimensions**

- [ ] `cmp/table/header-height` (56)
- [ ] `cmp/table/row-height` (52)
- [ ] `cmp/table/cell-padding-inline` → sys/number/space/md
- [ ] `cmp/table/cell-padding-block` → sys/number/space/sm
- [ ] `cmp/table/border-width` → sys/number/border-width/thin
- [ ] `cmp/table/radius` → sys/number/radius/md
- [ ] `cmp/table/checkbox-padding` → sys/number/space/sm

---

#### Textarea

**Colors**

- [ ] `cmp/textarea/container` → sys/color/surface
- [ ] `cmp/textarea/input-text` → sys/color/on-surface
- [ ] `cmp/textarea/placeholder` → sys/color/on-surface-variant
- [ ] `cmp/textarea/label` → sys/color/on-surface-variant
- [ ] `cmp/textarea/label/focus` → sys/color/primary
- [ ] `cmp/textarea/label/error` → sys/color/error
- [ ] `cmp/textarea/outline` → sys/color/outline
- [ ] `cmp/textarea/outline/hover` → sys/color/on-surface
- [ ] `cmp/textarea/outline/focus` → sys/color/primary
- [ ] `cmp/textarea/outline/error` → sys/color/error
- [ ] `cmp/textarea/outline/disabled`
- [ ] `cmp/textarea/supporting-text` → sys/color/on-surface-variant
- [ ] `cmp/textarea/supporting-text/error` → sys/color/error
- [ ] `cmp/textarea/counter` → sys/color/on-surface-variant

**Dimensions**

- [ ] `cmp/textarea/min-height` (120)
- [ ] `cmp/textarea/padding-inline` → sys/number/space/md
- [ ] `cmp/textarea/padding-block` → sys/number/space/md
- [ ] `cmp/textarea/radius` → sys/number/radius/sm
- [ ] `cmp/textarea/border-width` → sys/number/border-width/thin
- [ ] `cmp/textarea/border-width/focus` → sys/number/border-width/medium

---

#### Timeline

**Colors**

- [ ] `cmp/timeline/connector` → sys/color/outline-variant
- [ ] `cmp/timeline/dot/container` → sys/color/primary
- [ ] `cmp/timeline/dot/icon` → sys/color/on-primary
- [ ] `cmp/timeline/dot/outline` → sys/color/outline-variant
- [ ] `cmp/timeline/content/headline` → sys/color/on-surface
- [ ] `cmp/timeline/content/supporting-text` → sys/color/on-surface-variant
- [ ] `cmp/timeline/content/timestamp` → sys/color/on-surface-variant

**Dimensions**

- [ ] `cmp/timeline/dot-size` (32)
- [ ] `cmp/timeline/dot-radius` → sys/number/radius/full
- [ ] `cmp/timeline/connector-width` → sys/number/border-width/medium
- [ ] `cmp/timeline/gap` → sys/number/space/md
- [ ] `cmp/timeline/content-padding` → sys/number/space/md
- [ ] `cmp/timeline/icon-size` → sys/number/size/icon/sm

---

## 6. Phase 4 — Figma Styles (non-variable)

These **cannot** be Figma variables and must be created as **Figma Styles**.

### 6A. Text Styles

Create one text style per brand per typography token. Organize by brand using Figma's `/` grouping.

**Naming pattern:** `{brand}/typography/{facet}/{scale}`

Each style composes: font-family, font-size, font-weight, line-height, letter-spacing (sourced from the corresponding `sys/number/typography/*` and `sys/string/font-family/*` variables for documentation, applied directly in the style definition).

#### Per brand (repeat for each of 7 brands):

**Display**

- [ ] `{brand}/typography/display/lg`
- [ ] `{brand}/typography/display/md`
- [ ] `{brand}/typography/display/sm`

**Headline**

- [ ] `{brand}/typography/headline/lg`
- [ ] `{brand}/typography/headline/md`
- [ ] `{brand}/typography/headline/sm`

**Title**

- [ ] `{brand}/typography/title/lg`
- [ ] `{brand}/typography/title/md`
- [ ] `{brand}/typography/title/sm`

**Body**

- [ ] `{brand}/typography/body/lg`
- [ ] `{brand}/typography/body/md`
- [ ] `{brand}/typography/body/sm`

**Label**

- [ ] `{brand}/typography/label/lg`
- [ ] `{brand}/typography/label/md`
- [ ] `{brand}/typography/label/sm`

> **Total text styles:** 15 styles × 7 brands = **105 text styles**.

---

### 6B. Effect Styles (Elevation / Shadow)

Shadows are composite (x, y, blur, spread, color) and must be Figma Effect Styles.

**Naming pattern:** `{brand}/elevation/{level}`

Levels follow Material Design's elevation model. Shadow color should reference `sys/color/shadow` conceptually (apply manually since effect styles can't alias variables for shadow color).

#### Per brand (repeat for each of 7 brands, or create shared if shadows are identical):

- [ ] `{brand}/elevation/0` (none)
- [ ] `{brand}/elevation/1` (e.g., 0 1 2 0 rgba shadow + 0 1 3 1 rgba shadow)
- [ ] `{brand}/elevation/2`
- [ ] `{brand}/elevation/3`
- [ ] `{brand}/elevation/4`
- [ ] `{brand}/elevation/5`

> **Total effect styles:** 6 levels × 7 brands = **42 effect styles** (or 6 shared if identical across brands).

---

### 6C. Color Styles (Gradients only)

Figma variables don't support gradients. Create these as Color Styles.

**Naming pattern:** `{brand}/gradient/{name}`

#### Per brand (as needed):

- [ ] `{brand}/gradient/primary` (linear gradient using primary palette)
- [ ] `{brand}/gradient/surface` (subtle background gradient)
- [ ] `{brand}/gradient/scrim` (fade-to-transparent overlay)
- [ ] `{brand}/gradient/hero` (hero section gradient, if applicable)

> Only create gradient styles that are actually used. This list is illustrative.

---

### 6D. Grid Styles (optional)

If you standardize layout grids, create Grid Styles.

- [ ] `layout/grid/mobile` (e.g., 4-col, 16px gutter, 16px margin)
- [ ] `layout/grid/tablet` (e.g., 8-col, 24px gutter, 32px margin)
- [ ] `layout/grid/desktop` (e.g., 12-col, 24px gutter, auto margin, max-width 1200px)

> Grid styles are brand-agnostic unless brands use different layout grids.

---

## 7. Phase 5 — Wiring & Validation

After all variables and styles are created, validate the system.

### Aliasing chain audit

- [ ] Every `sys/color/*` variable aliases a `ref/color/*` variable (no raw hex in sys layer)
- [ ] Every `cmp/*` color variable aliases a `sys/color/*` variable (no raw hex or ref alias in cmp layer)
- [ ] Every `sys/number/*` variable aliases a `ref/number/*` variable
- [ ] Every `cmp/*` number variable aliases a `sys/number/*` variable
- [ ] No circular references exist

### Mode coverage audit

- [ ] All 7 brand modes in `ref/color` have values for every variable (no empty cells)
- [ ] All 14 brand-theme modes in `sys/color` have aliases for every variable
- [ ] If `ref/number` or `sys/number` use brand modes, all modes are populated

### Scoping audit

- [ ] Color variables are scoped to appropriate properties (fill, stroke, etc.)
- [ ] Number variables are scoped to appropriate properties (gap, padding, corner-radius, width, height, stroke-weight, font-size, line-height, etc.)
- [ ] String variables are scoped appropriately (or left unscoped for code-export only)

### Brand-switch smoke test

- [ ] Create a test frame with representative components
- [ ] Switch `ref/color` mode to each of 7 brands — verify colors cascade correctly through sys → cmp
- [ ] Switch `sys/color` mode between light and dark — verify theme changes propagate
- [ ] Verify alias brands (ccci, camp, city) resolve identically to `cru`

### Token export validation

- [ ] Export variables to JSON using Figma plugin (e.g., Variables2JSON, Tokens Studio)
- [ ] Verify exported names match the canonical token format from Design Token Rules
- [ ] Verify exported aliases resolve correctly
- [ ] Validate CSS custom property generation matches expected format

### Component library integration

- [ ] Apply `cmp/*` color variables to all component fills and strokes
- [ ] Apply `cmp/*` number variables to all component dimensions, padding, radii
- [ ] Apply Text Styles to all text layers in components
- [ ] Apply Effect Styles to all elevated components
- [ ] Verify components update correctly when brand/theme modes are switched

---

## Summary Counts

| Category | Estimated count |
|---|---|
| **Variable collections** | 7 |
| **ref/color variables** | ~202 (18 hue scales × 10 steps + 22 contrast) |
| **ref/number variables** | ~95 |
| **ref/string variables** | ~21 (font-family across system-ui, web-safe, plain, brand tiers) |
| **sys/color variables** | ~80 |
| **sys/number variables** | ~115 |
| **sys/string variables** | ~3 |
| **cmp variables (mixed)** | ~650+ (colors + numbers in one collection, organized by component) |
| **Text styles** | ~105 (15 × 7 brands) |
| **Effect styles** | ~42 (6 × 7 brands) |
| **Gradient color styles** | ~28 (4 × 7 brands, as needed) |
| **Grid styles** | ~3 |
| **Total variables** | **~1,120+** |
| **Total styles** | **~178** |
| **Total mode values to populate** | **~3,000+** (many ref/color cells are neutral fallbacks) |

---

> **Implementation order recommendation:**
> 1. `ref/color` → `ref/number` → `ref/string` (foundation)
> 2. `sys/color` → `sys/number` → `sys/string` (semantics)
> 3. Text Styles + Effect Styles + Gradient Styles (composites)
> 4. `cmp/color` → `cmp/number` (component wiring)
> 5. Validation & smoke testing
> 6. Component library integration
