import { nextFrame } from '@open-wc/testing';

const KEYFRAMES_ID = 'descendant-animation-keyframes';

/**
 * The two ways an animation on content inside a component can stop while the component's own animation is still
 * running. Both fire an event that bubbles up to the component's animated element: `animationend` when it ends, and
 * `animationcancel` when it is cut off, as `display: none` on a loading placeholder does.
 */
export const descendantAnimationStops = [
  {
    name: 'ends',
    animation: 'descendant-animation-pulse 1s',
    stop: (el: HTMLElement) => el.getAnimations()[0].finish(),
  },
  {
    name: 'is cancelled',
    animation: 'descendant-animation-pulse 1s infinite',
    stop: (el: HTMLElement) => {
      el.style.display = 'none';
    },
  },
];

/**
 * Waits `count` frames. Enough of them for an animation to start, or for the event a stopped one fires to be
 * dispatched, without guessing at how long either takes.
 */
export async function frames(count: number) {
  for (let frame = 0; frame < count; frame++) {
    await nextFrame();
  }
}

/** Starts `animation` on `el` and waits until it is running, so that stopping it fires an event. */
export async function startDescendantAnimation(el: HTMLElement, animation: string) {
  if (!document.getElementById(KEYFRAMES_ID)) {
    const style = document.createElement('style');
    style.id = KEYFRAMES_ID;
    style.textContent = '@keyframes descendant-animation-pulse { 50% { opacity: 0.5; } }';
    document.head.append(style);
  }

  el.style.animation = animation;
  await frames(2);
}
