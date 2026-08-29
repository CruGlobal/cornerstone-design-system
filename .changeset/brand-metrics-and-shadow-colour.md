---
"@cruglobal/cornerstone-design-system": patch
---

Define `--cs-color-shadow` in generated themes, and let a brand set the non-colour scales.

**Every shadow in a generated theme was silently dropped.** `themes/cru.css` used `--cs-color-shadow` three times — it is the last component of `--cs-shadow-s`, `-m` and `-l` — but never defined it. The reference theme defines it per mode; `surfaceFor()` did not emit it. A `var()` with no fallback that resolves to nothing makes the whole declaration invalid at computed-value time, so `box-shadow: var(--cs-shadow-l)` computed to `none`. That reached 14 components, `cs-card`, `cs-dialog`, `cs-drawer`, `cs-dropdown`, `cs-dropdown-item`, `cs-page`, `cs-time-input` and `cs-toast-item` among them. Both mode definitions now match the reference theme's, including their dependence on `--cs-shadow-blur-scale`.

**`brands/<brand>.json` gains an optional `metrics` block.** Until now a brand could set its hues and its fonts, and everything else in the mode-independent block was carried from the reference theme verbatim on the grounds that scales and ratios are structure rather than brand. Half of that holds: the ratios that build each ramp stay upstream's. But the multiplier at the head of each ramp is a real brand decision — Cru's own daisyUI theme sets every radius to `0` — and there was no way to say so. `metrics` writes over any declaration the reference theme already makes, so `"border-radius-scale": "0"` squares off every corner in the library and `"space-scale": "1.15"` loosens every gap, in both cases leaving the relationships between the steps untouched.

It is the same substitution mechanism the font families already used, with one difference: a name the reference theme does not define throws rather than being ignored, because a typo'd knob that silently does nothing is the worst outcome for a generator whose job is deriving a file from a handful of values.

No brand sets `metrics` yet, so the only change to a committed stylesheet is the shadow colour.
