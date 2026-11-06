---
'@cruglobal/cornerstone-design-system': patch
---

Fixed: the `./mui` export now resolves to compiled JavaScript with declarations, so `import '@cruglobal/cornerstone-design-system/mui'` loads under plain Node ESM, Jest, Vitest and JS-only bundlers, not only behind a TypeScript-aware bundler.
