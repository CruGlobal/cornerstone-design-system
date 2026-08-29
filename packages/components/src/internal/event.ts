/**
 * Resolves when `eventName` fires on `el`, or when `timeout` elapses.
 *
 * Bounded deliberately. Every caller is a `show()`, `hide()`, `expand()` or `collapse()` whose completion
 * event is dispatched at the end of an animation — and a browser is entitled not to finish an animation.
 * WebKit throttles them on a backgrounded page, and `scrollend`, which the carousel waits on, is not
 * guaranteed at all. With no timeout the promise never settles, so the caller's `await` hangs for the life
 * of the page instead of failing: `<cs-accordion>`'s `cs-accordion-after-collapse` simply never fires, and
 * nothing logs a word. That is what CI hit on WebKit in run #220.
 *
 * It resolves rather than rejects. Every caller is a state transition whose state has *already* changed by
 * the time the animation runs — the event only reports that it settled. Rejecting would turn a cosmetic
 * stall into an unhandled rejection in eight components.
 *
 * The default is far longer than any animation the library runs, because this is a backstop against a
 * wedged promise and not a timing mechanism. A caller that needs a tighter bound should pass one.
 */
export function waitForEvent(el: HTMLElement, eventName: string, timeout = 5000) {
  return new Promise<void>((resolve) => {
    function settle() {
      clearTimeout(timer);
      el.removeEventListener(eventName, done);
      resolve();
    }

    function done(event: Event) {
      if (event.target === el) {
        settle();
      }
    }

    el.addEventListener(eventName, done);
    // Declared last, and only ever read from inside the two functions above — neither of which can run
    // before this line does, since the listener is attached on it and the timer is created by it.
    const timer = setTimeout(settle, timeout);
  });
}
