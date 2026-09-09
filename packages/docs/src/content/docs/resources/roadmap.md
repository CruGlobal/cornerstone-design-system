---
title: Roadmap
description: The releases Cornerstone is working towards, what each one is for, and how many questions are still open inside it.
---

<div class="roadmap-trackers cs-grid cs-gap-l">
  <p class="roadmap-tracker cs-flank">
    <cs-icon class="roadmap-mark" name="github" library="brands" aria-hidden="true"></cs-icon>
    <span>Open questions about what gets built are decided in <a href="https://github.com/CruGlobal/cornerstone-design-system/issues">GitHub Issues</a>. A release showing no open questions has not been scoped yet.</span>
  </p>
  <p class="roadmap-tracker cs-flank">
    <!--
      The Jira mark, inlined. `cs-icon`'s `brands` library has no `jira`, and adding one there would ship a
      new asset out of the components package for a single docs-site sentence — so it lives here until
      something else needs it. Simple Icons v16.28.0, the same source and version `library.brands.ts` cites,
      published under CC0-1.0; its `<title>` and `role="img"` are dropped because the paragraph beside it is
      the accessible name and a second one would double it up.
    -->
    <svg class="roadmap-mark" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.005-1.005zm5.723-5.756H5.736a5.215 5.215 0 0 0 5.215 5.214h2.129v2.058a5.218 5.218 0 0 0 5.215 5.214V6.758a1.001 1.001 0 0 0-1.001-1.001zM23.013 0H11.455a5.215 5.215 0 0 0 5.215 5.215h2.129v2.057A5.215 5.215 0 0 0 24 12.483V1.005A1.001 1.001 0 0 0 23.013 0Z"/></svg>
    <span>The work that follows a decision is tracked in Jira, on Cru's own instance rather than anywhere you can reach from here.</span>
  </p>
</div>

::roadmap

## Asking for something

This is not a request queue. If your team needs something that is not here — a component, an option on one
that exists, or a platform Cornerstone does not reach yet — [Support](/resources/support) is where to say
so, and describing the case you have to serve carries further than naming the API you would like.

A request does not become a roadmap item by being filed. It becomes one when the release it belongs to has
answered enough questions for the thing to be worth building, which is the point at which it stops being a
question and starts being work. The issue you filed may well be closed before it appears here — the tracker
holds the project's open questions rather than its schedule, so a close there usually means the request has
been routed rather than refused.

The cards above are the intended contents of intended releases. Nothing on this page carries a date, and
something can move from one release to another as the questions around it get answered.
