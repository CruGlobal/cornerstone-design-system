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
one of them because of what Cru has to ship on, not because of anything wrong with them.

### Cru isn't a React shop — it's three shops

Cru builds on React, on Rails, and on WordPress. Different teams maintain each one, and all three need the
same button.

Every React component library resolves to React elements: Radix Primitives, Radix Themes, shadcn/ui and MUI
are React-only, and Headless UI adds Vue but stops there. A React element cannot be rendered by an ERB
template or a WordPress block. Forking one of them would have produced a design system that serves a third of
the estate properly and hands the rest a stylesheet, a screenshot, and instructions to rebuild the behavior
themselves — three implementations of the same date picker, drifting apart from the week they shipped.

A custom element is an HTML element. `<cs-button>` in a `.tsx` file, an `.erb` template, and a PHP theme is
the same element, running the same code, with the same accessibility work behind it. That is the whole
argument, and at Cru it outweighs everything on the other side of the ledger.

### Theming has to cross a boundary React can't

Cornerstone dresses two brands — Cru and FamilyLife — each in light and dark. That runs on CSS custom
properties scoped to `[data-brand][data-theme]`, with no JavaScript theming layer at all.

React libraries theme through a provider: a context object near the root of the tree, read by hooks inside
each component. It works well inside React and stops dead at the boundary — a Rails layout has no React root
to hang a provider on. Custom properties inherit down the DOM, including through shadow boundaries, so
setting two attributes on `<html>` re-themes the page no matter what rendered it. [Customizing &
Theming](/customizing) covers the mechanics.

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
- **It's a dependency, not source you own.** shadcn/ui copies components into your repository, where you edit
  them freely. Cornerstone is a package you upgrade: faster to adopt and to fix centrally, harder to bend
  when a design doesn't quite fit.
- **Server rendering is experimental.** [SSR](/ssr) reduces layout shift, but Lit's SSR package is itself
  experimental and progressive enhancement is explicitly not a goal. Radix on Next.js is a far better-trodden
  path.
- **The ecosystem is smaller.** No third-party components built on top, no library of Stack Overflow answers,
  and a much shorter list of people who have hit your bug before.

### When to use something else

If you're building a React-only product that nothing else will ever render, and you want total control of the
markup, Radix or shadcn/ui is the better tool and nobody here will argue otherwise. Cornerstone earns its keep
when a design decision has to land in more than one stack at once — which, at Cru, is most of them.

### Why Web Awesome, then

Choosing web components still left the question of whether to write seventy of them. Cornerstone is a fork of
[Web Awesome](https://webawesome.com), the library that grew out of Shoelace, which had already done the
accessibility work, the form-association work and the SSR groundwork on top of [Lit](https://lit.dev). Forking
it meant starting from a library that already met the requirements instead of spending a year rediscovering
them. What the fork changed is the token layer, the `cs-` prefix, the variant axes, and the theming — the
[changelog](/resources/changelog) records the rest.
