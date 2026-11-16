import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/features/auth/store/authStore';
import { getMemoryAccessToken } from '@/shared/api/client';

describe('Authentication & Role-Based Access Control Store', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
  });

  it('initializes with unauthenticated guest state', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.roles).toEqual([]);
    expect(state.accessToken).toBeNull();
  });

  it('stores access token in memory and synchronizes with API client', () => {
    useAuthStore.getState().setTokens('jwt-sample-token-123', 'refresh-sample-token-456');

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('jwt-sample-token-123');
    expect(state.refreshToken).toBe('refresh-sample-token-456');
    expect(state.isAuthenticated).toBe(true);

    // Verify memory accessor for Axios interceptor
    expect(getMemoryAccessToken()).toBe('jwt-sample-token-123');
  });

  it('calculates single role permissions correctly', () => {
    useAuthStore.getState().setUser({
      id: 101,
      name: 'Customer Alice',
      userName: 'alice',
      email: 'alice@example.com',
      roles: ['USER'],
      status: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    });

    const store = useAuthStore.getState();
    expect(store.hasRole('USER')).toBe(true);
    expect(store.hasRole('SELLER')).toBe(false);
    expect(store.hasRole('ADMIN')).toBe(false);
  });

  it('calculates multiple simultaneous roles correctly (USER + SELLER)', () => {
    useAuthStore.getState().setUser({
      id: 202,
      name: 'Merchant Bob',
      userName: 'bob_seller',
      email: 'bob@merchant.com',
      roles: ['USER', 'SELLER'],
      status: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    });

    const store = useAuthStore.getState();
    expect(store.hasRole('USER')).toBe(true);
    expect(store.hasRole('SELLER')).toBe(true);
    expect(store.hasRole('ADMIN')).toBe(false);
    expect(store.hasRole(['SELLER', 'ADMIN'])).toBe(true);
  });

  it('omits ANALYST role even if present in backend response', () => {
    useAuthStore.getState().setUser({
      id: 303,
      name: 'Charlie',
      userName: 'charlie',
      email: 'charlie@example.com',
      // Backend sent ANALYST
      roles: ['USER', 'ANALYST'] as any,
      status: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    });

    const store = useAuthStore.getState();
    expect(store.roles).toEqual(['USER']);
    expect(store.roles).not.toContain('ANALYST');
  });

  it('clears all session and memory tokens upon logout', () => {
    useAuthStore.getState().setTokens('token-123', 'refresh-456');
    useAuthStore.getState().clearAuth();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(getMemoryAccessToken()).toBeNull();
  });
});
