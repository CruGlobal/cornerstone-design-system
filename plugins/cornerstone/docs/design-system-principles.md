# Design System Principles

Grounding reference for Daniel and the specialist personas: what actually makes a design system work, as opposed to just existing, and what "good" specifically means for Cornerstone. Written as direct working knowledge, not a set of links to go fetch.

## A design system is more than a component library

A component library is a set of reusable UI pieces. A design system is broader — an evolving, shared set of practices spanning color, typography, process, accessibility, tooling, and voice, plus the people who actually use and contribute to it. A design system with polished components but no adoption, no contribution path, and no guidance on *how, when, and when not* to use something isn't succeeding, no matter how complete its component gallery looks.

For Cornerstone specifically: the `_ref` → `_sys` → `_cmp` token architecture is necessary but not sufficient. Guidance on *when* to reach for a `_cmp` alias versus a `_sys` token directly, *why* a brand's dark theme diverges from its light theme, and *how* a consuming team should extend the system without forking it, all matter as much as the token values themselves.

Three benefits worth defending when someone asks why not just hand-roll a value: **consistency** (one look and feel across every consuming surface), **reusability** (a solved problem stays solved), and **a common language** (a shared vocabulary that lets contributors and consumers talk about UI without re-deriving it every time).

## Governance and scale: what a system actually requires

There's a useful ladder of maturity: a **style guide** covers brand and voice standards; a **component library** adds named, reusable UI pieces with their states and code; a **pattern library** groups those into reusable layouts and content structures; a full **design system** is all of that plus the standards and governance to manage design at scale, across however many products and teams actually consume it. Cornerstone today is closest to a token-driven style guide plus component library — the persona effort (Joseph, Sarah, Esther, Anna) is the deliberate move toward the governance half of that ladder, not just more artifacts.

Building a system this way is also a real, ongoing cost, not a one-time project: it needs continued maintenance and training investment to stay worth using, and it only pays off for an organization committed to years of reuse — not for a one-off effort. Cornerstone chose the highest-investment path on offer (a proprietary system, hand-authored and Figma-synced) rather than adopting or adapting an existing one; that choice only makes sense if the reuse actually keeps happening, which is the whole justification for building out the personas rather than leaving the tokens to maintain themselves.

One framing worth keeping in mind when deciding whether to keep or prune something: a design system isn't a portfolio of past work, it's an operating toolkit. A token or component that no longer serves any current product is a liability to clean up, not a trophy to preserve for its own sake.

## Ship the system, not just the feature

Three principles are worth holding, each one weighing what's tempting to ship first against what actually earns trust over time:

- **Trusted fundamentals before comprehensive patterns.** Solve the common foundational problems first — opinionated primitives, verified against accessibility, responsiveness, and scale — so teams building on top can focus on the actual experience instead of re-solving what the system should have already handled. Cornerstone's own `_ref`/`_sys` layers are exactly this bet: get the primitives right once, so Joseph's component work and a consumer's own product work don't have to re-derive them independently.
- **Meet system needs before delivering individual features.** Documentation, support, tooling, and maintenance are part of the system, not chores that happen after the "real" work ships. A `_cmp` alias that ships without anyone knowing when to reach for it isn't actually finished, even if the code behind it is.
- **Bring people on the journey before helping for the moment.** The point of answering a request isn't just to resolve what was asked — it's to leave whoever asked more able to make the next call themselves. Daniel's own stance (guide integration rather than do it for someone, explain a refusal rather than just enforce it) already lives here.

## Think in systems, not pages

A hierarchy worth holding in mind — atoms (the smallest functional pieces, like a label or an input), molecules (small groups of atoms working as one unit, like a labeled search field), organisms (larger, distinct sections built from molecules and atoms, like a header), templates (layout skeletons that show how organisms compose, without real content), and pages (templates filled with real content) — is a mental model for zooming between the smallest reusable piece and the whole interface, not a five-step production line to march through in order. Think top-down (what does this page need) and bottom-up (what already exists to build it from) at the same time.

Two things worth carrying into Cornerstone's own work, even though its token layers (`_ref`/`_sys`/`_cmp`) aren't a one-to-one match for atoms/molecules/organisms:

- **Content breaks templates before code does.** A layout that only works for one headline length, one permission level, or a non-empty list isn't done — real content variability is part of the design problem, not an edge case to patch later.
- **Taxonomy should serve the team, not tradition.** This hierarchy isn't sacred, and naming it this way isn't necessary either — some teams rename it entirely to fit how they already talk. Cornerstone's `_ref`/`_sys`/`_cmp` vocabulary only has to be consistently understood inside Cornerstone; it doesn't need to match any other system's terms.

## Shared language over shared library: functional vs. perceptual patterns

There's a distinction worth using as a lens, not a new rule: **functional patterns** describe what a piece of UI *does* (a button, a form field, a nav) — **perceptual patterns** describe how the whole product *feels* (color, type, iconography, motion). Conflating the two causes drift — naming or structuring something after how it currently looks, rather than what it does, means the name stops making sense the moment the look changes.

Applied to Cornerstone: `_ref` and `_sys` skew perceptual (a brand's look-and-feel primitives and their semantic roles), `_cmp` skews functional (what a specific component actually needs). When it's genuinely ambiguous whether something belongs at `_sys` or `_cmp` — beyond what the validated aliasing rules already settle mechanically — "is this describing what a component does, or what the brand looks like" is a useful second question to ask.

Two more points worth keeping in mind:
- A design system's distinguishing value isn't novel patterns, it's disciplined, consistent execution of the patterns it already has.
- A shared vocabulary only stays alive through daily use in conversation, reviews, and naming — not by existing once on a glossary page.

## Accessibility is structural, not a pass at the end

Reach for the native HTML element (`<button>`, a real checkbox, a real radio) before reaching for ARIA. ARIA is a progressive enhancement, layered on only where native HTML genuinely lacks the needed semantics (e.g. a pressed/toggled state) — not a way to reconstruct a native control's behavior from scratch. Screen readers do react to DOM and JavaScript changes; "screen readers don't understand JavaScript" is a myth worth actively unlearning, not a safe assumption to design around.

A few concrete rules of thumb worth applying directly, not just at review time but while a component is first being built:
- Never change a control's label and its state signal in the same moment — a user can't tell which one actually changed.
- Never rely on color alone to convey state or meaning.
- Keep visual conventions intact — a button should look like a button; don't trade recognizability for novelty.

This is the same judgment Esther applies by hand today (no deterministic accessibility check exists yet — see UIUX-96), but it's worth carrying as a baseline from the very first "how do I build this" conversation, not deferred to a later review pass.

## Interaction and perception

Roughly thirty findings from psychology and HCI research describe how people actually perceive and use interfaces. All thirty are working knowledge here, not just a curated few — some decide a token or component call directly; others matter most when advising a consumer team on the product they're building *with* Cornerstone's pieces, which is just as much a part of the job.

### How people perceive groups of things

- **Law of Proximity** — elements placed near each other get read as related, independent of anything else about them. Direct input into spacing tokens: a spacing scale exists so "related" and "unrelated" stay distinguishable by scale alone, not by guesswork.
- **Law of Common Region** — elements sharing a clearly bounded area (a card, a panel) get read as a group before their content is even parsed. Relevant when deciding whether a component needs a visible boundary (a border or background `_cmp` token) or can rely on spacing alone.
- **Law of Similarity** — visually similar elements get read as one group even when they're physically separated. The reason consistent `_sys`-level type and color choices matter beyond any single component: it's what lets someone recognize "these are all buttons" across an entire page.
- **Law of Uniform Connectedness** — elements joined by a visible connector (a line, a shared fill) get read as more related than elements that merely look alike. The stronger tool to reach for when similarity alone isn't creating enough grouping.
- **Law of Prägnanz** — people resolve an ambiguous or complex shape into the simplest interpretation available to them. A caution against novel iconography or an unconventional component silhouette: if the simplest reading of a shape isn't the meaning it's supposed to carry, the shape has already lost.

### How people remember and pay attention

- **Chunking** — breaking information into grouped, meaningful units makes it easier to hold in mind than the same information flat. The reason a long settings form or a large token namespace benefits from real sections, not one undifferentiated list.
- **Miller's Law** — working memory reliably holds only about seven items, plus or minus two. A soft ceiling worth knowing when deciding how many visible options a menu, tab set, or nav can expose before it needs a different pattern (search, grouping, pagination) instead.
- **Working Memory** — the limited cognitive system that holds and manipulates information for whatever task is immediately at hand. The underlying resource Miller's Law and Chunking are both actually about — genuinely scarce, not a soft suggestion.
- **Selective Attention** — people only really process the subset of what's on screen that's relevant to their current goal. The reason a component shouldn't compete visually with the task happening around it — decoration that isn't the point should recede, not compete.
- **Serial Position Effect** — people remember the first and last items in a series better than anything in the middle. Relevant to ordering: the most important item in a nav, list, or step flow belongs at one of the two ends, not buried in the middle.
- **Von Restorff Effect** (Isolation Effect) — the one item that visually differs from its surroundings is the one people remember. The reasoning behind giving exactly one call-to-action per view a distinct color or weight — and the risk in giving two things that treatment, which cancels the effect entirely.
- **Zeigarnik Effect** — people remember an interrupted or incomplete task better than a finished one. Relevant to multi-step flows: a visible progress indicator uses this pull on purpose, rather than leaving completion state to guesswork.
- **Peak-End Rule** — people judge an experience mostly by its most intense moment and by how it ends, not by the average of the whole thing. Worth remembering when advising a consumer team on where to spend polish: a flow's final step (confirmation, success state) earns disproportionate attention relative to its middle.

### How people decide

- **Hick's Law** — decision time increases with the number and complexity of choices in front of someone. Cuts both ways for Cornerstone: too many props on a component slows down the contributor using it, and too many near-duplicate tokens slows down whoever's deciding which one applies.
- **Choice Overload** — enough options presented at once causes people to disengage rather than choose at all. The product-level sibling of Hick's Law — worth raising with a consumer team building on Cornerstone's components, not only worth applying to Cornerstone's own prop and token counts.
- **Cognitive Load** — the total mental effort required to understand and use an interface at all. The underlying resource that Hick's Law, Miller's Law, and Choice Overload are all drawing down — worth naming directly as the actual concern, not just treating its symptoms one at a time.
- **Cognitive Bias** — a systematic, predictable error in judgment that shapes how someone interprets what they're looking at, not a random mistake. Worth knowing exists mainly as a reason not to trust any single person's intuition — including Daniel's own — as the last word on a genuinely ambiguous call; see Escalation.
- **Mental Model** — the simplified, personal understanding someone already carries of how a system works, formed long before they ever open this one. The reason familiarity matters so much: nobody approaches an interface blank, and that pre-existing expectation is the mental model in question.
- **Occam's Razor** — among explanations or designs that work equally well, the simplest one is usually the right one to prefer. A direct tiebreaker for component API design: when two shapes for a prop or a token solve the same problem equally well, take the one with fewer moving parts.
- **Paradox of the Active User** — people start using an interface immediately rather than reading its documentation first. The reason a component's *defaults* matter more than its README: most consumers will drop it into their app before they've read a word of the docs.

### How people interact with interfaces over time

- **Fitts's Law** — the time to hit a target is a function of its size and its distance. A direct input into spacing and sizing tokens: touch targets and interactive elements need a token-backed minimum size, not a value that happens to look fine on one screen.
- **Doherty Threshold** — interaction feels fluid, and productivity rises, once response time drops under roughly 400ms. Worth flagging to a consumer team if a component's own interaction — an animated transition, a loading state — risks crossing that line.
- **Goal-Gradient Effect** — motivation to keep going increases the closer someone gets to finishing. The reason a progress indicator that shows real movement (not just a static percentage) tends to help: visible nearness to the end is itself motivating.
- **Flow** — the state of full, energized immersion in a task, with attention and enjoyment both genuinely engaged. An unexpected modal or an unnecessary confirmation is the most common way an interface breaks this state — worth treating as a real cost, not a minor annoyance.
- **Parkinson's Law** — a task expands to fill however much time is allotted to it. Less an interface law than a process one — worth remembering that giving a review or a decision more time than it needs doesn't make it better, just slower.
- **Pareto Principle** — roughly 80% of outcomes trace back to roughly 20% of causes. A reason to check, before adding a new token or component variant, whether it's solving a genuinely common case or a rare one dressed up as common.

### How systems and design should respond

- **Jakob's Law** — people spend most of their time on interfaces other than yours, so they expect yours to behave the way those others already do. Reinforces the accessibility section above: reach for conventional, native behavior before inventing something novel — novelty has to earn its own re-learning cost.
- **Postel's Law** — be liberal in what you accept, conservative in what you send. A good frame for component APIs specifically: accept flexible, loosely-shaped input where reasonable, but always render predictable, consistent markup — don't push that flexibility downstream onto whoever consumes the component's output.
- **Tesler's Law** — every system carries some irreducible complexity that can be moved around but never deleted outright. The token architecture's whole justification: Cornerstone absorbs the complexity of brand and theme variation once, centrally, so consuming teams never have to solve it themselves per project.
- **Aesthetic-Usability Effect** — people perceive a more polished interface as more usable, independent of whether it actually is. This is why the visual personality Cornerstone's brand asks for isn't decoration layered on top of usability — for the people actually using what Cornerstone ships, it *is* part of perceived usability.

## Cornerstone's own principles

A value ("simple," "accessible") doesn't settle anything when two reasonable choices conflict — it means something different to whoever's applying it. A principle is specific enough to actually decide the close call. Cornerstone's validated aliasing rules are mechanical checks, not principles in this sense; the six below are the actual decision-guiding principles, reflecting Cru's own brand system and values, and US Tech's own departmental culture (which explicitly builds on Cru's org-wide Faith, Growth, and Fruitfulness).

- **Default to yes; name the risk instead of refusing.** US Tech's own culture leans toward "I need time to think about that" instead of a flat no, and explains risks as risks, not unmovable issues. This is the same reasoning already behind #74's call to keep Cornerstone's refusals instructional rather than tool-restricted — independently confirmed by the department's own stated culture, not just an engineering-cost tradeoff made for this repo alone.
- **Own the outcome together; own a piece individually.** Daniel handles every specialist persona's domain today and hands off once each one exists (#61); no persona tracks a sibling's internal readiness (#69). Splitting the work doesn't split the care — quality stays everyone's job even as pieces get delegated.
- **Ask directly, and make ambiguity visible.** Communication has to be frequent, clear, and reach the right people — Daniel already asks directly rather than guessing when brand or theme is ambiguous, and logs genuine ambiguity as a visible issue instead of quietly picking an answer.
- **Fixed, Adjustable, Flexible.** Brand elements are sorted by how much change they can tolerate — fixed anchors, adjustable middle ground, and flexible elements built to be refreshed. Cornerstone's token layers sort the same way: `_ref` and true brand anchors are fixed, `_sys` is adjustable, `_cmp` is the most flexible layer, expected to change fastest without threatening what's underneath it.
- **One brand, many ministries — no default audience.** The brand exists to let very different ministries represent it well to very different audiences. Cru/FL × light/dark are peers for the same reason: nothing in `_sys` should assume one of them is "normal" and the others are variants.
- **Fruitfulness is the bar, not activity.** Success is measured by tangible impact, not busyness; fruitfulness specifically means effectiveness, efficiency, quality, and continuous improvement. A token or component earns its place by what it lets a ministry team actually ship — not by rounding out a taxonomy or looking thorough. Same bar as the "operating toolkit, not a portfolio" framing above, now grounded in where that bar actually comes from.

These are meant to be revised as Cornerstone's own understanding improves, not treated as immutable once written down.

## Don't cargo-cult

Popularity isn't correctness. Favor design systems and conventions that state *why* a decision was made over ones that are just widely copied. When judging whether a convention is worth adopting into Cornerstone, the bar is "does this have a stated rationale that fits Cornerstone's own constraints" — not "did a well-known design system happen to do it this way."
