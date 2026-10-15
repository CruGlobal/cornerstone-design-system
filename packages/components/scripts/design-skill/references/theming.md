# Theming & on-brand color

Cornerstone is themed entirely with CSS, with no build step or preprocessor. The stylesheet you load
picks the theme and its palette, a class on `<html>` sets light or dark, and you customize with `--cs-*`
tokens. **Never hardcode hex colors, px spacing, or font sizes**; that breaks theming and consistency.

For the _why_ behind WA's three-layer color system — why semantic tokens beat palette tints, why
`*-on-*` pairings are non-negotiable, and how to avoid the "accessible but ugly" trap — see
[principles.md § Color](principles.md#1-color-less-is-more-and-never-alone).

Full docs: https://cruglobal.github.io/cornerstone-design-system/themes

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

**The stylesheet you load picks the theme, not a class.** A theme's palette and its default role
colors are set on `:root`, so the theme stylesheet loaded last colors the whole page. Load one theme
per page.

- `cs-theme-*` doesn't switch to a theme or scope one to a subtree. On the element it's on, it
  re-applies part of a theme that's already loaded: its fonts, sizes, and which shades it uses for
  surfaces, text and fills. The hues still come from `:root`, so on a page with two themes loaded, a
  `cs-theme-*` section gets a mix of both. With one theme loaded you don't need it.
- `cs-light` / `cs-dark` sets the color scheme (see below).

### Themes

- **Cru:** `.cs-theme-cru` — the default. Generated from Cru's key colors on a luminance ladder.
- **FamilyLife:** `.cs-theme-fl`. Generated from FamilyLife's key colors the same way. Opt in by
  loading `styles/themes/fl.css` after `cornerstone.css`. It switches the whole page with or without
  the class, so don't mix it with another theme on one page. It asks for font family `Akkurat` but
  doesn't load it, so the site supplies Regular for weights up to 500 and Bold for 600 and up.
  Semibold and bold look the same in this theme.
- **Default:** `.cs-theme-default` — an unbranded reference, for a product not using Cru's brand.
  Opt in by importing `styles/themes/default.css`.

A new brand is **generated, not picked from a list**: `tools/palette.mjs` takes a brand's key colors
and solves every other step for its contrast target. There is no menu of ready-made looks to choose
between.

### Palettes

Each theme's stylesheet imports the palette it needs, so there is nothing to choose. Cru's and
FamilyLife's palettes have no class, so you can't scope one to a subtree. Only the reference palette
has one, `cs-palette-default`.

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
`turquoise`, `vermilion`, `yellow`. FamilyLife's palette has 10: `blue`, `cool-gray`, `dark-green`,
`mint`, `off-white`, `orange`, `pink`, `ruby`, `soft-black`, `yellow`. The reference palette has 10:
`red`, `orange`, `yellow`, `green`, `cyan`, `blue`, `indigo`, `purple`, `pink`, `gray`.

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
via `::part()`, and [customizing](https://cruglobal.github.io/cornerstone-design-system/customizing/) for the full reference.

---

## Rules

- Style with **semantic tokens** (`--cs-color-brand-*`, `--cs-color-surface-*`, `--cs-color-text-*`)
  over raw palette tints, and never with hardcoded hex.
- Load **one** theme per page: `cornerstone.css` brings Cru's, or load another theme's stylesheet
  after it. A page with no theme loaded looks broken.
- Prefer `.cs-brand-{hue}` remapping over per-component color overrides.
- Built-in palettes are tuned for WCAG-contrast `on-*` pairings, so use `*-on-*` for text on filled
  backgrounds and you stay accessible for free.
- **Watch quiet/plain controls on colored bands.** A `appearance="plain"` or otherwise "quiet" button
  inherits a muted text color tuned for the page surface; dropped onto a brand/colored section it can read
  as low-contrast or disabled. On a colored band, give secondary actions a full-contrast on-color text
  (the matching `*-on-*` token) or use a filled/outlined appearance — don't leave them muted.
