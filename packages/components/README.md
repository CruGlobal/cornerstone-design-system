# Cornerstone Components

Cru's web component library: 70 components built with [Lit](https://lit.dev/).

- **Framework-agnostic.** They are custom elements, so they work in React, Vue, Rails, WordPress or plain HTML.
- **Customizable with CSS.** Every component exposes CSS custom properties and parts, and the library themes from one set of design tokens.
- **Light and dark.** Three themes ship: `cru` (the default), `fl` for FamilyLife, and the unbranded `default`. Each carries both colour schemes.
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

### Testing

`npm test` runs every test file in Chromium, Firefox and WebKit. Build first: the tests load components from `dist/`.

CI splits the suite across six runners with `WTR_SHARD`, and you can run one of those slices yourself:

```bash
WTR_SHARD=2/6 npm test
```

Files are dealt to shards by how long each one takes, so the shards finish together. Those timings live in `test-durations.json`. A test file that is not in it still runs; it just counts as one second when the shards are dealt. Refresh the file when CI's shards drift more than a minute or two apart, or after adding several heavy test files:

```bash
npm run build
npm run test:durations
```

That runs the whole suite and rewrites `test-durations.json` with the seconds each file took, averaged over the three engines. Commit the result. Run it on a quiet machine, since a busy one inflates whichever files were running at the time. Tests are not retried during this run, so a test that times out fails. If the run warns that some files did not pass, refresh just those with the command below before committing: it replaces the inflated number.

To refresh one component's files and leave the rest as they are, call the runner itself. `npm run test:durations -- --group button` does not work: npm keeps `--group` for itself and the whole suite runs.

```bash
WTR_RECORD_DURATIONS=true npx web-test-runner --group button
```

Those numbers are rougher than a full run's. In any run, the first files each browser opens also wait for that browser to launch. In a one-group run every file is one of the first, and nothing else is loading the machine. Use it to get a new file onto the list or to replace a number a failure inflated, and do a full run when the shards drift.

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
