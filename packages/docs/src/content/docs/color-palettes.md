---
title: Color Palettes
description: Cru's colour palette gives you the brand's full spectrum as design tokens.
---

A color palette gives you a full spectrum of colors to use in your project, as
[color design tokens](/tokens/color). Cornerstone ships Cru's, and applies it for you.

It defines nineteen hues, each with a scale of 11 tints from `05` (darkest) to `95` (lightest). The tints
are not picked by eye: each step's lightness is solved for a WCAG luminance target, so the distance between
two steps predicts their contrast ratio — 40 steps apart is 3:1, 50 is 4.5:1, and 60 is 7:1. Pair a hue
with a [theme](/themes) and [variant colors](/tokens/color#variant-colors) to style the whole library.

Unlike the reference palette, this one applies at the document root rather than under a `cs-palette-*`
class — it is the palette the library ships with, not one you switch on. The reference palette is still
there, because `themes/default.css` imports it, but a [theme](/themes) applies its own palette, so there is
nothing for you to choose between. The Awesome and Shoelace palettes this library was forked alongside have
been removed.

On every scale below, one step is **bold**: that hue's key step, which is what the bare `--cs-color-{hue}`
token resolves to and the colour as it appears in Cru's brand guidelines. The generator writes each brand
colour verbatim at the step whose luminance it already has, and makes that the key. Hover a swatch for its
token and value; click it to copy the token.

::color-palette

## Using This Palette

::palette-install

## Styling with Palette Colors

Once a palette is loaded, you can reach for any of its hue and tint tokens in your own CSS. Pair a hue's
[core color](/tokens/color#core-colors) (`--cs-color-{hue}`) with its matching on color
(`--cs-color-{hue}-on`) to keep text and icons readable on top of it:

```css
.callout-custom {
  background: var(--cs-color-cyan);
  color: var(--cs-color-cyan-on);
}
```

:::info
**Building with other tints?** The [Color tokens](/tokens/color) reference lists every tint and semantic
variant — pair them across the scale and you'll hit WCAG contrast ratios without doing the math.
:::
