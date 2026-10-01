---
'@cruglobal/cornerstone-design-system': patch
---

Changed: the repo's agent guidance loads less up front. The release-publishing notes now load only when release config is touched, and the component guide names event classes `Cs<Name>Event`, as the code does, and sends changelog entries to changesets instead of a hand-edited page.
