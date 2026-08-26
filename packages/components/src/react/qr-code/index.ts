import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/qr-code/qr-code.js';

const tagName = 'cs-qr-code';

/**
 * @summary QR codes encode a URL or other short text into a scannable image, rendered client-side using the Canvas API.
 *  Use them to share links, contact info, or Wi-Fi credentials that visitors can scan with a phone.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/qr-code
 * @status stable
 * @since 2.0
 *
 * @csspart qr-code - The component's outer wrapper.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {},
  displayName: 'CsQrCode',
});

export default reactWrapper;
