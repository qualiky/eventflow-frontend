import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { authApi } from "@/lib/api";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role?: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { token, user } = await authApi.login({ email, password });
          set({ token, user });
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (email, password, name, role) => {
        set({ isLoading: true });
        try {
          const { token, user } = await authApi.register({ email, password, name, role });
          set({ token, user });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => set({ user: null, token: null }),

      refreshMe: async () => {
        const { token } = get();
        if (!token) return;
        const user = await authApi.me(token);
        set({ user });
      },
    }),
    { name: "eventflow-auth", partialize: (s) => ({ user: s.user, token: s.token }) },
  ),
);
