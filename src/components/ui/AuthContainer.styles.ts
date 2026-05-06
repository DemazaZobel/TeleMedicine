import { StyleSheet, Platform } from 'react-native';
import type { Theme } from '../../theme';

export const createAuthContainerStyles = (theme: Theme, windowWidth: number, windowHeight: number) => {
  // Styles are now colocated in AuthContainer.tsx
  // This file is kept for backward compat if imported elsewhere
  return StyleSheet.create({
    container: {
      flex: 1,
    },
  });
};
