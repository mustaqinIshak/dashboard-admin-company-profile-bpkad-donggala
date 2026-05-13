import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '../types';

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
  setUser: (user: AuthUser) => void;
  // Role helpers (RBAC — tetap tersedia untuk backward-compat)
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  // Permission helpers (PBAC — gunakan ini untuk keputusan UI)
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setAuth: (token, user) => {
        localStorage.setItem('auth_token', token);
        set({ token, user, isAuthenticated: true });
      },

      clearAuth: () => {
        localStorage.removeItem('auth_token');
        set({ token: null, user: null, isAuthenticated: false });
      },

      setUser: (user) => set({ user }),

      // ── Role helpers ─────────────────────────────────────────────────
      hasRole: (role) =>
        get().user?.roles?.some((r) => r.name === role) ?? false,

      hasAnyRole: (roles) =>
        get().user?.roles?.some((r) => roles.includes(r.name)) ?? false,

      // ── Permission helpers (PBAC) ─────────────────────────────────────
      /**
       * Cek apakah user memiliki permission tertentu.
       * Gunakan konstanta dari src/lib/permissions.ts, bukan string literal.
       *
       * @example
       *   const { hasPermission } = useAuthStore();
       *   if (hasPermission(MANAGE_BERITA)) { ... }
       */
      hasPermission: (permission) =>
        get().user?.permissions?.includes(permission) ?? false,

      /**
       * Cek apakah user memiliki setidaknya satu dari permission yang diberikan.
       *
       * @example
       *   if (hasAnyPermission([VIEW_SURAT_KELUAR, MANAGE_SURAT_KELUAR])) { ... }
       */
      hasAnyPermission: (permissions) => {
        const userPerms = get().user?.permissions ?? [];
        return permissions.some((p) => userPerms.includes(p));
      },

      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);
