---
title: Mutation Observer
category: Helpers
synonyms:
  - dom watcher
  - dom observer
  - change detector
use-cases:
  - dom changes
  - attribute watcher
  - child list observer
description: "Mutation observers watch for changes to an element's DOM tree and emit an event when they occur. Provides a thin, declarative interface to the browser's MutationObserver API."
---

```html {.example}
<div class="mutation-overview">
  <cs-mutation-observer attr="variant">
    <cs-button appearance="filled" variant="brand">Click to mutate</cs-button>
  </cs-mutation-observer>

  <p>The observer saw the variant change to <span class="current">brand</span>.</p>

  <script type="module">
    const container = document.querySelector('.mutation-overview');
    const mutationObserver = container.querySelector('cs-mutation-observer');
    const button = container.querySelector('cs-button');
    const current = container.querySelector('.current');
    const variants = ['brand', 'success', 'neutral', 'warning', 'danger'];
    let clicks = 0;

    // Change the button's variant attribute
    button.addEventListener('click', () => {
      clicks++;
      button.setAttribute('variant', variants[clicks % variants.length]);
    });

    // The observer reports each change it detects
    mutationObserver.addEventListener('cs-mutation', () => {
      current.textContent = button.getAttribute('variant');
    });
  </script>

  <style>
    .mutation-overview cs-button {
      margin-bottom: var(--cs-space-m);
    }
  </style>
</div>
```

The mutation observer will report changes to the content it wraps through the `cs-mutation` event. When emitted, `event.detail.mutationList` holds a collection of [MutationRecord](https://developer.mozilla.org/en-US/docs/Web/API/MutationRecord) objects describing how it changed.

:::info
<strong>Specify at least one of `attr`, `child-list`, or `char-data`.</strong><br />
These attributes tell the observer what changes to watch. Without at least one, no `cs-mutation` events are emitted.
:::

## Examples

### Child List

Use the `child-list` attribute to watch for new child elements that are added or removed.

```html {.example}
<div class="mutation-child-list">
  <cs-mutation-observer child-list>
    <div class="buttons">
      <cs-button appearance="filled" variant="brand">Add button</cs-button>
    </div>
  </cs-mutation-observer>

  <p>Add buttons, then click a numbered one to remove it. The observer saw <span class="log">no changes yet</span>.</p>

  <script type="module">
    const container = document.querySelector('.mutation-child-list');
    const mutationObserver = container.querySelector('cs-mutation-observer');
    const buttons = container.querySelector('.buttons');
    const button = container.querySelector('cs-button[variant="brand"]');
    const log = container.querySelector('.log');
    let i = 0;

    // Add a button
    button.addEventListener('click', () => {
      const button = document.createElement('cs-button');
      button.setAttribute('appearance', 'filled');
      button.textContent = ++i;
      buttons.append(button);
    });

    // Remove a button
    buttons.addEventListener('click', event => {
      const target = event.target.closest('cs-button:not([variant="brand"])');
      event.stopPropagation();

      if (target) {
        target.remove();
      }
    });

    // The observer reports each change it detects
    mutationObserver.addEventListener('cs-mutation', event => {
      const [record] = event.detail.mutationList;
      log.textContent = record.addedNodes.length ? 'a button added' : 'a button removed';
    });
  </script>

  <style>
    .mutation-child-list .buttons {
      display: flex;
      gap: var(--cs-space-2xs);
      flex-wrap: wrap;
      margin-bottom: var(--cs-space-m);
    }
  </style>
</div>
```
