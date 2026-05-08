import * as SecureStore from "expo-secure-store";

const ACCESS = "access_token";
const REFRESH = "refresh_token";

export const saveTokens = async (access: string, refresh: string) => {
  await SecureStore.setItemAsync(ACCESS, access);
  await SecureStore.setItemAsync(REFRESH, refresh);
};

export const getAccess = () => SecureStore.getItemAsync(ACCESS);
export const getRefresh = () => SecureStore.getItemAsync(REFRESH);

export const clearTokens = async () => {
  await SecureStore.deleteItemAsync(ACCESS);
  await SecureStore.deleteItemAsync(REFRESH);
};
