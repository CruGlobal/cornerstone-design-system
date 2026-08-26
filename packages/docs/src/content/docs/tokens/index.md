---
title: Design Tokens
description: CSS custom properties that control the look and feel of every Cornerstone component, giving your theme a consistent, customizable appearance.
pageIndex: true
---

Design tokens are the building blocks of your theme and thread through every Cornerstone component, giving
your project a cohesive look and feel. They control everything from typography and color to spacing and
borders.

## Using design tokens

Design tokens are CSS custom properties prefixed with `--cs-`. Use them in your own stylesheets by wrapping
the token name in the CSS `var()` function and assigning it to a property:

```css
.branded-container {
  background-color: var(--cs-color-brand-fill-normal);
  border: var(--cs-border-width-s) var(--cs-border-style) var(--cs-color-brand-border-normal);
  color: var(--cs-color-brand-on-normal);
}
```

## Customizing design tokens

Overriding a design token updates every component and style that references it, making it a breeze to style
and restyle your project. To customize a token, set its value in your styles. Setting tokens on `:root`
applies them globally across your entire project:

```css
:root {
  --cs-font-family-body: 'Inter', sans-serif;
  --cs-border-width-scale: 1.5; /* scales all border widths proportionally */
}
```

To customize a token that adapts to light and dark mode, scope the token to `.cs-light`, `.cs-dark`, and,
optionally, `.cs-invert`:

```css
:root,
.cs-light,
.cs-dark .cs-invert {
  --cs-color-surface-default: var(--cs-color-neutral-95);
}

.cs-dark,
.cs-invert {
  --cs-color-surface-default: var(--cs-color-neutral-05);
}
```

You can also scope tokens to a subtree rather than `:root`, which themes a single section or element
differently from the rest:

```css
*:state(user-invalid),
*:user-invalid {
  --cs-color-focus: var(--cs-color-danger-60);
  --cs-form-control-border-color: var(--cs-color-danger-border-normal);
  --cs-form-control-label-color: var(--cs-color-danger-on-quiet);
}
```

## Token reference
