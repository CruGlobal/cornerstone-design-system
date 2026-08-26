import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/pagination/pagination.js';

import { type EventName } from '@lit/react';
import type { CsPageChangeEvent } from '../../events/events.js';
import type { CsAfterPageChangeEvent } from '../../events/events.js';
export type { CsPageChangeEvent } from '../../events/events.js';
export type { CsAfterPageChangeEvent } from '../../events/events.js';

const tagName = 'cs-pagination';

/**
 * @summary Pagination splits long lists of content into pages, letting users navigate between them.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/pagination
 * @status experimental
 * @since 3.11
 *
 * @dependency cs-icon
 *
 * @event cs-page-change - Emitted when the page is about to change but before it does. Canceling this event with
 *  `event.preventDefault()` prevents the page from changing.
 * @event cs-after-page-change - Emitted after the page changes.
 *
 * @slot previous-icon - An icon to use in lieu of the default previous icon.
 * @slot next-icon - An icon to use in lieu of the default next icon.
 * @slot first-icon - An icon to use in lieu of the default first icon.
 * @slot last-icon - An icon to use in lieu of the default last icon.
 *
 * @csspart pagination - The component's outer wrapper, a `<nav>` element.
 * @csspart button - Every button or link, including page numbers and navigation controls.
 * @csspart previous-button - The previous button.
 * @csspart next-button - The next button.
 * @csspart first-button - The first button.
 * @csspart last-button - The last button.
 * @csspart pages - The list that wraps the page number items.
 * @csspart page - A page number button or link.
 * @csspart page-current - The current page number button or link.
 * @csspart ellipsis - An ellipsis for collapsed pages. Acts as a button that jumps several pages toward that side.
 * @csspart summary - The summary of items on the current page, shown with the `with-summary` attribute.
 * @csspart label - The "1 of 5" label shown between the navigation buttons in the `compact` layout.
 *
 * @cssstate disabled - Applied when the pagination is disabled.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {
    onCsPageChange: 'cs-page-change' as EventName<CsPageChangeEvent>,
    onCsAfterPageChange: 'cs-after-page-change' as EventName<CsAfterPageChangeEvent>,
  },
  displayName: 'CsPagination',
});

export default reactWrapper;
