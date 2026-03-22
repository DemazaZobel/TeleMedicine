import { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../store/authStore';
import type { RegisterRequest, UserRole } from '../../../types';

export function useRegister() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [validationError, setValidationError] = useState('');

  const handleRegister = useCallback(
    async (data: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      role: UserRole;
    }) => {
      setValidationError('');

      if (!data.firstName.trim()) {
        setValidationError('First name is required');
        return;
      }
      if (!data.lastName.trim()) {
        setValidationError('Last name is required');
        return;
      }
      if (!data.email.trim()) {
        setValidationError('Email is required');
        return;
      }
      if (data.password.length < 6) {
        setValidationError('Password must be at least 6 characters');
        return;
      }

      const payload: RegisterRequest = {
        first_name: data.firstName.trim(),
        last_name: data.lastName.trim(),
        email: data.email.trim(),
        password: data.password,
        role: data.role,
      };

      await register(payload);

      router.push({
        pathname: '/(auth)/verify-email',
        params: { email: data.email.trim() },
      });
    },
    [register, router]
  );

  return {
    handleRegister,
    isLoading,
    error: validationError || error,
    clearError: () => {
      setValidationError('');
      clearError();
    },
  };
}
