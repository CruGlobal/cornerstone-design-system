---
title: Breadcrumb Item
category: Navigation
parent: breadcrumb
hasAnatomy: true
synonyms:
  - breadcrumb link
  - crumb
use-cases:
  - navigation link
  - path segment
description: "Breadcrumb items represent individual links inside a breadcrumb, typically one per level of the site hierarchy."
---

This component must be used as a child of `<cs-breadcrumb>`. Please see the [Breadcrumb docs](/components/breadcrumb) to see examples of this component in action.

```html {.example .anatomy-only}
<cs-breadcrumb>
  <cs-breadcrumb-item><cs-icon slot="start" name="home"></cs-icon>Home</cs-breadcrumb-item>
  <cs-breadcrumb-item data-anatomy-subject="true"><cs-icon slot="start" name="folder"></cs-icon>Projects</cs-breadcrumb-item>
  <cs-breadcrumb-item>Overview</cs-breadcrumb-item>
</cs-breadcrumb>
```
