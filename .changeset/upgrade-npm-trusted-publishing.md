---
"@cruglobal/cornerstone-design-system": patch
---

Upgrade the npm CLI used in the release workflow from the pinned 11.5.1 to the latest release. npm 11.5.1 is the GA-boundary version with known OIDC trusted-publishing bugs that surface as a misleading `ENEEDAUTH` error during publish; upgrading resolves the authentication failure so the package can publish via trusted publishing.
