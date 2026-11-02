---
title: Go
description: Tips for using Cornerstone in your Go web app.
officialDocs: https://go.dev
sidebar:
  badge:
    text: Testing
    variant: caution
---

<div class="cs-cluster cs-gap-2xs cs-not-prose">
  <cs-badge variant="success" appearance="filled" pill>
    <cs-icon name="check_circle" slot="start"></cs-icon>Verified on Go 1.27
  </cs-badge>
  <cs-badge variant="neutral" appearance="filled" pill>html/template</cs-badge>
  <cs-badge variant="neutral" appearance="filled" pill>htmx 2</cs-badge>
</div>

A Go server renders HTML, and a custom element *is* an HTML element. So a Go template can use `cs-*` tags with
no integration code, the same way a Rails view or a WordPress template can. What takes the work is getting the
library's files to the browser, and knowing the few places where Go's tools and Cornerstone's components meet.

Nothing here needs Node in your app. The library ships a **bundled** build with its dependencies inlined, so
your server only has to hand those files to the browser.

Every snippet below has been compiled and run in a sample app, not yet in a real one. See
[what has been verified](#what-has-been-verified) at the end for what that covered.

## Getting the files

You need the package's `dist/bundled` directory. `npm pack` downloads the published package without installing
anything, so it works from any machine with npm on it, and your Go project never gets a `package.json`:

```bash
npm pack @cruglobal/cornerstone-components &&
  tar -xzf cruglobal-cornerstone-components-*.tgz &&
  rm -rf static/cornerstone && mkdir -p static &&
  cp -R package/dist/bundled static/cornerstone &&
  rm -rf package cruglobal-cornerstone-components-*.tgz
```

The steps are chained with `&&` so that a failed download stops before your existing copy is deleted. `npm pack`
fetches the newest release and prints the file it wrote, and the file name carries the version, so you know which
release you have. To fetch a particular one, add it to the name: `@cruglobal/cornerstone-components@<version>`.

On a machine without Node, `curl` fetches the same file from the npm registry:
`https://registry.npmjs.org/@cruglobal/cornerstone-components/-/cornerstone-components-<version>.tgz`. Unpack
it and copy `package/dist/bundled` the same way.

Copy the whole directory. The loader imports its chunks by relative path and fetches each component file at
runtime, so `cornerstone.loader.js` on its own will not work.

Either commit `static/cornerstone/` or run those lines in your build before `go build`. The next step compiles
the files into your binary, so they have to be on disk wherever the binary is built, CI included.

## Serving the files

The `embed` package compiles the files into your binary, and `http.FileServerFS` serves them. This needs Go 1.22
or later, for `FileServerFS` and for method-and-path patterns like `"GET /cornerstone/"`. The `go` line in your
`go.mod` has to say 1.22 or later too. With an older one, Go keeps its old routing rules, the code still builds,
and `GET /cornerstone/` matches nothing, so every file returns 404.

```go
package main

import (
	"embed"
	"html/template"
	"io/fs"
	"log"
	"net/http"
)

//go:embed all:static
var static embed.FS

//go:embed templates
var templateFiles embed.FS

var pages = template.Must(template.ParseFS(templateFiles, "templates/*.html"))

func main() {
	assets, err := fs.Sub(static, "static")
	if err != nil {
		log.Fatal(err)
	}

	mux := http.NewServeMux()
	mux.Handle("GET /cornerstone/", http.FileServerFS(assets))
	mux.HandleFunc("GET /{$}", home)
	mux.HandleFunc("POST /subscribe", subscribe)

	log.Fatal(http.ListenAndServe(":8080", mux))
}

type page struct {
	Title string
	Dark  bool
}

func home(w http.ResponseWriter, r *http.Request) {
	data := page{Title: "Subscribe", Dark: r.URL.Query().Has("dark")}

	if err := pages.ExecuteTemplate(w, "home.html", data); err != nil {
		log.Print(err)
	}
}
```

Three details in there are easy to get wrong:

- **`static/` has to sit next to this file.** A `//go:embed` path is read from the directory of the Go file that
  declares it, and it can't contain `..` or follow a symbolic link. So you can't point it at a copy elsewhere in
  the repository, or link to one; the files have to be inside that directory.
- **Keep the `all:` prefix.** Without it, a directory pattern quietly leaves out every file whose name starts with
  `.` or `_`. Nothing fails at build time; the browser just gets a 404 for that file later.
- **The URL matches the folder.** `/cornerstone/` is also the folder's name inside `static/`, so
  `/cornerstone/cornerstone.loader.js` finds `static/cornerstone/cornerstone.loader.js` with no
  `http.StripPrefix`. The loader works out where its components live from its own URL, so there is no base path
  to set either.

### Caching

Files in an `embed.FS` have no modification time, so `http.FileServerFS` sends no `Last-Modified` header and the
browser has nothing to check a cached copy against. The files in `chunks/`, which hold most of the JavaScript a
page loads, are named after a hash of their contents, so it is safe to cache them for good. Wrap the file server,
and add `strings` to your imports:

```go
mux.Handle("GET /cornerstone/", cacheChunks(http.FileServerFS(assets)))
```

```go
// Chunk filenames carry a hash of their contents, so a changed chunk always gets a new URL.
func cacheChunks(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.URL.Path, "/cornerstone/chunks/") {
			w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
		}
		next.ServeHTTP(w, r)
	})
}
```

Leave the other files alone. `cornerstone.loader.js` and the component files keep the same names from one release
to the next.

## The page layout

```html
<!doctype html>
<html lang="en" class="cs-cloak{{if .Dark}} cs-dark{{end}}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{.Title}}</title>
    <link rel="stylesheet" href="/cornerstone/styles/cornerstone.css">
    <link rel="stylesheet" href="/cornerstone/styles/themes/fl.css">
    <script type="module" src="/cornerstone/cornerstone.loader.js"></script>
  </head>
  <body>
    ...
  </body>
</html>
```

- **`fl.css` is what makes it FamilyLife.** The stylesheet picks the theme, not a class. `cornerstone.css`
  carries Cru's theme as well as the base styles, and when two themes set the same value the one loaded last
  wins, so `fl.css` has to come second. No `cs-theme-fl` class is needed. See
  [Loading FamilyLife's theme](/theming-overview#loading-familylifes-theme).
- **Your app supplies the font.** FamilyLife's theme asks for Akkurat but doesn't load it, because Akkurat's
  license covers only FamilyLife's own sites. See [Built-in Themes](/themes).
- **Light is the default.** `cs-dark` switches the page to dark. Nothing adds it for you, not even the user's
  system setting, so the template decides, as `{{if .Dark}}` does here.
- **`cs-cloak` hides the page until its components are ready**, or for two seconds at most. The loader removes
  it once, after the first page's components have loaded. See [Reducing FOUCE](/utilities/fouce).

## Templates

`html/template` treats a `cs-*` tag like any other element. It escapes slotted text and attribute values, and it
doesn't need to know the tag exists. A few things are still worth knowing.

**Write a boolean attribute or leave it out.** `disabled="{{.Disabled}}"` renders `disabled="false"` when the
field is false, and an attribute that is there at all turns the property on, exactly as it does on a native
`<button>`. Use a condition instead:

```html
<cs-button{{if .Disabled}} disabled{{end}}>Save</cs-button>
```

**`html/template` guesses what an attribute holds from its name**, and escapes the value to suit. Any name that
starts with `on` is treated as JavaScript. Names such as `href`, `src` and `background`, and any name containing
`src`, `uri` or `url`, are treated as URLs. Some Cornerstone attributes get caught by that:

- **`once` on `<cs-intersection-observer>`** starts with `on`. `{{if .Once}} once{{end}}` fails when the template
  runs, with `{{if}} branches end in different contexts`. Write `{{if .Once}} once=""{{end}}` instead, or write
  `once` with no condition.
- **`background` on `<cs-qr-code>`** is read as a URL, so an `rgb()` color comes out as `rgb%28245%20240%20230%29`
  and the color is lost. Hex values and color names come through unchanged. The attribute is deprecated anyway:
  set `background-color` on the element in CSS instead.
- **`href` on `<cs-button>` and `<cs-breadcrumb-item>`** gets the same checks as `href` on `<a>`, so a
  `javascript:` URL becomes `#ZgotmplZ`. That is the protection working, not a bug.

If an attribute's value comes out looking odd, check whether its name matches one of those rules.

[templ](https://templ.guide) emits `cs-*` tags as written too. Its `attr?={ condition }` syntax handles boolean
attributes, and neither the `once` nor the `background` problem above happens there.

## Forms

Cornerstone's form controls are [form-associated](/form-controls), so they submit with a plain
`<form method="post">` the way native inputs do, and Go reads them like any other field.

```html
<form method="post" action="/subscribe">
  <cs-input name="email" type="email" label="Email" required></cs-input>
  <cs-select name="topics" label="Topics" multiple>
    <cs-option value="marriage">Marriage</cs-option>
    <cs-option value="parenting">Parenting</cs-option>
  </cs-select>
  <cs-checkbox name="weekly">Send me the weekly email</cs-checkbox>
  <cs-button type="submit" variant="brand">Subscribe</cs-button>
</form>
```

```go
func subscribe(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	email := r.FormValue("email")
	topics := r.Form["topics"] // every selected option; FormValue returns only the first
	weekly := r.FormValue("weekly") == "on"

	// The browser checked `required` and `type="email"`, but a request that doesn't come from
	// the form skips those checks. Validate again before you trust the values.
	if email == "" {
		http.Error(w, "Email is required", http.StatusUnprocessableEntity)
		return
	}

	log.Printf("subscribe email=%q topics=%q weekly=%t", email, topics, weekly)
	http.Redirect(w, r, "/", http.StatusSeeOther)
}
```

- **A `multiple` select sends one pair per choice**, `topics=marriage&topics=parenting`. `r.FormValue` returns
  only the first, so read `r.Form["topics"]` after `ParseForm`.
- **A checkbox works like a native one.** Ticked with no `value`, it sends `on`. Unticked, it sends nothing.
- **Browser checks are not validation.** `required`, `type="email"` and the rest stop a person from submitting a
  bad form, but anything that posts to your handler directly skips them. Always validate on the server.
- **The controls need JavaScript.** Until the library loads, a `cs-*` tag is an unknown element with no value to
  send, so a form submitted before then, or with the library blocked, arrives without those fields. Making pages
  work without JavaScript isn't a goal of the library; [Server Rendering](/ssr#goals-of-ssr) says why. Your
  server-side checks are what catch it.

## htmx

htmx swaps HTML from the server into the page, which suits a Go server well, and Cornerstone handles that markup
without any setup. The autoloader watches the whole document for new elements, so a `cs-*` tag in a swapped-in
partial registers when it arrives, even a tag the page hadn't used before.

```html
<cs-button hx-get="/topics" hx-target="#topics">Show topics</cs-button>
<div id="topics"></div>
```

```html
{{/* templates/topics.html */}}
{{range .}}<cs-badge variant="brand">{{.}}</cs-badge> {{end}}
```

```go
mux.HandleFunc("GET /topics", topics)
```

```go
func topics(w http.ResponseWriter, r *http.Request) {
	if err := pages.ExecuteTemplate(w, "topics.html", []string{"Marriage", "Parenting"}); err != nil {
		log.Print(err)
	}
}
```

:::warning
**Send `cs-*` values from a `<form>`, and use htmx 2.** When an `hx-post` sits on a `<form>`, htmx 2 collects the
values through the browser's `FormData`, which asks each Cornerstone control for its value. Anywhere else, such as
`hx-post` on a control itself or a control pulled in with `hx-include`, htmx reads each element's `value` and only
leaves out an unticked box when the element's `type` is `checkbox`. `<cs-checkbox>` has no `type`, so an unticked
one is sent as `on`, and your handler reads it as ticked. htmx 1.x reads a `<form>` the same way, so there the
problem happens inside forms too.
:::

htmx's built-in swaps put new elements into the page. A morphing swap, such as the idiomorph extension for htmx,
instead edits the elements already there until their attributes match the server's HTML. That includes
attributes a component set on itself, such as `open` on `<cs-dialog>`. `<cs-page>` puts back the heights it
measures (see [DOM Morphing](/components/page#dom-morphing)); the wider question is open in
[#307](https://github.com/CruGlobal/cornerstone-design-system/issues/307). That was found with Turbo 8's morph,
and nobody has tried an htmx morph with Cornerstone yet.

## No server rendering

Cornerstone can render components on the server through Lit's SSR package (see [Server Rendering](/ssr)), but
that package is JavaScript and runs in Node. A Go server can't run it. So in a Go app the components render in
the browser: the server sends `<cs-button>` tags, and the library fills them in once it loads.

`cs-cloak` covers the first load. Later, a partial that brings in a tag the page hasn't loaded yet shows it
unstyled until its file arrives. To hide those elements until they're ready, adapt the rule from the SSR page:

```css
/* Hide a custom element until its definition has loaded. */
:not(:defined) {
  visibility: hidden;
}
```

Unlike `cs-cloak`, this has no two-second limit. A component whose file fails to load stays hidden, and the
error in the browser console is how you would find out. Chromium and WebKit say
`Unable to autoload <cs-…>`. Firefox says the module was blocked because of a disallowed MIME type
(`text/plain`) instead, because Go's 404 page is plain text, but it means the same thing: the file isn't there.

Two things to avoid:

- **A Node service beside your Go server, just to render components.** It can be done, but every page render
  then depends on a second runtime, for a feature this library still marks experimental.
- **Writing declarative shadow DOM (`<template shadowrootmode>`) into your templates by hand.** What goes inside a
  component's shadow root isn't part of its documented API, which is its attributes, properties, slots, events,
  CSS parts and custom properties. It can change in any release, and nothing will tell you your copy is out of
  date.

## Icons

`<cs-icon>` fetches its SVGs from a CDN by default, so icon requests leave your server. To serve them yourself,
use `setIconPath`. See [`<cs-icon>`](/components/icon) for the folder layout it expects.

## Loading from a CDN instead

jsDelivr serves every release on npm, so you can skip the copy and point the `<link>` and `<script>` at
`https://cdn.jsdelivr.net/npm/@cruglobal/cornerstone-components@<version>/dist/bundled/`. The loader then fetches
every component from there too. The trade: your pages depend on a third party being up and reachable, where the
`embed` route puts everything in one binary you control.

## Upgrading

Cornerstone hasn't reached 1.0, and minor releases still rename things: 0.10.0, for example, renamed every
component custom property. So:

- **Pin one exact version.** The copy in `static/cornerstone/` is that version, and nothing changes it until you
  copy again.
- **Read the [changelog](/resources/changelog) before you upgrade**, from your version up, and the **Breaking**
  entries most of all.
- **Replace the whole folder**, as the snippet above does, rather than copying over it. Otherwise files that a
  release removed are still served.

## Claude Code

The `cornerstone` plugin described in [Building with Claude Code](/#building-with-claude-code) looks for the
package in `node_modules`, and a Go app has none. So its check at the start of each session stays silent, and its
skills read the documentation site's copy, which is built from the `main` branch and can be ahead of the version
you pinned. The skills that match your version are in the copy you made, under `static/cornerstone/skills/`.

## What has been verified

:::info
Checked in a sample app built for this page, not in a real one: Go 1.27.3 on macOS, Cornerstone 0.10.0 from the
npm registry, htmx 2.0.11 and 1.9.12, and templ 0.3. Browser checks ran in Chromium, Firefox and WebKit through
Playwright.

- **Every Go snippet** compiled and passed `go vet` and `gofmt`. The download steps produced the same 1,129 files
  the sample served. The same code with `go 1.21` in `go.mod` built and then returned 404 for the loader.
- **Serving**: every `cs-*` element upgraded and `cs-cloak` came off, with no failed requests and no console
  errors. Go served the JavaScript as `text/javascript`. With `fl.css` loaded, the page's font was Akkurat, and
  `cs-dark` switched the color scheme to dark.
- **Forms**: `required` stopped an empty submit. A full one reached the handler as
  `email=…&topics=marriage&topics=parenting&weekly=on`, and `r.Form["topics"]` held both. With the loader
  blocked, the same form had no values at all.
- **Templates**: every output quoted above came from running `html/template` and templ. In the browser,
  `disabled="false"` left `<cs-button>` disabled.
- **htmx**: a swap added `<cs-badge>`, which the page hadn't loaded, and it upgraded. An `hx-post` form sent every
  value and left out the unticked box. On htmx 2.0.11, an unticked `<cs-checkbox>` was sent as `on` when it was
  the trigger itself and when it came in through `hx-include`. On htmx 1.9.12 it was sent as `on` inside a form
  too.
- **The `:not(:defined)` rule**: swapped-in badges became visible once they upgraded, and a tag with no component
  file stayed hidden, with the console errors quoted above.
- **Caching**: `http.FileServerFS` over `embed.FS` sent no `Last-Modified`, `ETag` or `Cache-Control`. The wrapper's
  header appeared on chunks and nowhere else.
- **jsDelivr**: with the stylesheet and loader from `cdn.jsdelivr.net`, components upgraded with no failed
  requests.

The copy is 13 MB, and all of it goes into the binary; the sample's binary was 23.5 MB. That includes type
declarations, React wrappers and the agent skills, which a browser never asks for.

**Not verified:** a morphing htmx swap, `setIconPath` with your own icons, a Windows build, and a real application.
:::
