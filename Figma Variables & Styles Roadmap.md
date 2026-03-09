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
| color (ref + sys + cmp) | **Variable (Color)** | Single color value; supports aliasing and modes |
| space | **Variable (Number)** | Single numeric value (px) |
| size | **Variable (Number)** | Single numeric value (px) |
| border-radius | **Variable (Number)** | Single numeric value (px) |
| border-width | **Variable (Number)** | Single numeric value (px) |
| opacity | **Variable (Number)** | Single numeric value (0–1) |
| z-index | **Variable (Number)** | Single numeric value |
| font-family | **Variable (String)** | Text value |
| font-weight | **Variable (Number)** | Numeric weight (400, 700, etc.) |
| font-size | **Variable (Number)** | Single numeric value (px) |
| line-height | **Variable (Number)** | Single numeric value (px or %) |
| letter-spacing | **Variable (Number)** | Single numeric value (px or %) |
| typography (composite) | **Text Style** | Combines font-family, size, weight, line-height, letter-spacing — Figma variables cannot express composites |
| elevation / shadow | **Effect Style** | Composite (x, y, blur, spread, color) — no variable equivalent |
| gradient | **Color Style** | Figma variables don't support gradients |
| motion / easing | **Not in Figma** | Document in token JSON only; Figma has no motion primitive |
| time / duration | **Not in Figma** | Document in token JSON only |
| icons | **Not in Figma** | Handled via component instances, not variables or styles |

### Mode Strategy

Figma allows one active mode per collection per frame. Because the token system needs **two dimensions** (brand + theme), we split them across chained collections:

```
┌──────────────────────────────┐
│  ref/color                   │  Modes = Brands
│  (raw hue palettes)          │  cru │ mil │ aia │ fl │ jfp │ unto │ josh
│                              │
│  Superset of ALL hue names   │  Each brand populates its own hues.
│  across every brand.         │  Unused hues get a neutral fallback.
└──────────────┬───────────────┘
               │ aliases ↓ (each brand mode picks different ref hues)
┌──────────────▼───────────────┐
│  sys/color                   │  Modes = Brand × Theme
│  (semantic roles)            │  cru-light │ cru-dark │ mil-light │ ...
│                              │  (7 brands × 2 themes = 14 modes)
│  "primary" aliases a         │
│  DIFFERENT ref hue per       │
│  brand mode.                 │
└──────────────┬───────────────┘
               │ aliases ↓
┌──────────────▼───────────────┐
│  cmp/color                   │  No modes (brand-agnostic)
│  (component parts)           │  aliases → sys/color
└──────────────────────────────┘
```

**How brand-switching works:**

1. `ref/color` holds a **superset** of every hue palette across all brands (yellow, blue, red, green, charcoal, teal, etc.). Each brand mode populates the hues it actually owns with real values. Hues a brand doesn't use are filled with a neutral fallback so no variable is ever empty.

2. `sys/color` has **brand×theme modes** (e.g., `cru-light`, `josh-dark`). Each mode aliases semantic roles (primary, secondary, surface…) to the specific `ref/color` hue that brand uses. This is where Cru's `sys/color/primary` → `ref/color/yellow/500` while Josh's `sys/color/primary` → `ref/color/blue/500`.

3. `cmp/color` has **no modes**. It aliases `sys/color`, so brand + theme changes cascade automatically.

> **Why sys/color needs brand×theme modes:** Reference tokens are raw hue palettes — they carry no semantic meaning. Each brand maps different hues to roles like "primary" or "secondary." That mapping must live at the system tier, and since it varies per brand AND per theme (light primary ≠ dark primary), `sys/color` needs the full brand×theme matrix. With 7 brands × 2 themes = 14 modes. Figma Enterprise supports up to 40 modes per collection. Add high-contrast later as a third theme column if needed (21 modes).

### Alias Brands

Per the token rules, alias brands (ccci, camp, city) do **not** get their own modes. They resolve to `cru`. If an alias brand later needs a unique override, promote it to its own mode at that time.

**Unique brand modes (7):** `cru` · `mil` · `aia` · `fl` · `jfp` · `unto` · `josh`

---

## 2. Collection & Mode Map

Summary of every Figma variable collection to build.

| # | Collection name | Variable type | Modes | Description |
|---|---|---|---|---|
| 1 | `ref/color` | Color | 7 brands | Superset of all brand hue palettes (yellow, blue, red, etc. × scale). Each brand mode populates its hues; unused hues get neutral fallback. |
| 2 | `ref/number` | Number | 7 brands (or 1 if shared) | Raw spacing steps, size steps, base radii, base border widths, base opacity, base z-index |
| 3 | `ref/string` | String | 7 brands (or 1 if shared) | Font family names |
| 4 | `sys/color` | Color | 14 (7 brands × 2 themes) | Semantic color roles aliasing ref/color |
| 5 | `sys/number` | Number | 7 brands (or 1 if shared) | Semantic spacing, sizing, radius, border-width, typography numbers, z-index, opacity |
| 6 | `sys/string` | String | 7 brands (or 1 if shared) | Semantic font-family aliases |
| 7 | `cmp` | Mixed (Color + Number) | None (1 default) | All component tokens — colors, dimensions, radii — organized by component. Brand-agnostic; aliases sys layer. |

> **Simplification option:** If spacing, sizing, radii, and typography numbers are identical across all brands, `ref/number` and `sys/number` can use a single mode. Add brand modes later only when a brand diverges.

---

## 3. Phase 1 — Reference Variables

### 3A. Collection: `ref/color`

**Type:** Color
**Modes:** `cru` · `mil` · `aia` · `fl` · `jfp` · `unto` · `josh`
**Scoping:** All scopes (fill, stroke, etc.) — primitives should be available everywhere for flexibility.

This collection is a **superset of every hue palette across all brands**. Each brand mode populates the hues it owns with real values. Hues a brand doesn't use are filled with a neutral fallback (e.g., `ref/color/gray/500`) so no cell is empty.

> **Important:** These are raw, non-semantic hue names — the actual named colors from each brand's palette (lemon, yellow, cyan, navy, etc.), not roles like "primary." Semantic assignment happens at the `sys/color` tier.

#### Color palette variables

Each hue uses a **10-step scale: `50, 100, 200, 300, 400, 500, 600, 700, 800, 900`** — matching the structure already built in `csds.tokens.json`. Step 500 is the brand-specified source color; lighter steps (50–400) are tints, darker steps (600–900) are shades.

Cru's 20 source colors (5 families × 4 hues each) have already been expanded into 10-step scales. Other brands will add their own hues to this superset. The full list below reflects the current Cru palette plus placeholders for other brands.

#### Hue-to-brand usage map

This table tracks which brands actually use each hue. Brands that don't use a hue get a neutral fallback value in that mode.

| Hue | Source family | cru | mil | aia | fl | jfp | unto | josh |
|---|---|---|---|---|---|---|---|---|
| lemon | warm | ✓ | | | | | | |
| yellow | warm | ✓ | | | | | | |
| orange | warm | ✓ | | | | | | |
| vermilion | warm | ✓ | | | | | | |
| rose | pink | ✓ | | | | | | |
| pink | pink | ✓ | | | | | | |
| cerise | pink | ✓ | | | | | | |
| ruby | pink | ✓ | | | | | | |
| sky | cool | ✓ | | | | | | |
| cyan | cool | ✓ | | | | | | |
| turquoise | cool | ✓ | | | | | | |
| navy | cool | ✓ | | | | | | |
| mint | green | ✓ | | | | | | |
| green | green | ✓ | | | | | | |
| moss | green | ✓ | | | | | | |
| olive-drab | green | ✓ | | | | | | |
| gray | neutral | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| graphite | neutral | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

> **Action item:** As each brand's palette is audited, add their hue rows (or mark ✓ on existing rows if they share a hue name). Other brands will add new rows for hues Cru doesn't have. This table is your source of truth for which cells need real values vs. fallbacks.

#### Contrast colors (special group)

These are not hue scales — they are fixed contrast values with opacity variants, used for overlays, scrims, and text-on-image.

- [ ] `ref/color/contrast/white` → #FFFFFF
- [ ] `ref/color/contrast/black` → #000000
- [ ] `ref/color/contrast/opacity/white-90` → #FFFFFF @ 90%
- [ ] `ref/color/contrast/opacity/white-80` → #FFFFFF @ 80%
- [ ] `ref/color/contrast/opacity/white-70` → #FFFFFF @ 70%
- [ ] `ref/color/contrast/opacity/white-60` → #FFFFFF @ 60%
- [ ] `ref/color/contrast/opacity/white-50` → #FFFFFF @ 50%
- [ ] `ref/color/contrast/opacity/white-40` → #FFFFFF @ 40%
- [ ] `ref/color/contrast/opacity/white-30` → #FFFFFF @ 30%
- [ ] `ref/color/contrast/opacity/white-20` → #FFFFFF @ 20%
- [ ] `ref/color/contrast/opacity/white-10` → #FFFFFF @ 10%
- [ ] `ref/color/contrast/opacity/black-90` → #000000 @ 90%
- [ ] `ref/color/contrast/opacity/black-80` → #000000 @ 80%
- [ ] `ref/color/contrast/opacity/black-70` → #000000 @ 70%
- [ ] `ref/color/contrast/opacity/black-60` → #000000 @ 60%
- [ ] `ref/color/contrast/opacity/black-50` → #000000 @ 50%
- [ ] `ref/color/contrast/opacity/black-40` → #000000 @ 40%
- [ ] `ref/color/contrast/opacity/black-30` → #000000 @ 30%
- [ ] `ref/color/contrast/opacity/black-20` → #000000 @ 20%
- [ ] `ref/color/contrast/opacity/black-10` → #000000 @ 10%

---

#### Hue scales

Each hue group below has 10 steps. Cru's values are defined; other brand modes populate their own values or get fallbacks.

**Warm family**

**lemon** *(Cru 500: #FFE378)*

- [ ] `ref/color/lemon/50`
- [ ] `ref/color/lemon/100`
- [ ] `ref/color/lemon/200`
- [ ] `ref/color/lemon/300`
- [ ] `ref/color/lemon/400`
- [ ] `ref/color/lemon/500` → #FFE378
- [ ] `ref/color/lemon/600`
- [ ] `ref/color/lemon/700`
- [ ] `ref/color/lemon/800`
- [ ] `ref/color/lemon/900`

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

> **Total ref/color variables:** 18 hue scales × 10 steps + 22 contrast colors = **202 variables** × 7 brand modes = **~1,414 cell values** to populate (many will be neutral fallbacks for hues a brand doesn't own).
>
> **Naming note:** Use Figma's `/` group separator for hierarchy. `ref/color/yellow/500` displays as a nested group in the variables panel.
>
> **Fallback rule:** For any hue a brand doesn't use, set all 10 steps to `ref/color/gray/500` (or another obvious fallback). This makes it immediately visible if a sys token accidentally aliases an unused hue.
>
> **Adding brand hues:** When a new brand is audited, its unique hues are added as new groups to this superset. For example, if Josh/Sightline uses "cobalt" and "slate" hues that Cru doesn't have, add `ref/color/cobalt/{50–900}` and `ref/color/slate/{50–900}` groups. All other brand modes get fallback values for the new hues.

#### Example: How sys/color aliases ref/color per brand

| sys/color variable | cru-light mode aliases → | josh-light mode aliases → | aia-light mode aliases → |
|---|---|---|---|
| `sys/color/primary` | `ref/color/yellow/500` | *(e.g., ref/color/cobalt/500)* | *(e.g., ref/color/ruby/500)* |
| `sys/color/primary/hover` | `ref/color/yellow/400` | *(e.g., ref/color/cobalt/400)* | *(e.g., ref/color/ruby/400)* |
| `sys/color/secondary` | `ref/color/navy/500` | *(e.g., ref/color/slate/600)* | *(e.g., ref/color/navy/500)* |
| `sys/color/surface` | `ref/color/gray/50` | `ref/color/gray/50` | `ref/color/gray/50` |

> This table is illustrative. Each brand×theme mode in `sys/color` defines which `ref/color` hue+step maps to each semantic role.

---

### 3B. Collection: `ref/number`

**Type:** Number
**Modes:** 1 default mode (add brand modes only if brands diverge)
**Scoping:** Set per-variable (see notes).

#### Space scale

Raw spacing primitives in px. These are your base building blocks.

- [ ] `ref/number/space/0` → 0
- [ ] `ref/number/space/1` → 1
- [ ] `ref/number/space/2` → 2
- [ ] `ref/number/space/4` → 4
- [ ] `ref/number/space/6` → 6
- [ ] `ref/number/space/8` → 8
- [ ] `ref/number/space/10` → 10
- [ ] `ref/number/space/12` → 12
- [ ] `ref/number/space/16` → 16
- [ ] `ref/number/space/20` → 20
- [ ] `ref/number/space/24` → 24
- [ ] `ref/number/space/32` → 32
- [ ] `ref/number/space/40` → 40
- [ ] `ref/number/space/48` → 48
- [ ] `ref/number/space/56` → 56
- [ ] `ref/number/space/64` → 64
- [ ] `ref/number/space/80` → 80
- [ ] `ref/number/space/96` → 96
- [ ] `ref/number/space/120` → 120
- [ ] `ref/number/space/160` → 160

> **Scoping:** Gap, padding (all sides), item spacing.

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

Per `csds.tokens.json`, uses semantic names rather than numeric steps.

- [ ] `ref/borderRadius/none` → 0
- [ ] `ref/borderRadius/subtle` → 8
- [ ] `ref/borderRadius/round` → 20
- [ ] `ref/borderRadius/full` → 9999

**Per-corner overrides** *(alias the base values for directional control)*

- [ ] `ref/borderRadius/tl/none` → ref/borderRadius/none
- [ ] `ref/borderRadius/tr/none` → ref/borderRadius/none
- [ ] `ref/borderRadius/br/none` → ref/borderRadius/none
- [ ] `ref/borderRadius/bl/none` → ref/borderRadius/none
- [ ] `ref/borderRadius/t/none` → ref/borderRadius/none
- [ ] `ref/borderRadius/r/none` → ref/borderRadius/none
- [ ] `ref/borderRadius/b/none` → ref/borderRadius/none
- [ ] `ref/borderRadius/l/none` → ref/borderRadius/none

> **Scoping:** Corner radius.
> **Note:** Add more per-corner aliases as needed (e.g., `tl/subtle`, `t/round`, etc.).

#### Border width scale

- [ ] `ref/number/border-width/0` → 0
- [ ] `ref/number/border-width/1` → 1
- [ ] `ref/number/border-width/2` → 2
- [ ] `ref/number/border-width/3` → 3
- [ ] `ref/number/border-width/4` → 4

> **Scoping:** Stroke weight (individual strokes).

#### Opacity scale

Per `csds.tokens.json`, uses 0–10 steps with values 0–100.

- [ ] `ref/opacity/0` → 0
- [ ] `ref/opacity/1` → 10
- [ ] `ref/opacity/2` → 20
- [ ] `ref/opacity/3` → 30
- [ ] `ref/opacity/4` → 40
- [ ] `ref/opacity/5` → 50
- [ ] `ref/opacity/6` → 60
- [ ] `ref/opacity/7` → 70
- [ ] `ref/opacity/8` → 80
- [ ] `ref/opacity/9` → 90
- [ ] `ref/opacity/10` → 100

> **Scoping:** Opacity.

#### Typography number primitives

Raw type scale values. These feed into `sys/number` semantic tokens and ultimately into Text Styles.

**Font size (px):**

- [ ] `ref/number/font-size/10` → 10
- [ ] `ref/number/font-size/11` → 11
- [ ] `ref/number/font-size/12` → 12
- [ ] `ref/number/font-size/14` → 14
- [ ] `ref/number/font-size/16` → 16
- [ ] `ref/number/font-size/18` → 18
- [ ] `ref/number/font-size/20` → 20
- [ ] `ref/number/font-size/22` → 22
- [ ] `ref/number/font-size/24` → 24
- [ ] `ref/number/font-size/28` → 28
- [ ] `ref/number/font-size/32` → 32
- [ ] `ref/number/font-size/36` → 36
- [ ] `ref/number/font-size/40` → 40
- [ ] `ref/number/font-size/48` → 48
- [ ] `ref/number/font-size/56` → 56
- [ ] `ref/number/font-size/64` → 64
- [ ] `ref/number/font-size/72` → 72

> **Scoping:** Font size (if supported; otherwise leave unscoped).

**Line height (px or %):**

- [ ] `ref/number/line-height/100` → 1.0 (100%)
- [ ] `ref/number/line-height/110` → 1.1
- [ ] `ref/number/line-height/120` → 1.2
- [ ] `ref/number/line-height/125` → 1.25
- [ ] `ref/number/line-height/130` → 1.3
- [ ] `ref/number/line-height/140` → 1.4
- [ ] `ref/number/line-height/150` → 1.5
- [ ] `ref/number/line-height/160` → 1.6
- [ ] `ref/number/line-height/175` → 1.75
- [ ] `ref/number/line-height/200` → 2.0

> **Scoping:** Line height.

**Font weight:**

- [ ] `ref/number/font-weight/100` → 100 (Thin)
- [ ] `ref/number/font-weight/200` → 200 (Extra Light)
- [ ] `ref/number/font-weight/300` → 300 (Light)
- [ ] `ref/number/font-weight/400` → 400 (Regular)
- [ ] `ref/number/font-weight/500` → 500 (Medium)
- [ ] `ref/number/font-weight/600` → 600 (Semi Bold)
- [ ] `ref/number/font-weight/700` → 700 (Bold)
- [ ] `ref/number/font-weight/800` → 800 (Extra Bold)
- [ ] `ref/number/font-weight/900` → 900 (Black)

> **Scoping note:** Figma doesn't natively bind font-weight to a number variable on the canvas. These exist for documentation parity and code export. Text Styles handle the actual weight in Figma.

**Letter spacing (px):**

- [ ] `ref/number/letter-spacing/tight` → -0.5
- [ ] `ref/number/letter-spacing/normal` → 0
- [ ] `ref/number/letter-spacing/wide` → 0.5
- [ ] `ref/number/letter-spacing/wider` → 1.0

> **Scoping:** Letter spacing (if supported).

#### Z-index scale

- [ ] `ref/number/z/0` → 0
- [ ] `ref/number/z/1` → 1
- [ ] `ref/number/z/10` → 10
- [ ] `ref/number/z/20` → 20
- [ ] `ref/number/z/30` → 30
- [ ] `ref/number/z/40` → 40
- [ ] `ref/number/z/50` → 50

> **Scoping note:** Z-index has no Figma canvas equivalent. These exist for token export to code only.

---

### 3C. Collection: `ref/string`

**Type:** String
**Modes:** 7 brands (font families differ per brand)

Per `csds.tokens.json`, font families are organized into tiers: system-ui fallbacks, web-safe fallbacks, plain (default cross-brand), and brand-specific.

#### Font family — system-ui (fallbacks)

- [ ] `ref/font-family/system-ui/sans` → `ui-sans-serif`
- [ ] `ref/font-family/system-ui/serif` → `ui-serif`
- [ ] `ref/font-family/system-ui/mono` → `ui-monospace`

#### Font family — web-safe (fallbacks)

- [ ] `ref/font-family/web-safe/sans` → `Arial`
- [ ] `ref/font-family/web-safe/serif` → `Times New Roman`
- [ ] `ref/font-family/web-safe/mono` → `Courier New`

#### Font family — plain (default cross-brand)

- [ ] `ref/font-family/plain/sans` → `Noto Sans`
- [ ] `ref/font-family/plain/serif` → `Noto Serif`
- [ ] `ref/font-family/plain/mono` → `Roboto Mono`

#### Font family — brand (per-brand primary typefaces)

These are empty by default and populated per brand mode.

- [ ] `ref/font-family/brand/sans-primary`
- [ ] `ref/font-family/brand/sans-secondary`
- [ ] `ref/font-family/brand/serif-primary`
- [ ] `ref/font-family/brand/serif-secondary`
- [ ] `ref/font-family/brand/mono-primary`
- [ ] `ref/font-family/brand/mono-secondary`

#### Font family — brand product (product/app-specific overrides)

- [ ] `ref/font-family/brand/product/sans-primary`
- [ ] `ref/font-family/brand/product/sans-secondary`
- [ ] `ref/font-family/brand/product/serif-primary`
- [ ] `ref/font-family/brand/product/serif-secondary`
- [ ] `ref/font-family/brand/product/mono-primary`
- [ ] `ref/font-family/brand/product/mono-secondary`

> **Scoping note:** Figma doesn't allow binding a string variable to font-family on the canvas. These exist for code export and documentation. Actual font binding happens through Text Styles.

---

## 4. Phase 2 — System Variables

### 4A. Collection: `sys/color`

**Type:** Color
**Modes (full-control path):** `cru-light` · `cru-dark` · `mil-light` · `mil-dark` · `aia-light` · `aia-dark` · `fl-light` · `fl-dark` · `jfp-light` · `jfp-dark` · `unto-light` · `unto-dark` · `josh-light` · `josh-dark`
**All values alias → `ref/color` variables.**

#### Primary

- [ ] `sys/color/primary`
- [ ] `sys/color/primary/hover`
- [ ] `sys/color/primary/pressed`
- [ ] `sys/color/primary/focus`
- [ ] `sys/color/primary/disabled`
- [ ] `sys/color/on-primary`
- [ ] `sys/color/on-primary/hover`
- [ ] `sys/color/primary-container`
- [ ] `sys/color/on-primary-container`

#### Secondary

- [ ] `sys/color/secondary`
- [ ] `sys/color/secondary/hover`
- [ ] `sys/color/secondary/pressed`
- [ ] `sys/color/secondary/focus`
- [ ] `sys/color/secondary/disabled`
- [ ] `sys/color/on-secondary`
- [ ] `sys/color/on-secondary/hover`
- [ ] `sys/color/secondary-container`
- [ ] `sys/color/on-secondary-container`

#### Tertiary

- [ ] `sys/color/tertiary`
- [ ] `sys/color/tertiary/hover`
- [ ] `sys/color/tertiary/pressed`
- [ ] `sys/color/tertiary/focus`
- [ ] `sys/color/tertiary/disabled`
- [ ] `sys/color/on-tertiary`
- [ ] `sys/color/on-tertiary/hover`
- [ ] `sys/color/tertiary-container`
- [ ] `sys/color/on-tertiary-container`

#### Error

- [ ] `sys/color/error`
- [ ] `sys/color/error/hover`
- [ ] `sys/color/error/pressed`
- [ ] `sys/color/on-error`
- [ ] `sys/color/error-container`
- [ ] `sys/color/on-error-container`

#### Warning

- [ ] `sys/color/warning`
- [ ] `sys/color/warning/hover`
- [ ] `sys/color/on-warning`
- [ ] `sys/color/warning-container`
- [ ] `sys/color/on-warning-container`

#### Success

- [ ] `sys/color/success`
- [ ] `sys/color/success/hover`
- [ ] `sys/color/on-success`
- [ ] `sys/color/success-container`
- [ ] `sys/color/on-success-container`

#### Info

- [ ] `sys/color/info`
- [ ] `sys/color/info/hover`
- [ ] `sys/color/on-info`
- [ ] `sys/color/info-container`
- [ ] `sys/color/on-info-container`

#### Surface

- [ ] `sys/color/surface`
- [ ] `sys/color/surface/dim`
- [ ] `sys/color/surface/bright`
- [ ] `sys/color/surface-variant`
- [ ] `sys/color/on-surface`
- [ ] `sys/color/on-surface/hover`
- [ ] `sys/color/on-surface/disabled`
- [ ] `sys/color/on-surface-variant`
- [ ] `sys/color/on-surface-variant/hover`
- [ ] `sys/color/surface-container/lowest`
- [ ] `sys/color/surface-container/low`
- [ ] `sys/color/surface-container`
- [ ] `sys/color/surface-container/high`
- [ ] `sys/color/surface-container/highest`
- [ ] `sys/color/inverse-surface`
- [ ] `sys/color/inverse-on-surface`

#### Background

- [ ] `sys/color/background`
- [ ] `sys/color/on-background`

#### Outline

- [ ] `sys/color/outline`
- [ ] `sys/color/outline/hover`
- [ ] `sys/color/outline/focus`
- [ ] `sys/color/outline/disabled`
- [ ] `sys/color/outline-variant`
- [ ] `sys/color/outline-variant/hover`

#### Scrim & Shadow

- [ ] `sys/color/scrim`
- [ ] `sys/color/shadow`

#### Inverse

- [ ] `sys/color/inverse-primary`

#### Link

- [ ] `sys/color/link`
- [ ] `sys/color/link/hover`
- [ ] `sys/color/link/visited`
- [ ] `sys/color/link/focus`

> **Total sys/color variables:** ~80+ variables × 14 brand-theme modes

---

### 4B. Collection: `sys/number`

**Type:** Number
**Modes:** 7 brands (if brands differ in spacing/sizing), or 1 default mode if shared.
**Values alias → `ref/number` variables.**

#### Semantic spacing

A single role-agnostic scale using t-shirt sizes. Values alias the raw `ref/number/space/*` steps. The system tier does **not** encode spatial role (padding, gap, inset, etc.) — that responsibility belongs to the component tier, where `cmp/*/padding/*`, `cmp/*/gap`, etc. reference these tokens.

> **Rationale:** In Figma, designers apply these tokens to auto layout padding and gap fields. The role is implicit in *where* the token is applied, not in the token name itself. This keeps the sys scale simple and avoids duplicating the same values across inline/stack/inset/gap groups. Component tokens (`cmp` tier) name the role explicitly for code translation.

**Space scale**

| Token | Value | Ref alias |
|---|---|---|
| - [ ] `sys/number/space/3xs` | 2px | `ref/number/space/2` |
| - [ ] `sys/number/space/2xs` | 4px | `ref/number/space/4` |
| - [ ] `sys/number/space/xs` | 8px | `ref/number/space/8` |
| - [ ] `sys/number/space/sm` | 12px | `ref/number/space/12` |
| - [ ] `sys/number/space/md` | 16px | `ref/number/space/16` |
| - [ ] `sys/number/space/lg` | 24px | `ref/number/space/24` |
| - [ ] `sys/number/space/xl` | 32px | `ref/number/space/32` |
| - [ ] `sys/number/space/2xl` | 40px | `ref/number/space/40` |
| - [ ] `sys/number/space/3xl` | 56px | `ref/number/space/56` |

**Scoping:** Gap, padding (all sides), item spacing.

**Negative space** *(for pull/overlap/negative margin use cases)*

| Token | Value | Mirrors |
|---|---|---|
| - [ ] `sys/number/space/neg/3xs` | -2px | `sys/number/space/3xs` |
| - [ ] `sys/number/space/neg/2xs` | -4px | `sys/number/space/2xs` |
| - [ ] `sys/number/space/neg/xs` | -8px | `sys/number/space/xs` |
| - [ ] `sys/number/space/neg/sm` | -12px | `sys/number/space/sm` |
| - [ ] `sys/number/space/neg/md` | -16px | `sys/number/space/md` |
| - [ ] `sys/number/space/neg/lg` | -24px | `sys/number/space/lg` |
| - [ ] `sys/number/space/neg/xl` | -32px | `sys/number/space/xl` |
| - [ ] `sys/number/space/neg/2xl` | -40px | `sys/number/space/2xl` |
| - [ ] `sys/number/space/neg/3xl` | -56px | `sys/number/space/3xl` |

**Scoping:** Gap, padding (all sides), item spacing.

> **Note:** Figma variables support negative numbers. Negative space tokens are useful for overlapping elements, pull margins, and stack offsets in auto layout.

#### Semantic sizing

**Icon sizes**

- [ ] `sys/number/size/icon/xs` (12)
- [ ] `sys/number/size/icon/sm` (16)
- [ ] `sys/number/size/icon/md` (20)
- [ ] `sys/number/size/icon/lg` (24)
- [ ] `sys/number/size/icon/xl` (32)
- [ ] `sys/number/size/icon/2xl` (40)

**Control heights** *(buttons, inputs, etc.)*

- [ ] `sys/number/size/control/xs` (24)
- [ ] `sys/number/size/control/sm` (32)
- [ ] `sys/number/size/control/md` (40)
- [ ] `sys/number/size/control/lg` (48)
- [ ] `sys/number/size/control/xl` (56)

**Avatar sizes**

- [ ] `sys/number/size/avatar/xs` (24)
- [ ] `sys/number/size/avatar/sm` (32)
- [ ] `sys/number/size/avatar/md` (40)
- [ ] `sys/number/size/avatar/lg` (56)
- [ ] `sys/number/size/avatar/xl` (80)
- [ ] `sys/number/size/avatar/2xl` (120)

#### Semantic border radius

- [ ] `sys/number/radius/none` → ref 0
- [ ] `sys/number/radius/xs` → ref 2
- [ ] `sys/number/radius/sm` → ref 4
- [ ] `sys/number/radius/md` → ref 8
- [ ] `sys/number/radius/lg` → ref 12
- [ ] `sys/number/radius/xl` → ref 16
- [ ] `sys/number/radius/2xl` → ref 24
- [ ] `sys/number/radius/full` → ref 9999

#### Semantic border width

- [ ] `sys/number/border-width/none` → 0
- [ ] `sys/number/border-width/thin` → 1
- [ ] `sys/number/border-width/medium` → 2
- [ ] `sys/number/border-width/thick` → 3

#### Semantic typography numbers

These are the individual numeric properties that compose each text style. They alias `ref/number/font-size/*`, `ref/number/line-height/*`, `ref/number/font-weight/*`, and `ref/number/letter-spacing/*`.

**Display**

| Variable | font-size | line-height | font-weight | letter-spacing |
|---|---|---|---|---|
| - [ ] `sys/number/typography/display/lg/font-size` | | | | |
| - [ ] `sys/number/typography/display/lg/line-height` | | | | |
| - [ ] `sys/number/typography/display/lg/font-weight` | | | | |
| - [ ] `sys/number/typography/display/lg/letter-spacing` | | | | |
| - [ ] `sys/number/typography/display/md/font-size` | | | | |
| - [ ] `sys/number/typography/display/md/line-height` | | | | |
| - [ ] `sys/number/typography/display/md/font-weight` | | | | |
| - [ ] `sys/number/typography/display/md/letter-spacing` | | | | |
| - [ ] `sys/number/typography/display/sm/font-size` | | | | |
| - [ ] `sys/number/typography/display/sm/line-height` | | | | |
| - [ ] `sys/number/typography/display/sm/font-weight` | | | | |
| - [ ] `sys/number/typography/display/sm/letter-spacing` | | | | |

**Headline**

| Variable |
|---|
| - [ ] `sys/number/typography/headline/lg/font-size` |
| - [ ] `sys/number/typography/headline/lg/line-height` |
| - [ ] `sys/number/typography/headline/lg/font-weight` |
| - [ ] `sys/number/typography/headline/lg/letter-spacing` |
| - [ ] `sys/number/typography/headline/md/font-size` |
| - [ ] `sys/number/typography/headline/md/line-height` |
| - [ ] `sys/number/typography/headline/md/font-weight` |
| - [ ] `sys/number/typography/headline/md/letter-spacing` |
| - [ ] `sys/number/typography/headline/sm/font-size` |
| - [ ] `sys/number/typography/headline/sm/line-height` |
| - [ ] `sys/number/typography/headline/sm/font-weight` |
| - [ ] `sys/number/typography/headline/sm/letter-spacing` |

**Title**

| Variable |
|---|
| - [ ] `sys/number/typography/title/lg/font-size` |
| - [ ] `sys/number/typography/title/lg/line-height` |
| - [ ] `sys/number/typography/title/lg/font-weight` |
| - [ ] `sys/number/typography/title/lg/letter-spacing` |
| - [ ] `sys/number/typography/title/md/font-size` |
| - [ ] `sys/number/typography/title/md/line-height` |
| - [ ] `sys/number/typography/title/md/font-weight` |
| - [ ] `sys/number/typography/title/md/letter-spacing` |
| - [ ] `sys/number/typography/title/sm/font-size` |
| - [ ] `sys/number/typography/title/sm/line-height` |
| - [ ] `sys/number/typography/title/sm/font-weight` |
| - [ ] `sys/number/typography/title/sm/letter-spacing` |

**Body**

| Variable |
|---|
| - [ ] `sys/number/typography/body/lg/font-size` |
| - [ ] `sys/number/typography/body/lg/line-height` |
| - [ ] `sys/number/typography/body/lg/font-weight` |
| - [ ] `sys/number/typography/body/lg/letter-spacing` |
| - [ ] `sys/number/typography/body/md/font-size` |
| - [ ] `sys/number/typography/body/md/line-height` |
| - [ ] `sys/number/typography/body/md/font-weight` |
| - [ ] `sys/number/typography/body/md/letter-spacing` |
| - [ ] `sys/number/typography/body/sm/font-size` |
| - [ ] `sys/number/typography/body/sm/line-height` |
| - [ ] `sys/number/typography/body/sm/font-weight` |
| - [ ] `sys/number/typography/body/sm/letter-spacing` |

**Label**

| Variable |
|---|
| - [ ] `sys/number/typography/label/lg/font-size` |
| - [ ] `sys/number/typography/label/lg/line-height` |
| - [ ] `sys/number/typography/label/lg/font-weight` |
| - [ ] `sys/number/typography/label/lg/letter-spacing` |
| - [ ] `sys/number/typography/label/md/font-size` |
| - [ ] `sys/number/typography/label/md/line-height` |
| - [ ] `sys/number/typography/label/md/font-weight` |
| - [ ] `sys/number/typography/label/md/letter-spacing` |
| - [ ] `sys/number/typography/label/sm/font-size` |
| - [ ] `sys/number/typography/label/sm/line-height` |
| - [ ] `sys/number/typography/label/sm/font-weight` |
| - [ ] `sys/number/typography/label/sm/letter-spacing` |

#### Semantic opacity

- [ ] `sys/number/opacity/disabled` → 0.38
- [ ] `sys/number/opacity/hover-overlay` → 0.08
- [ ] `sys/number/opacity/pressed-overlay` → 0.12
- [ ] `sys/number/opacity/focus-overlay` → 0.12
- [ ] `sys/number/opacity/dragged-overlay` → 0.16
- [ ] `sys/number/opacity/scrim` → 0.32

#### Semantic z-index

- [ ] `sys/number/z/base` → 0
- [ ] `sys/number/z/dropdown` → 10
- [ ] `sys/number/z/sticky` → 20
- [ ] `sys/number/z/overlay` → 30
- [ ] `sys/number/z/modal` → 40
- [ ] `sys/number/z/toast` → 50

---

### 4C. Collection: `sys/string`

**Type:** String
**Modes:** 7 brands

#### Semantic font family

- [ ] `sys/string/font-family/brand` → aliases `ref/string/font-family/sans` (or whichever is the brand's primary typeface)
- [ ] `sys/string/font-family/plain` → aliases `ref/string/font-family/sans` (UI / body typeface)
- [ ] `sys/string/font-family/code` → aliases `ref/string/font-family/mono`

> These exist for code export. In Figma, Text Styles handle the actual font-family.

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
