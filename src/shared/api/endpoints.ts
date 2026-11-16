/**
 * GrahakSense Centralized API Endpoints Configuration
 * Source of Truth: OpenAPI 3.0.1 Specification (CityHub – Grahak Sense API)
 *
 * All frontend API calls must reference this configuration rather than
 * declaring raw endpoint path strings across features.
 */

export const API_ENDPOINTS = {
  /**
   * Authentication & Session Endpoints
   */
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    SELLER_REGISTER: '/auth/seller',
    FORGOT_PASSWORD: '/auth/forget/password',
    FORGOT_PASSWORD_FALLBACK: '/auth/fotget/password',
    RESET_PASSWORD: '/auth/reset/password',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },

  /**
   * Public Storefront Endpoints
   * Note: Spring Security requires authenticated USER role for catalog access
   */
  PUBLIC: {
    ALL_PRODUCTS: '/public/all',
    PRODUCT_BY_ID: (productId: number | string) => `/public/${productId}`,
    PRODUCTS_BY_SELLER: (sellerId: number | string) => `/public/${sellerId}`,
    ACTIVITY: '/public/activity',
  },

  /**
   * Merchant / Product Management Endpoints
   */
  PRODUCT: {
    ALL: '/product/all',
    BY_ID: (productId: number | string) => `/product/${productId}`,
    BY_SELLER: (sellerId: number | string) => `/product/seller/${sellerId}`,
    CREATE: '/product/create',
    UPDATE: '/product/update',
    UPLOAD_URL: '/product/upload-url',
    DELETE_BY_ID: (productId: number | string) => `/product/${productId}`,
    DELETE: '/product',
  },

  /**
   * Shopping Cart Endpoints
   */
  CART: {
    BY_USER_ID: (userId: number | string) => `/cart/${userId}`,
    CREATE: '/cart/create',
    UPDATE: '/cart/update',
    DELETE_BY_ID: (cartId: number | string) => `/cart/${cartId}`,
    GET_ALL: '/cart/get-all',
  },

  /**
   * Seller Profile & Management Endpoints
   */
  SELLER: {
    BY_USER_ID: (userId: number | string) => `/seller/${userId}`,
    CREATE: '/seller/create',
    UPDATE: '/seller/update',
    DELETE: '/seller',
    GET_ALL: '/seller/all',
  },

  /**
   * User Account & Administration Endpoints
   */
  USER: {
    BY_USERNAME: (userName: string) => `/user/${encodeURIComponent(userName)}`,
    SIGNUP: '/user/signup',
    UPDATE: '/user/update',
    DELETE: '/user/delete',
    GET_ALL: '/user/all/users',
    GET_URL: (key: string) => `/user/url?key=${encodeURIComponent(key)}`,
  },

  /**
   * Activity & Intelligence Telemetry Endpoints
   */
  ACTIVITY: {
    CREATE: '/activity/create',
    GET_ALL: '/activity/activities',
  },
} as const;

export type ApiEndpoints = typeof API_ENDPOINTS;
