---
title: Textarea
category: Forms
synonyms:
  - text area
  - multiline input
  - text box
use-cases:
  - comment box
  - message input
  - description field
  - code input
description: "Textareas collect multi-line text input from the user, with optional resizing and character counting."
---

```html {.example}
<cs-textarea label="Feedback"></cs-textarea>
```

:::info
This component works with standard `<form>` elements. See [form controls](/form-controls) for form submission and client-side validation.
:::

## Examples

### Label

Use the `label` attribute to give the textarea an accessible label. For labels that contain HTML, use the `label` slot instead.

```html {.example}
<cs-textarea label="Comments"></cs-textarea>
```

### Hint

Add a descriptive hint to a textarea with the `hint` attribute. For hints that contain HTML, use the `hint` slot instead.

```html {.example .anatomy}
<cs-textarea label="Feedback" hint="Please tell us what you think."></cs-textarea>
```

### Placeholder

Use the `placeholder` attribute to add a placeholder.

```html {.example}
<cs-textarea label="Comments" placeholder="Share your thoughts"></cs-textarea>
```

### Appearance

Use the `appearance` attribute to change the textarea's visual appearance.

```html {.example}
<div class="cs-stack">
  <cs-textarea appearance="outlined" placeholder="outlined"></cs-textarea>
  <cs-textarea appearance="filled" placeholder="filled"></cs-textarea>
  <cs-textarea appearance="filled-outlined" placeholder="filled-outlined"></cs-textarea>
</div>
```

### Disabled

Use the `disabled` attribute to disable a textarea.

```html {.example}
<cs-textarea placeholder="Disabled" disabled></cs-textarea>
```

### Readonly

Use the `readonly` attribute to keep a value visible but uneditable. Unlike `disabled`, a readonly textarea stays focusable and its value is still submitted with the form.

```html {.example}
<cs-textarea label="Release notes" value="Fixed a handful of bugs and polished the edges." readonly></cs-textarea>
```

### Size

Use the `size` attribute to change a textarea's size.

```html {.example}
<div class="cs-stack">
  <cs-textarea size="xs" placeholder="Extra small"></cs-textarea>
  <cs-textarea size="s" placeholder="Small"></cs-textarea>
  <cs-textarea size="m" placeholder="Medium"></cs-textarea>
  <cs-textarea size="l" placeholder="Large"></cs-textarea>
  <cs-textarea size="xl" placeholder="Extra large"></cs-textarea>
</div>
```

### Rows

Use the `rows` attribute to change the number of text rows that show by default.

```html {.example}
<cs-textarea rows="2"></cs-textarea>
```

### Resize

Use the `resize` attribute to control how the user can resize the textarea.

| Mode                 | Behavior                                   | Best for                             |
| -------------------- | ------------------------------------------ | ------------------------------------ |
| `vertical` (default) | Drag the bottom edge to change the height  | Most multi-line fields               |
| `none`               | Resizing is disabled                       | Fixed layouts where height must hold |
| `horizontal`         | Drag the side edge to change the width     | Adjusting line length                |
| `both`               | Drag the corner to change width and height | Free-form editing                    |
| `auto`               | Grows to fit its content as the user types | Inputs whose length varies a lot     |

The default, `vertical`, lets the user drag the bottom edge to resize the field.

```html {.example}
<cs-textarea label="Feedback" resize="vertical"></cs-textarea>
```

Set `resize` to `auto` and the textarea grows to fit its content as the user types.

```html {.example}
<cs-textarea label="Comments" resize="auto"></cs-textarea>
```

### Character Count

Add the `with-count` attribute to show a character count below the textarea. When combined with `maxlength`, the count shows remaining characters instead.

```html {.example}
<div class="cs-stack">
  <cs-textarea label="Comments" hint="Share your thoughts with us" with-count></cs-textarea>
  <cs-textarea label="Bio" hint="Tell us a little about yourself" with-count maxlength="100"></cs-textarea>
</div>
```

:::info
<strong>The character count is announced to screen readers.</strong><br />
It's exposed through a live region so assistive technologies announce updates as the user types.
:::

### Initial Value

Use the `value` attribute to set an initial value.

```html {.example}
<cs-textarea value="Write something awesome!"></cs-textarea>
```
