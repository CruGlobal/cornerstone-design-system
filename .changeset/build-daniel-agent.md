---
"@cruglobal/cornerstone-design-system": minor
---

Add Daniel, the front-door design-system engineer persona for the `cornerstone` plugin, wired in as the plugin's default agent. Adds `plugins/cornerstone/docs/design-system-principles.md` as a grounding reference for Daniel and future specialist personas.

Daniel's consumer-context refusals are scoped to Cornerstone's own release, not to the `npm run version` / `npm run release` script names, so a consumer project's identically named scripts are left alone. The skills tier is gated on tracker ownership rather than on the size of the request, with `ask` and `prototype` available in either context. Hand-off and escalation are distinguished explicitly, and the escalation path now routes through the `triage` skill.
