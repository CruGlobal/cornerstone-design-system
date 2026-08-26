import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/details/details.js';

import { type EventName } from '@lit/react';
import type { CsShowEvent } from '../../events/events.js';
import type { CsAfterShowEvent } from '../../events/events.js';
import type { CsHideEvent } from '../../events/events.js';
import type { CsAfterHideEvent } from '../../events/events.js';
export type { CsShowEvent } from '../../events/events.js';
export type { CsAfterShowEvent } from '../../events/events.js';
export type { CsHideEvent } from '../../events/events.js';
export type { CsAfterHideEvent } from '../../events/events.js';

const tagName = 'cs-details';

/**
 * @summary Details display a brief summary and expand to reveal additional content. Use them to progressively disclose
 *  information, group related FAQs, or hide advanced options.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/details
 * @status stable
 * @since 2.0
 *
 * @dependency cs-icon
 *
 * @slot - The details' main content.
 * @slot summary - The details' summary. Alternatively, you can use the `summary` attribute.
 * @slot expand-icon - Optional expand icon to use instead of the default. Works best with `<cs-icon>`.
 * @slot collapse-icon - Optional collapse icon to use instead of the default. Works best with `<cs-icon>`.
 *
 * @event cs-show - Emitted when the details opens.
 * @event cs-after-show - Emitted after the details opens and all animations are complete.
 * @event cs-hide - Emitted when the details closes.
 * @event cs-after-hide - Emitted after the details closes and all animations are complete.
 *
 * @csspart details - The component's outer wrapper.
 *                    Styles you apply to the component are automatically applied to this part, so you usually don't need to deal with it unless you need to set the `display` property.
 * @csspart header - The header that wraps both the summary and the expand/collapse icon.
 * @csspart summary - The container that wraps the summary.
 * @csspart icon - The container that wraps the expand/collapse icons.
 * @csspart content - The details content.
 *
 * @cssproperty --spacing - The amount of space around and between the details' content. Expects a single value.
 * @cssproperty [--show-duration=var(--cs-transition-normal)] - The show duration to use when applying built-in animation classes.
 * @cssproperty [--hide-duration=var(--cs-transition-normal)] - The hide duration to use when applying built-in animation classes.
 *
 * @cssstate animating - Applied when the details is animating expand/collapse.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {
    onCsShow: 'cs-show' as EventName<CsShowEvent>,
    onCsAfterShow: 'cs-after-show' as EventName<CsAfterShowEvent>,
    onCsHide: 'cs-hide' as EventName<CsHideEvent>,
    onCsAfterHide: 'cs-after-hide' as EventName<CsAfterHideEvent>,
  },
  displayName: 'CsDetails',
});

export default reactWrapper;
