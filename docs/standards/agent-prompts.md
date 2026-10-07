# Agent Prompts — Focus Areas

`plugins/**` ships Claude Code plugins to every consumer who installs the `cru` marketplace, and
`.claude/**`, `CLAUDE.md`, `docs/agents/**` and the `GLOSSARY*.md` files steer every session in this repo.
These are prompts: a weak line in one is a defect that fires on every run, for every reader, with no test
to catch it. The writing standard is the `writing-for-agents` skill; review against it rather than
restating it.

**Applies when the diff touches** `plugins/**`, `.claude/**`, `CLAUDE.md`,
`packages/*/CLAUDE.md`, `docs/agents/**`, `GLOSSARY-MAP.md` or `packages/*/GLOSSARY.md`.

---

**Pointers over copies**

A prompt points at the file that owns a rule or a fact; it does not restate it. The copy is the one that
goes stale. Look for: the `_sys`→`_ref` aliasing rules, bump levels, the Figma hash protocol, or any
`CLAUDE.md` rule repeated in a persona; a count ("twenty of seventy", "232 tokens"), a version number, a
line number, a list of current CI jobs, or a "does not exist yet" that a sibling PR already changed.

**Every name must resolve**

Every skill, command, label, file path and package a prompt names must exist at review time: `ls` the
path, `gh label list` the label, read the skill's front matter. A skill with
`disable-model-invocation: true` (such as `triage`) is offered to the human as `/triage`, never written as
a step the persona performs.

**Refusals name what they protect**

A refusal is keyed on the thing acted on and who owns it (this repo's tracker, this repo's token files,
publishing Cornerstone itself), never on a command's name; `npm run release` is a conventional script a
consumer may own. For each refused item ask: could a consumer project legitimately own something with this
name? If yes, scope the line to this repo or remove it. A gate is justified by ownership, never by a
prediction about what someone will or will not ask.

**Routing names its axis**

A persona that both hands off (sideways, to another persona) and escalates (outward, to a human) states
the test that separates them in one sentence before either list. Adjacent sections that each route work
away without that sentence will be confused.

**Shape of a persona** (`plugins/cornerstone-dev/agents/*.md`)

Front matter `name`, `description` (leading word first; one trigger per branch), and `model` only where a
decision set a floor. A bar stated as "X is finished when Y", the domain, the boundaries (each naming the
persona who owns the refused work), escalation, git policy. Around a hundred lines: the first drafts were
2,400 to 3,800 words and were cut. Unbuilt work is named as roadmap with its ticket, in the future tense. A
vocabulary not yet resolved is listed as missing, not drafted into a `GLOSSARY.md`.

**Consistency across the set**

A rule stated in one persona and not its siblings, or a persona contradicting `CLAUDE.md` (two said "never
`changeset add --empty`" while `CLAUDE.md` permitted it), is fixed at the rule's home in the same diff. A
refusal names the exact artifact ("findings", not "output") so it cannot contradict a duty elsewhere in the
file. `plugins/*/.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` duplicate descriptions;
a change to one changes the other.

**No `@` mentions.** `@Esther`-style text on GitHub pings real accounts (PR #203). Personas are named
plainly.

---

### Prompt Checklist

- No restated rule, count, version or line number; pointers instead: Yes/No/N/A
- Every named skill, label, path and package resolves: Yes/No/N/A
- Refusals keyed on ownership of the target, not on a command name: Yes/No/N/A
- Hand-off versus escalation axis stated once, before the lists: Yes/No/N/A
- Persona shape and length held; roadmap in the future tense: Yes/No/N/A
- Sibling prompts, `CLAUDE.md` and the two plugin manifests still agree: Yes/No/N/A

---

## Mined from merged PR history

Rules derived from 46 merged PRs (#49–#169). Each carries the PRs it came from.

- **AI failure mode: dead pointers.** `CONTEXT-MAP.md` (now `GLOSSARY-MAP.md`) was cited by `CLAUDE.md` and `docs/agents/domain.md`
  before it existed; `needs-review` was named as a label that never existed on this repo; `triage`, a
  human-invoked skill, was written as a step in all five personas and had to be undone.
  <!-- evidence: PR #140, #153, #161 -->
- **AI failure mode: snapshot facts and restated standards that drift.** "Twenty of seventy experimental"
  (it was ten; the React wrappers were counted); "the workspace doesn't exist yet" shipped hours after the
  workspace merged; a worked example a sibling PR had already fixed; wrong line citations and a paraphrase
  presented as a quote; `sarah.md` at 1,214 words carrying the aliasing rules, the hash internals and a
  plan-tier fact. Point at the file.
  <!-- evidence: PR #83, #85, #88, #89, #90, #91, #92, #93, #140, #153 -->
- **AI failure mode: a refusal keyed on a command's name.** Daniel's first draft refused `npm run version`
  and `npm run release` by name, which would have refused a consumer's own release and cited Cornerstone;
  the author called it "a real bug". The same PR routed work away in two adjacent sections without naming
  the axis between them, and gated the planning skills on a prediction ("a consumer would never ask") that
  UIUX-115 disproved. Key every refusal on ownership of the target.
  <!-- evidence: PR #83 -->
- **The persona shape is a convention nobody wrote down.** The four `cornerstone-dev` personas carry the
  same sections, omit `model` unless a decision set a floor, and were each cut from thousands of words to
  about a hundred lines. Esther shipped without a git-policy section and gained it later. Flag a new
  persona that departs from the shape or runs long.
  <!-- evidence: PR #88, #89, #90, #91 -->
- **The two plugin manifests are kept identical by hand.** A description, dependency or command list
  changed in `plugins/*/.claude-plugin/plugin.json` changes the matching `.claude-plugin/marketplace.json`
  entry in the same diff; the base tier advertised a retired command in both until someone diffed them.
  <!-- evidence: PR #90, #91, #92 -->
