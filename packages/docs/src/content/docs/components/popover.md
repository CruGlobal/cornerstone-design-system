---
title: Popover
category: Helpers
hasAnatomy: false
synonyms:
  - popup content
  - info popup
  - interactive popup
use-cases:
  - rich tooltip
  - hover card
  - info popover
  - click popup
description: "Popovers display contextual content and interactive elements in a floating panel anchored to a trigger. Use them for rich tooltips, menus, or any content that appears on demand without navigating away."
---

```html {.example}
<cs-popover for="popover__overview">
  <div class="cs-stack">
    <p>This popover contains interactive content that users can engage with directly.</p>
    <cs-button appearance="filled" variant="brand" size="s">Take Action</cs-button>
  </div>
</cs-popover>

<cs-button appearance="filled" id="popover__overview">Show popover</cs-button>
```

Unlike [tooltips](/components/tooltip), popovers can contain links, buttons, and form controls. They appear without an overlay and close when you click outside or press [[Escape]]. Only one popover can be open at a time.

## Examples

### Anchor

Use `<cs-button>` or `<button>` elements as popover anchors. Connect the popover to its anchor by setting the `for` attribute to match the anchor's `id`.

```html {.example}
<cs-button appearance="filled" id="popover__anchor-button">Show Popover</cs-button>

<cs-popover for="popover__anchor-button"> I'm anchored to a Cornerstone button. </cs-popover>

<br /><br />

<button class="cs-filled" id="popover__anchor-native-button">Show Popover</button>

<cs-popover for="popover__anchor-native-button"> I'm anchored to a native button. </cs-popover>
```

:::warning
<strong>The anchor must exist in the DOM before the popover connects.</strong><br />
Otherwise the popover won't attach and you'll see a console warning.
:::

### Opening & Closing

Popovers show when you click their anchor element. You can also control them programmatically by setting the `open` property to `true` or `false`.

Use `data-popover="close"` on any button inside a popover to close it automatically.

```html {.example}
<cs-popover for="popover__opening">
  <p>The button below has <code>data-popover="close"</code> so clicking it will close the popover.</p>
  <cs-button appearance="filled" data-popover="close" variant="brand">Dismiss</cs-button>
</cs-popover>

<cs-button appearance="filled" id="popover__opening">Show popover</cs-button>
```

### Placement

Use the `placement` attribute to set where the popover appears relative to its anchor. The popover will automatically reposition if there isn't enough space in the preferred location. The default placement is `top`.

```html {.example}
<div class="cs-cluster">
  <cs-button appearance="filled" id="popover__top">Top</cs-button>
  <cs-popover for="popover__top" placement="top">I'm on the top</cs-popover>

  <cs-button appearance="filled" id="popover__bottom">Bottom</cs-button>
  <cs-popover for="popover__bottom" placement="bottom">I'm on the bottom</cs-popover>

  <cs-button appearance="filled" id="popover__left">Left</cs-button>
  <cs-popover for="popover__left" placement="left">I'm on the left</cs-popover>

  <cs-button appearance="filled" id="popover__right">Right</cs-button>
  <cs-popover for="popover__right" placement="right">I'm on the right</cs-popover>
</div>
```

### Distance

Use the `distance` attribute to control how far the popover appears from its anchor.

```html {.example}
<div class="cs-cluster">
  <cs-button appearance="filled" id="popover__distance-near">Near</cs-button>
  <cs-popover for="popover__distance-near" distance="0">I'm very close</cs-popover>

  <cs-button appearance="filled" id="popover__distance-far">Far</cs-button>
  <cs-popover for="popover__distance-far" distance="30">I'm farther away</cs-popover>
</div>
```

### Arrow Size

Use the `--arrow-size` custom property to change the size of the popover's arrow. To remove it, use the `without-arrow` attribute.

```html {.example}
<div class="cs-cluster">
  <cs-button appearance="filled" id="popover__big-arrow">Big arrow</cs-button>
  <cs-popover for="popover__big-arrow" style="--arrow-size: 8px;">I have a big arrow</cs-popover>

  <cs-button appearance="filled" id="popover__no-arrow">No arrow</cs-button>
  <cs-popover for="popover__no-arrow" without-arrow>I don't have an arrow</cs-popover>
</div>
```

### Max Width

Use the `--max-width` custom property to control the maximum width of the popover.

```html {.example}
<cs-button appearance="filled" id="popover__max-width">Toggle me</cs-button>
<cs-popover for="popover__max-width" style="--max-width: 160px;">
  Popovers will usually grow to be much wider, but this one has a custom max width that forces text to wrap.
</cs-popover>
```

### Initial Focus

Use the [`autofocus`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/autofocus) global attribute to move focus to a specific form control when the popover opens.

```html {.example}
<cs-popover for="popover__autofocus">
  <div class="cs-stack">
    <cs-textarea autofocus placeholder="What's on your mind?" size="s" resize="none" rows="2"></cs-textarea>
    <cs-button appearance="filled" variant="brand" size="s" data-popover="close"> Submit </cs-button>
  </div>
</cs-popover>

<cs-button appearance="filled" id="popover__autofocus">
  <cs-icon name="chat_bubble" slot="start"></cs-icon>
  Feedback
</cs-button>
```
