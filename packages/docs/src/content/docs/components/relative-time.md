---
title: Relative Time
category: Helpers
synonyms:
  - time ago
  - timeago
  - moment
  - from now
use-cases:
  - posted ago
  - last updated
  - time since
description: "Relative times display a date as a localized phrase relative to now, such as \"3 hours ago\" or \"in 2 days\". The phrase updates automatically as time passes and respects the user's locale."
---

```html {.example}
<!-- Cornerstone 3 release date 🎉 -->
<cs-relative-time date="2025-12-02T00:00:00-05:00"></cs-relative-time>
```

Localization is handled by the browser's [`Intl.RelativeTimeFormat` API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat). No language packs are required.

The `date` attribute determines when the date/time is calculated from. It must be a string that [`Date.parse()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse) can interpret or a [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) object set via JavaScript.

:::info
<strong>Always use ISO 8601 date strings.</strong><br />
Ambiguous formats like `03/04/2020` can be read as March 4 or April 3 depending on the user's browser and locale. A valid [ISO 8601 date time string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse#Date_Time_String_Format) parses the same for every client.
:::

## Examples

### Sync

Use the `sync` attribute to update the displayed value automatically as time passes.

```html {.example}
<div class="relative-time-sync">
  <cs-relative-time sync></cs-relative-time>
</div>

<script>
  const container = document.querySelector('.relative-time-sync');
  const relativeTime = container.querySelector('cs-relative-time');

  relativeTime.date = new Date(new Date().getTime() - 60000);
</script>
```

### Format

You can change how the time is displayed using the `format` attribute. Note that some locales may display the same values for `narrow` and `short` formats.

```html {.example}
<cs-relative-time date="2025-12-02T00:00:00-05:00" format="narrow"></cs-relative-time><br />
<cs-relative-time date="2025-12-02T00:00:00-05:00" format="short"></cs-relative-time><br />
<cs-relative-time date="2025-12-02T00:00:00-05:00" format="long"></cs-relative-time>
```

### Localization

Use the `lang` attribute to set the desired locale.

```html {.example}
English: <cs-relative-time date="2025-12-02T00:00:00-05:00" lang="en-US"></cs-relative-time><br />
Chinese: <cs-relative-time date="2025-12-02T00:00:00-05:00" lang="zh-CN"></cs-relative-time><br />
German: <cs-relative-time date="2025-12-02T00:00:00-05:00" lang="de"></cs-relative-time><br />
Greek: <cs-relative-time date="2025-12-02T00:00:00-05:00" lang="el"></cs-relative-time><br />
Russian: <cs-relative-time date="2025-12-02T00:00:00-05:00" lang="ru"></cs-relative-time>
```
