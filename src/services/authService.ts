import { LoginResponse } from "../types/auth";
import api from "./api";
import { clearTokens, getRefresh, saveTokens } from "./tokenStorage";

export const register = (data: any) => api.post("/auth/register/", data);

export const verifyOTP = (email: string, code: string) =>
  api.post("/auth/verify-email-otp/", { email, code });

export const resendOTP = (email: string) =>
  api.post("/auth/resend-email-otp/", { email });

export const login = async (email: string, password: string) => {
  const res = await api.post<LoginResponse>("/auth/login/", {
    email,
    password,
  });

  await saveTokens(res.data.access, res.data.refresh);

  return res.data;
};

export const logout = async () => {
  const refresh = await getRefresh();

  await api.post("/auth/logout/", { refresh });

  await clearTokens();
};

export const forgotPassword = (email: string) =>
  api.post("/auth/forgot-password/", { email });

export const resetPassword = (
  email: string,
  code: string,
  new_password: string
) =>
  api.post("/auth/reset-password/", {
    email,
    code,
    new_password,
  });
