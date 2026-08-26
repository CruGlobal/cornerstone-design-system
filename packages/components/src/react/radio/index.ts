import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/radio/radio.js';

const tagName = 'cs-radio';

/**
 * @summary Radios represent a single option within a mutually exclusive set. Use them inside a radio group when users
 *  must pick exactly one choice from a small list.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/radio
 * @status stable
 * @since 2.0
 *
 * @dependency cs-icon
 *
 * @slot - The radio's label.
 *
 * @event blur - Emitted when the control loses focus.
 * @event focus - Emitted when the control gains focus.
 *
 * @csspart control - The circular container that wraps the radio's checked state.
 * @csspart checked-icon - The checked icon.
 * @csspart label - The container that wraps the radio's label.
 *
 * @cssproperty --checked-icon-color - The color of the checked icon.
 * @cssproperty --checked-icon-scale - The size of the checked icon relative to the radio.
 *
 * @cssstate checked - Applied when the control is checked.
 * @cssstate disabled - Applied when the control is disabled.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {},
  displayName: 'CsRadio',
});

export default reactWrapper;
