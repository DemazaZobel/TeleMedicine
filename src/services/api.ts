import axios from "axios";
import { clearTokens, getAccess, getRefresh, saveTokens } from "./tokenStorage";

const BASE_URL = "https://medlinkethiopia.pythonanywhere.com/api";

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await getAccess();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const refresh = await getRefresh();

        const res = await axios.post(`${BASE_URL}/auth/token/refresh/`, {
          refresh,
        });

        await saveTokens(res.data.access, refresh!);

        original.headers.Authorization = `Bearer ${res.data.access}`;

        return api(original);
      } catch (e) {
        await clearTokens();
      }
    }

    return Promise.reject(error);
  }
);

export default api;
