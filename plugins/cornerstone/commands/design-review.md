---
description: Audit UI against Cornerstone design standards and UX heuristics — configurable passes, scope, output, and severity.
allowed-tools:
  - Read
  - Glob
  - Write
  - Bash(find:*)
  - Bash(grep:*)
  - Bash(ls:*)
  - Bash(git status:*)
  - Bash(git diff:*)
  - Bash(bin/rails ui_audit:*)
  - Bash(bundle exec rails ui_audit:*)
  - Bash(mise exec*)
  - mcp__plugin_figma_figma__get_screenshot
  - mcp__plugin_figma_figma__get_design_context
---

# Design Review

Goal: produce a structured audit of the provided UI against three frameworks — Cornerstone token
compliance, Nielsen's 10 usability heuristics, and WCAG 2.2 AA accessibility — with actionable,
prioritized findings.

The review is **configurable** via the flags below: pick which passes run, what to review, how the
findings are delivered, and the minimum severity to surface. Defaults reproduce the classic
full-report behavior, so `/design-review <path>` with no flags Just Works.

## Options (`$ARGUMENTS`)

`$ARGUMENTS` may contain an **artifact reference** (a path, Figma URL, or screenshot path) and/or any
of the flags below. Parse the flags, apply the defaults shown for anything omitted, and only ask the
user when a default genuinely can't be inferred.

| Flag | Values | Default | Effect |
| --- | --- | --- | --- |
| `--passes` | `tokens`, `heuristics`, `wcag`, `all` (comma-separated) | `all` | Which Step 2 review passes to run. |
| `--scope` | `diff`, a path/glob, a Figma URL, or a screenshot path | inferred (see below) | What to review. |
| `--output` | `report`, `overlay`, `apply` | `report` | What to do with the findings (Step 3). |
| `--severity` | `blocker`, `major`, `minor`, `suggestion` | `suggestion` | Minimum severity to report; lower-ranked findings are dropped. |

**Scope inference when `--scope` is omitted:** if the arguments contain a path / Figma URL /
screenshot, review that. Otherwise, if the working directory is a git repo with uncommitted UI
changes, default to `diff`. Otherwise ask the user what to review before proceeding.

Severity ordering (high → low): `blocker` > `major` > `minor` > `suggestion`.

## Step 1 — Resolve scope & gather context

Resolve the artifact set from `--scope` (or the inference above), then collect context. Do not make
assumptions about correctness before examining the artifact.

**By scope kind:**

- **`diff`** — run `git status --short` + `git diff` and collect changed UI files
  (`*.html.erb`, `*.jsx`, `*.tsx`, `*.vue`, `*.php`, `*.css`, `*.scss`). For Rails ERB views, map each
  changed `app/views/**/<controller>/<action>.html.erb` to its `controller#action`. If no UI files
  changed, say so and stop.
- **File path(s)** — one or more component files. Read them directly.
- **Directory or repo path** — glob it for UI files and review the set. For a large repo, scope to the
  most relevant components and state which files you covered.
- **Figma URL** — a `figma.com` frame or component URL. Use `get_screenshot` and `get_design_context`
  to inspect it visually.
- **Screenshot path** — a local image path. Read it as an image.
- **No artifact and not a git repo** — ask the user what they'd like reviewed.

**Then collect, for every scope:**

1. **The token reference** — grep for CSS custom property usage (`var(--`) in the files and note which
   tokens are used, if any.
2. **The brand/theme** — infer from `data-brand` / `data-theme` attributes, filename conventions
   (`cru-`, `fl-`), or ask if unclear.

## Step 2 — Run the selected review passes

Run **only** the passes named in `--passes` (default `all`), in the order below. Document findings as
you go — do not summarize until every selected pass is complete. Tag each finding with a severity
(`blocker` / `major` / `minor` / `suggestion`) so Step 3 can filter it.

---

### Pass 1: Cornerstone Token Compliance — run when `--passes` includes `tokens` (or `all`)

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

### Pass 2: Nielsen's 10 Usability Heuristics — run when `--passes` includes `heuristics` (or `all`)

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

### Pass 3: WCAG 2.2 AA Accessibility — run when `--passes` includes `wcag` (or `all`)

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

## Step 3 — Filter by severity, then deliver

First, **drop every finding ranked below `--severity`** (default `suggestion` keeps everything). Then
deliver according to `--output`.

### `--output report` (default) — structured report

Format the surviving findings as a structured report. Omit sections (and severity buckets) that have
zero findings, and omit passes that weren't run.

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

### `--output overlay` — sync findings into the in-app audit overlay

Push the findings into a project's in-app design-audit overlay so each one shows up on the actual
screen, instead of (or in addition to) printing a report. **This mode is capability-gated and only
applies to rendered Rails/ERB views** — it needs each finding mapped to a `controller#action` and a
DOM selector.

1. **Detect the capability.** Check for the sync task:
   `ls lib/tasks/ui_audit.rake` (or `<rails> -T ui_audit`). If it's absent, tell the user this project
   has no audit-overlay sync wired up and fall back to `--output report`. If the scope produced no
   `controller#action`-mapped views (e.g. a Figma URL or React files), also fall back to `report`.
2. **Shape the payload.** Build a JSON object the `ui_audit:add` task understands:

   ```json
   {
     "source": "cornerstone-design-review",
     "reviewed": ["roles#index", "roles#edit"],
     "findings": [
       { "controller_action": "roles#index", "selector": ".page-header .btn-primary",
         "severity": "major", "message": "Hardcoded #1a73e8 — use var(--sys-color-primary)." }
     ]
   }
   ```

   - `source` — keep it stable (`cornerstone-design-review`) so a re-run self-heals **only** its own
     findings and leaves findings from other sources on the same view intact.
   - `reviewed` — every `controller#action` you examined, so fixed findings drop out on the next run.
   - `selector` — a best-effort CSS selector for the offending element on the rendered page (an id, a
     unique class, or a representative selector derived from the ERB).
   - `severity` / `message` — the finding's severity and a concise "problem → fix" message.
3. **Sync.** Write the payload to `tmp/ui_audit_payload.json` and run (use the project's usual Rails
   invocation):

   ```
   bin/rails "ui_audit:add[tmp/ui_audit_payload.json]"
   ```

   This replaces this source's findings for each reviewed `controller#action` in
   `docs/ui_audit_findings.json` (read by the overlay), so the toggle reflects it immediately.
4. **Confirm & report.** Run `<rails> ui_audit:list` to confirm the per-view counts, show the merged
   findings table (view · severity · fix), and remind the developer to open a flagged page and click
   **⚑ Audit** (bottom-right) to see the findings in place. This mode reviews + visualizes; it does
   **not** edit app code.

### `--output apply` — apply the fixes

Only valid when the scope is local source files (not Figma/screenshot). Apply the surviving findings'
fixes directly — primarily the unambiguous Cornerstone token swaps, plus any other safe, mechanical
corrections (missing `alt`, `aria-label`, label associations). Leave judgment-heavy heuristic findings
as report notes rather than guessing. Afterward, show a short diff summary and offer to re-run the
review (`--output report`) to confirm the fixes resolved the findings.

## Step 4 — Offer next steps

After delivering, offer the follow-ups that fit the output mode used:
1. Apply the Cornerstone token fixes directly to the provided files (if code was supplied and you ran `report`).
2. Generate a corrected version of a specific section.
3. Re-run the review after fixes are applied — or re-run scoped to a single pass (e.g. `--passes wcag`).
