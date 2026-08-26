---
title: Checkbox Group
description: "Checkbox groups wrap a set of related checkboxes or switches so they share a label, hint, and grouping semantics."
category: Forms
synonyms:
  - checkbox list
  - option group
  - multi-select
use-cases:
  - interest pickers
  - permission lists
  - filter panels
---

Checkboxes in a group remain independent form controls with their own `name`, `value`, and validation. The group exists to provide a shared label, hint, and accessible grouping.

```html {.example}
<cs-checkbox-group label="Interests">
  <cs-checkbox name="design">Design</cs-checkbox>
  <cs-checkbox name="development">Development</cs-checkbox>
  <cs-checkbox name="marketing">Marketing</cs-checkbox>
</cs-checkbox-group>
```

## Examples

### Label

Use the `label` attribute to give the group an accessible label. For labels that contain HTML, use the `label` slot instead.

```html {.example}
<cs-checkbox-group label="Toppings">
  <cs-checkbox name="pepperoni">Pepperoni</cs-checkbox>
  <cs-checkbox name="mushrooms">Mushrooms</cs-checkbox>
  <cs-checkbox name="onions">Onions</cs-checkbox>
  <cs-checkbox name="peppers">Peppers</cs-checkbox>
  <cs-checkbox name="sausage">Sausage</cs-checkbox>
  <cs-checkbox name="extra-cheese">Extra cheese</cs-checkbox>
</cs-checkbox-group>
```

### Hint

Add a descriptive hint to a checkbox group with the `hint` attribute. For hints that contain HTML, use the `hint` slot instead.

```html {.example .anatomy}
<cs-checkbox-group label="Workdays" hint="Choose as many as you like.">
  <cs-checkbox name="monday">Monday</cs-checkbox>
  <cs-checkbox name="wednesday">Wednesday</cs-checkbox>
  <cs-checkbox name="friday">Friday</cs-checkbox>
</cs-checkbox-group>
```

### Orientation

Checkbox groups stack vertically by default. Set the `orientation` attribute to `horizontal` to lay them out in a row.

```html {.example}
<cs-checkbox-group label="Sizes" orientation="horizontal">
  <cs-checkbox name="small">Small</cs-checkbox>
  <cs-checkbox name="medium">Medium</cs-checkbox>
  <cs-checkbox name="large">Large</cs-checkbox>
</cs-checkbox-group>
```

### Size

The size of grouped checkboxes and switches is determined by the checkbox group's `size` attribute. Any `size` set on individual items will be overridden.

```html {.example}
<div class="cs-stack">
  <cs-checkbox-group label="Extra small" size="xs">
    <cs-checkbox>Option 1</cs-checkbox>
    <cs-checkbox>Option 2</cs-checkbox>
  </cs-checkbox-group>
  <cs-checkbox-group label="Small" size="s">
    <cs-checkbox>Option 1</cs-checkbox>
    <cs-checkbox>Option 2</cs-checkbox>
  </cs-checkbox-group>
  <cs-checkbox-group label="Medium" size="m">
    <cs-checkbox>Option 1</cs-checkbox>
    <cs-checkbox>Option 2</cs-checkbox>
  </cs-checkbox-group>
  <cs-checkbox-group label="Large" size="l">
    <cs-checkbox>Option 1</cs-checkbox>
    <cs-checkbox>Option 2</cs-checkbox>
  </cs-checkbox-group>
  <cs-checkbox-group label="Extra large" size="xl">
    <cs-checkbox>Option 1</cs-checkbox>
    <cs-checkbox>Option 2</cs-checkbox>
  </cs-checkbox-group>
</div>
```

### Disabled

A checkbox group itself can't be disabled. Add the `disabled` attribute to individual checkboxes to disable them.

```html {.example}
<cs-checkbox-group label="Add-ons">
  <cs-checkbox name="insurance" disabled>Insurance</cs-checkbox>
  <cs-checkbox name="gift-wrap" disabled>Gift wrap</cs-checkbox>
  <cs-checkbox name="express-shipping">Express shipping</cs-checkbox>
  <cs-checkbox name="extended-warranty">Extended warranty</cs-checkbox>
</cs-checkbox-group>
```

### Switches

A checkbox group also works with [switches](/components/switch).

```html {.example}
<cs-checkbox-group label="Notifications" hint="Pick at least one channel.">
  <cs-switch name="email">Email</cs-switch>
  <cs-switch name="sms">SMS</cs-switch>
  <cs-switch name="push">Push</cs-switch>
</cs-checkbox-group>
```

### Required

The `required` attribute adds a visual indicator to the group's label. Because each checkbox is an independent control, the checkbox group doesn't enforce the requirement. Set the `required` property on the checkbox or call its `setCustomValidity()` method to control validation.

```html {.example}
<form>
  <cs-checkbox-group label="Accept terms" required>
    <cs-checkbox name="terms" required>I agree to the terms and conditions</cs-checkbox>
  </cs-checkbox-group>
  <br />
  <cs-button type="submit" appearance="filled">Submit</cs-button>
</form>
```
