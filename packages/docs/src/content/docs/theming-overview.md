---
title: Theming
description: Style your project with Cornerstone's theming system — color palettes, variants, themes, and dark mode.
---

Cornerstone themes apply a cohesive look and feel across the entire library, built from stackable layers — a [theme](/themes), a [color palette](/color-palettes), [variants](/tokens/color#variant-colors), and a light or dark color scheme — that you mix and match with classes on the `<html>` element.

:::info
**Try it live!** Use the <cs-tag class="tag-ui" appearance="outlined"><cs-icon name="palette"></cs-icon></cs-tag> Theme and <cs-tag class="tag-ui" appearance="outlined"><cs-icon name="sunny"></cs-icon></cs-tag> Color Scheme selectors in this site's header to preview themes or switch light/dark modes.
:::

## Key Concepts

### Themes

`.cs-theme-{name}`

A theme is the overall look — fonts, borders, space, shadows, and how each [variant](/tokens/color#variant-colors) gets used across components. Two themes can share a [palette](/color-palettes) and [variants](/tokens/color#variant-colors) and still feel completely different. Themes ship with a default palette and may include custom CSS overrides for individual components.

Your theme is determined by `class="cs-theme-{name}"` on the `<html>` element. If no class is specified, the default theme is used.

<cs-button appearance="outlined" size="s" href="/themes">
  Browse Built-in Themes
  <cs-icon slot="end" name="arrow_forward"></cs-icon>
</cs-button>

### Color Palettes

`.cs-palette-{name}`

A color palette is the full set of 10 hues — red, orange, yellow, green, cyan, blue, indigo, purple, pink, and gray — each with 11 tints from `05` (darkest) to `95` (lightest), all available as [color design tokens](/tokens/color).

Each palette has its own hue shifts and chroma, so swapping palettes changes the entire feel of your project — especially alongside a [theme](/themes) and [variant colors](/tokens/color#variant-colors). Your palette is determined by `class="cs-palette-{name}"` on the `<html>` element; if no class is specified, the default palette is used.

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

Load the theme's stylesheet, then put its class on the `<html>` element. The snippets below cover each way of loading it.

::theme-install

## Creating Your Own

You can build a custom theme with [custom CSS](/customizing#customizing-with-css), overriding [design tokens](/tokens) in your own stylesheet.

## Quick Reference

| Task                    | How To                                                                        | Learn More                                                 |
| ----------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Change my brand color   | Add `class="cs-brand-{hue}"` to `<html>`                                       | [Changing Variants](/tokens/color#changing-variant-colors)  |
| Switch color palettes   | Load the palette stylesheet, then add `class="cs-palette-{name}"` to `<html>` | [Browse Palettes](/color-palettes)                         |
| Use a different theme   | Load the theme stylesheet, then add `class="cs-theme-{name}"` to `<html>`     | [Built-in Themes](/themes)                                 |
| Toggle dark mode        | Add `class="cs-dark"` to `<html>` (or any section)                            | [Light and Dark Mode](#light-and-dark-mode)                |
| Override a single token | Define a `--cs-*` custom property associated with a [design token](/tokens)   | [Customizing With CSS](/customizing#customizing-with-css)   |
