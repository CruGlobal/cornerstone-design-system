---
"@cruglobal/cornerstone-components": patch
---

The Frameworks page now answers the question it kept prompting: why this is a web component library rather
than a fork of Radix, shadcn/ui or another React one.

It comes up in most reviews and had no written answer, so it was being re-argued each time. The section makes
the case from the constraint that actually decided it — a button designed once has to land in React, Rails,
WordPress, Salesforce, Angular apps still awaiting migration, and a native mobile app, and no component
library covers that range. A table gives each platform, how Cornerstone reaches it, and how far that actually
goes.

The more useful half is the layering, because "web components instead of React components" was never the
choice: tokens are the layer that reaches everything, components are the web layer, and platform-native
implementations — Cornerstone in JSX the way Radix is built, native WordPress blocks, Compose components —
are a third layer that reads the first. Choosing web components moved a React-native Cornerstone up a layer
rather than foreclosing it. Mobile is the clearest case: MPDX's rebuild in Kotlin Multiplatform against
Material Design 3 will never run a custom element, so a token set is the only foundation that reaches it.

Costs are stated rather than only advantages: the wrappers React 18 and below need, the styling surface Shadow
DOM closes off, the third layer not existing yet, experimental SSR, and a smaller ecosystem. Two limits are
named exactly — third-party web components in Lightning Web Components are Beta, require Lightning Web
Security, and are unsupported by Salesforce; and the token build emits nothing Kotlin-shaped today, so feeding
Material Design 3 from these tokens is still a mapping somebody has to write.

The page's card grid moves to a `::page-index` marker under a new "Integration Guides" heading so the prose
can follow it, which is the same shape `ai/index.md` already uses.

Docs-site only: `frameworks.md` is the section index and is not one of the pages `SKILL_PAGES` compiles into
the shipped agent skill, so nothing in the package's output changes.
