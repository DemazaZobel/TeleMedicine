import { useContext } from 'react';
import { ThemeContext, ThemeContextValue } from './ThemeProvider';

/**
 * Hook to access the current theme, isDark flag, and toggle function.
 * Must be used within a <ThemeProvider>.
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a <ThemeProvider>');
  }
  return context;
}
