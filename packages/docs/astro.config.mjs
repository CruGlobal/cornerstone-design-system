import { unified } from '@astrojs/markdown-remark';
import starlight from '@astrojs/starlight';
import { asset, DOCS_BASE_PATH, DOCS_ORIGIN } from '@cruglobal/cornerstone-build-tools/site-url.js';
import { defineConfig } from 'astro/config';
import remarkDirective from 'remark-directive';
import { pluginWatcher } from './src/plugin-watcher.js';
import { rehypeCodeBlocks } from './src/plugins/rehype-code-blocks.js';
import { remarkBaseAssets } from './src/plugins/remark-base-assets.js';
import { remarkComponentApi } from './src/plugins/remark-component-api.js';
import { remarkComponentBrowser } from './src/plugins/remark-component-browser.js';
import { remarkExamples } from './src/plugins/remark-examples.js';
import { remarkMarkdownFeatures } from './src/plugins/remark-markdown-features.js';
import { remarkPageIndex } from './src/plugins/remark-page-index.js';
import { remarkTheming } from './src/plugins/remark-theming.js';
import { stubStarlightStyles } from './src/plugins/stub-starlight-styles.js';
import { sidebar } from './src/sidebar.js';
import { themeSync } from './src/theme-sync.js';
// The library's package manifest is the one place the documentation address is written down. Reaching for
// it here rather than repeating the URL keeps this config moving with `build-tools/site-url.js`, and the
// address is not settled yet — GitHub Pages is still on the table alongside a Cru-hosted domain.

/**
 * Re-applies a URL fragment after the custom elements upgrade. Inlined into every page's `<head>`;
 * see the comment at its use site below.
 */
const SETTLE_HASH = [
  'if (location.hash) {',
  'var waited = 0, moved = false;',
  'var stop = function () { moved = true; };',
  "['wheel', 'touchstart', 'keydown'].forEach(function (name) {",
  '  addEventListener(name, stop, { once: true, passive: true });',
  '});',
  'var settle = function () {',
  '  if (moved) return;',
  "  if (document.querySelector(':not(:defined)') && (waited += 50) < 2000) {",
  '    return setTimeout(settle, 50);',
  '  }',
  '  var target = document.getElementById(decodeURIComponent(location.hash.slice(1)));',
  '  if (target) target.scrollIntoView();',
  '};',
  "addEventListener('DOMContentLoaded', settle);",
  '}',
].join('');

export default defineConfig({
  // A build and a running dev server must not share a content cache. They did, and because the cache
  // lives on disk, `npm run build` wiped the store the dev server had open — leaving it listening while
  // it answered 404 for every route, home page included. `npm run build` sets ASTRO_CACHE_DIR so the two
  // never touch. This is the same hazard CLAUDE.md records for the Eleventy site and `_site`.
  cacheDir: process.env.ASTRO_CACHE_DIR,

  // Both derive from `package.json`'s `homepage`, split because Astro wants them separately: `site` takes
  // the origin and `base` the path. GitHub Pages serves a *project* site under `/<repo>/`, so the path is
  // real here rather than empty.
  //
  // `site` is also what makes Astro emit `<link rel="canonical">`, `og:url` and a sitemap — all three were
  // verified absent before it was set, because none of them has a sensible default.
  //
  // Because `base` is not empty, a root-absolute asset reference such as `/dist/cornerstone.loader.js` is a
  // 404: Astro serves `public/` under the base, not at the root. Every live asset path therefore goes
  // through `asset()` from `build-tools/site-url.js`, and `scripts/check-asset-paths.js` fails the build if a
  // bare one comes back. A custom domain later empties the base and none of that has to change.
  site: DOCS_ORIGIN,
  base: DOCS_BASE_PATH,

  // Both of these were live URLs on the Eleventy site, which was published, so they cannot simply be
  // dropped. They arrived here as pages carrying `<meta http-equiv="refresh">`, inherited from that site
  // and re-pointed by the port. A meta refresh is the wrong mechanism: the stub is a real page, so
  // Pagefind indexes it, it has no canonical, and a reader who lands on it sees a blank flash. Astro
  // emits a proper redirect for these instead, and they stop being content.
  redirects: {
    '/resources/agent-skills': '/ai/agent-skills',
    '/resources/llms': '/ai/llms',
  },
  markdown: {
    // Off, because this site has its own highlighter. Astro's Shiki pass runs over every fence and bakes a
    // theme in as inline hex on each token, which no `--cs-*` token can reach — and it was overwriting the
    // Prism markup `rehypeCodeBlocks` emits, so `code-highlighter.css` was styling classes that never
    // reached the page. See src/plugins/highlight-code.js.
    syntaxHighlight: false,
    // `markdown.remarkPlugins` is deprecated in Astro 7; the pipeline is configured through
    // `unified()` instead. Examples run first: the API plugin appends nodes, and there is no
    // reason for the example plugin to walk them.
    // Order is load-bearing. remark-directive parses the ::: containers. remarkComponentApi runs
    // BEFORE remarkMarkdownFeatures so the reference it appends gets the same treatment as authored
    // prose — CEM descriptions contain [[Escape]] too, and running features first left those two
    // rendering their own brackets. remarkExamples runs last; the API block's ```js fences carry no
    // {.example} meta, so it does not touch them.
    processor: unified({
      remarkPlugins: [
        remarkDirective,
        remarkComponentApi,
        remarkComponentBrowser,
        remarkPageIndex,
        remarkTheming,
        remarkMarkdownFeatures,
        remarkExamples,
        // Last, so it also rebases the raw HTML the plugins above emit.
        remarkBaseAssets,
      ],
      // Highlighting and copy buttons run at the rehype stage, over every code block on the page —
      // an authored ```js fence in the Importing section as much as an example's source, which is what
      // keeps the two looking alike.
      rehypePlugins: [rehypeCodeBlocks],
    }),
  },
  integrations: [
    // Editing a remark plugin does not invalidate Astro's content cache, so without this the dev
    // server keeps serving the previous HTML for every page. See src/plugin-watcher.js.
    pluginWatcher(),
    starlight({
      title: 'Cornerstone',
      /**
       * The Cornerstone Design System lockup, in the header.
       *
       * Configured rather than built: `logo` is the one place Starlight's `SiteTitle` reads, and giving it a
       * `light`/`dark` pair is what makes it emit both images and hide the wrong one per colour scheme. Doing
       * it by hand would mean a second copy of that display toggle in this site's stylesheet, for no gain.
       *
       * A pair rather than one file because the lockup is two colours on transparent — ink plus `#ffd000`,
       * which is `--cs-color-yellow-80` — and the ink is black in one and white in the other. A single
       * black-ink file would vanish against the dark scheme's surface.
       *
       * `replacesTitle` because the lockup already reads "Cornerstone Design System"; without it the header
       * says the name twice. The title still reaches assistive technology — `SiteTitle` keeps it in a
       * visually-hidden span — and `alt` is empty for the same reason, so the name is not announced twice.
       */
      logo: {
        light: './src/assets/cds-mark-light.png',
        dark: './src/assets/cds-mark-dark.png',
        alt: '',
        replacesTitle: true,
      },
      // Starlight wraps each heading in a `.sl-heading-wrapper` and sets the WRAPPER's font-size so its
      // anchor icon scales with the heading. `cs-prose` sizes the heading itself, in em, relative to its
      // parent — so the two compound and an h2 rendered at 70px instead of 32px. Turning the links off
      // leaves `cs-prose` as the only thing sizing content typography.
      //
      // The cost is the hover affordance, not the anchors: heading ids are still emitted, so every deep
      // link still resolves. The Eleventy site had its own permalink treatment with a tooltip, and
      // rebuilding that as a rehype plugin using cs-* components is the follow-up.
      markdown: { headingLinks: false },
      // Order matters: docs.css first, then the ported example stylesheets, which expect to win.
      customCss: [
        './src/styles/docs.css',
        './src/styles/code-examples.css',
        './src/styles/code-highlighter.css',
        './src/styles/copy-code.css',
        './src/styles/theming.css',
      ],
      // Expressive Code is off. The examples are highlighted by Prism through the rehype pass above,
      // which reproduces the panel the Eleventy site had and keeps token colours on `--cs-*` tokens
      // rather than the inline hex Shiki bakes in. Nothing imports Starlight's <Code>, so nothing
      // depends on it. See src/plugins/highlight-code.js.
      expressiveCode: false,
      head: [
        /**
         * FIRST of all, before the layer order and before any stylesheet: cloak the page until the custom
         * elements are defined.
         *
         * `cs-page` *is* the page layout, and until it upgrades it is an unstyled inline element. Measured on a
         * reference page: at `readyState: 'interactive'` there are **126 undefined custom elements**, `cs-page`
         * computes `display: inline`, the document is 7,771px tall instead of 5,082, and the `<h1>` sits at
         * y=3,300 instead of y=108 — all of it fully visible. So every load painted the whole page in the wrong
         * place and then collapsed it into position: the "jolt" on navigate and refresh.
         *
         * `cs-cloak` is the library's answer (`utilities/fouce.css`): while any descendant is `:not(:defined)` it
         * holds `opacity: 0`, and `cornerstone.loader.ts:13` removes the class once the autoloader finishes. The
         * 2s `step-end` animation is the failsafe — if the loader never runs the page appears anyway rather than
         * staying blank.
         *
         * It has to be a script because `Page.astro` owns the `<html>` element and is not overridable, so the
         * class cannot go in the markup. Inline and first, so it lands before first paint.
         */
        { tag: 'script', content: "document.documentElement.classList.add('cs-cloak');" },
        /**
         * Then re-apply the fragment once the elements are defined, because the browser applied it too
         * early.
         *
         * A cold load of a URL with a `#hash` scrolls at parse time, using a layout the custom elements
         * have not contributed to yet. On a page of components that layout is wrong by however much the
         * upgrade changes it — measured on `/components#feedback`, the browse page's 68 cards: the
         * browser lands at scrollY 4705 where the settled answer is 4319, leaving the heading 294px
         * *above* the viewport. Anchoring the same target after the page settles puts it at 92px, which
         * is exactly its `scroll-margin-top`, so the anchor and the markup are right and only the timing
         * is wrong.
         *
         * `cs-cloak` above hides the reflow; it cannot fix a scroll position taken during it. Every
         * category badge on all 68 reference pages is such a link, which is what makes this worth a
         * script rather than a known wart.
         *
         * `scrollIntoView()` rather than re-assigning the hash: it honours `scroll-margin-top` and does
         * not add a history entry. Three guards — it gives up if the reader has already scrolled,
         * touched or keyed, so it never yanks the page out from under them; it polls `:not(:defined)`
         * rather than trusting a fixed delay; and it stops after 2s, mirroring the cloak's own failsafe
         * so a loader that never finishes leaves the page alone instead of pinned.
         */
        { tag: 'script', content: SETTLE_HASH },
        // Then, before any stylesheet. A browser fixes cascade layer order at the first `@layer`
        // declaration it sees, and `cornerstone.css` is linked below — so its own order statement would
        // otherwise establish the `cs-*` layers before Starlight's, which puts Starlight's on top and lets
        // its reset's `* { margin: 0 }` beat `cs-prose`'s rhythm. Declaring both orders here, with every
        // `cs-*` layer last, is what makes Cornerstone win every conflict with Starlight.
        //
        // This is also the answer to "remove Starlight's styles": removing them is not available, because
        // its Page.astro imports the reset, the --sl-* props, the asides and its utilities, and that
        // component is not overridable. Outranking them does the same job without breaking the components
        // still in use, and each one replaced makes more of those files dead.
        {
          tag: 'style',
          content:
            '@layer starlight.base, starlight.reset, starlight.core, starlight.content,' +
            'starlight.components, starlight.utils, cs-native, cs-base, cs-utilities, cs-color-palette,' +
            'cs-color-variant, cs-theme, cs-theme-dimension, cs-theme-overrides;',
        },
        // The library loads exactly as a consumer loads it, from the bundled build copied into
        // public/ by scripts/link-library.js. One link, because `cornerstone.css` now imports Cru's
        // theme itself — the second link that used to overlay `themes/cru.css` on top of the
        // reference theme is gone with the reason for it.
        { tag: 'link', attrs: { rel: 'stylesheet', href: asset('/dist/styles/cornerstone.css') } },
        { tag: 'script', attrs: { type: 'module', src: asset('/dist/cornerstone.loader.js') } },
        // Mirrors Starlight's colour scheme onto the cs-light/cs-dark classes the library's themes
        // key off. Inline so it runs before first paint, and order-independent by design — see
        // src/theme-sync.js.
        { tag: 'script', content: themeSync },
        { tag: 'script', attrs: { type: 'module', src: asset('/scripts/code-examples.js') } },
        // Site search. Talks to Pagefind's JS API, so none of its widget CSS reaches the page.
        { tag: 'script', attrs: { type: 'module', src: asset('/scripts/site-search.js') } },
        // Filtering and sorting for the components browse page. Self-guarding: it leaves immediately on
        // any page without a grid, which is every page but one.
        { tag: 'script', attrs: { type: 'module', src: asset('/scripts/component-browser.js') } },
        // Carries the navigation's scroll position across a route change. Full page loads mean the sidebar
        // rebuilds every click, and without this a tree scrolled halfway down snapped back to the top.
        { tag: 'script', attrs: { type: 'module', src: asset('/scripts/nav-scroll.js') } },
      ],
      // Built rather than autogenerated: the reference groups by front-matter category, which
      // `autogenerate` cannot do because it keys off directories. See src/sidebar.js.
      sidebar,
      // The navigation is ours, built with cs-stack and cs-cluster. Starlight's own renders a group as a
      // <details> disclosure widget, which is not what this site's navigation is — and reshaping it took a
      // stylesheet of rules that undid its semantics. See src/components/Sidebar.astro.
      components: {
        Sidebar: './src/components/Sidebar.astro',
        // The page scaffold is <cs-page>, and the table of contents moves into its `aside` slot, which
        // leaves TwoColumnContent with nothing to do. See src/components/PageFrame.astro.
        PageFrame: './src/components/PageFrame.astro',
        // The content column is cs-prose, so Starlight's markdown.css is not imported at all.
        MarkdownContent: './src/components/MarkdownContent.astro',
        ContentPanel: './src/components/ContentPanel.astro',
        // Chrome laid out with cs-* utilities rather than Starlight's own flex rules.
        Header: './src/components/Header.astro',
        // Starlight's CSS ships because of the *import*, not because anything renders — see Empty.astro.
        // `PageSidebar` is the largest example: it reaches `MobileTableOfContents` and `TableOfContentsList`,
        // and all three shipped a scoped stylesheet on every page while no page carried any of their hashes.
        // The table of contents is this site's own on both axes (PageFrame's aside, and OutlineDetails in main).
        PageSidebar: './src/components/Empty.astro',
        // No `editLink` is configured, and a single locale means content never falls back.
        EditLink: './src/components/Empty.astro',
        FallbackContentNotice: './src/components/Empty.astro',
        // These two keep working rather than being switched off, because both are features worth having: a
        // `banner:` in front matter, and the draft warning this site's 16 draft pages rely on in dev.
        Banner: './src/components/Banner.astro',
        // Renders the narrow-width table of contents above the title, and takes the h1 off Starlight's CSS.
        PageTitle: './src/components/PageTitle.astro',
        // Cornerstone equivalents for the last of the chrome. Each drops its Starlight counterpart's scoped CSS;
        // `Footer` must still render `Pagination`, because Starlight's Footer is what places it.
        Pagination: './src/components/Pagination.astro',
        Footer: './src/components/Footer.astro',
        SiteTitle: './src/components/SiteTitle.astro',
        // Keeps the pre-paint scheme read and drops the icon template, which took `Icon`'s CSS with it.
        ThemeProvider: './src/components/ThemeProvider.astro',
        // Only the injected 404 route reaches this, and it uses no image and no actions — so `LinkButton`'s CSS
        // was shipping for a dead import. The front-matter contract is still honoured for any future hero page.
        Hero: './src/components/Hero.astro',
        DraftContentNotice: './src/components/DraftContentNotice.astro',
        // `cs-page` renders its own skip link — visible, and with a `#main-content` target it creates itself if
        // the page has none (page.ts:307-311). Starlight's was rendering on all 114 pages with its text and its
        // background resolving to the same colour, so it was invisible: `docs.css` aliases
        // `--sl-color-text-accent` onto `--cs-color-text-link`, which SkipLink uses for its background, while
        // `native.css`'s `a { color }` wins the foreground on layer order. A live WCAG failure, fixed by
        // deferring to the component that already does it correctly.
        SkipLink: './src/components/Empty.astro',
        // The largest remaining piece of Starlight CSS, and the one whose dialog was visibly broken because that
        // CSS had already lost to `cs-native`. See src/components/Search.astro.
        Search: './src/components/Search.astro',
        TableOfContents: './src/components/TableOfContents.astro',
        ThemeSelect: './src/components/ThemeSelect.astro',
        TwoColumnContent: './src/components/TwoColumnContent.astro',
      },
    }),
  ],

  vite: {
    // `Page.astro` imports four stylesheets directly and cannot be overridden, so the only way to
    // keep them out of the bundle is to intercept the module ids. The one that matters is
    // `reset.css`: its `* { margin: 0 }` was flattening every component's own `::slotted()` and
    // `:host()` spacing site-wide. See src/plugins/stub-starlight-styles.js.
    plugins: [stubStarlightStyles()],

    server: {
      /**
       * Let a tunnelled host reach `astro dev`, for sharing a work-in-progress page.
       *
       * Vite answers an unrecognised `Host` header with `403 Blocked request`, which is what an ngrok URL
       * gets by default. The leading dot allows any subdomain of that one domain — free-tier ngrok URLs are
       * random per session, so pinning the exact host would mean editing this file every time, while
       * `allowedHosts: true` would accept any Host header at all.
       *
       * Dev server only: `vite.server` has no effect on `astro build`, so nothing here reaches production.
       */
      allowedHosts: ['.ngrok-free.dev', '.ngrok-free.app', '.ngrok.app'],
    },
  },
});
