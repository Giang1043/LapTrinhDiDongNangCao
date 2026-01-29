/**
 * Color Palette
 * Tailwind-equivalent colors for consistent UI
 */

export const Colors = {
  // Primary
  primary: '#FF6B6B',
  primaryLight: '#FF8787',
  primaryDark: '#E63946',

  // Secondary
  secondary: '#4ECDC4',
  secondaryLight: '#6FD5D3',
  secondaryDark: '#349B96',

  // Neutral
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Background
  background: '#F5F5F5',
  backgroundDark: '#1A1A1A',

  // Text
  textPrimary: '#000000',
  textSecondary: '#666666',
  textTertiary: '#999999',

  // Border
  border: '#E5E7EB',
  borderDark: '#374151',

  // Transparency
  transparent: 'transparent',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  overlayDark: 'rgba(255, 255, 255, 0.1)',
};

export const lightTheme = {
  colors: Colors,
  isDark: false,
};

export const darkTheme = {
  colors: {
    ...Colors,
    background: Colors.gray900,
    textPrimary: Colors.white,
    textSecondary: Colors.gray300,
  },
  isDark: true,
};
