"use client";

import useAuthStore from "@/store/authStore";

export function useAuth() {
  const { user, accessToken, isLoading, error, setAuth, logout, setLoading, setError, clearError } = useAuthStore();

  const isAuthenticated = !!user && !!accessToken;

  return {
    user,
    accessToken,
    isLoading,
    error,
    isAuthenticated,
    setAuth,
    logout,
    setLoading,
    setError,
    clearError,
  };
}
