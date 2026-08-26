---
title: Visual Tests
description: A page to visually test component styles against native styles.
---

<style>
  #content {
    p {
      max-width: 90ch;
    }

    tbody {
      & .cs-grid {
        --min-column-size: 5ch;
      }

      & tr th:first-of-type {
        width: 20ch;
      }

      & th {
        vertical-align: middle;
      }

      & tr:hover {
        background-color: color-mix(in oklch, var(--cs-color-fill-quiet), transparent 60%)
      }
    }

    cs-divider {
      --width: var(--cs-border-width-m);
      --spacing: var(--cs-space-3xl);
    }
  }
</style>

With so many ways to build with and use Cornerstone components, visual tests help ensure consistency and prevent broken styles from leaking into production.

These tests can come in handy when creating or customizing your own theme. Look through each test case to make sure that custom styles in your theme cover all of the attributes, utilities, and built-in styles Cornerstone offers.

<cs-tab-group>
  <cs-tab panel="native">Native</cs-tab>
  <cs-tab panel="color">Color</cs-tab>
  <cs-tab panel="size">Size</cs-tab>
  <cs-tab panel="alignment">Alignment</cs-tab>
  <cs-tab panel="harmony">Harmony</cs-tab>

<cs-tab-panel name="alignment">

## Alignment

Alignment tests reveal the top boundary, vertical center, and bottom boundary of components. These help to evaluate how well components align with one another when arranged horizontally.

```html {.example}
<style>
  div.alignment {
    background: linear-gradient(to bottom, lightblue, lightblue 1px, transparent 1px, transparent), linear-gradient(to top, lightblue, lightblue 1px, transparent 1px, transparent);
    position: relative;
    display: flex;
    gap: var(--cs-space-m);
    align-items: center;
  }
  div.alignment::after {
    content: '';
    position: absolute;
    top: calc(50% - 0.5px);
    width: 100%;
    height: 1px;
    background-color: red;
  }
</style>
<div class="cs-stack cs-gap-xl">
  <div class="alignment">
    <cs-switch size="xs">Switch</cs-switch>
    <cs-checkbox size="xs">Checkbox</cs-checkbox>
    <cs-radio value="1" size="xs">Radio</cs-radio>
  </div>
  <div class="alignment">
    <cs-switch size="s">Switch</cs-switch>
    <cs-checkbox size="s">Checkbox</cs-checkbox>
    <cs-radio value="1" size="s">Radio</cs-radio>
  </div>
  <div class="alignment">
    <cs-switch>Switch</cs-switch>
    <cs-checkbox>Checkbox</cs-checkbox>
    <cs-radio value="1">Radio</cs-radio>
  </div>
  <div class="alignment">
    <cs-switch size="l">Switch</cs-switch>
    <cs-checkbox size="l">Checkbox</cs-checkbox>
    <cs-radio value="1" size="l">Radio</cs-radio>
  </div>
  <div class="alignment">
    <cs-switch size="xl">Switch</cs-switch>
    <cs-checkbox size="xl">Checkbox</cs-checkbox>
    <cs-radio value="1" size="xl">Radio</cs-radio>
  </div>
  <div class="alignment">
    <cs-textarea placeholder="textarea" size="xs" rows="1"></cs-textarea>
    <cs-input placeholder="input" size="xs"></cs-input>
    <cs-select size="xs" value="1" multiple>
      <cs-option value="1">Option</cs-option>
    </cs-select>
    <cs-color-picker size="xs"></cs-color-picker>
    <cs-button size="xs">Button</cs-button>
  </div>
  <div class="alignment">
    <cs-textarea placeholder="textarea" size="s" rows="1"></cs-textarea>
    <cs-input placeholder="input" size="s"></cs-input>
    <cs-select size="s" value="1" multiple>
      <cs-option value="1">Option</cs-option>
    </cs-select>
    <cs-color-picker size="s"></cs-color-picker>
    <cs-button size="s">Button</cs-button>
  </div>
  <div class="alignment">
    <cs-textarea placeholder="textarea" size="m" rows="1"></cs-textarea>
    <cs-input placeholder="input" size="m"></cs-input>
    <cs-select size="m" value="1" multiple>
      <cs-option value="1">Option</cs-option>
    </cs-select>
    <cs-color-picker size="m"></cs-color-picker>
    <cs-button size="m">Button</cs-button>
  </div>
  <div class="alignment">
    <cs-textarea placeholder="textarea" size="l" rows="1"></cs-textarea>
    <cs-input placeholder="input" size="l"></cs-input>
    <cs-select size="l" value="1" multiple>
      <cs-option value="1">Option</cs-option>
    </cs-select>
    <cs-color-picker size="l"></cs-color-picker>
    <cs-button size="l">Button</cs-button>
  </div>
  <div class="alignment">
    <cs-textarea placeholder="textarea" size="xl" rows="1"></cs-textarea>
    <cs-input placeholder="input" size="xl"></cs-input>
    <cs-select size="xl" value="1" multiple>
      <cs-option value="1">Option</cs-option>
    </cs-select>
    <cs-color-picker size="xl"></cs-color-picker>
    <cs-button size="xl">Button</cs-button>
  </div>
  <div class="alignment">
    <cs-badge>Badge</cs-badge>
    <code>Code</code>
    <kbd>Keyboard</kbd>
    <ins>Inserted</ins>
    <del>Deleted</del>
    <mark>Highlighted</mark>
  </div>
  <div class="alignment">
    <cs-avatar></cs-avatar>
    <cs-rating></cs-rating>
    <cs-button appearance="plain">
      <cs-icon name="settings" label="Settings"></cs-icon>
    </cs-button>
    <cs-spinner></cs-spinner>
  </div>
</div>
```

</cs-tab-panel>

<cs-tab-panel name="color">

## Color

Color tests ensure that both the `variant` attribute and `.cs-[variant]` classes have identical results for components that support them. Developers should be able to use both of these interchangeably to give the component the intended semantic color.

<h3>Badge</h3>

<div class="table-scroll">
<table>
  <thead>
    <th></th>
    <th><code>variant=""</code></th>
    <th><code>.cs-[variant]</code></th>
  </thead>
  <tbody>
    <tr>
      <th><code>brand</code></th>
      <td>
        <div class="cs-cluster cs-gap-2xs">
          <cs-badge variant="brand" appearance="accent">Accent</cs-badge>
          <cs-badge variant="brand" appearance="filled-outlined">Filled-Outlined</cs-badge>
          <cs-badge variant="brand" appearance="filled">Filled</cs-badge>
          <cs-badge variant="brand" appearance="outlined">Outlined</cs-badge>
        </div>
      </td>
      <td>
        <div class="cs-cluster cs-gap-2xs">
          <cs-badge class="cs-brand" appearance="accent">Accent</cs-badge>
          <cs-badge class="cs-brand" appearance="filled-outlined">Filled-Outlined</cs-badge>
          <cs-badge class="cs-brand" appearance="filled">Filled</cs-badge>
          <cs-badge class="cs-brand" appearance="outlined">Outlined</cs-badge>
        </div>
      </td>
    </tr>
    <tr>
      <th><code>neutral</code></th>
      <td>
        <div class="cs-cluster cs-gap-2xs">
          <cs-badge variant="neutral" appearance="accent">Accent</cs-badge>
          <cs-badge variant="neutral" appearance="filled-outlined">Filled-Outlined</cs-badge>
          <cs-badge variant="neutral" appearance="filled">Filled</cs-badge>
          <cs-badge variant="neutral" appearance="outlined">Outlined</cs-badge>
        </div>
      </td>
      <td>
        <div class="cs-cluster cs-gap-2xs">
          <cs-badge class="cs-neutral" appearance="accent">Accent</cs-badge>
          <cs-badge class="cs-neutral" appearance="filled-outlined">Filled-Outlined</cs-badge>
          <cs-badge class="cs-neutral" appearance="filled">Filled</cs-badge>
          <cs-badge class="cs-neutral" appearance="outlined">Outlined</cs-badge>
        </div>
      </td>
    </tr>
    <tr>
      <th><code>success</code></th>
      <td>
        <div class="cs-cluster cs-gap-2xs">
          <cs-badge variant="success" appearance="accent">Accent</cs-badge>
          <cs-badge variant="success" appearance="filled-outlined">Filled-Outlined</cs-badge>
          <cs-badge variant="success" appearance="filled">Filled</cs-badge>
          <cs-badge variant="success" appearance="outlined">Outlined</cs-badge>
        </div>
      </td>
      <td>
        <div class="cs-cluster cs-gap-2xs">
          <cs-badge class="cs-success" appearance="accent">Accent</cs-badge>
          <cs-badge class="cs-success" appearance="filled-outlined">Filled-Outlined</cs-badge>
          <cs-badge class="cs-success" appearance="filled">Filled</cs-badge>
          <cs-badge class="cs-success" appearance="outlined">Outlined</cs-badge>
        </div>
      </td>
    </tr>
    <tr>
      <th><code>warning</code></th>
      <td>
        <div class="cs-cluster cs-gap-2xs">
          <cs-badge variant="warning" appearance="accent">Accent</cs-badge>
          <cs-badge variant="warning" appearance="filled-outlined">Filled-Outlined</cs-badge>
          <cs-badge variant="warning" appearance="filled">Filled</cs-badge>
          <cs-badge variant="warning" appearance="outlined">Outlined</cs-badge>
        </div>
      </td>
      <td>
        <div class="cs-cluster cs-gap-2xs">
          <cs-badge class="cs-warning" appearance="accent">Accent</cs-badge>
          <cs-badge class="cs-warning" appearance="filled-outlined">Filled-Outlined</cs-badge>
          <cs-badge class="cs-warning" appearance="filled">Filled</cs-badge>
          <cs-badge class="cs-warning" appearance="outlined">Outlined</cs-badge>
        </div>
      </td>
    </tr>
    <tr>
      <th><code>danger</code></th>
      <td>
        <div class="cs-cluster cs-gap-2xs">
          <cs-badge variant="danger" appearance="accent">Accent</cs-badge>
          <cs-badge variant="danger" appearance="filled-outlined">Filled-Outlined</cs-badge>
          <cs-badge variant="danger" appearance="filled">Filled</cs-badge>
          <cs-badge variant="danger" appearance="outlined">Outlined</cs-badge>
        </div>
      </td>
      <td>
        <div class="cs-cluster cs-gap-2xs">
          <cs-badge class="cs-danger" appearance="accent">Accent</cs-badge>
          <cs-badge class="cs-danger" appearance="filled-outlined">Filled-Outlined</cs-badge>
          <cs-badge class="cs-danger" appearance="filled">Filled</cs-badge>
          <cs-badge class="cs-danger" appearance="outlined">Outlined</cs-badge>
        </div>
      </td>
    </tr>
  </tbody>
</table>
</div>
<cs-divider></cs-divider>

<h3>Button</h3>

<div class="table-scroll">
<table>
  <thead>
    <th></th>
    <th><code>variant=""</code></th>
    <th><code>.cs-[variant]</code></th>
  </thead>
  <tbody>
    <tr>
      <th><code>brand</code></th>
      <td>
        <div class="cs-cluster cs-gap-2xs">
          <cs-button variant="brand" appearance="accent">Accent</cs-button>
          <cs-button variant="brand" appearance="filled-outlined">Filled-Outlined</cs-button>
          <cs-button variant="brand" appearance="filled">Filled</cs-button>
          <cs-button variant="brand" appearance="outlined">Outlined</cs-button>
          <cs-button variant="brand" appearance="plain">Plain</cs-button>
        </div>
      </td>
      <td>
        <div class="cs-cluster cs-gap-2xs">
          <cs-button class="cs-brand" appearance="accent">Accent</cs-button>
          <cs-button class="cs-brand" appearance="filled-outlined">Filled-Outlined</cs-button>
          <cs-button class="cs-brand" appearance="filled">Filled</cs-button>
          <cs-button class="cs-brand" appearance="outlined">Outlined</cs-button>
          <cs-button class="cs-brand" appearance="plain">Plain</cs-button>
        </div>
      </td>
    </tr>
    <tr>
      <th><code>neutral</code></th>
      <td>
        <div class="cs-cluster cs-gap-2xs">
          <cs-button variant="neutral" appearance="accent">Accent</cs-button>
          <cs-button variant="neutral" appearance="filled-outlined">Filled-Outlined</cs-button>
          <cs-button variant="neutral" appearance="filled">Filled</cs-button>
          <cs-button variant="neutral" appearance="outlined">Outlined</cs-button>
          <cs-button variant="neutral" appearance="plain">Plain</cs-button>
        </div>
      </td>
      <td>
        <div class="cs-cluster cs-gap-2xs">
          <cs-button class="cs-neutral" appearance="accent">Accent</cs-button>
          <cs-button class="cs-neutral" appearance="filled-outlined">Filled-Outlined</cs-button>
          <cs-button class="cs-neutral" appearance="filled">Filled</cs-button>
          <cs-button class="cs-neutral" appearance="outlined">Outlined</cs-button>
          <cs-button class="cs-neutral" appearance="plain">Plain</cs-button>
        </div>
      </td>
    </tr>
    <tr>
      <th><code>success</code></th>
      <td>
        <div class="cs-cluster cs-gap-2xs">
          <cs-button variant="success" appearance="accent">Accent</cs-button>
          <cs-button variant="success" appearance="filled-outlined">Filled-Outlined</cs-button>
          <cs-button variant="success" appearance="filled">Filled</cs-button>
          <cs-button variant="success" appearance="outlined">Outlined</cs-button>
          <cs-button variant="success" appearance="plain">Plain</cs-button>
        </div>
      </td>
      <td>
        <div class="cs-cluster cs-gap-2xs">
          <cs-button class="cs-success" appearance="accent">Accent</cs-button>
          <cs-button class="cs-success" appearance="filled-outlined">Filled-Outlined</cs-button>
          <cs-button class="cs-success" appearance="filled">Filled</cs-button>
          <cs-button class="cs-success" appearance="outlined">Outlined</cs-button>
          <cs-button class="cs-success" appearance="plain">Plain</cs-button>
        </div>
      </td>
    </tr>
    <tr>
      <th><code>warning</code></th>
      <td>
        <div class="cs-cluster cs-gap-2xs">
          <cs-button variant="warning" appearance="accent">Accent</cs-button>
          <cs-button variant="warning" appearance="filled-outlined">Filled-Outlined</cs-button>
          <cs-button variant="warning" appearance="filled">Filled</cs-button>
          <cs-button variant="warning" appearance="outlined">Outlined</cs-button>
          <cs-button variant="warning" appearance="plain">Plain</cs-button>
        </div>
      </td>
      <td>
        <div class="cs-cluster cs-gap-2xs">
          <cs-button class="cs-warning" appearance="accent">Accent</cs-button>
          <cs-button class="cs-warning" appearance="filled-outlined">Filled-Outlined</cs-button>
          <cs-button class="cs-warning" appearance="filled">Filled</cs-button>
          <cs-button class="cs-warning" appearance="outlined">Outlined</cs-button>
          <cs-button class="cs-warning" appearance="plain">Plain</cs-button>
        </div>
      </td>
    </tr>
    <tr>
      <th><code>danger</code></th>
      <td>
        <div class="cs-cluster cs-gap-2xs">
          <cs-button variant="danger" appearance="accent">Accent</cs-button>
          <cs-button variant="danger" appearance="filled-outlined">Filled-Outlined</cs-button>
          <cs-button variant="danger" appearance="filled">Filled</cs-button>
          <cs-button variant="danger" appearance="outlined">Outlined</cs-button>
          <cs-button variant="danger" appearance="plain">Plain</cs-button>
        </div>
      </td>
      <td>
        <div class="cs-cluster cs-gap-2xs">
          <cs-button class="cs-danger" appearance="accent">Accent</cs-button>
          <cs-button class="cs-danger" appearance="filled-outlined">Filled-Outlined</cs-button>
          <cs-button class="cs-danger" appearance="filled">Filled</cs-button>
          <cs-button class="cs-danger" appearance="outlined">Outlined</cs-button>
          <cs-button class="cs-danger" appearance="plain">Plain</cs-button>
        </div>
      </td>
    </tr>
  </tbody>
</table>
</div>
<cs-divider></cs-divider>

<h3>Callout</h3>

<div class="table-scroll">
<table>
  <thead>
    <th></th>
    <th><code>variant=""</code></th>
    <th><code>.cs-[variant]</code></th>
  </thead>
  <tbody>
    <tr>
      <th><code>brand</code></th>
      <td>
        <div class="cs-grid cs-gap-2xs">
          <cs-callout variant="brand" appearance="accent">
            <cs-icon slot="icon" name="stars"></cs-icon>
            Accent
          </cs-callout>
          <cs-callout variant="brand" appearance="filled-outlined">
            <cs-icon slot="icon" name="stars"></cs-icon>
            Filled-Outlined
          </cs-callout>
          <cs-callout variant="brand" appearance="filled">
            <cs-icon slot="icon" name="stars"></cs-icon>
            Filled
          </cs-callout>
          <cs-callout variant="brand" appearance="outlined">
            <cs-icon slot="icon" name="stars"></cs-icon>
            Outlined
          </cs-callout>
          <cs-callout variant="brand" appearance="plain">
            <cs-icon slot="icon" name="stars"></cs-icon>
            Plain
          </cs-callout>
        </div>
      </td>
      <td>
        <div class="cs-grid cs-gap-2xs">
          <cs-callout class="cs-brand" appearance="accent">
            <cs-icon slot="icon" name="stars"></cs-icon>
            Accent
          </cs-callout>
          <cs-callout class="cs-brand" appearance="filled-outlined">
            <cs-icon slot="icon" name="stars"></cs-icon>
            Filled-Outlined
          </cs-callout>
          <cs-callout class="cs-brand" appearance="filled">
            <cs-icon slot="icon" name="stars"></cs-icon>
            Filled
          </cs-callout>
          <cs-callout class="cs-brand" appearance="outlined">
            <cs-icon slot="icon" name="stars"></cs-icon>
            Outlined
          </cs-callout>
          <cs-callout class="cs-brand" appearance="plain">
            <cs-icon slot="icon" name="stars"></cs-icon>
            Plain
          </cs-callout>
        </div>
      </td>
    </tr>
    <tr>
      <th><code>neutral</code></th>
      <td>
        <div class="cs-grid cs-gap-2xs">
          <cs-callout variant="neutral" appearance="accent">
            <cs-icon slot="icon" name="info" variant="fill"></cs-icon>
            Accent
          </cs-callout>
          <cs-callout variant="neutral" appearance="filled-outlined">
            <cs-icon slot="icon" name="info" variant="fill"></cs-icon>
            Filled-Outlined
          </cs-callout>
          <cs-callout variant="neutral" appearance="filled">
            <cs-icon slot="icon" name="info" variant="fill"></cs-icon>
            Filled
          </cs-callout>
          <cs-callout variant="neutral" appearance="outlined">
            <cs-icon slot="icon" name="info" variant="fill"></cs-icon>
            Outlined
          </cs-callout>
          <cs-callout variant="neutral" appearance="plain">
            <cs-icon slot="icon" name="info" variant="fill"></cs-icon>
            Plain
          </cs-callout>
        </div>
      </td>
      <td>
        <div class="cs-grid cs-gap-2xs">
          <cs-callout class="cs-neutral" appearance="accent">
            <cs-icon slot="icon" name="info" variant="fill"></cs-icon>
            Accent
          </cs-callout>
          <cs-callout class="cs-neutral" appearance="filled-outlined">
            <cs-icon slot="icon" name="info" variant="fill"></cs-icon>
            Filled-Outlined
          </cs-callout>
          <cs-callout class="cs-neutral" appearance="filled">
            <cs-icon slot="icon" name="info" variant="fill"></cs-icon>
            Filled
          </cs-callout>
          <cs-callout class="cs-neutral" appearance="outlined">
            <cs-icon slot="icon" name="info" variant="fill"></cs-icon>
            Outlined
          </cs-callout>
          <cs-callout class="cs-neutral" appearance="plain">
            <cs-icon slot="icon" name="info" variant="fill"></cs-icon>
            Plain
          </cs-callout>
        </div>
      </td>
    </tr>
    <tr>
      <th><code>success</code></th>
      <td>
        <div class="cs-grid cs-gap-2xs">
          <cs-callout variant="success" appearance="accent">
            <cs-icon slot="icon" name="check_circle" variant="fill"></cs-icon>
            Accent
          </cs-callout>
          <cs-callout variant="success" appearance="filled-outlined">
            <cs-icon slot="icon" name="check_circle" variant="fill"></cs-icon>
            Filled-Outlined
          </cs-callout>
          <cs-callout variant="success" appearance="filled">
            <cs-icon slot="icon" name="check_circle" variant="fill"></cs-icon>
            Filled
          </cs-callout>
          <cs-callout variant="success" appearance="outlined">
            <cs-icon slot="icon" name="check_circle" variant="fill"></cs-icon>
            Outlined
          </cs-callout>
          <cs-callout variant="success" appearance="plain">
            <cs-icon slot="icon" name="check_circle" variant="fill"></cs-icon>
            Plain
          </cs-callout>
        </div>
      </td>
      <td>
        <div class="cs-grid cs-gap-2xs">
          <cs-callout class="cs-success" appearance="accent">
            <cs-icon slot="icon" name="check_circle" variant="fill"></cs-icon>
            Accent
          </cs-callout>
          <cs-callout class="cs-success" appearance="filled-outlined">
            <cs-icon slot="icon" name="check_circle" variant="fill"></cs-icon>
            Filled-Outlined
          </cs-callout>
          <cs-callout class="cs-success" appearance="filled">
            <cs-icon slot="icon" name="check_circle" variant="fill"></cs-icon>
            Filled
          </cs-callout>
          <cs-callout class="cs-success" appearance="outlined">
            <cs-icon slot="icon" name="check_circle" variant="fill"></cs-icon>
            Outlined
          </cs-callout>
          <cs-callout class="cs-success" appearance="plain">
            <cs-icon slot="icon" name="check_circle" variant="fill"></cs-icon>
            Plain
          </cs-callout>
        </div>
      </td>
    </tr>
    <tr>
      <th><code>warning</code></th>
      <td>
        <div class="cs-grid cs-gap-2xs">
          <cs-callout variant="warning" appearance="accent">
            <cs-icon slot="icon" name="error" variant="fill"></cs-icon>
            Accent
          </cs-callout>
          <cs-callout variant="warning" appearance="filled-outlined">
            <cs-icon slot="icon" name="error" variant="fill"></cs-icon>
            Filled-Outlined
          </cs-callout>
          <cs-callout variant="warning" appearance="filled">
            <cs-icon slot="icon" name="error" variant="fill"></cs-icon>
            Filled
          </cs-callout>
          <cs-callout variant="warning" appearance="outlined">
            <cs-icon slot="icon" name="error" variant="fill"></cs-icon>
            Outlined
          </cs-callout>
          <cs-callout variant="warning" appearance="plain">
            <cs-icon slot="icon" name="error" variant="fill"></cs-icon>
            Plain
          </cs-callout>
        </div>
      </td>
      <td>
        <div class="cs-grid cs-gap-2xs">
          <cs-callout class="cs-warning" appearance="accent">
            <cs-icon slot="icon" name="error" variant="fill"></cs-icon>
            Accent
          </cs-callout>
          <cs-callout class="cs-warning" appearance="filled-outlined">
            <cs-icon slot="icon" name="error" variant="fill"></cs-icon>
            Filled-Outlined
          </cs-callout>
          <cs-callout class="cs-warning" appearance="filled">
            <cs-icon slot="icon" name="error" variant="fill"></cs-icon>
            Filled
          </cs-callout>
          <cs-callout class="cs-warning" appearance="outlined">
            <cs-icon slot="icon" name="error" variant="fill"></cs-icon>
            Outlined
          </cs-callout>
          <cs-callout class="cs-warning" appearance="plain">
            <cs-icon slot="icon" name="error" variant="fill"></cs-icon>
            Plain
          </cs-callout>
        </div>
      </td>
    </tr>
    <tr>
      <th><code>danger</code></th>
      <td>
        <div class="cs-grid cs-gap-2xs">
          <cs-callout variant="danger" appearance="accent">
            <cs-icon slot="icon" name="cancel"></cs-icon>
            Accent
          </cs-callout>
          <cs-callout variant="danger" appearance="filled-outlined">
            <cs-icon slot="icon" name="cancel"></cs-icon>
            Filled-Outlined
          </cs-callout>
          <cs-callout variant="danger" appearance="filled">
            <cs-icon slot="icon" name="cancel"></cs-icon>
            Filled
          </cs-callout>
          <cs-callout variant="danger" appearance="outlined">
            <cs-icon slot="icon" name="cancel"></cs-icon>
            Outlined
          </cs-callout>
          <cs-callout variant="danger" appearance="plain">
            <cs-icon slot="icon" name="cancel"></cs-icon>
            Plain
          </cs-callout>
        </div>
      </td>
      <td>
        <div class="cs-grid cs-gap-2xs">
          <cs-callout class="cs-danger" appearance="accent">
            <cs-icon slot="icon" name="cancel"></cs-icon>
            Accent
          </cs-callout>
          <cs-callout class="cs-danger" appearance="filled-outlined">
            <cs-icon slot="icon" name="cancel"></cs-icon>
            Filled-Outlined
          </cs-callout>
          <cs-callout class="cs-danger" appearance="filled">
            <cs-icon slot="icon" name="cancel"></cs-icon>
            Filled
          </cs-callout>
          <cs-callout class="cs-danger" appearance="outlined">
            <cs-icon slot="icon" name="cancel"></cs-icon>
            Outlined
          </cs-callout>
          <cs-callout class="cs-danger" appearance="plain">
            <cs-icon slot="icon" name="cancel"></cs-icon>
            Plain
          </cs-callout>
        </div>
      </td>
    </tr>
  </tbody>
</table>
</div>
<cs-divider></cs-divider>

<h3>Tag</h3>

<div class="table-scroll">
<table>
  <thead>
    <th></th>
    <th><code>variant=""</code></th>
    <th><code>.cs-[variant]</code></th>
  </thead>
  <tbody>
    <tr>
      <th><code>brand</code></th>
      <td>
        <div class="cs-cluster cs-gap-2xs">
          <cs-tag variant="brand" appearance="accent">Accent</cs-tag>
          <cs-tag variant="brand" appearance="filled-outlined">Filled-Outlined</cs-tag>
          <cs-tag variant="brand" appearance="filled">Filled</cs-tag>
          <cs-tag variant="brand" appearance="outlined">Outlined</cs-tag>
        </div>
      </td>
      <td>
        <div class="cs-cluster cs-gap-2xs">
          <cs-tag class="cs-brand" appearance="accent">Accent</cs-tag>
          <cs-tag class="cs-brand" appearance="filled-outlined">Filled-Outlined</cs-tag>
          <cs-tag class="cs-brand" appearance="filled">Filled</cs-tag>
          <cs-tag class="cs-brand" appearance="outlined">Outlined</cs-tag>
        </div>
      </td>
    </tr>
    <tr>
      <th><code>neutral</code></th>
      <td>
        <div class="cs-cluster cs-gap-2xs">
          <cs-tag variant="neutral" appearance="accent">Accent</cs-tag>
          <cs-tag variant="neutral" appearance="filled-outlined">Filled-Outlined</cs-tag>
          <cs-tag variant="neutral" appearance="filled">Filled</cs-tag>
          <cs-tag variant="neutral" appearance="outlined">Outlined</cs-tag>
        </div>
      </td>
      <td>
        <div class="cs-cluster cs-gap-2xs">
          <cs-tag class="cs-neutral" appearance="accent">Accent</cs-tag>
          <cs-tag class="cs-neutral" appearance="filled-outlined">Filled-Outlined</cs-tag>
          <cs-tag class="cs-neutral" appearance="filled">Filled</cs-tag>
          <cs-tag class="cs-neutral" appearance="outlined">Outlined</cs-tag>
        </div>
      </td>
    </tr>
    <tr>
      <th><code>success</code></th>
      <td>
        <div class="cs-cluster cs-gap-2xs">
          <cs-tag variant="success" appearance="accent">Accent</cs-tag>
          <cs-tag variant="success" appearance="filled-outlined">Filled-Outlined</cs-tag>
          <cs-tag variant="success" appearance="filled">Filled</cs-tag>
          <cs-tag variant="success" appearance="outlined">Outlined</cs-tag>
        </div>
      </td>
      <td>
        <div class="cs-cluster cs-gap-2xs">
          <cs-tag class="cs-success" appearance="accent">Accent</cs-tag>
          <cs-tag class="cs-success" appearance="filled-outlined">Filled-Outlined</cs-tag>
          <cs-tag class="cs-success" appearance="filled">Filled</cs-tag>
          <cs-tag class="cs-success" appearance="outlined">Outlined</cs-tag>
        </div>
      </td>
    </tr>
    <tr>
      <th><code>warning</code></th>
      <td>
        <div class="cs-cluster cs-gap-2xs">
          <cs-tag variant="warning" appearance="accent">Accent</cs-tag>
          <cs-tag variant="warning" appearance="filled-outlined">Filled-Outlined</cs-tag>
          <cs-tag variant="warning" appearance="filled">Filled</cs-tag>
          <cs-tag variant="warning" appearance="outlined">Outlined</cs-tag>
        </div>
      </td>
      <td>
        <div class="cs-cluster cs-gap-2xs">
          <cs-tag class="cs-warning" appearance="accent">Accent</cs-tag>
          <cs-tag class="cs-warning" appearance="filled-outlined">Filled-Outlined</cs-tag>
          <cs-tag class="cs-warning" appearance="filled">Filled</cs-tag>
          <cs-tag class="cs-warning" appearance="outlined">Outlined</cs-tag>
        </div>
      </td>
    </tr>
    <tr>
      <th><code>danger</code></th>
      <td>
        <div class="cs-cluster cs-gap-2xs">
          <cs-tag variant="danger" appearance="accent">Accent</cs-tag>
          <cs-tag variant="danger" appearance="filled-outlined">Filled-Outlined</cs-tag>
          <cs-tag variant="danger" appearance="filled">Filled</cs-tag>
          <cs-tag variant="danger" appearance="outlined">Outlined</cs-tag>
        </div>
      </td>
      <td>
        <div class="cs-cluster cs-gap-2xs">
          <cs-tag class="cs-danger" appearance="accent">Accent</cs-tag>
          <cs-tag class="cs-danger" appearance="filled-outlined">Filled-Outlined</cs-tag>
          <cs-tag class="cs-danger" appearance="filled">Filled</cs-tag>
          <cs-tag class="cs-danger" appearance="outlined">Outlined</cs-tag>
        </div>
      </td>
    </tr>
  </tbody>
</table>
</div>

</cs-tab-panel>

<cs-tab-panel name="harmony">

## Harmony

Harmony tests show how related components look together. These can help validate design choices or reveal where design intervention is needed to get a consistent, harmonious look and feel.

<h3>Form Controls</h3>

```html {.example}
<form class="cs-stack">
  <cs-input label="Input" placeholder="Placeholder"></cs-input>
  <cs-select label="Select" value="option-1">
    <cs-option value="option-1">Option 1</cs-option>
    <cs-option value="option-2">Option 2</cs-option>
    <cs-option value="option-3">Option 3</cs-option>
  </cs-select>
  <cs-textarea label="Textarea" placeholder="Placeholder"></cs-textarea>
  <cs-radio-group label="Radio group" name="a" value="1">
    <cs-radio value="1">Option 1</cs-radio>
    <cs-radio value="2">Option 2</cs-radio>
    <cs-radio value="3">Option 3</cs-radio>
  </cs-radio-group>
  <cs-checkbox>Checkbox</cs-checkbox>
  <cs-switch>Switch</cs-switch>
  <cs-slider label="Range"></cs-slider>
  <cs-button>Button</cs-button>
</form>
```

<h3>Progress</h3>

```html {.example}
<div class="cs-stack">
  <cs-progress-bar value="50" max="100"></cs-progress-bar>
  <cs-progress-ring value="50" max="100"></cs-progress-ring>
  <cs-spinner></cs-spinner>
</div>
```

</cs-tab-panel>

<cs-tab-panel name="native">

## Native

Native style tests ensure that supported native elements and utilities look the same as their Cornerstone component counterparts. Native elements may also support the same appearance, color, and size utilities as components.

<h3>Button</h3>

<div class="table-scroll">
<table>
  <thead>
    <th></th>
    <th><code>&lt;cs-button&gt;</code></th>
    <th><code>&lt;button&gt;</code></th>
  </thead>
  <tbody>
    <tr>
      <th><em>default</em></th>
      <td>
        <cs-button>Button</cs-button>
      </td>
      <td>
        <button>Button</button>
      </td>
    </tr>
    <tr>
      <th><code>accent</code></th>
      <td>
        <div class="cs-cluster cs-gap-2xs">
          <cs-button variant="brand" appearance="accent">Brand</cs-button>
          <cs-button variant="neutral" appearance="accent">Neutral</cs-button>
          <cs-button variant="success" appearance="accent">Success</cs-button>
          <cs-button variant="warning" appearance="accent">Warning</cs-button>
          <cs-button variant="danger" appearance="accent">Danger</cs-button>
        </div>
      </td>
      <td>
        <div class="cs-cluster cs-gap-2xs">
          <button class="cs-brand cs-accent">Brand</button>
          <button class="cs-neutral cs-accent">Neutral</button>
          <button class="cs-success cs-accent">Success</button>
          <button class="cs-warning cs-accent">Warning</button>
          <button class="cs-danger cs-accent">Danger</button>
        </div>
      </td>
    </tr>
    <tr>
      <th><code>filled-outlined</code></th>
      <td>
        <div class="cs-cluster cs-gap-2xs">
          <cs-button variant="brand" appearance="filled-outlined">Brand</cs-button>
          <cs-button variant="neutral" appearance="filled-outlined">Neutral</cs-button>
          <cs-button variant="success" appearance="filled-outlined">Success</cs-button>
          <cs-button variant="warning" appearance="filled-outlined">Warning</cs-button>
          <cs-button variant="danger" appearance="filled-outlined">Danger</cs-button>
        </div>
      </td>
      <td>
        <div class="cs-cluster cs-gap-2xs">
          <button class="cs-brand cs-filled cs-outlined">Brand</button>
          <button class="cs-neutral cs-filled cs-outlined">Neutral</button>
          <button class="cs-success cs-filled cs-outlined">Success</button>
          <button class="cs-warning cs-filled cs-outlined">Warning</button>
          <button class="cs-danger cs-filled cs-outlined">Danger</button>
        </div>
      </td>
    </tr>
    <tr>
      <th><code>filled</code></th>
      <td>
        <div class="cs-cluster cs-gap-2xs">
          <cs-button variant="brand" appearance="filled">Brand</cs-button>
          <cs-button variant="neutral" appearance="filled">Neutral</cs-button>
          <cs-button variant="success" appearance="filled">Success</cs-button>
          <cs-button variant="warning" appearance="filled">Warning</cs-button>
          <cs-button variant="danger" appearance="filled">Danger</cs-button>
        </div>
      </td>
      <td>
        <div class="cs-cluster cs-gap-2xs">
          <button class="cs-brand cs-filled">Brand</button>
          <button class="cs-neutral cs-filled">Neutral</button>
          <button class="cs-success cs-filled">Success</button>
          <button class="cs-warning cs-filled">Warning</button>
          <button class="cs-danger cs-filled">Danger</button>
        </div>
      </td>
    </tr>
    <tr>
      <th><code>outlined</code></th>
      <td>
        <div class="cs-cluster cs-gap-2xs">
          <cs-button variant="brand" appearance="outlined">Brand</cs-button>
          <cs-button variant="neutral" appearance="outlined">Neutral</cs-button>
          <cs-button variant="success" appearance="outlined">Success</cs-button>
          <cs-button variant="warning" appearance="outlined">Warning</cs-button>
          <cs-button variant="danger" appearance="outlined">Danger</cs-button>
        </div>
      </td>
      <td>
        <div class="cs-cluster cs-gap-2xs">
          <button class="cs-brand cs-outlined">Brand</button>
          <button class="cs-neutral cs-outlined">Neutral</button>
          <button class="cs-success cs-outlined">Success</button>
          <button class="cs-warning cs-outlined">Warning</button>
          <button class="cs-danger cs-outlined">Danger</button>
        </div>
      </td>
    </tr>
    <tr>
      <th><code>plain</code></th>
      <td>
        <div class="cs-cluster cs-gap-2xs">
          <cs-button variant="brand" appearance="plain">Brand</cs-button>
          <cs-button variant="neutral" appearance="plain">Neutral</cs-button>
          <cs-button variant="success" appearance="plain">Success</cs-button>
          <cs-button variant="warning" appearance="plain">Warning</cs-button>
          <cs-button variant="danger" appearance="plain">Danger</cs-button>
        </div>
      </td>
      <td>
        <div class="cs-cluster cs-gap-2xs">
          <button class="cs-brand cs-plain">Brand</button>
          <button class="cs-neutral cs-plain">Neutral</button>
          <button class="cs-success cs-plain">Success</button>
          <button class="cs-warning cs-plain">Warning</button>
          <button class="cs-danger cs-plain">Danger</button>
        </div>
      </td>
    </tr>
    <tr>
      <th><code>s</code></th>
      <td>
        <cs-button size="s">Small</cs-button>
      </td>
      <td>
        <button class="cs-size-s">Small</button>
      </td>
    </tr>
    <tr>
      <th><code>m</code></th>
      <td>
        <cs-button size="m">Medium</cs-button>
      </td>
      <td>
        <button class="cs-size-m">Medium</button>
      </td>
    </tr>
    <tr>
      <th><code>l</code></th>
      <td>
        <cs-button size="l">Large</cs-button>
      </td>
      <td>
        <button class="cs-size-l">Large</button>
      </td>
    </tr>
    <tr>
      <th><code>pill</code></th>
      <td>
        <cs-button pill>Pill</cs-button>
      </td>
      <td>
        <button class="cs-pill">Pill</button>
      </td>
    </tr>
  </tbody>
</table>
</div>
<cs-divider></cs-divider>

<h3>Button Group</h3>

<div class="table-scroll">
<table>
  <thead>
    <th></th>
    <th><code>&lt;cs-button&gt;</code></th>
    <th><code>&lt;button&gt;</code></th>
  </thead>
  <tbody>
    <tr>
      <th><em>default</em></th>
      <td>
        <cs-button-group label="Alignment">
          <cs-button>Left</cs-button>
          <cs-button>Center</cs-button>
          <cs-button>Right</cs-button>
        </cs-button-group>
      </td>
      <td>
        <cs-button-group label="Alignment">
          <button>Left</button>
          <button>Center</button>
          <button>Right</button>
        </cs-button-group>
      </td>
    </tr>
    <tr>
      <th><code>filled</code></th>
      <td>
        <cs-button-group label="Alignment">
          <cs-button appearance="filled">Left</cs-button>
          <cs-button appearance="filled">Center</cs-button>
          <cs-button appearance="filled">Right</cs-button>
        </cs-button-group>
      </td>
      <td>
        <cs-button-group label="Alignment">
          <button class="cs-filled">Left</button>
          <button class="cs-filled">Center</button>
          <button class="cs-filled">Right</button>
        </cs-button-group>
      </td>
    </tr>
    <tr>
      <th><code>outlined</code></th>
      <td>
        <cs-button-group label="Alignment">
          <cs-button appearance="outlined">Left</cs-button>
          <cs-button appearance="outlined">Center</cs-button>
          <cs-button appearance="outlined">Right</cs-button>
        </cs-button-group>
      </td>
      <td>
        <cs-button-group label="Alignment">
          <button class="cs-outlined">Left</button>
          <button class="cs-outlined">Center</button>
          <button class="cs-outlined">Right</button>
        </cs-button-group>
      </td>
    </tr>
    <tr>
      <th><code>pill</code></th>
      <td>
        <cs-button-group label="Alignment">
          <cs-button appearance="filled" pill>Left</cs-button>
          <cs-button appearance="filled" pill>Center</cs-button>
          <cs-button appearance="filled" pill>Right</cs-button>
        </cs-button-group>
      </td>
      <td>
        <cs-button-group label="Alignment">
          <button class="cs-filled cs-pill">Left</button>
          <button class="cs-filled cs-pill">Center</button>
          <button class="cs-filled cs-pill">Right</button>
        </cs-button-group>
      </td>
    </tr>
    <tr>
      <th><code>vertical</code></th>
      <td>
        <cs-button-group orientation="vertical" label="Alignment">
          <cs-button appearance="filled">Top</cs-button>
          <cs-button appearance="filled">Middle</cs-button>
          <cs-button appearance="filled">Bottom</cs-button>
        </cs-button-group>
      </td>
      <td>
        <cs-button-group orientation="vertical" label="Alignment">
          <button class="cs-filled">Top</button>
          <button class="cs-filled">Middle</button>
          <button class="cs-filled">Bottom</button>
        </cs-button-group>
      </td>
    </tr>
  </tbody>
</table>
</div>
<cs-divider></cs-divider>

<h3>Checkbox</h3>

<div class="table-scroll">
<table>
  <thead>
    <th></th>
    <th><code>&lt;cs-checkbox&gt;</code></th>
    <th><code>&lt;input type="checkbox"&gt;</code></th>
  </thead>
  <tbody>
    <tr>
      <th><em>default</em></th>
      <td>
        <cs-checkbox>Checkbox</cs-checkbox>
      </td>
      <td>
        <label><input type="checkbox"></input> Checkbox</label>
      </td>
    </tr>
    <tr>
      <th><code>checked</code></th>
      <td>
        <cs-checkbox checked>Checkbox</cs-checkbox>
      </td>
      <td>
        <label><input type="checkbox" checked></input> Checkbox</label>
      </td>
    </tr>
  </tbody>
</table>
</div>
<cs-divider></cs-divider>

<h3>Color Picker</h3>

<div class="table-scroll">
<table>
  <thead>
    <th></th>
    <th><code>&lt;cs-color-picker&gt;</code></th>
    <th><code>&lt;input type="color"&gt;</code></th>
  </thead>
  <tbody>
    <tr>
      <th><em>default</em></th>
      <td>
        <cs-color-picker label="Color Picker" value="#ffa07a"></cs-color-picker>
      </td>
      <td>
        <label>Color Picker <input type="color" value="#ffa07a"></input></label>
      </td>
    </tr>
  </tbody>
</table>
</div>
<cs-divider></cs-divider>

<h3>Details</h3>

<div class="table-scroll">
<table>
  <thead>
    <th></th>
    <th><code>&lt;cs-details&gt;</code></th>
    <th><code>&lt;details&gt;</code></th>
  </thead>
  <tbody>
    <tr>
      <th><em>default</em></th>
      <td>
        <cs-details summary="Summary">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
          aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </cs-details>
      </td>
      <td>
        <details>
          <summary>Summary</summary>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
          aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        </details>
      </td>
    </tr>
    <tr>
      <th><code>dir="rtl"</code></th>
      <td>
        <cs-details summary="تبديلني" lang="ar" dir="rtl">
          استخدام طريقة لوريم إيبسوم لأنها تعطي توزيعاَ طبيعياَ -إلى حد ما- للأحرف عوضاً عن
        </cs-details>
      </td>
      <td>
        <details lang="ar" dir="rtl">
          <summary>تبديلني</summary>
          <p>استخدام طريقة لوريم إيبسوم لأنها تعطي توزيعاَ طبيعياَ -إلى حد ما- للأحرف عوضاً عن</p>
        </details>
      </td>
    </tr>
  </tbody>
</table>
</div>
<cs-divider></cs-divider>

<h3>Input</h3>

<div class="table-scroll">
<table>
  <thead>
    <th></th>
    <th><code>&lt;cs-input&gt;</code></th>
    <th><code>&lt;input&gt;</code></th>
  </thead>
  <tbody>
    <tr>
      <th><em>default</em></th>
      <td>
        <cs-input label="Input" placeholder="Placeholder"></cs-input>
      </td>
      <td>
        <label>Input <input type="text" placeholder="Placeholder"></input></label>
      </td>
    </tr>
    <tr>
      <th><code>type="password"</code></th>
      <td>
        <cs-input label="Input (password)" type="password"></cs-input>
      </td>
      <td>
        <label>Input (password) <input type="password"></input></label>
      </td>
    </tr>
    <tr>
      <th><code>type="date"</code></th>
      <td>
        <cs-input label="Input (date)" type="date"></cs-input>
      </td>
      <td>
        <label>Input (date) <input type="date"></input></label>
      </td>
    </tr>
    <tr>
      <th><code>type="time"</code></th>
      <td>
        <cs-input label="Input (time)" type="time"></cs-input>
      </td>
      <td>
        <label>Input (time) <input type="time"></input></label>
      </td>
    </tr>
    <tr>
      <th><code>filled</code></th>
      <td>
        <cs-input label="Input (filled)" placeholder="Placeholder" appearance="filled"></cs-input>
      </td>
      <td>
        <label>Input (filled) <input type="text" placeholder="Placeholder" class="cs-filled"></input></label>
      </td>
    </tr>
    <tr>
      <th><code>s</code></th>
      <td>
        <cs-input label="Input (small)" placeholder="Placeholder" size="s"></cs-input>
      </td>
      <td>
        <label class="cs-size-s">Input (small) <input type="text" placeholder="Placeholder"></input></label>
      </td>
    </tr>
    <tr>
      <th><code>m</code></th>
      <td>
        <cs-input label="Input (medium)" placeholder="Placeholder" size="m"></cs-input>
      </td>
      <td>
        <label class="cs-size-m">Input (medium) <input type="text" placeholder="Placeholder"></input></label>
      </td>
    </tr>
    <tr>
      <th><code>l</code></th>
      <td>
        <cs-input label="Input (large)" placeholder="Placeholder" size="l"></cs-input>
      </td>
      <td>
        <label class="cs-size-l">Input (large) <input type="text" placeholder="Placeholder"></input></label>
      </td>
    </tr>
  </tbody>
</table>
</div>
<cs-divider></cs-divider>

<h3>Progress Bar</h3>

<div class="table-scroll">
<table>
  <thead>
    <th></th>
    <th><code>&lt;cs-progress-bar&gt;</code></th>
    <th><code>&lt;progress&gt;</code></th>
  </thead>
  <tbody>
    <tr>
      <th><em>default</em></th>
      <td>
        <cs-progress-bar value="50" max="100"></cs-progress-bar>
      </td>
      <td>
        <progress value="50" max="100"></progress>
      </td>
    </tr>
  </tbody>
</table>
</div>
<cs-divider></cs-divider>

<h3>Radio</h3>

<div class="table-scroll">
<table>
  <thead>
    <th></th>
    <th><code>&lt;cs-radio&gt;</code></th>
    <th><code>&lt;input type="radio"&gt;</code></th>
  </thead>
  <tbody>
    <tr>
      <th><em>default</em></th>
      <td>
        <cs-radio>Radio</cs-radio>
      </td>
      <td>
        <label><input type="radio"></input> Radio</label>
      </td>
    </tr>
    <tr>
      <th><code>checked</code></th>
      <td>
        <cs-radio-group value="1">
          <cs-radio value="1">Radio</cs-radio>
        </cs-radio-group>
      </td>
      <td>
        <label><input type="radio" checked></input> Radio</label>
      </td>
    </tr>
  </tbody>
</table>
</div>
<cs-divider></cs-divider>

<h3>Select</h3>

<div class="table-scroll">
<table>
  <thead>
    <th></th>
    <th><code>&lt;cs-select&gt;</code></th>
    <th><code>&lt;select&gt;</code></th>
  </thead>
  <tbody>
    <tr>
      <th><em>default</em></th>
      <td>
        <cs-select label="Select" value="1">
          <cs-option value="1">Option</cs-option>
        </cs-select>
      </td>
      <td>
        <label>Select
          <select value="1">
            <option value="1">Option</option>
          </select>
        </label>
      </td>
    </tr>
    <tr>
      <th><code>filled</code></th>
      <td>
        <cs-select label="Select (filled)" value="1" appearance="filled">
          <cs-option value="1">Option</cs-option>
        </cs-select>
      </td>
      <td>
        <label>Select (filled)
          <select class="cs-filled" value="1">
            <option value="1">Option</option>
          </select>
        </label>
      </td>
    </tr>
    <tr>
      <th><code>s</code></th>
      <td>
        <cs-select label="Select (small)" value="1" size="s">
          <cs-option value="1">Option</cs-option>
        </cs-select>
      </td>
      <td>
        <label class="cs-size-s">Select (small)
          <select value="1">
            <option value="1">Option</option>
          </select>
        </label>
      </td>
    </tr>
    <tr>
      <th><code>m</code></th>
      <td>
        <cs-select label="Select (medium)" value="1" size="m">
          <cs-option value="1">Option</cs-option>
        </cs-select>
      </td>
      <td>
        <label class="cs-size-m">Select (medium)
          <select value="1">
            <option value="1">Option</option>
          </select>
        </label>
      </td>
    </tr>
    <tr>
      <th><code>l</code></th>
      <td>
        <cs-select label="Select (large)" value="1" size="l">
          <cs-option value="1">Option</cs-option>
        </cs-select>
      </td>
      <td>
        <label class="cs-size-l">Select (large)
          <select value="1">
            <option value="1">Option</option>
          </select>
        </label>
      </td>
    </tr>
  </tbody>
</table>
</div>
<cs-divider></cs-divider>

<h3>Slider</h3>

<div class="table-scroll">
<table>
  <thead>
    <th></th>
    <th><code>&lt;cs-slider&gt;</code></th>
    <th><code>&lt;input type="range"&gt;</code></th>
  </thead>
  <tbody>
    <tr>
      <th><em>default</em></th>
      <td>
        <cs-slider label="Slider"></cs-slider>
      </td>
      <td>
        <label>Slider <input type="range"></input></label>
      </td>
    </tr>
  </tbody>
</table>
</div>
<cs-divider></cs-divider>

<h3>Textarea</h3>

<div class="table-scroll">
<table>
  <thead>
    <th></th>
    <th><code>&lt;cs-textarea&gt;</code></th>
    <th><code>&lt;textarea&gt;</code></th>
  </thead>
  <tbody>
    <tr>
      <th><em>default</em></th>
      <td>
        <cs-textarea label="Textarea" placeholder="Placeholder" rows="2"></cs-textarea>
      </td>
      <td>
        <label>Textarea <textarea placeholder="Placeholder" rows="2"></textarea></label>
      </td>
    </tr>
    <tr>
      <th><code>filled</code></th>
      <td>
        <cs-textarea label="Textarea (filled)" placeholder="Placeholder" appearance="filled" rows="2"></cs-textarea>
      </td>
      <td>
        <label>Textarea (filled) <textarea placeholder="Placeholder" class="cs-filled" rows="2"></textarea></label>
      </td>
    </tr>
    <tr>
      <th><code>s</code></th>
      <td>
        <cs-textarea label="Textarea (small)" placeholder="Placeholder" size="s" rows="2"></cs-textarea>
      </td>
      <td>
        <label class="cs-size-s">Textarea (small) <textarea placeholder="Placeholder" rows="2"></textarea></label>
      </td>
    </tr>
    <tr>
      <th><code>m</code></th>
      <td>
        <cs-textarea label="Textarea (medium)" placeholder="Placeholder" size="m" rows="2"></cs-textarea>
      </td>
      <td>
        <label class="cs-size-m">Textarea (medium) <textarea placeholder="Placeholder" rows="2"></textarea></label>
      </td>
    </tr>
    <tr>
      <th><code>l</code></th>
      <td>
        <cs-textarea label="Textarea (large)" placeholder="Placeholder" size="l" rows="2"></cs-textarea>
      </td>
      <td>
        <label class="cs-size-l">Textarea (large) <textarea placeholder="Placeholder" rows="2"></textarea></label>
      </td>
    </tr>
  </tbody>
</table>
</div>

</cs-tab-panel>

<cs-tab-panel name="size">

## Size

Size tests ensure that both the `size` attribute and `.cs-size-[xs|s|m|l|xl]` classes have identical results for components that support them. Developers should be able to use both of these interchangeably on components to get the intended size.

<h3>Button</h3>

<div class="table-scroll">
<table>
  <thead>
    <th></th>
    <th><code>size=""</code></th>
    <th><code>.cs-size-[xs|s|m|l|xl]</code></th>
  </thead>
  <tbody>
    <tr>
      <th><code>xs</code></th>
      <td>
        <cs-button size="xs">Button</cs-button>
      </td>
      <td>
        <cs-button class="cs-size-xs">Button</cs-button>
      </td>
    </tr>
    <tr>
      <th><code>s</code></th>
      <td>
        <cs-button size="s">Button</cs-button>
      </td>
      <td>
        <cs-button class="cs-size-s">Button</cs-button>
      </td>
    </tr>
    <tr>
      <th><code>m</code></th>
      <td>
        <cs-button size="m">Button</cs-button>
      </td>
      <td>
        <cs-button class="cs-size-m">Button</cs-button>
      </td>
    </tr>
    <tr>
      <th><code>l</code></th>
      <td>
        <cs-button size="l">Button</cs-button>
      </td>
      <td>
        <cs-button class="cs-size-l">Button</cs-button>
      </td>
    </tr>
    <tr>
      <th><code>xl</code></th>
      <td>
        <cs-button size="xl">Button</cs-button>
      </td>
      <td>
        <cs-button class="cs-size-xl">Button</cs-button>
      </td>
    </tr>
  </tbody>
</table>
</div>
<cs-divider></cs-divider>

<h3>Callout</h3>

<div class="table-scroll">
<table>
  <thead>
    <th></th>
    <th><code>size=""</code></th>
    <th><code>.cs-size-[xs|s|m|l|xl]</code></th>
  </thead>
  <tbody>
    <tr>
      <th><code>xs</code></th>
      <td>
        <cs-callout size="xs">
          <cs-icon slot="icon" name="stars"></cs-icon>
          Callout
        </cs-callout>
      </td>
      <td>
        <cs-callout class="cs-size-xs">
          <cs-icon slot="icon" name="stars"></cs-icon>
          Callout
        </cs-callout>
      </td>
    </tr>
    <tr>
      <th><code>s</code></th>
      <td>
        <cs-callout size="s">
          <cs-icon slot="icon" name="stars"></cs-icon>
          Callout
        </cs-callout>
      </td>
      <td>
        <cs-callout class="cs-size-s">
          <cs-icon slot="icon" name="stars"></cs-icon>
          Callout
        </cs-callout>
      </td>
    </tr>
    <tr>
      <th><code>m</code></th>
      <td>
        <cs-callout size="m">
          <cs-icon slot="icon" name="stars"></cs-icon>
          Callout
        </cs-callout>
      </td>
      <td>
        <cs-callout class="cs-size-m">
          <cs-icon slot="icon" name="stars"></cs-icon>
          Callout
        </cs-callout>
      </td>
    </tr>
    <tr>
      <th><code>l</code></th>
      <td>
        <cs-callout size="l">
          <cs-icon slot="icon" name="stars"></cs-icon>
          Callout
        </cs-callout>
      </td>
      <td>
        <cs-callout class="cs-size-l">
          <cs-icon slot="icon" name="stars"></cs-icon>
          Callout
        </cs-callout>
      </td>
    </tr>
    <tr>
      <th><code>xl</code></th>
      <td>
        <cs-callout size="xl">
          <cs-icon slot="icon" name="stars"></cs-icon>
          Callout
        </cs-callout>
      </td>
      <td>
        <cs-callout class="cs-size-xl">
          <cs-icon slot="icon" name="stars"></cs-icon>
          Callout
        </cs-callout>
      </td>
    </tr>
  </tbody>
</table>
</div>
<cs-divider></cs-divider>

<h3>Checkbox</h3>

<div class="table-scroll">
<table>
  <thead>
    <th></th>
    <th><code>size=""</code></th>
    <th><code>.cs-size-[xs|s|m|l|xl]</code></th>
  </thead>
  <tbody>
    <tr>
      <th><code>xs</code></th>
      <td>
        <cs-checkbox hint="Hint" size="xs">Checkbox</cs-checkbox>
      </td>
      <td>
        <cs-checkbox hint="Hint" class="cs-size-xs">Checkbox</cs-checkbox>
      </td>
    </tr>
    <tr>
      <th><code>s</code></th>
      <td>
        <cs-checkbox hint="Hint" size="s">Checkbox</cs-checkbox>
      </td>
      <td>
        <cs-checkbox hint="Hint" class="cs-size-s">Checkbox</cs-checkbox>
      </td>
    </tr>
    <tr>
      <th><code>m</code></th>
      <td>
        <cs-checkbox hint="Hint" size="m">Checkbox</cs-checkbox>
      </td>
      <td>
        <cs-checkbox hint="Hint" class="cs-size-m">Checkbox</cs-checkbox>
      </td>
    </tr>
    <tr>
      <th><code>l</code></th>
      <td>
        <cs-checkbox hint="Hint" size="l">Checkbox</cs-checkbox>
      </td>
      <td>
        <cs-checkbox hint="Hint" class="cs-size-l">Checkbox</cs-checkbox>
      </td>
    </tr>
    <tr>
      <th><code>xl</code></th>
      <td>
        <cs-checkbox hint="Hint" size="xl">Checkbox</cs-checkbox>
      </td>
      <td>
        <cs-checkbox hint="Hint" class="cs-size-xl">Checkbox</cs-checkbox>
      </td>
    </tr>
  </tbody>
</table>
</div>
<cs-divider></cs-divider>

<h3>Color Picker</h3>

<div class="table-scroll">
<table>
  <thead>
    <th></th>
    <th><code>size=""</code></th>
    <th><code>.cs-size-[xs|s|m|l|xl]</code></th>
  </thead>
  <tbody>
    <tr>
      <th><code>xs</code></th>
      <td>
        <cs-color-picker size="xs" label="Color Picker" hint="Hint"></cs-color-picker>
      </td>
      <td>
        <cs-color-picker class="cs-size-xs" label="Color Picker" hint="Hint"></cs-color-picker>
      </td>
    </tr>
    <tr>
      <th><code>s</code></th>
      <td>
        <cs-color-picker size="s" label="Color Picker" hint="Hint"></cs-color-picker>
      </td>
      <td>
        <cs-color-picker class="cs-size-s" label="Color Picker" hint="Hint"></cs-color-picker>
      </td>
    </tr>
    <tr>
      <th><code>m</code></th>
      <td>
        <cs-color-picker size="m" label="Color Picker" hint="Hint"></cs-color-picker>
      </td>
      <td>
        <cs-color-picker class="cs-size-m" label="Color Picker" hint="Hint"></cs-color-picker>
      </td>
    </tr>
    <tr>
      <th><code>l</code></th>
      <td>
        <cs-color-picker size="l" label="Color Picker" hint="Hint"></cs-color-picker>
      </td>
      <td>
        <cs-color-picker class="cs-size-l" label="Color Picker" hint="Hint"></cs-color-picker>
      </td>
    </tr>
    <tr>
      <th><code>xl</code></th>
      <td>
        <cs-color-picker size="xl" label="Color Picker" hint="Hint"></cs-color-picker>
      </td>
      <td>
        <cs-color-picker class="cs-size-xl" label="Color Picker" hint="Hint"></cs-color-picker>
      </td>
    </tr>
  </tbody>
</table>
</div>
<cs-divider></cs-divider>

<h3>Dropdown</h3>

<div class="table-scroll">
<table>
  <thead>
    <th></th>
    <th><code>size=""</code></th>
    <th><code>.cs-size-[xs|s|m|l|xl]</code></th>
  </thead>
  <tbody>
    <tr>
      <th><code>xs</code></th>
      <td>
        <cs-dropdown size="xs">
          <cs-button slot="trigger" with-caret size="xs">Dropdown</cs-button>
          <cs-dropdown-item>Menu Item 1</cs-dropdown-item>
          <cs-dropdown-item>Menu Item 2</cs-dropdown-item>
        </cs-dropdown>
      </td>
      <td>
        <cs-dropdown class="cs-size-xs">
          <cs-button slot="trigger" with-caret class="cs-size-xs">Dropdown</cs-button>
          <cs-dropdown-item>Menu Item 1</cs-dropdown-item>
          <cs-dropdown-item>Menu Item 2</cs-dropdown-item>
        </cs-dropdown>
      </td>
    </tr>
    <tr>
      <th><code>s</code></th>
      <td>
        <cs-dropdown size="s">
          <cs-button slot="trigger" with-caret size="s">Dropdown</cs-button>
          <cs-dropdown-item>Menu Item 1</cs-dropdown-item>
          <cs-dropdown-item>Menu Item 2</cs-dropdown-item>
        </cs-dropdown>
      </td>
      <td>
        <cs-dropdown class="cs-size-s">
          <cs-button slot="trigger" with-caret class="cs-size-s">Dropdown</cs-button>
          <cs-dropdown-item>Menu Item 1</cs-dropdown-item>
          <cs-dropdown-item>Menu Item 2</cs-dropdown-item>
        </cs-dropdown>
      </td>
    </tr>
    <tr>
      <th><code>m</code></th>
      <td>
        <cs-dropdown size="m">
          <cs-button slot="trigger" with-caret size="m">Dropdown</cs-button>
          <cs-dropdown-item>Menu Item 1</cs-dropdown-item>
          <cs-dropdown-item>Menu Item 2</cs-dropdown-item>
        </cs-dropdown>
      </td>
      <td>
        <cs-dropdown class="cs-size-m">
          <cs-button slot="trigger" with-caret class="cs-size-m">Dropdown</cs-button>
          <cs-dropdown-item>Menu Item 1</cs-dropdown-item>
          <cs-dropdown-item>Menu Item 2</cs-dropdown-item>
        </cs-dropdown>
      </td>
    </tr>
    <tr>
      <th><code>l</code></th>
      <td>
        <cs-dropdown size="l">
          <cs-button slot="trigger" with-caret size="l">Dropdown</cs-button>
          <cs-dropdown-item>Menu Item 1</cs-dropdown-item>
          <cs-dropdown-item>Menu Item 2</cs-dropdown-item>
        </cs-dropdown>
      </td>
      <td>
        <cs-dropdown class="cs-size-l">
          <cs-button slot="trigger" with-caret class="cs-size-l">Dropdown</cs-button>
          <cs-dropdown-item>Menu Item 1</cs-dropdown-item>
          <cs-dropdown-item>Menu Item 2</cs-dropdown-item>
        </cs-dropdown>
      </td>
    </tr>
    <tr>
      <th><code>xl</code></th>
      <td>
        <cs-dropdown size="xl">
          <cs-button slot="trigger" with-caret size="xl">Dropdown</cs-button>
          <cs-dropdown-item>Menu Item 1</cs-dropdown-item>
          <cs-dropdown-item>Menu Item 2</cs-dropdown-item>
        </cs-dropdown>
      </td>
      <td>
        <cs-dropdown class="cs-size-xl">
          <cs-button slot="trigger" with-caret class="cs-size-xl">Dropdown</cs-button>
          <cs-dropdown-item>Menu Item 1</cs-dropdown-item>
          <cs-dropdown-item>Menu Item 2</cs-dropdown-item>
        </cs-dropdown>
      </td>
    </tr>
  </tbody>
</table>
</div>
<cs-divider></cs-divider>

<h3>Input</h3>

<div class="table-scroll">
<table>
  <thead>
    <th></th>
    <th><code>size=""</code></th>
    <th><code>.cs-size-[xs|s|m|l|xl]</code></th>
  </thead>
  <tbody>
    <tr>
      <th><code>xs</code></th>
      <td>
        <cs-input size="xs" label="Input" placeholder="Placeholder" hint="Hint"></cs-input>
      </td>
      <td>
        <cs-input class="cs-size-xs" label="Input" placeholder="Placeholder" hint="Hint"></cs-input>
      </td>
    </tr>
    <tr>
      <th><code>s</code></th>
      <td>
        <cs-input size="s" label="Input" placeholder="Placeholder" hint="Hint"></cs-input>
      </td>
      <td>
        <cs-input class="cs-size-s" label="Input" placeholder="Placeholder" hint="Hint"></cs-input>
      </td>
    </tr>
    <tr>
      <th><code>m</code></th>
      <td>
        <cs-input size="m" label="Input" placeholder="Placeholder" hint="Hint"></cs-input>
      </td>
      <td>
        <cs-input class="cs-size-m" label="Input" placeholder="Placeholder" hint="Hint"></cs-input>
      </td>
    </tr>
    <tr>
      <th><code>l</code></th>
      <td>
        <cs-input size="l" label="Input" placeholder="Placeholder" hint="Hint"></cs-input>
      </td>
      <td>
        <cs-input class="cs-size-l" label="Input" placeholder="Placeholder" hint="Hint"></cs-input>
      </td>
    </tr>
    <tr>
      <th><code>xl</code></th>
      <td>
        <cs-input size="xl" label="Input" placeholder="Placeholder" hint="Hint"></cs-input>
      </td>
      <td>
        <cs-input class="cs-size-xl" label="Input" placeholder="Placeholder" hint="Hint"></cs-input>
      </td>
    </tr>
  </tbody>
</table>
</div>
<cs-divider></cs-divider>

<h3>Radio</h3>

<div class="table-scroll">
<table>
  <thead>
    <th></th>
    <th><code>size=""</code></th>
    <th><code>.cs-size-[xs|s|m|l|xl]</code></th>
  </thead>
  <tbody>
    <tr>
      <th><code>xs</code></th>
      <td>
        <cs-radio size="xs">Radio</cs-radio>
      </td>
      <td>
        <cs-radio class="cs-size-xs">Radio</cs-radio>
      </td>
    </tr>
    <tr>
      <th><code>s</code></th>
      <td>
        <cs-radio size="s">Radio</cs-radio>
      </td>
      <td>
        <cs-radio class="cs-size-s">Radio</cs-radio>
      </td>
    </tr>
    <tr>
      <th><code>m</code></th>
      <td>
        <cs-radio size="m">Radio</cs-radio>
      </td>
      <td>
        <cs-radio class="cs-size-m">Radio</cs-radio>
      </td>
    </tr>
    <tr>
      <th><code>l</code></th>
      <td>
        <cs-radio size="l">Radio</cs-radio>
      </td>
      <td>
        <cs-radio class="cs-size-l">Radio</cs-radio>
      </td>
    </tr>
    <tr>
      <th><code>xl</code></th>
      <td>
        <cs-radio size="xl">Radio</cs-radio>
      </td>
      <td>
        <cs-radio class="cs-size-xl">Radio</cs-radio>
      </td>
    </tr>
  </tbody>
</table>
</div>
<cs-divider></cs-divider>

<h3>Radio Button</h3>

<div class="table-scroll">
<table>
  <thead>
    <th></th>
    <th><code>size=""</code></th>
    <th><code>.cs-size-[xs|s|m|l|xl]</code></th>
  </thead>
  <tbody>
    <tr>
      <th><code>xs</code></th>
      <td>
        <cs-radio-group orientation="horizontal">
          <cs-radio appearance="button" size="xs" value="1">Radio</cs-radio>
          <cs-radio appearance="button" size="xs" value="2">Button</cs-radio>
        </cs-radio-group>
      </td>
      <td>
        <cs-radio-group orientation="horizontal">
          <cs-radio appearance="button" class="cs-size-xs" value="1">Radio</cs-radio>
          <cs-radio appearance="button" class="cs-size-xs" value="2">Button</cs-radio>
        </cs-radio-group>
      </td>
    </tr>
    <tr>
      <th><code>s</code></th>
      <td>
        <cs-radio-group orientation="horizontal">
          <cs-radio appearance="button" size="s" value="1">Radio</cs-radio>
          <cs-radio appearance="button" size="s" value="2">Button</cs-radio>
        </cs-radio-group>
      </td>
      <td>
        <cs-radio-group orientation="horizontal">
          <cs-radio appearance="button" class="cs-size-s" value="1">Radio</cs-radio>
          <cs-radio appearance="button" class="cs-size-s" value="2">Button</cs-radio>
        </cs-radio-group>
      </td>
    </tr>
    <tr>
      <th><code>m</code></th>
      <td>
        <cs-radio-group orientation="horizontal">
          <cs-radio appearance="button" size="m" value="1">Radio</cs-radio>
          <cs-radio appearance="button" size="m" value="2">Button</cs-radio>
        </cs-radio-group>
      </td>
      <td>
        <cs-radio-group orientation="horizontal">
          <cs-radio appearance="button" class="cs-size-m" value="1">Radio</cs-radio>
          <cs-radio appearance="button" class="cs-size-m" value="2">Button</cs-radio>
        </cs-radio-group>
      </td>
    </tr>
    <tr>
      <th><code>l</code></th>
      <td>
        <cs-radio-group orientation="horizontal">
          <cs-radio appearance="button" size="l" value="1">Radio</cs-radio>
          <cs-radio appearance="button" size="l" value="2">Button</cs-radio>
        </cs-radio-group>
      </td>
      <td>
        <cs-radio-group orientation="horizontal">
          <cs-radio appearance="button" class="cs-size-l" value="1">Radio</cs-radio>
          <cs-radio appearance="button" class="cs-size-l" value="2">Button</cs-radio>
        </cs-radio-group>
      </td>
    </tr>
    <tr>
      <th><code>xl</code></th>
      <td>
        <cs-radio-group orientation="horizontal">
          <cs-radio appearance="button" size="xl" value="1">Radio</cs-radio>
          <cs-radio appearance="button" size="xl" value="2">Button</cs-radio>
        </cs-radio-group>
      </td>
      <td>
        <cs-radio-group orientation="horizontal">
          <cs-radio appearance="button" class="cs-size-xl" value="1">Radio</cs-radio>
          <cs-radio appearance="button" class="cs-size-xl" value="2">Button</cs-radio>
        </cs-radio-group>
      </td>
    </tr>
  </tbody>
</table>
</div>
<cs-divider></cs-divider>

<h3>Radio Group</h3>

<div class="table-scroll">
<table>
  <thead>
    <th></th>
    <th><code>size=""</code></th>
    <th><code>.cs-size-[xs|s|m|l|xl]</code></th>
  </thead>
  <tbody>
    <tr>
      <th><code>xs</code></th>
      <td>
        <div class="cs-stack">
          <cs-radio-group label="Radio Group" hint="Hint" size="xs">
            <cs-radio value="1">Radio 1</cs-radio>
            <cs-radio value="2">Radio 2</cs-radio>
          </cs-radio-group>
          <cs-radio-group orientation="horizontal" label="Radio Button Group" hint="Hint" size="xs">
            <cs-radio appearance="button" value="1">Radio 1</cs-radio>
            <cs-radio appearance="button" value="2">Radio 2</cs-radio>
          </cs-radio-group>
        </div>
      </td>
      <td>
        <div class="cs-stack">
          <cs-radio-group label="Radio Group" hint="Hint" class="cs-size-xs">
            <cs-radio value="1">Radio 1</cs-radio>
            <cs-radio value="2">Radio 2</cs-radio>
          </cs-radio-group>
          <cs-radio-group orientation="horizontal" label="Radio Button Group" hint="Hint" class="cs-size-xs">
            <cs-radio appearance="button" value="1">Radio 1</cs-radio>
            <cs-radio appearance="button" value="2">Radio 2</cs-radio>
          </cs-radio-group>
        </div>
      </td>
    </tr>
    <tr>
      <th><code>s</code></th>
      <td>
        <div class="cs-stack">
          <cs-radio-group label="Radio Group" hint="Hint" size="s">
            <cs-radio value="1">Radio 1</cs-radio>
            <cs-radio value="2">Radio 2</cs-radio>
          </cs-radio-group>
          <cs-radio-group orientation="horizontal" label="Radio Button Group" hint="Hint" size="s">
            <cs-radio appearance="button" value="1">Radio 1</cs-radio>
            <cs-radio appearance="button" value="2">Radio 2</cs-radio>
          </cs-radio-group>
        </div>
      </td>
      <td>
        <div class="cs-stack">
          <cs-radio-group label="Radio Group" hint="Hint" class="cs-size-s">
            <cs-radio value="1">Radio 1</cs-radio>
            <cs-radio value="2">Radio 2</cs-radio>
          </cs-radio-group>
          <cs-radio-group orientation="horizontal" label="Radio Button Group" hint="Hint" class="cs-size-s">
            <cs-radio appearance="button" value="1">Radio 1</cs-radio>
            <cs-radio appearance="button" value="2">Radio 2</cs-radio>
          </cs-radio-group>
        </div>
      </td>
    </tr>
    <tr>
      <th><code>m</code></th>
      <td>
        <div class="cs-stack">
          <cs-radio-group label="Radio Group" hint="Hint" size="m">
            <cs-radio value="1">Radio 1</cs-radio>
            <cs-radio value="2">Radio 2</cs-radio>
          </cs-radio-group>
          <cs-radio-group orientation="horizontal" label="Radio Button Group" hint="Hint" size="m">
            <cs-radio appearance="button" value="1">Radio 1</cs-radio>
            <cs-radio appearance="button" value="2">Radio 2</cs-radio>
          </cs-radio-group>
        </div>
      </td>
      <td>
        <div class="cs-stack">
          <cs-radio-group label="Radio Group" hint="Hint" class="cs-size-m">
            <cs-radio value="1">Radio 1</cs-radio>
            <cs-radio value="2">Radio 2</cs-radio>
          </cs-radio-group>
          <cs-radio-group orientation="horizontal" label="Radio Button Group" hint="Hint" class="cs-size-m">
            <cs-radio appearance="button" value="1">Radio 1</cs-radio>
            <cs-radio appearance="button" value="2">Radio 2</cs-radio>
          </cs-radio-group>
        </div>
      </td>
    </tr>
    <tr>
      <th><code>l</code></th>
      <td>
        <div class="cs-stack">
          <cs-radio-group label="Radio Group" hint="Hint" size="l">
            <cs-radio value="1">Radio 1</cs-radio>
            <cs-radio value="2">Radio 2</cs-radio>
          </cs-radio-group>
          <cs-radio-group orientation="horizontal" label="Radio Button Group" hint="Hint" size="l">
            <cs-radio appearance="button" value="1">Radio 1</cs-radio>
            <cs-radio appearance="button" value="2">Radio 2</cs-radio>
          </cs-radio-group>
        </div>
      </td>
      <td>
        <div class="cs-stack">
          <cs-radio-group label="Radio Group" hint="Hint" class="cs-size-l">
            <cs-radio value="1">Radio 1</cs-radio>
            <cs-radio value="2">Radio 2</cs-radio>
          </cs-radio-group>
          <cs-radio-group orientation="horizontal" label="Radio Button Group" hint="Hint" class="cs-size-l">
            <cs-radio appearance="button" value="1">Radio 1</cs-radio>
            <cs-radio appearance="button" value="2">Radio 2</cs-radio>
          </cs-radio-group>
        </div>
      </td>
    </tr>
    <tr>
      <th><code>xl</code></th>
      <td>
        <div class="cs-stack">
          <cs-radio-group label="Radio Group" hint="Hint" size="xl">
            <cs-radio value="1">Radio 1</cs-radio>
            <cs-radio value="2">Radio 2</cs-radio>
          </cs-radio-group>
          <cs-radio-group orientation="horizontal" label="Radio Button Group" hint="Hint" size="xl">
            <cs-radio appearance="button" value="1">Radio 1</cs-radio>
            <cs-radio appearance="button" value="2">Radio 2</cs-radio>
          </cs-radio-group>
        </div>
      </td>
      <td>
        <div class="cs-stack">
          <cs-radio-group label="Radio Group" hint="Hint" class="cs-size-xl">
            <cs-radio value="1">Radio 1</cs-radio>
            <cs-radio value="2">Radio 2</cs-radio>
          </cs-radio-group>
          <cs-radio-group orientation="horizontal" label="Radio Button Group" hint="Hint" class="cs-size-xl">
            <cs-radio appearance="button" value="1">Radio 1</cs-radio>
            <cs-radio appearance="button" value="2">Radio 2</cs-radio>
          </cs-radio-group>
        </div>
      </td>
    </tr>
  </tbody>
</table>
</div>
<cs-divider></cs-divider>

<h3>Rating</h3>

<div class="table-scroll">
<table>
  <thead>
    <th></th>
    <th><code>size=""</code></th>
    <th><code>.cs-size-[xs|s|m|l|xl]</code></th>
  </thead>
  <tbody>
    <tr>
      <th><code>xs</code></th>
      <td>
        <cs-rating size="xs"></cs-rating>
      </td>
      <td>
        <cs-rating class="cs-size-xs"></cs-rating>
      </td>
    </tr>
    <tr>
      <th><code>s</code></th>
      <td>
        <cs-rating size="s"></cs-rating>
      </td>
      <td>
        <cs-rating class="cs-size-s"></cs-rating>
      </td>
    </tr>
    <tr>
      <th><code>m</code></th>
      <td>
        <cs-rating size="m"></cs-rating>
      </td>
      <td>
        <cs-rating class="cs-size-m"></cs-rating>
      </td>
    </tr>
    <tr>
      <th><code>l</code></th>
      <td>
        <cs-rating size="l"></cs-rating>
      </td>
      <td>
        <cs-rating class="cs-size-l"></cs-rating>
      </td>
    </tr>
    <tr>
      <th><code>xl</code></th>
      <td>
        <cs-rating size="xl"></cs-rating>
      </td>
      <td>
        <cs-rating class="cs-size-xl"></cs-rating>
      </td>
    </tr>
  </tbody>
</table>
</div>
<cs-divider></cs-divider>

<h3>Select</h3>

<div class="table-scroll">
<table>
  <thead>
    <th></th>
    <th><code>size=""</code></th>
    <th><code>.cs-size-[xs|s|m|l|xl]</code></th>
  </thead>
  <tbody>
    <tr>
      <th><code>xs</code></th>
      <td>
        <cs-select size="xs" label="Select" placeholder="Placeholder" hint="Hint">
          <cs-option value="1">Option</cs-option>
        </cs-select>
      </td>
      <td>
        <cs-select class="cs-size-xs" label="Select" placeholder="Placeholder" hint="Hint">
          <cs-option value="1">Option</cs-option>
        </cs-select>
      </td>
    </tr>
    <tr>
      <th><code>s</code></th>
      <td>
        <cs-select size="s" label="Select" placeholder="Placeholder" hint="Hint">
          <cs-option value="1">Option</cs-option>
        </cs-select>
      </td>
      <td>
        <cs-select class="cs-size-s" label="Select" placeholder="Placeholder" hint="Hint">
          <cs-option value="1">Option</cs-option>
        </cs-select>
      </td>
    </tr>
    <tr>
      <th><code>m</code></th>
      <td>
        <cs-select size="m" label="Select" placeholder="Placeholder" hint="Hint">
          <cs-option value="1">Option</cs-option>
        </cs-select>
      </td>
      <td>
        <cs-select class="cs-size-m" label="Select" placeholder="Placeholder" hint="Hint">
          <cs-option value="1">Option</cs-option>
        </cs-select>
      </td>
    </tr>
    <tr>
      <th><code>l</code></th>
      <td>
        <cs-select size="l" label="Select" placeholder="Placeholder" hint="Hint">
          <cs-option value="1">Option</cs-option>
        </cs-select>
      </td>
      <td>
        <cs-select class="cs-size-l" label="Select" placeholder="Placeholder" hint="Hint">
          <cs-option value="1">Option</cs-option>
        </cs-select>
      </td>
    </tr>
    <tr>
      <th><code>xl</code></th>
      <td>
        <cs-select size="xl" label="Select" placeholder="Placeholder" hint="Hint">
          <cs-option value="1">Option</cs-option>
        </cs-select>
      </td>
      <td>
        <cs-select class="cs-size-xl" label="Select" placeholder="Placeholder" hint="Hint">
          <cs-option value="1">Option</cs-option>
        </cs-select>
      </td>
    </tr>
  </tbody>
</table>
</div>
<cs-divider></cs-divider>

<h3>Switch</h3>

<div class="table-scroll">
<table>
  <thead>
    <th></th>
    <th><code>size=""</code></th>
    <th><code>.cs-size-[xs|s|m|l|xl]</code></th>
  </thead>
  <tbody>
    <tr>
      <th><code>xs</code></th>
      <td>
        <cs-switch hint="Hint" size="xs">Switch</cs-switch>
      </td>
      <td>
        <cs-switch hint="Hint" class="cs-size-xs">Switch</cs-switch>
      </td>
    </tr>
    <tr>
      <th><code>s</code></th>
      <td>
        <cs-switch hint="Hint" size="s">Switch</cs-switch>
      </td>
      <td>
        <cs-switch hint="Hint" class="cs-size-s">Switch</cs-switch>
      </td>
    </tr>
    <tr>
      <th><code>m</code></th>
      <td>
        <cs-switch hint="Hint" size="m">Switch</cs-switch>
      </td>
      <td>
        <cs-switch hint="Hint" class="cs-size-m">Switch</cs-switch>
      </td>
    </tr>
    <tr>
      <th><code>l</code></th>
      <td>
        <cs-switch hint="Hint" size="l">Switch</cs-switch>
      </td>
      <td>
        <cs-switch hint="Hint" class="cs-size-l">Switch</cs-switch>
      </td>
    </tr>
    <tr>
      <th><code>xl</code></th>
      <td>
        <cs-switch hint="Hint" size="xl">Switch</cs-switch>
      </td>
      <td>
        <cs-switch hint="Hint" class="cs-size-xl">Switch</cs-switch>
      </td>
    </tr>
  </tbody>
</table>
</div>
<cs-divider></cs-divider>

<h3>Textarea</h3>

<div class="table-scroll">
<table>
  <thead>
    <th></th>
    <th><code>size=""</code></th>
    <th><code>.cs-size-[xs|s|m|l|xl]</code></th>
  </thead>
  <tbody>
    <tr>
      <th><code>xs</code></th>
      <td>
        <cs-textarea size="xs" label="Textarea" placeholder="Placeholder" hint="Hint"></cs-textarea>
      </td>
      <td>
        <cs-textarea class="cs-size-xs" label="Textarea" placeholder="Placeholder" hint="Hint"></cs-textarea>
      </td>
    </tr>
    <tr>
      <th><code>s</code></th>
      <td>
        <cs-textarea size="s" label="Textarea" placeholder="Placeholder" hint="Hint"></cs-textarea>
      </td>
      <td>
        <cs-textarea class="cs-size-s" label="Textarea" placeholder="Placeholder" hint="Hint"></cs-textarea>
      </td>
    </tr>
    <tr>
      <th><code>m</code></th>
      <td>
        <cs-textarea size="m" label="Textarea" placeholder="Placeholder" hint="Hint"></cs-textarea>
      </td>
      <td>
        <cs-textarea class="cs-size-m" label="Textarea" placeholder="Placeholder" hint="Hint"></cs-textarea>
      </td>
    </tr>
    <tr>
      <th><code>l</code></th>
      <td>
        <cs-textarea size="l" label="Textarea" placeholder="Placeholder" hint="Hint"></cs-textarea>
      </td>
      <td>
        <cs-textarea class="cs-size-l" label="Textarea" placeholder="Placeholder" hint="Hint"></cs-textarea>
      </td>
    </tr>
    <tr>
      <th><code>xl</code></th>
      <td>
        <cs-textarea size="xl" label="Textarea" placeholder="Placeholder" hint="Hint"></cs-textarea>
      </td>
      <td>
        <cs-textarea class="cs-size-xl" label="Textarea" placeholder="Placeholder" hint="Hint"></cs-textarea>
      </td>
    </tr>
  </tbody>
</table>
</div>

</cs-tab-panel>

</cs-tab-group>
