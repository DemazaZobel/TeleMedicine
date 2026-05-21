import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const ACCESS = "medlink_access_token";
const REFRESH = "medlink_refresh_token";

// expo-secure-store does not work on web — fall back to localStorage
const setItem = async (key: string, value: string): Promise<void> => {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
};

const getItem = async (key: string): Promise<string | null> => {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
};

const removeItem = async (key: string): Promise<void> => {
  if (Platform.OS === "web") {
    localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
};

export const saveTokens = async (access: string, refresh: string) => {
  await setItem(ACCESS, access);
  await setItem(REFRESH, refresh);
};

export const getAccess = () => getItem(ACCESS);
export const getRefresh = () => getItem(REFRESH);

export const clearTokens = async () => {
  await removeItem(ACCESS);
  await removeItem(REFRESH);
};
