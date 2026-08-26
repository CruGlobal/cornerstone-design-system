---
title: Format Bytes
category: Helpers
synonyms:
  - file size
  - byte formatter
  - size formatter
use-cases:
  - human readable bytes
  - storage size
  - download size
description: "Formats a number of bytes as a human-readable string with the appropriate unit, such as kB, MB, or GB. Supports both byte and bit units with configurable locale."
---

```html {.example}
<div class="format-bytes-overview">
  The file is <cs-format-bytes value="1000"></cs-format-bytes> in size.

  <cs-divider></cs-divider>

  <cs-input type="number" value="1000" label="Number to Format" style="max-width: 180px;"></cs-input>
</div>

<script>
  const container = document.querySelector('.format-bytes-overview');
  const formatter = container.querySelector('cs-format-bytes');
  const input = container.querySelector('cs-input');

  input.addEventListener('input', () => (formatter.value = input.value || 0));
</script>
```

## Examples

### Bytes

Set the `value` attribute to a number to get the value in bytes.

```html {.example}
<cs-format-bytes value="12"></cs-format-bytes><br />
<cs-format-bytes value="1200"></cs-format-bytes><br />
<cs-format-bytes value="1200000"></cs-format-bytes><br />
<cs-format-bytes value="1200000000"></cs-format-bytes>
```

### Bits

To get the value in bits, set the `unit` attribute to `bit`.

```html {.example}
<cs-format-bytes value="12" unit="bit"></cs-format-bytes><br />
<cs-format-bytes value="1200" unit="bit"></cs-format-bytes><br />
<cs-format-bytes value="1200000" unit="bit"></cs-format-bytes><br />
<cs-format-bytes value="1200000000" unit="bit"></cs-format-bytes>
```

### Localization

Use the `lang` attribute to set the number formatting locale.

```html {.example}
<cs-format-bytes value="12" lang="de"></cs-format-bytes><br />
<cs-format-bytes value="1200" lang="de"></cs-format-bytes><br />
<cs-format-bytes value="1200000" lang="de"></cs-format-bytes><br />
<cs-format-bytes value="1200000000" lang="de"></cs-format-bytes>
```
