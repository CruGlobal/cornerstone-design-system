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

## Why not Radix, or another React library?

This comes up in most reviews, and it deserves a real answer rather than a preference. Radix Primitives,
shadcn/ui and MUI are all better than this library at the job they were built for. Cornerstone isn't a fork of
one of them because of the range of places a Cru design decision has to land, not because of anything wrong
with them.

### Cru doesn't have a stack — it has an estate

A button designed once has to end up in all of this:

| Platform | How Cornerstone reaches it | Where that stands |
| --- | --- | --- |
| React | Custom elements natively on 19, generated wrappers on 18 and below | [Shipped](/frameworks/react) |
| Rails | Custom elements through the asset pipeline | [Shipped](/frameworks/rails) |
| WordPress | Custom elements in a theme or a plugin | [Shipped](/frameworks/wordpress) |
| Salesforce | Lightning Web Components is itself a custom-elements framework | Third-party elements mount with `lwc:external`, but that is Beta, requires Lightning Web Security, and Salesforce does not support it — tokens are the safe path today |
| Angular | Sets properties and hears native events already; needs `CUSTOM_ELEMENTS_SCHEMA` on the modules using `cs-*` | Works, no guide written |
| Native mobile | Tokens only — no custom element runs here | MPDX mobile is being rebuilt in Kotlin Multiplatform against Material Design 3 |

The Angular row isn't aspiration. Those are applications that haven't been migrated to a preferred stack yet,
and "not yet migrated" is a state a design system has to serve rather than wait out.

No component library covers that table. Radix covers the first row. Forking it would have made the React
implementation *the system* and left every other row with a stylesheet, a screenshot, and instructions to
rebuild the behavior — a reimplementation per platform, drifting apart from the week each one shipped.

### The system is layered, and only the middle layer is web components

This is the part that usually settles the argument, because "web components instead of React components" isn't
the choice that was actually made.

1. **Tokens.** [`@cruglobal/cornerstone-design-system`](/tokens) is the layer that reaches everything. One
   [DTCG](https://tr.designtokens.org) source emits CSS, SCSS, ESM, CJS, TypeScript declarations and JSON, so
   a platform that can't run a custom element can still be *correct* — theme overrides on Salesforce, an
   Angular app that only needs the colors, a component-less implementation anywhere.
2. **Components.** [`@cruglobal/cornerstone-components`](/components) is the web layer, for applications that
   can run custom elements. Most of Cru's can, which is why it's where the effort has gone.
3. **Platform-native implementations.** Not built, and named here as a direction rather than a promise. Where
   a platform earns one, the answer is an implementation *in* that platform reading layer 1: Cornerstone
   written from scratch in JSX the way Radix is, native WordPress blocks, Compose components for mobile.

Read those back and the Radix question largely answers itself. Choosing web components didn't foreclose a
React-native Cornerstone — it moved it up a layer, where it can serve React without costing the other rows
anything. Forking Radix inverts the stack: the React implementation becomes the source of truth, and tokens
become an export from it.

### Mobile is the reason the foundation is tokens

MPDX's mobile app is being rebuilt in Kotlin Multiplatform against Material Design 3. No custom element will
ever run in it, and no amount of framework-agnosticism in the component layer changes that.

It's the clearest case for the layering. A design system whose source of truth is a component library can only
hand mobile a specification to copy. One whose source of truth is a token set can hand it values, and what's
left is a mapping rather than a reimplementation of intent.

Being straight about the gap: the token build emits nothing Kotlin-shaped today, and Cornerstone's role model
deliberately doesn't use Material's `primary` / `on-primary` / `container` vocabulary. Feeding Material Design
3 from these tokens is a mapping somebody still has to write.

### Theming has to cross a boundary React can't

Cornerstone dresses two brands — Cru and FamilyLife — each in light and dark. That runs on CSS custom
properties scoped to `[data-brand][data-theme]`, with no JavaScript theming layer at all.

React libraries theme through a provider: a context object near the root of the tree, read by hooks inside
each component. It works well inside React and stops dead at the boundary — a Rails layout, a Lightning page
and a WordPress template have no React root to hang a provider on. Custom properties inherit down the DOM,
including through shadow boundaries, so setting two attributes on `<html>` re-themes the page no matter what
rendered it. [Customizing & Theming](/customizing) covers the mechanics.

### The React tax, stated plainly

The choice isn't free, and React consumers pay most of the bill.

React 19 [supports custom elements natively](https://react.dev/blog/2024/04/25/react-19#support-for-custom-elements),
so there it costs nothing. React 18 and below [handle them poorly](https://custom-elements-everywhere.com/#react) —
attributes get set where properties are meant, and custom events never reach `on*` props — so the build
generates a wrapper for all 70 components. They are typed, they regenerate with every build, and they are
still a layer a Radix fork would not have needed. See [React](/frameworks/react) for what using them looks
like.

### What you give up

A rationale that lists only advantages isn't one. These are the real costs:

- **You style through a defined surface rather than reaching in.** Shadow DOM means CSS custom properties and
  `::part()`, not passing `className` down to arbitrary internal nodes, and that surface is deliberately kept
  small — see [when to use a custom property vs. a part](/resources/contributing#when-to-use-a-css-custom-property-vs-a-css-part).
  If your instinct is to restyle a component's innards with utility classes, that instinct does not transfer.
  Radix's unstyled-primitive model is genuinely better when full control of the markup is what you want.
- **Nothing in layer 3 exists yet.** A React codebase gets a wrapper around a custom element, not an idiomatic
  React component. That is a real ergonomic difference, and the honest answer to "when do we get the JSX one"
  is that nobody has committed to it.
- **It's a dependency, not source you own.** shadcn/ui copies components into your repository, where you edit
  them freely. Cornerstone is a package you upgrade: faster to adopt and to fix centrally, harder to bend when
  a design doesn't quite fit.
- **Server rendering is experimental.** [SSR](/ssr) reduces layout shift, but Lit's SSR package is itself
  experimental and progressive enhancement is explicitly not a goal. Radix on Next.js is a far better-trodden
  path.
- **The ecosystem is smaller.** No third-party components built on top, no library of Stack Overflow answers,
  and a much shorter list of people who have hit your bug before.

### When to use something else

If you're building a React-only product that nothing else will ever render, and you want total control of the
markup, Radix or shadcn/ui is the better tool and nobody here will argue otherwise. Cornerstone earns its keep
when a design decision has to land in more than one row of that table at once — which, at Cru, is most of
them.

### Why Web Awesome, then

Choosing web components still left the question of whether to write seventy of them. Cornerstone is a fork of
[Web Awesome](https://webawesome.com), the library that grew out of Shoelace, which had already done the
accessibility work, the form-association work and the SSR groundwork on top of [Lit](https://lit.dev). Forking
it meant starting from a library that already met the requirements instead of spending a year rediscovering
them. What the fork changed is the token layer, the `cs-` prefix, the variant axes, and the theming — the
[changelog](/resources/changelog) records the rest.
