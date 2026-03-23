import { StyleSheet, Dimensions } from 'react-native';
import type { Theme } from '../../theme';

const { height } = Dimensions.get('window');

export const createAuthContainerStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    illustrationContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: height * 0.42,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    illustration: {
      width: '100%',
      height: '100%',
    },
    backButton: {
      position: 'absolute',
      left: theme.spacing.lg,
      zIndex: 10,
    },
    backButtonRing: {
      borderRadius: 99,
      padding: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    scrollContent: {
      flexGrow: 1,
    },
    spacer: {
      height: height * 0.35,
    },
    card: {
      flex: 1,
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      paddingHorizontal: theme.spacing.xl,
      paddingTop: theme.spacing['2xl'],
      paddingBottom: theme.spacing['4xl'],
      // Subtle shadow for the card overlap effect
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: -6 },
      shadowOpacity: 0.06,
      shadowRadius: 16,
      elevation: 10,
      // Bottom padding so the last input is always reachable when keyboard is open
      minHeight: height * 0.65,
    },
  });
