/**
 * All themes used in the themer.
 */
export const themes = [
  {
    //
    // #region Cru
    //
    name: 'Cru',
    description: "Cru's own: gold, generated from the brand's key colours on a luminance ladder.",
    filename: 'cru.css',
    isPro: false,
    fonts: {
      // The theme names these families and deliberately imports no font host, so a preview falls back to
      // the system stack until the consumer loads Inter and Sora themselves.
      body: {
        name: 'Inter',
        css: 'Inter, ui-sans-serif, system-ui, sans-serif',
        href: null,
      },
      heading: {
        name: 'Sora',
        css: 'Sora, ui-sans-serif, system-ui, sans-serif',
        href: null,
      },
      code: {
        name: 'OS Default (monospace)',
        css: 'ui-monospace, monospace',
        href: null,
      },
      longform: {
        name: 'OS Default (serif)',
        css: 'ui-serif, serif',
        href: null,
      },
    },
    icons: {
      family: 'classic',
      weight: 1,
    },
    palette: {
      name: 'Cru',
      filename: 'cru.css',
    },
    colorBrand: {
      color: 'yellow',
    },
    tokens: {
      // Fonts
      '--cs-font-family-body': 'Inter, ui-sans-serif, system-ui, sans-serif',
      '--cs-font-family-heading': 'Sora, ui-sans-serif, system-ui, sans-serif',
      '--cs-font-family-code': 'ui-monospace, monospace',
      '--cs-font-family-longform': 'ui-serif, serif',
      '--cs-font-weight-body': 400,
      '--cs-font-weight-heading': 600,
      '--cs-font-weight-code': 400,
      '--cs-font-weight-longform': 400,

      // Elements
      '--cs-border-radius-scale': 1,
      '--cs-space-scale': 1,
      '--cs-border-width-scale': 1,
    },
  },
  // #endregion

  {
    //
    // #region Default
    //
    name: 'Default',
    description: 'Your trusty companion, like a perfectly broken-in pair of jeans.',
    filename: 'default.css',
    isPro: false,
    fonts: {
      body: {
        name: 'OS Default (sans-serif)',
        css: 'ui-sans-serif, system-ui, sans-serif',
        href: null,
      },
      heading: {
        name: 'OS Default (sans-serif)',
        css: 'ui-sans-serif, system-ui, sans-serif',
        href: null,
      },
      code: {
        name: 'OS Default (monospace)',
        css: 'ui-monospace, monospace',
        href: null,
      },
      longform: {
        name: 'OS Default (serif)',
        css: 'ui-serif, serif',
        href: null,
      },
    },
    icons: {
      family: 'classic',
      weight: 1,
    },
    palette: {
      name: 'Default',
      filename: 'default.css',
    },
    colorBrand: {
      color: 'blue',
    },
    tokens: {
      // Fonts
      '--cs-font-family-body': 'ui-sans-serif, system-ui, sans-serif',
      '--cs-font-family-heading': 'var(--cs-font-family-body)',
      '--cs-font-family-code': 'ui-monospace, monospace',
      '--cs-font-family-longform': 'ui-serif, serif',
      '--cs-font-weight-body': 400,
      '--cs-font-weight-heading': 600,
      '--cs-font-weight-code': 400,
      '--cs-font-weight-longform': 400,

      // Elements
      '--cs-border-radius-scale': 1,
      '--cs-space-scale': 1,
      '--cs-border-width-scale': 1,
    },
  },
  // #endregion
];

/**
 * All fonts used by themes, collected from the four font categories.
 */
export const fonts = themes
  .flatMap((theme) => [theme.fonts.body, theme.fonts.heading, theme.fonts.code, theme.fonts.longform])
  .filter(
    (font, index, array) =>
      array.findIndex((f) => f.name === font.name && f.css === font.css && f.href === font.href) === index
  );

/**
 * Font presets derived from themes, with unique font names in order: heading > body > code > longform
 */
export const fontPresets = themes
  .map((theme) => {
    const fontNames = [
      theme.fonts.heading.name,
      theme.fonts.body.name,
      theme.fonts.code.name,
      theme.fonts.longform.name,
    ];
    const uniqueFonts = fontNames.filter((name, index) => fontNames.indexOf(name) === index);

    return {
      name: theme.name,
      displayName: uniqueFonts.join(' · '),
      fontFamilyBody: theme.fonts.body.css,
      fontFamilyHeading: theme.fonts.heading.css,
      fontFamilyCode: theme.fonts.code.css,
      fontFamilyLongform: theme.fonts.longform.css,
      fontWeightBody: theme.tokens['--cs-font-weight-body'],
      fontWeightHeading: theme.tokens['--cs-font-weight-heading'],
      fontWeightCode: theme.tokens['--cs-font-weight-code'],
      fontWeightLongform: theme.tokens['--cs-font-weight-longform'],
    };
  })
  .filter((preset, index, array) => array.findIndex((p) => p.displayName === preset.displayName) === index);

/**
 * Element presets derived from themes.
 */
export const elementPresets = themes.map((theme) => ({
  name: theme.name,
  borderRadiusScale: theme.tokens['--cs-border-radius-scale'],
  spaceScale: theme.tokens['--cs-space-scale'],
  borderWidthScale: theme.tokens['--cs-border-width-scale'],
}));

/**
 * All palettes used by themes in a simple array.
 */
export const palettes = themes
  .map((theme) => ({
    ...theme.palette,
    isPro: theme.isPro,
  }))
  .filter(
    (palette, index, array) =>
      array.findIndex((p) => p.name === palette.name && p.filename === palette.filename) === index
  );

/**
 * Available icons.
 */
export const icons = [
  { name: 'Classic', libraryName: 'classic' },
  { name: 'Sharp', libraryName: 'sharp' },
  { name: 'Duotone', libraryName: 'duotone' },
  { name: 'Sharp Duotone', libraryName: 'sharp-duotone' },
];

export const colors = ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'indigo', 'purple', 'pink', 'gray'];
export const tints = ['95', '90', '80', '70', '60', '50', '40', '30', '20', '10', '05'];
