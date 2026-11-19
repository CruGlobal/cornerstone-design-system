---
title: Ruby on Rails
description: Tips for using Cornerstone in your Rails app.
officialDocs: https://rubyonrails.org
sidebar:
  badge:
    text: Testing
    variant: caution
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
<%# Already in an importmap-rails layout. Shown for its place in the order, not a line to add. %>
<%= javascript_importmap_tags %>
<%= javascript_include_tag "cornerstone.all", type: "module", preload_links_header: false, "data-turbo-track": "reload" %>
```

Keep that order. If the layout calls `javascript_importmap_tags`, every Cornerstone module tag goes **after**
it, because Firefox drops an import map that arrives once a module has started loading, and your app's own
JavaScript goes with it. `preload_links_header: false` is there for the same reason: by default Rails also
names a module include tag in a `Link: rel=modulepreload` response header, and that header reaches Firefox
before any of the HTML, so the map is dropped whatever the tag order. [Import maps](#import-maps) below has
the symptom and the fix.

The include tag was verified through a digest-only pipeline: every component upgrades, no failed requests,
clean console. That check covers serving the fingerprinted file. The tag order and the `Link` header were
checked on their own, outside Rails, as [What has been verified](#what-has-been-verified) sets out.

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
<%# Already in an importmap-rails layout. Shown for its place in the order, not a line to add. %>
<%= javascript_importmap_tags %>
<script type="module" src="/cornerstone/cornerstone.loader.js"></script>
```

That is the whole setup. If the layout calls `javascript_importmap_tags`, the order is part of it: the
loader's tag goes **after** that call. Firefox drops an import map that arrives once a module has started
loading, which takes your app's own JavaScript down with it. [Import maps](#import-maps) below has the
symptom and the fix.

The loader resolves its base path from its own module URL, so there is no
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

You do not pin Cornerstone. The loader is reached by a `<script type="module">` tag from a stable URL, so there is
nothing for `importmap-rails` to map, and pinning it *through* the asset pipeline reintroduces the digest
problem above.

The two still meet in your layout, and the order of the tags matters.

:::warning
**Put every Cornerstone module tag after `javascript_importmap_tags`.** That covers the loader's
`<script type="module">`, `javascript_include_tag "cornerstone.all", type: "module", preload_links_header: false`,
an inline `<script type="module">`, and any `<link rel="modulepreload">` you add by hand.

The reason is a browser rule. Firefox accepts an import map only until the first module starts to load or
preload. A map that comes later is thrown away. Without the map, `import "application"` cannot be resolved,
so none of your app's JavaScript runs: no Stimulus controllers, no Turbo.

For `javascript_include_tag` with `type: "module"`, order alone is not enough. By default Rails also puts the
file in a `Link: rel=modulepreload` response header, and Firefox counts that as a preload that started before
the map, wherever the tag sits. `preload_links_header: false` on the tag leaves the header out.

It is easy to miss, because the page looks fine. The loader is not in the map, so it still runs and every
`cs-*` element still draws. Only the things that need your own scripts are dead. Chromium 140 and WebKit 26, the
versions run for this page, accepted a late map, so it also works on the machine of anyone who is not testing
in Firefox. Older releases of either may not.

Firefox logs a warning for the dropped map, then an error for the import that needed it:

```text
Import maps are not allowed after a module load or preload has started.
TypeError: The specifier “application” was a bare specifier, but was not remapped to anything. Relative module specifiers must start with “./”, “../” or “/”.
```

```erb
<%# Before: Firefox drops the import map, and the app's JavaScript never runs %>
<script type="module" src="/cornerstone/cornerstone.loader.js"></script>
<%= javascript_importmap_tags %>

<%# After %>
<%= javascript_importmap_tags %>
<script type="module" src="/cornerstone/cornerstone.loader.js"></script>
```

Moving the tag down does not block parsing: a module script never holds up the parser, wherever it sits in
`<head>`. It does change the run order. Module scripts run in document order, so your app's module now runs
before Cornerstone's. App code that calls a component method right away should wait for that component
first, with `await customElements.whenDefined('cs-button')`, or with `allDefined()` for every component on
the page. [Waiting for components to be ready](/usage/#waiting-for-components-to-be-ready) covers both.
:::

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
for the initial load — both are covered on [Reducing FOUCE](/utilities/fouce). Read the caution there before you
put the class on `<body>`.

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
Stimulus action for `<cs-select>` names the same event it would for a native `<select>`. The `cs-` prefix is
reserved for events with no native equivalent, like `<cs-select>`'s own `cs-clear`.

:::warning
**Always write the event in a Stimulus action on a `cs-*` element.** On a few native elements Stimulus lets
you leave the event out and fills in a default, such as `click` for `<button>` and `change` for `<select>`.
It picks that default by tag name, and no `cs-*` tag is on its list. So a bare `modal#open` on a
`<cs-button>` never binds, and nothing tells you: Stimulus throws `missing event name` while it reads the
attribute, then catches that error itself and never reports it. The console stays empty.

```erb
<%# Before: never fires, and logs nothing %>
<cs-button data-action="modal#open">Open</cs-button>

<%# After %>
<cs-button data-action="click->modal#open">Open</cs-button>
```

Write the event Stimulus would have filled in for the native element: `click->` on `<cs-button>`, `input->`
on `<cs-input>` and `<cs-textarea>`, and `change->` on `<cs-select>`.
:::

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

The Stimulus warning was checked outside that app, against Stimulus 3.2.2: in its source, and by running it
under jsdom, where a bare action on a `cs-*` element bound nothing and logged nothing.

Two things worth knowing before you copy into `public/`: `npm install` in a generated Rails app creates a
`package.json` and lock file at the app root, since one does not exist; and the copy is **11 MB across 1,114
files, all web-served** — 350 `.d.ts`, 142 React wrappers and the agent skill included. A three-component page
issues roughly 50 requests.

The import map order was checked outside that app too. No Rails app was run for it. The pages were static
HTML with hand-written tags, served locally and loaded with Playwright 1.55.1:

- **Firefox 141.0** dropped the import map when any of these came before it: a `<script type="module" src>`,
  an inline `<script type="module">`, or a `<link rel="modulepreload">`. The bare `import "application"` then
  failed, with the two console messages quoted under [Import maps](#import-maps). The loader's own module
  still ran.
- **Firefox 141.0** kept the map when it came first, and when only a classic `<script>` came before it.
- **Chromium 140.0.7339.186 and WebKit 26.0** resolved the import in every order, with a clean console.

The `Link` header was checked the same way: static pages with the import map first in the HTML, each loaded
five times, with the header set by the local server. Its text, `</loader.js>; rel=modulepreload; as=script; nopush`,
is the form `javascript_include_tag` builds for a `type: "module"` tag in actionview 8.1.3.1. That was read in
the helper's source and seen by calling the helper on its own, where `preload_links_header: false` left the
header unset.

- **Firefox 141.0** dropped the import map in five loads of five when the response carried that header, with
  the same warning. With no header, or with `rel=preload` in its place, it kept the map every time.
- **Chromium 140.0.7339.186 and WebKit 26.0** resolved the import in five loads of five with the header.

**Not yet verified:** the `jsbundling-rails` path, `setIconPath` against self-hosted SVGs, the import map
order, the `Link` header and `preload_links_header: false` in a running Rails app, and Firefox releases other
than 141.0.
:::
