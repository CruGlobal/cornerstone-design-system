---
title: Ruby on Rails
description: Tips for using Cornerstone in your Rails app.
officialDocs: https://rubyonrails.org
sidebar:
  badge:
    text: Tested
    variant: success
---

<div class="cs-cluster cs-gap-2xs cs-not-prose">
  <cs-badge variant="success" appearance="filled" pill>
    <cs-icon name="check_circle" slot="start"></cs-icon>Verified on Rails 8.1
  </cs-badge>
  <cs-badge variant="neutral" appearance="filled" pill>Propshaft</cs-badge>
  <cs-badge variant="neutral" appearance="filled" pill>Turbo</cs-badge>
</div>

Rails renders HTML on the server, and a custom element *is* an HTML element — so there is no integration
layer to write. A Rails view can use `cs-*` tags the moment the browser has the library.

Getting it there has one wrinkle, and it is worth understanding before you copy anything: **Cornerstone's
autoloader builds asset URLs at runtime, and Propshaft fingerprints every file it serves.** Those two facts
do not compose, so the asset pipeline is the wrong home for the JavaScript.

## Serve the library from `public/`

The split builds resolve components in two stages, and Propshaft breaks the earlier one.

Each entry file is a stub of *relative* chunk imports — `cornerstone.loader.js` opens with 17
`./chunks/chunk.*.js` specifiers, and a component file with around 40. The browser resolves those against the
importing module's own URL, and nothing rewrites them: Propshaft renames the files but does not touch JS
import specifiers. So under digest-only serving every chunk 404s and **the loader never executes at all**.
Measured: 17 module 404s and no library code running. Setting a base path makes no difference, because the
failure is below it.

If you get past that, the autoloader imports `{basePath}/components/{tag}/{tag}.js` when it sees an
unregistered `cs-*` tag, and Propshaft has renamed that file too. That second failure *is* reported — the
console shows `Unable to autoload <cs-button> from /components/button/button.js` — but the first one shows only
a wall of anonymous 404s with no mention of Cornerstone, which is why this is easy to lose an hour to.

You have two ways out. Either serve the library from `public/`, which is the simple path, or use the
single-file build, which is the one artifact a fingerprinting pipeline can serve.

### Option 1: the single-file build, fingerprinted

`cornerstone.all.js` is every component in one file — no chunks, no dynamic import, no URL built at runtime.
That makes it an ordinary asset, so Propshaft can fingerprint it like any other:

```bash
npm install @cruglobal/cornerstone-components
cp node_modules/@cruglobal/cornerstone-components/dist/bundled/cornerstone.all.js app/assets/javascript/
```

```erb
<%# app/views/layouts/application.html.erb %>
<%= javascript_include_tag "cornerstone.all", type: "module", "data-turbo-track": "reload" %>
```

Verified against a digest-only pipeline: every component upgrades, no failed requests, clean console.

The trade is size. It is 188 KB gzipped, fixed, because it contains all 70 components whether you use them or
not. A page using one button costs about 57 KB gzipped through the loader instead. Break-even is somewhere
around a dozen components, so an application shell probably wins and a marketing page probably loses.

### Option 2: serve the split build from `public/`

Files under `public/` are served verbatim, which sidesteps the problem entirely:

```bash
npm install @cruglobal/cornerstone-components
cp -R node_modules/@cruglobal/cornerstone-components/dist/bundled public/cornerstone
```

```erb
<%# app/views/layouts/application.html.erb %>
<link rel="stylesheet" href="/cornerstone/styles/cornerstone.css">
<script type="module" src="/cornerstone/cornerstone.loader.js"></script>
```

That is the whole setup. The loader resolves its base path from its own module URL, so there is no
`setBasePath` call and no `data-cornerstone` attribute to add.

What this actually costs is smaller than it sounds. A page with one button fetches 43 files, and 40 of the 42
JavaScript files — 98.4% of the gzipped bytes — are **already content-hashed by our own build**. The only two
undigested files are `cornerstone.loader.js` and the component itself: 921 gzipped bytes. So you are not
opting out of caching for the library, you are opting out for under a kilobyte of it.

Use the **bundled** build, as above. The unbundled one keeps nine dependencies as bare specifiers — `lit`,
`@floating-ui/dom`, `@shoelace-style/localize` and six more — which the browser cannot resolve without an
import map covering every one. The bundled build inlines them. Copy the whole directory either way: the
loader fetches each component at runtime, so a lone `cornerstone.loader.js` does nothing.

### Fingerprinting the stylesheet, if you want it

The CSS has no runtime URL construction, so it *can* go through Propshaft and benefit from fingerprinting.
Drop the library's `styles/` directory into `app/assets/` and reference it by logical path:

```erb
<%= stylesheet_link_tag "cornerstone", "data-turbo-track": "reload" %>
```

Rails adds each direct subdirectory of `app/assets` to the load path as its own root. Copied as
`app/assets/styles`, that directory *is* the root, so the logical path is `cornerstone` — the directory name
does not appear in it. Propshaft rewrites the nested `@import` chain — `cornerstone.css` pulls in the layers,
the theme, and the theme's palette and variants — so all of it resolves fingerprinted.

:::warning
**`stylesheet_link_tag :app` will flat-link every file you put here.** Rails 8's generated layout includes
`stylesheet_link_tag :app`, which Propshaft expands to every `.css` file under `app/assets`. After this copy a
page goes from **1 stylesheet link to 32** — each internal partial linked separately, unordered, outside the
`@import` cascade the library builds. It still renders, because the partials are idempotent and
`cornerstone.css` is among them, but it is 31 wasted requests. Either drop `:app` from the layout, or keep the
stylesheet in `public/` alongside the components.
:::

## Import maps

`importmap-rails` does not help here and is not needed. The loader is reached by a plain `<script>` tag from
a stable URL, so there is nothing to pin, and pinning it *through* the asset pipeline reintroduces the digest
problem above.

If you pin components directly instead of using the autoloader, pass `preload: false`. `pin_all_from`
defaults to `preload: true`, which emits a `<link rel="modulepreload">` per file on every page — pointed at
70 components that is 70 requests queued on one connection whatever the page renders. `moa`'s own
`config/importmap.rb` documents this after it cost that app 159 module requests per page load.

## Icons

`<cs-icon>` does **not** use the library's base path. Icons come from a CDN by default — a page using
`check_circle` fetches `https://cdn.jsdelivr.net/npm/@material-symbols/svg-400@…/sharp/check_circle.svg` —
so no extra setup is needed, but the requests do leave your origin. To serve them yourself, use
`setIconPath` — see [`<cs-icon>`](/components/icon) for the directory layout it expects.

## Turbo

Turbo Drive replaces `<body>` rather than reloading the page. Custom elements handle that on their own —
`customElements.define` is global, so elements in the new body upgrade as they are parsed, and the autoloader
keeps working across navigations.

What needs handling is the flash between visits: Turbo swaps in the new body before its components have
registered, so they paint unstyled for a frame or two. Cornerstone ships an API for exactly this:

```js
// app/javascript/application.js
import { preventTurboFouce } from '/cornerstone/cornerstone.js';

preventTurboFouce();
```

It hooks `turbo:before-render`, holds the render until every component in the incoming body has registered,
and gives up after two seconds so a failed import cannot wedge navigation. Pair it with the `cs-cloak` class
for the initial load — both are covered on [Reducing FOUCE](/utilities/fouce).

## Stimulus

Cornerstone's events are ordinary DOM events that bubble and compose, so a Stimulus action descriptor takes
them directly:

```erb
<div data-controller="filters">
  <cs-select data-action="change->filters#apply">
    <cs-option value="all">All</cs-option>
  </cs-select>
</div>
```

The action needs a `data-controller` scope on the element or an ancestor, as any Stimulus action does — without
it nothing fires.

```js
// app/javascript/controllers/filters_controller.js
import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  apply(event) {
    console.log(event.target.value);
  }
}
```

Note the event name. Form controls emit **native-named** events — `change`, `input`, `focus`, `blur` — so a
Stimulus action for `<cs-select>` reads exactly as it would for a native `<select>`. The `cs-` prefix is
reserved for events with no native equivalent, like `<cs-select>`'s own `cs-clear`.

Read the value off the element rather than the event, as you would natively: `event.target.value`.

## What has been verified

:::info
Checked in a generated Rails 8.1.3.1 app with Propshaft, importmap-rails and Turbo:

- **`public/` setup** — the button registered, upgraded, rendered at its themed size, and the base path
  auto-detected as `/cornerstone`.
- **The digest problem** — reproduced both halves. Propshaft's own load path reports
  `components/button/button-166a237e.js`, and the undigested URL the autoloader requests returns 404.
  It is **not** silent: the autoloader logs one `console.warn` per component,
  `Unable to autoload <cs-button> from /components/button/button.js`. That warning, not the 404, is the thing
  to look for.
- **`preventTurboFouce` across a real Turbo visit** — with the call in place, the incoming body's components
  were registered before render (`cs-card` had its shadow root); with it removed, the same navigation rendered
  them unregistered. It holds the render exactly as advertised.
- **Propshaft for the stylesheet** — the theme's fonts applied, so the `@import` chain resolved. The logical
  path and the `:app` behaviour above were both measured against Propshaft's own resolver.

Two things worth knowing before you copy into `public/`: `npm install` in a generated Rails app creates a
`package.json` and lock file at the app root, since one does not exist; and the copy is **11 MB across 1,114
files, all web-served** — 350 `.d.ts`, 142 React wrappers and the agent skill included. A three-component page
issues roughly 50 requests.

**Not yet verified:** the `jsbundling-rails` path, and `setIconPath` against self-hosted SVGs.
:::
