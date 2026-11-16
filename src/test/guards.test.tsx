import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RequireAuth } from '@/app/guards/RequireAuth';
import { RequireRole } from '@/app/guards/RequireRole';
import { RoleGate } from '@/app/guards/RoleGate';
import { useAuthStore } from '@/features/auth/store/authStore';

describe('Role-Based Access Control Guards', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
  });

  it('RequireAuth redirects unauthenticated visitors to /login with returnTo', () => {
    render(
      <MemoryRouter initialEntries={['/cart']}>
        <Routes>
          <Route
            path="/cart"
            element={
              <RequireAuth>
                <div>Secret Cart Content</div>
              </RequireAuth>
            }
          />
          <Route path="/login" element={<div>Login Page Target</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText('Secret Cart Content')).not.toBeInTheDocument();
    expect(screen.getByText('Login Page Target')).toBeInTheDocument();
  });

  it('RequireAuth permits authenticated users through', () => {
    useAuthStore.getState().setTokens('test-token');
    useAuthStore.getState().setUser({
      id: 1,
      name: 'John',
      userName: 'john',
      email: 'john@example.com',
      roles: ['USER'],
      status: true,
      createdAt: '',
      updatedAt: '',
    });

    render(
      <MemoryRouter initialEntries={['/cart']}>
        <Routes>
          <Route
            path="/cart"
            element={
              <RequireAuth>
                <div>Secret Cart Content</div>
              </RequireAuth>
            }
          />
          <Route path="/login" element={<div>Login Page Target</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Secret Cart Content')).toBeInTheDocument();
  });

  it('RequireRole redirects authenticated users without the role to /403', () => {
    useAuthStore.getState().setTokens('test-token');
    useAuthStore.getState().setUser({
      id: 2,
      name: 'Jane User',
      userName: 'jane',
      email: 'jane@example.com',
      roles: ['USER'], // Only USER, not SELLER
      status: true,
      createdAt: '',
      updatedAt: '',
    });

    render(
      <MemoryRouter initialEntries={['/seller']}>
        <Routes>
          <Route
            path="/seller"
            element={
              <RequireRole role="SELLER">
                <div>Seller Studio Workspace</div>
              </RequireRole>
            }
          />
          <Route path="/403" element={<div>Access Forbidden 403</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText('Seller Studio Workspace')).not.toBeInTheDocument();
    expect(screen.getByText('Access Forbidden 403')).toBeInTheDocument();
  });

  it('RoleGate renders children conditionally based on roles', () => {
    useAuthStore.getState().setUser({
      id: 3,
      name: 'Admin Dave',
      userName: 'dave',
      email: 'dave@admin.com',
      roles: ['ADMIN'],
      status: true,
      createdAt: '',
      updatedAt: '',
    });

    render(
      <MemoryRouter>
        <RoleGate role="ADMIN">
          <div>Admin Only Action Button</div>
        </RoleGate>
        <RoleGate role="SELLER">
          <div>Seller Only Action Button</div>
        </RoleGate>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin Only Action Button')).toBeInTheDocument();
    expect(screen.queryByText('Seller Only Action Button')).not.toBeInTheDocument();
  });
});
