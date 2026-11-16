import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { apiClient, API_ENDPOINTS } from '@/shared/api/client';
import { userApi } from '@/features/account/api/userApi';

export function useAuthInit() {
  const {
    refreshToken,
    user,
    setTokens,
    setUser,
    clearAuth,
    setSessionRestoring,
  } = useAuthStore();

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      if (!refreshToken) {
        setSessionRestoring(false);
        return;
      }

      setSessionRestoring(true);

      try {
        // Attempt silent token refresh on app launch
        const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH, {
          refreshToken,
        });

        const newAccessToken =
          response.data?.jwtToken || response.data?.token || response.data?.accessToken;
        const newRefreshToken = response.data?.refreshToken || refreshToken;

        if (newAccessToken && isMounted) {
          setTokens(newAccessToken, newRefreshToken);

          // Refresh user profile and current roles if username is available
          if (user?.userName) {
            try {
              const freshProfile = await userApi.getUserByUserName(user.userName);
              if (isMounted) {
                setUser(freshProfile);
              }
            } catch {
              // Retain current session if profile lookup encounters temporary issue
            }
          }
        } else if (isMounted) {
          clearAuth();
        }
      } catch {
        if (isMounted) {
          clearAuth();
        }
      } finally {
        if (isMounted) {
          setSessionRestoring(false);
        }
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);
}
