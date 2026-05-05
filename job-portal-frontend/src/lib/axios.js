import axios from "axios";
import useAuthStore from "@/store/authStore";
import { getCsrfToken } from "@/lib/csrf";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const method = config.method?.toUpperCase();
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        config.headers["X-CSRF-Token"] = csrfToken;
      }
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isRefreshCall = originalRequest?.url?.includes("/users/refresh-token");

    if (error.response?.status === 401 && !originalRequest?._retry && !isRefreshCall) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/users/refresh-token`,
          {},
          {
            withCredentials: true,
            headers: { "X-CSRF-Token": getCsrfToken() || "" },
          }
        );

        if (typeof window !== "undefined" && refreshResponse.data?.csrfToken) {
          window.localStorage.setItem("csrfToken", refreshResponse.data.csrfToken);
        }

        return api(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        
        const { logout } = useAuthStore.getState();
        logout();

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
