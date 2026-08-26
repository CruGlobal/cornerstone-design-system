import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/tab-group/tab-group.js';

import { type EventName } from '@lit/react';
import type { CsTabShowEvent } from '../../events/events.js';
import type { CsTabHideEvent } from '../../events/events.js';
export type { CsTabShowEvent } from '../../events/events.js';
export type { CsTabHideEvent } from '../../events/events.js';

const tagName = 'cs-tab-group';

/**
 * @summary Tab groups organize related content into a single container that displays one panel at a time, with tabs for
 *  switching between them.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/tab-group
 * @status stable
 * @since 2.0
 *
 * @dependency cs-button
 * @dependency cs-tab
 * @dependency cs-tab-panel
 *
 * @slot - Used for grouping tab panels in the tab group. Must be `<cs-tab-panel>` elements.
 * @slot nav - Used for grouping tabs in the tab group. Must be `<cs-tab>` elements. Note that `<cs-tab>` will set this
 *  slot on itself automatically.
 *
 * @event {{ name: String }} cs-tab-show - Emitted when a tab is shown.
 * @event {{ name: String }} cs-tab-hide - Emitted when a tab is hidden.
 *
 * @csspart tab-group - The component's outer wrapper.
 * @csspart nav - The tab group's navigation container where tabs are slotted in.
 * @csspart tabs - The container that wraps the tabs.
 * @csspart body - The tab group's body where tab panels are slotted in.
 * @csspart scroll-button - The previous/next scroll buttons that show when tabs are scrollable, a `<cs-button>`.
 * @csspart scroll-button-start - The starting scroll button.
 * @csspart scroll-button-end - The ending scroll button.
 * @csspart scroll-button__button - The scroll button's exported `button` part.
 *
 * @cssproperty --indicator-color - The color of the active tab indicator.
 * @cssproperty --track-color - The color of the indicator's track (the line that separates tabs from panels).
 * @cssproperty --track-width - The width of the indicator's track (the line that separates tabs from panels).
 *
 * @ssr - During SSR, `<cs-tab-group>` can't access its children to determine which tab is active. To render the correct panel, manually set the `active` attribute on the matching `<cs-tab>` and `<cs-tab-panel>`.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {
    onCsTabShow: 'cs-tab-show' as EventName<CsTabShowEvent>,
    onCsTabHide: 'cs-tab-hide' as EventName<CsTabHideEvent>,
  },
  displayName: 'CsTabGroup',
});

export default reactWrapper;
