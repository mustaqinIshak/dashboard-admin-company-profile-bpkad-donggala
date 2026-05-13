import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '../types';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser) => void;
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
      user: null,
      isAuthenticated: false,

      setAuth: (user) => {
        set({ user, isAuthenticated: true });
      },

      clearAuth: () => {
        // Remove legacy key that may exist from older sessions
        localStorage.removeItem('auth_token');
        set({ user: null, isAuthenticated: false });
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
