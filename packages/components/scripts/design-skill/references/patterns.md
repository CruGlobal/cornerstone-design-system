# Recipes

Best-practice compositions built from Cornerstone primitives. Each recipe names its **STEP 0 branch**
(full-page → `<cs-page>`; in-page → utilities only), its **design intent**, and its **rationale** (the
established web-design convention it follows). Copy, then re-theme with tokens.

All recipes assume a theme/palette is set on `<html>` (see [theming.md](theming.md)) and, for full-page
recipes, the `html, body` reset from [layouts-page.md](layouts-page.md).

These snippets keep a few one-off values inline (a `max-width`, a `--min-column-size`) so each is
self-contained. In a real page, lift anything reused into a `<style>` block as a class, and **never style
a component host inline** — restyle components through their tokens, attributes, or `::part()` (see
[composition.md](composition.md)).

---

## App shell (full-page, `<cs-page>`)

**Intent:** a logged-in application frame with a sidebar, top bar, and content area.
**Rationale:** persistent left navigation + a top bar is the conventional app layout; users expect nav
to stay put while content scrolls. `<cs-page>` gives sticky regions and a mobile drawer for free.

```html
<cs-page>
  <header slot="header" class="cs-split">
    <div class="cs-cluster">
      <cs-button data-toggle-nav appearance="plain" class="cs-mobile-only">
        <cs-icon name="menu" label="Menu"></cs-icon>
      </cs-button>
      <strong>Acme</strong>
    </div>
    <cs-avatar label="Account"></cs-avatar>
  </header>

  <!-- data-drawer="close" closes the mobile nav drawer after a tap -->
  <nav slot="navigation" class="cs-stack cs-gap-2xs">
    <a href="#" data-drawer="close"><cs-icon slot="start" name="speed"></cs-icon> Dashboard</a>
    <a href="#" data-drawer="close"><cs-icon slot="start" name="group"></cs-icon> Customers</a>
    <a href="#" data-drawer="close"><cs-icon slot="start" name="settings"></cs-icon> Settings</a>
  </nav>

  <main class="cs-stack cs-gap-xl">
    <h1>Dashboard</h1>
    <p>Welcome back.</p>
  </main>
</cs-page>

<style>
  html,
  body {
    min-height: 100%;
    padding: 0;
    margin: 0;
  }
  cs-page {
    --menu-width: 15rem;
  }
  cs-page[view='mobile'] {
    --menu-width: auto;
  }
</style>
```

---

## Marketing landing page (full-page, `<cs-page>`)

**Intent:** a public landing page with a top nav, a hero, a feature grid, and a footer.
**Rationale:** a single clear value proposition with one primary call-to-action above the fold converts
better than competing actions; supporting detail follows below.

**Nav:** this uses the sanctioned "header on desktop, drawer on mobile" recipe — links live in the
`header` for wide screens and are mirrored in `slot="navigation"` for the mobile drawer `<cs-page>`
provides. Each copy is hidden in the opposite view via `cs-page[view='…']`. This is the _only_ place nav
is duplicated on purpose; never copy nav between slots otherwise. (For a simpler page, drop the header
copy and the two hide-rules and keep just `slot="navigation"` — you'll get a small desktop sidebar plus
the mobile drawer.)

```html
<cs-page>
  <header slot="header" class="cs-split">
    <strong>Acme</strong>
    <!-- Desktop links — hidden on mobile via the style block below -->
    <div class="header-nav cs-cluster">
      <a href="#features">Features</a>
      <a href="#pricing">Pricing</a>
      <cs-button variant="brand">Get started</cs-button>
    </div>
  </header>

  <!-- Same links, mirrored for the mobile drawer (hamburger is automatic) -->
  <nav slot="navigation" class="cs-stack cs-gap-2xs">
    <a href="#features" data-drawer="close">Features</a>
    <a href="#pricing" data-drawer="close">Pricing</a>
    <cs-button variant="brand">Get started</cs-button>
  </nav>

  <main class="cs-stack cs-gap-3xl">
    <section class="cs-stack cs-gap-l" style="max-width: 40rem; text-align: center; margin-inline: auto;">
      <h1 class="cs-heading-3xl">Ship faster with Acme</h1>
      <p class="cs-body-l">The toolkit teams reach for when deadlines are real.</p>
      <div class="cs-cluster" style="justify-content: center;">
        <cs-button variant="brand" size="l">Start free</cs-button>
        <cs-button appearance="plain" size="l">Watch demo</cs-button>
      </div>
    </section>

    <section id="features" class="cs-grid cs-gap-xl" style="--min-column-size: 16rem;">
      <div class="cs-stack cs-gap-xs">
        <cs-icon name="bolt"></cs-icon>
        <h3>Fast</h3>
        <p>Built for speed from the ground up.</p>
      </div>
      <div class="cs-stack cs-gap-xs">
        <cs-icon name="shield"></cs-icon>
        <h3>Secure</h3>
        <p>Enterprise-grade security by default.</p>
      </div>
      <div class="cs-stack cs-gap-xs">
        <cs-icon name="extension"></cs-icon>
        <h3>Flexible</h3>
        <p>Adapts to how your team already works.</p>
      </div>
    </section>
  </main>

  <footer slot="footer" class="cs-grid cs-gap-2xl">
    <div class="cs-stack cs-gap-xs"><strong>Product</strong><a href="#">Features</a><a href="#">Pricing</a></div>
    <div class="cs-stack cs-gap-xs"><strong>Company</strong><a href="#">About</a><a href="#">Careers</a></div>
  </footer>
</cs-page>

<style>
  html,
  body {
    min-height: 100%;
    padding: 0;
    margin: 0;
  }
  cs-page[view='mobile'] .header-nav {
    display: none; /* hide desktop header links on mobile */
  }
  cs-page[view='desktop']::part(navigation) {
    display: none; /* hide the desktop sidebar; mobile drawer is unaffected */
  }
</style>
```

---

## Login / auth card (in-page, utilities only)

**Intent:** a centered sign-in card.
**Rationale:** auth is a focused, single-task moment, so center a narrow card, minimize fields, one primary
action. Don't use `<cs-page>`; this is one element on a page.

```html
<div class="auth-screen cs-stack">
  <cs-card class="auth-card">
    <div class="cs-stack cs-gap-l">
      <h1 class="cs-heading-l">Sign in</h1>
      <cs-input label="Email" type="email"></cs-input>
      <cs-input label="Password" type="password"></cs-input>
      <cs-button variant="brand">Sign in</cs-button>
      <a href="#" class="cs-caption-m">Forgot your password?</a>
    </div>
  </cs-card>
</div>

<style>
  .auth-screen {
    min-height: 100vh;
    justify-content: center;
    align-items: center;
  }
  /* Size the card via a class, not an inline style on the component host. */
  .auth-card {
    width: 100%;
    max-width: 24rem;
  }
</style>
```

---

## Settings section (in-page, utilities only)

**Intent:** a settings panel with grouped, labeled rows.
**Rationale:** group related settings, label each row, and keep the control aligned to the right of its
description, for a scannable, conventional settings layout.

```html
<section class="cs-stack cs-gap-xl" style="max-width: 40rem;">
  <h2>Notifications</h2>

  <div class="cs-split">
    <div class="cs-stack cs-gap-3xs">
      <strong>Email digests</strong>
      <span class="cs-caption-m">A weekly summary of activity.</span>
    </div>
    <cs-switch></cs-switch>
  </div>

  <div class="cs-split">
    <div class="cs-stack cs-gap-3xs">
      <strong>Product updates</strong>
      <span class="cs-caption-m">News about features and releases.</span>
    </div>
    <cs-switch checked></cs-switch>
  </div>
</section>
```

---

## Dashboard card grid (in-page, utilities only)

**Intent:** a grid of stat/summary cards.
**Rationale:** equal-weight summary tiles in a responsive grid let users scan key numbers; the grid
reflows by available width with no breakpoints.

```html
<div class="cs-grid cs-gap-l" style="--min-column-size: 14rem;">
  <cs-card>
    <div class="cs-stack cs-gap-2xs">
      <span class="cs-caption-m">Revenue</span>
      <strong class="cs-heading-2xl">$48.2k</strong>
    </div>
  </cs-card>
  <cs-card>
    <div class="cs-stack cs-gap-2xs">
      <span class="cs-caption-m">Active users</span>
      <strong class="cs-heading-2xl">1,284</strong>
    </div>
  </cs-card>
  <cs-card>
    <div class="cs-stack cs-gap-2xs">
      <span class="cs-caption-m">Churn</span>
      <strong class="cs-heading-2xl">2.1%</strong>
    </div>
  </cs-card>
</div>
```

---

## Want more?

These are starting points, not a component-by-component catalog. For exact component APIs, use the
companion `cornerstone` skill.
