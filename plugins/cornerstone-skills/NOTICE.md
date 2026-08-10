# Notice

This plugin is a fork of [mattpocock/skills](https://github.com/mattpocock/skills) by
Matt Pocock, forked at [v1.2.3](https://github.com/mattpocock/skills/releases/tag/v1.2.3)
under the MIT License (see `LICENSE`, preserved unmodified from upstream).

## Why a fork, not a dependency

Cornerstone originally depended on `mattpocock-skills` directly (see
[issue #67](https://github.com/CruGlobal/cornerstone-design-system/issues/67)). Forking
instead — see [issue #72](https://github.com/CruGlobal/cornerstone-design-system/issues/72) —
trades automatic upstream updates for the ability to customize these skills freely, including
renaming or rewriting individual ones to fit Cornerstone's own personas.

## Scope of the fork

All 25 skills shipped by upstream's `.claude-plugin/plugin.json` at the time of forking
(`skills/engineering/*` and `skills/productivity/*`). Upstream's `skills/misc/`,
`skills/in-progress/`, and `skills/deprecated/` directories were **not** forked — none of
those ship in the installable plugin, matching the scope #67 already established.

## Ongoing relationship to upstream

This is a one-time fork with no ongoing sync commitment. Improvements noticed in the
upstream repo later may be brought in surgically, by choice — there is no standing policy
to track or merge upstream changes automatically.

## Status

As forked, unreviewed. A skill-by-skill review (fit within Cornerstone's personas, which
agent(s) use each one, possible renames) is separate, later work — see #72.
