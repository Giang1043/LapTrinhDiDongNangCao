/**
 * Spacing System
 * Tailwind-equivalent spacing values
 */

export const Spacing = {
  // Base unit: 4px
  xs: 4,      // Extra small
  sm: 8,      // Small
  md: 12,     // Medium
  lg: 16,     // Large
  xl: 20,     // Extra large
  xxl: 24,    // 2XL
  twoXl: 24,  // 2XL
  threeXl: 32,   // 3XL
  fourXl: 40,    // 4XL
  fiveXl: 48,    // 5XL

  // Padding shortcuts
  paddingSm: 8,
  paddingMd: 12,
  paddingLg: 16,
  paddingXl: 20,

  // Margin shortcuts
  marginSm: 8,
  marginMd: 12,
  marginLg: 16,
  marginXl: 20,

  // Border radius
  radiusXs: 4,
  radiusSm: 6,
  radiusMd: 8,
  radiusLg: 12,
  radiusXl: 16,
  radiusFull: 9999,

  // Container widths
  containerSm: 320,
  containerMd: 640,
  containerLg: 1024,
  containerFull: '100%',

  // Gaps
  gapXs: 4,
  gapSm: 8,
  gapMd: 12,
  gapLg: 16,
  gapXl: 20,
};

export const BorderRadius = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const Shadows = {
  none: {
    elevation: 0,
  },
  sm: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  md: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  lg: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  xl: {
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
};
