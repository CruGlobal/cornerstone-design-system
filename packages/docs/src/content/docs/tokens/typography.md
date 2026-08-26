---
title: Typography
description: Typography tokens define font styles, sizing, and vertical rhythm across Cornerstone.
synonyms:
  - fonts
  - type scale
  - font size
use-cases:
  - font family
  - line height
  - font weight
  - text tokens
---

Typography tokens give your theme consistent, scalable text styles across every component. You can adjust individual tokens or use scale multipliers to change all sizes or weights at once.

## Font Family

Font family tokens are assigned to specific roles — body text, headings, code, and long-form prose. By default, they use system fonts for maximum performance.

<cs-scroller>
  <table class="token-table cs-hover-rows">
    <thead>
      <tr><th>Custom Property</th><th>Description</th><th>Preview</th></tr>
    </thead>
    <tbody>
      <tr id="token-cs-font-family-body">
        <td class="token-name"><code>--cs-font-family-body</code></td>
        <td>Default font for body text and UI components</td>
        <td><div style="font-family: var(--cs-font-family-body)">Sphinx of black quartz, judge my vow.</div></td>
      </tr>
      <tr id="token-cs-font-family-heading">
        <td class="token-name"><code>--cs-font-family-heading</code></td>
        <td>Font for headings</td>
        <td><div style="font-family: var(--cs-font-family-heading)">Sphinx of black quartz, judge my vow.</div></td>
      </tr>
      <tr id="token-cs-font-family-code">
        <td class="token-name"><code>--cs-font-family-code</code></td>
        <td>Font for code blocks and inline code</td>
        <td><div style="font-family: var(--cs-font-family-code)">Sphinx of black quartz, judge my vow.</div></td>
      </tr>
      <tr id="token-cs-font-family-longform">
        <td class="token-name"><code>--cs-font-family-longform</code></td>
        <td>Font for long-form prose and reading-optimized content</td>
        <td><div style="font-family: var(--cs-font-family-longform)">Sphinx of black quartz, judge my vow.</div></td>
      </tr>
    </tbody>
  </table>
</cs-scroller>

## Font Size

Font sizes use a ratio of 1.125 to scale proportionally. The medium size (`m`) is the base; sizes below are 1.125× smaller and sizes above are _twice_ 1.125× larger to maximize visual contrast between larger sizes. All values use `rem` units and round to the nearest whole pixel.

Use `--cs-font-size-scale` to proportionally increase or decrease all sizes at once.

<cs-scroller>
  <table class="token-table cs-hover-rows">
    <thead>
      <tr><th>Custom Property</th><th>Description</th><th>Preview</th></tr>
    </thead>
    <tbody>
      <tr id="token-cs-font-size-scale">
        <td class="token-name"><code>--cs-font-size-scale</code></td>
        <td>Global multiplier applied to all font size calculations</td>
        <td>—</td>
      </tr>
      <tr id="token-cs-font-size-3xs">
        <td class="token-name"><code>--cs-font-size-3xs</code></td>
        <td>Smallest font size. Use sparingly and only for non-essential UI.</td>
        <td><div style="font-size: var(--cs-font-size-3xs)">AaBb</div></td>
      </tr>
      <tr id="token-cs-font-size-2xs">
        <td class="token-name"><code>--cs-font-size-2xs</code></td>
        <td>Near-smallest font size. Use sparingly and only for non-essential UI.</td>
        <td><div style="font-size: var(--cs-font-size-2xs)">AaBb</div></td>
      </tr>
      <tr id="token-cs-font-size-xs">
        <td class="token-name"><code>--cs-font-size-xs</code></td>
        <td>Extra-small font size, suitable for labels and metadata</td>
        <td><div style="font-size: var(--cs-font-size-xs)">AaBb</div></td>
      </tr>
      <tr id="token-cs-font-size-s">
        <td class="token-name"><code>--cs-font-size-s</code></td>
        <td>Small font size, for secondary text and hints</td>
        <td><div style="font-size: var(--cs-font-size-s)">AaBb</div></td>
      </tr>
      <tr id="token-cs-font-size-m">
        <td class="token-name"><code>--cs-font-size-m</code></td>
        <td>Base font size, used for most body text</td>
        <td><div style="font-size: var(--cs-font-size-m)">AaBb</div></td>
      </tr>
      <tr id="token-cs-font-size-l">
        <td class="token-name"><code>--cs-font-size-l</code></td>
        <td>Large font size, for slightly emphasized text and small headings</td>
        <td><div style="font-size: var(--cs-font-size-l)">AaBb</div></td>
      </tr>
      <tr id="token-cs-font-size-xl">
        <td class="token-name"><code>--cs-font-size-xl</code></td>
        <td>Extra-large font size, for subheadings</td>
        <td><div style="font-size: var(--cs-font-size-xl)">AaBb</div></td>
      </tr>
      <tr id="token-cs-font-size-2xl">
        <td class="token-name"><code>--cs-font-size-2xl</code></td>
        <td>2× extra-large font size, for section headings</td>
        <td><div style="font-size: var(--cs-font-size-2xl)">AaBb</div></td>
      </tr>
      <tr id="token-cs-font-size-3xl">
        <td class="token-name"><code>--cs-font-size-3xl</code></td>
        <td>3× extra-large font size, for page headings</td>
        <td><div style="font-size: var(--cs-font-size-3xl)">AaBb</div></td>
      </tr>
      <tr id="token-cs-font-size-4xl">
        <td class="token-name"><code>--cs-font-size-4xl</code></td>
        <td>4× extra-large font size, for display headings</td>
        <td><div style="font-size: var(--cs-font-size-4xl)">AaBb</div></td>
      </tr>
      <tr id="token-cs-font-size-5xl">
        <td class="token-name"><code>--cs-font-size-5xl</code></td>
        <td>5× extra-large font size, for hero headlines</td>
        <td><div style="font-size: var(--cs-font-size-5xl)">AaBb</div></td>
      </tr>
      <tr id="token-cs-font-size-smaller">
        <td class="token-name"><code>--cs-font-size-smaller</code></td>
        <td>Makes text proportionally smaller relative to its parent's font size</td>
        <td><div>Normal &#8594; <span style="font-size: var(--cs-font-size-smaller)">smaller</span></div></td>
      </tr>
      <tr id="token-cs-font-size-larger">
        <td class="token-name"><code>--cs-font-size-larger</code></td>
        <td>Makes text proportionally larger relative to its parent's font size</td>
        <td><div>Normal &#8594; <span style="font-size: var(--cs-font-size-larger)">larger</span></div></td>
      </tr>
    </tbody>
  </table>
</cs-scroller>

## Font Weight

Font weight tokens come in two flavors: named weights that cover the full range, and role-based weights for specific text types. Role-based weights reference named weights by default.

<cs-scroller>
  <table class="token-table cs-hover-rows">
    <thead>
      <tr><th>Custom Property</th><th>Description</th><th>Preview</th></tr>
    </thead>
    <tbody>
      <tr id="token-cs-font-weight-light">
        <td class="token-name"><code>--cs-font-weight-light</code></td>
        <td>Light text weight</td>
        <td><div style="font-weight: var(--cs-font-weight-light)">AaBb</div></td>
      </tr>
      <tr id="token-cs-font-weight-normal">
        <td class="token-name"><code>--cs-font-weight-normal</code></td>
        <td>Normal text weight</td>
        <td><div style="font-weight: var(--cs-font-weight-normal)">AaBb</div></td>
      </tr>
      <tr id="token-cs-font-weight-semibold">
        <td class="token-name"><code>--cs-font-weight-semibold</code></td>
        <td>Medium/semibold text weight</td>
        <td><div style="font-weight: var(--cs-font-weight-semibold)">AaBb</div></td>
      </tr>
      <tr id="token-cs-font-weight-bold">
        <td class="token-name"><code>--cs-font-weight-bold</code></td>
        <td>Bold text weight</td>
        <td><div style="font-weight: var(--cs-font-weight-bold)">AaBb</div></td>
      </tr>
      <tr id="token-cs-font-weight-body">
        <td class="token-name"><code>--cs-font-weight-body</code></td>
        <td>Weight for body/paragraph text</td>
        <td><div style="font-weight: var(--cs-font-weight-body)">AaBb</div></td>
      </tr>
      <tr id="token-cs-font-weight-heading">
        <td class="token-name"><code>--cs-font-weight-heading</code></td>
        <td>Weight for headings</td>
        <td><div style="font-weight: var(--cs-font-weight-heading)">AaBb</div></td>
      </tr>
      <tr id="token-cs-font-weight-code">
        <td class="token-name"><code>--cs-font-weight-code</code></td>
        <td>Weight for code</td>
        <td><div style="font-weight: var(--cs-font-weight-code); font-family: var(--cs-font-family-code)">AaBb</div></td>
      </tr>
      <tr id="token-cs-font-weight-longform">
        <td class="token-name"><code>--cs-font-weight-longform</code></td>
        <td>Weight for long-form prose</td>
        <td><div style="font-weight: var(--cs-font-weight-longform)">AaBb</div></td>
      </tr>
      <tr id="token-cs-font-weight-action">
        <td class="token-name"><code>--cs-font-weight-action</code></td>
        <td>Weight for interactive text like button labels and tabs. Also recommended for links that don't use text decorations.</td>
        <td><div style="font-weight: var(--cs-font-weight-action)">AaBb</div></td>
      </tr>
    </tbody>
  </table>
</cs-scroller>

## Line Height

Line heights are unitless to scale proportionately with text size. For readability, paragraph text should be at least `1.5`.

<cs-scroller>
  <table class="token-table cs-hover-rows">
    <thead>
      <tr><th>Custom Property</th><th>Description</th><th>Preview</th></tr>
    </thead>
    <tbody>
      <tr id="token-cs-line-height-condensed">
        <td class="token-name"><code>--cs-line-height-condensed</code></td>
        <td>Tight line height for headings and short UI text</td>
        <td><div style="line-height: var(--cs-line-height-condensed); border-block-color: var(--cs-color-neutral-border-loud)">The quick brown fox<br>jumps over the lazy dog</div></td>
      </tr>
      <tr id="token-cs-line-height-normal">
        <td class="token-name"><code>--cs-line-height-normal</code></td>
        <td>Standard line height for body/paragraph text</td>
        <td><div style="line-height: var(--cs-line-height-normal); border-block-color: var(--cs-color-neutral-border-loud)">The quick brown fox<br>jumps over the lazy dog</div></td>
      </tr>
      <tr id="token-cs-line-height-expanded">
        <td class="token-name"><code>--cs-line-height-expanded</code></td>
        <td>Open line height for reading-optimized or airy content</td>
        <td><div style="line-height: var(--cs-line-height-expanded); border-block-color: var(--cs-color-neutral-border-loud)">The quick brown fox<br>jumps over the lazy dog</div></td>
      </tr>
    </tbody>
  </table>
</cs-scroller>

## Link Decoration

Together with [`--cs-color-text-link`](/tokens/color), these tokens add text decoration to `<a>` elements to signal their role as hyperlinks.

<cs-scroller>
  <table class="token-table cs-hover-rows">
    <thead>
      <tr><th>Custom Property</th><th>Description</th><th>Preview</th></tr>
    </thead>
    <tbody>
      <tr id="token-cs-link-decoration-default">
        <td class="token-name"><code>--cs-link-decoration-default</code></td>
        <td>Text decoration applied to links in their default (non-hovered) state</td>
        <td><span class="cs-link" style="text-decoration: var(--cs-link-decoration-default)">Link text</span></td>
      </tr>
      <tr id="token-cs-link-decoration-hover">
        <td class="token-name"><code>--cs-link-decoration-hover</code></td>
        <td>Text decoration applied to links on hover</td>
        <td><span class="cs-link" style="text-decoration: var(--cs-link-decoration-hover)">Link text</span></td>
      </tr>
    </tbody>
  </table>
</cs-scroller>
