"use client";

import { useEffect, useRef } from "react";
import axios from "axios";
import useAuthStore from "@/store/authStore";
import { getCsrfToken } from "@/lib/csrf";

let refreshPromise = null;

export function useAuth() {
  const { user, isLoading, error, setAuth, logout, setLoading, setError, clearError } = useAuthStore();
  const hasTriedRefresh = useRef(false);

  const isAuthenticated = !!user;

  useEffect(() => {
    if (user || isLoading || hasTriedRefresh.current) {
      return;
    }

    hasTriedRefresh.current = true;
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
      .then(async (refreshResponse) => {
        if (typeof window !== "undefined" && refreshResponse.data?.csrfToken) {
          window.localStorage.setItem("csrfToken", refreshResponse.data.csrfToken);
        }
        const currentUser = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/users/currentUser`,
          {
            withCredentials: true,
          }
        );
        setAuth(currentUser.data);
      })
      .catch(() => {
        logout();
      })
      .finally(() => {
        refreshPromise = null;
        setLoading(false);
      });
  }, [isLoading, logout, setAuth, setLoading, user]);

  return {
    user,
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
