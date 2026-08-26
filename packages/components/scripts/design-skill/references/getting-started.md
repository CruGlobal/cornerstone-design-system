# The opinionated default

When a user just wants something that looks good without making a hundred small decisions, use this
default. It's a complete, on-brand, responsive starting point. Change one thing at a time from here.

## The default decisions

| Decision           | Default                            | Why                                                |
| ------------------ | ---------------------------------- | -------------------------------------------------- |
| Theme              | Cru's, applied by importing        | The default; no class needed                        |
| Palette            | Cru's, shipped by the theme        | A theme carries its own palette                     |
| Color scheme       | `cs-light`                         | Predictable starting point; add a toggle later     |
| Brand color        | Keep default, or `.cs-brand-{hue}` | One class re-brands the whole UI                   |
| Layout (full page) | `<cs-page>`                        | The supported way to scaffold a page               |
| Spacing            | `cs-gap-*` / `--cs-space-*`        | One consistent rhythm                              |
| Components         | Free set                           | A great result with zero cost; Pro extends it      |

## The skeleton

```html
<!doctype html>
<html lang="en" class="cs-light">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <!-- Load Cornerstone (see the `cornerstone` skill for installation) -->
    <style>
      html,
      body {
        min-height: 100%;
        padding: 0;
        margin: 0;
      }
      cs-page {
        --menu-width: 16rem;
      }
      cs-page[view='mobile'] {
        --menu-width: auto;
      }
    </style>
  </head>
  <body>
    <cs-page>
      <header slot="header" class="cs-split">
        <strong>My App</strong>
        <cs-button variant="brand">Sign up</cs-button>
      </header>
      <nav slot="navigation" class="cs-stack cs-gap-2xs">
        <a href="#">Home</a>
        <a href="#">Settings</a>
      </nav>
      <main class="cs-stack cs-gap-xl">
        <h1>Welcome</h1>
        <p>Start building here.</p>
      </main>
    </cs-page>
  </body>
</html>
```

## Where to go next

- **Re-brand:** add `.cs-brand-green` (or any hue) to `<html>` → [theming.md](theming.md).
- **A different look fast:** swap in another theme → [theming.md](theming.md).
- **Make it look more designed:** spacing rhythm, type, surfaces → [composition.md](composition.md).
- **Build a specific screen:** [patterns.md](patterns.md).
- **Just a section, not a whole page:** [layouts-inpage.md](layouts-inpage.md).
