---
"@cruglobal/cornerstone-design-system": patch
---

Make the `/design-review` command configurable via `$ARGUMENTS` flags: `--passes` (tokens/heuristics/wcag/all), `--scope` (diff/path/Figma/screenshot), `--output` (report/overlay/apply), and `--severity` (minimum severity to surface). Defaults reproduce the prior full-report behavior. `--output overlay` is capability-gated and syncs findings into a project's in-app audit overlay (via `ui_audit:add`) when available, falling back to a report otherwise.
