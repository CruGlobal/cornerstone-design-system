import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/option/option.js';

const tagName = 'cs-option';

/**
 * @summary Options represent the individual choices inside a select or similar form control. Each option holds a value
 *  and the label shown to the user.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/option
 * @status stable
 * @since 2.0
 *
 * @dependency cs-icon
 *
 * @slot - The option's label.
 * @slot start - An element, such as `<cs-icon>`, placed before the label.
 * @slot end - An element, such as `<cs-icon>`, placed after the label.
 *
 * @csspart checked-icon - The checked icon, a `<cs-icon>` element.
 * @csspart label - The option's label.
 * @csspart start - The container that wraps the `start` slot.
 * @csspart end - The container that wraps the `end` slot.
 *
 * @cssstate current - The user has keyed into the option, but hasn't selected it yet (shows a highlight)
 * @cssstate selected - The option is selected and has aria-selected="true"
 * @cssstate disabled - Applied when the option is disabled
 * @cssstate hover - Like `:hover` but works while dragging in Safari
 *
 * @cssproperty --current-text-color - The text color of the current (highlighted) option, paired with `--cs-form-control-activated-color`.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {},
  displayName: 'CsOption',
});

export default reactWrapper;
