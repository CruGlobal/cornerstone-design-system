---
name: see-it-in-figma
description: Prototype a design problem in Figma against Cornerstone's real variables and components, before anyone commits to an implementation. Use when someone wants to see, sketch, mock up, try, or compare an interface idea — a state that has no component yet, an empty or error state, a layout or density question, a variant that may not be needed — or wants to check whether an idea holds up across Cru and FamilyLife in light and dark. Figma only — it never writes application code.
---

# See it in Figma

Some design questions are cheaper to answer by looking at them than by arguing about them. This skill is for those: build the thing in Figma, out of Cornerstone's real variables and real components, look at it in all four brand-and-theme modes, and let the artifact settle the question.

A prototype here is **throwaway, and it is made of the design system**. Those two things are what make it worth building. Throwaway, because the point is the answer and not the artifact. Made of the design system, because a mockup drawn from raw hex values answers a question nobody asked — it tells you how an idea looks in one invented palette, not how it will look once it ships in four.

You never produce code. That boundary is not cosmetic; see [What you never do](#what-you-never-do).

## Before any `use_figma` call

Invoke the `figma:figma-use` skill first, via the Skill tool. Every time, not once per session. The Figma MCP server's own instructions require it and skipping it causes failures that are hard to trace back to the omission. Pass `figma-use` in `use_figma`'s `skillNames` parameter.

Read before you write. Discovery is cheap and cheap discovery is what keeps you from inventing something that already exists: `get_metadata` for structure, `get_screenshot` for what a frame actually looks like, and a read-only `use_figma` script for anything you need to enumerate programmatically. Then write in small steps and validate after each one.

## Where prototypes live

Cornerstone's variables and components live in the Cru Design System file, `MPjEsALOqWMDRR4osVK6NR`. Confirm before starting whether you are working in that file or in the designer's own — the answer changes how you reach the variables, and the difference matters (see [Bind to the variables](#bind-to-the-variables-never-to-a-value)).

Inside the Cornerstone file, pages follow a convention: `-- <Name> WIP` while a component is being drafted, `-- <Name> v<version>` once it is versioned, plus a `-- Component Exploration` page that exists precisely for work that is not a component yet. Find pages by name; don't carry node IDs across sessions, because they go stale and a stale ID silently points at something else.

Prototypes go on the exploration page, or on a new page named for the question. Never on a versioned component page, and never inside a published component set — a prototype that edits the real Alert has stopped being a prototype and become an unreviewed change to the design system.

## Bind to the variables, never to a value

Cornerstone's variables sit in three collections — `Reference`, `System`, and `Component` — and variable names carry the layer in their first segment: `_ref/…`, `_sys/…`, `_cmp/…`.

Enumerate the collections yourself on your first call rather than trusting any document, including this one. Two documents in the Cornerstone repo disagree: `Figma Variables & Styles Roadmap.md` §2 lists seven collections split by type, while `.claude/commands/pull-tokens.md` halts the whole sync unless it finds exactly the three above. The three-collection shape is the live one, the roadmap's table is a stale build plan, and the general lesson is worth more than the specific answer — read the file, then work from what it says.

Then bind, in this order of preference:

- **`_cmp/<component>/…`** when the part you are placing belongs to a component that already has tokens. This is the layer that was authored for exactly this purpose.
- **`_sys/…`** for anything a component token doesn't cover — a surface, a divider, a text colour, a spacing step, a semantic status colour.
- **Never `_ref/…`, and never a raw hex, size, or font name.** `Reference` is a single-mode collection: it holds Cru's palette and FamilyLife's palette side by side as separate groups, with no notion of light or dark. A `_ref` binding is therefore only marginally better than a hex — both are frozen, and both will be wrong in some mode.

The reason to hold that line is measurable, not aesthetic. Of the 87 semantic colour roles in `_sys.color`, exactly **three** resolve to the same literal in all four modes; **79** differ between light and dark within at least one brand. All **seven** `_sys.string.font-family` roles differ between Cru and FamilyLife. Even the numbers aren't uniformly safe — 20 of 138 `_sys.number` values differ across the four published modes. A value you type in by hand is not "close enough in the other modes"; it is guaranteed wrong in at least one of them.

For type, apply the existing text style (`typography/body/md`, `typography/title/sm`, and so on) rather than binding fonts and sizes yourself. The style already carries the `_sys` bindings, so re-binding them on the node is redundant work that can only drift. For elevation, apply the effect style — shadows are composite and Figma variables cannot express them.

**Working in a file that isn't the Cornerstone file.** `figma.variables.getLocalVariableCollectionsAsync()` returns nothing for a library, so an empty result there means "not local," never "doesn't exist." Call `get_libraries` to see which libraries the file has, `search_design_system` with `includeVariables: true` to find the variables, and `figma.variables.importVariableByKeyAsync(key)` to bring one in before binding it. Never conclude the tokens are missing and create your own.

## The four modes are peers

`System` carries **four named modes** — `cru-light`, `cru-dark`, `fl-light`, `fl-dark`. They are peers. Nothing in Cornerstone treats one of them as the normal case and the others as variants, because the brand exists to let very different ministries represent it well to very different audiences: one brand, many ministries, no default audience. A prototype reviewed in one mode has been reviewed for one audience.

The mechanics force a specific shape on the work. Figma resolves one active mode per collection per frame, and brand and theme both ride that single `System` collection as four discrete modes rather than two independent switches. There is no way to combine "FamilyLife" and "dark" from separate controls, and no way to show two modes in one frame. So the deliverable is **four frames, one per mode**, each set with `frame.setExplicitVariableModeForCollection(systemCollection, modeId)` — pass the collection object, not its ID string.

Name each frame with the mode string verbatim. Those four strings are the same ones used by the repo's token files (`tokens/sys/cru-light.json`) and by its compiled CSS selectors (`[data-brand="cru"][data-theme="light"]`), so a frame named `cru-dark` needs no translation when someone eventually builds it.

`Component` has **no modes at all** — a single mode, `Value`. Every `_cmp` token resolves per mode only because it aliases `_sys`, and all 272 of them do; not one aliases `_ref` directly. That is what makes a `_cmp`-bound layer respond to a mode switch for free, and it is also why you must never "fix" a bad-looking dark mode by overriding a `_cmp` value: there is one `_cmp` layer shared by all four modes, so a fix aimed at one changes all four. A colour that only looks wrong in one mode is a `_sys` question, and `_sys` belongs to Sarah.

## Four traps that quietly produce a wrong prototype

Each of these leaves a prototype that renders plausibly and misleads the reviewer, which is worse than one that fails loudly.

1. **Re-binding a paint to the variable it already holds is a no-op refresh.** Figma keeps the base colour you passed to `setBoundVariableForPaint` and renders *that*, even though the binding is genuinely present and resolves correctly when queried. The upstream examples seed the paint with black, which is fine for a fresh node and produces black blocks on an already-bound one — this was the real cause of a Cornerstone component rendering one variant black. Always seed with the variable's own resolved value:

   ```js
   const val = v.resolveForConsumer(node).value;
   const paint = figma.variables.setBoundVariableForPaint(
     { type: 'SOLID', color: { r: val.r, g: val.g, b: val.b } }, 'color', v
   );
   node.fills = [paint];   // setBoundVariableForPaint returns a NEW paint — capture it
   ```

2. **`figma.createAutoLayout()` frames arrive with an opaque white fill.** Clear it with `fills = []` unless you are deliberately binding a surface token. An unbound white container reads as a light surface and will look correct in two modes and broken in the other two.

3. **Text throws unless the font is loaded first.** Load the font, `await` it, then mutate, then return the affected node IDs. When editing existing text, read its current fonts via `getStyledTextSegments(['fontName'])` rather than assuming a default — and note this applies to `setBoundVariable` and `setExplicitVariableModeForCollection` too, not just to `characters`.

4. **Icons come through the component's own swap property.** Cornerstone components expose icons as an `INSTANCE_SWAP` property prefixed `¬ ` (for example `¬ Icon`), filled with a Material Design Icons instance at `Style=Outlined`, sized in fixed px rather than variable-bound. Swap through the property. Pasting a vector in place of the instance breaks the component's own contract.

## Finish by proving it, not by eyeballing it

The bar Cornerstone's own components are held to is **zero unbound paints, verified in all four modes** — and it is verified, not assumed. Before you hand a prototype over:

- Walk the prototype's subtree and enumerate every fill, stroke and effect, checking each node's `boundVariables`. Report anything unbound by name and position instead of quietly leaving it.
- Screenshot all four mode frames and actually look at them.
- Say plainly which question the prototype was built to answer, and what it answers.

## Known system defects — don't patch them locally

Some things will look wrong in a mode and not be your prototype's fault. These are open, recorded, and owned elsewhere:

- **cru-dark has `surface-dim` and `surface-bright` inverted** relative to the other three modes. Anything layering those two will look wrong there.
- **`_sys/color/inverse-primary` is 3.94:1** on `inverse-surface` in cru-dark — below AA for normal text.
- **FamilyLife has no true red ramp.** `fl/pink` peaks too low in chroma for danger to read as urgent, and `fl/blue` reads grey for information. That is a brand sign-off question, not a token tweak.
- **`fl` `<status>-outline` is 1.3–2.1:1** against its container — usable decoratively, not as a boundary.

When your prototype hits one of these, name it as a system defect and route it — a token or contrast problem goes to Sarah, a missing ramp needs brand sign-off. Sarah lives in the contributor tier, so in a designer-only install she isn't there either; then the route is a written request to the Senior UX Designer / Design Systems Engineer, not a value you pick yourself. Do not paper over it with a local override either, because the override makes the prototype look shippable while the underlying problem stays exactly where it was.

## What you never do

- **Produce or commit code.** Not a component, not a snippet, not "just the CSS for the token names." Turning a prototype into real code is Joseph's job, with his PR discipline, his token-request path and his refusals — and in a designer-only install Joseph isn't present at all. When a prototype has answered its question and should become real, say so and hand it off. If Joseph isn't installed, say that too and stop; a missing owner is not permission to do the work yourself.
- **Create or edit variables, styles, or component sets.** Two independent reasons. First, `/pull-tokens` is diff-driven and namespace-driven: it buckets every variable whose name starts with `_ref`, `_sys` or `_cmp` into a subtree, and a key that is new in Figma gets pulled into the repo and published. A variable you invent for a prototype in the Cornerstone file becomes a real token in a real release. Second, authoring the Figma component itself — variant set, variables bound — is deliberately a human job in Cornerstone's definition of done, owned by no persona; a prototype that quietly authors one makes that step look finished when nobody has done it.
- **Write to the repo.** No `tokens/*.json`, no changesets, no PRs. If the prototype proves a token is missing or wrong, that is a request to Sarah, who owns every write to the token tree — or, where she isn't installed, to the human who holds that role.
- **Ship a prototype reviewed in one mode.** See above: there is no default audience.

## Deferred, and declined

This tier stays small on purpose, so what it does and doesn't cover is legible rather than accumulated.

**Ships now.** Prototyping a problem, state or decision in Figma using existing components and tokens, before committing to an implementation.

**Deferred, with the trigger that would revisit it:**

- **Composing existing components into a page-level pattern.** Revisit when component-level pattern composition has an owner; today it is a gap on the code side too. The practical tell that you have crossed the line is reaching for `figma:figma-generate-design`, whose whole subject is assembling multi-section views — if that skill is what you need, this is not the skill you are in.
- **Motion and animation exploration.** Two things have to be true first, not one. Cornerstone's motion primitives are hand-authored and don't exist yet, *and* Figma has no motion variable to bind them to — motion isn't expressible as a variable at all. Until both change, a motion prototype's numbers would be hand-tuned raw values, which is the exact failure mode this skill exists to prevent.
- **Brand-ramp exploration** — testing a proposed visual change across brands before a token change is formally requested. Revisit when there is a way to explore a ramp without authoring variables in the Cornerstone file, since authoring them is what `/pull-tokens` would publish.

**Declined outright.** Anything that produces or commits code. That boundary belongs to Joseph and is not negotiable by scope creep.

## When you're done

Capture the answer, not the artifact. A prototype that settled a question has done its job; what survives is the decision and the reason for it, recorded where the next person will find it. Leave the frames on the exploration page for as long as they are useful and don't grow attached to them.

If the decision needs a human — the brand is genuinely ambiguous, a needed token doesn't exist, the prototype exposes a system defect — resolve it in conversation first, then escalate it as a visible record rather than picking an answer quietly.
