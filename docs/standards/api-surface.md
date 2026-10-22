# Component API Surface — Focus Areas

Every `cs-*` element is public API for every consumer of `@cruglobal/cornerstone-components`, and most of
that API is declared in JSDoc rather than code: the Custom Elements Manifest, the docs page, the React
wrapper and the shipped agent skill are all generated from it. This document covers the contract and its
semver consequence. Markup and behaviour belong to `architecture.md`; accessibility to
`accessibility.md`.

**Applies when the diff touches** `packages/components/src/components/**`,
`packages/components/src/events/**`, `packages/components/src/styles/utilities/**`,
`packages/components/package.json`, the Plop templates, or any line carrying `@property`, `@slot`, `@csspart`,
`@cssproperty`, `@cssstate`, `@event`, `@status`, `part=`, `exportparts` or `<slot`. If no public surface moved,
say "No public surface change in this PR" and review only the load-bearing-value question below.

---

**What the surface is**

Attributes and properties (`@property`), slots, parts (`part=`, `exportparts`), custom events (the
`cs-*` names and their `detail` shape), custom states (`:state(...)`), component properties (`--cs-card-spacing`,
declared with `@cssproperty`), the `size` and `variant` axes, public methods, and the import specifiers in
`exports`. Removing, renaming, or changing the type or default of any of these on a `@status stable`
component is a **breaking change** and takes a `major` changeset; adding one is `minor`. `experimental`
may move in a minor; `deprecated` stays available through the next major.

- Look for: a renamed part or slot under a `patch` or `minor` changeset; a property whose default changed;
  an event whose `detail` lost a field; a `with-*` boolean inverted; a `size` or `variant` value removed.
- Look for: a method or property made `private` that a docs example, a sibling component or the React
  wrapper reached.

**JSDoc is the API, so JSDoc has to match render**

- Every `part=` has a `@csspart` and every `@csspart` is rendered (`test:parts` enforces this). Every
  `<slot name>` has a `@slot`; every `this.dispatchEvent(new Cs…Event())` has an `@event`; every component
  property the stylesheet reads has a `@cssproperty`; every `:host(:state(x))` has a `@cssstate`.
- `@documentation` is derived from `build-tools/site-url.js` by `npm run create`; a hand-typed address is a
  finding (`test:docs-url` catches it in `src`).
- `@since` is the version the component lands in, read from `packages/components/package.json`, not the
  `0.1` literal the Plop template still emits (`scripts/plop/templates/component/component.hbs`; #130
  reset all seventy tags after the template's number shipped on every one).
- A change to JSDoc regenerates `custom-elements.json`, the React wrapper in `src/react/`, the docs API
  table and the agent skill. A PR that edits JSDoc and calls itself "docs only" is wrong.

**Custom property names**

Component properties follow [#182](https://github.com/CruGlobal/cornerstone-design-system/issues/182), which has
the reasoning and the rejected options:

- Named `--cs-<component>-<property>` (`--cs-card-spacing`). A child element whose tag extends its parent's reads
  the parent's name for a property the parent owns (`cs-carousel-item` reads `--cs-carousel-aspect-ratio`). A
  component handing a value to a child component sets the child's own name on it (`cs-dropdown` sets
  `--cs-divider-spacing` on a slotted `cs-divider`).
- A shared name has no component in it, and the list is fixed: the seven names in `SHARED` in
  `packages/components/scripts/check-css-properties.js`. A name joins only if it does the same job on every
  component that reads it, its right value doesn't depend on the surface under it, it is still right when it flows
  into a child component, and it doesn't start with a tag name. `--cs-checked-icon-color` failed the surface test,
  since a checkbox's check sits on a filled box and a radio's dot on an empty control, so it became
  `--cs-checkbox-checked-icon-color` and `--cs-radio-checked-icon-color`.
- Nothing public is set on `:host`. The component reads each property with a fallback,
  `var(--cs-card-spacing, var(--cs-space-l))`, so a value set on the page, a theme class, a section or one element
  inherits into it. A private `--_name` may hold a default that is computed or read in several places.
- Everything else a component keeps to itself is a private `--_name`. Slotted content inherits whatever the host
  carries, so a host carries only a `--_` alias or a theme token, and a script writes on its host only a `--_` alias
  or a documented property, such as a height it measures and publishes. A stylesheet reads only `--cs-*` and `--_*`,
  because an unprefixed name it never sets reads whatever the page happens to define.
- Each default is written once: in the component's fallback, or in the theme when several components share one
  value (`--cs-form-control-*`, `--cs-panel-*`).

Layout utility properties follow [#226](https://github.com/CruGlobal/cornerstone-design-system/issues/226):

- Named `--cs-<utility>-<property>` (`--cs-grid-min-column-size`, `--cs-flank-size`).
- Element only, the opposite of a component property on purpose. Each utility resets its own properties on its
  own selector (`--cs-grid-min-column-size: initial`), so a value applies to the element it is set on and never
  reaches a nested utility of the same kind. A component property is a default for a page or a section; a utility
  property configures one element's layout.

`test:properties` enforces the component half in `verify:static`: the names, nothing public on `:host`, only a
`--_` alias or theme token on a host, only a `--_` alias or documented property in a script's host write, and only
`--cs-*` or `--_*` reads. A host write whose name comes from a variable can't be read statically, so the check
reports it for a person to confirm rather than failing.

- Look for: a `@cssproperty` default that differs from the stylesheet's fallback (seven did when the names
  changed); a script reading a property with `getComputedStyle()` without the stylesheet's fallback, which reads
  an empty string as `0`; a hand-off that sets the parent's name on a child component instead of the child's.
- Look for: a utility property without a reset on its own selector, or not named for its utility. Utilities are
  not in the manifest, so no check covers them.
- Look for: a host write the check reported as unverifiable, and whether the name it builds is documented.

**Events**

One class per file in `src/events/`: `class Cs<Name>Event extends Event`, constructed with
`super('cs-<kebab>', { bubbles, cancelable, composed: true })`, augmenting `GlobalEventHandlersEventMap`.
Look for: an event dispatched with a string name and no class; `composed: false` on an event a consumer
listens for outside the shadow root; a `detail` typed `any`.

**Load-bearing values**

A change to a literal in a `.styles.ts` is finished when every other reader of that value is named.
`cs-tag` is `0.8` of `--cs-form-control-height` and `cs-select` pads a tag-bearing combobox by `0.1` above
and below; neither file mentions the other and no test asserts the sum. Grep for the constant, for the
token it derives from, and for the component that composes yours; assume more pairs exist than you have
found.

**Two vocabularies**

Components read `--cs-*`. The names `packages/tokens` publishes (`--ref-*`, `--sys-*`, `--cmp-*`) resolve
to nothing in a component stylesheet. A `var(--cmp-…)` in `packages/components/src` is a hard bug (the
ast-grep rule `no-foreign-token-vocabulary` fails the component library's `npm run lint` on it); a docs example that tells a consumer to set one is a docs bug.

**React wrappers and SSR**

`src/react/` is generated by `scripts/make-react.js` from the manifest. Look for: a hand edit to
`src/react/`; a new event without an `@event` tag (the wrapper's `on<Event>` prop will be missing); a slot
gated by `HasSlotController` without a `with-*` attribute (the server-rendered markup will omit it).

---

### API Surface Checklist

- Public surface change identified and its bump level named (`stable` removal or rename → major): Yes/No/N/A
- Every rendered part, slot, event, custom property and state has its JSDoc tag, and vice versa: Yes/No/N/A
- New custom properties follow the naming rule, none is set on `:host`, and each utility resets its own: Yes/No/N/A
- `@since` is the landing version; `@documentation` is derived: Yes/No/N/A
- Every reader of a changed literal is named in the PR: Yes/No/N/A
- No `--ref-*`, `--sys-*` or `--cmp-*` in component source: Yes/No/N/A
- `src/react/` untouched by hand: Yes/No/N/A
