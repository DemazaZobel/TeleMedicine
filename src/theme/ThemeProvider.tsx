import React, { createContext, useCallback, useMemo, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, lightTheme, darkTheme } from './tokens';

const THEME_STORAGE_KEY = '@medlink_theme_preference';

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
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preference on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved !== null) {
          setOverrideDark(saved === 'dark');
        }
      } catch (e) {
        console.warn('Failed to load theme preference');
      } finally {
        setIsLoaded(true);
      }
    };
    loadTheme();
  }, []);

  // Save preference whenever it changes
  const updateOverride = useCallback(async (val: boolean | null) => {
    setOverrideDark(val);
    if (val !== null) {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, val ? 'dark' : 'light');
    } else {
      await AsyncStorage.removeItem(THEME_STORAGE_KEY);
    }
  }, []);

  const isDark = overrideDark !== null ? overrideDark : systemScheme === 'dark';

  const theme = useMemo(() => (isDark ? darkTheme : lightTheme), [isDark]);

  const toggleTheme = useCallback(() => {
    const next = overrideDark === null ? systemScheme !== 'dark' : !overrideDark;
    updateOverride(next);
  }, [overrideDark, systemScheme, updateOverride]);

  const setDarkMode = useCallback((dark: boolean) => {
    updateOverride(dark);
  }, [updateOverride]);

  const value = useMemo(
    () => ({ theme, isDark, toggleTheme, setDarkMode }),
    [theme, isDark, toggleTheme, setDarkMode]
  );

  // Avoid flash of wrong theme by waiting for load (optional, but better)
  if (!isLoaded && overrideDark === null) {
    return null; // Or a simple view matching system scheme
  }

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
