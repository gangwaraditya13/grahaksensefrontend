import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState } from '@/shared/types/auth';
import { Role, UserResponseDto } from '@/shared/types/api';
import {
  setMemoryAccessToken,
  registerRefreshTokenHandler,
  apiClient,
  API_ENDPOINTS,
} from '@/shared/api/client';
import { queryClient } from '@/shared/api/queryClient';

// Helper to check if persisted refreshToken exists on startup
function hasInitialRefreshToken(): boolean {
  try {
    const raw = localStorage.getItem('grahaksense-auth-session');
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed?.state?.refreshToken);
  } catch {
    return false;
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      roles: [],
      isAuthenticated: false,
      isLoading: false,
      isSessionRestoring: hasInitialRefreshToken(),
      accessToken: null, // Strictly stored in memory
      refreshToken: null, // Persisted for session restoration

      setTokens: (accessToken: string, refreshToken?: string) => {
        setMemoryAccessToken(accessToken);
        set((state) => ({
          accessToken,
          refreshToken: refreshToken !== undefined ? refreshToken : state.refreshToken,
          isAuthenticated: true,
          isSessionRestoring: false,
        }));
      },

      setUser: (user: UserResponseDto) => {
        // Normalize roles: filter only valid roles USER, SELLER, ADMIN
        const validRoles = (user.roles || []).filter(
          (r): r is Role => r === 'USER' || r === 'SELLER' || r === 'ADMIN'
        );

        set({
          user,
          roles: validRoles.length > 0 ? validRoles : ['USER'],
          isAuthenticated: true,
          isSessionRestoring: false,
        });
      },

      setSessionRestoring: (status: boolean) => {
        set({ isSessionRestoring: status });
      },

      hasRole: (requiredRole: Role | Role[]): boolean => {
        const currentRoles = get().roles;
        if (!currentRoles || currentRoles.length === 0) return false;

        if (Array.isArray(requiredRole)) {
          return requiredRole.some((r) => currentRoles.includes(r));
        }
        return currentRoles.includes(requiredRole);
      },

      canAccessStorefront: (): boolean => {
        const { isAuthenticated, roles, accessToken } = get();
        if (!isAuthenticated || !accessToken) return false;
        // Backend requirement: must possess USER role (or SELLER holding customer privileges)
        return roles.includes('USER') || roles.includes('SELLER');
      },

      logout: async () => {
        try {
          // Telemetry: Log LOGOUT event
          const currentUserId = get().user?.id || 1;
          await apiClient.post(API_ENDPOINTS.PUBLIC.ACTIVITY, {
            userId: currentUserId,
            event: 'LOGOUT',
          });
        } catch {
          // Telemetry is non-blocking
        }

        try {
          // Attempt backend logout notice if authenticated
          await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {});
        } catch {
          // Continue client-side logout even if backend fails
        } finally {
          // Purge protected product and account queries from TanStack Query cache
          queryClient.removeQueries({ queryKey: ['products'] });
          queryClient.removeQueries({ queryKey: ['seller-products'] });
          queryClient.removeQueries({ queryKey: ['admin-products'] });
          queryClient.removeQueries({ queryKey: ['admin-activities'] });
          queryClient.removeQueries({ queryKey: ['cart'] });

          get().clearAuth();
        }
      },

      clearAuth: () => {
        setMemoryAccessToken(null);
        set({
          user: null,
          roles: [],
          isAuthenticated: false,
          isSessionRestoring: false,
          accessToken: null,
          refreshToken: null,
        });
      },
    }),
    {
      name: 'grahaksense-auth-session',
      // Only persist refreshToken and user metadata; accessToken remains strictly in memory
      partialize: (state) => ({
        user: state.user,
        roles: state.roles,
        refreshToken: state.refreshToken,
      }),
    }
  )
);

// Register refresh token handler with the API client
registerRefreshTokenHandler(async (): Promise<string | null> => {
  const { refreshToken, setTokens, clearAuth } = useAuthStore.getState();
  if (!refreshToken) {
    clearAuth();
    return null;
  }

  try {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH, {
      refreshToken,
    });

    const newAccessToken =
      response.data?.jwtToken || response.data?.token || response.data?.accessToken;
    const newRefreshToken = response.data?.refreshToken || refreshToken;

    if (newAccessToken) {
      setTokens(newAccessToken, newRefreshToken);
      return newAccessToken;
    }
    clearAuth();
    return null;
  } catch {
    clearAuth();
    return null;
  }
});
