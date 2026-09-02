---
"@cruglobal/cornerstone-components": patch
---

The Frameworks page now answers the question it kept prompting: why this is a web component library rather
than a fork of Radix, shadcn/ui or another React one.

It comes up in most reviews and had no written answer, so it was being re-argued each time. The section makes
the case from the constraint that actually decided it — Cru builds on React, Rails and WordPress, and a React
element cannot be rendered by an ERB template or a WordPress block — then states the costs rather than only
the advantages: the generated wrappers React 18 and below need, the styling surface Shadow DOM closes off,
experimental SSR, and a smaller ecosystem. It closes by saying when to reach for Radix instead.

The page's card grid moves to a `::page-index` marker under a new "Integration Guides" heading so the prose
can follow it, which is the same shape `ai/index.md` already uses.

Docs-site only: `frameworks.md` is the section index and is not one of the pages `SKILL_PAGES` compiles into
the shipped agent skill, so nothing in the package's output changes.
