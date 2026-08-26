import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadComponents, renderApiMarkdown } from '@cruglobal/cornerstone-build-tools/component-api.js';
import { DOCS_URL } from '@cruglobal/cornerstone-build-tools/site-url.js';
import matter from 'gray-matter';
import { getAllComponents } from './shared.js';
import { getBundledDir, getContentDir, getUnbundledDir } from './utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Loads front-matter from all component markdown files.
 * We still need this for metadata like category, title, etc.
 */
function loadAllFrontMatter(contentDir) {
  const cache = new Map();
  const componentsDir = path.join(contentDir, 'components');

  if (!fs.existsSync(componentsDir)) {
    return cache;
  }

  const files = fs.readdirSync(componentsDir).filter((f) => f.endsWith('.md'));

  for (const file of files) {
    const componentName = file.replace('.md', '');
    const mdPath = path.join(componentsDir, file);

    try {
      const content = fs.readFileSync(mdPath, 'utf-8');
      const { data } = matter(content);
      cache.set(componentName, data);
    } catch {
      // Skip if parsing fails
    }
  }

  return cache;
}

/**
 * Gets component info combining CEM data with frontmatter.
 */
function getComponentInfo(components, frontMatterCache) {
  const componentList = [];

  for (const component of components) {
    if (!component.tagName) {
      continue;
    }

    const componentName = component.tagName.replace(/^cs-/, '');
    const frontmatter = frontMatterCache.get(componentName) || {};

    componentList.push({
      tagName: component.tagName,
      name: componentName,
      title: frontmatter.title || componentName,
      description: frontmatter.description || component.summary || '',
      category: frontmatter.category || 'Uncategorized',
    });
  }

  // Sort alphabetically by tag name
  return componentList.sort((a, b) => a.tagName.localeCompare(b.tagName));
}

/**
 * Generates the main SKILL.md content.
 */
function generateSkillMd({ componentList, packageData, baseUrl }) {
  // Group components by category
  const categorize = (list) => {
    const categories = {};
    for (const c of list) {
      if (!categories[c.category]) {
        categories[c.category] = [];
      }
      categories[c.category].push(c);
    }
    return categories;
  };

  const componentsByCategory = categorize(componentList);

  // Helper to generate component list for a category
  const renderComponentList = (components) => {
    return components
      .map(
        (c) =>
          `- [\`<${c.tagName}>\`](references/components/${c.name}.md) - ${c.description || 'No description'} ([docs](${baseUrl}/components/${c.name}))`,
      )
      .join('\n');
  };

  const componentsSection =
    Object.keys(componentsByCategory).length > 0
      ? `${Object.keys(componentsByCategory)
          .sort()
          .map(
            (category) => `#### ${category}

${renderComponentList(componentsByCategory[category])}`,
          )
          .join('\n\n')}
`
      : '';

  return `---
name: cornerstone
description: Cornerstone is a UI component library built with web components. Use when building buttons, inputs, selects, checkboxes, dialogs, modals, drawers, tabs, dropdowns, tooltips, carousels, forms, or using CSS utilities like cs-stack, cs-cluster, cs-grid, cs-prose. Supports React, Vue, Angular, Svelte, and vanilla JS.
license: MIT
metadata:
  author: Cru Global
  version: "${packageData.version || '0.0.0'}"
  homepage: ${baseUrl}
  repository: https://github.com/CruGlobal/cornerstone-components
compatibility: Works in modern browsers. Requires no build tools when using CDN. Works with bundlers like Webpack and Vite when installed via npm.
allowed-tools: Read
---

# Cornerstone

Cornerstone Components is the open source custom-element library of the Cornerstone design system. It provides ${componentList.length} accessible, customizable web components that work with any framework.

> **Designing with Cornerstone?** For full-page layout (\`<cs-page>\`), theming, brand color, and visual composition guidance, install the companion **\`cornerstone-design\`** skill. This skill is the component reference; that one teaches how to put components together into a polished UI. See [Agent Skills](${baseUrl}/ai/agent-skills) for both.

## Quick Start

### npm Installation

\`\`\`bash
npm install @cruglobal/cornerstone-components
\`\`\`

Import styles and components:

\`\`\`js
import '@cruglobal/cornerstone-components/styles/cornerstone.css';
import '@cruglobal/cornerstone-components/components/button/button.js';
\`\`\`

### Loading in the browser without a bundler

The package ships two builds. The unbundled build (imported above) keeps its dependencies as bare
specifiers, so it needs a bundler. The bundled build inlines them, so a browser can load it directly:

\`\`\`html
<link rel="stylesheet" href="/node_modules/@cruglobal/cornerstone-components/dist/bundled/styles/cornerstone.css" />
<script type="module" src="/node_modules/@cruglobal/cornerstone-components/dist/bundled/cornerstone.loader.js"></script>
\`\`\`

For detailed installation options, see [Installation Guide](references/installation.md).

## Core Concepts

Cornerstone components are custom HTML elements. They work like native elements but with enhanced functionality.

- **Attributes & Properties**: Configure components via HTML attributes or JavaScript properties
- **Events**: Listen to custom events prefixed with \`cs-\` (e.g., \`cs-change\`, \`cs-input\`)
- **Methods**: Call methods programmatically (e.g., \`element.focus()\`)
- **Slots**: Insert content into named slots (e.g., \`<cs-icon slot="start">\`)
- **CSS Parts**: Style internal elements using \`::part()\` selectors
- **CSS Custom Properties**: Customize appearance with CSS variables

**Important**: Always use closing tags. Custom elements cannot self-close.

\`\`\`html
<!-- Correct -->
<cs-input></cs-input>

<!-- Incorrect - will not work -->
<cs-input />
\`\`\`

For complete usage details, see [Usage Guide](references/usage.md).

## Components

> **Not sure which one to pick?** See [Choosing the right component](references/choosing-components.md)
> — a decision tree organized by user intent. Most agent mistakes here are picking the wrong component
> (e.g. \`<cs-dropdown>\` instead of \`<cs-select>\`), not API misuse.

${componentsSection}
## Building Full Pages with \`<cs-page>\`

\`<cs-page>\` scaffolds an entire page layout (banner, header, navigation, main content, aside,
footer) with responsive behavior built in. Most layout bugs come from a few specific mistakes —
read this before generating a page.

### Main content goes in the DEFAULT slot — there is no \`main\` slot

Put your primary content directly inside \`<cs-page>\` with **no \`slot\` attribute**. There is
**no slot named \`main\`**. Writing \`<main slot="main">\` sends the element to a slot that does not
exist, so it is dropped and **the entire page renders blank**. This failure is silent — no error,
no warning.

\`\`\`html
<!-- Correct: <main> is unslotted, so it lands in the default slot -->
<cs-page>
  <main>...your sections...</main>
</cs-page>

<!-- WRONG: there is no "main" slot — the page body disappears -->
<cs-page>
  <main slot="main">...</main>
</cs-page>
\`\`\`

### Valid slots (use these exact names)

\`banner\`, \`header\`, \`subheader\`, \`navigation-header\`, \`navigation\`,
\`navigation-footer\`, \`menu\`, \`main-header\`, \`main-footer\`, \`aside\`, \`footer\`,
\`skip-to-content\`, \`navigation-toggle\`. **Anything else** (e.g. \`slot="main"\`, \`slot="nav"\`,
\`slot="content"\`) is silently ignored. There is no \`nav\` slot — the navigation slot is
\`navigation\`. (\`menu\` is an advanced escape hatch that *replaces* the entire left navigation
region; don't use it for ordinary nav links — and for a landing page, skip the left region
entirely, see below.)

### Navigation: a landing page needs nav in the \`header\` ONLY — do NOT use the \`navigation\` slot

This is the #1 \`<cs-page>\` bug, and it comes from a wrong mental model. **The \`navigation\` slot
is a persistent left sidebar, not a top nav bar.** On desktop it renders as a vertical menu column
down the **left side** of the page (the \`menu\` region), and on mobile it collapses into a slide-out
drawer. It is for **app layouts** (docs sites, dashboards) — NOT for a marketing landing page.

A landing page's nav belongs in the **\`header\`** slot (the sticky top bar). If you put your links
in the \`header\` **and also** in a \`<… slot="navigation">\`, you get **both at once on desktop**: the
top bar AND a duplicate vertical list down the left side. That is the duplicated nav you must avoid.

**Rule for landing pages: put nav links inline in the \`header\` slot and do not add a \`navigation\`
(or \`menu\`) slot at all.** You do not need it, and adding it is what creates the duplicate.

Mobile toggle for a header-only nav: \`<cs-page>\` auto-hides any element with \`[data-toggle-nav]\`
on desktop and shows it on mobile (and \`.cs-mobile-only\` / \`.cs-desktop-only\` are honored too), so
put a toggle button in the header with \`data-toggle-nav\` and wire it to show/hide your own header
links — no media query needed. (Note: the component's built-in hamburger only appears when a
\`navigation\` slot has content and you haven't supplied your own toggle; with header-only nav it
stays hidden, which is what you want.)

**Only** use the \`navigation\` slot if you genuinely want a left sidebar layout. In that case put
the links there **only**, leave the \`header\` free of nav links, and you get the responsive drawer
for free. Never list the same links in both \`header\` and \`navigation\`.

### Zero the page reset AND mind the slot padding

1. Zero \`<html>\`/\`<body>\` padding & margin or you get gaps:
   \`\`\`css
   html, body { min-height: 100%; padding: 0; margin: 0; }
   \`\`\`
2. **Always zero the padding on the default (main) slot.** Every slot region already has its own
   \`padding\` and \`gap\`, including the default (main) slot. That built-in main padding is the most
   common layout bug: it insets your full-bleed bands and, combined with any padding you add to
   \`<main>\` or section wrappers, **stacks** and overflows on mobile. So always start by zeroing it
   and control spacing yourself per section:
   \`\`\`css
   /* Always do this — then add your own padding inside each section. */
   cs-page::part(main-content) { padding: 0; }
   \`\`\`
   With the main slot zeroed, give each section the horizontal padding it needs (and let full-bleed
   sections run edge to edge). Don't add padding to \`<main>\` itself — pad the sections inside it.

### Minimal complete example

This is a landing page, so nav lives in the \`header\` only — there is **no \`navigation\` slot**.

\`\`\`html
<html class="cs-light">
  <head>
    <style>
      html, body { min-height: 100%; padding: 0; margin: 0; }

      /* Zero the built-in padding on the main slot AND on the slotted <main>,
         then pad each section yourself. (::part alone doesn't remove the
         padding cs-page puts on a slotted <main>/<section>.) */
      cs-page::part(main-content) { padding: 0; }
      cs-page > main { padding: 0; }

      /* Header nav: visible on desktop, hidden on mobile until toggled open. */
      .header-links { display: flex; gap: var(--cs-space-l); }
      cs-page[view='mobile'] .header-links { display: none; }
      cs-page[view='mobile'][nav-open] .header-links {
        display: flex; flex-direction: column;
        position: absolute; inset-block-start: 100%; inset-inline: 0;
        padding: var(--cs-space-m); background: var(--cs-color-surface-default);
      }
    </style>
  </head>
  <body>
    <cs-page mobile-breakpoint="768">
      <div slot="banner">Free shipping this week!</div>

      <header slot="header" class="cs-split" style="position: relative;">
        <a href="#">Brand</a>
        <nav class="header-links">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
        </nav>
        <!-- Auto-hidden on desktop, shown on mobile. Toggles [nav-open] on the page. -->
        <cs-button data-toggle-nav appearance="plain" class="cs-mobile-only">
          <cs-icon name="menu" label="Menu"></cs-icon>
        </cs-button>
      </header>

      <!-- Main content: unslotted (default slot). NEVER slot="main". -->
      <main>
        <section>...</section>
      </main>

      <footer slot="footer">© 2026 Brand</footer>
    </cs-page>
  </body>
</html>
\`\`\`

(\`data-toggle-nav\` toggles the page's \`nav-open\` attribute, which the CSS above uses to reveal the
header links on mobile. No JavaScript and no \`navigation\` slot required.)

See the full reference at [\`<cs-page>\`](references/components/page.md) and
${baseUrl}/components/page.

## Themes

Cornerstone includes pre-built themes. Apply a theme by adding its class to the \`<html>\` element.

- **Default** - The foundational theme
- **Awesome** - Bright, vibrant color palette
- **Shoelace** - Classic Shoelace styling

See [Themes Reference](references/themes.md) for usage details.

## Color Palettes

Each palette provides 10 color hues with 11 tints each.

- Default, Base, Bright, Shoelace

See [Themes Reference](references/themes.md) for palette usage.

## Utilities

Cornerstone provides CSS utilities for common styling tasks:

- **Layout**: \`cs-stack\`, \`cs-cluster\`, \`cs-grid\`, \`cs-split\`, \`cs-flank\`, \`cs-frame\`
- **Spacing**: \`cs-gap-*\` utilities
- **Text**: Typography utilities
- **Color**: Color variant utilities
- **Rounding**: \`cs-border-radius-*\` utilities
- **Prose**: \`cs-prose\` for long-form typographic rhythm (articles, docs, marketing copy)
- **Accessibility**: \`cs-visually-hidden\` utilities
- **FOUCE Prevention**: \`cs-cloak\` utility
- **Native Styles**: Enhanced styling for native HTML elements

See [Layout Utilities](references/utilities/layout.md), [Prose](references/utilities/prose.md), [Rounding](references/utilities/rounding.md), [Visually Hidden](references/utilities/visually-hidden.md), [FOUCE](references/utilities/fouce.md), and [Native Styles](references/utilities/native.md).

## Design Tokens

Cornerstone uses CSS custom properties (design tokens) for consistent theming:

- **Borders**: \`--cs-border-*\` for width, radius, style
- **Color**: \`--cs-color-*\` for surfaces, text, semantic colors
- **Space**: \`--cs-space-*\` for consistent spacing
- **Typography**: \`--cs-font-*\` for font families, sizes, weights
- **Shadows**: \`--cs-shadow-*\` for elevation
- **Focus**: \`--cs-focus-*\` for focus ring styles
- **Transitions**: \`--cs-transition-*\` for animation timing

See [Design Tokens](references/tokens/) for full reference.

## Form Controls

Cornerstone form controls are form-associated custom elements supporting native form validation and the Constraint Validation API.

- Use \`required\`, \`pattern\`, \`minlength\`, \`maxlength\` attributes
- Use \`setCustomValidity()\` for custom error messages
- Style validation states with \`:state(valid)\`, \`:state(invalid)\`, etc.

See [Form Controls Reference](references/form-controls.md) for details.

## Icons

Material Symbols is the default icon library. Use \`<cs-icon>\` with Material Symbols icon names, which are
snake_case:

\`\`\`html
<cs-icon name="home"></cs-icon>
<cs-icon name="settings"></cs-icon>
<cs-icon name="check"></cs-icon>
\`\`\`

Three attributes select the cut. \`family\` picks the style — \`sharp\` (default), \`outlined\`, or \`rounded\`.
\`variant="fill"\` draws the solid shape instead of the outline. \`weight\` takes 100–700 and defaults to 400.

\`\`\`html
<cs-icon name="star" variant="fill"></cs-icon>
<cs-icon name="star" weight="700" variant="fill"></cs-icon>
\`\`\`

Material Symbols has no brand logos, so those come from the \`brands\` library:

\`\`\`html
<cs-icon library="brands" name="github" label="GitHub"></cs-icon>
\`\`\`

## Framework Integration

Cornerstone works with any framework:

- **React 19+**: Native custom element support with TypeScript types
- **React 18 and below**: Use provided React wrappers
- **Vue**: Works out of the box
- **Angular**: Works out of the box
- **Svelte**: Works out of the box

See framework-specific guides in [references/frameworks/](references/frameworks/).

## Support

- **GitHub Issues**: https://github.com/CruGlobal/cornerstone-components/issues

See [Support Reference](references/support.md) for more details.

## Reference Documentation

- [Choosing the Right Component](references/choosing-components.md) — decision tree by user intent (start here if you're unsure which component fits)
- [Installation Guide](references/installation.md)
- [Usage Guide](references/usage.md)
- [Form Controls](references/form-controls.md)
- [Customizing](references/customizing.md)
- [Localization](references/localization.md)
- [Themes & Palettes](references/themes.md)
- [Layout Utilities](references/utilities/layout.md)
- [Native Styles](references/utilities/native.md)
- [Design Tokens](references/tokens/) - Borders, Color, Space, Typography, Shadows, Focus, Transitions
- [Framework Guides](references/frameworks/)
`;
}

/**
 * Generates the themes reference documentation.
 */
function generateThemesReference(baseUrl) {
  return `# Themes & Color Palettes

**Full documentation:** ${baseUrl}/themes

## Applying Themes

Cru's theme is the default and needs no class — importing the library applies it. The class form
exists so a theme can be scoped to a subtree, or so a second theme can be switched to:

\`\`\`html
<html class="cs-theme-cru cs-light">
\`\`\`

For npm/CDN users, \`cornerstone.css\` already imports Cru's theme. Import a stylesheet only to
choose a different one:

\`\`\`js
import '@cruglobal/cornerstone-components/styles/themes/default.css';
\`\`\`

## Themes

| Theme | Description |
|-------|-------------|
| **Cru** | The default. Cru's brand, generated from its key colours on a luminance ladder |
| **Default** | An unbranded reference theme, for a product that is not using Cru's brand |

New brands are generated rather than picked from a list — see \`tools/palette.mjs\`.

## Color Palettes

A palette provides the hue ramps a theme's roles read, each on a scale of 11 steps
(\`05\`–\`95\`). Cru's carries 18 hues; the reference palette carries 10.

- **Cru** - Cru's brand hues, generated
- **Default** - The reference hues

## Applying Palettes

Each theme imports its own palette, so there is normally nothing to apply. The class form scopes
one to a subtree:

\`\`\`html
<html class="cs-palette-default">
\`\`\`

CSS variables follow the pattern \`--cs-color-{hue}-{tint}\`:

\`\`\`css
.my-element {
  color: var(--cs-color-blue-60);
  background: var(--cs-color-gray-10);
}
\`\`\`

`;
}

/**
 * Generates the support reference documentation.
 */
function generateSupportReference(baseUrl) {
  return `# Support

**Full documentation:** ${baseUrl}/resources/support

## Getting Help

### GitHub

- **Issues**: Report bugs with clear reproduction steps
  https://github.com/CruGlobal/cornerstone-components/issues
`;
}

/**
 * Recursively copies a directory.
 */
function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Generates the Agent Skill (standalone function for use after Eleventy builds).
 * This should be called after the _site directory has been generated.
 */
/**
 * Turns an Astro content page into the skill's markdown.
 *
 * This replaced an HTML round-trip: the generator used to render the Eleventy site, scrape
 * `main#content`, and convert that back to markdown. The conversion lost content. Measured against
 * the CEM at the point of replacement, **19 API sections across 16 components shipped short by 44
 * rows** — `cs-dropdown-item` listed 2 of its 8 CSS parts, `cs-input` 2 of its 7 slots — because a
 * description containing inline code such as `<cs-icon>` ended the markdown table early. It also
 * escaped its own emphasis (`\*\*npm\*\*`) and emitted Eleventy-shaped `/docs/...` URLs that the
 * Astro site returns 404 for.
 *
 * Reading the source removes all of that. What has to be handled instead is Astro-only syntax,
 * which is small, explicit, and fails visibly rather than silently.
 */
function processMarkdownDoc(mdContent, baseUrl, component = null) {
  const { content, data } = matter(mdContent);
  let body = content;

  // `:::note` / `:::warning` containers carry emphasis worth keeping, as a blockquote. Done before
  // the directive sweep below, which would otherwise eat the closing `:::`.
  body = body.replace(/^:::(\w+)(?:\[[^\]]*\])?[ \t]*\r?\n([\s\S]*?)^:::[ \t]*$/gm, (_match, kind, inner) => {
    const label = kind.charAt(0).toUpperCase() + kind.slice(1);
    const quoted = inner
      .trim()
      .split('\n')
      .map((line) => (line.trim() ? `> ${line}` : '>'))
      .join('\n');
    return `> **${label}**\n>\n${quoted}\n`;
  });

  // `::color-palette`, `::theme-install` and friends render site-only widgets from data the skill
  // either already carries or has no use for. Drop the line rather than ship a bare directive name.
  body = body.replace(/^::[a-z][a-z0-9-]*(?:\{[^}]*\})?[ \t]*$/gm, '');

  // `{.example}` marks a live demo on the site. The fence content is the example either way.
  body = body.replace(/^(```+[a-zA-Z0-9-]*)[ \t]*\{[^}]*\}[ \t]*$/gm, '$1');

  // Root-absolute links resolve against the site, not the file.
  body = body.replace(/\]\((\/[^)\s]*)\)/g, (_match, href) => `](${baseUrl}${href})`);

  if (component) {
    body = `${body.trim()}\n\n## API\n\n${skillImportingSection(component)}\n${renderApiMarkdown(component, {
      headingLevel: 3,
    })}`;
  }

  return { content: `${body.replace(/\n{3,}/g, '\n\n').trim()}\n`, title: data.title };
}

/**
 * The import snippets, as markdown.
 *
 * The docs site renders the same three snippets through `<cs-tab-group>`, which is markup the skill
 * has no use for. Same content, flattened to headings a reader or an agent can scan.
 */
function skillImportingSection(component) {
  const name = component.tagName.replace(/^cs-/, '');
  const modulePath = `components/${name}/${name}.js`;

  return [
    '### Importing',
    '',
    "If you're using the autoloader or a hosted project, components load on demand — no manual import",
    'needed. To cherry-pick this component, use one of the following snippets.',
    '',
    '**npm**',
    '',
    '```js',
    `import '@cruglobal/cornerstone-components/${modulePath}';`,
    '```',
    '',
    '**Self-Hosted**',
    '',
    '```js',
    `import './cornerstone/${modulePath}';`,
    '```',
    '',
    '**React**',
    '',
    '```js',
    `import ${component.name} from '@cruglobal/cornerstone-components/react/${name}/index.js';`,
    '```',
    '',
  ].join('\n');
}

/** Copies one content page into the skill, keyed by its path in the content collection. */
function copyMarkdownDoc(contentDir, destDir, srcRelPath, destFileName, baseUrl, component = null) {
  const srcPath = path.join(contentDir, srcRelPath);

  if (!fs.existsSync(srcPath)) {
    console.warn(`Warning: content page not found: ${srcPath}`);
    return false;
  }

  const { content, title } = processMarkdownDoc(fs.readFileSync(srcPath, 'utf-8'), baseUrl, component);

  // `index.md` is the section root, so its URL is the directory.
  const docPath = srcRelPath.replace(/\.md$/, '').replace(/(^|\/)index$/, '');
  const url = docPath ? `${baseUrl}/${docPath}` : baseUrl;
  const header = [`# ${title || destFileName.replace(/\.md$/, '')}`, '', `**Full documentation:** ${url}`, '', ''];

  fs.writeFileSync(path.join(destDir, destFileName), header.join('\n') + content, 'utf-8');
  return true;
}

/** One reference file per component, prose from the page and the API from the manifest. */
function copyAllComponentDocsFromMarkdown(contentDir, destDir, baseUrl, components) {
  const srcDir = path.join(contentDir, 'components');
  const outDir = path.join(destDir, 'components');
  fs.mkdirSync(outDir, { recursive: true });

  let written = 0;
  for (const file of fs.readdirSync(srcDir).filter((name) => name.endsWith('.md') && name !== 'index.md')) {
    const name = file.replace(/\.md$/, '');
    const component = components.find((c) => c.tagName === `cs-${name}`) || null;
    if (copyMarkdownDoc(contentDir, outDir, `components/${file}`, file, baseUrl, component)) {
      written++;
    }
  }
  return written;
}

/** The layout utilities are one page each on the site and one combined reference in the skill. */
function generateLayoutUtilitiesDocFromMarkdown(contentDir, destDir, baseUrl) {
  const names = [
    'stack',
    'cluster',
    'grid',
    'split',
    'flank',
    'frame',
    'gap',
    'align-items',
    'justify-content',
    'flex-wrap',
  ];
  const lines = ['# Layout Utilities', '', `**Full documentation:** ${baseUrl}/utilities`, ''];

  for (const name of names) {
    const srcPath = path.join(contentDir, 'utilities', `${name}.md`);
    if (!fs.existsSync(srcPath)) {
      console.warn(`Warning: layout utility page not found: ${srcPath}`);
      continue;
    }
    const { content, title } = processMarkdownDoc(fs.readFileSync(srcPath, 'utf-8'), baseUrl);
    lines.push(`## ${title || name}`, '', content.trim(), '', '---', '');
  }

  fs.writeFileSync(path.join(destDir, 'layout.md'), lines.join('\n'), 'utf-8');
}

/**
 * Every page the skill carries, as source path → destination. A table rather than 25 call sites, so
 * adding or moving a page is one line and the set is readable at a glance.
 */
const SKILL_PAGES = [
  ['index.md', '', 'installation.md'],
  ['usage.md', '', 'usage.md'],
  ['form-controls.md', '', 'form-controls.md'],
  ['customizing.md', '', 'customizing.md'],
  ['localization.md', '', 'localization.md'],
  ['theming-overview.md', '', 'theming-overview.md'],
  ['frameworks/react.md', 'frameworks', 'react.md'],
  ['frameworks/rails.md', 'frameworks', 'rails.md'],
  ['frameworks/wordpress.md', 'frameworks', 'wordpress.md'],
  ['utilities/native.md', 'utilities', 'native.md'],
  ['utilities/text.md', 'utilities', 'text.md'],
  ['utilities/color.md', 'utilities', 'color.md'],
  ['utilities/fouce.md', 'utilities', 'fouce.md'],
  ['utilities/rounding.md', 'utilities', 'rounding.md'],
  ['utilities/prose.md', 'utilities', 'prose.md'],
  ['utilities/visually-hidden.md', 'utilities', 'visually-hidden.md'],
  ['tokens/borders.md', 'tokens', 'borders.md'],
  ['tokens/color.md', 'tokens', 'color.md'],
  ['tokens/component-groups.md', 'tokens', 'component-groups.md'],
  ['tokens/focus.md', 'tokens', 'focus.md'],
  ['tokens/shadows.md', 'tokens', 'shadows.md'],
  ['tokens/space.md', 'tokens', 'space.md'],
  ['tokens/transitions.md', 'tokens', 'transitions.md'],
  ['tokens/typography.md', 'tokens', 'typography.md'],
];

export async function generateAgentSkill(options = {}) {
  const {
    outdir = path.join(getUnbundledDir(), 'skills/cornerstone'),
    contentDir = getContentDir(),
    copyTo = [path.join(getBundledDir(), 'skills/cornerstone')],
    cemPath = path.join(getBundledDir(), 'custom-elements.json'),
    baseUrl = DOCS_URL,
  } = options;

  if (!fs.existsSync(contentDir)) {
    console.warn(`Warning: content collection not found at ${contentDir}.`);
    return;
  }

  // Load CEM
  let customElementsManifest = { modules: [], package: {} };
  if (fs.existsSync(cemPath)) {
    customElementsManifest = JSON.parse(fs.readFileSync(cemPath, 'utf-8'));
  } else {
    console.warn(`Warning: Custom Elements Manifest not found at ${cemPath}`);
  }

  const components = getAllComponents(customElementsManifest);
  // `renderApiMarkdown` reads `properties`, `methods` and `cssProperties`, which only
  // `component-api.js`'s own loader derives — `shared.js` leaves them undefined, and the two
  // sections that depend on them then render empty and vanish. Load through the module that owns
  // the shape rather than hand it a foreign one.
  const apiComponents = loadComponents(path.dirname(cemPath));
  const packageData = customElementsManifest.package || {};
  const frontMatterCache = loadAllFrontMatter(contentDir);
  const componentList = getComponentInfo(components, frontMatterCache);

  // Create output directories
  const refsDir = path.join(outdir, 'references');
  const frameworksDir = path.join(refsDir, 'frameworks');
  const utilitiesDir = path.join(refsDir, 'utilities');
  const tokensDir = path.join(refsDir, 'tokens');

  fs.mkdirSync(outdir, { recursive: true });
  fs.mkdirSync(refsDir, { recursive: true });
  fs.mkdirSync(frameworksDir, { recursive: true });
  fs.mkdirSync(utilitiesDir, { recursive: true });
  fs.mkdirSync(tokensDir, { recursive: true });

  // Generate SKILL.md
  const skillMd = generateSkillMd({ componentList, packageData, baseUrl });
  fs.writeFileSync(path.join(outdir, 'SKILL.md'), skillMd, 'utf-8');

  copyAllComponentDocsFromMarkdown(contentDir, refsDir, baseUrl, apiComponents);

  // Generate themes reference (static content)
  const themesRef = generateThemesReference(baseUrl);
  fs.writeFileSync(path.join(refsDir, 'themes.md'), themesRef, 'utf-8');

  // Generate support reference (static content)
  const supportRef = generateSupportReference(baseUrl);
  fs.writeFileSync(path.join(refsDir, 'support.md'), supportRef, 'utf-8');

  // Copy hand-authored "Choosing the right component" reference — a decision tree by user intent
  // that helps agents pick the correct component instead of guessing from names. Source lives in
  // scripts/agent-skill/ alongside this generator; copied verbatim into the skill's references/.
  fs.copyFileSync(
    path.join(__dirname, 'agent-skill', 'choosing-components.md'),
    path.join(refsDir, 'choosing-components.md'),
  );

  const destFor = { '': refsDir, frameworks: frameworksDir, utilities: utilitiesDir, tokens: tokensDir };
  for (const [srcRelPath, section, destFileName] of SKILL_PAGES) {
    copyMarkdownDoc(contentDir, destFor[section], srcRelPath, destFileName, baseUrl);
  }

  generateLayoutUtilitiesDocFromMarkdown(contentDir, utilitiesDir, baseUrl);

  // Copy to additional directories
  for (const dest of copyTo) {
    copyDirSync(outdir, dest);
  }
}
