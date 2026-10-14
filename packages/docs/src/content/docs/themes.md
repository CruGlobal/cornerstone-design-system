---
title: Built-in Themes
description: Cru's theme gives the whole library the brand's typography, spacing, borders and shadows.
---

A theme gives your project a cohesive look and feel across the entire Cornerstone library. Cornerstone
applies Cru's for you, and ships FamilyLife's and an unbranded one you can opt into.

A theme sets typography, spacing, borders, shadows, and how [variants](/tokens/color#variant-colors) show up
on components — all as [design tokens](/tokens). Two themes can share a [color palette](/color-palettes) and
[variant colors](/tokens/color#variant-colors) and still feel completely different, and a theme may include
custom overrides for individual components.

Three themes ship, and Cru's is the one you get: `cornerstone.css` imports it. It is self-contained, carrying
its own [color palette](/color-palettes) and [variant colors](/tokens/color#variant-colors) rather than
layering over another theme. FamilyLife's is built the same way. To use it, load `styles/themes/fl.css`
after `cornerstone.css`; the whole page switches, with or without a class, so use one theme per page. It
asks for font family `Akkurat` for body and headings but doesn't load it, so your site has to supply it:
Regular for weights up to 500 and Bold for 600 and up. Semibold and bold look the same in this theme.
Default is the unbranded reference theme, kept as an opt-in starting point rather than the base. The
Awesome and Shoelace themes this library was forked alongside have been removed.

Below are Cru's theme and FamilyLife's, each in both color schemes: drag a slider to compare dark against
light.

::theme-preview

Next is FamilyLife's theme, loaded after `cornerstone.css`:

::theme-preview{theme="fl"}

This preview shows the system font, not Akkurat: Akkurat's license covers only FamilyLife's own sites, so a
site using this theme supplies the font itself.

## Using Cru's Theme

::theme-install
