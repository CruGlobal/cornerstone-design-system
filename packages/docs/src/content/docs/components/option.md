---
title: Option
category: Forms
parent: select
hasAnatomy: true
synonyms:
  - select option
  - list option
  - choice
use-cases:
  - dropdown option
  - select item
  - pick list item
description: "Options represent the individual choices inside a select or similar form control. Each option holds a value and the label shown to the user."
---

This component must be used as a child of `<cs-select>`. Please see the [Select docs](/components/select) to see examples of this component in action.

```html {.example .anatomy-only}
<!-- select is an overlay that won't render on a static stage, so the options show among dimmed siblings. -->
<div class="cs-stack cs-gap-0">
  <cs-option><cs-icon slot="start" name="coffee" variant="fill"></cs-icon>Espresso</cs-option>
  <cs-option data-anatomy-subject="true"><cs-icon slot="start" name="star" variant="fill"></cs-icon>Cortado</cs-option>
  <cs-option><cs-icon slot="start" name="local_cafe" variant="fill"></cs-icon>Cappuccino</cs-option>
</div>
```
