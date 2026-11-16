import { useQuery, useMutation } from '@tanstack/react-query';
import { catalogApi } from '../api/catalogApi';
import { ActivityEventType, ProductResponseDto } from '@/shared/types/api';
import { useAuthStore } from '@/features/auth/store/authStore';

export const CATALOG_QUERY_KEYS = {
  all: (userId?: number | string) => ['products', 'list', userId || 'auth'] as const,
  detail: (id: number, userId?: number | string) =>
    ['products', 'detail', id, userId || 'auth'] as const,
};

export interface UseProductsQueryResult {
  products: ProductResponseDto[];
  isGuest: boolean;
  isSessionRestoring: boolean;
  isForbidden: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  isEmpty: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
}

/**
 * Permission-aware product list query hook
 * Strictly prevents protected backend calls for guests, restoring sessions, or unauthorized roles
 */
export function useProductsQuery(): UseProductsQueryResult {
  const {
    isAuthenticated,
    isSessionRestoring,
    accessToken,
    user,
    canAccessStorefront,
  } = useAuthStore();

  const isGuest = !isAuthenticated && !isSessionRestoring;
  const hasRequiredRole = canAccessStorefront();
  const isForbidden = isAuthenticated && !isSessionRestoring && !hasRequiredRole;

  // Query is strictly enabled only when session is active, token is present, and user has required role
  const canFetch =
    !isSessionRestoring &&
    isAuthenticated &&
    Boolean(accessToken) &&
    hasRequiredRole;

  const query = useQuery<ProductResponseDto[]>({
    queryKey: CATALOG_QUERY_KEYS.all(user?.id),
    queryFn: () => catalogApi.getAllProducts(),
    enabled: canFetch,
    staleTime: 1000 * 60 * 3, // 3 minutes
  });

  const products = query.data || [];
  const isLoading = isSessionRestoring || (canFetch && query.isLoading);
  const isSuccess = canFetch && query.isSuccess;
  const isEmpty = isSuccess && products.length === 0;

  return {
    products,
    isGuest,
    isSessionRestoring,
    isForbidden,
    isLoading,
    isSuccess,
    isEmpty,
    isError: canFetch && query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Specialized Landing Page Product Hook (aliased to centralized permission logic)
 */
export function useLandingProducts(): UseProductsQueryResult {
  return useProductsQuery();
}

/**
 * Permission-aware single product detail query hook
 */
export function useProductDetailQuery(productId: number) {
  const {
    isAuthenticated,
    isSessionRestoring,
    accessToken,
    user,
    canAccessStorefront,
  } = useAuthStore();

  const canFetch =
    !isSessionRestoring &&
    isAuthenticated &&
    Boolean(accessToken) &&
    canAccessStorefront() &&
    Boolean(productId) &&
    !isNaN(productId);

  return useQuery<ProductResponseDto>({
    queryKey: CATALOG_QUERY_KEYS.detail(productId, user?.id),
    queryFn: () => catalogApi.getProductById(productId),
    enabled: canFetch,
  });
}

/**
 * Telemetry activity logging hook
 */
export function useLogActivity() {
  return useMutation({
    mutationFn: ({
      event,
      productId,
    }: {
      event: ActivityEventType;
      productId?: number;
    }) => catalogApi.logActivity(event, productId),
  });
}
