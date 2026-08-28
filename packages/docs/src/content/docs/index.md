---
title: Cornerstone Components
description: The custom-element library of the Cornerstone design system.
synonyms:
  - installation
  - install
  - getting started
  - setup
  - quickstart
use-cases:
  - npm install
  - add to a project
  - self-hosting
  - autoloader
  - bundler
---

Cornerstone Components is the `cs-*` custom-element library of the Cornerstone design system. The
pages under **Components** are its reference: every one is generated from the same Custom Elements
Manifest the package ships, so what you read here is what the component actually does.

:::info
This site is being ported from its previous generator a page at a time. Pages carry their original
prose until each is revised, so some of it still describes the library this one was forked from.
:::

## Installing via npm

```bash
npm install @cruglobal/cornerstone-components
```

The package is public. There is no registry to configure and nothing to authenticate against.

It ships two builds of the same library, and which one you want depends on whether you have a bundler.
**Unbundled** is ES modules that leave `lit` and the other dependencies as bare specifiers — it is what
every import specifier resolves to, and your bundler resolves the rest. **Bundled** is the same modules
with those dependencies inlined, so a browser loads them with no build step; that is the one to copy if
you are self-hosting.

`dist` never appears in an import specifier. It is the container the two builds sit in, not part of the
public API.

## Loading the library

Two things have to reach the page: `cornerstone.css`, which carries the theme every component reads its
tokens from, and the components themselves.

<cs-tab-group>
<cs-tab panel="npm">npm</cs-tab>
<cs-tab panel="self-hosted">Self-Hosted</cs-tab>
<cs-tab-panel name="npm">

Import the stylesheet once, then import each component you use.

```js
import '@cruglobal/cornerstone-components/styles/cornerstone.css';
import '@cruglobal/cornerstone-components/components/button/button.js';
```

```html
<cs-button variant="brand">Click me</cs-button>
```

Every component's page carries its own import line under **Importing**, for npm, self-hosted and React.

</cs-tab-panel>
<cs-tab-panel name="self-hosted">

Copy the bundled build out of the installed package and serve it from your own origin.

```bash
cp -R node_modules/@cruglobal/cornerstone-components/dist/bundled public/cornerstone
```

Copy the whole directory. The loader imports its chunks by relative path and fetches each component file
at runtime, so `cornerstone.loader.js` on its own will not work.

Then link the stylesheet and the loader.

```html
<link rel="stylesheet" href="/cornerstone/styles/cornerstone.css" />
<script type="module" src="/cornerstone/cornerstone.loader.js"></script>

<cs-button variant="brand">Click me</cs-button>
```

Nothing else is imported by hand: the loader watches the document and registers each `cs-*` element as
it appears.

</cs-tab-panel>
</cs-tab-group>

## Choosing how components load

There are three ways to get a component's definition onto the page, and the right one depends on how
your project serves JavaScript.

**Cherry-picked imports** are the answer behind a bundler. Each one is a static specifier, so the
bundler can see it, and you ship only the components you used.

```js
import '@cruglobal/cornerstone-components/components/button/button.js';
```

**The autoloader** registers components on demand — it watches the DOM and imports each `cs-*` element's
definition as it finds one, including elements added later.

```js
import '@cruglobal/cornerstone-components/cornerstone.loader.js';
```

:::warning
The autoloader resolves those imports at runtime, from its own module URL. A bundler cannot see an
import built that way, so it never emits the files the autoloader will ask for — it works where the
library is served as files, and 404s in a production bundle. Behind a bundler, cherry-pick.
:::

**Everything at once** loads the whole library in one import. It is the bundled build, so it carries its
own copy of the dependencies — good for a prototype, wasteful for an application.

```js
import '@cruglobal/cornerstone-components/all';
```

## Light and dark

Cornerstone's theme is light at the document root and switches to dark under a `cs-dark` class. Nothing
applies it for you, `prefers-color-scheme` included, so a page that never sets it stays light.

```html
<html class="cs-dark"></html>
```

See [Theming](/theming-overview) for what else that class list can carry, and
[Built-in Themes](/themes) for the two themes that ship.

## Avoiding the flash

Until a definition loads, the browser treats a `cs-*` tag as an unknown inline element — so the page
paints unstyled and then reflows. The `cs-cloak` class hides an element, or the whole document, until
its components have registered:

```html
<html class="cs-cloak"></html>
```

The autoloader removes it as soon as discovery completes, or after two seconds, whichever comes first.
See [Reducing FOUCE](/utilities/fouce).

## Where to start

- **Components** — the reference for all 70 elements, grouped by what they are for.
- Each page opens with the component's tag, status and the version it landed in, then live examples,
  then its full API: slots, attributes and properties, methods, events, CSS custom properties,
  custom states and CSS parts.

## Where to go next

- [Usage](/usage) — attributes, properties, slots, events, methods, and editor code completion.
- [Frameworks](/frameworks) — React, Vue, Angular, Svelte, Rails and WordPress.
- [Theming](/theming-overview) — themes, palettes, variants and design tokens.
- [Form Controls](/form-controls) — validation and form submission.
- [Server Rendering](/ssr) — rendering components on the server.
