import { Platform } from 'react-native';

/**
 * Platform-aware storage that uses expo-secure-store on native
 * and localStorage on web.
 */

let SecureStore: typeof import('expo-secure-store') | null = null;

// Lazy-load SecureStore only on native platforms
if (Platform.OS !== 'web') {
  SecureStore = require('expo-secure-store');
}

export async function getItemAsync(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  return SecureStore!.getItemAsync(key);
}

export async function setItemAsync(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(key, value);
    } catch {
      // localStorage might be full or blocked
    }
    return;
  }
  return SecureStore!.setItemAsync(key, value);
}

export async function deleteItemAsync(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
    return;
  }
  return SecureStore!.deleteItemAsync(key);
}
