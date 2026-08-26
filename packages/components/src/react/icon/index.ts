import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/icon/icon.js';

import { type EventName } from '@lit/react';
import type { CsLoadEvent } from '../../events/events.js';
import type { CsErrorEvent } from '../../events/events.js';
export type { CsLoadEvent } from '../../events/events.js';
export type { CsErrorEvent } from '../../events/events.js';

const tagName = 'cs-icon';

/**
 * @summary Icons are scalable vector symbols that represent actions, content, or status throughout your application.
 *  They support Material Symbols and custom icon libraries with animation presets.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/icon
 * @status stable
 * @since 2.0
 *
 * @event cs-load - Emitted when the icon has loaded. When using `spriteSheet: true` this will not emit.
 * @event cs-error - Emitted when the icon fails to load due to an error. When using `spriteSheet: true` this will not emit.
 *
 * @csspart svg - The internal SVG element.
 * @csspart use - The `<use>` element generated when using `spriteSheet: true`
 *
 * @cssproperty [--icon-scale=1.2] Scales the icon artwork within its canvas without changing the canvas itself.
 *  Material Symbols pads each icon into a 24dp box with a 20dp live area; the default of 1.2 (24 / 20) cancels that
 *  padding. Set it to 1 to render the artwork at its native size. It inherits, so it can be set on any ancestor.
 * @cssproperty [--animation-delay=0] Sets when the animation will start.
 * @cssproperty [--animation-direction=normal] Defines whether or not the animation should play in reverse on alternate cycles.
 * @cssproperty [--animation-duration=1s] Defines the length of time that an animation takes to complete one cycle.
 * @cssproperty [--animation-iteration-count=infinite] Defines the number of times an animation cycle is played.
 * @cssproperty [--animation-timing] Describes how the animation will progress over one cycle of its duration.
 * @cssproperty [--beat-fade-opacity] Set lowest opacity value an icon with `beat-fade` animation will fade to and from.
 * @cssproperty [--beat-fade-scale] Set max value that an icon with `beat-fade` animation will scale.
 * @cssproperty [--beat-scale] Set the scale multiplier for an icon with `beat` animation. This multiplies the animation's 1.25× base pulse, so the default `1.25` peaks at ~1.56× and `2` roughly doubles the pulse.
 * @cssproperty [--bounce-height] Set the max height an icon with `bounce` animation will jump to when bouncing.
 * @cssproperty [--bounce-jump-scale-x] Set the icon’s horizontal distortion (“squish”) at the top of the jump.
 * @cssproperty [--bounce-jump-scale-y] Set the icon’s vertical distortion (“squish”) at the top of the jump.
 * @cssproperty [--bounce-land-scale-x] Set the icon’s horizontal distortion (“squish”) when landing after the jump.
 * @cssproperty [--bounce-land-scale-y] Set the icon’s vertical distortion (“squish”) when landing after the jump.
 * @cssproperty [--bounce-rebound] Set the amount of rebound an icon with `bounce` animation has when landing after the jump.
 * @cssproperty [--bounce-start-scale-x] Set the icon’s horizontal distortion (“squish”) when starting to bounce.
 * @cssproperty [--bounce-start-scale-y] Set the icon’s vertical distortion (“squish”) when starting to bounce.
 * @cssproperty [--fade-opacity] Set lowest opacity value an icon with `fade` animation will fade to and from.
 * @cssproperty [--flip-angle] Set rotation angle of flip for an icon with `flip` or `flip-360` animation. A positive angle denotes a clockwise rotation, a negative angle a counter-clockwise one.
 * @cssproperty [--flip-x] Set x-coordinate of the vector denoting the axis of rotation (between 0 and 1) for an icon with `flip` or `flip-360` animation.
 * @cssproperty [--flip-y] Set y-coordinate of the vector denoting the axis of rotation (between 0 and 1) for an icon with `flip` or `flip-360` animation.
 * @cssproperty [--flip-z] Set z-coordinate of the vector denoting the axis of rotation (between 0 and 1) for an icon with `flip` or `flip-360` animation.
 * @cssproperty [--flip-anticipation-scale] Set the scale of the wind-up before an icon with `flip` or `flip-360` animation rotates.
 * @cssproperty [--flip-overshoot] Set how far past the final angle an icon with `flip` or `flip-360` animation rotates before settling.
 * @cssproperty [--bounce-anticipation] Set the downward squash distance before an icon with `bounce` animation jumps.
 * @cssproperty [--buzz-distance] Set the horizontal travel of an icon with `buzz` animation.
 * @cssproperty [--wag-angle] Set the peak rotation of an icon with `wag` animation.
 * @cssproperty [--swing-angle] Set the peak rotation of an icon with `swing` animation.
 * @cssproperty [--jello-scale-x] Set the horizontal stretch of an icon with `jello` animation.
 * @cssproperty [--jello-scale-y] Set the vertical stretch of an icon with `jello` animation.
 * @cssproperty [--float-height] Set the rise height of an icon with `float` animation.
 * @cssproperty [--float-drift] Set the horizontal drift of an icon with `float` animation.
 * @cssproperty [--float-tilt] Set the rotation of an icon with `float` animation.
 * @cssproperty [--float-squash-x] Set the horizontal squash of an icon with `float` animation at rest.
 * @cssproperty [--float-squash-y] Set the vertical squash of an icon with `float` animation at rest.
 * @cssproperty [--float-stretch-x] Set the horizontal stretch of an icon with `float` animation at its peak.
 * @cssproperty [--float-stretch-y] Set the vertical stretch of an icon with `float` animation at its peak.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {
    onCsLoad: 'cs-load' as EventName<CsLoadEvent>,
    onCsError: 'cs-error' as EventName<CsErrorEvent>,
  },
  displayName: 'CsIcon',
});

export default reactWrapper;
