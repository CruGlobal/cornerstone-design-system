---
title: Frameworks
description: Using Cornerstone with frameworks.
synonyms:
  - integrations
  - libraries
  - stacks
use-cases:
  - react
  - rails
  - wordpress
  - php
  - stimulus
pageIndex: frameworks
---

Cornerstone is built on standard web components, so it works with any framework. These guides cover setup and
known limitations for the stacks Cru actually builds on.

Nothing here is a prerequisite. A custom element is an HTML element, so a page that loads the library can use
`cs-*` tags with no integration code at all — these guides exist for the places where a framework or an asset
pipeline gets in the way.

## Integration Guides

::page-index

## Why Web Components?

A custom element is an HTML element. It carries its own behavior, accessibility and styling with it, and
anything that renders HTML can render one — no adapter, no port, no per-framework rewrite. That is the whole
reason Cornerstone is built this way: a design decision made once has to survive contact with every place Cru
ships, and those places do not share a framework.

| Platform | How Cornerstone reaches it | Where that stands |
| --- | --- | --- |
| React | Custom elements natively on 19, generated wrappers on 18 and below | Shipped |
| Rails | Custom elements through the asset pipeline | Testing |
| WordPress | Custom elements in a theme or a plugin | Testing |
| Salesforce | Lightning Web Components is itself a custom-elements framework; third-party elements mount with `lwc:external`, which is Beta and requires Lightning Web Security | Salesforce controls CSS tightly, so brand standards are applied here rather than tokens ingested |
| Angular | Sets properties and hears native events already; needs `CUSTOM_ELEMENTS_SCHEMA` on the modules using `cs-*` | Unsupported. Themes go straight into the app's own CSS; importing a theme file is worth a try where it fits |
| Native mobile | Tokens only — no custom element runs here | MPDX is being rebuilt in Kotlin Multiplatform against Material Design 3 |

The Angular row isn't aspiration. Those are applications that haven't been migrated to a preferred stack yet,
and "not yet migrated" is a state a design system has to serve rather than wait out.

It is also the answer to the question that comes up in most reviews — why not fork Radix, shadcn/ui or another
React library. They are better than this library at the job they were built for, and they cover the first row
of that table. Forking one would have made the React implementation *the system*, and left every other row
with a stylesheet, a screenshot, and instructions to rebuild the behavior.

### Three layers

"Web components instead of React components" was never the choice that got made. The system is layered, and
only the middle layer is custom elements.

1. **Tokens.** [`@cruglobal/cornerstone-design-system`](/tokens) reaches everything. One
   [DTCG](https://tr.designtokens.org) source emits CSS, SCSS, ESM, CJS, TypeScript declarations and JSON, so
   a platform that can't run a custom element can still be *correct* — brand standards on Salesforce, an
   Angular app that only needs the colors, a component-less implementation anywhere.
2. **Components.** [`@cruglobal/cornerstone-components`](/components) is the web layer, for the applications
   that can run custom elements. Most of Cru's can, which is why it's where the effort has gone.
3. **Platform-native implementations.** Not built, and a direction rather than a promise. Where a platform
   earns one, the answer is an implementation *in* that platform reading layer 1: Cornerstone written from
   scratch in JSX the way Radix is, native WordPress blocks, Compose components for mobile.

Read those back and the Radix question mostly answers itself. Choosing web components didn't foreclose a
React-native Cornerstone — it moved it up a layer, where it can serve React without costing the other rows
anything. Forking Radix inverts the stack: the React implementation becomes the source of truth, and tokens
become an export from it.

### Mobile

MPDX's mobile app is being rebuilt in Kotlin Multiplatform against Material Design 3. No custom element will
ever run in it, and no amount of framework-agnosticism in the component layer changes that.

It is the clearest case for the layering. A design system whose source of truth is a component library can
only hand mobile a specification to copy. One whose source of truth is a token set can hand it values.

Material Design 3 does take a fully custom palette: a Compose `ColorScheme` can be written with every role
stated rather than derived from a seed color, which is the shape Material Theme Builder exports. So the
generated route is open — emit that `ColorScheme` from the same tokens the web reads. None of it exists yet,
though. The token build emits nothing Kotlin-shaped, and Cornerstone's role model deliberately doesn't use
Material's `primary` / `on-primary` / `container` vocabulary, so the mapping is still work somebody has to do.

### Theming

Cornerstone dresses two brands — Cru and FamilyLife — each in light and dark, with no JavaScript theming layer
at all. A theme is a class: `.cs-theme-cru` picks the brand, `.cs-light` and `.cs-dark` pick the scheme, and
because classes cascade a dark page can hold a light section. [Theming Overview](/theming-overview) covers it.

React libraries theme through a provider: a context object near the root of the tree, read by hooks inside
each component. It works well inside React and stops dead at the boundary — a Rails layout, a Lightning page
and a WordPress template have no React root to hang a provider on. Custom properties inherit down the DOM,
including through shadow boundaries, so a class on `<html>` re-themes the page no matter what rendered it.

### React support

React 19 [supports custom elements natively](https://react.dev/blog/2024/04/25/react-19#support-for-custom-elements),
so there it costs nothing. React 18 and below [handle them poorly](https://custom-elements-everywhere.com/#react) —
attributes get set where properties are meant, and custom events never reach `on*` props — so the build
generates a wrapper for all 70 components. They are typed and they regenerate with every build, but they are
a layer a Radix fork would not have needed. See [React](/frameworks/react) for what using them looks like.

### Trade-offs

Every one of these is a cost, and every one was accepted for something.

- **Styling goes through a defined surface rather than reaching in.** Shadow DOM means CSS custom properties
  and `::part()`, not passing `className` down to arbitrary internal nodes, and that surface is deliberately
  kept small — see [when to use a custom property vs. a part](/resources/contributing#when-to-use-a-css-custom-property-vs-a-css-part).
  What it buys is a fixed set of surfaces to make design decisions against: fewer decisions per component is
  more consistency across experiences, and it is a useful guardrail on an AI agent that would otherwise
  improvise a design where it should be applying one. Radix's unstyled-primitive model is the better tool when
  full control of the markup is the goal.
- **It's a dependency rather than source you own.** shadcn/ui copies components into your repository, where
  you edit them freely. Cornerstone is a package you upgrade, which is faster to adopt and to fix centrally.
  The escape hatch is self-hosting rather than a fork: a team that needs to can host Cornerstone itself and
  extend it.
- **Nothing in layer 3 exists yet.** A React codebase gets a wrapper around a custom element rather than an
  idiomatic React component, and nobody has committed to building the JSX one.
- **Server rendering is experimental.** [SSR](/ssr) reduces layout shift, but Lit's SSR package is itself
  experimental and progressive enhancement is explicitly not a goal.
- **The ecosystem is smaller.** No third-party components built on top, and no library of existing answers
  when something goes wrong.

### Why Web Awesome

Choosing web components still left the question of whether to write seventy of them. Cornerstone is a fork of
[Web Awesome](https://webawesome.com), the library that grew out of Shoelace, which had already done the
accessibility work, the form-association work and the SSR groundwork on top of [Lit](https://lit.dev). Forking
it meant starting from a library that already met the requirements instead of spending a year rediscovering
them. What the fork changed is the token layer, the `cs-` prefix, the variant axes, and the theming.

The principles the library is held to — the prefix, the `variant` and `appearance` axes, the event names, the
deliberately minimal `::part()` surface, the rule that ARIA politeness is a timing concern rather than a
variant one — were argued out in
[#59](https://github.com/CruGlobal/cornerstone-design-system/pull/59) before the first component shipped. It
closed unmerged, because forking Web Awesome answered the question the document had been specifying, but it
remains where the considerations are written down. The [changelog](/resources/changelog) records what has
changed since.
