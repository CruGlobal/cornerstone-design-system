# Issue tracker: GitHub

Decisions for this repo live as GitHub issues. Use the `gh` CLI for all operations.

## This tracker holds decisions, not work

**Two trackers, and the line between them is decisions versus work.**

- **GitHub issues — decisions.** Open questions the system needs answered. Every issue carries a
  `wayfinder:*` label, and normally belongs to a map. An issue is resolved by answering it, not by
  shipping code. A **standalone decision** — one that serves no larger effort, such as a release-process
  question — is allowed without a map, but it should be rare: if two or three accumulate around the same
  subject, that is a map waiting to be chartered.
- **Jira (`UIUX`) — work.** Implementation, defects, component builds. A Jira task is created **once a
  decision has settled that we want the thing built**, not before.
- **A pull request references both** the decision issue it acts on and the Jira task it implements.

**Do not open a GitHub issue for work you already know you want done.** That is a Jira task. Filing it here
splits its history across two trackers and hides it from sprint planning. This includes work that falls out
of a decision made here — spin it out as a Jira task and reference the decision.

### Inbound reports are transit, not a third category

Both packages are published publicly, so people outside this repo file bugs and requests and have nowhere
else to file them — Jira is internal. Those arrive through the Issue Forms in `.github/ISSUE_TEMPLATE/`,
which stamp **`needs-triage`**.

`needs-triage` is a **transit state, not a resting one.** An inbound issue is routed to a Jira task, or to a
chartered decision if the shape is genuinely open, and then **closed here with a pointer**. It is not a
place work waits.

So the invariant is one sentence, and it stays checkable:

> **Every open issue is either a decision on a map, or `needs-triage` awaiting routing.**

Which gives the mechanical test: *is it a question hanging off a map, or is it inbound and freshly
triaged?* Anything else is in the wrong tracker — a `bug` or `enhancement` label **without**
`needs-triage`, a `wayfinder:*` label with no parent map, or a `needs-triage` issue that has been sitting
for weeks. That last one is worth querying for deliberately; a stale transit state is the failure mode this
design has.

### Who is working it: the `agent:*` labels

GitHub's `assignee` cannot express which agent is driving an issue, because the personas run under a
human's token — an agent claiming a ticket assigns it to that human, not to itself. So a parallel marker
carries it: **`agent:daniel`, `agent:joseph`, `agent:sarah`, `agent:esther`, `agent:anna`.**

Like `needs-triage`, this is a **transit state**: an agent adds its label when it picks the issue up and
**removes it on resolve**. `agent:sarah` left on a closed or long-idle issue is the same defect as a stale
`needs-triage` — worth querying for rather than trusting.

It marks *who is working it now*, not *whose domain it is*. Domain is already implied by the subject: a
token question is Sarah's whether or not it carries her label. The label exists to answer "is anyone on
this, and who" when several agents run at once — which is the case this repo is now routinely in.

Assignee still means what the wayfinding protocol says it means: the human accountable for the answer.
The two are independent, and both can be set.

**Milestones group decisions by which effort they serve** — `Themes`, `Inspiration`, `Frameworks` — and the
`P0`–`P3` labels carry the order to work through them. A milestone with no open decisions means nobody has
asked that effort's questions yet, which is information worth noticing rather than filling in.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`. Use a heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> --comments`, filtering comments by `jq` and also fetching labels.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Comment on an issue**: `gh issue comment <number> --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **Close**: `gh issue close <number> --comment "..."`

Infer the repo from `git remote -v` — `gh` does this automatically when run inside a clone.

## Pull requests as a triage surface

**PRs as a request surface: no.** _(Set to `yes` if this repo treats external PRs as feature requests; `/triage` reads this flag.)_

When set to `yes`, PRs run through the same labels and states as issues, using the `gh pr` equivalents:

- **Read a PR**: `gh pr view <number> --comments` and `gh pr diff <number>` for the diff.
- **List external PRs for triage**: `gh pr list --state open --json number,title,body,labels,author,authorAssociation,comments` then keep only `authorAssociation` of `CONTRIBUTOR`, `FIRST_TIME_CONTRIBUTOR`, or `NONE` (drop `OWNER`/`MEMBER`/`COLLABORATOR`).
- **Comment / label / close**: `gh pr comment`, `gh pr edit --add-label`/`--remove-label`, `gh pr close`.

GitHub shares one number space across issues and PRs, so a bare `#42` may be either — resolve with `gh pr view 42` and fall back to `gh issue view 42`.

## When a skill says "publish to the issue tracker"

Create a GitHub issue.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number> --comments`.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a single issue with **child** issues as tickets.

- **Map**: a single issue labelled `wayfinder:map`, holding the Notes / Decisions-so-far / Fog body. `gh issue create --label wayfinder:map`.
- **Child ticket**: an issue linked to the map as a GitHub sub-issue (`gh api` on the sub-issues endpoint). Where sub-issues aren't enabled, add the child to a task list in the map body and put `Part of #<map>` at the top of the child body. Labels: `wayfinder:<type>` (`research`/`prototype`/`grilling`/`task`). Once claimed, the ticket is assigned to the driving dev.
- **Blocking**: GitHub's **native issue dependencies** — the canonical, UI-visible representation. Add an edge with `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>`, where `<blocker-db-id>` is the blocker's numeric **database id** (`gh api repos/<owner>/<repo>/issues/<n> --jq .id`, _not_ the `#number` or `node_id`). GitHub reports `issue_dependencies_summary.blocked_by` (open blockers only — the live gate). Where dependencies aren't available, fall back to a `Blocked by: #<n>, #<n>` line at the top of the child body. A ticket is unblocked when every blocker is closed.
- **Frontier query**: list the map's open children (`gh issue list --state open`, scoped to the map's sub-issues / task list), drop any with an open blocker (`issue_dependencies_summary.blocked_by > 0`, or an open issue in the `Blocked by` line) or an assignee; first in map order wins.
- **Claim**: `gh issue edit <n> --add-assignee @me` — the session's first write.
- **Resolve**: `gh issue comment <n> --body "<answer>"`, then `gh issue close <n>`, then append a context pointer (gist + link) to the map's Decisions-so-far.
