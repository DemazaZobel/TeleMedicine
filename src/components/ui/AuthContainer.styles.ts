import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme';

export const createAuthContainerStyles = (theme: Theme, windowWidth: number, windowHeight: number) => {
  const isDesktop = windowWidth > 768;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      flexDirection: isDesktop ? 'row' : 'column',
    },
    // Desktop specific panes
    desktopLeftPane: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      padding: theme.spacing['4xl'],
    },
    desktopRightPane: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      // The background color for this pane will be passed dynamically based on theme (illustrationBg)
    },
    desktopIllustrationCard: {
      width: '100%',
      height: '100%',
      maxWidth: 600,
      maxHeight: 700,
      backgroundColor: theme.colors.surface,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.05,
      shadowRadius: 30,
      elevation: 5,
      overflow: 'hidden',
    },
    desktopFormContainer: {
      width: '100%',
      maxWidth: 420,
    },
    // Mobile specific styles (preserved)
    illustrationContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: windowHeight * 0.42,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    illustration: {
      width: '80%',
      height: '80%',
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
      height: windowHeight * 0.35,
    },
    card: {
      flex: 1,
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      paddingHorizontal: theme.spacing.xl,
      paddingTop: theme.spacing['2xl'],
      paddingBottom: theme.spacing['4xl'],
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: -6 },
      shadowOpacity: 0.06,
      shadowRadius: 16,
      elevation: 10,
      minHeight: windowHeight * 0.65,
    },
  });
};
