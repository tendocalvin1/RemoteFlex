
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isLoading: false,
      error: null,

      setAuth: (user, accessToken) => {
        localStorage.setItem("accessToken", accessToken);
        set({ user, accessToken, error: null });
      },

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      logout: () => {
        localStorage.removeItem("accessToken");
        set({ user: null, accessToken: null, error: null, isLoading: false });
      },
    }),
    {
      name: "auth-storage",
    }
  )
);

export default useAuthStore;