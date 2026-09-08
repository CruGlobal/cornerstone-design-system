# Context Map

This repo is multi-context: an npm workspace whose packages carry genuinely different domains. This file is
the index of those contexts — it points at each one's glossary and says what that glossary is for. It defines
no terms itself; a term lives in exactly one `CONTEXT.md`, and this map only says which.

How the skills consume these files — and which context a given decision belongs to — is in
`docs/agents/domain.md`.

## The contexts

| Context | Glossary | Speaks of |
| --- | --- | --- |
| Token pipeline | `packages/tokens/CONTEXT.md` — *not yet written* | aliasing layers (`_ref`/`_sys`/`_cmp`), brands, modes, DTCG, Style Dictionary platforms |
| Component library | `packages/components/CONTEXT.md` | the fork point from Web Awesome, ministry and sub-brand, palette and feel, cross-cutting policy, bundled vs unbundled builds, the bespoke pass |
| Documentation site | `packages/docs/CONTEXT.md` — *not yet written* | Starlight content collections, the pages that compile into the shipped agent skills, Pattern / Screen / Flow ([#143](https://github.com/CruGlobal/cornerstone-design-system/issues/143)) |
| Shared build tooling | `packages/build-tools/CONTEXT.md` — *not yet written* | what the library and the docs both need, and why it isn't published |

Three of the four don't exist yet, and that is the intended state rather than a backlog. `/domain-modeling`
writes a `CONTEXT.md` the moment a term is actually resolved, not upfront — an invented glossary is worse than
none, because it reads as settled. Add to one when a term genuinely gets pinned down.

## Decisions

- `docs/adr/` — decisions no single package owns: the three-layer token architecture, the release flow, the
  plugin tiers.
- `packages/<name>/docs/adr/` — decisions scoped to one package. A package gets this directory only once it
  has a decision to record.

Neither exists yet. Same rule: created lazily, when there is a decision worth the file.

## One collision worth knowing about

The two published packages share **no** custom-property vocabulary. `@cruglobal/cornerstone-components` is
styled through `--cs-*`; `@cruglobal/cornerstone-design-system` emits `--ref-*`, `--sys-*` and `--cmp-*`.
Neither resolves the other's names.

This is a context boundary rather than a bug, and it is the most common way to be confidently wrong in this
repo — a question about a token that doesn't resolve is usually a question about which package the asker
installed. Establish that before answering, and reach for the glossary of the context the answer lives in.
