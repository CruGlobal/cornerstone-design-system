---
title: Toast Item
category: Feedback
parent: toast
hasAnatomy: true
synonyms:
  - notification item
  - alert item
  - snackbar item
use-cases:
  - notification content
  - toast message
description: "Toast items are individual notifications displayed within a toast container."
---

```html {.example .anatomy}
<cs-toast-item variant="brand" duration="0">
  <cs-icon slot="icon" name="notifications"></cs-icon>
  This is how a toast item looks!
</cs-toast-item>
```

:::new
<strong>Now Available in Cornerstone Core</strong><br />
Toast Item moved over from Pro in [**3.11.0**](/resources/changelog#unreleased). On an earlier Core version? Upgrade to use it.
:::

:::info
<strong>Toast items are meant to live inside a `<cs-toast>` container.</strong><br />
The container manages their lifecycle and positioning. For usage examples showing how to display notifications, see the [Toast documentation](/components/toast).
:::

## Examples

### Variant

Use the `variant` attribute to change the toast item's visual style. The variant determines the accent color on the left side and the icon color. Available variants are `neutral` (default), `brand`, `success`, `warning`, and `danger`.

```html {.example}
<div class="cs-stack">
  <cs-toast-item variant="neutral" duration="0">
    <cs-icon slot="icon" name="settings"></cs-icon>
    Neutral variant (default)
  </cs-toast-item>

  <cs-toast-item variant="brand" duration="0">
    <cs-icon slot="icon" name="info" variant="fill"></cs-icon>
    Brand variant
  </cs-toast-item>

  <cs-toast-item variant="success" duration="0">
    <cs-icon slot="icon" name="check"></cs-icon>
    Success variant
  </cs-toast-item>

  <cs-toast-item variant="warning" duration="0">
    <cs-icon slot="icon" name="error" variant="fill"></cs-icon>
    Warning variant
  </cs-toast-item>

  <cs-toast-item variant="danger" duration="0">
    <cs-icon slot="icon" name="warning" variant="fill"></cs-icon>
    Danger variant
  </cs-toast-item>
</div>
```

### Size

Use the `size` attribute to change the toast item's size.

```html {.example}
<div class="cs-stack">
  <cs-toast-item size="xs" duration="0">
    <cs-icon slot="icon" name="set_meal"></cs-icon>
    Extra Small
  </cs-toast-item>

  <cs-toast-item size="s" duration="0">
    <cs-icon slot="icon" name="mouse"></cs-icon>
    Small
  </cs-toast-item>

  <cs-toast-item size="m" duration="0">
    <cs-icon slot="icon" name="pets"></cs-icon>
    Medium (default)
  </cs-toast-item>

  <cs-toast-item size="l" duration="0">
    <cs-icon slot="icon" name="pets"></cs-icon>
    Large
  </cs-toast-item>

  <cs-toast-item size="xl" duration="0">
    <cs-icon slot="icon" name="pets" variant="fill"></cs-icon>
    Extra Large
  </cs-toast-item>
</div>
```

### Icons

Use the `icon` slot to display an icon at the start of the toast item. The icon color automatically matches the variant's accent color.

```html {.example}
<div class="cs-stack">
  <cs-toast-item variant="success" duration="0">
    <cs-icon slot="icon" name="check"></cs-icon>
    Your changes have been saved!
  </cs-toast-item>

  <cs-toast-item variant="brand" duration="0">
    <cs-icon slot="icon" name="mail"></cs-icon>
    You have 3 new messages
  </cs-toast-item>

  <cs-toast-item variant="warning" duration="0">
    <cs-icon slot="icon" name="schedule"></cs-icon>
    Your session will expire soon
  </cs-toast-item>
</div>
```

Toast items work fine without icons too.

```html {.example}
<cs-toast-item variant="neutral" duration="0"> A simple notification without an icon. </cs-toast-item>
```

### Providing Content

The default slot accepts any HTML content, allowing you to create rich notifications with formatted text, links, and interactive elements.

```html {.example}
<div class="cs-stack">
  <cs-toast-item variant="brand" duration="0">
    <cs-icon slot="icon" name="notifications"></cs-icon>
    <strong>New message from Alex</strong><br />
    Hey, are you available for a quick call?
  </cs-toast-item>

  <cs-toast-item variant="success" duration="0">
    <cs-icon slot="icon" name="cloud_upload"></cs-icon>
    <strong>Upload complete</strong><br />
    <a href="#">View file</a> · <a href="#">Share</a>
  </cs-toast-item>

  <cs-toast-item variant="brand" duration="0">
    <cs-icon slot="icon" name="redeem"></cs-icon>
    You've earned a reward!
    <div style="margin-block-start: var(--cs-space-xs);">
      <cs-button variant="brand" size="s">Claim Now</cs-button>
      <cs-button appearance="filled" size="s">Later</cs-button>
    </div>
  </cs-toast-item>
</div>
```

### Duration

The `duration` attribute controls how long the toast item displays before automatically dismissing (in milliseconds). The default is `5000` (5 seconds). Set to `0` to disable auto-dismissal.

When a duration is set, a progress ring appears around the close button showing the remaining time.

```html
<cs-toast-item variant="brand" duration="5000">...</cs-toast-item>
<cs-toast-item variant="brand" duration="10000">...</cs-toast-item>
<cs-toast-item variant="brand" duration="0">...</cs-toast-item>
```

### Hover & Focus Behavior

Toast items automatically pause their countdown timer when the user hovers over them or when the close button receives focus, giving more time to read the content. When the mouse leaves or focus moves away, the timer resets and begins counting down again.

### The Close Button

Every toast item includes a close button that allows users to dismiss the notification. When `duration` is greater than `0`, the close button displays a progress ring showing the remaining time.

```html {.example}
<cs-toast-item variant="neutral" duration="0">
  <cs-icon slot="icon" name="info" variant="fill"></cs-icon>
  Click the close button on the right to dismiss →
</cs-toast-item>
```

### Customizing the Accent

Use the `--accent-width` custom property to adjust the width of the accent line, or hide it entirely.

```html {.example}
<div class="cs-stack">
  <cs-toast-item variant="brand" duration="0" style="--accent-width: 8px;">
    <cs-icon slot="icon" name="star" variant="fill"></cs-icon>
    Thicker accent line
  </cs-toast-item>

  <cs-toast-item variant="success" duration="0" style="--accent-width: 0;">
    <cs-icon slot="icon" name="check"></cs-icon>
    No accent line
  </cs-toast-item>
</div>
```

### Customizing the Padding

Use the `--padding` custom property to adjust the internal spacing.

```html {.example}
<div class="cs-stack">
  <cs-toast-item variant="brand" duration="0" style="--padding: var(--cs-space-xs);">
    <cs-icon slot="icon" name="close_fullscreen"></cs-icon>
    Compact padding
  </cs-toast-item>

  <cs-toast-item variant="brand" duration="0" style="--padding: var(--cs-space-xl);">
    <cs-icon slot="icon" name="open_in_full"></cs-icon>
    Spacious padding
  </cs-toast-item>
</div>
```

<script>
  // Prevent toast items on this page from closing when the close button is clicked
  document.addEventListener('cs-hide', event => {
    if (event.target.localName === 'cs-toast-item') {
      event.preventDefault();
    }
  });
</script>
