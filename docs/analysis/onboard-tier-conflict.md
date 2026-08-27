# Can a consumer still reach onboarding? — the `onboard` / `setup-cornerstone-skills` conflict

**Status:** analysis only. Blocks the remaining #75 work. Nothing implemented.
**Date:** 2026-08-12
**Decisions in scope:** #61, #67, #73, #74, #75 (all closed)
**Files inspected:** `plugins/*/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `plugins/cornerstone/commands/onboard.md`, `plugins/cornerstone/commands/design-review.md`, `plugins/cornerstone-skills/skills/engineering/setup-cornerstone-skills/`, `plugins/cornerstone/agents/daniel.md` (PR #83, `a309e26`), Claude Code plugin/skill docs

---

## Verdict

**The conflict is real. It is not the conflict as framed, and it is worse than framed.**

The framing — "a skill living in a plugin consumers don't install" — is one of three independent reachability failures, and it is the only one anybody has written down. All three have to be true for consumer onboarding to work, and fixing the framed one alone leaves onboarding dead:

| # | Reachability requirement | Status |
| --- | --- | --- |
| 1 | **Installed** — the skill ships in a plugin a consumer actually has | Real conflict, **already conceded and half-fixed** by #75's own addendum (2026-08-10), which the framing doesn't account for |
| 2 | **Invocable** — Daniel, or description-matching, can actually fire it | **Real, unrecorded, unresolved.** `setup-cornerstone-skills` carries `disable-model-invocation: true`. Nothing but a human typing its name can invoke it — not Daniel, not another skill |
| 3 | **Routable** — a consumer's phrasing matches its `description` | **Real, unrecorded, unresolved.** Its description is about issue trackers and triage labels. No token-integration question matches it |

Failure 2 is the one that actually blocks the work, and it is a **direct contradiction of #61**, which did not merely prefer model-invocation — it required it: *"Both set **model-invoked** (rich trigger-phrase descriptions) so any session can reach for them, not just on explicit `/onboard`/`/design-review` typing."* #75 folds `onboard` into a skill that is, in the shipped fork, the exact opposite of that.

There is a fourth finding worth surfacing before any of this: **`design-review`'s retirement has not shipped to a single installed user, and marking a description `DEPRECATED` does not retire a skill at all.** See [Side findings](#side-findings).

---

## What each decision actually says

- **#61** (closed): context detection is the root `package.json` `name` field. `onboard` and `design-review` migrate from `plugins/cornerstone/commands/*.md` to **model-invoked** skills at `plugins/cornerstone/skills/{onboard,design-review}/SKILL.md`. Daniel references them by name without restating their logic. Invocation is description-matched, never name-typed.
- **#67** (closed): three tiers. `cornerstone` is the base tier — *"the front door: routes any Cornerstone request, and carries consumer onboarding and design review"* — with **no external dependencies**. The four contributor personas moved *out* of the base tier during grilling, and the skills plugin moved with them, *"sparing a CSS-only consumer 25 general engineering skills installed to satisfy pointers they can't reach."*
- **#73** (closed, supersedes #62): `setup-matt-pocock-skills` → `setup-cornerstone-skills`, assigned to Daniel along with `ask`, `prototype`, `to-spec`, `to-tickets`, `wayfinder`, and `codebase-design` (shared with Joseph). Joseph, Sarah, Esther, Anna get zero dedicated skill pointers.
- **#74** (closed): *"Daniel's skills stay contributor-context-only. 7 of his skills … live in `cornerstone-skills`, which per #72 is a dependency of `cornerstone-dev` only. Rather than splitting `cornerstone-skills` into a Daniel-subset the base tier also depends on, Daniel's meta/planning skills simply don't activate in pure-consumer context."*
- **#75** (closed): `onboard` folds into a context-aware `setup-cornerstone-skills`, branching on the same `package.json` check, *"routing to either the existing contributor-tooling setup (issue tracker, triage labels, domain docs) or `onboard`'s current consumer-integration-guide content … One setup skill, two audiences."* `design-review` retired outright.
- **#75, addendum** (same day, resolving *"a packaging gap found while writing Daniel's agent file"*): *"#74 scoped `setup-cornerstone-skills` to the `cornerstone-skills` plugin (contributor-dev-only), but this resolution folds `onboard`'s consumer-facing content into that same skill. Those two can't both be true as written — a pure consumer (base `cornerstone` tier only) would have no way to reach onboarding."* **Fix on the record:** the base `cornerstone` plugin ships its own copy of `setup-cornerstone-skills` carrying the consumer branch; `cornerstone-skills` keeps its copy, contributor-only. *"Skill content for either copy is still out of scope here."*

So the framed conflict was spotted by the author two days ago and answered at the *where* level. It was never answered at the *how-reachable* level, and the addendum explicitly deferred content. That deferral is where the live breakage sits.

---

## Verified mechanism

Every claim below was checked against the running Claude Code environment or the current docs, not against a ticket's summary of them.

### 1. Commands *are* skills — `onboard` is already a base-tier, model-invocable, namespaced skill today

The docs are unambiguous: *"**Custom commands have been merged into skills.** A file at `.claude/commands/deploy.md` and a skill at `.claude/skills/deploy/SKILL.md` both create `/deploy` and work the same way."* The plugin-structure table lists `commands/` as *"Skills as flat Markdown files. Use `skills/` for new plugins."*

Live confirmation: this session's own skill roster contains `cornerstone:onboard` — *"Guided setup for integrating Cornerstone Design System into your project"* — as a Skill-tool-invocable entry, sourced from `plugins/cornerstone/commands/onboard.md`, which has no `disable-model-invocation` key.

**Consequence for #61:** the `commands/` → `skills/` migration is a directory-layout modernization, not a capability change. `onboard` already satisfies all three reachability requirements right now. The `skills/` layout buys a folder for supporting files and frontmatter invocation control — neither of which `onboard` needs today. This is the single most important fact for sequencing: **the status quo is already correct, and every proposed change risks regressing it.**

### 2. `disable-model-invocation: true` removes the skill from the model's reach entirely

Docs, three separate statements:

- *"**`disable-model-invocation: true`**: Only you can invoke the skill."*
- *"**Hide individual skills** by adding `disable-model-invocation: true` to their frontmatter. **This removes the skill from Claude's context entirely.**"*
- *"The `user-invocable` field only controls menu visibility, not Skill tool access. **Use `disable-model-invocation: true` to block programmatic invocation.**"*

And the frontmatter reference adds that it *"Also prevents the skill from being preloaded into subagents"* — closing the one workaround an author might reach for (plugin agents do support a `skills` frontmatter field, but a flagged skill can't be preloaded through it).

The invocation matrix: `disable-model-invocation: true` → you can invoke **Yes**, Claude can invoke **No**, *"Description not in context."*

The fork's own documentation says the same thing more sharply than the ticket did. `plugins/cornerstone-skills/skills/productivity/writing-for-agents/SKILL-MECHANICS.md:10`:

> A **user-invoked** skill strips the description from the agent's reach: only the human typing its name can invoke it, **and no other skill can**.

And `plugins/cornerstone-skills/skills/engineering/README.md:5-7` files `setup-cornerstone-skills` under a heading literally called **"User-invoked"**, described as *"Reachable only when you type them."*

`plugins/cornerstone-skills/skills/engineering/setup-cornerstone-skills/SKILL.md:1-5`:

```yaml
---
name: setup-cornerstone-skills
description: Configure this repo for the engineering skills — set up its issue tracker, triage label vocabulary, and domain doc layout. Run once before first use of the other engineering skills.
disable-model-invocation: true
---
```

The fork carries the same policy for the OpenAI runtime: `agents/openai.yaml` sets `policy.allow_implicit_invocation: false`. This is not a Claude-Code-only quirk to work around; it is the skill's declared design in both runtimes.

### 3. Empirical proof, from this very session

The installed upstream `mattpocock-skills` plugin exposes exactly **11** skills to the Skill tool: `diagnosing-bugs`, `tdd`, `prototype`, `research`, `domain-modeling`, `codebase-design`, `code-review`, `resolving-merge-conflicts`, `wizard`, `grilling`, `writing-for-agents`.

Classifying the 25 forked `SKILL.md` files by the flag:

- **11 without the flag** — `code-review`, `codebase-design`, `diagnosing-bugs`, `domain-modeling`, `grilling`, `prototype`, `research`, `resolving-merge-conflicts`, `tdd`, `wizard`, `writing-for-agents`
- **14 with the flag** — `ask`, `grill-me`, `grill-with-docs`, `handoff`, `implement`, `improve-codebase-architecture`, **`setup-cornerstone-skills`**, `teach`, `to-questionnaire`, `to-spec`, `to-tickets`, `triage`, `wait-what`, `wayfinder`

The 11 unflagged names are an **exact set match** with the 11 the model can see. Not one of the 14 flagged skills appears. `setup-cornerstone-skills` is in the 14. This is not an inference from documentation — it is the mechanism running, observed.

### 4. The same defect hits Daniel five more times, and PR #83 ships it

Decision #73 assigned Daniel 7 skills. Five of them are user-invoked-only:

| Daniel's skill (#73) | Model-reachable? |
| --- | --- |
| `ask` | **No** |
| `prototype` | Yes |
| `setup-cornerstone-skills` | **No** |
| `to-spec` | **No** |
| `to-tickets` | **No** |
| `wayfinder` | **No** |
| `codebase-design` | Yes |

Plus `triage`, which `daniel.md:56` makes his entire escalation mechanism (*"log it as a GitHub issue … **via the `triage` skill**"*) — also flagged, also unreachable.

Two of these are worse than merely unreachable. `daniel.md:47` says *"`ask` and `prototype` work in either context — they route and they sketch, and they don't write anywhere"* — but `ask` is described in the fork's own README as *"A router over the user-invoked skills in this repo,"* and `SKILL-MECHANICS.md:22` says of router skills: *"It can only hint, never fire them: user-invoked skills have no description, so nothing but the human can reach them."* So the one skill Daniel opens up for consumers is a router he cannot fire, over skills he cannot fire.

**#62's amendment asserts the general principle** — *"model-invoked skills are reachable regardless of active persona"* — and it is true. The unexamined corollary is that **14 of the 25 fork skills are not model-invoked**, so #61's "reference by name, don't restate the logic" pattern silently degrades from *delegation* to *a suggestion the human must act on* for 5 of Daniel's 7 skills. That distinction is invisible in every ticket from #62 through #75.

### 5. Same-named skills in two plugins do not collide — but both stay live for contributors

*"Plugin skills are always namespaced (like `/my-first-plugin:hello`) to prevent conflicts when multiple plugins have skills with the same name."* So `cornerstone:setup-cornerstone-skills` and `cornerstone-skills:setup-cornerstone-skills` coexist cleanly. The addendum's two-copy plan is mechanically valid.

But note what it costs. A **contributor** installs `cornerstone-dev`, which pulls both plugins, so both copies are present and both are reachable. Daniel's prose names the skill **unqualified**. And in the one context where #75's `package.json` branch would fire, there are two candidates and the "branch" is no longer a branch — it is decided by install topology, not by the detection #75 specified.

(Agents behave differently and the map already knows it: *"Project and user `.claude/agents/` definitions override same-named plugin agents."* Skills add; agents shadow. Unrelated to this conflict, but don't reason from one to the other.)

### 6. `cornerstone` → `cornerstone-skills` is legal, cheap to declare, and expensive to live with

Both plugins live in the `cru` marketplace, and *"`name` … Resolves within the same marketplace as the declaring plugin."* No `allowCrossMarketplaceDependenciesOn` entry is needed (that field is already present for `claude-plugins-official`, and stays needed for `figma`). No cycle: `cornerstone-dev` → {`cornerstone`, `cornerstone-skills`, `figma`}, and `cornerstone` → `cornerstone-skills` adds no back-edge.

The cost is exactly what #67 removed: *"When you install a plugin that declares dependencies, Claude Code resolves and installs them automatically"* and *"Enabling a plugin also enables the plugins it depends on."* Every CSS-only consumer gets all 25 skills installed and enabled, with 11 model-invocable descriptions permanently resident in their context. It also makes `cornerstone-dev`'s own `cornerstone-skills` dependency redundant.

And it **still doesn't fix anything**: the skill remains user-invoked and remains described as issue-tracker configuration. This option buys #67's cost and delivers none of the benefit.

### 7. The base plugin needs no manifest edit to gain a skill

`plugins/cornerstone/.claude-plugin/plugin.json` has no `skills` array, and *"Skills and commands are automatically discovered when the plugin is installed."* Dropping `plugins/cornerstone/skills/onboard/SKILL.md` in place is sufficient. (`cornerstone-skills` does list its 25 explicitly, so a change *there* is a two-file change.)

Also confirmed: `settings.json` with `{"agent": "daniel"}` (present on `agent/daniel`) is the supported default-persona mechanism — *"Setting `agent` activates one of the plugin's custom agents as the main thread."* That matters here because it makes Daniel's prose pointer the **primary** route into onboarding for a consumer who never types a slash command.

---

## Is `daniel.md` internally contradictory?

**Yes — and the sharper problem is that the file cannot be checked against itself, because it never mentions the fact that would reconcile it.**

The two passages, from PR #83 at `a309e26`:

- **`:24`** (Consumer context) — *"Guide integration using `setup-cornerstone-skills` (its consumer-facing branch covers what installing, importing CSS, setting `data-brand`/`data-theme`, and using `--sys-*` tokens looks like for their stack). Don't restate that skill's procedure here — just reach for it."*
- **`:45`** (Skills) — *"You share access to a handful of general-purpose skills from the `cornerstone-skills` plugin when it's installed: `ask`, `prototype`, `setup-cornerstone-skills` (its contributor-facing branch), …"*
- **`:47`** — *"The rest are contributor-only, and the reason is tracker ownership … `setup-cornerstone-skills` configures **this** repo's issue tracker, triage labels and domain docs."*

Two readings, and both fail:

**Reading A (one skill).** `:24` tells Daniel to use, in consumer context, a skill `:47` declares contributor-only. Flat contradiction. This is also the only reading available from the shipped repo, where exactly one copy exists, in `cornerstone-skills`, contributor-tier, user-invoked, described as issue-tracker setup.

**Reading B (two copies, per #75's addendum).** `:24` means the base copy, `:45`/`:47` mean the fork copy. Not *literally* contradictory — but the file never says there are two copies, so nothing in it licenses the distinction, and `:47`'s stated *reason* ("configures **this** repo's issue tracker, triage labels and domain docs") is **false of the base copy**, which would carry only integration content. A reader who accepts B is left with a justification that doesn't describe the thing being justified.

Under **either** reading, `:24` is a dead pointer today: the named skill is absent in consumer context, and even where present it is unreachable by an agent.

Independently of the fold question, three more `daniel.md` claims are wrong on mechanism and need fixing before #83 merges:

- **`:45`** — "You share access to" overstates for 5 of the 7. Daniel can *name* them to the human; he cannot invoke them.
- **`:47`** — "`ask` and `prototype` work in either context" is half true. `prototype` is model-invocable; `ask` is not.
- **`:56`** — escalation routes "via the `triage` skill", which Daniel cannot invoke. As written the escalation path has no working mechanism in the one case it exists for. (The prose already says "offer this to whoever you're talking to rather than filing it silently", which is nearly the right shape — it just needs to be explicit that the human runs it.)

None of these are style nits. Each one is an instruction Daniel will attempt and be blocked from completing: *"If Claude tries anyway, Claude Code blocks the call and instructs it not to reproduce the deploy steps another way, so expect Claude to suggest running `/deploy` yourself."*

---

## What is actually in `onboard.md`, and what a fold would relocate

107 lines, four steps, plus a 7-entry `allowed-tools` list (`Read`, `Bash(find:*)`, `Bash(ls:*)`, `Bash(cat:*)`, `Bash(node:*)`, `Bash(npm:*)`). None of it is redundant with the fork skill; there is **zero content overlap** between the two "branches" #75 wants to merge.

| Section | Content | Notes on relocation |
| --- | --- | --- |
| Step 1 (`:18-28`) | Silent inspection: `package.json` for framework/build tool, CSS entry points, `tailwind.config.*`, whether Cornerstone is already a dependency. **Explicit no-`package.json` branch** → plain HTML/CSS site, favour the no-build `<link>`/`@import` path | The no-`package.json` branch is the *only* place in the system that handles a non-JS consumer. #61's context detection treats "no `package.json`" as consumer context and stops there; this is the follow-through. Easy to lose in a rewrite |
| Step 2 (`:30-38`) | Five questions: brand (Cru/FL), theme (light/dark/both), CSS approach, framework, build tool | **Coupled to Daniel's escalation rule.** `daniel.md:60` escalates when "brand or theme is still ambiguous after you've asked directly" — this is the asking. The two must stay consistent or the escalation trigger has no antecedent |
| Step 3a-d (`:44-81`) | Install; **`ref.css` first, then brand+theme**; the four mode files by exact path; `data-brand`/`data-theme` on the root incl. runtime switching; `var(--sys-*)` usage per stack (CSS/SCSS/Modules, styled-components/Emotion, Tailwind arbitrary values or `extend.colors`) | The import-order rule is load-bearing and stated nowhere else in the plugin. Verify the four `css/*.css` paths against the published package before any rewrite |
| Step 3e (`:83-96`) | Material Symbols Sharp `<link>` with the full axis string; `libraries/cru-icons/<name>.svg` | The 81 icons' only documented consumer path |
| Step 3f (`:98-100`) | "`/pull-tokens` is a contributor command… do not run it" | **Overlaps `daniel.md:26-32`.** Two statements of the same refusal that can drift. Pick one owner |
| Step 4 (`:102-107`) | Two follow-ups: a sample styled component; a list of `--sys-*` names | Already trimmed from three by PR #77 (the `/design-review` offer removed, per #75 item 4) |

---

## Options

### Option 1 — Narrow #75's fold to contributor setup; `onboard` becomes its own model-invoked skill in the base tier

Execute #61 as originally written for `onboard`. Reverse #75 item 1 only; keep items 2–5. `setup-cornerstone-skills` stays exactly what it is — the contributor-tooling bootstrap, user-invoked, in `cornerstone-skills`, unchanged. No consumer branch, no second copy, no dependency edit, no fork churn.

- **Satisfies all three reachability requirements.** Base tier (installed), no flag (invocable by Daniel and by description-matching), consumer-shaped description (routable).
- **Touches the fewest closed decisions.** One item of one ticket. #67's tier boundary is untouched. #74's "Daniel's skills are contributor-context-only" becomes *true without exception* — today it has a carve-out that doesn't work.
- **Honest cost:** #75's "one setup skill, two audiences" framing is abandoned. But that elegance was never real: the two audiences never share a plugin, the skill can't self-branch on `package.json` in the tier where only one audience exists, and it is user-invoked. Two jobs that share no content, no audience, no invocation mode and no `allowed-tools` profile were only ever united by a name.
- **Second cost:** the `allowed-tools` question resolves in this option's favour and against a merged skill. `onboard` needs read-and-inspect (`Read`, `find`, `ls`, `cat`, `npm`); the contributor bootstrap **writes** `docs/agents/*.md` and edits `CLAUDE.md`. One file means one `allowed-tools` set — the union, broader than either job needs, in a base-tier skill a consumer runs.
- **Relationship to the addendum:** this is the addendum's own conclusion with the base-tier file given its correct name and invocation mode. Not a reversal — a refinement.

### Option 2 — Make `cornerstone` depend on `cornerstone-skills`

- **Mechanically legal and trivial to write:** one array in `plugins/cornerstone/.claude-plugin/plugin.json`, intra-marketplace, no allowlist change.
- **Reinstates precisely what #67 removed after grilling.** 25 skills installed and enabled for a CSS-only consumer; 11 descriptions permanently in their context. #67's stated reason for the move survives verbatim.
- **And it fixes nothing.** The skill is still user-invoked (Daniel still can't reach it) and still described as issue-tracker configuration (description-matching still won't route to it). Requirement 1 satisfied; 2 and 3 untouched.
- **Side effects:** `cornerstone-dev`'s `cornerstone-skills` dependency becomes redundant; disabling `cornerstone-skills` becomes blocked for anyone with `cornerstone` enabled (*"disabling a plugin is blocked if another enabled plugin still needs it"*).
- **Verdict: strictly dominated.** Listed for completeness. Do not pick it.

### Option 3 — Two same-named copies (#75's addendum exactly as written)

- **Works at the install level**, thanks to namespacing.
- **The "context-aware branching" #75 specified stops existing.** The branch becomes install topology, not the `package.json` check. In a contributor repo — the one place the check would fire — both copies are present.
- **The base copy must drop `disable-model-invocation` and get a consumer-facing description** to be reachable at all. At that point it is Option 1's skill wearing a misleading name: `setup-cornerstone-skills` reads as "install some Claude skills", not "integrate design tokens into my app". A name that mismatches its content is exactly what breaks requirement 3, since selection is description-and-name-matched.
- **Human ambiguity:** a contributor typing `/setup-cornerstone-skills` gets two candidates that do unrelated things.
- **Ongoing cost:** two files, same name, different content, no shared source. Nothing prevents them diverging, and no check would notice.

### Option 4 — Relocate the whole context-aware skill into the base tier and rename it

One skill, one file, in `cornerstone` (the only tier where "two audiences" is true), model-invoked, branching on `package.json`: consumer → `onboard`'s content; contributor → the forked bootstrap. Delete the fork's copy.

- **The most faithful execution of #75's actual intent** — one skill, two audiences, context-detected — relocated to the tier where that sentence can be true.
- **Costs a second rename of a skill #73 already renamed once.** Nine files in the fork cross-reference `setup-cornerstone-skills`: `plugin.json`, `NOTICE.md`, `engineering/README.md`, and the `ask`, `code-review`, `to-spec`, `to-tickets`, `triage`, `wayfinder` skills. (#73 enumerated five of the six skills — it didn't list `ask`, the router that points at it.) #73 did this churn once and claimed completeness; doing it again invites the same partial result, and it already *was* partial — see side finding b.
- **Puts contributor-tooling instructions in every consumer's base tier**, guarded only by a runtime branch. Modest in tokens, but it is the base tier's job to stay small and #67 chose that on purpose.
- **Merges the `allowed-tools` surfaces** (read-only vs. writes `docs/agents/*.md` and `CLAUDE.md`) into one union in a consumer-facing skill.
- **Breaks the fork's own contract.** #72 committed to a one-time fork with surgical, deliberate changes. Removing a skill from the fork and re-homing it in a different plugin is not surgical; it makes the fork's skill roster structurally different from upstream in a way that costs on any future surgical pull.

### Option 5 — Do nothing structural: retire `design-review`, leave `onboard` where it is

Narrow #75 to items 2–5 and drop item 1 entirely. `onboard.md` stays a `commands/*.md` file in the base tier.

- **Zero risk, zero work, and correct today** — because commands *are* skills, `onboard` already satisfies all three reachability requirements (finding 1). This option is worth stating precisely because it is the baseline every other option must beat, and options 2 and 3 do not beat it.
- **Costs:** `commands/` is the legacy layout (*"Use `skills/` for new plugins"*), and #61 stays on the record unexecuted. Neither is urgent; neither is invisible either.
- **Best use:** the safe deferral if Option 1 can't land before PR #83 does. Under this option `daniel.md:24` should name `onboard` — which is Option 1's one required `daniel.md` edit anyway, so the two options share their most important change and Option 5 upgrades to Option 1 later without rework.

---

## Recommendation

**Option 1.** Narrow #75 item 1 to contributor setup only; build `onboard` as a model-invoked skill in the base `cornerstone` plugin, per #61's original plan.

The reasoning, in order of weight:

1. **It is the only option that satisfies all three reachability requirements without breaking a closed decision that was reached deliberately.** Option 2 reverses #67's grilled conclusion and still doesn't work. Option 3 needs the base copy to become, functionally, Option 1's skill under a name that defeats description-matching. Option 4 works but pays a rename-and-fork-churn bill for framing rather than function.
2. **The thing #75 wanted to unify does not exist.** "One setup skill, two audiences" presumes a shared artifact. There is none: zero content overlap, disjoint audiences, disjoint plugins, incompatible invocation modes, incompatible `allowed-tools`. The fork's own guidance covers this case exactly — *"Shared reference that two user-invoked skills both need can live in neither … Push it to a plain file outside the skill system"* — and here there isn't even shared reference to push.
3. **It is the smallest correction to the record.** #75's addendum already concluded that #74 and #75 "can't both be true as written" and already put a base-tier file in the plan. Option 1 keeps that file and fixes its name and frontmatter. Framing it as a refinement of the addendum, not a reversal of #75, is both accurate and cheaper politically.
4. **It makes #74 item 1 true without exception.** "Daniel's meta/planning skills simply don't activate in pure-consumer context" is a clean rule the moment `onboard` stops being one of them. Today it is a rule with a carve-out that doesn't function.
5. **It preserves the one thing that already works.** `cornerstone:onboard` is reachable right now. Option 1 is the only structural change that keeps it reachable at every intermediate state.

**Sequencing:** make the `daniel.md` fixes first (they are required under every option, block PR #83, and are independent of which option wins), then land Option 1's skill move, then bump the plugin version so any of it reaches an installed user (side finding a — without it, none of this ships).

---

## Side findings

Same defect class — a decision's summary of a mechanism diverging from the mechanism. Not in scope for this brief's question, but each is cheap to fix and one of them silently voids part of #75.

**a. `design-review`'s retirement has shipped to nobody, and "marked deprecated" does not retire a skill.** Two separate problems:

- *It hasn't shipped.* `plugins/cornerstone/.claude-plugin/plugin.json` has carried `"version": "0.1.0"` since the commit that created it (`899379d`, PR #45) and has never been touched — `git log` on that path returns exactly one commit. There are no `cornerstone--v*` tags (the repo's only tags are the five npm `vX.Y.Z` tags). Docs: *"`version` … If set, users only receive updates when you bump this field"*, and *"Auto-update is off by default for non-Anthropic marketplaces."* **Live fingerprint:** this session's skill roster shows `cornerstone:design-review` with the **pre-#77** description — no `DEPRECATED (see #75)` prefix — while `main` has carried the prefix since PR #77 merged on 2026-08-10. So every cornerstone-plugin change since PR #45 (the configurable `design-review` rewrite in #47, the deprecation banner and the `onboard` Step-4 edit in #77) has reached zero installed users. Note the two version lines are independent: PR #77's changeset bumped `@cruglobal/cornerstone-design-system`, which has nothing to do with plugin distribution.
- *Even shipped, it wouldn't retire it.* A `DEPRECATED` prefix in a `description` is still a `description`. Per finding 2, the description stays in the model's context and the skill stays Skill-tool-invocable. #75 item 5 chose "left in place, marked deprecated, not deleted" for reversibility — a good instinct with the wrong mechanism. The mechanism that matches the intent is `disable-model-invocation: true` on `design-review.md`: the body survives verbatim as reference, the human can still type it, the model can no longer fire it, and it costs nothing in context. That is more reversible than the current state, not less.

**b. #73's completeness claim is false in exactly one place — inside the skill this brief is about.** #73 states: *"No remaining references to either old name anywhere in the fork."* A case-insensitive grep across `plugins/cornerstone-skills/` (excluding `NOTICE.md`/`LICENSE`, where attribution is correct and required) returns one hit: `skills/engineering/setup-cornerstone-skills/agents/openai.yaml:2` — `display_name: "Setup Matt Pocock Skills"`. #73 enumerated Claude Code surfaces (directory, frontmatter `name`, section titles, cross-referencing skills, README, `plugin.json`) and missed the parallel OpenAI runtime manifest. One-line fix; worth noting because it is the same authoring pattern as the rest of this brief — the Claude Code surface was checked and a second surface carrying the same setting was not.

**c. `README.md:124` tells consumers to run `/onboard`.** Plugin skills are *always* namespaced; the working invocation is `/cornerstone:onboard`. `README.md:125` also still advertises `/design-review` with no deprecation note, which #75 item 4 addressed only inside `onboard.md`.

---

## Exact edits, per option

### Required under every option (do these first — they block PR #83)

In `plugins/cornerstone/agents/daniel.md` (PR #83, branch `agent/daniel`, `a309e26`):

1. **`:24`** — replace `setup-cornerstone-skills` with the skill that will actually carry consumer integration, and drop "its consumer-facing branch". Under Options 1 and 5 that is `onboard`; under Option 4, the new base-tier name.
2. **`:45`** — remove the "(its contributor-facing branch)" parenthetical (there are no branches under Options 1/2/5), and reword "You share access to" so it distinguishes skills Daniel can invoke (`prototype`, `codebase-design`) from ones he can only name for the human to type (`ask`, `setup-cornerstone-skills`, `to-spec`, `to-tickets`, `wayfinder`).
3. **`:47`** — correct "`ask` and `prototype` work in either context": `ask` is user-invoked-only, and is itself a router over user-invoked skills, so Daniel cannot fire it or anything it points at. Either move `ask` into the "name it, don't fire it" group or drop the claim.
4. **`:56`** — make explicit that `triage` is run by the human, not by Daniel. The existing "offer this to whoever you're talking to rather than filing it silently" is nearly right; it needs the mechanism stated (`/cornerstone-skills:triage`) so the offer is actionable rather than an attempt Claude Code will block.
5. Consider a one-line note in the Skills section stating the general rule once — *a user-invoked skill can be named but not invoked* — so the four personas modelled on this file inherit the correct pattern. This file is the precedent; `a309e26`'s own commit message says so.

Not required, but decide deliberately: **`onboard.md:98-100` (Step 3f) duplicates `daniel.md:26-32`'s refusal list.** Two copies of one rule. Pick an owner.

### Option 1 (recommended)

| Edit | File | Change |
| --- | --- | --- |
| 1 | `plugins/cornerstone/skills/onboard/SKILL.md` | **New.** Port `onboard.md`'s 107 lines verbatim in substance. Add `name: onboard`. **Omit `disable-model-invocation`.** Rewrite `description` into a rich, model-facing trigger description (install / import CSS / `data-brand` / `data-theme` / `--sys-*` / Cornerstone tokens in my app / brand and theme setup) so description-matching routes real consumer phrasings to it. Keep the existing `allowed-tools` list unchanged. Verify the four `css/*.css` paths and the Material Symbols axis string against the published package while porting |
| 2 | `plugins/cornerstone/commands/onboard.md` | **Delete** (per #61: "deleting the old command files") |
| 3 | `plugins/cornerstone/.claude-plugin/plugin.json` | **No change needed** for discovery. **Bump `version`** — see edit 6 |
| 4 | `plugins/cornerstone-skills/skills/engineering/setup-cornerstone-skills/SKILL.md` | **No change.** Stays the contributor bootstrap, user-invoked, unchanged. (Optionally fix side finding b's `agents/openai.yaml:2` while you're in the folder) |
| 5 | `plugins/cornerstone/agents/daniel.md` | The five edits above, with `:24` naming `onboard` |
| 6 | `plugins/cornerstone/.claude-plugin/plugin.json` + `.claude-plugin/marketplace.json` | Bump the plugin `version` to `0.2.0` and keep the marketplace entry in sync (`claude plugin tag` validates that they agree). Without this, nothing in this list reaches an installed consumer. Also refresh the base plugin's `description`, which still reads "Onboarding and design-review commands" in both files |
| 7 | `README.md:113-127` | `/cornerstone:onboard` not `/onboard`; drop or deprecate the `/design-review` line; note the install-tier table #67 wanted generated from the manifests |
| 8 | Issues #75, #61, #60 | Comment on #75 recording the narrowing of item 1 and superseding the addendum's naming; comment on #61 confirming its `onboard` plan stands as written; update #60's #75 entry. Record the invocation-mode finding on #73 or #74, since it changes what "Daniel's skills" means for five of seven |
| 9 | `.changeset/` | A **patch** changeset for the plugin/doc change (the token API is untouched). Never `--empty` |

### Option 2 (not recommended)

Edits 5–9 above, plus: add `"dependencies": ["cornerstone-skills@cru"]` to `plugins/cornerstone/.claude-plugin/plugin.json`; remove the now-redundant `cornerstone-skills@cru` from `plugins/cornerstone-dev/.claude-plugin/plugin.json`; **still** remove `disable-model-invocation` from the fork's `setup-cornerstone-skills` and rewrite its description to cover both audiences (i.e. you do Option 3's work anyway, in the contributor plugin, and hand every consumer 25 skills for it). Amends #67 materially — reopen it rather than amending by side effect.

### Option 3 (#75 addendum as written)

Edits 5–9, plus: new `plugins/cornerstone/skills/setup-cornerstone-skills/SKILL.md` carrying `onboard`'s content, **without** `disable-model-invocation`, with a consumer-facing description; `plugins/cornerstone/commands/onboard.md` deleted; fork copy unchanged; and a written note — somewhere a future editor will find it — that two same-named skills exist with different content and must not be conflated. Expect to re-litigate the name.

### Option 4

Edits 5–9, plus: new `plugins/cornerstone/skills/<new-name>/SKILL.md` with both branches and a union `allowed-tools`; delete `plugins/cornerstone/commands/onboard.md`; delete `plugins/cornerstone-skills/skills/engineering/setup-cornerstone-skills/` (7 files); remove it from `plugins/cornerstone-skills/.claude-plugin/plugin.json`'s `skills` array; update the 9 fork files that cross-reference the old name (`plugin.json`, `NOTICE.md`, `engineering/README.md`, and the `ask`, `code-review`, `to-spec`, `to-tickets`, `triage`, `wayfinder` skills); note the deliberate fork divergence in `NOTICE.md`.

### Option 5

Edits 5, 6, 7, 9, plus a comment on #61 recording that its `onboard` migration is deferred and **why it is safe to defer** (commands are skills; `onboard` is already a base-tier model-invocable namespaced skill). Do not leave the deferral unexplained — the next reader will otherwise see an unexecuted decision and assume it was dropped.

---

## What this brief does not decide

- Whether `design-review.md` should get `disable-model-invocation: true` (side finding a). Recommended, but it is #75's call, not this brief's.
- Whether the plugin needs a version/tagging discipline of its own, parallel to the changeset flow. The npm package has changesets, CI and provenance; the plugin has an un-bumped `0.1.0` and no tags. That is a gap, not a decision, and it is bigger than this ticket.
- Whether the five now-unreachable Daniel skills (`ask`, `setup-cornerstone-skills`, `to-spec`, `to-tickets`, `wayfinder`) should be re-examined against #73's assignment, or have their flags removed, or simply be documented as human-typed. This brief only establishes that they are unreachable; which of those three answers is right is a fresh decision and probably a fresh grilling.
- Whether `onboard.md` Step 3f or `daniel.md`'s refusal list owns the "don't run `/pull-tokens`" rule.

## No changeset for this document

This file is analysis. It ships nothing, changes no token, no plugin, no skill and no agent. **Do not add a changeset for it.** The changesets belong to whichever option gets implemented — a **patch** in every case, since none of them touch the token API.
