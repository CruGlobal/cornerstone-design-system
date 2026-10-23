---
title: Browser Support Policy
description: Which browsers Cornerstone supports, and which screen reader pairings it targets.
---

Cornerstone officially supports the latest two major versions of the most popular browsers, including Chrome, Safari, Edge, Firefox, and Opera.

The test suite runs every component in one version each of Chromium, Firefox and WebKit, the engines behind these browsers. If your browser is older than the latest two major versions, we strongly recommend upgrading.

<p>
<img src="/assets/images/chrome.png" alt="Chrome" width="64" height="64">
<img src="/assets/images/safari.png" alt="Safari" width="64" height="64">
<img src="/assets/images/edge.png" alt="Edge" width="64" height="64">
<img src="/assets/images/firefox.png" alt="Firefox" width="64" height="64">
<img src="/assets/images/opera.png" alt="Opera" width="64" height="64">
</p>

## Screen Reader Support

Cornerstone targets these screen reader and browser pairings:

- NVDA with Chrome
- NVDA with Firefox
- VoiceOver with Safari

No component has a recorded screen reader test yet, either by the team or by a person who relies on a screen reader. What has been checked is the code level: automated accessibility tests on every component with an interactive surface, in Chromium, Firefox and WebKit. The [accessibility page](/resources/accessibility) says what is verified and lists the [known gaps](/resources/accessibility#known-gaps), this one included. If a component does not work with one of these pairings, [report it](/resources/accessibility#reporting-something) with the screen reader, the browser and what you expected to hear.

## Legacy Browser Support

While we focus on modern browsers, we understand some users may be using older versions. For critical issues, we will provide fixes and/or workarounds in older browsers at our discretion.
