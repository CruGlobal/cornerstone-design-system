---
title: Button Group
category: Actions
synonyms:
  - button bar
  - toolbar
  - action group
  - segmented control
use-cases:
  - toggle group
  - split button
  - grouped actions
description: "Button groups combine related buttons into a single visual unit. Use them for toolbars, segmented controls, or any set of actions that belong together."
---

```html {.example}
<cs-button-group label="Alignment">
  <cs-button appearance="filled">Left</cs-button>
  <cs-button appearance="filled">Center</cs-button>
  <cs-button appearance="filled">Right</cs-button>
</cs-button-group>
```

:::warning
<strong>Give every button group a `label`.</strong><br />
It isn't shown on screen, but assistive devices announce it so people know what the grouped buttons control.
:::

## Examples

### Orientation

Set the `orientation` attribute to `vertical` to stack the buttons instead of placing them side by side.

```html {.example}
<cs-button-group orientation="vertical" label="Options">
  <cs-button appearance="filled">Top</cs-button>
  <cs-button appearance="filled">Middle</cs-button>
  <cs-button appearance="filled">Bottom</cs-button>
</cs-button-group>
```

### Pill

Add the `pill` attribute to each button to round the group's outer edges.

```html {.example}
<cs-button-group label="Alignment">
  <cs-button appearance="filled" size="m" pill>Left</cs-button>
  <cs-button appearance="filled" size="m" pill>Center</cs-button>
  <cs-button appearance="filled" size="m" pill>Right</cs-button>
</cs-button-group>
```

### Dropdowns

Place a [dropdown](/components/dropdown) anywhere in the group to attach a menu of related actions.

```html {.example}
<cs-button-group label="Options">
  <cs-button appearance="filled">Edit</cs-button>
  <cs-dropdown>
    <cs-button appearance="filled" slot="trigger" with-caret>More</cs-button>
    <cs-dropdown-item>Cut</cs-dropdown-item>
    <cs-dropdown-item>Copy</cs-dropdown-item>
    <cs-dropdown-item>Paste</cs-dropdown-item>
  </cs-dropdown>
  <cs-button appearance="filled">Delete</cs-button>
</cs-button-group>
```

### Split Buttons

Pair a primary button with a dropdown to make a split button. Give the dropdown trigger an accessible label so people using assistive devices know what it opens.

```html {.example}
<cs-button-group label="Save">
  <cs-button appearance="filled" variant="brand">Save</cs-button>
  <cs-dropdown placement="bottom-end">
    <cs-button appearance="filled" slot="trigger" variant="brand">
      <cs-icon name="keyboard_arrow_down" label="More options"></cs-icon>
    </cs-button>
    <cs-dropdown-item>Save</cs-dropdown-item>
    <cs-dropdown-item>Save as&hellip;</cs-dropdown-item>
    <cs-dropdown-item>Save all</cs-dropdown-item>
  </cs-dropdown>
</cs-button-group>
```

### Tooltips

Pair each button with a [tooltip](/components/tooltip) to explain what it does on hover and focus.

```html {.example}
<cs-button-group label="Alignment">
  <cs-button appearance="filled" id="button-left">Left</cs-button>
  <cs-button appearance="filled" id="button-center">Center</cs-button>
  <cs-button appearance="filled" id="button-right">Right</cs-button>
</cs-button-group>

<cs-tooltip for="button-left">Align left</cs-tooltip>
<cs-tooltip for="button-center">Align center</cs-tooltip>
<cs-tooltip for="button-right">Align right</cs-tooltip>
```

### Toolbars

Combine several button groups into a toolbar of related action sets. Use icon-only buttons with `label` for compact controls, and tooltips to name each one.

```html {.example}
<div class="button-group-toolbar cs-cluster">
  <cs-button-group label="History">
    <cs-button appearance="filled" id="undo-button"
      ><cs-icon name="undo" label="Undo"></cs-icon
    ></cs-button>
    <cs-button appearance="filled" id="redo-button"
      ><cs-icon name="redo" label="Redo"></cs-icon
    ></cs-button>
  </cs-button-group>

  <cs-button-group label="Formatting">
    <cs-button appearance="filled" id="button-bold"
      ><cs-icon name="format_bold" label="Bold"></cs-icon
    ></cs-button>
    <cs-button appearance="filled" id="button-italic"
      ><cs-icon name="format_italic" label="Italic"></cs-icon
    ></cs-button>
    <cs-button appearance="filled" id="button-underline"
      ><cs-icon name="format_underlined" label="Underline"></cs-icon
    ></cs-button>
  </cs-button-group>

  <cs-button-group label="Alignment">
    <cs-button appearance="filled" id="button-align-left"
      ><cs-icon name="format_align_left" label="Align left"></cs-icon
    ></cs-button>
    <cs-button appearance="filled" id="button-align-center"
      ><cs-icon name="format_align_center" label="Align center"></cs-icon
    ></cs-button>
    <cs-button appearance="filled" id="button-align-right"
      ><cs-icon name="format_align_right" label="Align right"></cs-icon
    ></cs-button>
  </cs-button-group>
</div>

<cs-tooltip for="undo-button">Undo</cs-tooltip>
<cs-tooltip for="redo-button">Redo</cs-tooltip>
<cs-tooltip for="button-bold">Bold</cs-tooltip>
<cs-tooltip for="button-italic">Italic</cs-tooltip>
<cs-tooltip for="button-underline">Underline</cs-tooltip>
<cs-tooltip for="button-align-left">Align left</cs-tooltip>
<cs-tooltip for="button-align-center">Align center</cs-tooltip>
<cs-tooltip for="button-align-right">Align right</cs-tooltip>
```

### Native Buttons

Button groups also work with native `<button>` elements when [Native Styles](/utilities/native) are included.

```html {.example}
<cs-button-group label="Alignment">
  <button class="cs-filled">Left</button>
  <button class="cs-filled">Center</button>
  <button class="cs-filled">Right</button>
</cs-button-group>
```
