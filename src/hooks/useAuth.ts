import { useAuthStore } from "@/store/auth.store";

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isLoading = useAuthStore((s) => s.isLoading);
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const logout = useAuthStore((s) => s.logout);

  return {
    user,
    token,
    isLoading,
    isAuthenticated: !!token,
    isOrganiser: user?.role === "ORGANISER" || user?.role === "ADMIN",
    login,
    register,
    logout,
  };
}
