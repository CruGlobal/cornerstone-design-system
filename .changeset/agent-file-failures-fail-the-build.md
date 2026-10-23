---
'@cruglobal/cornerstone-components': patch
---

Fixed: A failed agent-file step now fails the build. An error while writing the agent skills or `llms.txt` exits non-zero instead of 0.
