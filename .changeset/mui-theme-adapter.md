---
"@cruglobal/cornerstone-design-system": minor
---

Add a Material UI theme adapter under `libraries/mui` (new `./mui` export). `createCornerstoneTheme({ brand, mode })` and `cornerstoneThemeOptions()` map Cornerstone `_sys` tokens onto an MUI theme so MUI apps (mpdx-react, give-web) render with Cru / FamilyLife brand colors, typography, and radius. `@mui/material` is an optional peer dependency.
