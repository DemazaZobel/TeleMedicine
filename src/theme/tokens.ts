import { TextStyle } from 'react-native';

// ─── Color Palette ───────────────────────────────────────
const palette = {
  // Primary — Medical Blue
  blue50: '#EBF5FF',
  blue100: '#D1E9FF',
  blue200: '#A3D3FF',
  blue300: '#75BCFF',
  blue400: '#47A6FF',
  blue500: '#1A8FFF',
  blue600: '#0070E0',
  blue700: '#0055A8',
  blue800: '#003B70',
  blue900: '#002038',

  // Secondary — Teal
  teal50: '#E6FFFB',
  teal100: '#B5F5EC',
  teal200: '#87E8DE',
  teal300: '#5CDBD3',
  teal400: '#36CFC9',
  teal500: '#13C2C2',
  teal600: '#08979C',
  teal700: '#006D75',
  teal800: '#00474F',
  teal900: '#002329',

  // Success
  green50: '#F0FFF4',
  green500: '#38C776',
  green700: '#25864F',

  // Warning
  amber50: '#FFFBEB',
  amber500: '#F59E0B',
  amber700: '#B45309',

  // Error
  red50: '#FFF1F0',
  red500: '#FF4D4F',
  red700: '#CF1322',

  // Neutrals
  white: '#FFFFFF',
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#E8E8E8',
  gray300: '#D9D9D9',
  gray400: '#BFBFBF',
  gray500: '#8C8C8C',
  gray600: '#595959',
  gray700: '#434343',
  gray800: '#262626',
  gray900: '#1A1A1A',
  black: '#000000',
} as const;

// ─── Spacing Scale ───────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const;

// ─── Typography ──────────────────────────────────────────
export const typography: Record<string, TextStyle> = {
  h1: { fontSize: 32, fontWeight: '700', lineHeight: 40 },
  h2: { fontSize: 28, fontWeight: '700', lineHeight: 36 },
  h3: { fontSize: 24, fontWeight: '600', lineHeight: 32 },
  h4: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
  bodyLg: { fontSize: 18, fontWeight: '400', lineHeight: 26 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  bodySm: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
  button: { fontSize: 16, fontWeight: '600', lineHeight: 24 },
  buttonSm: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  label: { fontSize: 14, fontWeight: '500', lineHeight: 20 },
} as const;

// ─── Border Radius ───────────────────────────────────────
export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

// ─── Theme Colors ────────────────────────────────────────
export interface ThemeColors {
  // Backgrounds
  background: string;
  surface: string;
  surfaceElevated: string;
  card: string;

  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  // Primary
  primary: string;
  primaryLight: string;
  primaryDark: string;

  // Secondary
  secondary: string;
  secondaryLight: string;

  // Status
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  error: string;
  errorLight: string;

  // UI
  border: string;
  borderFocused: string;
  divider: string;
  placeholder: string;
  icon: string;
  iconSecondary: string;
  disabled: string;
  overlay: string;

  // Input
  inputBackground: string;
  inputBorder: string;

  // Tab Bar
  tabBar: string;
  tabBarBorder: string;
  tabActive: string;
  tabInactive: string;
}

export interface ThemeShadows {
  sm: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  md: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  lg: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
}

export interface Theme {
  dark: boolean;
  colors: ThemeColors;
  spacing: typeof spacing;
  typography: typeof typography;
  radius: typeof radius;
  shadows: ThemeShadows;
}

// ─── Light Theme ─────────────────────────────────────────
export const lightTheme: Theme = {
  dark: false,
  colors: {
    background: palette.gray50,
    surface: palette.white,
    surfaceElevated: palette.white,
    card: palette.white,

    text: palette.gray900,
    textSecondary: palette.gray600,
    textTertiary: palette.gray500,
    textInverse: palette.white,

    primary: palette.blue500,
    primaryLight: palette.blue50,
    primaryDark: palette.blue700,

    secondary: palette.teal500,
    secondaryLight: palette.teal50,

    success: palette.green500,
    successLight: palette.green50,
    warning: palette.amber500,
    warningLight: palette.amber50,
    error: palette.red500,
    errorLight: palette.red50,

    border: palette.gray200,
    borderFocused: palette.blue500,
    divider: palette.gray200,
    placeholder: palette.gray400,
    icon: palette.gray600,
    iconSecondary: palette.gray400,
    disabled: palette.gray300,
    overlay: 'rgba(0, 0, 0, 0.5)',

    inputBackground: palette.white,
    inputBorder: palette.gray300,

    tabBar: palette.white,
    tabBarBorder: palette.gray200,
    tabActive: palette.blue500,
    tabInactive: palette.gray400,
  },
  spacing,
  typography,
  radius,
  shadows: {
    sm: {
      shadowColor: palette.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: palette.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    lg: {
      shadowColor: palette.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 6,
    },
  },
};

// ─── Dark Theme ──────────────────────────────────────────
export const darkTheme: Theme = {
  dark: true,
  colors: {
    background: palette.gray900,
    surface: palette.gray800,
    surfaceElevated: palette.gray700,
    card: palette.gray800,

    text: palette.gray100,
    textSecondary: palette.gray400,
    textTertiary: palette.gray500,
    textInverse: palette.gray900,

    primary: palette.blue400,
    primaryLight: palette.blue900,
    primaryDark: palette.blue300,

    secondary: palette.teal400,
    secondaryLight: palette.teal900,

    success: palette.green500,
    successLight: 'rgba(56, 199, 118, 0.15)',
    warning: palette.amber500,
    warningLight: 'rgba(245, 158, 11, 0.15)',
    error: palette.red500,
    errorLight: 'rgba(255, 77, 79, 0.15)',

    border: palette.gray700,
    borderFocused: palette.blue400,
    divider: palette.gray700,
    placeholder: palette.gray600,
    icon: palette.gray400,
    iconSecondary: palette.gray600,
    disabled: palette.gray700,
    overlay: 'rgba(0, 0, 0, 0.7)',

    inputBackground: palette.gray800,
    inputBorder: palette.gray700,

    tabBar: palette.gray800,
    tabBarBorder: palette.gray700,
    tabActive: palette.blue400,
    tabInactive: palette.gray600,
  },
  spacing,
  typography,
  radius,
  shadows: {
    sm: {
      shadowColor: palette.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: palette.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 3,
    },
    lg: {
      shadowColor: palette.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 16,
      elevation: 6,
    },
  },
};
