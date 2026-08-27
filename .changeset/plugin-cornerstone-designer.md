---
"@cruglobal/cornerstone-design-system": minor
---

Add the `cornerstone-designer` plugin — the designer tier from the persona architecture spec (#67) — with the `see-it-in-figma` prototyping skill (#70) as its content.

The manifest is a near-copy of `cornerstone-dev`'s, minus the engineering skills: `dependencies` pulls in `cornerstone@cru` for the front door and `figma@claude-plugins-official` for the Figma tooling. No new marketplace field is needed — `allowCrossMarketplaceDependenciesOn: ["claude-plugins-official"]` already landed with `cornerstone-dev`, and cross-marketplace dependencies are blocked at install rather than warned about without it.

There is deliberately **no `skills` array** in the manifest, unlike `cornerstone-skills`. That plugin needs one because its skills sit two levels deep (`skills/engineering/<name>`), which the default scan doesn't reach. This one's skill is at the conventional `skills/see-it-in-figma/`, and the `skills` field *adds to* the always-scanned `skills/` directory rather than replacing it, so declaring the path would register the same skill twice.

`see-it-in-figma` is Cornerstone-authored rather than pulled from a dependency, for the reason #67 moved the contributor personas out of the base tier: a designer install shouldn't carry 25 general engineering skills to satisfy one capability. It is Figma-only and never produces code — a prototype that should become real hands off to Joseph, and says so and stops if he isn't installed. The skill teaches binding to the `Component` and `System` collections instead of raw values (of 87 `_sys.color` roles, only three resolve identically in all four modes), building one frame per `System` mode because brand and theme ride a single collection and can't be toggled independently, and the paint-seeding trap that makes an already-bound layer render the dummy colour you passed. It refuses to create variables, because `/pull-tokens` is namespace-driven and would publish an invented `_cmp/*` variable as a real token. Its deferred list (page-level composition, motion, brand ramps) carries the trigger that would revisit each one.
