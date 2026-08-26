---
title: QR Code
category: Media
synonyms:
  - barcode
  - quick response code
use-cases:
  - scan code
  - share link
  - payment code
description: "QR codes encode a URL or other short text into a scannable image, rendered client-side using the Canvas API. Use them to share links, contact info, or Wi-Fi credentials that visitors can scan with a phone."
---

```html {.example}
<cs-qr-code value="https://github.com/CruGlobal/cornerstone-components" label="Scan to visit Cornerstone"></cs-qr-code>
```

QR codes are useful for providing small pieces of information to users who can quickly scan them with a smartphone. Most smartphones have built-in QR code scanners, so pointing the camera at a QR code will decode it and allow the user to visit a website, dial a phone number, read a message, etc.

## Examples

### Size

Use the `size` attribute to change the size of the QR code.

```html {.example}
<cs-qr-code value="https://github.com/CruGlobal/cornerstone-components" size="64"></cs-qr-code>
```

### Colors

The QR code's fill color is determined by the current text color. To change it, set the CSS `color` property on the host element or an ancestor element.

The canvas is always transparent, so use the `background` or `background-color` CSS property on the host element to set a background color.

A _quiet zone_ is the blank space around a QR code that helps scanners detect it more reliably. Use the `padding` CSS property on the host element to add one.

```html {.example}
<cs-qr-code
  value="https://github.com/CruGlobal/cornerstone-components"
  style="
    color: var(--cs-color-purple-20);
    background-color: var(--cs-color-purple-90);
    border-radius: var(--cs-border-radius-m);
    padding: 1rem;
  "
></cs-qr-code>
```

### Corner Color

You can change the color of the corners to be different from the main element with the `--corner-color` custom property.

```html {.example}
<cs-qr-code value="https://github.com/CruGlobal/cornerstone-components" style="--corner-color: var(--cs-color-brand)"></cs-qr-code>
```

### Radius

Create a rounded effect with the `radius` attribute.

```html {.example}
<cs-qr-code value="https://github.com/CruGlobal/cornerstone-components" radius="0.5"></cs-qr-code>
```

### Error Correction

QR codes can be rendered with various levels of [error correction](https://www.qrcode.com/en/about/error_correction.html) that can be set using the `error-correction` attribute. This example generates four codes with the same value using different error correction levels.

```html {.example}
<div class="qr-error-correction">
  <cs-qr-code value="https://github.com/CruGlobal/cornerstone-components" error-correction="L"></cs-qr-code>
  <cs-qr-code value="https://github.com/CruGlobal/cornerstone-components" error-correction="M"></cs-qr-code>
  <cs-qr-code value="https://github.com/CruGlobal/cornerstone-components" error-correction="Q"></cs-qr-code>
  <cs-qr-code value="https://github.com/CruGlobal/cornerstone-components" error-correction="H"></cs-qr-code>
</div>

<style>
  .qr-error-correction {
    display: flex;
    flex-wrap: wrap;
    gap: var(--cs-space-m);
  }
</style>
```

### Image

Use the `image` attribute to add a logo or image to the center of the QR code. When using an image, the error correction level will automatically be set to `H` to ensure the code remains scannable.

```html {.example}
<cs-qr-code value="https://github.com/CruGlobal/cornerstone-components" image="/assets/images/logos/cs-avatar4x.png"></cs-qr-code>
```

### Image Coverage

Use the `image-coverage` attribute to control how much of the QR code the image is allowed to cover, from `0` to `1`. The default is `0.5`.

The higher the `image-coverage` value, the harder it will be for QR readers to scan. For example, `1.0` usually makes the QR code unreadable.

```html {.example}
<div class="qr-ec-cover">
  <cs-qr-code
    value="https://fontawesome.com/"
    image="/assets/images/logos/fa-avatar4x.png"
    image-coverage="0.3"
  ></cs-qr-code>
  <cs-qr-code
    value="https://github.com/CruGlobal/cornerstone-components"
    image="/assets/images/logos/cs-avatar4x.png"
    image-coverage="0.6"
  ></cs-qr-code>
  <cs-qr-code
    value="https://build.awesome.me/"
    image="/assets/images/logos/ba-avatar4x.png"
    image-coverage="0.9"
  ></cs-qr-code>
</div>

<style>
  .qr-ec-cover {
    display: flex;
    flex-wrap: wrap;
    gap: var(--cs-space-xl);
  }
</style>
```

### Generating from a Value

Bind an input to the `value` property to build a live generator that updates the code as the user types.

```html {.example}
<div class="qr-generator">
  <cs-qr-code value="https://github.com/CruGlobal/cornerstone-components" label="Scan this code to visit Cornerstone on the web!"></cs-qr-code>

  <cs-divider></cs-divider>

  <cs-input maxlength="255" with-clear label="Value">
    <cs-icon slot="start" name="link"></cs-icon>
  </cs-input>
</div>

<script>
  const container = document.querySelector('.qr-generator');
  const qrCode = container.querySelector('cs-qr-code');
  const input = container.querySelector('cs-input');

  customElements.whenDefined('cs-qr-code').then(() => {
    qrCode.updateComplete.then(() => {
      input.value = qrCode.value;
      input.addEventListener('input', () => (qrCode.value = input.value));
    });
  });
</script>

<style>
  .qr-generator {
    max-width: 256px;
  }

  .qr-generator cs-input {
    margin-top: var(--cs-space-m);
  }
</style>
```
