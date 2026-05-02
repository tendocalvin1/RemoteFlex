"use client";

import { useState } from "react";
import api from "@/lib/axios";

export function useAuthenticatedAction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (method, endpoint, data = null) => {
    setLoading(true);
    setError(null);

    try {
      let response;
      if (method === "get") {
        response = await api.get(endpoint);
      } else if (method === "post") {
        response = await api.post(endpoint, data);
      } else if (method === "patch") {
        response = await api.patch(endpoint, data);
      } else if (method === "delete") {
        response = await api.delete(endpoint);
      } else if (method === "put") {
        response = await api.put(endpoint, data);
      }

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || "An error occurred";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return { execute, loading, error, clearError };
}
