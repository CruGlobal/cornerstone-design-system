---
"@cruglobal/cornerstone-components": patch
---

The Frameworks page now explains why Cornerstone is a web component library, in a "Why Web Components?"
section beneath the integration guides.

It opens on what a custom element buys — it is an HTML element, so anything that renders HTML can render one
without an adapter or a per-framework port — then gives the six places a Cru design decision has to land, how
Cornerstone reaches each, and how far that actually goes today. React is shipped; Rails and WordPress are in
testing; Salesforce controls CSS tightly enough that brand standards are applied there rather than tokens
ingested; Angular is unsupported and themed through the app's own CSS; native mobile is tokens only.

The layering is the substantive part, because "web components instead of React components" was never the
choice: tokens reach everything, components are the web layer, and platform-native implementations —
Cornerstone in JSX the way Radix is built, native WordPress blocks, Compose components — are a third layer
reading the first. Choosing web components moved a React-native Cornerstone up a layer rather than foreclosing
it. Mobile is the clearest case: MPDX's rebuild in Kotlin Multiplatform against Material Design 3 will never
run a custom element, and while Material Design does accept a fully custom `ColorScheme`, nothing emits one
from these tokens yet.

Trade-offs are named with what each bought. The styling surface is narrower than a React library's, and what
that buys is a fixed set of surfaces to design against — fewer decisions per component, more consistency, and
a guardrail on an agent that would otherwise improvise a design. It is a dependency rather than source you
own, and the escape hatch is self-hosting and extending rather than forking.

The API principles the library was specified against are named on the page — the prefix, the `variant` and
`appearance` axes, slotted content, the paired cancelable events, the deliberately small `::part()` surface,
CSS-custom-property theming, form association and asserted accessibility — followed by how Web Awesome already
met each one, which is what made the fork mechanical rather than a rewrite.

The Rails and WordPress sidebar badges change from "Tested" to "Testing", which is where both actually stand.
Their in-page "Verified on Rails 8.1" and "Verified on WordPress 7.1" badges are left alone: those are
narrower claims about snippets that were genuinely run, and each page documents what that covered.

The page's card grid moves to a `::page-index` marker under a new "Integration Guides" heading so the prose
can follow it, which is the same shape `ai/index.md` already uses.

`frameworks.md` itself is the section index and is not compiled into the shipped agent skill, but
`frameworks/rails.md` and `frameworks/wordpress.md` are, so the badge correction does reach the skill's
copies of those two pages.
