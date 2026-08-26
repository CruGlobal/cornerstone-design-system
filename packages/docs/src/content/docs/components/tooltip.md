---
title: Tooltip
category: Feedback
hasAnatomy: false
synonyms:
  - hint
  - hover text
  - info bubble
  - title attribute
use-cases:
  - help text
  - contextual help
  - hover info
description: "Tooltips display brief contextual information when the user hovers, focuses, or taps a target element."
---

```html {.example}
<cs-tooltip for="my-button">This is a tooltip</cs-tooltip>
<cs-button appearance="filled" id="my-button">Hover Me</cs-button>
```

Point the `for` attribute at the `id` of the element the tooltip describes, and Cornerstone wires up positioning and accessibility for you.

:::warning
<strong>Keep tooltips to text and presentational content.</strong><br />
Tooltips can't be reliably focused or operated with a keyboard, so avoid buttons, links, and form controls inside one. Reach for a [popover](/components/popover) or [dropdown](/components/dropdown) when you need interactive content.
:::

## Examples

### Placement

Use the `placement` attribute to set the tooltip's preferred position. The actual placement may shift to keep the tooltip inside the viewport.

```html {.example}
<div class="tooltip-placement-example">
  <div class="tooltip-placement-example-row">
    <cs-button appearance="filled" id="tooltip-top-start"></cs-button>
    <cs-button appearance="filled" id="tooltip-top"></cs-button>
    <cs-button appearance="filled" id="tooltip-top-end"></cs-button>
  </div>

  <div class="tooltip-placement-example-row">
    <cs-button appearance="filled" id="tooltip-left-start"></cs-button>
    <cs-button appearance="filled" id="tooltip-right-start"></cs-button>
  </div>

  <div class="tooltip-placement-example-row">
    <cs-button appearance="filled" id="tooltip-left"></cs-button>
    <cs-button appearance="filled" id="tooltip-right"></cs-button>
  </div>

  <div class="tooltip-placement-example-row">
    <cs-button appearance="filled" id="tooltip-left-end"></cs-button>
    <cs-button appearance="filled" id="tooltip-right-end"></cs-button>
  </div>

  <div class="tooltip-placement-example-row">
    <cs-button appearance="filled" id="tooltip-bottom-start"></cs-button>
    <cs-button appearance="filled" id="tooltip-bottom"></cs-button>
    <cs-button appearance="filled" id="tooltip-bottom-end"></cs-button>
  </div>
</div>

<cs-tooltip for="tooltip-top-start" placement="top-start">top-start</cs-tooltip>
<cs-tooltip for="tooltip-top" placement="top">top</cs-tooltip>
<cs-tooltip for="tooltip-top-end" placement="top-end">top-end</cs-tooltip>
<cs-tooltip for="tooltip-left-start" placement="left-start">left-start</cs-tooltip>
<cs-tooltip for="tooltip-right-start" placement="right-start">right-start</cs-tooltip>
<cs-tooltip for="tooltip-left" placement="left">left</cs-tooltip>
<cs-tooltip for="tooltip-right" placement="right">right</cs-tooltip>
<cs-tooltip for="tooltip-left-end" placement="left-end">left-end</cs-tooltip>
<cs-tooltip for="tooltip-right-end" placement="right-end">right-end</cs-tooltip>
<cs-tooltip for="tooltip-bottom-start" placement="bottom-start">bottom-start</cs-tooltip>
<cs-tooltip for="tooltip-bottom" placement="bottom">bottom</cs-tooltip>
<cs-tooltip for="tooltip-bottom-end" placement="bottom-end">bottom-end</cs-tooltip>

<style>
  .tooltip-placement-example {
    width: 250px;
    margin: var(--cs-space-m);
  }

  .tooltip-placement-example cs-button {
    width: 2.5rem;
  }

  .tooltip-placement-example-row {
    display: flex;
    justify-content: space-between;
    gap: var(--cs-space-xs);
    margin-bottom: var(--cs-space-xs);
  }

  .tooltip-placement-example-row:nth-child(1),
  .tooltip-placement-example-row:nth-child(5) {
    justify-content: center;
  }
</style>
```

### Triggers

The `trigger` attribute controls how a tooltip is activated. Pass multiple values separated by a space to combine them — the default is `hover focus`, which shows the tooltip on pointer hover and keyboard focus.

| Value    | Shows the tooltip when                                     |
| -------- | ---------------------------------------------------------- |
| `hover`  | The pointer moves over the target                          |
| `focus`  | The target receives keyboard focus                         |
| `click`  | The target is clicked; clicking again dismisses it         |
| `manual` | Only when you set `open` yourself — no built-in activation |

```html {.example}
<cs-button appearance="filled" id="toggle-button">Click to Toggle</cs-button>
<cs-tooltip for="toggle-button" trigger="click">Click again to dismiss</cs-tooltip>
```

### HTML in Tooltips

Use the default slot to add presentational HTML, such as emphasis or line breaks.

```html {.example}
<cs-button appearance="filled" id="rich-tooltip">Hover me</cs-button>
<cs-tooltip for="rich-tooltip">
  <div>This tooltip includes <strong>formatted</strong> content, such as <em>emphasis</em> and line breaks.</div>
</cs-tooltip>
```

### Customizing

Use the `--max-width` custom property to set the width at which the tooltip's content wraps.

```html {.example}
<cs-tooltip for="wrapping-tooltip" style="--max-width: 80px;">
  This tooltip will wrap after only 80 pixels.
</cs-tooltip>
<cs-button appearance="filled" id="wrapping-tooltip">Hover me</cs-button>
```

Remove the arrow on a single tooltip with the `without-arrow` attribute.

```html {.example}
<cs-button appearance="filled" id="no-arrow">No Arrow</cs-button>
<cs-tooltip for="no-arrow" without-arrow>This is a tooltip with no arrow</cs-tooltip>
```

Resize the arrow on every tooltip with the `--cs-tooltip-arrow-size` design token. Set it in a `:root` block after the Cornerstone stylesheet loads — `0` removes arrows globally.

```css
:root {
  --cs-tooltip-arrow-size: 0;
}
```

### Showing & Hiding Manually

Set `trigger="manual"` and toggle the `open` attribute to control the tooltip yourself — handy for onboarding hints or surfacing a tooltip in response to your own logic.

```html {.example}
<div class="manual-trigger-example">
  <cs-tooltip for="manual-trigger-tooltip" trigger="manual" class="manual-tooltip">This is an avatar!</cs-tooltip>
  <cs-avatar id="manual-trigger-tooltip" label="User"></cs-avatar>

  <cs-divider></cs-divider>

  <cs-button appearance="filled" class="manual-toggle">Toggle Manually</cs-button>
</div>

<script>
  const tooltip = document.querySelector('.manual-tooltip');
  const toggle = document.querySelector('.manual-toggle');

  toggle.addEventListener('click', () => (tooltip.open = !tooltip.open));
</script>
```
