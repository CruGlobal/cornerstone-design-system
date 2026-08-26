---
title: Dropdown Item
category: Actions
parent: dropdown
hasAnatomy: true
synonyms:
  - menu item
  - action item
  - list item
use-cases:
  - dropdown option
  - menu option
  - command
description: "Dropdown items represent selectable entries within a dropdown menu, including standard actions, checkable items, and submenu triggers."
---

This component must be used as a child of `<cs-dropdown>`. Please see the [Dropdown docs](/components/dropdown) to see examples of this component in action.

```html {.example .anatomy-only}
<!-- dropdown is an overlay that won't render on a static stage, so the items show among dimmed siblings. -->
<div class="cs-stack cs-gap-0">
  <cs-dropdown-item><cs-icon slot="icon" name="content_copy"></cs-icon>Copy<span slot="details">⌘C</span></cs-dropdown-item>
  <cs-dropdown-item data-anatomy-subject="true"
    ><cs-icon slot="icon" name="content_cut"></cs-icon>Cut<span slot="details">⌘X</span></cs-dropdown-item
  >
  <cs-dropdown-item><cs-icon slot="icon" name="delete"></cs-icon>Delete</cs-dropdown-item>
</div>
```
