---
title: Accordion Item
category: Layout
parent: accordion
hasAnatomy: true
synonyms:
  - collapsible section
  - expandable section
  - disclosure item
  - panel
  - expandable panel
use-cases:
  - FAQ entry
  - FAQ item
  - settings section
  - collapsible content
description: "Accordion items are used inside `<cs-accordion>` to create expandable sections with accessible headers."
---

This component must be used as a child of `<cs-accordion>`. Please see the [Accordion docs](/components/accordion) to see examples of this component in action.

```html {.example .anatomy-only}
<cs-accordion>
  <cs-accordion-item label="Overview">The first section.</cs-accordion-item>
  <cs-accordion-item expanded data-anatomy-subject="true">
    <span slot="label">Shipping &amp; returns</span>
    Orders ship within two business days. Returns are free within 30 days.
  </cs-accordion-item>
  <cs-accordion-item label="Warranty">The third section.</cs-accordion-item>
</cs-accordion>
```
