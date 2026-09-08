# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

Paths in this file are relative to the repo root.

## Before exploring, read these

- **`CONTEXT-MAP.md`** at the repo root — it points at one `CONTEXT.md` per package. Read each one relevant
  to the topic.
- **`packages/<name>/CONTEXT.md`** — the glossary for that package's own domain.
- **`docs/adr/`** — system-wide decisions, the ones that hold across packages. Read the ADRs that touch the
  area you're about to work in.
- **`packages/<name>/docs/adr/`** — decisions scoped to a single package. Check these too whenever your work
  lands inside that package.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating
them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`)
creates them lazily when terms or decisions actually get resolved.

## File structure

This is a multi-context repo — an npm workspace whose packages carry genuinely different domains. The token
pipeline speaks of aliasing layers, brands and modes; the component library speaks of appearance, variants and
shadow DOM; the docs site speaks of Starlight content collections. Those vocabularies are worth keeping apart,
and so are the decisions made in each.

```
/
├── CONTEXT-MAP.md
├── docs/adr/                          ← system-wide decisions
└── packages/
    ├── tokens/
    │   ├── CONTEXT.md
    │   └── docs/adr/                  ← token-pipeline decisions
    ├── components/
    │   ├── CONTEXT.md
    │   └── docs/adr/                  ← component-library decisions
    ├── docs/
    │   └── CONTEXT.md
    └── build-tools/
        └── CONTEXT.md
```

A package gets its own `docs/adr/` only once it has a decision to record — an empty directory is noise. The
root `docs/adr/` is for decisions no single package owns: the three-layer token architecture, the release
flow, the plugin tiers.

## Which context a decision belongs to

Ask who would be wrong if the decision were reversed. A decision that changes `_ref`/`_sys`/`_cmp` aliasing is
`packages/tokens`'. One that settles `live` versus `role="alert"` is `packages/components`'. One that changes
how every package is versioned and published is the root's. When a decision genuinely spans two packages, it
belongs at the root — duplicating it into both is how the two copies drift.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name),
use the term as defined in the relevant `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal — either you're inventing language the
project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders) — but worth reopening because…_
