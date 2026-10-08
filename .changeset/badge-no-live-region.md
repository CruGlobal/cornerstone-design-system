---
'@cruglobal/cornerstone-components': patch
---

Changed: `<cs-badge>` no longer announces its text as a live region, so its text now joins the accessible name of a button it is in. Apps that need a change announced keep their own live region outside the control. The Badge page, and so the shipped `cornerstone` skill, says so.
