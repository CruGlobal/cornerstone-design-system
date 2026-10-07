# Cornerstone Documentation Site

The Astro/Starlight site that documents Cornerstone, and the source the shipped agent skills compile from. Its
own domain is the Inspiration library: endorsed arrangements of Cornerstone Components, published with the
reasoning behind them.

## Language

### The Inspiration library

**Inspiration library**:
The browsable catalogue of Patterns, Screens and Flows. Prescriptive: every entry is the endorsed Cornerstone
implementation, not one option among several. The component reference documents an API; the Inspiration
library documents a design decision.
_Avoid_: pattern library (names one tier as if it were the whole)

**Entry**:
One Pattern, Screen or Flow in the Inspiration library, carrying its markup and the reasoning that justifies it.

**Tier**:
Which of the three kinds of entry something is: Pattern, Screen or Flow. Each tier composes the one below it.

**Pattern**:
An arrangement of Cornerstone Components and CSS utilities making one piece of interface, published with its
reasoning. Copied, pasted, then owned by the consumer. Adds no behaviour or accessibility contract its pieces do
not already carry; a shape needing either is a component.
_Avoid_: snippet (markup without the reasoning, which is the half that matters)

**Screen**:
A complete viewport built from Patterns: a dashboard, a settings page, a sign-in page. Carries the same
reasoning a Pattern does.
_Avoid_: page (`cs-page` scaffolds a screen; it is not the screen), template (implies filling in rather than
reasoning about)

**State**:
One named variant of a Screen (default, wrong password, account locked), shown on that Screen's own page rather
than as a separate entry.
_Avoid_: variant (already means a component attribute value)

**Flow**:
An ordered journey across more than one Screen: signing in, onboarding, subscribing. Carries the reasoning for
the sequence, never application logic.
_Avoid_: wizard (one implementation of a flow, not the concept)

### Browsing

**Goal**:
What the user is trying to get done on a Screen or Flow, such as Authentication. The category axis for Screens
and Flows.
_Avoid_: category on its own (ambiguous between Goal and Kind), surface (where an entry is used, not what it is
for), role (already an ARIA role and a token role)

**Kind**:
What sort of interface piece a Pattern is, such as Forms or Feedback. The category axis for Patterns. A Kind
that shares a label with a component category shares its meaning.
_Avoid_: category on its own, type, role

**Authentication**:
The Goal of proving who you are: signing in, signing up, recovering access, and confirming with a code.
_Avoid_: sign in (one part of it), account access (blurs with account management)

**Account management**:
The Goal of changing what an app knows about you and how it behaves for you: your profile details, your
preferences. Excludes your sign-in identity, which is Authentication and, where an app signs in through a shared
identity provider, is managed there rather than in the app.
_Avoid_: settings (names a place, not a goal), account on its own (reads as the sign-in identity), personalization
(too narrow for profile details)
