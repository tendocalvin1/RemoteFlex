import axios from "axios";
import useAuthStore from "@/store/authStore";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://remoteflex.onrender.com/api",
  withCredentials: true,
  xsrfCookieName: "csrfToken",
  xsrfHeaderName: "X-CSRF-Token",
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

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
          .then(() => {
            originalRequest._retry = true;
            if (originalRequest.headers) {
              delete originalRequest.headers["X-CSRF-Token"];
              delete originalRequest.headers["x-csrf-token"];
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/users/refresh-token`,
          {},
          {
            withCredentials: true,
            xsrfCookieName: "csrfToken",
            xsrfHeaderName: "X-CSRF-Token",
          }
        );

        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
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
