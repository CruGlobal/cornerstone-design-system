---
'@cruglobal/cornerstone-components': patch
---

Changed: the component test suite's server-rendered fixture now loads only the components a test's template uses, which cuts test time by about a third. Four `<cs-combobox>` tests no longer depend on how fast keystrokes arrive. Nothing in the published package changes.
