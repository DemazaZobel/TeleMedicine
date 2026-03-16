// src/types/auth.ts

export type Role = "PATIENT" | "DOCTOR" | "ADMIN";

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
  is_verified: boolean;
  is_doctor_approved: boolean;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

// React Navigation Types
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  OTPVerification: { email: string };
  PatientMainTabs: undefined;
  DoctorMainTabs: undefined;
  DoctorPendingApproval: undefined;
};
