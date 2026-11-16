import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { useAuthStore } from '@/features/auth/store/authStore';
import { catalogApi } from '@/features/catalog/api/catalogApi';
import { queryClient } from '@/shared/api/queryClient';
import { apiClient } from '@/shared/api/client';

// Mock catalogApi
vi.mock('@/features/catalog/api/catalogApi', () => ({
  catalogApi: {
    getAllProducts: vi.fn(),
    getProductById: vi.fn(),
    logActivity: vi.fn(),
  },
}));

function renderHomePage() {
  const testClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={testClient}>
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('Landing Page Product Loading & Authentication-Based API Access', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(apiClient, 'post').mockResolvedValue({ data: {} });
    useAuthStore.getState().clearAuth();
    queryClient.clear();
  });

  it('Scenario 1 & 2: Guest visitor sees sign-in prompt and NO protected product API call is made', async () => {
    renderHomePage();

    // Verify member catalog prompt is displayed
    expect(
      screen.getByRole('heading', { name: /Sign in to Discover Curated Luxury/i })
    ).toBeVisible();
    expect(
      screen.getByText(/Our verified artisan marketplace and direct merchant pricing/i)
    ).toBeVisible();
    expect(screen.getByRole('link', { name: /Sign In to Browse/i })).toBeVisible();

    // CRITICAL: Ensure protected product API was NEVER called
    expect(catalogApi.getAllProducts).not.toHaveBeenCalled();
  });

  it('Scenario 3: Authenticated USER triggers product query and renders real backend products', async () => {
    const mockProducts = [
      {
        id: 10,
        sellerId: 1,
        productName: 'Authentic Banarasi Saree',
        productDescription: 'Finest zari embroidery.',
        price: 15000,
        discount: 10,
        adminDiscount: 0,
        imageUrls: ['https://cdn.example.com/saree.jpg'],
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    ];

    vi.mocked(catalogApi.getAllProducts).mockResolvedValue(mockProducts);

    // Simulate logged-in USER
    useAuthStore.getState().setTokens('valid-jwt-token');
    useAuthStore.getState().setUser({
      id: 5,
      name: 'Priya Sharma',
      userName: 'priya',
      email: 'priya@example.com',
      roles: ['USER'],
      status: true,
      createdAt: '',
      updatedAt: '',
    });

    renderHomePage();

    // Verify product API WAS called with auth
    await waitFor(() => {
      expect(catalogApi.getAllProducts).toHaveBeenCalled();
    });

    // Verify real product is rendered in the UI
    await waitFor(() => {
      const elements = screen.getAllByText('Authentic Banarasi Saree');
      expect(elements.length).toBeGreaterThan(0);
      expect(elements[0]).toBeVisible();
    });
  });

  it('Scenario 4: USER page refresh restores session before product fetching is enabled', () => {
    // When refreshToken exists in storage, isSessionRestoring is true
    useAuthStore.getState().setSessionRestoring(true);

    renderHomePage();

    // While session is restoring, no product API call must be triggered
    expect(catalogApi.getAllProducts).not.toHaveBeenCalled();
  });

  it('Scenario 5: USER logout purges protected data and returns to guest landing state', async () => {
    // Set authenticated state
    useAuthStore.getState().setTokens('token-123');
    useAuthStore.getState().setUser({
      id: 1,
      name: 'User 1',
      userName: 'user1',
      email: 'user1@example.com',
      roles: ['USER'],
      status: true,
      createdAt: '',
      updatedAt: '',
    });

    // Logout
    await useAuthStore.getState().logout();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().accessToken).toBeNull();

    renderHomePage();

    // Guest sign-in banner reappears
    expect(
      screen.getByRole('heading', { name: /Sign in to Discover Curated Luxury/i })
    ).toBeVisible();
    expect(catalogApi.getAllProducts).not.toHaveBeenCalled();
  });

  it('Scenario 6: Authenticated SELLER with customer privileges can browse storefront', async () => {
    vi.mocked(catalogApi.getAllProducts).mockResolvedValue([]);

    useAuthStore.getState().setTokens('seller-jwt');
    useAuthStore.getState().setUser({
      id: 8,
      name: 'Merchant Vikram',
      userName: 'vikram_seller',
      email: 'vikram@store.com',
      roles: ['USER', 'SELLER'],
      status: true,
      createdAt: '',
      updatedAt: '',
    });

    renderHomePage();

    // Verify storefront product query is authorized for SELLER holding customer privileges
    await waitFor(() => {
      expect(catalogApi.getAllProducts).toHaveBeenCalled();
    });
  });

  it('Scenario 7: Authenticated ADMIN without USER role does NOT call customer product endpoints and sees Role Notice', () => {
    useAuthStore.getState().setTokens('admin-jwt');
    useAuthStore.getState().setUser({
      id: 99,
      name: 'Admin Master',
      userName: 'admin_master',
      email: 'admin@grahaksense.com',
      roles: ['ADMIN'], // Strictly ADMIN only
      status: true,
      createdAt: '',
      updatedAt: '',
    });

    renderHomePage();

    // Verify product endpoint was NOT called
    expect(catalogApi.getAllProducts).not.toHaveBeenCalled();

    // Verify friendly Role Notice is displayed
    expect(screen.getByText(/Role Permission Notice/i)).toBeVisible();
    expect(screen.getByRole('link', { name: /Open Admin Portal/i })).toBeVisible();
  });

  it('Scenario 10: Empty product response renders friendly empty catalog state', async () => {
    vi.mocked(catalogApi.getAllProducts).mockResolvedValue([]);

    useAuthStore.getState().setTokens('user-jwt');
    useAuthStore.getState().setUser({
      id: 1,
      name: 'User',
      userName: 'user',
      email: 'user@example.com',
      roles: ['USER'],
      status: true,
      createdAt: '',
      updatedAt: '',
    });

    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText(/No Products Published Yet/i)).toBeVisible();
    });
  });
});
