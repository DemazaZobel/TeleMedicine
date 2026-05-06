import { ColorValue, TextStyle } from 'react-native';

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
  gray100: '#F4F4F5', // Zinc 100
  gray200: '#E4E4E7', // Zinc 200
  gray300: '#D4D4D8', // Zinc 300
  gray400: '#A1A1AA', // Zinc 400
  gray500: '#71717A', // Zinc 500
  gray600: '#52525B', // Zinc 600

  primary: '#10B981', // Emerald 500
  primaryDark: '#059669', // Emerald 600
  primaryLight: '#34D399', // Emerald 400
  primaryText: '#FFFFFF',

  secondary: '#0F172A',
  accent: '#10B981',
  gray700: '#3F3F46', // Zinc 700
  gray800: '#27272A', // Zinc 800
  gray900: '#18181B', // Zinc 900
  black: '#09090B', // Zinc 950
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
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

// ─── Theme Colors ────────────────────────────────────────
export interface ThemeColors {
  amber700: ColorValue | undefined;
  amber50: ColorValue | undefined;
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
  danger: string;
  dangerLight: string;

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
    background: '#FAFAFA', // zinc-50
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    card: '#FFFFFF',

    text: '#09090B', // zinc-950
    textSecondary: '#71717A', // zinc-500
    textTertiary: '#A1A1AA', // zinc-400
    textInverse: '#FAFAFA',

    primary: palette.primary,
    primaryLight: palette.primary + '15',
    primaryDark: palette.primaryDark,

    secondary: palette.gray100,
    secondaryLight: palette.gray50,

    success: palette.green500,
    successLight: palette.green50,
    warning: palette.amber500,
    warningLight: palette.amber50,
    error: palette.red500,
    errorLight: palette.red50,
    danger: palette.red500,
    dangerLight: palette.red50,

    border: palette.gray200,
    borderFocused: palette.primary,
    divider: palette.gray200,
    placeholder: palette.gray400,
    icon: palette.gray500,
    iconSecondary: palette.gray400,
    disabled: palette.gray200,
    overlay: 'rgba(9, 9, 11, 0.4)',

    inputBackground: palette.white,
    inputBorder: palette.gray200,

    tabBar: palette.white,
    tabBarBorder: palette.gray200,
    tabActive: palette.primary,
    tabInactive: palette.gray400,
    amber50: palette.amber50,
    amber700: palette.amber700
  },
  spacing,
  typography,
  radius,
  shadows: {
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 3,
    },
  },
};

// ─── Dark Theme ──────────────────────────────────────────
export const darkTheme: Theme = {
  dark: true,
  colors: {
    background: palette.black,
    surface: palette.black,
    surfaceElevated: palette.gray800,
    card: palette.black,

    text: palette.gray50,
    textSecondary: palette.gray400,
    textTertiary: palette.gray500,
    textInverse: palette.black,

    primary: palette.primary,
    primaryLight: palette.primary + '20',
    primaryDark: palette.primaryDark,

    secondary: palette.gray800,
    secondaryLight: palette.gray900,

    success: palette.primary,
    successLight: palette.primary + '25',
    warning: palette.amber500,
    warningLight: palette.amber500 + '25',
    error: palette.red500,
    errorLight: palette.red500 + '25',
    danger: palette.red500,
    dangerLight: palette.red500 + '25',

    border: palette.gray800,
    borderFocused: palette.primary,
    divider: palette.gray800,
    placeholder: palette.gray600,
    icon: palette.gray400,
    iconSecondary: palette.gray500,
    disabled: palette.gray800,
    overlay: 'rgba(0, 0, 0, 0.8)',

    inputBackground: palette.black,
    inputBorder: palette.gray800,

    tabBar: palette.black,
    tabBarBorder: palette.gray800,
    tabActive: palette.primary,
    tabInactive: palette.gray600,
    amber50: palette.amber50,
    amber700: palette.amber700
  },
  spacing,
  typography,
  radius,
  shadows: {
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.5,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.5,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 12,
      elevation: 3,
    },
  },
};
