# What UIUX-68 shipped, and whether cs-avatar covers the icon tile

Research for [#316](https://github.com/CruGlobal/cornerstone-design-system/issues/316), feeding the list
decision in [#317](https://github.com/CruGlobal/cornerstone-design-system/issues/317) on map
[#224](https://github.com/CruGlobal/cornerstone-design-system/issues/224). Facts only. All file paths and line
numbers are at `main` as of `43b4305`.

## 1. What UIUX-68 "Component — List" shipped

**Short answer: nothing in this repo can be tied to UIUX-68.** No list component, no commit, no issue and no
file names it. The only list features that exist arrived in the monorepo import and were never tagged with a
ticket.

### The Jira ticket itself

No Jira connector was available in this session, so the ticket, its description and its resolution were not
read. Everything below comes from the repo and GitHub.

### Searches that found nothing

- `git log --all --grep "UIUX-68"` and `git log --all -S "UIUX-68"`: no commits.
- `grep -rI "UIUX-6[0-9]"` over the working tree (excluding `node_modules`): no hits.
- GitHub search `"UIUX-68" org:CruGlobal`: only #316 and #317, the tickets asking this question.
- `git log --all -S "cs-list"`: only the import commit `2b8c67e` and `823c8ad` (the roadmap generator, which
  uses the `cs-list-plain` class). No `cs-list` element was ever added.
- `packages/components/src/components/` has 70 directories and none is a list
  (`accordion` through `zoomable-frame`). The closest are `tree`/`tree-item` and `dropdown`/`dropdown-item`.
- Neither `packages/components/CHANGELOG.md` nor `packages/tokens/CHANGELOG.md` has an entry adding a list
  component, class or page.
- GitHub milestones (`1.0.0`, `1.1.0`, `1.2.0`, `1.3.0`, `Frameworks`) and issue titles containing "list" show
  no list work beyond #317.

### Why history can't settle it

- The lowest Jira key in any commit message is **UIUX-89** (`git log --all --format=%B | grep -oE "UIUX-[0-9]+"`,
  first seen in a commit dated 2026-08-12). UIUX-68 is older than any ticket key the repo records.
- The component library and docs came in as one squashed commit, `2b8c67e` (2026-08-25, "Bring the component
  library and its documentation into the monorepo"). Its earlier history lived in
  `CruGlobal/cornerstone-components`, which the commit message names, but that repo no longer resolves on
  GitHub (`gh repo view CruGlobal/cornerstone-components` returns "Could not resolve to a Repository"). So any
  pre-import work on UIUX-68 can't be checked from here.
- `packages/components/CLAUDE.md` says the library is a hard fork of Web Awesome, which has no list component
  either. The list styling below matches what that fork carried in.

### What list support does exist (all from `2b8c67e`, untagged)

| What | Where | Notes |
| --- | --- | --- |
| Native `ul`/`ol`/`li`/`dl`/`menu` styles | `packages/components/src/styles/native.css:166-210` | Disc bullets, indents, marker colors at 40% / 60% of `currentColor`, bold `dt`, `menu` reset. `git blame`: every line is `2b8c67e`. |
| `cs-list-plain` utility class | `packages/components/src/styles/utilities/text.css:252-261` | Only works on `ol`/`ul`. Removes markers, padding and `li` indent. Nothing else. |
| Docs for native lists | `packages/docs/src/content/docs/utilities/native.md:174-240` | "Lists", `<menu>`, and `<dl>` sections. |
| Docs for `cs-list-plain` | `packages/docs/src/content/docs/utilities/text.md:120-126` | "Lists" section with one example. |
| Truncation inside list items | `packages/docs/src/content/docs/utilities/text.md:266` | Added in `a36076d`. Says to wrap clamped text in a child of the `li`. |

None of these is a list *row*: there is no leading slot, title/description pair, trailing slot, divider rule,
or selected/interactive state. The Patterns page lists no list pattern (`packages/docs/src/content/docs/resources/patterns.md:38-48`
says patterns are not published yet).

## 2. Does `cs-avatar` cover the icon tile (40px square, icon on a tinted background)?

**Short answer: partly. Size, square shape and a custom icon work today through the public API. A tinted
background does not: there is no property, variant or custom property for it.**

Sources: `packages/components/src/components/avatar/avatar.ts`, `avatar.styles.ts`, `avatar.test.ts`, and
`packages/docs/src/content/docs/components/avatar.md`. The avatar files were last changed in `628cf46`
(UIUX-197, renamed `--size` to `--cs-avatar-size`) and `4f8d9f7` (`@since`).

### Public API

| Kind | Name | Source |
| --- | --- | --- |
| Property | `image`, `label`, `initials`, `loading` (`eager`/`lazy`) | `avatar.ts:36-46` |
| Property | `shape`: `circle` (default) / `square` / `rounded`, reflected | `avatar.ts:48-49` |
| Slot | `icon` (fallback is `<cs-icon name="person" library="system">`) | `avatar.ts:19`, `:95-99` |
| Parts | `icon`, `initials`, `image` | `avatar.ts:24-26` |
| Custom property | `--cs-avatar-size` (default `3rem`) | `avatar.ts:28`, `avatar.styles.ts:9-13` |
| Event | `cs-error` | `avatar.ts:21` |

`static css = styles` only (`avatar.ts:32`). It does not include the shared `variantStyles` or `sizeStyles`, so
there is no `variant` and no `size` attribute.

### What works today

- **40px:** `style="--cs-avatar-size: 40px"` (or `2.5rem`) sets width and height (`avatar.styles.ts:9-10`).
  There is no preset size; the default is 48px.
- **Square:** `shape="square"` sets `border-radius: 0` (`avatar.styles.ts:21-23`). `shape="rounded"` sets
  `var(--cs-border-radius-m)` (`:25-27`). There is no other radius option.
- **Icon:** `<cs-icon slot="icon" name="...">` replaces the person icon, shown when `image` and `initials` are
  both empty (`avatar.ts:90-100`; docs `avatar.md:50-66`).
- **Icon size:** follows the host `font-size`, fixed at 40% of the avatar size (`avatar.styles.ts:13`), so a 40px
  avatar gives a 16px font size. `cs-icon`'s default canvas is `1.25em` x `1em`
  (`packages/components/src/components/icon/icon.styles.ts:16-22`), so about 20 x 16px. There is no knob for the
  ratio.

### What is missing

- **Tinted background:** the background is hard-coded to `var(--cs-color-neutral-fill-normal)` and the icon color
  to `var(--cs-color-neutral-on-normal)` (`avatar.styles.ts:11`, `:15`). There is no `--cs-avatar-background` /
  `--cs-avatar-color` custom property, no `variant` attribute, and no part on the host.
- **Variant classes don't reach it:** the `.cs-brand`, `.cs-success` and other utility classes set the generic
  `--cs-color-fill-*` / `--cs-color-on-*` aliases (`packages/components/src/styles/utilities/variants.css:1-40`).
  The avatar reads the `neutral`-specific tokens, so wrapping it in `.cs-brand` changes nothing.
- **Only workaround:** plain CSS on the element, for example `cs-avatar.tile { background-color: ...; color: ... }`.
  By the CSS cascade's context rule, a normal declaration from the page beats the component's `:host` rule. This
  was not tested in a browser for this research, and it is not a documented or tested API: no docs example and
  no test sets the avatar's background (`avatar.test.ts` checks shape reflection at `:60-71` and nothing about
  color).
- **Decorative use:** the icon slot always carries `role="img"` and `aria-label=${label}` (`avatar.ts:96`). There
  is no decorative or `aria-hidden` mode. Every accessibility test passes a `label` (`avatar.test.ts:14-35`); an
  unlabelled avatar is not tested. A tile next to a row's own text would either repeat that text as the label or
  expose an unnamed `img`.
- **Purpose:** the summary and docs describe it as representing "a person or object" with image, initials or
  icon (`avatar.ts:11-12`, `avatar.md:14`). Its docs synonyms are all person-related (`avatar.md:4-8`). Nothing
  in the docs shows it as a generic icon tile.
