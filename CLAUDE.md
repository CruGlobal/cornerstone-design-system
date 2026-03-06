# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is the **Cornerstone Design System** for CruGlobal — a documentation and design token repository. There is no build system or test suite; the primary artifacts are `tokens.json` and supporting Markdown documentation.

## Token Architecture

Tokens follow a strict three-tier hierarchy: **ref → sys → cmp**

- **ref (reference):** Raw primitive values — color palettes, numeric scales, etc. Not consumed directly by components.
- **sys (system):** Semantic roles that alias ref tokens (e.g., `sys/color/primary` → `ref/color/yellow/500`). This tier is where brand and theme differentiation happens.
- **cmp (component):** Component-specific tokens that alias sys tokens. No modes — brand-agnostic.

## Multi-Brand / Multi-Theme Strategy

The system supports 7 brands: **cru, mil, aia, fl, jfp, unto, josh** — each with light and dark themes (14 total `sys/color` modes).

- `ref/color` collection uses **brand as modes**. Every brand mode provides values for the full superset of hue names across all brands; unused hues get a neutral fallback.
- `sys/color` collection uses **brand × theme as modes** (e.g., `cru-light`, `josh-dark`). Each mode aliases semantic roles to the correct ref hue for that brand.
- `cmp/color` collection has no modes and aliases only into `sys/color`.

## tokens.json Format

Follows the [W3C Design Token Community Group spec](https://design-tokens.github.io/community-group/format/). Each token object uses `$type` and `$value` (and optionally `$description`). Token values support:

- **Aliases:** `{path.to.token}` syntax
- **Math expressions:** e.g., `ceil(roundTo({scale.unitless.md-min} * {scale.multiplier-min}, 0) / {scale.factor}) * {scale.factor}`
- **Fluid/responsive scaling:** Tokens are computed from "knobs" (`base-min`, `base-max`, `multiplier-min`, `multiplier-max`, `factor`) that drive min/max scale calculations for fluid typography and spacing.

Top-level keys in `tokens.json` use slash-separated namespacing: `"Utility/size/fixed"`, `"Utility/size/knobs"`, etc.

## Figma Construct Mapping

When working with tokens in Figma context:

| Token domain | Figma construct |
|---|---|
| color | Variable (Color) |
| space, size, border-radius, border-width, opacity, z-index, font-size, font-weight, line-height, letter-spacing | Variable (Number) |
| font-family | Variable (String) |
| typography (composite) | Text Style |
| elevation/shadow | Effect Style |
| gradient | Color Style |
| motion/easing, time/duration | Not in Figma — token JSON only |

## PR Checklist

PRs should identify the type of change (bug fix, new feature, breaking change, documentation update, design token update) and the component(s) affected (Button, Input, Card, Typography, Design Tokens, Documentation). See `.github/pull_request_template.md`.
