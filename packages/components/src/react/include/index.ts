import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/include/include.js';

import { type EventName } from '@lit/react';
import type { CsLoadEvent } from '../../events/events.js';
import type { CsIncludeErrorEvent } from '../../events/events.js';
export type { CsLoadEvent } from '../../events/events.js';
export type { CsIncludeErrorEvent } from '../../events/events.js';

const tagName = 'cs-include';

/**
 * @summary Fetches an external HTML file and embeds its contents inline on the page. Useful for reusing shared markup
 *  like headers, footers, and partials across multiple pages.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/include
 * @status stable
 * @since 2.0
 *
 * @event cs-load - Emitted when the included file is loaded.
 * @event {{ status: number }} cs-include-error - Emitted when the included file fails to load due to an error.
 *
 * @ssr - `<cs-include>` fetches its content asynchronously (like `<cs-icon>`), so the rendered output isn't available during SSR.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {
    onCsLoad: 'cs-load' as EventName<CsLoadEvent>,
    onCsIncludeError: 'cs-include-error' as EventName<CsIncludeErrorEvent>,
  },
  displayName: 'CsInclude',
});

export default reactWrapper;
