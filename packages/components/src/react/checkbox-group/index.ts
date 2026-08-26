import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/checkbox-group/checkbox-group.js';

const tagName = 'cs-checkbox-group';

/**
 * @summary Checkbox groups wrap a set of related checkboxes or switches so they share a label, hint, and grouping
 *  semantics.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/checkbox-group
 * @status stable
 * @since 3.9
 *
 * @dependency cs-checkbox
 *
 * @slot - The default slot where `<cs-checkbox>` or `<cs-switch>` elements are placed.
 * @slot label - The checkbox group's label. Required for proper accessibility. Alternatively, you can use the `label`
 *  attribute.
 * @slot hint - Text that describes how to use the checkbox group. Alternatively, you can use the `hint` attribute.
 *
 * @csspart form-control - The form control that wraps the label, group, and hint.
 * @csspart form-control-label - The label.
 * @csspart form-control-input - The element that wraps the grouped checkboxes, exposed as a `role="group"`.
 * @csspart hint - The hint's wrapper.
 *
 * @cssproperty [--gap=0.5em] - The gap between grouped checkboxes.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {},
  displayName: 'CsCheckboxGroup',
});

export default reactWrapper;
