---
"@cruglobal/cornerstone-components": patch
---

Added: The Frameworks page explains why Cornerstone is built on web components, in a new "Why Web Components?" section.

- A table of the six platforms a Cru design decision has to land in, and how far Cornerstone reaches each: React shipped, Rails and WordPress testing, Salesforce brand-standards-only, Angular unsupported, native mobile tokens-only
- The three layers — tokens reach everything, components are the web layer, platform-native implementations are a possible third
- Trade-offs named with what each one bought, and the principles the library was specified against
- Rails and WordPress sidebar badges corrected from "Tested" to "Testing"

`frameworks.md` is not compiled into the shipped agent skill, but `frameworks/rails.md` and `frameworks/wordpress.md` are, so the badge change reaches it.
