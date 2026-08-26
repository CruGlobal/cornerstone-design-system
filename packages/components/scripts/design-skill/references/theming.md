# Theming & on-brand color

Cornerstone is themed entirely with CSS, with no build step or preprocessor. You set a theme and a
palette with classes on `<html>`, then customize with `--cs-*` tokens. **Never hardcode hex colors, px
spacing, or font sizes**; that breaks theming and consistency.

For the _why_ behind WA's three-layer color system — why semantic tokens beat palette tints, why
`*-on-*` pairings are non-negotiable, and how to avoid the "accessible but ugly" trap — see
[principles.md § Color](principles.md#1-color-less-is-more-and-never-alone).

Full docs: https://cruglobal.github.io/cornerstone-design-system/docs/themes

---

## The three layers

Color flows through three layers. You usually only touch the top one.

1. **Palette:** raw hues and tints: `--cs-color-{hue}-{tint}`, e.g. `--cs-color-blue-50`. 10 hues
   (red, orange, yellow, green, cyan, blue, indigo, purple, pink, gray) × 11 tints (`95` lightest to
   `05` darkest). You rarely reference these directly.
2. **Semantic variants:** roles that map onto hues: **brand**, **neutral**, **success**, **warning**,
   **danger**. Each exposes a fill/border/on family, e.g. `--cs-color-brand-fill-loud`,
   `--cs-color-success-border-normal`, `--cs-color-danger-on-loud`. **Prefer these:** they keep the UI
   consistent and re-theme automatically.
3. **Theme assignments:** surfaces and text: `--cs-color-surface-default`, `--cs-color-surface-raised`,
   `--cs-color-surface-lowered`, `--cs-color-surface-border`, `--cs-color-text-normal`,
   `--cs-color-text-quiet`, `--cs-color-text-link`. Use these for backgrounds, borders, and body text.

---

## Pick a theme

**Cru's theme is the default and needs no class.** Importing the library applies it, so most pages
only ever set the color scheme:

```html
<html class="cs-light"></html>
```

The class form exists for two other cases — scoping a theme to a subtree, and switching to a
different one:

```html
<html class="cs-theme-cru cs-light"></html>
```

- `cs-theme-*` sets the overall look (surfaces, radii, shadows, type) **and** its own palette.
- `cs-light` / `cs-dark` sets the color scheme (see below).

### Themes

- **Cru:** `.cs-theme-cru` — the default. Generated from Cru's key colors on a luminance ladder.
- **Default:** `.cs-theme-default` — an unbranded reference, for a product not using Cru's brand.
  Opt in by importing `styles/themes/default.css`.

A new brand is **generated, not picked from a list**: `tools/palette.mjs` takes a brand's key colors
and solves every other step for its contrast target. There is no menu of ready-made looks to choose
between.

### Palettes

Each theme imports the palette it needs, so there is normally nothing to choose. `cs-palette-*`
exists to scope one to a subtree.

---

## Match a brand color

The fastest way to re-brand within a theme: remap a **role** to a different hue with a
`.cs-{role}-{hue}` class.

```html
<!-- Cru's theme, with the brand role moved from gold to green -->
<html class="cs-brand-green cs-light"></html>
```

The hues available are **the ones the loaded theme's palette carries**, which is why the class list
differs per theme. Cru's palette has 19: `cerise`, `cyan`, `graphite`, `gray`, `green`, `lemon`,
`mint`, `moss`, `navy`, `olive-drab`, `orange`, `pink`, `purple`, `rose`, `ruby`, `sky`,
`turquoise`, `vermilion`, `yellow`. The reference palette has 10: `red`, `orange`, `yellow`,
`green`, `cyan`, `blue`, `indigo`, `purple`, `pink`, `gray`.

The same pattern works for every role that has a hue: `cs-brand-*`, `cs-highlight-*`,
`cs-information-*`, `cs-success-*`, `cs-warning-*`, `cs-danger-*`, `cs-neutral-*` and `cs-link-*`.

For a brand color that isn't one of the built-in hues, override the brand tokens on a scope. Declare
them with concrete values (don't rely on `var()` fallbacks):

```css
:root {
  --cs-color-brand-fill-loud: #6c2bd9;
  --cs-color-brand-fill-normal: #7e3af2;
  --cs-color-brand-on-loud: #ffffff;
}
```

Then use the role everywhere (`variant="brand"`, `--cs-color-brand-*`) instead of the raw color.

---

## Light & dark

Cornerstone uses **explicit classes**, not `prefers-color-scheme` alone, so you control the scheme:

- `cs-light`: light mode
- `cs-dark`: dark mode
- `cs-invert`: flip the current scheme for a subtree (e.g. a dark hero on a light page)

```html
<html class="cs-dark">
  …
  <section class="cs-invert">A light island inside a dark page</section>
</html>
```

To follow the OS preference, set the class from a small script reading
`window.matchMedia('(prefers-color-scheme: dark)')`, or default to `cs-light` and offer a toggle.

---

## Customize with tokens

Any `--cs-*` token can be overridden at any scope. Common knobs:

```css
:root {
  --cs-color-brand-fill-loud: var(--cs-color-purple-40); /* brand accent */
  --cs-border-radius-scale: 1.5; /* rounder corners everywhere */
  --cs-space-scale: 1.125; /* a touch more breathing room */
  --cs-font-family-body: 'Inter', system-ui, sans-serif;
}
```

Scope overrides to a subtree by putting them on a selector other than `:root`. See
[composition.md](composition.md) for the spacing/typography scales and for styling component internals
via `::part()`, and [customizing](https://cruglobal.github.io/cornerstone-design-system/docs/customizing/) for the full reference.

---

## Rules

- Style with **semantic tokens** (`--cs-color-brand-*`, `--cs-color-surface-*`, `--cs-color-text-*`)
  over raw palette tints, and never with hardcoded hex.
- Always set **a theme and a palette** on `<html>`; an unthemed page looks broken.
- Prefer `.cs-brand-{hue}` remapping over per-component color overrides.
- Built-in palettes are tuned for WCAG-contrast `on-*` pairings, so use `*-on-*` for text on filled
  backgrounds and you stay accessible for free.
- **Watch quiet/plain controls on colored bands.** A `appearance="plain"` or otherwise "quiet" button
  inherits a muted text color tuned for the page surface; dropped onto a brand/colored section it can read
  as low-contrast or disabled. On a colored band, give secondary actions a full-contrast on-color text
  (the matching `*-on-*` token) or use a filled/outlined appearance — don't leave them muted.
