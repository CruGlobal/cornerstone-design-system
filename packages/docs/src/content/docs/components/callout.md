---
title: Callout
category: Feedback
synonyms:
  - alert
  - admonition
  - notice
  - banner
  - infobox
use-cases:
  - warning message
  - info message
  - tip
  - important note
description: "Callouts display important messages inline with surrounding content. Use them to highlight tips, warnings, errors, or other information users should not miss."
---

```html {.example .anatomy}
<cs-callout>
  <cs-icon slot="icon" name="info" variant="fill"></cs-icon>
  This is a standard callout. You can customize its content and even the icon.
</cs-callout>
```

## Examples

### Variant

Set the `variant` attribute to match the callout to its message.

```html {.example}
<div class="cs-stack">
  <cs-callout variant="brand">
    <cs-icon slot="icon" name="info" variant="fill"></cs-icon>
    <strong>A new theme is available</strong><br />
    Try it from Settings whenever you're ready.
  </cs-callout>

  <cs-callout variant="success">
    <cs-icon slot="icon" name="check_circle" variant="fill"></cs-icon>
    <strong>Your changes have been saved</strong><br />
    You can safely close this tab now.
  </cs-callout>

  <cs-callout variant="neutral">
    <cs-icon slot="icon" name="settings"></cs-icon>
    <strong>Your settings have been updated</strong><br />
    Changes take effect on your next login.
  </cs-callout>

  <cs-callout variant="warning">
    <cs-icon slot="icon" name="warning" variant="fill"></cs-icon>
    <strong>Your session is about to expire</strong><br />
    Save your work to avoid losing it.
  </cs-callout>

  <cs-callout variant="danger">
    <cs-icon slot="icon" name="error" variant="fill"></cs-icon>
    <strong>This action can't be undone</strong><br />
    Deleting a project removes it for everyone on the team.
  </cs-callout>
</div>
```

### Appearance

Use the `appearance` attribute to change the callout's visual style. With no `appearance` set, a callout renders with a quiet fill and border, matching `filled-outlined`.

```html {.example}
<div class="cs-stack">
  <cs-callout variant="brand" appearance="accent">
    <cs-icon slot="icon" name="check_box" variant="fill"></cs-icon>
    This <strong>accent</strong> callout draws the most attention.
  </cs-callout>

  <cs-callout variant="brand" appearance="filled-outlined">
    <cs-icon slot="icon" name="format_color_fill"></cs-icon>
    This callout is both <strong>filled</strong> and <strong>outlined</strong>.
  </cs-callout>

  <cs-callout variant="brand" appearance="filled">
    <cs-icon slot="icon" name="format_paint"></cs-icon>
    This callout is only <strong>filled</strong>.
  </cs-callout>

  <cs-callout variant="brand" appearance="outlined">
    <cs-icon slot="icon" name="line_style"></cs-icon>
    Here's an <strong>outlined</strong> callout.
  </cs-callout>

  <cs-callout variant="brand" appearance="plain">
    <cs-icon slot="icon" name="text_fields"></cs-icon>
    No fill or border on this <strong>plain</strong> callout.
  </cs-callout>
</div>
```

### Size

Use the `size` attribute to change a callout's size.

```html {.example}
<div class="cs-stack">
  <cs-callout size="xs">
    <cs-icon slot="icon" name="info" variant="fill"></cs-icon>
    Extra-small callout for minimal emphasis.
  </cs-callout>

  <cs-callout size="s">
    <cs-icon slot="icon" name="info" variant="fill"></cs-icon>
    Small callout for a bit of emphasis.
  </cs-callout>

  <cs-callout size="m">
    <cs-icon slot="icon" name="info" variant="fill"></cs-icon>
    Medium callout, the default size.
  </cs-callout>

  <cs-callout size="l">
    <cs-icon slot="icon" name="info" variant="fill"></cs-icon>
    Large callout for more emphasis.
  </cs-callout>

  <cs-callout size="xl">
    <cs-icon slot="icon" name="info" variant="fill"></cs-icon>
    Extra-large callout for maximum emphasis.
  </cs-callout>
</div>
```

### Without an Icon

Icons are optional. Omit the `icon` slot for a text-only callout.

```html {.example}
<cs-callout variant="brand">All times are shown in your local timezone.</cs-callout>
```

### Customizing

Style a callout with regular CSS — `background`, `border`, `border-radius`, `color`, `padding`, and `margin` all work as expected.

```html {.example}
<cs-callout
  variant="brand"
  style="
    background: var(--cs-color-brand-fill-quiet);
    border-radius: var(--cs-border-radius-pill);
    border-style: dashed;
  "
>
  <cs-icon slot="icon" name="wand_stars"></cs-icon>
  A pinch of CSS goes a long way.
</cs-callout>
```
