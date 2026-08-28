---
'@cruglobal/cornerstone-components': patch
---

Delete the root `.npmrc`, which made every first publish in this workspace impossible.

One line — `provenance=true` — added in `2e7bfc3` to "enable provenance for npm trusted publishing". It did
not do that. npm attaches a provenance attestation to a trusted-publishing release on its own; the config
exists to turn that behaviour *off*. What the line did instead was apply to every package in the workspace
and make `npm publish` refuse to run outside a CI runner:

```
npm error code EUSAGE
npm error Automatic provenance generation not supported for provider: null
```

That is not a corner case. npm only lets a trusted publisher be configured for a package that already
exists, so **every** package's first version has to be published by hand — and this file guaranteed that
every one of them would fail, with an error naming neither the file nor the setting. It caught
`@cruglobal/cornerstone-components` at exactly that step. Removing the flag from the package manifest was
not enough, because a project `.npmrc` outranks nothing in the manifest: it is a separate, higher-level
source that had to be found before `--no-provenance` on the command line could get past it.

`packages/tokens` keeps `publishConfig.provenance` in its own manifest, so the one package that publishes
only from CI still declares it explicitly, and nothing that a maintainer runs by hand is affected. Nothing
about what either package ships changes.
