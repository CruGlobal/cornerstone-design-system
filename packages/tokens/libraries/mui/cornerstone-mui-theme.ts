/**
 * Cornerstone → MUI theme adapter
 *
 * Maps Cornerstone `_sys` design tokens onto a Material UI theme so MUI-based
 * apps (e.g. mpdx-react, give-web) render with Cru / FamilyLife brand styling.
 *
 * This is the MUI analog of `libraries/daisyui.css`: resolved token values are
 * embedded here per brand × mode. Values are generated from the token source in
 * `tokens/` (see `build/json/<brand>-<mode>.flat.json`). If the tokens change,
 * regenerate the maps below rather than hand-editing them.
 *
 * Resolved (not `var(--…)`) values are used deliberately: MUI's color utilities
 * (`alpha`, `darken`, contrast calculation, ripples) must be able to parse the
 * palette at runtime, which they cannot do with unresolved CSS custom properties.
 * The tradeoff is that a theme is built per mode — swap themes at runtime the
 * standard MUI way (recreate with a different `mode`).
 */

import { createTheme } from '@mui/material/styles';
import type { Theme, ThemeOptions, PaletteMode } from '@mui/material/styles';

export type CornerstoneBrand = 'cru' | 'fl';
export type CornerstoneMode = PaletteMode; // 'light' | 'dark'

export interface CornerstoneThemeParams {
  /** Brand to theme for. Defaults to `'cru'`. */
  brand?: CornerstoneBrand;
  /** Light or dark mode. Defaults to `'light'`. */
  mode?: CornerstoneMode;
}

interface PaletteTokens {
  primaryDefault: string;
  primaryHover: string;
  onPrimary: string;
  secondaryDefault: string;
  secondaryHover: string;
  onSecondary: string;
  dangerDefault: string;
  dangerHover: string;
  onDanger: string;
  warningDefault: string;
  warningHover: string;
  onWarning: string;
  informationDefault: string;
  informationHover: string;
  onInformation: string;
  successDefault: string;
  successHover: string;
  onSuccess: string;
  backgroundDefault: string;
  surfaceDefault: string;
  textPrimary: string;
  textSecondary: string;
  textDisabled: string;
  divider: string;
  action: string;
  actionHover: string;
}

// --- Resolved sys color tokens, per brand × mode -------------------------------
const PALETTE: Record<`${CornerstoneBrand}-${CornerstoneMode}`, PaletteTokens> = {
  'cru-light': {
    primaryDefault: '#ffd000', primaryHover: '#ffd930', onPrimary: '#000000',
    secondaryDefault: '#f08020', secondaryHover: '#c0661a', onSecondary: '#000000',
    dangerDefault: '#c23c49', dangerHover: '#9b303a', onDanger: '#ffffff',
    warningDefault: '#f08020', warningHover: '#c0661a', onWarning: '#ffffff',
    informationDefault: '#007890', informationHover: '#006073', onInformation: '#ffffff',
    successDefault: '#24c976', successHover: '#1da15e', onSuccess: '#ffffff',
    backgroundDefault: '#ffffff', surfaceDefault: '#fefefe',
    textPrimary: '#000000', textSecondary: 'rgba(0, 0, 0, 0.6)', textDisabled: 'rgba(0, 0, 0, 0.4)',
    divider: 'rgba(0, 0, 0, 0.1)', action: 'rgba(0, 0, 0, 0.6)', actionHover: 'rgba(0, 0, 0, 0.7)',
  },
  'cru-dark': {
    primaryDefault: '#ffd000', primaryHover: '#ffd930', onPrimary: '#000000',
    secondaryDefault: '#f08020', secondaryHover: '#f9c89f', onSecondary: '#000000',
    dangerDefault: '#74242c', dangerHover: '#9b303a', onDanger: '#ffffff',
    warningDefault: '#904d13', warningHover: '#c0661a', onWarning: '#ffffff',
    informationDefault: '#007382', informationHover: '#009aad', onInformation: '#ffffff',
    successDefault: '#52896d', successHover: '#6db692', onSuccess: '#ffffff',
    backgroundDefault: '#111110', surfaceDefault: '#111110',
    textPrimary: '#ffffff', textSecondary: 'rgba(255, 255, 255, 0.6)', textDisabled: 'rgba(255, 255, 255, 0.4)',
    divider: 'rgba(255, 255, 255, 0.1)', action: 'rgba(255, 255, 255, 0.6)', actionHover: 'rgba(255, 255, 255, 0.7)',
  },
  'fl-light': {
    primaryDefault: '#006c5b', primaryHover: '#005649', onPrimary: '#f1f1f1',
    secondaryDefault: '#f3bd48', secondaryHover: '#c2973a', onSecondary: '#24272a',
    dangerDefault: '#ebb1b9', dangerHover: '#bc8e94', onDanger: '#ffffff',
    warningDefault: '#e47e3d', warningHover: '#b66531', onWarning: '#ffffff',
    informationDefault: '#7ca7ad', informationHover: '#63868a', onInformation: '#ffffff',
    successDefault: '#006c5b', successHover: '#005649', onSuccess: '#ffffff',
    backgroundDefault: '#ffffff', surfaceDefault: '#fefefe',
    textPrimary: '#000000', textSecondary: 'rgba(0, 0, 0, 0.6)', textDisabled: 'rgba(0, 0, 0, 0.4)',
    divider: 'rgba(0, 0, 0, 0.1)', action: 'rgba(0, 0, 0, 0.6)', actionHover: 'rgba(0, 0, 0, 0.7)',
  },
  'fl-dark': {
    primaryDefault: '#006c5b', primaryHover: '#99c4bd', onPrimary: '#f1f1f1',
    secondaryDefault: '#f3bd48', secondaryHover: '#fae5b6', onSecondary: '#f1f1f1',
    dangerDefault: '#f3d0d5', dangerHover: '#f7e0e3', onDanger: '#000000',
    warningDefault: '#efb28b', warningHover: '#f4cbb1', onWarning: '#000000',
    informationDefault: '#b0cace', informationHover: '#cbdcde', onInformation: '#000000',
    successDefault: '#66a79d', successHover: '#99c4bd', onSuccess: '#000000',
    backgroundDefault: '#070808', surfaceDefault: '#070808',
    textPrimary: '#ffffff', textSecondary: 'rgba(255, 255, 255, 0.6)', textDisabled: 'rgba(255, 255, 255, 0.4)',
    divider: 'rgba(255, 255, 255, 0.1)', action: 'rgba(255, 255, 255, 0.6)', actionHover: 'rgba(255, 255, 255, 0.7)',
  },
};

// --- Font families, per brand --------------------------------------------------
// Cru pairs Sora (display/headline/title) with Inter (body/UI); FamilyLife uses
// Akkurat LL throughout. Fallbacks keep text readable before webfonts load.
const FALLBACK = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const FONTS: Record<CornerstoneBrand, { heading: string; body: string }> = {
  cru: { heading: `"Sora", ${FALLBACK}`, body: `"Inter", ${FALLBACK}` },
  fl: { heading: `"Akkurat LL", ${FALLBACK}`, body: `"Akkurat LL", ${FALLBACK}` },
};

// Border radius — sys-number-border-radius-md (identical across brands/modes).
const BORDER_RADIUS_MD = 8;

/**
 * Build MUI `ThemeOptions` from Cornerstone tokens. Use this when you need to
 * merge Cornerstone styling into your own `createTheme` call (e.g. to add
 * component overrides). If you just want a ready theme, use
 * {@link createCornerstoneTheme}.
 */
export function cornerstoneThemeOptions(params: CornerstoneThemeParams = {}): ThemeOptions {
  const brand: CornerstoneBrand = params.brand ?? 'cru';
  const mode: CornerstoneMode = params.mode ?? 'light';
  const c = PALETTE[`${brand}-${mode}`];
  const font = FONTS[brand];

  return {
    palette: {
      mode,
      primary: { main: c.primaryDefault, dark: c.primaryHover, contrastText: c.onPrimary },
      secondary: { main: c.secondaryDefault, dark: c.secondaryHover, contrastText: c.onSecondary },
      error: { main: c.dangerDefault, dark: c.dangerHover, contrastText: c.onDanger },
      warning: { main: c.warningDefault, dark: c.warningHover, contrastText: c.onWarning },
      info: { main: c.informationDefault, dark: c.informationHover, contrastText: c.onInformation },
      success: { main: c.successDefault, dark: c.successHover, contrastText: c.onSuccess },
      background: { default: c.backgroundDefault, paper: c.surfaceDefault },
      text: { primary: c.textPrimary, secondary: c.textSecondary, disabled: c.textDisabled },
      divider: c.divider,
      action: { active: c.action, hover: c.actionHover },
    },
    shape: { borderRadius: BORDER_RADIUS_MD },
    typography: {
      fontFamily: font.body,
      // Cornerstone headline/title scale, set in Sora (Cru) / Akkurat (FL).
      h1: { fontFamily: font.heading, fontSize: '60px', fontWeight: 700, lineHeight: 1.1 },
      h2: { fontFamily: font.heading, fontSize: '48px', fontWeight: 700, lineHeight: 1.1 },
      h3: { fontFamily: font.heading, fontSize: '40px', fontWeight: 700, lineHeight: 1.1 },
      h4: { fontFamily: font.heading, fontSize: '32px', fontWeight: 700, lineHeight: 1.1 },
      h5: { fontFamily: font.heading, fontSize: '24px', fontWeight: 500, lineHeight: 1.1 },
      h6: { fontFamily: font.heading, fontSize: '20px', fontWeight: 500, lineHeight: 1.1 },
      // Pretitle → subtitles (body font, medium weight).
      subtitle1: { fontSize: '18px', fontWeight: 500, lineHeight: 1.1 },
      subtitle2: { fontSize: '16px', fontWeight: 500, lineHeight: 1.1 },
      // Body scale (line-height 1.75 per Cornerstone).
      body1: { fontSize: '16px', fontWeight: 400, lineHeight: 1.75 },
      body2: { fontSize: '12px', fontWeight: 400, lineHeight: 1.75 },
      button: { fontSize: '14px', fontWeight: 700, lineHeight: 1.4, textTransform: 'none' },
      caption: { fontSize: '12px', fontWeight: 400, lineHeight: 1.75 },
      overline: { fontSize: '14px', fontWeight: 500, lineHeight: 1.1, textTransform: 'uppercase' },
    },
  };
}

/**
 * Create a ready-to-use MUI {@link Theme} styled with Cornerstone tokens.
 *
 * @example
 * ```tsx
 * import { ThemeProvider, CssBaseline } from '@mui/material';
 * import { createCornerstoneTheme } from '@cruglobal/cornerstone-design-system/mui';
 *
 * const theme = createCornerstoneTheme({ brand: 'cru', mode: 'light' });
 *
 * <ThemeProvider theme={theme}>
 *   <CssBaseline />
 *   <App />
 * </ThemeProvider>
 * ```
 */
export function createCornerstoneTheme(params: CornerstoneThemeParams = {}): Theme {
  return createTheme(cornerstoneThemeOptions(params));
}
