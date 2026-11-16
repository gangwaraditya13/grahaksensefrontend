import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/app/layouts/RootLayout';
import { SellerLayout } from '@/app/layouts/SellerLayout';
import { AdminLayout } from '@/app/layouts/AdminLayout';
import { RequireAuth } from '@/app/guards/RequireAuth';
import { HomePage } from '@/pages/HomePage';
import { ForbiddenPage } from '@/pages/ForbiddenPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

// Phase 2: Live Authentication & Account Pages
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { SignupPage } from '@/features/auth/pages/SignupPage';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage';
import { AccountPage } from '@/features/account/pages/AccountPage';

// Phase 3: Live Storefront Pages
import { ProductListingPage } from '@/features/catalog/pages/ProductListingPage';
import { ProductDetailPage } from '@/features/catalog/pages/ProductDetailPage';

// Phase 4: Live Cart Page
import { CartPage } from '@/features/cart/pages/CartPage';

// Phase 5: Live Seller Studio Pages
import { SellerDashboardPage } from '@/features/seller/pages/SellerDashboardPage';
import { SellerProductFormPage } from '@/features/seller/pages/SellerProductFormPage';
import { SellerProfilePage } from '@/features/seller/pages/SellerProfilePage';

// Phase 6: Live Admin & Intelligence Pages
import { AdminOverviewPage } from '@/features/admin/pages/AdminOverviewPage';
import { AdminUsersPage } from '@/features/admin/pages/AdminUsersPage';
import { AdminSellersPage } from '@/features/admin/pages/AdminSellersPage';
import { AdminProductsPage } from '@/features/admin/pages/AdminProductsPage';
import { AdminInsightsPage } from '@/features/admin/pages/AdminInsightsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      // Phase 3: Public Storefront Routes
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'products',
        element: <ProductListingPage />,
      },
      {
        path: 'products/:id',
        element: <ProductDetailPage />,
      },

      // Phase 2: Authentication Routes
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'signup',
        element: <SignupPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: 'reset-password',
        element: <ResetPasswordPage />,
      },

      // Phase 4: Customer Cart Route
      {
        path: 'cart',
        element: <CartPage />,
      },
      {
        path: 'account',
        element: (
          <RequireAuth>
            <AccountPage />
          </RequireAuth>
        ),
      },

      // Phase 5: Role-Protected Seller Studio Routes
      {
        path: 'seller',
        element: <SellerLayout />,
        children: [
          {
            index: true,
            element: <SellerDashboardPage />,
          },
          {
            path: 'products/new',
            element: <SellerProductFormPage />,
          },
          {
            path: 'products/:id/edit',
            element: <SellerProductFormPage />,
          },
          {
            path: 'profile',
            element: <SellerProfilePage />,
          },
        ],
      },

      // Phase 6: Role-Protected Admin Workspace Routes
      {
        path: 'admin',
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <AdminOverviewPage />,
          },
          {
            path: 'users',
            element: <AdminUsersPage />,
          },
          {
            path: 'sellers',
            element: <AdminSellersPage />,
          },
          {
            path: 'products',
            element: <AdminProductsPage />,
          },
          {
            path: 'insights',
            element: <AdminInsightsPage />,
          },
        ],
      },

      // Error and Fallback Routes
      {
        path: '403',
        element: <ForbiddenPage />,
      },
      {
        path: '404',
        element: <NotFoundPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
