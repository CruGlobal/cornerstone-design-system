import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/avatar/avatar.js';

import { type EventName } from '@lit/react';
import type { CsErrorEvent } from '../../events/events.js';
export type { CsErrorEvent } from '../../events/events.js';

const tagName = 'cs-avatar';

/**
 * @summary Avatars represent a person or object with an image, initials, or icon. Use them in lists, comments, and
 *  profiles to give users visual context at a glance.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/avatar
 * @status stable
 * @since 2.0
 *
 * @dependency cs-icon
 *
 * @slot icon - The default icon to use when no image or initials are present. Works best with `<cs-icon>`.
 *
 * @event cs-error - The image could not be loaded. This may because of an invalid URL, a temporary network condition, or some
 * unknown cause.
 *
 * @csspart icon - The container that wraps the avatar's icon.
 * @csspart initials - The container that wraps the avatar's initials.
 * @csspart image - The avatar image. Only shown when the `image` attribute is set.
 *
 * @cssproperty --size - The size of the avatar.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {
    onCsError: 'cs-error' as EventName<CsErrorEvent>,
  },
  displayName: 'CsAvatar',
});

export default reactWrapper;
