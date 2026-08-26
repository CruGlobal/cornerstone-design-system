---
title: Contributing
description: How to work on Cornerstone Components — the process around changing it, and the conventions it is built to.
---

Cornerstone Components is Cru-internal. Changes come from Cru staff and the people they work with, so this
guide is written for a colleague rather than for a drive-by contributor.

Most of it is conventions — how a component is structured, how parts and slots are named, what a form
control has to do. Those start at [Best Practices](#best-practices) and are why this page is long. The
process notes come first, and are short.

## Reporting a bug

A bug is _a demonstrable problem_ caused by code in the library. Open an issue on the
[issue tracker](https://github.com/CruGlobal/cornerstone-design-system/issues).

- **Do** search for an existing issue before opening a new one.
- **Do** say which version you are on and which browser you saw it in.
- **Do** provide a minimal test case that reproduces it.
- **Do** explain what you expected to happen, not only what did.
- **Do not** paste in large blocks of irrelevant code.

**A minimal test case is the important part.** It is what separates a problem in the library from a problem
in the code around it, and it lets whoever picks the issue up understand the bug without reading your
application.

## Proposing a change

Open an issue before writing code for anything beyond a typo or a stale line of documentation. It is the
cheapest way to find out that someone is already on it, that it is planned differently, or that it needs a
decision first.

- **Do** describe what you changed and why, even when it looks obvious. The reviewer has less context
  than you do.
- **Do** run `npm run verify` before opening the pull request. It is the same gate CI runs.
- **Do not** edit anything in `dist/`. It is generated — change the source and rebuild.

### Branches

`cornerstone` — the working branch. Everything is merged into it, and it is what you branch from.

`next` — upstream's branch, left exactly where the fork was taken (`63f2b66`) and never advanced. It is a
marker rather than a place to work: `scripts/check-provenance.js` uses that commit to decide whether a line
of code is upstream's or ours. Do not commit to it.

There is no `current` branch, and no release branch — versioning and release are not settled yet.


## Documentation

Maintaining good documentation can be a painstaking task, but poor documentation leads to frustration and makes the project less appealing to users. Fortunately, writing documentation for Cornerstone is fast and easy!

Most of Cornerstone's technical documentation is generated with JSDoc comments and TypeScript metadata from the source code. Every property, method, event, etc. is documented this way. In-code comments encourage contributors to keep the documentation up to date as changes occur so the docs are less likely to become stale. Refer to an existing component to see how JSDoc comments are used in Cornerstone.

Instructions, code examples, and interactive demos are hand-curated to give users the best possible experience. Typically, the most relevant information is shown first and less common examples are shown towards the bottom. Edge cases and gotchas should be called out in context with tips or warnings.

The docs are an [Astro](https://astro.build/) site using [Starlight](https://starlight.astro.build/), and live in `docs-site/`. Pages are markdown under `docs-site/src/content/docs/`. If you are adding a component, `npm run create` scaffolds its page for you; otherwise copy an existing component's file and work from that.

### Cornerstone-Flavored Markdown

The documentation is [Commonmark](https://spec.commonmark.org/) with a few additions of our own, added as remark plugins in `docs-site/src/plugins/`.

#### Code Previews

To render a code preview, use the standard code field syntax and add a class of `example`:

````md
```html {.example}
[code goes here]
```
````

Append `.open` to expand the source panel by default. The other flags a fence accepts are `.anatomy`, `.anatomy-only`, `.no-edit`, `.no-dir` and `.no-color-scheme`; they are read in `docs-site/src/plugins/remark-examples.js`. Order does not matter, but there must be no space between the language and the flags.

````md
```html {.example .open .no-edit}
[code goes here]
```
````

#### Callouts

Special callouts can be added using the following syntax.

```
:::info
This is a tip/informational callout
:::

:::warning
This is a caution callout
:::
```

### Frontmatter

`title` is the only required key. Starlight's own keys all work — `description`, `sidebar`, `draft`,
`tableOfContents`, `template` — and the schema in `docs-site/src/content.config.ts` adds the ones this
reference needs: `category`, `synonyms`, `use-cases`, `parent`, `tags`, `pageIndex` and `hasAnatomy`.

To keep a page out of the build except in development, use `draft`.

```md
---
draft: true
---
```

To build a page but keep it out of the sidebar, hide it there. A badge is the usual way to mark one that
is published but not finished.

```md
---
sidebar:
  hidden: true
  badge:
    text: Soon
    variant: note
---
```

### Icons in Examples

Documentation examples should use [Material Symbols](https://fonts.google.com/icons?icon.set=Material+Symbols&icon.style=Sharp) names, which is what the `default` icon library resolves. Check a name against the catalog before using it — one that doesn't exist renders nothing rather than erroring. Brand logos come from the `brands` library; anything else should stay on the default.

## Best Practices

The following is a non-exhaustive list of conventions, patterns, and best practices we try to follow. As a contributor, we ask that you make a good faith effort to follow them as well. This ensures consistency and maintainability throughout the project.

If in doubt, use your best judgment — code review is the place to settle it. If you want the question answered before you write the code, open an issue.

:::info
This section can be a lot to digest in one sitting, so don't feel like you need to take it all in right now. Most contributors will be better off skimming this section and reviewing the relevant content as needed.
:::

### Accessibility

Cornerstone is built with accessibility in mind. Creating generic components that are fully accessible to users with varying capabilities across a multitude of circumstances is a daunting challenge. Oftentimes, the solution to an a11y problem is not written in black and white and, therefore, we may not get it right the first time around. There are, however, guidelines we can follow in our effort to make Cornerstone an accessible foundation from which applications and websites can be built.

We take this commitment seriously, so please keep it in mind in what you write. If you find an accessibility problem in the library, file it on the [issue tracker](https://github.com/CruGlobal/cornerstone-design-system/issues).

It's important to remember that, although accessibility starts with foundational components, it doesn't end with them. It everyone's responsibility to encourage best practices and ensure we're providing an optimal experience for all of our users.

### Code Formatting

Most code formatting is handled automatically by [Prettier](https://prettier.io/) via commit hooks. However, for the best experience, you should [install it in your editor](https://prettier.io/docs/en/editors.html) and enable format on save.

Please do not make any changes to `prettier.config.cjs` without consulting the maintainers.

### Composability

Components should be composable, meaning you can easily reuse them with and within other components. This reduces the overall size of the library, expedites feature development, and maintains a consistent user experience.

### Component Structure

All components have a host element, which is a reference to the `<cs-*>` element itself. Make sure to always set the host element's `display` property to the appropriate value depending on your needs, as the default is `inline` per the custom element spec.

```css
:host {
  display: block;
}
```

Aside from `display`, avoid setting styles on the host element when possible. The reason for this is that styles applied to the host element are not encapsulated. Instead, create a base element that wraps the component's internals and style that instead. This convention also makes it easier to use BEM in components, as the base element can serve as the "block" entity.

When authoring components, please try to follow the same structure and conventions found in other components. Classes, for example, generally follow this structure:

- Static properties/methods
- Private/public properties (that are _not_ reactive)
- `@query` decorators
- `@state` decorators
- `@property` decorators
- Lifecycle methods (`connectedCallback()`, `disconnectedCallback()`, `firstUpdated()`, etc.)
- Private methods
- `@watch` decorators
- Public methods
- The `render()` method

Please avoid using the `public` keyword for class fields. It's simply too verbose when combined with decorators, property names, and arguments. However, _please do_ add `private` in front of any property or method that is intended to be private.

:::info
This is a lot to hold at once, and it is not a gate — code can change, and review is where the shape gets settled. Following it keeps 70 components reading like one library rather than seventy.
:::

### Class Names

All components use a [shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM), so styles are completely encapsulated from the rest of the document. As a result, class names used _inside_ a component won't conflict with class names _outside_ the component, so we're free to name them anything we want.

Internally, each component uses the [BEM methodology](http://getbem.com/) for class names. There is no technical requirement to do this — it's purely the preference of the author to enforce consistency and clarity throughout components. As such, all contributions are expected to follow this pattern.

### Boolean Props

Boolean props should _always_ default to `false`, otherwise there's no way for the user to unset them using only attributes. To keep the API as friendly and consistent as possible, use the following convention to show or hide optional content.

- `with-*` - The content doesn't show by default, but will be shown when this attribute is present
- `without-*` - The content shows by default, but will not be shown when this attribute is present

### Conditional Slots

When a component relies on the presence of slotted content to do something, don't assume its initial state is permanent. Slotted content can be added or removed any time and components must be aware of this. A good practice to manage this is:

- Add `@slotchange={this.handleSlotChange}` to the slots you want to watch
- Add a `handleSlotChange` method and use `HasSlotController` to update state variables for the respective slot(s)
- Never conditionally render `<slot>` elements in a component — always use `hidden` so the slot remains in the DOM and the `slotchange` event can be captured

See the source of card, dialog, or drawer for examples.

### Dynamic Slot Names & Expand/Collapse Icons

A pattern has been established in `<cs-details>` and `<cs-tree-item>` for expand/collapse icons that animate on open/close. In short, create two slots called `expand-icon` and `collapse-icon` and render them both in the DOM, using CSS to show/hide only one based on the current open state. Avoid conditionally rendering them. Also avoid using dynamic slot names, such as `<slot name=${open ? 'open' : 'closed'}>`, because Firefox will not animate them.

There should be a container element immediately surrounding both slots. The container should be animated with CSS by default and it should have a part so the user can override the animation or disable it. Please refer to the source and documentation for `<cs-details>` and/or `<cs-tree-item>` for details.

### Fallback Content in Slots

When providing fallback content inside of `<slot>` elements, avoid adding parts, e.g.:

```html
<slot name="icon">
  <cs-icon part="close-icon"></cs-icon>
</slot>
```

This creates confusion because the part will be documented, but it won't work when the user slots in their own content. The recommended way to customize this example is for the user to slot in their own content and target its styles with CSS as needed.

### Labels and hints: the attribute is the slot's fallback

Fourteen components take a `label` as both an attribute and a slot, thirteen take a `hint` the same way,
and `<cs-details>` takes a `summary`. That pairing is deliberate and it is upstream's: an attribute holds a
string, a slot holds markup, and a hint containing a `<kbd>` or a link needs the second.

Write the pair as a slot whose fallback content is the attribute, which is how all 28 are written today:

```js
render() {
  return html` <slot name="label">${this.label}</slot> `;
}
```

**The slot always wins.** That is not a convention this library enforces — it is what the platform does with
fallback content. Fill the slot and the browser never renders the fallback, so the attribute is dropped.
There is nothing to decide per component and nothing to document per component beyond naming the slot.

The rule that follows, and the one that is easy to get wrong: **where a component needs its label as a
string, reference the rendered label rather than reading the attribute.** Point `aria-labelledby` at the
element the slot renders into. Reading `this.label` looks equivalent and is not — a consumer who uses the
slot leaves the property empty, so the name silently falls back or disappears. `<cs-slider>`'s range thumbs
did exactly that: with a slotted label they announced a hard-coded "Minimum value" with no reference to the
visible label. They now use `aria-labelledby="label thumb-min-bound"`.

Do not document a per-component precedence rule. There is one rule and it is here.

### Emitting Events

Components must only emit events that start with `cs-` as a namespace. For compatibility with frameworks that utilize DOM templates, events must have lowercase, kebab-style names. For example, use `cs-event` instead of `csEvent`.

This convention avoids the problem of browsers lowercasing attributes, causing some frameworks to be unable to listen to them. This problem isn't specific to one framework, but [Vue's documentation](https://vuejs.org/v2/guide/components-custom-events.html#Event-Names) provides a good explanation of the problem.

### Data Attribute Invokers

Some components can be controlled using [data attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/data-*) that trigger specific behaviors. These controls must use the following convention:

```html
<button data-component="action id">Button text</button>
```

The `data-component` portion corresponds to the component's name without the `cs-` prefix. For example, `data-dialog` must control a `<cs-dialog>` component.

The `action` parameter is required and must be a concise, descriptive term indicating the intended behavior, e.g. `open` and `close`.

The `id` parameter must point to the ID of the target component. The ID may be omitted if and only if the target component wraps the element with the `data-` attribute.

```html
<cs-dialog id="my-dialog"> Dialog content </cs-dialog>

<button data-dialog="open my-dialog">Open dialog</button>
```

### CSS Custom Properties

Custom properties allow users to customize Cornerstone components by exposing specific styles across a component's shadow boundary. Use custom properties to expose key characteristics of a component for low-level theming. Avoid using custom properties for styles that may interfere with proper rendering.

To expose custom properties as part of a component's API, scope them to the `:host` block.

```css
:host {
  --color: var(--cs-color-brand-on-loud);
  --background-color: var(--cs-color-brand-fill-loud);
}
```

Then use the following syntax for comments so they appear in the generated docs. Do not use the `--cs-` prefix, as that is reserved for design tokens that live in the global scope.

```js
/**
 * @cssproperty --color: The component's text color.
 * @cssproperty --background-color: The component's background color.
 */
@customElement('cs-example')
export default class CsExample {
  // ...
}
```

### Focusing on Disabled Items

When an item within a keyboard navigable set is disabled (e.g. tabs, trees, menu items, etc.), the disabled item _should not_ receive focus via keyboard, click, or tap. It should be skipped just like in operating system menus and in native HTML form controls. There is no exception to this. If a particular item requires focus for assistive devices to provide a good user experience, the item should not be disabled and, upon activation, it should inform the user why the respective action cannot be completed.

### When to Use a Property vs. a CSS Custom Property

When designing a component's API, standard properties are generally used to change the _behavior_ of a component, whereas CSS custom properties ("CSS variables") are used to change the _appearance_ of a component. Remember that properties can't respond to media queries, but CSS variables can.

There are some exceptions to this (e.g. when it significantly improves developer experience), but a good rule of thumbs is "will this need to change based on screen size?" If so, you probably want to use a CSS variable.

### When to Use a CSS Custom Property vs. a CSS Part

There are two ways to enable customizations for components. One way is with CSS custom properties ("CSS variables"), the other is with CSS parts ("parts").

CSS variables are scoped to the host element and can be reused throughout the component. A good example of a CSS variable would be `--border-width`, which might get reused throughout a component to ensure borders share the same width for all internal elements.

Parts let you target a specific element inside the component's shadow DOM but, by design, you can't target a part's children or siblings. You can _only_ customize the part itself. Use a part when you need to allow a single element inside the component to accept styles.

This convention can be relaxed when the developer experience is greatly improved by not following these suggestions.

### Naming CSS Parts

While CSS parts can be named [virtually anything](https://www.abeautifulsite.net/posts/valid-names-for-css-parts/), within Cornerstone they must use the kebab-case convention and lowercase letters. Additionally, [a BEM-inspired naming convention](https://www.abeautifulsite.net/posts/css-parts-inspired-by-bem/) is used to distinguish parts, subparts, and states.

When composing elements, use `part` to export the host element and `exportparts` to export its parts.

```js
render() {
  return html`
    <div part="details">
      <cs-icon part="icon" exportparts="svg:icon__svg" ...></cs-icon>
    </div>
  `;
}
```

This results in a consistent, easy to understand structure for parts. In this example, the `icon` part will target the host element and the `icon__svg` part will target the icon's `svg` part.

#### Wrapper elements and their parts

Let the host do the work. `:host` handles the outer box for nearly every component, so only render a wrapper element when you actually need one. `<cs-accordion>`, `<cs-card>`, and `<cs-dropdown>` render no wrapper at all. Style those directly with `cs-accordion { ... }`.

When a component does need a wrapper, name its part after the component (the tag name without the `cs-` prefix). `<cs-details>` renders `details`; `<cs-carousel>` renders `carousel`. If the component name is already taken by an inner part (`<cs-input>` names its native control `input`), the wrapper takes a `-wrapper` suffix instead: `input-wrapper`, `textarea-wrapper`.

```js
render() {
  return html` <div part="details">...</div> `;
}
```

Never put a part on a `<slot>`. Slots default to `display: contents`, so a part there can't take a border, background, or padding unless you also set `display`. If slotted content needs a styling hook, wrap it in a real element and put the part there.

### Dependencies

TL;DR – a component is a dependency if and only if it's rendered inside another component's shadow root.

Many Cornerstone components use other Cornerstone components internally. For example, `<cs-button>` uses both `<cs-icon>` and `<cs-spinner>` for its caret icon and loading state, respectively. Since these components appear in the button's shadow root, they are considered dependencies of Button. Since dependencies are automatically loaded, users only need to import the button and everything will work as expected.

The rule of thumb for dependencies is: if a component is rendered _inside_ a host element's shadow root OR if the component is required to be slotted in by the user (e.g. `<cs-radio-group>` + `<cs-radio>`), it's a dependency.

### Form Controls

Form controls should support submission and validation through the following conventions:

- Form Controls should extend from `CornerstoneFormAssociatedElement`
- All form controls must use `name`, `value`, and `disabled` properties in the same manner as `HTMLInputElement`
- All form controls with the `disabled` property _NOT_ reflect the `disabled` attribute.
- All form controls must have an `invalid` property that reflects their validity
- All form controls should mirror their native validation attributes such as `required`, `pattern`, `minlength`, `maxlength`, etc. when possible and use the `MirrorValidator`.
- All form controls must be tested to work with the standard `<form>` element
- Form controls that **DO NOT** have an editable value such as a button only need `@property({ reflect: true }) value`
- Form controls that **DO** have an editable value such as an input or textarea should have: `@property({ attribute: false }) value` and `@property({ attribute: "value", reflect: true }) defaultValue`. We do this to align with how native form controls work.
- Form controls which have an editable property such as `checked` or `selected` should also have a `defaultSelected` and `defaultChecked` property respectively for use when the form is "reset".

### Pickers

Pickers are form controls that pair a **segmented input** with a **popup** for visual selection — `<cs-time-input>` and `<cs-known-date>` are the canonical examples. When building a new picker, follow these conventions so it composes cleanly with the rest of the library.

- **Segmented input.** Each editable field is a `role="spinbutton"` rendered as inline text with `font-variant-numeric: tabular-nums`. Use the shared `SegmentedFieldController` (`src/internal/segmented-field/`) for buffer management, roving tabindex, arrow navigation, Home/End, Tab flush, Backspace/Delete, and separator advance. Pass field-specific rules (digit semantics, stepping, bounds) in via the controller's options — don't fork the keyboard handling.
- **Popup.** The popup is rendered with `<cs-popup>` and follows the same `cs-show` / `cs-after-show` / `cs-hide` / `cs-after-hide` lifecycle as other overlays. It must register with the [dismissible stack](#dismissible-overlays) and open on pointerdown into the input wrapper (but not on Tab focus, which would interfere with tab order). `Alt+ArrowDown` opens the popup and moves focus into it; `Alt+ArrowUp` closes; `Escape` closes when topmost.
- **Sizing with `em`.** Pickers extend `sizeStyles` so the host's font-size is driven by the `size` attribute (`xs`–`xl`). Every measurement inside the popup — column widths, row heights, icon sizes — must use `em` so the entire UI scales with the host. Use `font-size: inherit` on the popup body and any child component (e.g. the popup column picker inside `<cs-time-input>`) and prefer `em`-relative font-sizes (`0.75em`, `0.875em`) over absolute design tokens like `var(--cs-font-size-xs)` where the content needs to scale with the picker.
- **Icons.** Apply icon sizing via CSS on the slot wrapper (e.g. `.expand-icon { font-size: 1.25em }`), not via inline `style` on the default icon. This keeps the default and user-slotted icons consistent and lets the icon scale with the host's font-size.
- **Form association.** Pickers extend `CornerstoneFormAssociatedElement` and follow the standard editable form-control conventions documented above. The canonical wire value is stored in `_value`; segments are derived from it and re-emit `input` on every edit, `change` on every committed transition (matching native `<input type="date">` / `<input type="time">`).

### Dismissible Overlays

Overlay components (dialog, drawer, select, dropdown, tooltip, popover, color-picker, etc.) each attach their own document `keydown` listener. Without coordination, all open overlays respond to the Escape key simultaneously — causing nested overlays to all close at once.

To solve this, a shared dismissible stack is maintained in `src/internal/dismissible-stack.ts`. Components that can be dismissed with the Escape key must use it to coordinate which overlay responds. The stack tracks open dismissibles in order, so only the topmost one handles the key event.

- Call `registerDismissible(this)` when the overlay becomes visible
- Call `unregisterDismissible(this)` when the overlay closes or is removed from the DOM
- Before handling Escape, call `isTopDismissible(this)` to confirm your component is the topmost dismissible — if it returns `false`, ignore the key event

This pattern is modeled after the `scroll.ts` lock pattern. Refer to existing overlay components such as `<cs-dialog>` or `<cs-drawer>` for examples.

### Server-Side Rendering (SSR)

Cornerstone supports server-side rendering via [Lit SSR](https://lit.dev/docs/ssr/overview/). During SSR, Lit calls `constructor()` and `connectedCallback()` but does **not** call `firstUpdated()`, `updated()`, or event handlers. This means browser-only APIs such as `document.*`, `window.*`, `ResizeObserver`, `MutationObserver`, etc. need to be guarded in constructors, class field initializers, `connectedCallback()`, and module-level code. Guards are _not_ needed in `firstUpdated()`, `updated()`, event handlers, or `@watch` handlers.

To guard browser-only code, import `isServer` from `lit` and short circuit early or wrap the relevant code. Do not shim browser APIs on `globalThis` as a workaround — use `isServer` guards directly.

```ts
import { isServer } from 'lit';

connectedCallback() {
  super.connectedCallback();

  // SSR guard: ResizeObserver is not available during server-side rendering
  if (isServer) {
    return;
  }

  this.resizeObserver = new ResizeObserver(() => this.handleResize());
  this.resizeObserver.observe(this);
}
```

#### Slot Detection & `with-*` Attributes

Some components use `HasSlotController` to conditionally render parts of their template (e.g. a footer that only appears when a `footer` slot is present). During SSR, slot detection doesn't work because the DOM isn't available, so these parts would be missing from the initial server-rendered markup.

To solve this, components that rely on slot detection in their `render()` method must provide `with-*` attributes as SSR fallbacks. There is exactly one correct spelling — pass the property name as the second argument to `test()`, and let the controller apply the guard:

```ts
/**
 * Only required for SSR. Set to `true` if you're slotting in a `label` element so the server-rendered markup
 * includes the label before the component hydrates on the client.
 */
@property({ attribute: 'ssr-label', type: Boolean }) ssrLabel = false;

render() {
  const hasLabelSlot = this.hasSlotController.test('label', 'ssrLabel')
}
```

On server-rendered markup that has not yet hydrated (`didSSR` is `true` and `hasUpdated` is `false`), the
`with-*` property is used. After hydration, `HasSlotController` takes over with real slot detection. Note that
the guard is on `didSSR`, not on `hasUpdated` alone — a client-only first render must fall straight through to
slot detection, because no `with-*` attribute was ever set.

Never hand-roll the guard. `this.hasUpdated ? test(name) : this.withX` checks only half of it and returns the
`with-*` value on a client-only first render, which renders one frame from the attribute and the next from the
slot. `isServer ? true : test(name)` claims every slot is filled on the server. A bare `test(name)` has no
fallback at all, so the slot is reported empty on the server whatever the consumer slots in.

**Every slot gated by `HasSlotController` must expose a `with-*` attribute the consumer can set.** A bare
`test(name)` in `render()` is not a style choice — it leaves the consumer no way to produce correct
server-rendered markup, because nothing outside the component can reach the guard. All `with-*` SSR properties
must include a JSDoc comment that clearly states the property is only required for SSR.

#### Which mechanism collapses an empty slot

An unfilled slot must leave no stray padding, border or margin. There are two ways to achieve that, and the
choice is not free-form.

**Reach for CSS first.** Put the spacing on the slotted content itself, so an unfilled slot has nothing to
space:

```css
slot[name='start']::slotted(*) {
  margin-inline-end: 0.75em !important;
}
```

`!important` is required. A slotted element belongs to the outer tree, so per the shadow cascade a *normal*
declaration from the page beats one from inside the component whatever the specificity — any document-level
universal margin reset silently collapses the gap to zero. The cascade inverts for important declarations,
which is how a component defends its own internals.

**Reach for `HasSlotController` only when CSS cannot do the job.** Two tests decide it, and either one
answering yes means the slot needs the controller:

1. **Does the wrapper cost space when empty?** `::slotted` styles the slotted element. It cannot reach a
   wrapper around it, so a container with its own padding, border or background still renders when nothing is
   slotted. `<cs-toast-item>`'s icon container and `<cs-card>`'s regions are in this position.
2. **Can the content arrive through an attribute instead?** A component that accepts both — `label="Email"`
   or a `label` slot — renders the attribute as fallback content *inside* the slot, which lives in the shadow
   tree. `::slotted` does not match fallback content, so it cannot style the attribute case. Every `label` and
   `hint` slot is in this position.

`<cs-card>` shows a third form worth knowing: it gates in CSS off the reflected attribute
(`:host(:not([has-header])) .header`) rather than a class computed in `render()`. That is the same mechanism
as the controller, spelled in CSS.

Two components are sanctioned exceptions to the empty-slot-collapses rule, and both are deliberate:

- `<cs-dialog>` and `<cs-drawer>` render a zero-width space in the header so it does not collapse when no
  label is given. It looks like a stray character; it is load-bearing.
- `<cs-dialog>`'s footer stays in the DOM under `?hidden` rather than being conditionally rendered, so
  `slotchange` still fires — the same rule as *Conditional Slots* above.

### System Icons

Avoid inlining SVG icons inside of templates. If a component requires an icon, make sure `<cs-icon>` is a dependency of the component and use the [system library](/components/icon#customizing-the-system-library):

```html
<cs-icon library="system" name="..." variant="..."></cs-icon>
```

This will render the icons instantly whereas the default library will fetch them from a remote source. If an icon isn't available in the system library, you will need to add it to `library.system.ts`. Using the system library ensures that all icons load instantly and are customizable by users who wish to provide a custom resolver for the system library.

### Writing Tests

What to test for a given component:

- Start with a simple test that checks that the default version of the component still renders.
- Add at least one accessibility test (The accessibility check only covers the parts of the DOM which are currently visible and rendered. Depending on the component, more than one accessibility test is required to cover all scenarios.):

```ts
const myComponent = await fixture<CsComponent>(html`<cs-component>...</cs-component>`);

await expect(myComponent).to.be.accessible();
```

- Try to cover all features advertised in the component's description

Guidelines for writing tests:

- Each test should declare its own, hand crafted hml fixture for the component. Do not try to write one big component to match all tests. This helps keeping each test understandable in isolation.
- Tests should not produce log lines. Note that sometimes this cannot be prevented as the test runner might log errors (e.g. 404s).
- Try keeping the main test readable: Extract more complicated sets of selectors/commands/assertions into separate functions.
- Try to aim testing the user facing features of the component instead of the internal workings of the component.
- Group multiple tests for one feature into describe blocks.

### Running Tests

Right now, tests run both "hydrated" (SSR → client hydrated) and "client only". If you're debugging only one specific kind you can set an environment variable. For example, to run only the client tests, you can do:

```bash
CSR_ONLY="true" npm run test
```

or for hydrated rendering only:

```bash
SSR_ONLY="true" npm run test
```

## Built on

Cornerstone stands on the shoulders of some excellent open source projects. Special thanks to:

- [Astro](https://astro.build/) and [Starlight](https://starlight.astro.build/) — the static site generator and documentation theme powering the docs
- [Lit](https://lit.dev/) — the web component library Cornerstone's components are authored in
- [Custom Elements Manifest Analyzer](https://github.com/open-wc/custom-elements-manifest) — generates the component API metadata that drives the docs and editor tooling
- [Floating UI](https://floating-ui.com/) — positioning for popovers, tooltips, and other anchored UI
- [Animate.css](https://animate.style/) — the animation library behind the show/hide motion presets
