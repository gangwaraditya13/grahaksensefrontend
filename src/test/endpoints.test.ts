import { describe, it, expect } from 'vitest';
import { API_ENDPOINTS } from '@/shared/api/endpoints';
import { API_BASE_URL } from '@/shared/api/client';

describe('Centralized API Endpoints Configuration', () => {
  it('defines correct base URL without trailing slash', () => {
    expect(API_BASE_URL).toBeDefined();
    expect(API_BASE_URL.endsWith('/')).toBe(false);
  });

  describe('AUTH Endpoints', () => {
    it('matches OpenAPI auth paths', () => {
      expect(API_ENDPOINTS.AUTH.LOGIN).toBe('/auth/login');
      expect(API_ENDPOINTS.AUTH.SIGNUP).toBe('/auth/signup');
      expect(API_ENDPOINTS.AUTH.SELLER_REGISTER).toBe('/auth/seller');
      expect(API_ENDPOINTS.AUTH.FORGOT_PASSWORD).toBe('/auth/forget/password');
      expect(API_ENDPOINTS.AUTH.FORGOT_PASSWORD_FALLBACK).toBe('/auth/fotget/password');
      expect(API_ENDPOINTS.AUTH.RESET_PASSWORD).toBe('/auth/reset/password');
      expect(API_ENDPOINTS.AUTH.REFRESH).toBe('/auth/refresh');
      expect(API_ENDPOINTS.AUTH.LOGOUT).toBe('/auth/logout');
    });
  });

  describe('PUBLIC Endpoints', () => {
    it('constructs dynamic and static public paths correctly', () => {
      expect(API_ENDPOINTS.PUBLIC.ALL_PRODUCTS).toBe('/public/all');
      expect(API_ENDPOINTS.PUBLIC.PRODUCT_BY_ID(42)).toBe('/public/42');
      expect(API_ENDPOINTS.PUBLIC.PRODUCTS_BY_SELLER(7)).toBe('/public/7');
      expect(API_ENDPOINTS.PUBLIC.ACTIVITY).toBe('/public/activity');
    });
  });

  describe('PRODUCT Endpoints', () => {
    it('constructs product management paths correctly', () => {
      expect(API_ENDPOINTS.PRODUCT.ALL).toBe('/product/all');
      expect(API_ENDPOINTS.PRODUCT.BY_ID(101)).toBe('/product/101');
      expect(API_ENDPOINTS.PRODUCT.BY_SELLER(5)).toBe('/product/seller/5');
      expect(API_ENDPOINTS.PRODUCT.CREATE).toBe('/product/create');
      expect(API_ENDPOINTS.PRODUCT.UPDATE).toBe('/product/update');
      expect(API_ENDPOINTS.PRODUCT.UPLOAD_URL).toBe('/product/upload-url');
      expect(API_ENDPOINTS.PRODUCT.DELETE_BY_ID(101)).toBe('/product/101');
      expect(API_ENDPOINTS.PRODUCT.DELETE).toBe('/product');
    });
  });

  describe('CART Endpoints', () => {
    it('constructs cart operations correctly', () => {
      expect(API_ENDPOINTS.CART.BY_USER_ID(12)).toBe('/cart/12');
      expect(API_ENDPOINTS.CART.CREATE).toBe('/cart/create');
      expect(API_ENDPOINTS.CART.UPDATE).toBe('/cart/update');
      expect(API_ENDPOINTS.CART.DELETE_BY_ID(99)).toBe('/cart/99');
      expect(API_ENDPOINTS.CART.GET_ALL).toBe('/cart/get-all');
    });
  });

  describe('SELLER Endpoints', () => {
    it('constructs seller profile and listing paths correctly', () => {
      expect(API_ENDPOINTS.SELLER.BY_USER_ID(3)).toBe('/seller/3');
      expect(API_ENDPOINTS.SELLER.CREATE).toBe('/seller/create');
      expect(API_ENDPOINTS.SELLER.UPDATE).toBe('/seller/update');
      expect(API_ENDPOINTS.SELLER.DELETE).toBe('/seller');
      expect(API_ENDPOINTS.SELLER.GET_ALL).toBe('/seller/all');
    });
  });

  describe('USER Endpoints', () => {
    it('constructs user paths and handles special characters in username', () => {
      expect(API_ENDPOINTS.USER.BY_USERNAME('john_doe')).toBe('/user/john_doe');
      expect(API_ENDPOINTS.USER.BY_USERNAME('user with spaces')).toBe(
        '/user/user%20with%20spaces'
      );
      expect(API_ENDPOINTS.USER.SIGNUP).toBe('/user/signup');
      expect(API_ENDPOINTS.USER.UPDATE).toBe('/user/update');
      expect(API_ENDPOINTS.USER.DELETE).toBe('/user/delete');
      expect(API_ENDPOINTS.USER.GET_ALL).toBe('/user/all/users');
      expect(API_ENDPOINTS.USER.GET_URL('test-key')).toBe('/user/url?key=test-key');
    });
  });

  describe('ACTIVITY Endpoints', () => {
    it('matches telemetry paths', () => {
      expect(API_ENDPOINTS.ACTIVITY.CREATE).toBe('/activity/create');
      expect(API_ENDPOINTS.ACTIVITY.GET_ALL).toBe('/activity/activities');
    });
  });
});
