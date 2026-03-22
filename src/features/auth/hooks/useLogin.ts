import { useCallback, useState } from 'react';
import { useAuthStore } from '../../../store/authStore';
import type { LoginRequest } from '../../../types';

export function useLogin() {
  const { login, isLoading, error, clearError } = useAuthStore();
  const [validationError, setValidationError] = useState('');

  const handleLogin = useCallback(
    async (credentials: LoginRequest) => {
      setValidationError('');

      if (!credentials.email.trim()) {
        setValidationError('Email is required');
        return;
      }
      if (!credentials.password) {
        setValidationError('Password is required');
        return;
      }

      await login(credentials);
    },
    [login]
  );

  return {
    handleLogin,
    isLoading,
    error: validationError || error,
    clearError: () => {
      setValidationError('');
      clearError();
    },
  };
}
