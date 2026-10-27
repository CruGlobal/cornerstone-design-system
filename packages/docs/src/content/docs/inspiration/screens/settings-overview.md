---
title: Settings overview
description: Every group of settings an app keeps about someone on one page, each shown read-only with its own way in to change it.
category: Account management
synonyms:
  - settings page
  - account settings
  - preferences
use-cases:
  - review your profile
  - confirm a save worked
states:
  saved: Just saved
draft: true
---

## When to use

- An app keeps a few groups of settings about someone, and each group needs more than a field or two to
  change.
- People come to check a value as often as they come to change one.

## When not to use

- **Every setting fits on one short page.** Build one settings page with the fields on it, because an
  overview with a separate edit step costs a click and a page load to change anything.
- **The detail is someone's sign-in identity.** Show it read-only and send them to their Cru account to change
  it, as the Cru account group here does, because the app does not own it.

## Why it works

Most visits to settings are to check something, not change it. Showing every value read-only answers "what
does the app think my phone number is?" without putting a form in front of someone who did not come to edit.

Each group has its own Edit link, so a change opens a short form about one thing rather than every setting at
once. Coming back here after a save shows the new value in place, which is the proof the save worked.

Name and email sit in their own group with a line saying where they are changed. That answers "why can't I
edit my email?" before it is asked, instead of leaving a read-only field to look broken.

## Rules

- **Every value is read-only here; changing one goes through its group's Edit link.** Check by hand: confirm
  the page has no form fields.
- **Each Edit link names its group to assistive technology.** Check by hand: list the page's links with a
  screen reader and confirm none is announced as just "Edit".
- **Details the app does not own say where they are changed.** Check by hand: every group the app cannot edit
  has a line naming the system that owns it.

## States

### Just saved

Shows when someone comes back from Edit profile after saving. A toast says the save worked, and the new value
is already in its group, so they can see it stuck and carry on.
