---
title: Reducing FOUCE
description: Utility to improve the loading experience by hiding non-prerendered custom elements until they are registered.
tags: styleUtilities
synonyms:
  - flash of unstyled content
  - custom element flash
  - FOUC
  - CLS
use-cases:
  - component loading flash
  - undefined element
  - hydration flash
  - layout shift
---

Often, components are shown before their logic and styles have had a chance to load, also known as a [Flash of Undefined Custom Elements](https://www.abeautifulsite.net/posts/flash-of-undefined-custom-elements/).

The FOUCE style utility takes care of hiding custom elements until **both they and their contents** have been registered, up to a maximum of two seconds.

## Cloaking

In many cases, this is not enough, and you may wish to hide a broader wrapper element or even the entire page until all WA elements within it have loaded.
To do that, you can add the `cs-cloak` class to any element on the page or even apply it to the whole page by placing the class on the `<html>` element:

```html
<html class="cs-cloak">
  ...
</html>
```

As soon as all elements are registered _or_ after two seconds have elapsed, the autoloader will show the page. The two-second timeout prevents blank screens from persisting on slow networks and pages that have errors.

## Turbo (Hotwire) Users

If you're using [Turbo](https://turbo.hotwired.dev/) to serve a multi-page application (MPA) as a single page application (SPA), you might notice FOUCE when navigating from page to page. This is because Turbo renders the new page's content before the autoloader has a chance to register new components.

The following function acts as a middleware to ensure components are registered _before_ the page shows, eliminating FOUCE for page-to-page navigation with Turbo.

```js
import { preventTurboFouce } from '/dist/cornerstone.js';

preventTurboFouce();
```

:::warning
**`cs-cloak` on `<body>` can blank the whole page long after it has loaded.** The cloak is a CSS rule, not a
one-time step. While an element has the class, it goes invisible whenever it holds a custom element that is not
defined yet, and stays invisible until every one is defined or two seconds pass. Any custom element counts, not only
Cornerstone's, and it can happen again each time a new one appears. Pasting into a block editor is one way to hit it.

`cornerstone.loader.js` removes the class once, when the first page's components have loaded or two seconds have
passed, and nothing else in the library removes it. Load the library without the loader and the class stays on.
Under Turbo it comes back on every visit, because each new `<body>` arrives with the classes your layout gave it.

So if your app adds elements after the page loads, put `cs-cloak` only on the region that needs it, and not around
the part that adds them. `<body>` is only safe when the loader has removed the class and nothing puts it back.
:::
