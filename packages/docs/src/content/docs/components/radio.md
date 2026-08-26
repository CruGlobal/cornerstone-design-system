---
title: Radio
category: Forms
parent: radio-group
hasAnatomy: true
synonyms:
  - radio button
  - option button
use-cases:
  - single select
  - exclusive choice
description: "Radios represent a single option within a mutually exclusive set. Use them inside a radio group when users must pick exactly one choice from a small list."
---

This component must be used as a child of `<cs-radio-group>`. Please see the [Radio Group docs](/components/radio-group) to see examples of this component in action.

```html {.example .anatomy-only}
<cs-radio-group label="Network">
  <cs-radio value="off">Off</cs-radio>
  <cs-radio value="wifi" data-anatomy-subject="true">Wi-Fi</cs-radio>
  <cs-radio value="all">Everything</cs-radio>
</cs-radio-group>
```
