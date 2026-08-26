---
title: Focus
description: Focus tokens define a consistent, recognizable focus ring for keyboard users.
synonyms:
  - focus ring
  - focus outline
  - focus visible
use-cases:
  - keyboard focus
  - accessibility focus
  - tab focus
---

Focus tokens create a consistent, recognizable outline that lets keyboard users track where they are on the page. Together with [`--cs-color-focus`](/tokens/color), these tokens assemble the focus ring applied to all interactive Cornerstone components.

<cs-scroller>
  <table class="token-table cs-hover-rows">
    <thead>
      <tr><th>Custom Property</th><th>Description</th></tr>
    </thead>
    <tbody>
      <tr id="token-cs-focus-ring-style">
        <td class="token-name"><code>--cs-focus-ring-style</code></td>
        <td>Line style for the focus outline</td>
      </tr>
      <tr id="token-cs-focus-ring-width">
        <td class="token-name"><code>--cs-focus-ring-width</code></td>
        <td>Thickness of the focus outline</td>
      </tr>
      <tr id="token-cs-focus-ring">
        <td class="token-name"><code>--cs-focus-ring</code></td>
        <td>Shorthand combining style, width, and color into a complete focus outline value</td>
      </tr>
      <tr id="token-cs-focus-ring-offset">
        <td class="token-name"><code>--cs-focus-ring-offset</code></td>
        <td>Gap between the element's edge and the focus outline</td>
      </tr>
    </tbody>
  </table>
</cs-scroller>

See your theme's focus ring by navigating this form with your keyboard:

```html {.example}
<form class="cs-stack">
  <cs-input label="Text Input">
    <span slot="hint">Press <kbd>Tab</kbd> to move focus to other interactive elements.</span>
  </cs-input>
  <cs-checkbox>Checkbox</cs-checkbox>
  <cs-button variant="brand">Button</cs-button>
</form>
```
