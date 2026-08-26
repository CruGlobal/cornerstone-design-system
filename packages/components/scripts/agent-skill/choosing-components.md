# Choosing the right component

**Full documentation:** https://cruglobal.github.io/cornerstone-design-system/components

When you reach for a Cornerstone component, start from **user intent** — what you need the user to do
or see — not from the component name. Most agent mistakes here aren't API misuse; they're picking the
wrong component for the job (using `<cs-dropdown>` when the user really needs `<cs-select>`, or hand-rolling
a callout out of `<div>`s when `<cs-callout>` exists). Walk the tree below to the leaf that matches your
intent, then check that component's individual reference for its API.

The major decisions:

- **Pick one from a set** — radio group, select, switch, slider, rating, color picker
- **Pick many** — multiple checkboxes, multi-select
- **Trigger an action** — button, copy button, dropdown menu, button group, tabs
- **Show feedback or status** — callout, toast, badge, spinner, progress, skeleton, tooltip, popover
- **Capture input** — input, number input, textarea
- **Show data** — format helpers, relative time, QR code, comparison, carousel, avatar
- **Navigate or organize** — page, breadcrumb, tabs, details, tree, divider, card, tag, badge
- **Overlay or float** — dialog, drawer, tooltip, popover, dropdown

---

## Pick one from a set

The user is choosing one value from a set of options.

| You need…                                     | Use                                  |
| --------------------------------------------- | ------------------------------------ |
| 2–5 visible options, all related              | `<cs-radio-group>` with `<cs-radio>` |
| More options, dropdown form field             | `<cs-select>` with `<cs-option>`     |
| Yes / no toggle that takes effect immediately | `<cs-switch>`                        |
| Yes / no in a form (submitted later)          | `<cs-checkbox>`                      |
| A numeric value within a continuous range     | `<cs-slider>`                        |
| A star rating                                 | `<cs-rating>`                        |
| A color                                       | `<cs-color-picker>`                  |

**`<cs-dropdown>` is not for picking a value.** `<cs-dropdown>` is for a **menu of actions** (think: a
"More…" button that opens a list of commands). For picking a value from a list, use `<cs-select>`. This
is the single most common confusion in the catalog.

**Switch vs. checkbox.** Switch = instant-apply setting ("notifications on / off"). Checkbox = form
field submitted later ("I accept the terms"). If toggling the control should immediately change
something, it's a switch.

---

## Pick many

Multi-selection from a set.

| You need…                                 | Use                                            |
| ----------------------------------------- | ---------------------------------------------- |
| A small set of independent options        | Multiple `<cs-checkbox>` elements              |
| Many options in a multi-select dropdown   | `<cs-select multiple>`                         |
| Removable chip / tag selections           | `<cs-tag with-remove>` (manage your own state) |

---

## Trigger an action

The user clicks or taps to make something happen.

| You need…                                    | Use                                                 |
| -------------------------------------------- | --------------------------------------------------- |
| Primary call-to-action                       | `<cs-button variant="brand">`                       |
| Secondary action                             | `<cs-button appearance="plain">`                    |
| Destructive action                           | `<cs-button variant="danger">`                      |
| Copy text to clipboard                       | `<cs-copy-button>`                                  |
| A row of related buttons (segmented choices) | `<cs-button-group>` with `<cs-button>` children     |
| Open a menu of commands                      | `<cs-dropdown>` with `<cs-dropdown-item>`           |
| Switch between sections inline               | `<cs-tab-group>` with `<cs-tab>` + `<cs-tab-panel>` |

**Single primary action per view.** If a view has more than one `variant="brand"` button, pick the most
important one and demote the rest to `appearance="plain"` or `appearance="outlined"`. A wall of brand
buttons reads as no primary action at all.

---

## Show feedback or status

Non-interactive output telling the user something.

| You need…                                                  | Use                                                                       |
| ---------------------------------------------------------- | ------------------------------------------------------------------------- |
| Persistent inline message (info, success, warning, danger) | `<cs-callout>` with a `variant`                                           |
| Brief ephemeral notification                               | `<cs-toast-item>` inside `<cs-toast>`                           |
| Compact status indicator (number, "NEW", state)            | `<cs-badge>`                                                              |
| Loading, duration unknown                                  | `<cs-spinner>`                                                            |
| Loading, with progress                                     | `<cs-progress-bar>` (horizontal) or `<cs-progress-ring>` (compact circle) |
| Placeholder while content loads                            | `<cs-skeleton>`                                                           |
| Hover hint on a target                                     | `<cs-tooltip>`                                                            |
| Larger contextual popup with rich content                  | `<cs-popover>`                                                            |

**Callout vs. toast.** Callout = persistent, sits in the layout (e.g. a form error, an info panel). Toast
= ephemeral, floats over the layout briefly (e.g. "Saved!" after a successful save). If the user might
miss it on a glance, it's a callout.

**Tooltip vs. popover.** Tooltip = text-only hint, automatic on hover / focus. Popover = arbitrary rich
content, click to open. If you need anything beyond a short string, it's a popover.

---

## Capture input

The user types or uploads.

| You need…                                      | Use                                                          |
| ---------------------------------------------- | ------------------------------------------------------------ |
| Single-line text (incl. email, password, etc.) | `<cs-input>` with the appropriate `type`                     |
| A number with stepper buttons                  | `<cs-number-input>` (richer than `<cs-input type="number">`) |
| Multi-line text                                | `<cs-textarea>`                                              |
| A color value                                  | `<cs-color-picker>`                                          |

Use a `<form>` and the [form controls reference](form-controls.md) for validation patterns and form
association behavior.

---

## Show data

Read-only data display.

| You need…                                         | Use                                                                                      |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Format a number with locale-aware rules           | `<cs-format-number>`                                                                     |
| Format a date with locale-aware rules             | `<cs-format-date>`                                                                       |
| Format a byte count                               | `<cs-format-bytes>`                                                                      |
| Show a time as "5 minutes ago" (relative, live)   | `<cs-relative-time>`                                                                     |
| A QR code                                         | `<cs-qr-code>`                                                                           |
| Side-by-side image comparison                     | `<cs-comparison>`                                                                        |
| A carousel / slideshow                            | `<cs-carousel>` with `<cs-carousel-item>`                                                |
| An iframe with zoom controls                      | `<cs-zoomable-frame>`                                                                    |
| A user avatar                                     | `<cs-avatar>`                                                                            |
| An animation                                      | `<cs-animation>`                                                                         |
| Markdown content rendered inline                  | `<cs-markdown>`                                                                          |
| Include external HTML                             | `<cs-include>`                                                                           |

---

## Navigate or organize

Structuring content or moving between views.

| You need…                                            | Use                                                 |
| ---------------------------------------------------- | --------------------------------------------------- |
| The page-level frame (header, sidebar, main, footer) | `<cs-page>` — see the `cornerstone-design` skill     |
| Breadcrumb trail                                     | `<cs-breadcrumb>` with `<cs-breadcrumb-item>`       |
| Switch between sections inline                       | `<cs-tab-group>` with `<cs-tab>` + `<cs-tab-panel>` |
| Expandable details disclosure                        | `<cs-details>`                                      |
| Tree navigation (hierarchical lists)                 | `<cs-tree>` with `<cs-tree-item>`                   |
| Visual separator between sections                    | `<cs-divider>`                                      |
| Group of related content as a card                   | `<cs-card>`                                         |
| Inline label (interactive)                           | `<cs-tag>` — removable, supports actions            |
| Inline status indicator (non-interactive)            | `<cs-badge>` — small status pill                    |

**Tag vs. badge.** Tag = interactive label (filter chip, removable selection, clickable category). Badge
= small status indicator (count, "NEW", state). If the user can interact with it, it's a tag.

---

## Overlay or float

Content that sits above the page.

| You need…                                      | Use                                       |
| ---------------------------------------------- | ----------------------------------------- |
| Modal dialog (blocks page)                     | `<cs-dialog>`                             |
| Side panel (non-blocking)                      | `<cs-drawer>`                             |
| Floating tooltip (hover / focus)               | `<cs-tooltip>`                            |
| Floating popover (click to open, rich content) | `<cs-popover>`                            |
| Dropdown menu of actions                       | `<cs-dropdown>` with `<cs-dropdown-item>` |

**Dialog vs. drawer.** Dialog = blocks the page (confirmations, focused tasks). Drawer = slides in
alongside (settings panels, secondary nav). If the user must respond before continuing, it's a dialog.

---

## When the right component doesn't exist

If nothing in the catalog matches what you need, before hand-rolling check:

- **Is it really a component, or is it a section pattern?** Sections compose from existing components and
  utility classes. See the `cornerstone-design` skill's `patterns.md` for ready-made section recipes.
- **Could the layout utilities solve it?** `cs-stack`, `cs-cluster`, `cs-grid`, `cs-flank`, `cs-split`,
  `cs-frame` cover most layout needs without a component.
- **Could a `<cs-card>`, `<cs-callout>`, or `<cs-tag>` plus a few utility classes get you there?**

When you genuinely need custom CSS to extend the system, follow the **Custom CSS playbook** in the
`cornerstone-design` skill's `composition.md` (semantic tokens, `*-on-*` pairings for contrast,
`loud` / `normal` / `quiet` as a contrast lever) so your additions stay themed, dark-mode-safe, and
accessible.

---

## When nothing fits

Cornerstone Components ships 70 components, and no catalog covers every need. When none of the tables
above answer the question, compose from primitives rather than reaching for a component that does not
exist — the layout utilities (`cs-stack`, `cs-cluster`, `cs-grid`) plus a `<cs-card>` or `<cs-callout>`
cover most gaps. See `composition.md` in the `cornerstone-design` skill.