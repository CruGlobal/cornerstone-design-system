---
description: Audit UI against Cornerstone design standards and UX heuristics.
allowed-tools:
  - Read
  - Bash(find:*)
  - Bash(grep:*)
  - Bash(ls:*)
  - mcp__plugin_figma_figma__get_screenshot
  - mcp__plugin_figma_figma__get_design_context
---

# Design Review

Goal: produce a structured audit of the provided UI against three frameworks — Cornerstone token compliance, Nielsen's 10 usability heuristics, and WCAG 2.2 AA accessibility guidelines — with actionable, prioritized findings.

## What to accept as input (`$ARGUMENTS`)

Accept any of the following; adapt gracefully if multiple are provided:

- **File path(s)**: One or more component files (HTML, JSX, TSX, ERB, PHP, CSS, SCSS). Read them directly.
- **Directory or repo path**: A folder. Glob it for UI files (HTML, JSX, TSX, ERB, PHP, CSS, SCSS) and review the set. For a large repo, scope to the most relevant components and state which files you covered.
- **Figma URL**: A `figma.com` frame or component URL. Use `get_screenshot` and `get_design_context` to inspect it visually.
- **Screenshot path**: A local image path. Read it as an image.
- **Description**: A written description of the UI if no artifact is provided. Ask a brief clarifying question if critical details are missing (e.g. brand, interaction state, target user).
- **No argument**: Ask the user what they'd like reviewed before proceeding.

## Step 1 — Gather context

Before reviewing, collect:

1. **The UI artifact** — read any provided files or fetch any Figma/image content.
2. **The token reference** — grep for CSS custom property usage (`var(--`) in the provided files and note which tokens are used, if any.
3. **The brand/theme** — infer from `data-brand` / `data-theme` attributes, filename conventions (`cru-`, `fl-`), or ask if unclear.

Do not make assumptions about correctness before examining the artifact.

## Step 2 — Run three review passes

Work through each pass in order. Document findings as you go — do not summarize until all three passes are complete.

---

### Pass 1: Cornerstone Token Compliance

Check whether the UI is using the design system correctly.

**What to look for in code:**

- **Hardcoded colors** — any hex, RGB, HSL, or named color value that is not a Cornerstone CSS variable is a finding. Flag it and suggest the nearest `--sys-color-*` token.
- **Hardcoded spacing/sizing** — arbitrary `px`/`rem` values for spacing, border-radius, font-size, or line-height that should instead reference `--sys-number-*` or `--cmp-*` tokens.
- **Wrong token layer** — using `--ref-*` tokens directly in component code (they are primitives; only `--sys-*` and `--cmp-*` should appear in product code).
- **`--cmp-*` → `--ref-*` bypass** — component tokens must alias `--sys-*`, not `--ref-*` directly.
- **Missing `data-brand` / `data-theme`** — if the component relies on sys tokens but no root attributes are set, the variables will be unresolved.
- **Icon usage** — check that icons use `material-symbols-sharp` class and a valid icon name, or a Cru ministry SVG from `libraries/cru-icons/`.

**What to look for in designs (Figma/screenshot):**

- Colors that do not appear to match the active brand palette (the `sys` color tokens for the file's `data-brand`).
- Typography styles that deviate from system type scales.
- Spacing that appears inconsistent or arbitrary relative to a grid.

Severity scale for this pass:
- **Blocker**: raw color literals replacing semantic tokens, wrong token layer
- **Major**: hardcoded spacing/sizing values, missing brand/theme attributes
- **Minor**: inconsistent use of `--cmp-*` vs `--sys-*` where either would work
- **Suggestion**: token that exists but is slightly better fit than what was used

---

### Pass 2: Nielsen's 10 Usability Heuristics

Evaluate the UI against each heuristic. Only report heuristics where there is a real finding — do not force a finding for each.

| # | Heuristic | What to check |
| --- | --- | --- |
| 1 | Visibility of system status | Does the UI communicate loading, success, error, or in-progress states? |
| 2 | Match between system and real world | Does language match user vocabulary, not internal/technical jargon? |
| 3 | User control and freedom | Are undo, cancel, and exit paths clearly available? |
| 4 | Consistency and standards | Are controls, labels, and patterns consistent with platform conventions? |
| 5 | Error prevention | Are destructive actions guarded? Are form fields validated before submission? |
| 6 | Recognition over recall | Are options visible rather than requiring the user to remember them? |
| 7 | Flexibility and efficiency | Are shortcuts or power-user paths available alongside defaults? |
| 8 | Aesthetic and minimalist design | Is the UI free of irrelevant or redundant information? |
| 9 | Help users recognize, diagnose, and recover from errors | Are error messages plain-language, precise, and constructive? |
| 10 | Help and documentation | Is contextual help available where tasks are non-obvious? |

Severity scale for this pass:
- **Blocker**: prevents task completion or causes user error with no recovery
- **Major**: significantly hinders usability or breaks user expectations
- **Minor**: noticeable friction but workaround exists
- **Suggestion**: polish or optimization opportunity

---

### Pass 3: WCAG 2.2 AA Accessibility

Assess against the four WCAG principles: Perceivable, Operable, Understandable, Robust.

**Key criteria to check (non-exhaustive):**

- **Color contrast** — text on background must meet 4.5:1 (normal text) or 3:1 (large text / UI components). If token values are known, compute or estimate contrast ratios. If only visual, flag visually low-contrast combinations.
- **Color as only conveyor of information** — status, error, and state must not rely on color alone; pair with an icon or text label.
- **Keyboard accessibility** — interactive elements must be reachable and operable via keyboard. Verify logical tab order in code.
- **Focus indicators** — focusable elements must have a visible focus ring; check that `:focus-visible` is not suppressed without replacement.
- **Image alt text** — all `<img>` elements must have descriptive `alt` attributes (or `alt=""` for decorative images). Icon-only buttons must have `aria-label`.
- **Form labels** — every input must have an associated `<label>` or `aria-label`/`aria-labelledby`.
- **Touch target size** — interactive targets must be at least 24×24 CSS px (WCAG 2.5.8 Target Size (Minimum), AA); 44×44 is recommended for primary touch controls.
- **Motion / animation** — if animation is present, check for `prefers-reduced-motion` media query support.
- **Semantic HTML** — headings form a logical hierarchy; landmarks (`main`, `nav`, `aside`) are used where appropriate; buttons are `<button>`, not `<div onClick>`.
- **Focus not obscured** — when an element receives focus, it must not be entirely hidden by sticky headers, footers, or overlays (WCAG 2.4.11, AA, new in 2.2).
- **Dragging alternatives** — any drag-based interaction (reorder, slider, drag-and-drop) must offer a single-pointer alternative such as tap/click (WCAG 2.5.7, AA, new in 2.2).
- **Accessible authentication** — login/auth flows must not rely on a cognitive function test (e.g. solving a puzzle, transcribing) without an accessible alternative (WCAG 3.3.8, AA, new in 2.2).
- **Consistent help & redundant entry** — if a help mechanism exists it appears in a consistent location across pages (WCAG 3.2.6); previously entered information is not re-requested unnecessarily (WCAG 3.3.7). Both AA, new in 2.2.

Severity scale for this pass:
- **Blocker**: fails a Level A or Level AA criterion; creates a barrier for assistive technology users
- **Major**: borderline contrast ratio, missing labels on key interactive elements
- **Minor**: suboptimal semantics that assistive tech can partially work around
- **Suggestion**: best practice beyond AA that significantly improves experience

---

## Step 3 — Output the report

Format the findings as a structured report. Omit sections that have zero findings.

```
## Design Review: <component or screen name>

### Summary
<2–3 sentence overall impression. Note what's working well before issues.>

---

### Cornerstone Token Compliance

**Blockers**
- [finding] — [file:line if applicable] — Suggested fix: `var(--sys-color-primary)` instead of `#1a73e8`

**Major**
- ...

**Minor / Suggestions**
- ...

---

### Usability (Nielsen's Heuristics)

**Blockers**
- [Heuristic N — name]: [finding and recommendation]

**Major / Minor / Suggestions**
- ...

---

### Accessibility (WCAG 2.2 AA)

**Blockers**
- [Criterion 1.4.3 — Contrast]: [finding]. Measured ratio: X:1, required: 4.5:1. Fix: use `--sys-color-on-surface` on `--sys-color-surface`.

**Major / Minor / Suggestions**
- ...

---

### What's Working Well
- <positive observations — reinforce good patterns>
```

## Step 4 — Offer next steps

After the report, offer:
1. Apply the Cornerstone token fixes directly to the provided files (if code was supplied)
2. Generate a corrected version of a specific section
3. Re-run the review after fixes are applied
