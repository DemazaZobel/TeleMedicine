import React, { createContext, useCallback, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { Theme, lightTheme, darkTheme } from './tokens';

// ─── Context Shape ───────────────────────────────────────
export interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setDarkMode: (dark: boolean) => void;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(
  undefined
);

// ─── Provider ────────────────────────────────────────────
interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const [overrideDark, setOverrideDark] = useState<boolean | null>(null);

  const isDark = overrideDark !== null ? overrideDark : systemScheme === 'dark';

  const theme = useMemo(() => (isDark ? darkTheme : lightTheme), [isDark]);

  const toggleTheme = useCallback(() => {
    setOverrideDark((prev) => {
      if (prev === null) return systemScheme !== 'dark';
      return !prev;
    });
  }, [systemScheme]);

  const setDarkMode = useCallback((dark: boolean) => {
    setOverrideDark(dark);
  }, []);

  const value = useMemo(
    () => ({ theme, isDark, toggleTheme, setDarkMode }),
    [theme, isDark, toggleTheme, setDarkMode]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
