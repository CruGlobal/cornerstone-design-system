---
title: Tab Group
category: Navigation
synonyms:
  - tabs
  - tabbed interface
  - tab bar
  - tab panel
  - tab set
use-cases:
  - tabbed content
  - tab navigation
  - settings tabs
description: "Tab groups organize related content into a single container that displays one panel at a time, with tabs for switching between them."
---

```html {.example .anatomy}
<cs-tab-group>
  <cs-tab panel="general">General</cs-tab>
  <cs-tab panel="custom">Custom</cs-tab>
  <cs-tab panel="advanced">Advanced</cs-tab>
  <cs-tab panel="disabled" disabled>Disabled</cs-tab>

  <cs-tab-panel name="general" active>This is the general tab panel.</cs-tab-panel>
  <cs-tab-panel name="custom">This is the custom tab panel.</cs-tab-panel>
  <cs-tab-panel name="advanced">This is the advanced tab panel.</cs-tab-panel>
  <cs-tab-panel name="disabled">This is a disabled tab panel.</cs-tab-panel>
</cs-tab-group>
```

Tab groups make use of [tabs](/components/tab) and [tab panels](/components/tab-panel). Each panel should have a name that's unique within the tab group, and tabs should have a `panel` attribute that points to the respective panel's name.

## Examples

### Active Tab

To make a tab active, set the `active` attribute to the name of the appropriate panel.

```html {.example}
<cs-tab-group active="advanced">
  <cs-tab panel="general">General</cs-tab>
  <cs-tab panel="custom">Custom</cs-tab>
  <cs-tab panel="advanced">Advanced</cs-tab>

  <cs-tab-panel name="general">This is the general tab panel.</cs-tab-panel>
  <cs-tab-panel name="custom">This is the custom tab panel.</cs-tab-panel>
  <cs-tab-panel name="advanced">This is the advanced tab panel.</cs-tab-panel>
</cs-tab-group>
```

### Placement

Set the `placement` attribute to move the tabs to a different edge of the panels.

| Placement                                                                       | Tabs appear                       |
| ------------------------------------------------------------------------------- | --------------------------------- |
| `top` <cs-badge appearance="outlined" variant="neutral" pill style="font-size: var(--cs-font-size-2xs);">default</cs-badge> | Above the panels, horizontally    |
| `bottom`                                                                        | Below the panels, horizontally    |
| `start`                                                                         | Before the panels, stacked vertically |
| `end`                                                                           | After the panels, stacked vertically  |

```html {.example}
<cs-tab-group placement="bottom">
  <cs-tab panel="general">General</cs-tab>
  <cs-tab panel="custom">Custom</cs-tab>
  <cs-tab panel="advanced">Advanced</cs-tab>
  <cs-tab panel="disabled" disabled>Disabled</cs-tab>

  <cs-tab-panel name="general" active>This is the general tab panel.</cs-tab-panel>
  <cs-tab-panel name="custom">This is the custom tab panel.</cs-tab-panel>
  <cs-tab-panel name="advanced">This is the advanced tab panel.</cs-tab-panel>
  <cs-tab-panel name="disabled">This is a disabled tab panel.</cs-tab-panel>
</cs-tab-group>
```

```html {.example}
<cs-tab-group placement="start">
  <cs-tab panel="general">General</cs-tab>
  <cs-tab panel="custom">Custom</cs-tab>
  <cs-tab panel="advanced">Advanced</cs-tab>
  <cs-tab panel="disabled" disabled>Disabled</cs-tab>

  <cs-tab-panel name="general" active>This is the general tab panel.</cs-tab-panel>
  <cs-tab-panel name="custom">This is the custom tab panel.</cs-tab-panel>
  <cs-tab-panel name="advanced">This is the advanced tab panel.</cs-tab-panel>
  <cs-tab-panel name="disabled">This is a disabled tab panel.</cs-tab-panel>
</cs-tab-group>
```

### Closable Tabs

You can make a tab closable by adding a close button next to the tab and inside the `nav` slot. You can position the button to your liking with CSS and handle close/restore behaviors by removing/appending the tab as desired. Note the use of `tabindex="-1"`, which prevents the close button from interfering with the tab order. The close button is still recognizable to the virtual cursor in screen readers.

```html {.example}
<cs-tab-group class="tabs-closable">
  <cs-tab panel="general">General</cs-tab>
  <cs-tab panel="closable">Closable</cs-tab>
  <cs-button slot="nav" tabindex="-1" appearance="plain" size="s">
    <cs-icon name="close" label="Close the closable tab"></cs-icon>
  </cs-button>
  <cs-tab panel="advanced">Advanced</cs-tab>

  <cs-tab-panel name="general">This is the general tab panel.</cs-tab-panel>
  <cs-tab-panel name="closable">This is the closable tab panel.</cs-tab-panel>
  <cs-tab-panel name="advanced">This is the advanced tab panel.</cs-tab-panel>
</cs-tab-group>

<br />

<cs-button disabled>Restore tab</cs-button>

<style>
  .tabs-closable cs-button {
    position: relative;
    left: -1.5em;
    top: 0.675em;
  }
</style>

<script>
  const tabGroup = document.querySelector('.tabs-closable');
  const generalTab = tabGroup.querySelectorAll('cs-tab')[0];
  const closableTab = tabGroup.querySelectorAll('cs-tab')[1];
  const closeButton = tabGroup.querySelector('cs-button');
  const restoreButton = tabGroup.nextElementSibling.nextElementSibling;

  // Remove the tab when the close button is clicked
  closeButton.addEventListener('click', () => {
    closableTab.remove();
    closeButton.remove();
    restoreButton.disabled = false;
  });

  // Restore the tab
  restoreButton.addEventListener('click', () => {
    restoreButton.disabled = true;
    generalTab.insertAdjacentElement('afterend', closeButton);
    generalTab.insertAdjacentElement('afterend', closableTab);
  });
</script>
```

### Scrolling Tabs

When there are more tabs than horizontal space allows, the nav will be scrollable.

```html {.example}
<cs-tab-group>
  <cs-tab panel="tab-1">Tab 1</cs-tab>
  <cs-tab panel="tab-2">Tab 2</cs-tab>
  <cs-tab panel="tab-3">Tab 3</cs-tab>
  <cs-tab panel="tab-4">Tab 4</cs-tab>
  <cs-tab panel="tab-5">Tab 5</cs-tab>
  <cs-tab panel="tab-6">Tab 6</cs-tab>
  <cs-tab panel="tab-7">Tab 7</cs-tab>
  <cs-tab panel="tab-8">Tab 8</cs-tab>
  <cs-tab panel="tab-9">Tab 9</cs-tab>
  <cs-tab panel="tab-10">Tab 10</cs-tab>
  <cs-tab panel="tab-11">Tab 11</cs-tab>
  <cs-tab panel="tab-12">Tab 12</cs-tab>
  <cs-tab panel="tab-13">Tab 13</cs-tab>
  <cs-tab panel="tab-14">Tab 14</cs-tab>
  <cs-tab panel="tab-15">Tab 15</cs-tab>
  <cs-tab panel="tab-16">Tab 16</cs-tab>
  <cs-tab panel="tab-17">Tab 17</cs-tab>
  <cs-tab panel="tab-18">Tab 18</cs-tab>
  <cs-tab panel="tab-19">Tab 19</cs-tab>
  <cs-tab panel="tab-20">Tab 20</cs-tab>

  <cs-tab-panel name="tab-1">Tab panel 1</cs-tab-panel>
  <cs-tab-panel name="tab-2">Tab panel 2</cs-tab-panel>
  <cs-tab-panel name="tab-3">Tab panel 3</cs-tab-panel>
  <cs-tab-panel name="tab-4">Tab panel 4</cs-tab-panel>
  <cs-tab-panel name="tab-5">Tab panel 5</cs-tab-panel>
  <cs-tab-panel name="tab-6">Tab panel 6</cs-tab-panel>
  <cs-tab-panel name="tab-7">Tab panel 7</cs-tab-panel>
  <cs-tab-panel name="tab-8">Tab panel 8</cs-tab-panel>
  <cs-tab-panel name="tab-9">Tab panel 9</cs-tab-panel>
  <cs-tab-panel name="tab-10">Tab panel 10</cs-tab-panel>
  <cs-tab-panel name="tab-11">Tab panel 11</cs-tab-panel>
  <cs-tab-panel name="tab-12">Tab panel 12</cs-tab-panel>
  <cs-tab-panel name="tab-13">Tab panel 13</cs-tab-panel>
  <cs-tab-panel name="tab-14">Tab panel 14</cs-tab-panel>
  <cs-tab-panel name="tab-15">Tab panel 15</cs-tab-panel>
  <cs-tab-panel name="tab-16">Tab panel 16</cs-tab-panel>
  <cs-tab-panel name="tab-17">Tab panel 17</cs-tab-panel>
  <cs-tab-panel name="tab-18">Tab panel 18</cs-tab-panel>
  <cs-tab-panel name="tab-19">Tab panel 19</cs-tab-panel>
  <cs-tab-panel name="tab-20">Tab panel 20</cs-tab-panel>
</cs-tab-group>
```

### Manual Activation

When focused, keyboard users can press [[Left]] or [[Right]] to select the desired tab. By default, the corresponding tab panel will be shown immediately (automatic activation). You can change this behavior by setting `activation="manual"` which will require the user to press [[Space]] or [[Enter]] before showing the tab panel (manual activation).

```html {.example}
<cs-tab-group activation="manual">
  <cs-tab panel="general">General</cs-tab>
  <cs-tab panel="custom">Custom</cs-tab>
  <cs-tab panel="advanced">Advanced</cs-tab>
  <cs-tab panel="disabled" disabled>Disabled</cs-tab>

  <cs-tab-panel name="general">This is the general tab panel.</cs-tab-panel>
  <cs-tab-panel name="custom">This is the custom tab panel.</cs-tab-panel>
  <cs-tab-panel name="advanced">This is the advanced tab panel.</cs-tab-panel>
  <cs-tab-panel name="disabled">This is a disabled tab panel.</cs-tab-panel>
</cs-tab-group>
```
