---
title: Cornerstone Components
description: The custom-element library of the Cornerstone design system.
---

Cornerstone Components is the `cs-*` custom-element library of the Cornerstone design system. The
pages under **Components** are its reference: every one is generated from the same Custom Elements
Manifest the package ships, so what you read here is what the component actually does.

:::info
This site is being ported from its previous generator a page at a time. Pages carry their original
prose until each is revised, so some of it still describes the library this one was forked from.
:::

## Where to start

- **Components** — the reference for all 70 elements, grouped by what they are for.
- Each page opens with the component's tag, status and the version it landed in, then live examples,
  then its full API: slots, attributes and properties, methods, events, CSS custom properties,
  custom states and CSS parts.

## Using the library

Components load on demand through the autoloader, so a page needs no manual import. To cherry-pick
one, import it by path:

```js
import '@cruglobal/cornerstone-components/components/button/button.js';
```
