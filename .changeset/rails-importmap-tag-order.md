---
'@cruglobal/cornerstone-components': patch
---

Fixed: the Rails guide, which ships in the `cornerstone` skill, now says to put every Cornerstone module tag after `javascript_importmap_tags`. Firefox drops an import map that comes after a module load, which stops the app's own JavaScript while the components still draw.
