---
title: CSS Utilities
description: Preset CSS utility classes that let you efficiently customize styles and layouts for components and native elements alike.
pageIndex: true
---

Instead of hand-writing the same CSS over and over, reach for a utility class and your theme takes care of
the rest. CSS utilities pull directly from your Cornerstone theme and [design tokens](/tokens), so colors,
typography, rounding, and spacing stay consistent with every component on the page. They're
framework-agnostic, work on any native HTML element, and can be combined freely.

## Using CSS utilities

CSS utilities ship as part of `cornerstone.css`, so if you're already including that stylesheet you don't
need to import anything else. To include the utilities stylesheet on its own:

```js
import '@cruglobal/cornerstone-components/styles/utilities.css';
```

Or, if you're self-hosting Cornerstone, link it from your server:

```html
<link rel="stylesheet" href="/dist/styles/utilities.css" />
```
