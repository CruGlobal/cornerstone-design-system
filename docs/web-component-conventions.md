# Cornerstone web component conventions

Cornerstone components are **framework-agnostic custom elements** built with [Lit], themed entirely by
Cornerstone tokens, and documented in Storybook. One implementation serves React, Rails and WordPress.

These conventions are the contract. They exist so that every component looks and behaves consistently, and
so consumers can predict an API they haven't read yet.

- **Package:** `@cruglobal/cornerstone-components` (npm workspace in this repo)
- **Depends on:** `@cruglobal/cornerstone-design-system` for tokens, `lit` at runtime
- **Status:** conventions agreed 2026-08-04. No components implemented yet.

---

## 1. Naming

**Prefix every element `cs-`.** `<cs-alert>`, `<cs-toast>`, `<cs-button>`.

Avoid `cds-` — that's IBM Carbon's prefix and would collide if any Cru property adopts Carbon. Avoid
`cru-`: Cornerstone already serves FamilyLife and will serve more brands.

Element names match their Figma component names.

## 2. Variant axes

Two attributes, used consistently across every component:

| Attribute | Values | Meaning |
| --- | --- | --- |
| `variant` | `information` `success` `warning` `danger` | Semantic colour |
| `appearance` | `filled` `subtle` `neutral` | Visual treatment |

Each component supports the subset that applies — Alert takes `filled` and `subtle`; Toast takes `neutral`
and `filled`.

**Figma's axes are named `Type` and `Style`. Neither maps through.** `style` is a global HTML attribute, so
a `style` property would shadow `HTMLElement.style`. `type` is legal but carries baggage from `<input>` and
`<button>`. The rename to `variant` / `appearance` is deliberate and matches Shoelace.

**Use `danger`, never `error`** — it matches the token layer (`_sys/color/danger/*`) and covers destructive
actions, which "error" doesn't. Figma is being renamed to match.

## 3. Content comes in through slots

The default slot is the body. Named slots: `title`, `icon`, `actions`.

```html
<cs-alert variant="success" appearance="filled">
  <span slot="title">Changes saved</span>
  Saved to <a href="/versions/3">version 3</a>.
  <cs-button slot="actions">Undo</cs-button>
</cs-alert>
```

Body copy regularly needs inline markup — a link to the failing record, an emphasised value — so it can't
be an attribute. Everything else follows the same mechanism so there's one thing to learn and no
precedence rules when both an attribute and a slot are supplied.

## 4. Events

Prefixed, with `after` variants that fire once any transition completes:

| Event | Cancelable | Fires |
| --- | --- | --- |
| `cs-show` | yes | before becoming visible |
| `cs-after-show` | no | after the show transition ends |
| `cs-hide` | **yes** | before hiding — `preventDefault()` to interpose a confirmation |
| `cs-after-hide` | no | after the hide transition ends |

Prefixing avoids collisions (`close` and `cancel` are real events on `<dialog>`) and makes the React
wrapper mapping mechanical: `cs-after-hide` → `onCsAfterHide`, no lookup table.

The `after` variants exist because a toast stack needs to know when to remove an element and reflow —
without them, consumers resort to `setTimeout` and guess.

## 5. Styling and the shadow boundary

Components use shadow DOM. Two things cross the boundary:

**Custom properties — the primary API.** They inherit through shadow roots, so the token layer already
themes every component with no JS. A consumer sets `data-brand` / `data-theme` on an ancestor and
everything follows.

**`::part()` — the exception.** Minimal by design:

| Part | Element |
| --- | --- |
| `base` | outer container |
| `close-button` | dismiss control |

Nothing else is exposed. These two are the only elements guaranteed to exist for a component's entire
life, so promising them costs almost no freedom to refactor. Promising `title` or `body` would freeze how
text is grouped — exactly what layout refactors change.

**Put outer chrome on `:host`.** Document rules override `:host` rules, so consumers get geometry control
with plain selectors and no part at all:

```css
cs-alert { margin-block: 0; border-radius: 0; max-width: 48rem; }
```

**New parts are request-driven.** Adding one is non-breaking, so there's no cost to waiting for a real
need. If two apps request the same override, treat that as evidence the *design* is wrong rather than that
a part is missing, and take it back to Figma.

## 6. Server rendering

Custom elements don't upgrade until client JS runs, so slotted text would otherwise appear unstyled before
the shadow chrome exists. Ship this guard:

```css
cs-alert:not(:defined), cs-toast:not(:defined) { visibility: hidden; }
```

Reserve space where layout shift matters. `mpdx-react` is Next 15, so this applies there.

Declarative Shadow DOM would remove the gap entirely and can be added later without any API change.

## 7. Accessibility

**`live` controls announcement**, not `variant`:

| Value | Behaviour |
| --- | --- |
| `off` | not a live region — **Alert's default** |
| `polite` | announced when the user is idle — **Toast's default** |
| `assertive` | interrupts |

Politeness is a **timing** concern, not a colour one. A `variant="danger"` Alert present in the server
response is ordinary page content; the same Alert injected after a failed save should assert.
**`role="alert"` on initial page load is an antipattern** — there's nothing to interrupt.

Toast is always a dynamic insertion, so `toast()` upgrades `danger` to `assertive` automatically.

## 8. Built-in strings

Components own exactly one user-facing string today: the dismiss button's accessible name. Expose it as an
attribute with an English default:

```html
<cs-alert dismissible dismiss-label="Cerrar">
```

No localisation registry yet — one string doesn't justify a subsystem. Adding one later changes where the
default comes from, not the API.

## 9. Sizing

Figma's 480px Alert and 420px Toast are **canvas artifacts, not specifications**. Components are fluid,
with a sensible `max-width`. Consumers constrain width on the host.

## 10. Icons

Status icons are inlined as `icon` slot fallback content, so components render correctly with no consumer
setup. `no-icon` suppresses them; slotting overrides them.

```html
<cs-alert variant="success">…</cs-alert>              <!-- default ✓ icon -->
<cs-alert variant="success" no-icon>…</cs-alert>
<cs-alert variant="success"><svg slot="icon">…</svg>…</cs-alert>
```

The interim glyphs are Material Symbols Outlined (Apache 2.0), matching Figma. When `<cs-icon>` ships they
become `<cs-icon>` instances — the slot contract doesn't change, though rendered glyphs may shift slightly.

## 11. Framework consumption

**React 17 / 18 — wrappers are required.** React only gained proper custom-element support in 19. Below
that it sets attributes rather than properties and won't bind custom events, so import from the wrapper
entry point:

```jsx
import { Alert } from '@cruglobal/cornerstone-components/react';
<Alert variant="danger" onCsAfterHide={remove}>Could not save.</Alert>
```

`mpdx-react` is on React 18.2, `give-web` on 17.

**Rails — no wrapper, no build step.** Pin via `importmap-rails` and use the element directly in ERB.

**WordPress —** enqueue as a module and use the element in themes or block templates. Wiring tokens into
the block editor's `theme.json` is separate, deferred work.

---

[Lit]: https://lit.dev
