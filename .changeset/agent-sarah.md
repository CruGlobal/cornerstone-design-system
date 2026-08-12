---
"@cruglobal/cornerstone-design-system": minor
---

Add Sarah, the tokens-and-theming persona, to the `cornerstone-dev` plugin — the second of the five personas from the architecture spec, built per #64 and #74.

Sarah owns every write to `tokens/*.json`, the `/pull-tokens` sync tooling itself (including keeping `scripts/token-hash.mjs` byte-identical to the Figma-side discovery snippet), and the hand-authored primitives Figma can't represent. Sync stays pull-only: Figma originates variables and Sarah never writes back to it, escalating a suggested fix instead when the defect is Figma's own. Hand-authored `_ref`/`_sys` changes go through a CODEOWNERS-enforced approval gate whether Sarah initiated them or Joseph and Esther requested them.

Resolves #64's open question about hand-authored token migration with a trigger rather than a standing policy: when a discovery manifest reports a Figma subtree key colliding with an excluded hand-authored key, that collision is the signal Figma gained native support for the category, and it escalates as a migration proposal for sign-off. Whether migration should ever become proactive stays open.
