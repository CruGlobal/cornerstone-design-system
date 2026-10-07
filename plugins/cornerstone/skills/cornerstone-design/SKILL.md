---
name: cornerstone-design
description: >
  How to design and build UI with Cornerstone. Load this before any UI work in an app that uses
  Cornerstone (@cruglobal/cornerstone-components): building, porting or restyling a page, view,
  layout, app shell, navigation, sidebar, form or section; choosing or applying a theme or brand
  color; or making something look designed. Covers layout with <cs-page> and the layout utilities,
  theming with --cs-* tokens, and visual composition. Pair with the `cornerstone` skill for
  individual component APIs.
---

# Designing with Cornerstone

This skill is a pointer. The real one ships inside the `@cruglobal/cornerstone-components` package,
because that copy is generated with the library and matches the version this project installed. A copy
kept here would describe whatever version the plugin last saw.

## 1. Find the installed skill

Look for this file, starting at the project root:

```
node_modules/@cruglobal/cornerstone-components/dist/unbundled/skills/cornerstone-design/SKILL.md
```

In a monorepo the package is often hoisted, so if it is not under the app's own directory, look in each
parent directory up to the repository root (`git rev-parse --show-toplevel`), and in the workspace
root.

## 2. Follow it

Read that `SKILL.md` in full and follow it as if it were this skill. It routes you to files under its
own `references/` directory; read those from the same directory you found it in, not from anywhere else.
Its first step, deciding between `<cs-page>` and layout utilities, applies before you write any markup.

## 3. If the package is not installed

Some apps load Cornerstone from a CDN and have no `node_modules` copy. Then read the same skill from
the documentation site, which serves the build of the `main` branch:

- `https://cruglobal.github.io/cornerstone-design-system/dist/skills/cornerstone-design/SKILL.md`, and
  its references under `.../dist/skills/cornerstone-design/references/`
- `https://cruglobal.github.io/cornerstone-design-system/dist/llms.txt`, the whole component reference
  in one file

That build can be ahead of the version the app loads. If something there does not work in the app, check the version the app's script tag pins.
