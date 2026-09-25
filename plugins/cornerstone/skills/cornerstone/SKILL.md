---
name: cornerstone
description: >
  The API reference for Cornerstone Components (@cruglobal/cornerstone-components), Cru's cs-* web
  component library. Use when writing or changing markup with any cs-* element (buttons, inputs,
  selects, checkboxes, dialogs, drawers, tabs, dropdowns, tooltips, icons, forms) or the CSS
  utilities such as cs-stack, cs-cluster, cs-split and cs-grid, and when you need a component's exact
  attributes, slots, events, parts or framework setup. For layout, theming and how to design a page
  with the system, load the `cornerstone-design` skill first.
---

# Cornerstone Components

This skill is a pointer. The real one ships inside the `@cruglobal/cornerstone-components` package,
because that copy is generated from the library's Custom Elements Manifest and matches the version this
project installed. A copy kept here would describe whatever version the plugin last saw.

## 1. Find the installed skill

Look for this file, starting at the project root:

```
node_modules/@cruglobal/cornerstone-components/dist/unbundled/skills/cornerstone/SKILL.md
```

In a monorepo the package is often hoisted, so if it is not under the app's own directory, look in each
parent directory up to the repository root (`git rev-parse --show-toplevel`), and in the workspace
root.

## 2. Follow it

Read that `SKILL.md` and follow it as if it were this skill. Its `references/` directory holds one file
per component under `references/components/`, plus `references/choosing-components.md` for picking the
right component. Read them from the same directory you found the skill in, not from anywhere else.

## 3. If the package is not installed

Some apps load Cornerstone from a CDN and have no `node_modules` copy. Then read the same skill from
the documentation site, which serves the build of the `main` branch:

- `https://cruglobal.github.io/cornerstone-design-system/dist/skills/cornerstone/SKILL.md`, and its
  references under `.../dist/skills/cornerstone/references/`
- `https://cruglobal.github.io/cornerstone-design-system/dist/llms.txt`, the whole component reference
  in one file

That build can be ahead of the version the app loads. If an attribute there does not exist in the app, check the version the app's script tag pins.
