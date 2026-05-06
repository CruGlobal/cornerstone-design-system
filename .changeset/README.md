# Changesets

This folder is managed by [@changesets/cli](https://github.com/changesets/changesets).

Add a changeset before merging any PR that changes the public token API:

```sh
npx changeset
```

Guidelines:
- **major** — removing or renaming a `_sys` or `_cmp` token
- **minor** — adding a new token, mode, or component
- **patch** — changing a value (color tweak, alias retargeting that doesn't affect the public name)
