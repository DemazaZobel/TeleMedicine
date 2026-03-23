import { StyleSheet, Dimensions } from 'react-native';
import type { Theme } from '../../theme';

const { width, height } = Dimensions.get('window');

export const createAuthContainerStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      // Root will be overridden to white in the component so illustrations blend
      backgroundColor: theme.colors.background,
    },
    illustrationContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: height * 0.45,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#FFFFFF', 
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
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
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
      height: height * 0.35, // Pushes the card down, leaving 35% of the screen for the image
    },
    card: {
      flex: 1,
      backgroundColor: theme.colors.background, // Adapts to dark/light mode
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      paddingHorizontal: theme.spacing.xl,
      paddingTop: theme.spacing['2xl'],
      paddingBottom: theme.spacing['4xl'],
      // Soft shadow indicating it overhangs the image
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: -10 },
      shadowOpacity: 0.05,
      shadowRadius: 20,
      elevation: 10,
    },
  });
