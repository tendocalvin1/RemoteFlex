import axios from "axios";
import useAuthStore from "@/store/authStore";
import { getCsrfToken } from "@/lib/csrf";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

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
    const isLoginCall = originalRequest?.url?.includes("/users/login");

    if (error.response?.status === 401 && !originalRequest?._retry && !isRefreshCall && !isLoginCall) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest._retry = true;
            if (token && ["POST", "PUT", "PATCH", "DELETE"].includes(originalRequest.method?.toUpperCase())) {
              originalRequest.headers["X-CSRF-Token"] = token;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/users/refresh-token`,
          {},
          {
            withCredentials: true,
            headers: { "X-CSRF-Token": getCsrfToken() || "" },
          }
        );

        const newCsrfToken = refreshResponse.data?.csrfToken;
        if (typeof window !== "undefined" && newCsrfToken) {
          window.localStorage.setItem("csrfToken", newCsrfToken);
        }

        processQueue(null, newCsrfToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        console.error("Token refresh failed:", refreshError);
        
        const { logout } = useAuthStore.getState();
        logout();

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
