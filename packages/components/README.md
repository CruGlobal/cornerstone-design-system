# Cornerstone Components

Cru's web component library: 70 components built with [Lit](https://lit.dev/).

- **Framework-agnostic.** They are custom elements, so they work in React, Vue, Rails, WordPress or plain HTML.
- **Customizable with CSS.** Every component exposes CSS custom properties and parts, and the library themes from one set of design tokens.
- **Light and dark.** Two themes ship — `default` and `cru` — and each carries both colour schemes.
- **Accessible.** 59 of the 70 components assert against axe in the test suite, on three engines and both render modes. The 11 that do not render nothing interactive.

---

Documentation: [cruglobal.github.io/cornerstone-design-system](https://cruglobal.github.io/cornerstone-design-system)

Source: [github.com/CruGlobal/cornerstone-design-system](https://github.com/CruGlobal/cornerstone-design-system)

---

## Installation

```bash
npm install @cruglobal/cornerstone-components
```

Import the stylesheet once, then each component you use:

```js
import '@cruglobal/cornerstone-components/styles/cornerstone.css';
import '@cruglobal/cornerstone-components/components/button/button.js';
```

```html
<cs-button variant="brand">Click me</cs-button>
```

If you serve the library yourself rather than bundling it, copy `dist/bundled` out of the package and load
`cornerstone.loader.js` from your own origin — the autoloader registers each `cs-*` element as it finds one.
The [installation guide](https://cruglobal.github.io/cornerstone-design-system) covers both paths.

---

## Developers ✨

Developers can use this documentation to learn how to build Cornerstone Components from source.

**You don't need to do any of this to use Cornerstone Components!** This page is for people who want to contribute to the project, tinker with the source, or create a custom build.

If that's not what you're trying to do, the [documentation website](https://cruglobal.github.io/cornerstone-design-system) is where you want to be.

### What are you using to build Cornerstone Components?

Components are built with [Lit](https://lit.dev/), a custom elements base class that provides an intuitive API and reactive data binding. The build is a custom script with bundling powered by [esbuild](https://esbuild.github.io/).

### Where do npm dependencies go?

Anything a component needs at runtime — `lit`, for instance — belongs in `dependencies`, because it has to be installed for anyone consuming this package. Tooling used only to build, test or lint the library belongs in `devDependencies`.

```bash
npm install -D prettier
```

### Getting the Repo

Clone the repo locally and install dependencies.

```bash
git clone https://github.com/CruGlobal/cornerstone-design-system
cd cornerstone-components
npm install
```

### Developing

Once you've cloned the repo, run:

```bash
npm start
```

This watches `src/` and rebuilds the library on change, serving `dist/` so a page can load the built files.
There is currently no hot module reloading (HMR), as browsers don't provide a way to reregister custom
elements, but most changes to the source will reload the browser automatically.

To work on the documentation, run the docs site alongside it in a second terminal:

```bash
npm run start:docs
```

That starts Astro's dev server on `http://localhost:4321`. It copies the current `dist/bundled/` in on
startup, so rebuild the library and restart it to pick up component changes.

### Building

To generate a production build, run the following command.

```bash
npm run build
```

You can also run `npm run build:serve` to start an [`http-server`](https://www.npmjs.com/package/http-server) instance on `http://localhost:4000` after the build completes, so you can preview the production build.

### Creating New Components

To scaffold a new component, run the following command. It prompts for the tag name, which must start with
`cs-`.

```bash
npm run create
```

This generates four files: the component, its stylesheet, its test file, and a docs page. When you start the dev server, you'll find the new component in the "Components" section of the sidebar.

### Contributing

Cornerstone Components is maintained by Cru. Issues and bug reports are welcome from anyone; pull requests come from the Cru design system team. See the [contribution guidelines](CONTRIBUTING.md).

## License

Cornerstone Components is available under the terms of the [MIT License](LICENSE.md).
