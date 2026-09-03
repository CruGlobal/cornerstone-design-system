---
title: WordPress
description: Tips for using Cornerstone in your WordPress theme or plugin.
officialDocs: https://developer.wordpress.org
sidebar:
  badge:
    text: Testing
    variant: caution
---

<div class="cs-cluster cs-gap-2xs cs-not-prose">
  <cs-badge variant="success" appearance="filled" pill>
    <cs-icon name="check_circle" slot="start"></cs-icon>Verified on WordPress 7.1
  </cs-badge>
  <cs-badge variant="neutral" appearance="filled" pill>PHP 8.5</cs-badge>
  <cs-badge variant="neutral" appearance="filled" pill>Script Modules</cs-badge>
</div>

Every snippet below has run on a real WordPress install — 7.1 on PHP 8.5.1, plugin activated, front end and
block editor both checked. See [what has been verified](#what-has-been-verified) at the end for what that
covered and the two things it did not.

WordPress renders HTML on the server, so `cs-*` tags work in a template, a shortcode or a block's `render_callback`
with no integration code. What takes the work is WordPress's asset API, which was built for classic scripts and
needs telling that Cornerstone's loader is an ES module.

Nothing here requires a Node build step. The library ships a **bundled** build with its dependencies inlined,
so a plugin or theme can vendor those files and enqueue them as they are.

## Vendoring the files

Install once, wherever you keep build tooling, and copy the bundled build into the plugin or theme:

```bash
npm init -y   # if the plugin has no package.json yet
npm install @cruglobal/cornerstone-components
mkdir -p assets
cp -R node_modules/@cruglobal/cornerstone-components/dist/bundled assets/cornerstone
```

Both extra lines matter in a fresh plugin. Without `mkdir -p assets` the copy fails outright
(`cp: assets/cornerstone: No such file or directory`), and `npm install` in a directory with no
`package.json` walks up and installs into whichever ancestor has one, editing that manifest instead.

Copy the whole directory. The loader imports its chunks by relative path and fetches each component file at
runtime, so a lone `cornerstone.loader.js` will not work on its own.

## Enqueuing

`cornerstone.loader.js` is an ES module, and `wp_enqueue_script()` emits a classic `<script>`. On WordPress
6.5 and later, use the Script Modules API, which emits `type="module"` for you:

```php
add_action( 'wp_enqueue_scripts', function () {
    $base = plugin_dir_url( __FILE__ ) . 'assets/cornerstone';

    wp_enqueue_style( 'cornerstone', "$base/styles/cornerstone.css", array(), null );
    wp_enqueue_script_module( 'cornerstone', "$base/cornerstone.loader.js", array(), null );
} );
```

On older versions, enqueue it normally and promote it to a module with `script_loader_tag`:

```php
add_filter( 'script_loader_tag', function ( $tag, $handle ) {
    if ( 'cornerstone' !== $handle ) {
        return $tag;
    }

    return str_replace( '<script ', '<script type="module" ', $tag );
}, 10, 2 );
```

## Pass `null` as the version, or set the base path

This one fails silently, so it is worth understanding rather than copying.

The autoloader finds components by URL, not through the module graph: it watches the DOM, and when it sees an
unregistered `cs-*` tag it imports `{basePath}/components/{tag}/{tag}.js`. It works the base path out from its
own module URL, which means WordPress's cache-busting query string is harmless — `?ver=6.9` on the script tag
changes nothing about where the module itself lives.

You therefore do not need to pass `null` as `$ver`, and you do not need a `data-cornerstone` attribute.
Verified against a server that appends `?ver=6.9` to the loader: every component upgrades, no failed
requests, clean console.

Earlier versions of this library matched the script's `src` against the literal filename
`cornerstone.loader.js`, which `?ver=` defeated — so if you are following an older snippet that passes `null`
or sets `data-cornerstone`, neither does any harm, but neither is doing anything either.

`data-cornerstone` is still the way to point at a different directory, and it may sit on **any** element on
the page:

```php
add_action( 'wp_head', function () {
    $base = plugin_dir_url( __FILE__ ) . 'assets/cornerstone';

    printf( '<meta name="cornerstone-base" data-cornerstone="%s">', esc_url( $base ) );
} );
```

It now keeps the origin, so an absolute URL to a CDN works as the doc comment always claimed. It previously
kept only the path, which silently turned a cross-origin base into a same-origin one.

## The block editor

Editor canvases are iframed in current WordPress, and assets enqueued for the front end do not reach them.
If your blocks render `cs-*` tags in the editor, enqueue on `enqueue_block_assets` — it runs for the front end
*and* inside the canvas, so it replaces the `wp_enqueue_scripts` hook above rather than joining it. But
**enqueue classically here, not as a script module**:

```php
add_action( 'enqueue_block_assets', function () {
    $base = plugin_dir_url( __FILE__ ) . 'assets/cornerstone';

    wp_enqueue_style( 'cornerstone', "$base/styles/cornerstone.css", array(), null );
    wp_enqueue_script( 'cornerstone', "$base/cornerstone.loader.js", array(), null );
} );

add_filter( 'script_loader_tag', function ( $tag, $handle ) {
    return 'cornerstone' === $handle ? str_replace( '<script ', '<script type="module" ', $tag ) : $tag;
}, 10, 2 );
```

:::warning
**`wp_enqueue_script_module` does not reach the editor canvas.** Measured on WordPress 7.1: with the module
enqueue the loader lands only in the parent admin document, the canvas iframe receives no loader, and a
`cs-*` element inside it never upgrades. Enqueued classically, WordPress injects the tag into the canvas, the
filter's `type="module"` survives the injection, and components upgrade normally.

The *stylesheet* crosses into the iframe either way, so the canvas looks styled even when nothing has
upgraded — which is the easy way to be fooled here.
:::

A block registered with a `viewScriptModule` is the other route into the canvas, and may well be the better
one; it has not been tested.

Prefer `enqueue_block_assets` over `enqueue_block_editor_assets`, which targets the editor chrome around the
canvas rather than the canvas itself — where the components actually render.

## Icons

`<cs-icon>` fetches its SVGs at runtime from a CDN by default. For a site that should not depend on a
third-party host, serve them yourself — the bundled build's base path already points at your own domain, and
`setIconPath` sets where icons resolve from. See [`<cs-icon>`](/components/icon) for the directory layout.

## Theme styles will fight you

WordPress themes commonly reset margins on everything, and a component's slotted content is styled by the
**page**, not the shadow root — an outer declaration wins regardless of specificity. If slotted text looks
wrong inside a component, that is usually the theme reaching in. Cornerstone defends against the common cases,
but a theme with an aggressive universal selector can still get through; scope the reset away from `cs-*` tags
rather than fighting it inside the component.

## What has been verified

:::info
The base-path behaviour was reproduced directly, serving the bundled build from one path and the document
from another:

Re-verified on a real install — **WordPress 7.1, PHP 8.5.1**, SQLite drop-in, Twenty Twenty-Five, plugin
activated — rather than in a harness. No PHP notices or deprecations from the plugin.

- **The Script Modules enqueue works as printed**, with `null` as `$ver`: the loader renders as
  `<script type="module">` and `cs-button`, `cs-badge` and `cs-icon` all upgrade with shadow roots and no
  console output. Icons come from jsdelivr, as stated above.
- **`?ver=` used to break autoloading**, when the base path was found by matching the script's filename. It
  no longer does: base-path resolution now comes from the library's own module URL, so a query string on the
  script tag is irrelevant. Re-verified against a server that appends `?ver=6.9` — every component upgrades,
  zero failed requests, clean console, with no `data-cornerstone` and no `null` version.
- **`data-cornerstone` is no longer needed for this**, and is now only for pointing at a different directory.
  It also keeps the origin now, so a CDN base works.
- **The classic `wp_enqueue_script` + `script_loader_tag` path also works on WordPress 7.1**, so it is a live
  fallback rather than an old-version story — and inside the block editor it is the *only* path that works.

**How the failure actually looks**, since two earlier claims here were wrong:

- It is **not silent.** The autoloader logs one `console.error` per component:
  `Unable to autoload <cs-button> from /components/button/button.js`. It was a `console.warn` until
  2026-08-24; nothing downstream recovers from a component that never upgrades, so it is an error.
- There is **no 404 to find.** WordPress's rewrite rules turn the request into a `301` and then a **`200`** —
  a 66 KB HTML 404 page served with a success status. Anyone told to watch for a 404 in the network panel will
  not see one. Watch the console instead.

WordPress serves plugin files verbatim, so unlike Rails there is no filename-digest problem on top — which is
why setting the base path is sufficient here.

Theme interference is real, mildly: Twenty Twenty-Five's `Manrope` inherits into the components in place of
Cornerstone's Inter. Nothing broke.

**Not verified:** a registered block using `viewScriptModule`, and anything about WP VIP's asset policy.
:::
