---
title: Format Number
category: Helpers
synonyms:
  - number formatter
  - currency
  - percent
use-cases:
  - localized number
  - decimal format
  - currency display
description: "Formats a number for display using the specified locale and options, including currency, percent, and unit styles. Powered by the Intl.NumberFormat API."
---

```html {.example}
<div class="format-number-overview">
  <cs-format-number value="1000"></cs-format-number>

  <cs-divider></cs-divider>

  <cs-input type="number" value="1000" label="Number to Format" style="max-width: 180px;"></cs-input>
</div>

<script>
  const container = document.querySelector('.format-number-overview');
  const formatter = container.querySelector('cs-format-number');
  const input = container.querySelector('cs-input');

  input.addEventListener('input', () => (formatter.value = input.value || 0));
</script>
```

Localization is handled by the browser's [`Intl.NumberFormat` API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat). No language packs are required.

## Examples

### Percentage

To get the value as a percent, set the `type` attribute to `percent`.

```html {.example}
<cs-format-number type="percent" value="0"></cs-format-number><br />
<cs-format-number type="percent" value="0.25"></cs-format-number><br />
<cs-format-number type="percent" value="0.50"></cs-format-number><br />
<cs-format-number type="percent" value="0.75"></cs-format-number><br />
<cs-format-number type="percent" value="1"></cs-format-number>
```

### Localization

Use the `lang` attribute to set the number formatting locale.

```html {.example}
English: <cs-format-number value="2000" lang="en" minimum-fraction-digits="2"></cs-format-number><br />
German: <cs-format-number value="2000" lang="de" minimum-fraction-digits="2"></cs-format-number><br />
Russian: <cs-format-number value="2000" lang="ru" minimum-fraction-digits="2"></cs-format-number>
```

### Currency

To format a number as a monetary value, set the `type` attribute to `currency` and set the `currency` attribute to the desired ISO 4217 currency code. You should also specify `lang` to ensure the number is formatted correctly for the target locale.

```html {.example}
<cs-format-number type="currency" currency="USD" value="2000" lang="en-US"></cs-format-number><br />
<cs-format-number type="currency" currency="GBP" value="2000" lang="en-GB"></cs-format-number><br />
<cs-format-number type="currency" currency="EUR" value="2000" lang="de"></cs-format-number><br />
<cs-format-number type="currency" currency="RUB" value="2000" lang="ru"></cs-format-number><br />
<cs-format-number type="currency" currency="CNY" value="2000" lang="zh-cn"></cs-format-number>
```
