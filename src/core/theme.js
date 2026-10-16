import { DefaultTheme } from 'react-native-paper'

// Design tokens. Use these instead of hardcoded colours/sizes so screens stay consistent.
export const palette = {
  primary: '#1E3A8A',
  primaryDark: '#172554',
  primaryTint: '#E8EDFB',
  accent: '#EA580C',
  accentTint: '#FFF1E8',

  background: '#F3F5F9',
  surface: '#FFFFFF',
  surfaceAlt: '#F8FAFC',
  border: '#E2E8F0',
  divider: '#EEF2F6',

  text: '#0F172A',
  subText: '#475569',
  muted: '#94A3B8',
  onPrimary: '#FFFFFF',

  // Camera / recording screens
  cameraBackground: '#0B1220',
  cameraSurface: 'rgba(255,255,255,0.08)',
  cameraBorder: 'rgba(255,255,255,0.18)',
  onCamera: '#FFFFFF',
  onCameraMuted: 'rgba(255,255,255,0.7)',

  success: '#15803D',
  successTint: '#DCFCE7',
  danger: '#B91C1C',
  dangerTint: '#FEE2E2',
  warning: '#B45309',
  warningTint: '#FEF3C7',
}

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 }

export const radius = { sm: 6, md: 10, lg: 14, pill: 999 }

export const typography = {
  title: { fontSize: 22, fontWeight: '700', color: palette.text },
  heading: { fontSize: 17, fontWeight: '700', color: palette.text },
  body: { fontSize: 15, color: palette.text },
  label: { fontSize: 12, fontWeight: '600', color: palette.subText, letterSpacing: 0.4, textTransform: 'uppercase' },
  caption: { fontSize: 12, color: palette.muted },
}

export const shadow = {
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  raised: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
}

export const theme1 = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    text: '#000000',
    primary: '#02032f',
    secondary: '#40c3f3',
    error: '#6b0214',
    gradientA: '#040112',
    gradientB: '#0e0e91',
    gradientC: '#9997fb'
  },
}

export const theme = {
  ...DefaultTheme,
  roundness: radius.md,
  colors: {
    ...DefaultTheme.colors,
    ...palette,
    secondary: palette.accent,
    error: palette.danger,
    disabledPrimary: palette.muted,
    // Legacy keys still referenced by older components; mapped onto the palette above
    gradientA: palette.background,
    gradientB: palette.background,
    gradientC: palette.background,
    gradientALight: palette.primaryTint,
    shadowColor: '#0F172A',
    shadowColorAlt: '#0F172A',
    caseItemBackground: palette.surface,
    title1Color: palette.accent,
    title2Color: palette.primary,
    borderSeperator: palette.border,
    lightBorderSeperator: palette.divider,
    LIGHT_BLUE: '#afd0ff',
    LIGHT_GOLD: '#e8d38f',
    LIGHT_RED: '#ff7e85',
    DARK_BLUE: '#4a64a8',
    DARK_GOLD: '#85692a',
    DARK_RED: '#992e1e',
    details_card_color: palette.surface,
    button: palette.primary,
    button_label: palette.onPrimary,
    submitButton: palette.primary,
    disabledSubmitButton: palette.muted,
    updateDetailsBackground: palette.surfaceAlt,
    capabilitiesCardBackgroundColor: palette.surface,
  }
}
