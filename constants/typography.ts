/**
 * Typography System
 * Tailwind-equivalent font sizes and weights
 */

export const Typography = {
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },

  // Font weights
  fontWeight: {
    thin: '100' as const,
    extralight: '200' as const,
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
    black: '900' as const,
  },

  // Line heights
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter spacing
  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.25,
    wider: 0.5,
    widest: 1,
  },

  // Predefined text styles
  styles: {
    heading1: {
      fontSize: 36,
      fontWeight: '700' as const,
      lineHeight: 1.2,
    },
    heading2: {
      fontSize: 30,
      fontWeight: '700' as const,
      lineHeight: 1.3,
    },
    heading3: {
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 1.35,
    },
    heading4: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 1.4,
    },
    heading5: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 1.4,
    },
    heading6: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 1.5,
    },

    // Body text
    bodyLarge: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 1.5,
    },
    body: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 1.5,
    },
    bodySmall: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 1.5,
    },

    // Label text
    labelLarge: {
      fontSize: 14,
      fontWeight: '500' as const,
      lineHeight: 1.4,
    },
    label: {
      fontSize: 12,
      fontWeight: '500' as const,
      lineHeight: 1.4,
    },
    labelSmall: {
      fontSize: 11,
      fontWeight: '500' as const,
      lineHeight: 1.4,
    },

    // Display text
    displayLarge: {
      fontSize: 48,
      fontWeight: '700' as const,
      lineHeight: 1.2,
    },
    displayMedium: {
      fontSize: 36,
      fontWeight: '700' as const,
      lineHeight: 1.3,
    },
    displaySmall: {
      fontSize: 24,
      fontWeight: '700' as const,
      lineHeight: 1.35,
    },
  },
};

export const Fonts = {
  // Font families
  default: 'System',
  mono: 'Courier New',

  // Weights
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
};
