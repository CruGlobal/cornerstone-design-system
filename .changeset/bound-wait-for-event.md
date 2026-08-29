---
'@cruglobal/cornerstone-components': patch
---

Stop `waitForEvent` waiting forever.

Every `show()`, `hide()`, `expand()` and `collapse()` in the library resolves on a completion event that is
dispatched at the end of an animation — and a browser is entitled not to finish an animation. WebKit
throttles them on a backgrounded page, and `scrollend`, which `<cs-carousel>` waits on, is not guaranteed at
all. With no timeout the promise never settles, so the caller's `await` hangs for the life of the page
instead of failing, and nothing logs a word. That is the shape CI hit on WebKit in run #220:
`cs-accordion-after-collapse` fired zero times because `await item.collapse()` never returned.

`waitForEvent` now takes a timeout, defaulting to five seconds, and **resolves** on it rather than
rejecting — every caller is a state transition whose state has already changed by the time the animation
runs, so the event only reports that it settled. Rejecting would turn a cosmetic stall into an unhandled
rejection in eight components. It reaches 14 call sites.

`<cs-accordion-item>`'s generation guard is unchanged and now carries a comment saying why: a superseded
transition deliberately does not emit a completion event, because a consumer must not see a collapse that
never happened. `rapid toggling > should only fire the final after event when the animation is interrupted`
holds that line, and the cost — a superseded caller's promise going unsettled — is what the timeout above
bounds.

This does not on its own fix the WebKit failure. That test asserts inside a one-second window, and the
backstop is deliberately far longer, because it is insurance against a wedged promise rather than a timing
mechanism. Sharding the suite is the change that addresses the load.
