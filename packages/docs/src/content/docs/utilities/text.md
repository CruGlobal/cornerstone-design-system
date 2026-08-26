---
title: Text
description: Text utility classes use design tokens from your Cornerstone theme and standard CSS properties to style text elements on the fly.
tags: styleUtilities
synonyms:
  - typography
  - font
  - text style
use-cases:
  - text size
  - text align
  - text weight
  - truncate
---

<style>
  th {
    min-inline-size: 15ch;
  }
</style>

Text utility classes use design tokens from your Cornerstone theme and standard CSS properties to style text elements on the fly.

The classes on this page cover the most common needs: picking a size and weight for body copy, styling headings, aligning paragraphs, truncating overflow, and changing font color. Every class is built on your theme's typography tokens, so switching themes or tweaking your type scale updates the whole site at once.

## Body

Use `cs-body-*` classes to style the main content of your pages. Each class specifies a `font-size` that corresponds to a [font size token](/tokens/typography/#font-size) from your theme.

:::info
`3xs` and `2xs` fall below typical legibility. It's best to keep their use to non-essential UI only (e.g. labels, metadata) to maintain accessibility.
:::

Alternatively, use `cs-body` to apply the same styling without an explicit font size.

| Class Name    | Preview                                            |
| ------------- | -------------------------------------------------- |
| `cs-body-3xs` | <div class="cs-body-3xs">Five boxing wizards</div> |
| `cs-body-2xs` | <div class="cs-body-2xs">Five boxing wizards</div> |
| `cs-body-xs`  | <div class="cs-body-xs">Five boxing wizards</div>  |
| `cs-body-s`   | <div class="cs-body-s">Five boxing wizards</div>   |
| `cs-body-m`   | <div class="cs-body-m">Five boxing wizards</div>   |
| `cs-body-l`   | <div class="cs-body-l">Five boxing wizards</div>   |
| `cs-body-xl`  | <div class="cs-body-xl">Five boxing wizards</div>  |
| `cs-body-2xl` | <div class="cs-body-2xl">Five boxing wizards</div> |
| `cs-body-3xl` | <div class="cs-body-3xl">Five boxing wizards</div> |
| `cs-body-4xl` | <div class="cs-body-4xl">Five boxing wizards</div> |
| `cs-body-5xl` | <div class="cs-body-5xl">Five boxing wizards</div> |

## Headings

Use `cs-heading-*` classes to style section titles and headings in your content. Each class specifies a `font-size` that corresponds to a [font size token](/tokens/typography/#font-size) from your theme.

Alternatively, use `cs-heading` to apply the same styling without an explicit font size.

| Class Name       | Preview                                               |
| ---------------- | ----------------------------------------------------- |
| `cs-heading-3xs` | <div class="cs-heading-3xs">Five boxing wizards</div> |
| `cs-heading-2xs` | <div class="cs-heading-2xs">Five boxing wizards</div> |
| `cs-heading-xs`  | <div class="cs-heading-xs">Five boxing wizards</div>  |
| `cs-heading-s`   | <div class="cs-heading-s">Five boxing wizards</div>   |
| `cs-heading-m`   | <div class="cs-heading-m">Five boxing wizards</div>   |
| `cs-heading-l`   | <div class="cs-heading-l">Five boxing wizards</div>   |
| `cs-heading-xl`  | <div class="cs-heading-xl">Five boxing wizards</div>  |
| `cs-heading-2xl` | <div class="cs-heading-2xl">Five boxing wizards</div> |
| `cs-heading-3xl` | <div class="cs-heading-3xl">Five boxing wizards</div> |
| `cs-heading-4xl` | <div class="cs-heading-4xl">Five boxing wizards</div> |
| `cs-heading-5xl` | <div class="cs-heading-5xl">Five boxing wizards</div> |

## Captions

Use `cs-caption-*` classes to style descriptions or auxiliary text in your content. Each class specifies a `font-size` that corresponds to a [font size token](/tokens/typography/#font-size) from your theme.

Alternatively, use `cs-caption` to apply the same styling without an explicit font size.

| Class Name       | Preview                                               |
| ---------------- | ----------------------------------------------------- |
| `cs-caption-3xs` | <div class="cs-caption-3xs">Five boxing wizards</div> |
| `cs-caption-2xs` | <div class="cs-caption-2xs">Five boxing wizards</div> |
| `cs-caption-xs`  | <div class="cs-caption-xs">Five boxing wizards</div>  |
| `cs-caption-s`   | <div class="cs-caption-s">Five boxing wizards</div>   |
| `cs-caption-m`   | <div class="cs-caption-m">Five boxing wizards</div>   |
| `cs-caption-l`   | <div class="cs-caption-l">Five boxing wizards</div>   |
| `cs-caption-xl`  | <div class="cs-caption-xl">Five boxing wizards</div>  |
| `cs-caption-2xl` | <div class="cs-caption-2xl">Five boxing wizards</div> |
| `cs-caption-3xl` | <div class="cs-caption-3xl">Five boxing wizards</div> |
| `cs-caption-4xl` | <div class="cs-caption-4xl">Five boxing wizards</div> |
| `cs-caption-5xl` | <div class="cs-caption-5xl">Five boxing wizards</div> |

## Longform

Use `cs-longform-*` classes to style lengthy content like essays or blog posts. Each class specifies a `font-size` that corresponds to a [font size token](/tokens/typography/#font-size) from your theme.

Alternatively, use `cs-longform` to apply the same styling without an explicit font size.

| Class Name        | Preview                                                |
| ----------------- | ------------------------------------------------------ |
| `cs-longform-3xs` | <div class="cs-longform-3xs">Five boxing wizards</div> |
| `cs-longform-2xs` | <div class="cs-longform-2xs">Five boxing wizards</div> |
| `cs-longform-xs`  | <div class="cs-longform-xs">Five boxing wizards</div>  |
| `cs-longform-s`   | <div class="cs-longform-s">Five boxing wizards</div>   |
| `cs-longform-m`   | <div class="cs-longform-m">Five boxing wizards</div>   |
| `cs-longform-l`   | <div class="cs-longform-l">Five boxing wizards</div>   |
| `cs-longform-xl`  | <div class="cs-longform-xl">Five boxing wizards</div>  |
| `cs-longform-2xl` | <div class="cs-longform-2xl">Five boxing wizards</div> |
| `cs-longform-3xl` | <div class="cs-longform-3xl">Five boxing wizards</div> |
| `cs-longform-4xl` | <div class="cs-longform-4xl">Five boxing wizards</div> |
| `cs-longform-5xl` | <div class="cs-longform-5xl">Five boxing wizards</div> |

## Links

Use `cs-link` to give interactive text a link-like appearance. Alternatively, use `cs-link-plain` to remove typical link styles from `<a>` elements.

| Class Name      | Preview                                                  |
| --------------- | -------------------------------------------------------- |
| `cs-link`       | <div class="cs-link">Five boxing wizards</div>           |
| `cs-link-plain` | <a href="" class="cs-link-plain">Five boxing wizards</a> |

## Lists

Ordered (`<ol>`) and unordered (`<ul>`) lists are given default styles by either Cornerstone's [native styles](/utilities/native/) or your browser. Use `cs-list-plain` to clear any built-in list styles.

| Class Name      | Preview                                                                                                  |
| --------------- | -------------------------------------------------------------------------------------------------------- |
| `cs-list-plain` | <ol class="cs-list-plain"><li>First list item</li><li>Second list item</li><li>Final list item</li></ol> |

## Form Controls

Use `cs-form-control-*` classes to style labels, values, placeholders, and hints outside of typical form control contexts with [form control tokens](/tokens/component-groups/#form-controls) from your theme.

| Class Name                    | Preview                                                            |
| ----------------------------- | ------------------------------------------------------------------ |
| `cs-form-control-label`       | <div class="cs-form-control-label">Five boxing wizards</div>       |
| `cs-form-control-value`       | <div class="cs-form-control-value">Five boxing wizards</div>       |
| `cs-form-control-placeholder` | <div class="cs-form-control-placeholder">Five boxing wizards</div> |
| `cs-form-control-hint`        | <div class="cs-form-control-hint">Five boxing wizards</div>        |

## Font Size

Use single-purpose `cs-font-size-*` classes to apply a given [font size](/tokens/typography/#font-size) from your theme to any element without additional styling.

| Class Name         | Preview                                                 |
| ------------------ | ------------------------------------------------------- |
| `cs-font-size-3xs` | <div class="cs-font-size-3xs">Five boxing wizards</div> |
| `cs-font-size-2xs` | <div class="cs-font-size-2xs">Five boxing wizards</div> |
| `cs-font-size-xs`  | <div class="cs-font-size-xs">Five boxing wizards</div>  |
| `cs-font-size-s`   | <div class="cs-font-size-s">Five boxing wizards</div>   |
| `cs-font-size-m`   | <div class="cs-font-size-m">Five boxing wizards</div>   |
| `cs-font-size-l`   | <div class="cs-font-size-l">Five boxing wizards</div>   |
| `cs-font-size-xl`  | <div class="cs-font-size-xl">Five boxing wizards</div>  |
| `cs-font-size-2xl` | <div class="cs-font-size-2xl">Five boxing wizards</div> |
| `cs-font-size-3xl` | <div class="cs-font-size-3xl">Five boxing wizards</div> |
| `cs-font-size-4xl` | <div class="cs-font-size-4xl">Five boxing wizards</div> |
| `cs-font-size-5xl` | <div class="cs-font-size-5xl">Five boxing wizards</div> |

## Font Weight

Use single-purpose `cs-font-weight-*` classes to apply a given [font weight](/tokens/typography/#font-weight) from your theme to any element without additional styling.

| Class Name                | Preview                                                        |
| ------------------------- | -------------------------------------------------------------- |
| `cs-font-weight-light`    | <div class="cs-font-weight-light">Five boxing wizards</div>    |
| `cs-font-weight-normal`   | <div class="cs-font-weight-normal">Five boxing wizards</div>   |
| `cs-font-weight-semibold` | <div class="cs-font-weight-semibold">Five boxing wizards</div> |
| `cs-font-weight-bold`     | <div class="cs-font-weight-bold">Five boxing wizards</div>     |

## Text Color

Use single-purpose `cs-color-text-*` classes to apply a given [text color](/tokens/color/#text) from your theme to any element without additional styling.

| Class Name             | Preview                                                     |
| ---------------------- | ----------------------------------------------------------- |
| `cs-color-text-quiet`  | <div class="cs-color-text-quiet">Five boxing wizards</div>  |
| `cs-color-text-normal` | <div class="cs-color-text-normal">Five boxing wizards</div> |
| `cs-color-text-link`   | <div class="cs-color-text-link">Five boxing wizards</div>   |

## Wrapping

Use these classes to control how text wraps across lines. They apply standard CSS [`text-wrap`](https://developer.mozilla.org/docs/Web/CSS/text-wrap) values.

| Class Name        | Preview                                                                                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cs-text-nowrap`  | <div class="cs-text-nowrap" style="max-width: 40ch; overflow: hidden;">The five boxing wizards jump quickly. How quickly daft jumping zebras vex!</div> |
| `cs-text-balance` | <div class="cs-text-balance" style="max-width: 40ch;">The five boxing wizards jump quickly. How quickly daft jumping zebras vex!</div>                  |
| `cs-text-pretty`  | <div class="cs-text-pretty" style="max-width: 40ch;">The five boxing wizards jump quickly. How quickly daft jumping zebras vex!</div>                   |

:::info
`cs-text-pretty` is wrapped in an `@supports` rule because Firefox does not yet support `text-wrap: pretty`. In unsupported browsers, the class has no effect and text wraps normally.
:::

:::info
The original `cs-text-wrap-nowrap`, `cs-text-wrap-balance`, and `cs-text-wrap-pretty` class names continue to work as aliases for backwards compatibility. These older names are deprecated and will be removed in a future major version; update to the shorter `cs-text-*` names above.
:::

## Transform

Use these classes to change the case of text. They apply standard CSS [`text-transform`](https://developer.mozilla.org/docs/Web/CSS/text-transform) values.

| Class Name           | Preview                                                   |
| -------------------- | --------------------------------------------------------- |
| `cs-text-uppercase`  | <div class="cs-text-uppercase">Five boxing wizards</div>  |
| `cs-text-lowercase`  | <div class="cs-text-lowercase">Five boxing wizards</div>  |
| `cs-text-capitalize` | <div class="cs-text-capitalize">Five boxing wizards</div> |

:::info
Large blocks of uppercase text are [harder for everyone to read](https://www.w3.org/WAI/WCAG21/Understanding/visual-presentation.html) and especially difficult for folks with dyslexia. Reserve it for buttons, badges, or short headings.
:::

## Alignment

<style>
  .preview-wrapper {
    border: var(--cs-border-width-s) dashed var(--cs-color-neutral-border-normal);
    border-radius: var(--cs-border-radius-m);
    padding: var(--cs-space-xs);
  }
</style>

Use these classes to align text within its container. They apply standard CSS [`text-align`](https://developer.mozilla.org/docs/Web/CSS/text-align) values using logical properties, so they adapt automatically to the document's writing direction.

| Class Name        | Preview                                                                                                                       |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `cs-text-start`   | <div class="cs-text-start preview-wrapper">Five boxing wizards</div>                                                          |
| `cs-text-center`  | <div class="cs-text-center preview-wrapper">Five boxing wizards</div>                                                         |
| `cs-text-end`     | <div class="cs-text-end preview-wrapper">Five boxing wizards</div>                                                            |
| `cs-text-justify` | <div class="cs-text-justify preview-wrapper">The five boxing wizards jump quickly. How quickly daft jumping zebras vex!</div> |

:::info
Justified text can create uneven word spacing that's [harder for everyone to read](https://www.w3.org/WAI/WCAG21/Understanding/visual-presentation.html) and especially difficult for folks with dyslexia. Reserve it for short, narrow text columns.
:::

## Truncation

Use the `cs-text-truncate` class to truncate text with an ellipsis instead of letting it overflow or wrap.

| Class Name         | Preview                                                                                                                                 |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `cs-text-truncate` | <div class="cs-text-truncate" style="max-width: 40ch;">The five boxing wizards jump quickly. How quickly daft jumping zebras vex!</div> |
