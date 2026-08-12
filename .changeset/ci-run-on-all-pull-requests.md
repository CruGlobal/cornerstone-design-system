---
"@cruglobal/cornerstone-design-system": patch
---

Run CI on every pull request, not only those targeting `main`, and check the changeset gate against each PR's own base.

The `pull_request: branches: [main]` filter meant a PR based on another feature branch reported **no checks at all** rather than running them — so every intermediate position in a stacked PR was unverified. Push stays filtered to `main` so a branch with an open PR doesn't build twice.

The changeset gate also ran `changeset status --since=origin/main` regardless of what the PR actually targeted. On a stacked PR that counts every changeset in the whole stack, so a PR that added none of its own passed on an ancestor's. It now compares against `github.event.pull_request.base.ref`, passed through the environment rather than interpolated into the shell, since git permits `$` and `;` in ref names.
