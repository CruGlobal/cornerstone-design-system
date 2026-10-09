# Cornerstone Documentation Site

The Astro/Starlight site that documents Cornerstone, and the source the shipped agent skills compile from. Its
own domain is the Inspiration library: endorsed arrangements of Cornerstone Components, published with the
reasoning behind them.

## Language

### The Inspiration library

**Inspiration library**:
The browsable catalogue of Patterns, Screens and Flows. Prescriptive: every Inspiration entry is the endorsed
Cornerstone implementation, not one option among several. The component reference documents an API; the
Inspiration library documents a design decision.
_Avoid_: pattern library (names one tier as if it were the whole)

**Inspiration entry**:
One Pattern, Screen or Flow in the Inspiration library, published with the reasoning that justifies it.
Patterns and Screens also carry markup; a Flow carries only its sequence.
_Avoid_: entry on its own (already means a sidebar, roadmap or changelog entry)

**Tier**:
Which of the three levels an Inspiration entry sits at: Pattern, Screen or Flow. Each tier composes the one
below it.

**Pattern**:
An arrangement of Cornerstone Components and CSS utilities making one piece of interface, published with its
reasoning and owned by the consumer once copied. It adds no behaviour or accessibility contract beyond what its
pieces already carry, which is what separates it from a component.
_Avoid_: snippet (markup without the reasoning, which is the half that matters)

**Screen**:
A complete viewport built from Patterns: a dashboard, a settings overview, a profile form. Carries the same
reasoning a Pattern does.
_Avoid_: page (`cs-page` scaffolds a screen; it is not the screen), template (implies filling in rather than
reasoning about)

**State**:
One named condition of a Screen (default, fix these fields, couldn't save), shown on that Screen's own page
rather than as a separate Inspiration entry. A step in a Flow may point at a State as well as at a Screen.
_Avoid_: variant (already means a component attribute value)

**Flow**:
An ordered journey across more than one Screen: signing in, onboarding, subscribing. Carries the reasoning for
the sequence, never application logic.
_Avoid_: wizard (one implementation of a flow, not the concept)

### Browsing

**Goal**:
What the user is trying to get done on a Screen or Flow, such as Account management. The category axis for
Screens and Flows, written in their `category` field.
_Avoid_: category on its own in prose (ambiguous between Goal and Kind), surface (where an Inspiration entry is
used, not what it is for), role (already an ARIA role and a semantic role)

**Kind**:
What sort of interface piece a Pattern is, such as Forms or Feedback. The category axis for Patterns, written in
their `category` field. A Kind that shares a label with a component category shares its meaning.
_Avoid_: category on its own in prose, type, role

**Account management**:
The Goal of changing what an app knows about you and how it behaves for you: your profile details, your
preferences. Excludes your sign-in identity.
_Avoid_: settings (names the place in an app, not the goal), account on its own (reads as the sign-in identity)
