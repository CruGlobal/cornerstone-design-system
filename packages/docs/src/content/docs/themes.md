---
title: Built-in Themes
description: Cru's theme gives the whole library the brand's typography, spacing, borders and shadows.
---

A theme gives your project a cohesive look and feel across the entire Cornerstone library. Cornerstone
ships Cru's, and applies it for you.

A theme sets typography, spacing, borders, shadows, and how [variants](/tokens/color#variant-colors) show up
on components — all as [design tokens](/tokens). Two themes can share a [color palette](/color-palettes) and
[variant colors](/tokens/color#variant-colors) and still feel completely different, and a theme may include
custom overrides for individual components.

Two themes ship, and Cru's is the one you get: `cornerstone.css` imports it. It is self-contained, carrying
its own [color palette](/color-palettes) and [variant colors](/tokens/color#variant-colors) rather than
layering over another theme. Default is the unbranded reference theme, kept as an opt-in starting point
rather than the base. The Awesome and Shoelace themes this library was forked alongside have been removed.

Below is Cru's theme in both color schemes: drag the slider to compare dark against light.

::theme-preview

## Using This Theme

::theme-install
