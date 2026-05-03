"use client";

import { useEffect } from "react";
import axios from "axios";
import useAuthStore from "@/store/authStore";
import { getCsrfToken } from "@/lib/csrf";

let refreshPromise = null;

export function useAuth() {
  const { user, accessToken, isLoading, error, setAuth, logout, setLoading, setError, clearError } = useAuthStore();

  const isAuthenticated = !!user && !!accessToken;

  useEffect(() => {
    if (!user || accessToken || isLoading) {
      return;
    }

    setLoading(true);

    refreshPromise ??= axios
      .post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/users/refresh-token`,
        {},
        {
          withCredentials: true,
          headers: { "X-CSRF-Token": getCsrfToken() || "" },
        }
      )
      .then(async ({ data }) => {
        const currentUser = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/users/currentUser`,
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${data.accessToken}` },
          }
        );
        setAuth(currentUser.data, data.accessToken);
      })
      .catch(() => {
        logout();
      })
      .finally(() => {
        refreshPromise = null;
        setLoading(false);
      });
  }, [accessToken, isLoading, logout, setAuth, setLoading, user]);

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
