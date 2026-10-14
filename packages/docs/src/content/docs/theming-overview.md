---
title: Theming
description: Style your project with Cornerstone's theming system — color palettes, variants, themes, and dark mode.
---

Cornerstone's theming gives the whole library one look and feel. It has four layers: a [theme](/themes), a [color palette](/color-palettes), [variants](/tokens/color#variant-colors), and a light or dark color scheme. The stylesheet you load picks the theme, and the theme brings its own palette. Classes set the variants and the color scheme, on the `<html>` element or on any section.

:::info
**Try it live!** Use the <cs-tag class="tag-ui" appearance="outlined"><cs-icon name="light_mode"></cs-icon></cs-tag> color scheme menu in this site's header to switch between light and dark mode.
:::

## Key Concepts

### Themes

`styles/themes/{name}.css`

A theme is the overall look — fonts, borders, space, shadows, and how each [variant](/tokens/color#variant-colors) gets used across components. Two themes can share a [palette](/color-palettes) and [variants](/tokens/color#variant-colors) and still feel completely different. Themes ship with a default palette and may include custom CSS overrides for individual components.

The stylesheet you load picks your theme, not a class. `cornerstone.css` loads Cru's theme, so with no extra stylesheet and no class, you get Cru's. To use FamilyLife's theme instead, load its stylesheet after `cornerstone.css`, as [Using Themes](#using-themes) shows. Load one theme per page.

Each theme also matches a `cs-theme-{name}` class, but the class doesn't switch themes, and it doesn't limit a theme to one section. It only re-applies part of a theme that is already loaded: its fonts, sizes, and which shades it uses for surfaces, text and fills. The hues still come from the page root, so on a page with two themes loaded, a `cs-theme-{name}` section gets a blend of both.

<cs-button appearance="outlined" size="s" href="/themes">
  Browse Built-in Themes
  <cs-icon slot="end" name="arrow_forward"></cs-icon>
</cs-button>

### Color Palettes

`--cs-color-{hue}-{tint}`

A color palette is a theme's set of hues, each with 11 tints from `05` (darkest) to `95` (lightest), all available as [color design tokens](/tokens/color). Each brand names its own hues, so the list changes from theme to theme.

Each palette has its own hue shifts and chroma, so the palette sets much of a project's feel, along with the [theme](/themes) and [variant colors](/tokens/color#variant-colors). You don't pick a palette on its own: each theme's stylesheet loads the palette it needs. Cru's and FamilyLife's palettes have no class. Only the reference palette that comes with `themes/default.css` has one, `cs-palette-default`.

::color-palette

<cs-button appearance="outlined" size="s" href="/color-palettes">
  Browse All Palettes
  <cs-icon slot="end" name="arrow_forward"></cs-icon>
</cs-button>

### Variants

`.cs-{variant}-{hue}`

Variants assign palette hues to semantic roles — `brand`, `neutral`, `success`, `warning`, and `danger` among them — so components like buttons and callouts can convey meaning through color. Any hue from your palette can be assigned to any variant with `class="cs-{variant}-{hue}"`. Apply the class to the `<html>` element to set variants globally, to a wrapper to scope them to one section, or to a single component to override just that element. For deeper customization, [override the `--cs-color-{variant}-*` tokens](/customizing#customizing-with-css) in your own CSS.

::color-scales{scales="brand neutral success warning danger"}

<cs-button appearance="outlined" size="s" href="/tokens/color#variant-colors">
  See Variant Tokens
  <cs-icon slot="end" name="arrow_forward"></cs-icon>
</cs-button>

### Light and Dark Mode

<span class="cs-cluster">`.cs-light` `.cs-dark`</span>

Every theme is designed to adapt to light and dark mode. Light mode applies by default; apply `class="cs-light"` or `class="cs-dark"` to set the color scheme on the page or on any section. Because the classes cascade, a dark page can hold a light section, and the components inside each pick up the scheme around them.

```html {.example .no-color-scheme}
<div class="cs-grid">
  <cs-card class="cs-light">
    <div slot="header" class="cs-split cs-color-text-quiet">
      <h4 class="cs-heading-s">Light</h4>
      <cs-icon name="sunny"></cs-icon>
    </div>
    <div class="cs-stack">
      <cs-input label="# of Waffles" type="number" value="3"></cs-input>
      <cs-select label="Toppings" multiple value="jelly-beans">
        <cs-option value="whipped-cream">Whipped cream</cs-option>
        <cs-option value="hershey">Hershey's Kisses</cs-option>
        <cs-option value="jelly-beans">Jelly beans</cs-option>
      </cs-select>
      <cs-button appearance="filled" variant="brand">
        <cs-icon slot="start" name="grid_on"></cs-icon>
        Make Waffles
      </cs-button>
    </div>
  </cs-card>

  <cs-card class="cs-dark">
    <div slot="header" class="cs-split cs-color-text-quiet">
      <h4 class="cs-heading-s">Dark</h4>
      <cs-icon name="dark_mode"></cs-icon>
    </div>
    <div class="cs-stack">
      <cs-input label="# of Waffles" type="number" value="3"></cs-input>
      <cs-select label="Toppings" multiple value="jelly-beans">
        <cs-option value="whipped-cream">Whipped cream</cs-option>
        <cs-option value="hershey">Hershey's Kisses</cs-option>
        <cs-option value="jelly-beans">Jelly beans</cs-option>
      </cs-select>
      <cs-button appearance="filled" variant="brand">
        <cs-icon slot="start" name="grid_on"></cs-icon>
        Make Waffles
      </cs-button>
    </div>
  </cs-card>
</div>
```

## Using Themes

Load the theme's stylesheet. No class is needed: once it loads, the theme covers the whole page. Cru's theme is the default, and `cornerstone.css` already loads it. The snippets below cover each way of loading it.

::theme-install

### Loading FamilyLife's theme

To use FamilyLife's theme, load `styles/themes/fl.css` after `cornerstone.css`:

```js
import '@cruglobal/cornerstone-components/styles/cornerstone.css';
import '@cruglobal/cornerstone-components/styles/themes/fl.css';
```

```html
<link rel="stylesheet" href="/cornerstone/styles/cornerstone.css" />
<link rel="stylesheet" href="/cornerstone/styles/themes/fl.css" />
```

The order matters because `cornerstone.css` carries Cru's theme. Both themes set their values on the page root with the same strength, and when two rules tie like that, the one loaded last wins. Load `fl.css` first and Cru's values replace FamilyLife's, so the page looks like Cru. Load it last and FamilyLife's values win everywhere.

You still need `cornerstone.css`, because it also brings the native element styles and the utility classes, and `fl.css` has neither.

Keep to one theme per page. The two palettes share some hue names (`yellow`, `orange`, `pink`, `mint` and `ruby`), so two themes on one page blend together, and a `cs-theme-*` class can't pull them apart.

## Creating Your Own

You can build a custom theme with [custom CSS](/customizing#customizing-with-css), overriding [design tokens](/tokens) in your own stylesheet.

## Quick Reference

| Task                    | How To                                                                        | Learn More                                                 |
| ----------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Change my brand color   | Add `class="cs-brand-{hue}"` to `<html>`                                       | [Changing Variants](/tokens/color#changing-variant-colors)  |
| Use a different palette | Load the theme that carries it; each theme loads its own palette              | [Browse Palettes](/color-palettes)                         |
| Use FamilyLife's theme  | Load `styles/themes/fl.css` after `cornerstone.css`; no class needed          | [Using Themes](#using-themes)                              |
| Toggle dark mode        | Add `class="cs-dark"` to `<html>` (or any section)                            | [Light and Dark Mode](#light-and-dark-mode)                |
| Override a single token | Define a `--cs-*` custom property associated with a [design token](/tokens)   | [Customizing With CSS](/customizing#customizing-with-css)   |
