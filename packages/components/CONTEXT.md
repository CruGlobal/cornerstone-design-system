# Cornerstone Components

The custom-element library Cru ships as part of the Cornerstone design system. A hard fork of Web
Awesome, renamed and being taken over deliberately rather than adopted wholesale.

## Language

**Cornerstone**:
The design system as a whole — the umbrella covering both the design tokens and this component library.
Never used in prose to mean this library alone.

**Cornerstone Components**:
This library: the `cs-*` custom elements published as `@cruglobal/cornerstone-components`. The full name
is always used when referring to the library rather than the design system.
_Avoid_: Cornerstone (ambiguous — that is the umbrella), Cru Cornerstone (Cornerstone serves FamilyLife
as well, and the brands are peers)

**Web Awesome**:
The upstream project this library was forked from, MIT-licensed and copyright Fonticons, Inc. Named only
where the statement is true of upstream — attribution, provenance, the fork point.
_Avoid_: Shoelace (its predecessor, a different project), Font Awesome (the company behind Web Awesome,
which did not build Cornerstone Components)

**Fork point**:
The upstream commit this library diverged from, recorded in `NOTICE`. Fixed — upstream is severed, so the
fork point never advances.

**Ministry**:
The top level of the brand hierarchy: Cru or FamilyLife. A ministry owns sub-brands, and Cornerstone expects
more ministries over time rather than exactly two.
_Avoid_: brand (ambiguous — brands exist at both levels), tenant

**Sub-brand**:
A brand belonging to a ministry: a product or an event with its own visual identity. *Weekend to Remember* is a
FamilyLife event with its own sub-brand; Cru supports several products with theirs. A sub-brand carries its own
colours **and its own typography**, so it needs both a palette and a theme — not a palette alone.
_Avoid_: brand on its own where the level matters

**Brand**:
Either level, used only where the statement is true of both. Cru's theme is the **default**, loading absent an
explicit choice — so brands are not peers in the code, whatever they are in the organisation. No brand name
belongs in the product name or in a component's source.
_Avoid_: theme (a theme is the CSS artifact carrying a brand's typography and feel, not the brand),
brand colour (that is one value a brand's palette supplies, not the brand)

**Palette**:
A brand's colour values: ten or so hue ramps of eleven steps each, plus the mapping of which hue plays each
semantic role. Selected by `.cs-palette-*`, and the axis a sub-brand varies. Distinct from a theme, which is
hue-agnostic — the theme layer references a semantic role a hundred times and a raw hue once.
_Avoid_: theme (the two are separate axes precisely so a sub-brand can change colour without changing type)

**Feel**:
The dimensions that are neither brand nor colour: spacing as compact against comfortable, corner radius as soft
against sharp. Orthogonal to identity — any sub-brand can want either — and expressed as an input to the
palette generator rather than as a runtime axis, so the combinatorics stay out of shipped CSS.
_Avoid_: density (covers spacing only), theme variant

**Brand colour**:
The hue that best represents a brand, and the value behind `variant="brand"`. Distinct from a main action
colour: on FamilyLife the brand colour is a green that collides with `success`, so the two roles have to be
free to differ. Named `brand` on the variant axis for exactly that reason — `primary` stays available for
the action colour.
_Avoid_: primary (reserved for the action colour, which is only sometimes the same hue)

**Cross-cutting policy**:
A decision settled once and swept across all 70 components — the unit of work in this takeover. Contrast
with the bespoke pass, which handles the components a swept policy fails to fit.

**Agent files**:
The machine-readable documentation the package ships for AI tools: the Agent Skills under `dist/skills/`
and `dist/llms.txt`. Named as a set because they share one source and one audience — Cru staff building
products with AI tools — and because they are the only documentation the published package contains.
_Avoid_: docs (the documentation site is a separate surface, and it is not published)

**Unbundled build**:
The build that keeps its dependencies as bare specifiers, so a consumer needs a bundler to resolve
them. Ships at `dist/unbundled/`, and is what the package's own import specifiers point at.
_Avoid_: dist (that is the container holding both builds, not one of them)

**Bundled build**:
The build with its dependencies inlined, so a browser loads it without a bundler or an import map.
Ships at `dist/bundled/`, reached through the `bundled/` import specifier.
_Avoid_: CDN build (a CDN is one way to fetch it, not a property of the artifact)

**Bespoke pass**:
The second pass over components whose API, parts, accessibility or docs resist a cross-cutting policy.
Its contents are only knowable after the policies exist and have been swept.
