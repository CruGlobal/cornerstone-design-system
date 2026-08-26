# Cornerstone MUI theme adapter

A [Material UI](https://mui.com/) theme built from Cornerstone design tokens, so
MUI-based apps (mpdx-react, give-web, …) render with **Cru** or **FamilyLife**
brand styling — colors, typography (Sora/Inter or Akkurat LL), and radius.

This is the MUI counterpart to `libraries/daisyui.css`.

## Install

```sh
npm install @cruglobal/cornerstone-design-system @mui/material @emotion/react @emotion/styled
```

`@mui/material` is a **peer dependency** — install the version your app already uses.

## Use

```tsx
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createCornerstoneTheme } from '@cruglobal/cornerstone-design-system/mui';

const theme = createCornerstoneTheme({ brand: 'cru', mode: 'light' });

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* your app */}
    </ThemeProvider>
  );
}
```

`brand` defaults to `'cru'` and `mode` to `'light'`, so `createCornerstoneTheme()`
gives you Cru light.

### Dark mode / brand switching

Build a theme per mode and swap it via state (the standard MUI pattern):

```tsx
const theme = useMemo(
  () => createCornerstoneTheme({ brand: 'cru', mode: prefersDark ? 'dark' : 'light' }),
  [prefersDark],
);
```

### Extending the theme

Need component overrides on top of Cornerstone? Merge the options into your own
`createTheme`:

```tsx
import { createTheme } from '@mui/material/styles';
import { cornerstoneThemeOptions } from '@cruglobal/cornerstone-design-system/mui';

const theme = createTheme(cornerstoneThemeOptions({ brand: 'cru', mode: 'light' }), {
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
  },
});
```

## Fonts

The theme references brand fonts by name but does **not** load them — add the
faces yourself. Cornerstone uses:

| Brand | Headings | Body / UI |
| --- | --- | --- |
| Cru | Sora | Inter |
| FamilyLife | Akkurat LL | Akkurat LL |

Fallbacks (`system-ui`, etc.) render legible text until the webfonts load. Load
Inter/Sora from your font host or Google Fonts; Akkurat LL is a licensed face.

## Notes

- **Resolved values, not CSS variables.** The theme embeds resolved token values
  so MUI's color utilities (`alpha`, `darken`, contrast, ripples) work. Because
  of that, a theme instance is tied to one brand × mode — switch by recreating it
  (above), not by toggling `data-theme`. If you also use Cornerstone's raw CSS
  variables elsewhere, keep `data-brand`/`data-theme` on your root in sync with
  the theme you pass here.
- **Cornerstone `hover` maps to MUI `.dark`.** So contained-button hover states
  use the Cornerstone hover color. MUI derives `.light` from `main`.
- **Consuming the raw source.** This adapter ships as TypeScript (like the other
  files under `libraries/`). Bundlers that don't transpile `node_modules` need to
  opt in — e.g. Next.js:

  ```js
  // next.config.js
  module.exports = {
    transpilePackages: ['@cruglobal/cornerstone-design-system'],
  };
  ```

  Vite/esbuild handle it without extra config.
- **Keeping values current.** The token values are generated from `tokens/`
  (`build/json/<brand>-<mode>.flat.json`). If tokens change, regenerate the maps
  in `cornerstone-mui-theme.ts` rather than editing them by hand.
