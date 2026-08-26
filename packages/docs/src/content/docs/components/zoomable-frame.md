---
title: Zoomable Frame
category: Media
synonyms:
  - iframe zoom
  - preview frame
  - minimap
use-cases:
  - component preview
  - responsive preview
  - scaled iframe
description: "Zoomable frames embed iframe content with built-in controls for zooming, panning, and managing interaction."
---

```html {.example}
<cs-zoomable-frame src="/examples/themes/showcase" zoom="0.5"> </cs-zoomable-frame>
```

## Examples

### External Content

Use the `src` attribute to embed external websites or resources. The URL must be accessible, and cross-origin restrictions may apply due to the Same-Origin Policy, potentially limiting access to the iframe's content.

```html
<cs-zoomable-frame src="https://example.com/"> </cs-zoomable-frame>
```

### Aspect Ratio

The frame fills 100% width with a 16:9 aspect ratio by default. Change it with the `aspect-ratio` CSS property.

```html
<cs-zoomable-frame src="https://example.com/" style="aspect-ratio: 4/3;"> </cs-zoomable-frame>
```

### Inline Content

Use the `srcdoc` attribute or property to render custom HTML directly in the frame, without an external resource.

```html
<cs-zoomable-frame srcdoc="<html><body><h1>Hello, World!</h1><p>This is inline content.</p></body></html>">
</cs-zoomable-frame>
```

:::info
When both `src` and `srcdoc` are specified, `srcdoc` takes precedence.
:::

### Zoom

Set the `zoom` attribute to control the frame's zoom level. Use `1` for 100%, `2` for 200%, `0.5` for 50%, and so on.

Define specific zoom increments with the `zoom-levels` attribute using space-separated percentages and decimal values like `zoom-levels="0.25 0.5 75% 100%"`.

```html {.example}
<cs-zoomable-frame src="/examples/themes/showcase" zoom="0.5" zoom-levels="50% 0.75 100%"> </cs-zoomable-frame>
```

### Zoom Controls

Add the `without-controls` attribute to hide the zoom control interface from the frame.

```html {.example}
<cs-zoomable-frame src="/examples/themes/showcase" without-controls zoom="0.5"> </cs-zoomable-frame>
```

### User Interaction

Apply the `without-interaction` attribute to make the frame non-interactive. This also prevents keyboard navigation into the frame, which may impact accessibility for some users.

```html {.example}
<cs-zoomable-frame src="/examples/themes/showcase" zoom="0.5" without-interaction> </cs-zoomable-frame>
```

### Theme Sync

By default, the frame does not sync theme classes into the iframe. Add the `with-theme-sync` attribute to mirror the host page's light/dark mode and [theme selector classes](/theming-overview) (such as `cs-theme-*`, `cs-brand-*`, and `cs-palette-*`) into the iframe document. This is useful when the iframe renders Cornerstone styles that should match the host page's theme.

```html {.example}
<cs-zoomable-frame src="/examples/themes/showcase" zoom="0.5" with-theme-sync> </cs-zoomable-frame>
```
