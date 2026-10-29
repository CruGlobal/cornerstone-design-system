---
title: Update your profile
description: Go from the settings overview into an edit screen and back, ending where you started with the change in place.
category: Account management
synonyms:
  - edit settings
  - change profile
use-cases:
  - change a phone number
  - change a time zone
screens:
  - settings-overview
  - edit-profile
  - settings-overview.saved
draft: true
---

## When to use

- An app keeps a few groups of settings, and changing one takes more than a field or two.

## When not to use

- **Fewer than about six settings in all.** Build one settings page with the fields on it, because the extra
  step to an edit screen costs more than it saves.
- **The change is to someone's sign-in identity.** Send them to their Cru account instead, because the app
  does not own those details; see [Settings overview](/inspiration/screens/settings-overview).

## Why it works

The Flow starts on the overview because most people arrive to check a value, and only some go on to change
one. Editing one group at a time keeps each form short enough to scan.

It ends back on the overview, not on the edit screen, so people see the new value in its usual place. That is
the proof the change stuck, and the toast confirms it without asking them to do anything.

## Rules

- **After a save, return to the overview and show that it worked.** Check by hand: save a change and confirm
  you land on the overview with the new value and a toast.
- **Cancel returns to the overview without saving.** Check by hand: change a field, press Cancel, and confirm
  the overview still shows the old value.
