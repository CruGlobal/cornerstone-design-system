---
title: Patterns
description: Copy-and-paste compositions of Cornerstone components for whole pieces of interface. In design now.
sidebar:
  badge:
    text: Soon
    variant: note
---

:::new
**Patterns are in design.** Nothing here is available yet. This page describes what we intend to ship, so
that the shape of it can be argued with before any of it is written.
:::

## What a pattern will be

A pattern is a **chunk of interface**, not a component. Where `<cs-card>` gives you one card, a pattern gives
you the whole pricing table it sits in — the cards, the grid holding them, the badge on the recommended tier,
the spacing between everything — as markup you can copy into your project and edit.

Each one will be plain HTML built from the pieces already documented here: [components](/components),
[CSS utilities](/utilities), and the [design tokens](/tokens) your theme supplies. Nothing to install beyond
Cornerstone itself, and nothing to unpick if you want to change it. Paste it, then treat it as your markup.

## What a pattern will not be

**Not a component.** Patterns are not shipped in the package and have no API, no attributes and no shadow DOM.
They are a starting point you own, which is the point — a pattern you have edited beyond recognition has done
its job.

**Not application logic.** A sign-in pattern will lay out the form; it will not authenticate anyone. Data
fetching, validation rules, routing and state stay yours.

**Not a substitute for a component.** If something is a genuinely reusable control, it belongs in the library,
not in a snippet. When a pattern keeps getting pasted unchanged, that is a signal we should build the
component instead — so [tell us](/resources/support) when it happens.

## What we are planning

Patterns worth having are the arrangements Cru teams build repeatedly. The shape of the catalogue is still
open, and these are the areas we expect to cover first rather than a finished list:

- **Page layouts** — the scaffolding around content: a documentation shell, a dashboard, a settings page.
- **Forms** — sign-in, multi-step flows, and the review-before-submit step, laid out and labelled correctly.
- **Content** — article headers, FAQs, empty states, and the small arrangements that carry a page's meaning.
- **Marketing** — hero sections, feature grids, pricing, and calls to action.

Each will be **responsive and accessible as given**, so a pattern is a reasonable place to start rather than
something to audit afterwards. That is the standard the [accessibility](/resources/accessibility) page sets for
the library, and a pattern that does not meet it is not ready.

## Why not yet

Patterns are compositions, so they are only as stable as what they compose. The component APIs, the
[appearance and variant vocabulary](/components), and the theming layer have all moved recently. Publishing
fifty snippets against a moving target would mean fifty things to correct with every change — so patterns come
after that settles, and they arrive already correct.
