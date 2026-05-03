"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";

export function useProtectedRoute(requiredRole = null) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (requiredRole && user?.role !== requiredRole) {
      router.push("/");
      return;
    }
  }, [isAuthenticated, isLoading, user, requiredRole, router]);

  return { user, isAuthenticated, isLoading };
}
