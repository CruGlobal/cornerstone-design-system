# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

Paths in this file are relative to the repo root.

## Before exploring, read these

- **`GLOSSARY-MAP.md`** at the repo root: it points at one `GLOSSARY.md` per package. Read each one relevant
  to the topic.
- **`packages/<name>/GLOSSARY.md`**: the glossary for that package's own domain.
- **`docs/standards/`**: the rules, one file per area, each saying which paths it applies to. Read the ones
  that apply to the files you're about to work in.

If any of these files don't exist, **proceed silently**. The `/domain-modeling` skill writes a glossary
lazily, when a term actually gets resolved.

## Decisions live in issues

A decision is a **resolved GitHub issue**: the question in its body, the answer in its resolution comment,
and a one-line gist in its map's Decisions so far. That issue is the only record of the decision.

- **The rule a decision sets** goes in the `docs/standards/` file it governs, linking the issue that decided
  it. The standard holds _what_; the issue holds _why_ and what was rejected.
- **To learn why a rule exists**, follow its link and read the resolution comment
  (`gh issue view <n> --comments`).
- **To check whether an area is already decided**, read the Decisions so far of the maps that touch it
  (`gh issue list --label wayfinder:map --state all`), then zoom into the linked issue.
- **When `/domain-modeling` reaches for an ADR**, record the decision as the resolution comment on its issue
  and put the rule in the matching standard. A decision with no issue yet gets one, as a standalone decision
  (see `docs/agents/issue-tracker.md`).

## File structure

This is a multi-context repo: an npm workspace whose packages carry genuinely different domains. The token
pipeline speaks of aliasing layers, brands and modes; the component library speaks of appearance, variants and
shadow DOM; the docs site speaks of Starlight content collections. Those vocabularies are worth keeping apart.

```
/
├── GLOSSARY-MAP.md
├── docs/standards/                    ← the rules, each linking the issue that decided it
└── packages/
    ├── tokens/GLOSSARY.md
    ├── components/GLOSSARY.md
    ├── docs/GLOSSARY.md
    └── build-tools/GLOSSARY.md
```

## Which context a term belongs to

Ask who would be wrong if the term's meaning changed. _Alias_ in the `_ref`/`_sys`/`_cmp` sense is
`packages/tokens`'. _Component property_ is `packages/components`'. A term that genuinely spans two packages
goes in the one that owns the concept, and the other links to it; two copies drift.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name),
use the term as defined in the relevant `GLOSSARY.md`, and leave the synonyms it lists under _Avoid_.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the
project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag decision conflicts

If your output contradicts a standard or a resolved decision, surface it explicitly rather than silently
overriding:

> _Contradicts #182 (component custom properties are named after their component), but worth reopening
> because…_
