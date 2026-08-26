---
title: Copy Button
category: Actions
synonyms:
  - clipboard
  - copy to clipboard
  - copy icon
use-cases:
  - code copy
  - text copy
  - share link
description: "Copy buttons copy text to the clipboard when the user activates them. They provide built-in success and error feedback so users know the copy worked."
---

```html {.example}
<cs-copy-button value="https://github.com/CruGlobal/cornerstone-design-system"></cs-copy-button>
```

:::info
<strong>Copying requires a secure context.</strong><br />
Copy buttons use the browser's [`clipboard.writeText()`](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText) method, which requires a [secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts) (HTTPS) in most browsers.
:::

## Examples

### Copying from Other Elements

Set the `value` attribute to copy a literal string, or point the `from` attribute at another element's `id` to copy live content. When both are present, `from` wins.

By default `from` copies the target's [`textContent`](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent). Add a modifier to copy an attribute or property instead:

| Syntax            | Copies                      | Example                 |
| ----------------- | --------------------------- | ----------------------- |
| `from="id"`       | The element's `textContent` | `from="my-phone"`       |
| `from="id[attr]"` | The named attribute         | `from="my-link[href]"`  |
| `from="id.prop"`  | The named property          | `from="my-input.value"` |

```html {.example}
<div class="cs-stack">
  <!-- Copies the span's textContent -->
  <div class="cs-cluster cs-align-items-center cs-gap-2xs">
    <span id="my-phone">+1 (234) 456-7890</span>
    <cs-copy-button from="my-phone"></cs-copy-button>
  </div>

  <!-- Copies the input's "value" property -->
  <div class="cs-cluster cs-align-items-center cs-gap-2xs">
    <cs-input id="my-input" type="text" value="User input" style="max-width: 300px;"></cs-input>
    <cs-copy-button from="my-input.value"></cs-copy-button>
  </div>

  <!-- Copies the link's "href" attribute -->
  <div class="cs-cluster cs-align-items-center cs-gap-2xs">
    <a id="my-link" href="https://github.com/CruGlobal/cornerstone-design-system">Cornerstone on GitHub</a>
    <cs-copy-button from="my-link[href]"></cs-copy-button>
  </div>
</div>
```

### Custom Labels

The copy button shows a tooltip on hover and focus, then briefly swaps it to confirm a copy. Set the `copy-label`, `success-label`, and `error-label` attributes to customize the text for each state. `copy-label` also serves as the button's accessible name.

```html {.example}
<cs-copy-button
  value="Custom labels are easy"
  copy-label="Click to copy"
  success-label="You did it!"
  error-label="Whoops, your browser doesn't support this!"
></cs-copy-button>
```

### Custom Icons

Use the `copy-icon`, `success-icon`, and `error-icon` slots to replace the icon shown in each state. [`<cs-icon>`](/components/icon) works best, but any image will do.

```html {.example}
<cs-copy-button value="Copied from a custom button">
  <cs-icon slot="copy-icon" name="content_paste"></cs-icon>
  <cs-icon slot="success-icon" name="thumb_up" variant="fill"></cs-icon>
  <cs-icon slot="error-icon" name="close"></cs-icon>
</cs-copy-button>
```

### Custom Trigger

By default the copy button renders an icon-only button. Slot in any clickable element to use as the trigger instead — a Cornerstone button, a native button, or anything else.

```html {.example}
<div class="cs-stack">
  <cs-copy-button value="You can copy anything with a custom trigger!">
    <cs-button appearance="filled">Copy to Clipboard</cs-button>
  </cs-copy-button>

  <cs-copy-button value="https://github.com/CruGlobal/cornerstone-design-system">
    <button type="button" class="cs-filled">Copy to Clipboard</button>
  </cs-copy-button>
</div>
```

:::info
<strong>Custom triggers get the same feedback with no extra wiring.</strong><br />
They receive the same tooltip and copy feedback as the default trigger; the icon swap is the one piece unique to it. Set `tooltip="none"` to opt out of the tooltip, and listen for the `cs-copy` and `cs-error` events or style the `:state(success)` and `:state(error)` custom states for your own feedback.
:::

### Disabled

Add the `disabled` attribute to turn off the copy button.

```html {.example}
<cs-copy-button value="You can't copy me" disabled></cs-copy-button>
```

### Handling Errors

A copy fails when `value` is empty, when `from` points to an id that doesn't exist, or when the browser rejects the operation. Either way, the button shows its error state and emits the `cs-error` event. Customize the message with `error-label` and the icon with the `error-icon` slot.

```html {.example}
<cs-copy-button from="i-do-not-exist"></cs-copy-button>
```

### Feedback Duration

After a copy, the tooltip briefly shows the success or error label. Set the `feedback-duration` attribute (in milliseconds) to control how long it stays visible.

```html {.example}
<cs-copy-button value="Cornerstone rocks!" feedback-duration="250"></cs-copy-button>
```

### Tooltip Mode

The `tooltip` attribute controls when the built-in tooltip appears, on both the default and custom triggers.

| Value                                                                            | Behavior                                                        |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `full` <cs-badge appearance="outlined" variant="neutral" pill>default</cs-badge> | Shows on hover and focus, and reused for copy feedback          |
| `copy`                                                                           | Stays silent on hover and focus; appears only to confirm a copy |
| `none`                                                                           | Never shown                                                     |

```html {.example}
<div class="cs-cluster">
  <cs-copy-button value="npm install @cruglobal/cornerstone-components" tooltip="full"></cs-copy-button>
  <cs-copy-button value="npm install @cruglobal/cornerstone-components" tooltip="copy"></cs-copy-button>
  <cs-copy-button value="npm install @cruglobal/cornerstone-components" tooltip="none"></cs-copy-button>
</div>
```

### Tooltip Placement

The tooltip sits above the trigger by default. Set the `tooltip-placement` attribute to `top`, `right`, `bottom`, or `left` to move it.

```html {.example}
<div class="cs-cluster">
  <cs-copy-button value="Above" tooltip-placement="top"></cs-copy-button>
  <cs-copy-button value="Right" tooltip-placement="right"></cs-copy-button>
  <cs-copy-button value="Below" tooltip-placement="bottom"></cs-copy-button>
  <cs-copy-button value="Left" tooltip-placement="left"></cs-copy-button>
</div>
```

### Customizing

Style the button through its CSS parts — `button`, `copy-icon`, `success-icon`, and `error-icon` — to match your design.

```html {.example}
<cs-copy-button value="I'm so stylish" class="custom-styles">
  <cs-icon slot="copy-icon" name="content_paste"></cs-icon>
  <cs-icon slot="success-icon" name="thumb_up" variant="fill"></cs-icon>
  <cs-icon slot="error-icon" name="thumb_down" variant="fill"></cs-icon>
</cs-copy-button>

<style>
  .custom-styles,
  .custom-styles::part(success-icon),
  .custom-styles::part(error-icon) {
    color: var(--cs-color-pink-95);
  }

  .custom-styles::part(button) {
    background-color: var(--cs-color-pink-40);
    border: solid var(--cs-border-width-m) var(--cs-color-pink-60);
    border-right-color: var(--cs-color-pink-20);
    border-bottom-color: var(--cs-color-pink-20);
    border-radius: var(--cs-border-radius-m);
    transition: all var(--cs-transition-slow) var(--cs-transition-easing);
  }

  .custom-styles::part(button):hover {
    transform: scale(1.05);
  }

  .custom-styles::part(button):active {
    transform: translateY(var(--cs-space-3xs));
  }

  .custom-styles::part(button):focus-visible {
    outline: dashed var(--cs-border-width-m) var(--cs-color-pink-60);
    outline-offset: var(--cs-space-2xs);
  }
</style>
```
