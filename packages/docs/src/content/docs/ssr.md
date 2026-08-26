---
title: Server Side Rendering (SSR)
description: A document on how to get started with SSR in Cornerstone.
---

<cs-badge variant="warning" appearance="filled" pill>
  <cs-icon name="science" slot="start"></cs-icon>Experimental
</cs-badge>
<br><br>
<p>Server Side Rendering ("SSR") means your webpage is rendered on the server before being sent to the user's browser. This provides a fully formed HTML page right from the start, which is great for SEO and initial load times. Once the page is rendered, JavaScript kicks in to "hydrate" the components which makes them interactive. The Web platform supports this through a feature called <a href="https://web.dev/articles/declarative-shadow-dom">Declarative Shadow DOM</a></p>

:::warning
**SSR is experimental**, in part because Lit's SSR package is too. Watch for [known bugs and timing issues](#known-issues), and please [report anything new on GitHub](https://github.com/CruGlobal/cornerstone-design-system/issues).
:::

## Goals of SSR

The goal of SSR in Cornerstone currently is to reduce layout shifting and provide a rough approximation of the final component until its JavaScript is ready. SSR components are **NOT** meant to fully work without JavaScript.

Progressive enhancement is _not_ a goal of Cornerstone (currently). This is partially because, for form controls in particular, there is no browser API to "hoist" form controls from the shadow root. Another reason is that certain components like `<cs-qr-code>` depend on browser APIs like `<canvas>` being available.

## Enable Hydration

If you're using the `cornerstone.loader.js` file which automatically loads, make sure to change it to `cornerstone.ssr-loader.js`.

```diff
- <script type="module" src="/dist/cornerstone.loader.js"></script>
+ <script type="module" src="/dist/cornerstone.ssr-loader.js"></script>
```

If you're using a bundler and **NOT** using the autoloader, make sure `@lit-labs/ssr-client/lit-element-hydrate-support.js` comes _before_ any components are imported.

```js
// Make sure this import is first.
import '@lit-labs/ssr-client/lit-element-hydrate-support.js';

import '@cruglobal/cornerstone-components/components/button/button.js';
import '@cruglobal/cornerstone-components/components/input/input.js';
```

## Enable Server Rendering

How to implement SSR on the backend is largely dependent on what stack you're using. For docs on how to hook up your backend, refer to [this document from Lit](https://lit.dev/docs/ssr/server-usage/).

For example, here's what the [11ty](https://www.11ty.dev/) integration looks like using [Lit's 11ty plugin](https://www.npmjs.com/package/@lit-labs/eleventy-plugin-lit).

```js
// eleventy.config.js

import litPlugin from '@lit-labs/eleventy-plugin-lit';

eleventyConfig.addPlugin(litPlugin, {
  mode: 'worker',
  componentModules: [
    '@cruglobal/cornerstone-components/components/button/button.js',
    '@cruglobal/cornerstone-components/components/input/input.js',
  ],
});
```

:::info
As SSR becomes more stable, we'll work to add more instructions for various frameworks and meta frameworks.
:::

Checkout our [Frameworks](/frameworks) page for specific frameworks as they tend to have SSR-specific sections.

## Helpful Tips

### The `did-ssr` Attribute

All Cornerstone components that get rendered for SSR will receive the `did-ssr` attribute.

```html
<cs-button appearance="filled" did-ssr></cs-button>
```

This can help you style elements before they connect. For example, you can hide custom elements that _weren't_ server-rendered until they're defined, so SSR'd elements still show their pre-hydration markup:

```css
/* Avoid a flash of unstyled content for elements that weren't server-rendered. */
:not([did-ssr]):not(:defined) {
  visibility: hidden;
}
```

### Timing Issues

Before setting any properties on your frontend, it is important to first wait for the element to be defined and then wait for its first update to complete.

```js
const rating = document.querySelector('cs-rating');

// If we don't wait for the component to be defined the initial hydration, we will get a hydration error from Lit!
await customElements.whenDefined('cs-rating');
await rating.updateComplete;

rating.getSymbol = () => '<cs-icon name="favorite" variant="fill"></cs-icon>';
```

This will help prevent hydration issues. (We will try our best to work around this as sometimes this isn't possible to do from your rendering framework, so if you encounter this, please let us know and file an issue.)

### Usage with Turbo

The Hotwire library [Turbo](https://github.com/hotwired/turbo) has an issue with SSR + declarative shadow DOM. To fix this, you can add the following to every page that runs Turbo.

```js
function fixDeclarativeShadowDOM(e) {
  const newElement = e.detail.newBody || e.detail.newFrame || e.detail.newStream;
  if (!newElement) {
    return;
  }

  // https://developer.chrome.com/docs/css-ui/declarative-shadow-dom#polyfill
  (function attachShadowRoots(root) {
    root.querySelectorAll('template[shadowrootmode]').forEach(template => {
      const mode = template.getAttribute('shadowrootmode');
      const shadowRoot = template.parentNode.attachShadow({ mode });
      shadowRoot.appendChild(template.content);
      template.remove();
      attachShadowRoots(shadowRoot);
    });
  })(newElement);
}

// Fixes an issue with DSD keeping the `<template>` elements hanging around in the light DOM.
// https://github.com/hotwired/turbo/issues/1292
['turbo:before-render', 'turbo:before-stream-render', 'turbo:before-frame-render'].forEach(eventName => {
  document.addEventListener(eventName, fixDeclarativeShadowDOM);
});
```

## The `with-*` Attributes

Some components use slot detection to conditionally render parts of their template. For example, `<cs-dialog>` only renders its footer when a `footer` slot is present. During SSR, slot detection doesn't work because the DOM isn't available, so these parts would be missing from the initial server-rendered markup.

To solve this, components that rely on slot detection provide `with-*` attributes. These tell the component to render the relevant section during SSR, before hydration kicks in and slot detection takes over.

Not every component has `with-*` attributes—only those that conditionally render parts based on slot content. Check a component's documentation to see which `with-*` attributes it supports.

```html
<!-- Without ssr-footer, the footer won't appear in the server-rendered HTML -->
<cs-dialog ssr-footer>
  <p>Dialog content</p>
  <div slot="footer">
    <cs-button>Close</cs-button>
  </div>
</cs-dialog>
```

These attributes are only needed for SSR. After the component hydrates on the client, slot detection works normally and the attributes have no effect.

Contributing a component that needs a `with-*` fallback? See [Server-Side Rendering in the contributing guide](/resources/contributing#server-side-rendering-ssr) for the implementation pattern.

## Known Issues

Here are some known issues and things we're still working on.

- `@shoelace-style/localize` (our localization library) has no way to set a language currently so it always falls back to `en`.
- Components are unable to read "up" a tree to find the `dir`. This will be fixed in a future version, as it should be straightforward to track `dir` in SSR when building the tree and store it in the current context.
- `<cs-icon>` has no fallback if there's no JS besides a blank `<svg>`. There's perhaps some backend mechanisms we can use to fetch. But requires altering APIs. Should also have a way to set explicit fallback height / widths, but we don't want to increase pain for SSR users.
- `<cs-qr-code>` QR Code will not error on the backend and will render a blank canvas at the appropriate size, but will not render the canvas until the client component connects.
- `setBasePath` and `setIconPath` may need reconfiguring to work with SSR.
- `<cs-animated-image>` has no real suitable fallback without JS as it requires JS to function, and a `<video playsinline muted loop>` is not a great experience, and `<img>` autoplays the image, which may not be intended.