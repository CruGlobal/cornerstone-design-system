---
title: Component Groups
description: Component group tokens style sets of related components that share visual qualities.
synonyms:
  - component tokens
  - group tokens
use-cases:
  - shared tokens
  - token sets
---

Component tokens let you style groups of related components at once. Rather than overriding individual component styles, these tokens propagate the style across every component that shares a given visual quality.

## Form Controls

Components such as [input](/components/input), [select](/components/select), [textarea](/components/textarea), [checkbox](/components/checkbox), and others share styles defined with the `--cs-form-control-*` prefix.

Not every form control uses all of these custom properties. For example, [radio](/components/radio) defines its own height and border radius to achieve its familiar shape but shares many other styles with other components for a cohesive look and feel. Similarly, [button](/components/button) defines many of its own styles but matches the height and border width of other form controls.

<cs-scroller>
  <table class="token-table cs-hover-rows">
    <thead>
      <tr><th>Custom Property</th><th>Description</th></tr>
    </thead>
    <tbody>
      <tr id="token-cs-form-control-background-color">
        <td class="token-name"><code>--cs-form-control-background-color</code></td>
        <td>Background color of form control inputs</td>
      </tr>
      <tr id="token-cs-form-control-border-color">
        <td class="token-name"><code>--cs-form-control-border-color</code></td>
        <td>Border color of form control inputs</td>
      </tr>
      <tr id="token-cs-form-control-border-style">
        <td class="token-name"><code>--cs-form-control-border-style</code></td>
        <td>Border line style of form control inputs</td>
      </tr>
      <tr id="token-cs-form-control-border-width">
        <td class="token-name"><code>--cs-form-control-border-width</code></td>
        <td>Border thickness of form control inputs</td>
      </tr>
      <tr id="token-cs-form-control-border-radius">
        <td class="token-name"><code>--cs-form-control-border-radius</code></td>
        <td>Corner rounding of form control inputs</td>
      </tr>
      <tr id="token-cs-form-control-activated-color">
        <td class="token-name"><code>--cs-form-control-activated-color</code></td>
        <td>Accent color when a control is active, checked, or selected</td>
      </tr>
      <tr id="token-cs-form-control-label-color">
        <td class="token-name"><code>--cs-form-control-label-color</code></td>
        <td>Text color of form control labels</td>
      </tr>
      <tr id="token-cs-form-control-label-font-weight">
        <td class="token-name"><code>--cs-form-control-label-font-weight</code></td>
        <td>Font weight of form control labels</td>
      </tr>
      <tr id="token-cs-form-control-label-line-height">
        <td class="token-name"><code>--cs-form-control-label-line-height</code></td>
        <td>Line height of form control labels</td>
      </tr>
      <tr id="token-cs-form-control-value-color">
        <td class="token-name"><code>--cs-form-control-value-color</code></td>
        <td>Text color of the user-entered or selected value</td>
      </tr>
      <tr id="token-cs-form-control-value-font-weight">
        <td class="token-name"><code>--cs-form-control-value-font-weight</code></td>
        <td>Font weight of the user-entered or selected value</td>
      </tr>
      <tr id="token-cs-form-control-value-line-height">
        <td class="token-name"><code>--cs-form-control-value-line-height</code></td>
        <td>Line height of the user-entered or selected value</td>
      </tr>
      <tr id="token-cs-form-control-hint-color">
        <td class="token-name"><code>--cs-form-control-hint-color</code></td>
        <td>Text color of the hint text below a form control</td>
      </tr>
      <tr id="token-cs-form-control-hint-font-weight">
        <td class="token-name"><code>--cs-form-control-hint-font-weight</code></td>
        <td>Font weight of hint text</td>
      </tr>
      <tr id="token-cs-form-control-hint-line-height">
        <td class="token-name"><code>--cs-form-control-hint-line-height</code></td>
        <td>Line height of hint text</td>
      </tr>
      <tr id="token-cs-form-control-placeholder-color">
        <td class="token-name"><code>--cs-form-control-placeholder-color</code></td>
        <td>Text color of input placeholder text</td>
      </tr>
      <tr id="token-cs-form-control-required-content">
        <td class="token-name"><code>--cs-form-control-required-content</code></td>
        <td>Content appended to labels of required fields</td>
      </tr>
      <tr id="token-cs-form-control-required-content-color">
        <td class="token-name"><code>--cs-form-control-required-content-color</code></td>
        <td>Color of the required field indicator</td>
      </tr>
      <tr id="token-cs-form-control-required-content-offset">
        <td class="token-name"><code>--cs-form-control-required-content-offset</code></td>
        <td>Inline spacing between the label text and required indicator</td>
      </tr>
      <tr id="token-cs-form-control-padding-block">
        <td class="token-name"><code>--cs-form-control-padding-block</code></td>
        <td>Block (top/bottom) padding inside form control inputs</td>
      </tr>
      <tr id="token-cs-form-control-padding-inline">
        <td class="token-name"><code>--cs-form-control-padding-inline</code></td>
        <td>Inline (left/right) padding inside form control inputs</td>
      </tr>
      <tr id="token-cs-form-control-height">
        <td class="token-name"><code>--cs-form-control-height</code></td>
        <td>Computed height of single-line form controls; derived from padding and line height</td>
      </tr>
      <tr id="token-cs-form-control-toggle-size">
        <td class="token-name"><code>--cs-form-control-toggle-size</code></td>
        <td>Size of toggle controls (checkboxes, radios, switches)</td>
      </tr>
    </tbody>
  </table>
</cs-scroller>

```html {.example}
<form class="cs-stack">
  <cs-input label="Input" placeholder="Placeholder"></cs-input>
  <cs-select label="Select" value="option-1">
    <cs-option value="option-1">Option 1</cs-option>
    <cs-option value="option-2">Option 2</cs-option>
    <cs-option value="option-3">Option 3</cs-option>
  </cs-select>
  <cs-textarea label="Textarea" placeholder="Placeholder"></cs-textarea>
  <cs-radio-group label="Radio group" name="a" value="1">
    <cs-radio value="1">Option 1</cs-radio>
    <cs-radio value="2">Option 2</cs-radio>
    <cs-radio value="3">Option 3</cs-radio>
  </cs-radio-group>
  <cs-checkbox>Checkbox</cs-checkbox>
  <cs-switch>Switch</cs-switch>
  <cs-slider label="Range"></cs-slider>
  <cs-button>Button</cs-button>
</form>
```

## Buttons

In addition to sharing styles with form controls, [buttons](/components/button) have their own subset of unique tokens.

<cs-scroller>
  <table class="token-table cs-hover-rows">
    <thead>
      <tr><th>Custom Property</th><th>Description</th><th>Preview</th></tr>
    </thead>
    <tbody>
      <tr id="token-cs-button-transform-hover">
        <td class="token-name"><code>--cs-button-transform-hover</code></td>
        <td>A transform function to apply to buttons on mouseover/hover</td>
        <td><cs-button variant="brand" appearance="filled">Mouse Over Me</cs-button></td>
      </tr>
      <tr id="token-cs-button-transform-active">
        <td class="token-name"><code>--cs-button-transform-active</code></td>
        <td>A transform function to apply to buttons when pressed/active</td>
        <td><cs-button variant="brand" appearance="filled">Press Me</cs-button></td>
      </tr>
    </tbody>
  </table>
</cs-scroller>

## Panels

Panel tokens apply to components with larger, contained surface areas, like [callout](/components/callout), [card](/components/card), [details](/components/details), and [dialog](/components/dialog).

<cs-scroller>
  <table class="token-table cs-hover-rows">
    <thead>
      <tr><th>Custom Property</th><th>Description</th></tr>
    </thead>
    <tbody>
      <tr id="token-cs-panel-border-style">
        <td class="token-name"><code>--cs-panel-border-style</code></td>
        <td>Border line style for panel components</td>
      </tr>
      <tr id="token-cs-panel-border-width">
        <td class="token-name"><code>--cs-panel-border-width</code></td>
        <td>Border thickness for panel components</td>
      </tr>
      <tr id="token-cs-panel-border-radius">
        <td class="token-name"><code>--cs-panel-border-radius</code></td>
        <td>Corner rounding for panel components</td>
      </tr>
    </tbody>
  </table>
</cs-scroller>

```html {.example}
<div class="cs-stack">
  <cs-callout>
    <cs-icon slot="icon" name="info"></cs-icon>
    This is a simple callout with an icon.
  </cs-callout>
  <cs-card>Here's a basic, no-nonsense card.</cs-card>
  <cs-details summary="Details"> <code>cs-details</code>, at your service. </cs-details>
</div>
```

## Tooltips

Tooltip tokens apply to the [tooltip](/components/tooltip) component and built-in tooltips in other components like [slider](/components/slider) and [copy button](/components/copy-button).

<cs-scroller>
  <table class="token-table cs-hover-rows">
    <thead>
      <tr><th>Custom Property</th><th>Description</th></tr>
    </thead>
    <tbody>
      <tr id="token-cs-tooltip-arrow-size">
        <td class="token-name"><code>--cs-tooltip-arrow-size</code></td>
        <td>Size of the tooltip arrow/caret</td>
      </tr>
      <tr id="token-cs-tooltip-background-color">
        <td class="token-name"><code>--cs-tooltip-background-color</code></td>
        <td>Background color of the tooltip body</td>
      </tr>
      <tr id="token-cs-tooltip-border-color">
        <td class="token-name"><code>--cs-tooltip-border-color</code></td>
        <td>Border color of the tooltip</td>
      </tr>
      <tr id="token-cs-tooltip-border-style">
        <td class="token-name"><code>--cs-tooltip-border-style</code></td>
        <td>Border line style of the tooltip</td>
      </tr>
      <tr id="token-cs-tooltip-border-width">
        <td class="token-name"><code>--cs-tooltip-border-width</code></td>
        <td>Border thickness of the tooltip</td>
      </tr>
      <tr id="token-cs-tooltip-border-radius">
        <td class="token-name"><code>--cs-tooltip-border-radius</code></td>
        <td>Corner rounding of the tooltip</td>
      </tr>
      <tr id="token-cs-tooltip-content-color">
        <td class="token-name"><code>--cs-tooltip-content-color</code></td>
        <td>Text color of tooltip content</td>
      </tr>
      <tr id="token-cs-tooltip-font-size">
        <td class="token-name"><code>--cs-tooltip-font-size</code></td>
        <td>Font size of tooltip text</td>
      </tr>
      <tr id="token-cs-tooltip-line-height">
        <td class="token-name"><code>--cs-tooltip-line-height</code></td>
        <td>Line height of tooltip text</td>
      </tr>
    </tbody>
  </table>
</cs-scroller>

```html {.example}
<cs-button id="tooltip-demo" appearance="plain">
  <cs-icon label="Target" name="target"></cs-icon>
</cs-button>
<cs-tooltip for="tooltip-demo" open trigger="manual">This is a tooltip</cs-tooltip>
```
