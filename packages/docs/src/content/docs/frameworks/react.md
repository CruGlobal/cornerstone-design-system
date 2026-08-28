---
title: React
description: Tips for using Cornerstone in your React app.
officialDocs: https://react.dev
sidebar:
  badge:
    text: Supported
    variant: success
---

<div class="cs-cluster cs-gap-2xs cs-not-prose">
  <cs-badge variant="success" appearance="filled" pill>
    <cs-icon name="check_circle" slot="start"></cs-icon>Shipped support
  </cs-badge>
  <cs-badge variant="neutral" appearance="filled" pill>70 wrappers</cs-badge>
</div>

React is the only stack with integration code in the package itself: the build generates a wrapper for every
component, so `@cruglobal/cornerstone-components/react/*` is a first-class entry point rather than advice.
React 19 needs none of it — it speaks custom elements natively — but the wrappers exist for 18 and below.

## Installation

To add Cornerstone to your React app, install the package from npm.

```bash
npm install @cruglobal/cornerstone-components
```

Next, include the Cornerstone theme in your app, import the components you need, and start using them!

```jsx
import '@cruglobal/cornerstone-components/styles/cornerstone.css';
import '@cruglobal/cornerstone-components/components/button/button.js';

export default function App() {
  return <cs-button variant="brand">Button</cs-button>;
}
```

React 19+ [supports custom elements](https://react.dev/blog/2024/04/25/react-19#support-for-custom-elements) natively, so you can use Cornerstone components just like any other HTML element. No wrappers needed!

If you're using React 18 or below, skip to the [legacy React wrappers](#legacy-react-wrappers-react-18-and-below) section.

## TypeScript

If you're using TypeScript, you can add type safety using the types file included with Cornerstone.

```
node_modules/@cruglobal/cornerstone-components/dist/unbundled/custom-elements-jsx.d.ts
```

This gives you inline documentation, autocomplete, and type-safe validation for every component. Add the types to whichever tsconfig holds your app's `compilerOptions`. In a Vite project that is `tsconfig.app.json` — the root `tsconfig.json` is a solution file carrying only `files: []` and `references`, so options placed there have no effect.

The leading `./` is required. TypeScript reads a bare entry as a package name rather than a path, and fails with `TS2688: Cannot find type definition file`.

```json
{
  "compilerOptions": {
    "types": ["./node_modules/@cruglobal/cornerstone-components/dist/unbundled/custom-elements-jsx.d.ts"]
  }
}
```

Alternatively, you can create a declaration file and extend JSX's `IntrinsicElements`:

```ts
import type { CustomElements, CustomCssProperties } from '@cruglobal/cornerstone-components/custom-elements-jsx.d.ts';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends CustomElements {}
  }
  interface CSSProperties extends CustomCssProperties {}
}
```

## Event Handling

Many Cornerstone components emit [native events](https://developer.mozilla.org/en-US/docs/Web/API/Event). For example, the [input component](/components/input) emits the `input` event when it receives input. In React, you can listen for the event using `onInput`.

Here's how you can bind the input's value to a state variable.

```jsx
import { useState } from 'react';
import '@cruglobal/cornerstone-components/components/input/input.js';

function MyComponent() {
  const [value, setValue] = useState('');

  return <cs-input value={value} onInput={event => setValue(event.target.value)} />;
}

export default MyComponent;
```

If you're using TypeScript, it's important to note that `event.target` will be a reference to the underlying custom element. You can use `(event.target as any).value` as a quick fix, or you can strongly type the event target as shown below.

```tsx
import { useState } from 'react';
import '@cruglobal/cornerstone-components/components/input/input.js';
import type CsInputElement from '@cruglobal/cornerstone-components/components/input/input.js';

function MyComponent() {
  const [value, setValue] = useState('');

  return <cs-input value={value} onInput={event => setValue((event.target as CsInputElement).value)} />;
}

export default MyComponent;
```

### Preact

Preact users facing type errors using components may benefit from setting "paths" in their `tsconfig.json` so that react types will instead resolve to preact/compat as described in [Preact's typescript documentation](https://preactjs.com/guide/v10/typescript/#typescript-preactcompat-configuration).

## Testing with Jest

Testing with web components can be challenging if your test environment runs in a Node environment (i.e. it doesn't run in a real browser). Fortunately, [Jest](https://jestjs.io/) has made a number of strides to support web components and provide additional browser APIs. However, it's still not a complete replication of a browser environment.

Here are some tips that will help smooth things over if you're having trouble with Jest + Cornerstone.

:::info
If you're looking for a fast, modern testing alternative, consider [Web Test Runner](https://modern-web.dev/docs/test-runner/overview/).
:::

### Upgrade Jest

Jest underwent a major revamp and received support for web components in [version 26.5.0](https://github.com/facebook/jest/blob/main/CHANGELOG.md#2650) when it introduced [JSDOM 16.2.0](https://github.com/jsdom/jsdom/blob/master/Changelog.md#1620). This release also included a number of mocks for built-in browser functions such as `MutationObserver`, `document.createRange`, and others.

If you're using [Create React App](https://reactjs.org/docs/create-a-new-react-app.html#create-react-app), you can update `react-scripts` which will also update Jest.

```
npm install react-scripts@latest
```

### Mock Missing APIs

Some components use `window.matchMedia`, but this function isn't supported by JSDOM so you'll need to mock it yourself.

In `src/setupTests.js`, add the following.

```js
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
```

For more details, refer to Jest's [manual mocking](https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom) documentation.

### Transform ES Modules

ES Modules are a [well-supported browser standard](https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/). This is how Cornerstone is distributed, but most React apps expect CommonJS. As a result, you'll probably run into the following error.

```
Error: Unable to import outside of a module
```

To fix this, add the following to your `package.json` which tells the transpiler to process Cornerstone modules.

```js
{
  "jest": {
    "transformIgnorePatterns": ["node_modules/(?!(@cruglobal|lit|@lit-labs))"]
  }
}
```

These instructions are for apps created via Create React App. If you're using Jest directly, you can add `transformIgnorePatterns` directly into `jest.config.js`.

For more details, refer to Jest's [`transformIgnorePatterns` customization](https://jestjs.io/docs/tutorial-react-native#transformignorepatterns-customization) documentation.

## Legacy React Wrappers (React 18 & Below)

React 18 and below have [poor support](https://custom-elements-everywhere.com/#react) for custom elements. For these versions, Cornerstone provides React wrappers for every component.

### Importing React Wrappers

Every Cornerstone component is available to import as a React component. Note that you import the `<CsButton>` _React component_ instead of the `<cs-button>` _custom element_ in the example below.

```jsx
import CsButton from '@cruglobal/cornerstone-components/react/button/index.js';

const MyComponent = () => <CsButton variant="brand">Click me</CsButton>;

export default MyComponent;
```

You can find a copy + paste import for each component by selecting the _React_ tab in the _Importing_ section of each component's documentation.

#### Notes About Tree Shaking

Previously, it was recommended to import from a single entrypoint like so:

```jsx
import { CsButton } from '@cruglobal/cornerstone-components/react';
```

However, tree-shaking extra Cornerstone components proved to be a challenge. As a result, we now recommend cherry-picking components you want to use, rather than importing from a single entrypoint.

```diff
- import { CsButton } from '@cruglobal/cornerstone-components/react';
+ import CsButton from '@cruglobal/cornerstone-components/react/button/index.js';
```

### Event Handling with React Wrappers

Event handling works the same as with [native custom elements](#event-handling) — bind to `onInput` and type `event.target` identically, just importing the `CsInput` wrapper instead of the custom element.

Wrappers add two conveniences. Pass `defaultValue` for an uncontrolled input:

```jsx
import CsInput from '@cruglobal/cornerstone-components/react/input/index.js';

<CsInput defaultValue="Foo" />;
```

Each wrapper re-exports a type for every `cs-`prefixed event it emits, so callbacks for those can be typed directly. `<CsInput>` exports `CsClearEvent` and `CsInvalidEvent`; check the component's own page for the full list, since the set differs per component.

Native events — `input`, `change`, `focus`, `blur` — keep their ordinary DOM types. Read the value from `currentTarget`, remembering that `value` is `string | null`:

```tsx
import { useCallback, useState } from 'react';
import type { FormEvent } from 'react';
import CsInput, { type CsClearEvent } from '@cruglobal/cornerstone-components/react/input/index.js';
import type CsInputElement from '@cruglobal/cornerstone-components/components/input/input.js';

function MyComponent() {
  const [value, setValue] = useState('');

  const onInput = useCallback(
    (event: FormEvent<CsInputElement>) => setValue(event.currentTarget.value ?? ''),
    [],
  );
  const onCsClear = useCallback((_event: CsClearEvent) => setValue(''), []);

  return <CsInput value={value} onInput={onInput} onCsClear={onCsClear} />;
}

export default MyComponent;
```

Cornerstone's event classes extend `Event` rather than `CustomEvent`, so they carry no `detail`. Read what you need from the element.

<cs-callout variant="success">
  <strong>Cornerstone is ready to use.</strong><br />
  Explore components, utilities, and theming to start building.
</cs-callout>
