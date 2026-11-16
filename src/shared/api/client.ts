import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { handleApiError } from './errorHandler';
import { API_ENDPOINTS } from './endpoints';

export { API_ENDPOINTS };

const envBaseUrl = import.meta.env.VITE_API_BASE_URL;

// In local development, use relative paths so the Vite dev server proxy seamlessly
// forwards API requests to https://grahaksensemono.onrender.com, bypassing browser CORS restrictions.
const rawBaseUrl =
  import.meta.env.DEV && (!envBaseUrl || envBaseUrl === 'https://grahaksensemono.onrender.com')
    ? ''
    : (envBaseUrl || 'https://grahaksensemono.onrender.com');

// Ensure base URL does not have trailing slash for predictable route concatenation
export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

// Central in-memory token accessor to avoid circular dependencies
let currentAccessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

// Cold-start listener callback (registered by UI)
type ColdStartListener = (isWakingUp: boolean) => void;
const coldStartListeners = new Set<ColdStartListener>();

export function subscribeToColdStart(listener: ColdStartListener): () => void {
  coldStartListeners.add(listener);
  return () => coldStartListeners.delete(listener);
}

function notifyColdStart(isWaking: boolean) {
  coldStartListeners.forEach((fn) => fn(isWaking));
}

export function setMemoryAccessToken(token: string | null) {
  currentAccessToken = token;
}

export function getMemoryAccessToken(): string | null {
  return currentAccessToken;
}

// Token refresher hook injected by auth store
let refreshTokenHandler: (() => Promise<string | null>) | null = null;

export function registerRefreshTokenHandler(handler: () => Promise<string | null>) {
  refreshTokenHandler = handler;
}

/**
 * Standard API Axios Client
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30000, // 30 seconds to allow for Render cold starts
});

/**
 * Cold start tracking timer map
 */
const activeTimers = new Map<InternalAxiosRequestConfig, ReturnType<typeof setTimeout>>();

apiClient.interceptors.request.use((config) => {
  // Attach JWT Bearer token if present
  if (currentAccessToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${currentAccessToken}`;
  }

  // Set cold-start timer: if request takes > 6000ms, trigger cold-start banner
  const timer = setTimeout(() => {
    notifyColdStart(true);
  }, 6000);

  activeTimers.set(config, timer);
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    // Clear cold-start timer
    const timer = activeTimers.get(response.config);
    if (timer) {
      clearTimeout(timer);
      activeTimers.delete(response.config);
    }
    // If all timers cleared, notify cold start resolved
    if (activeTimers.size === 0) {
      notifyColdStart(false);
    }
    return response;
  },
  async (error: AxiosError) => {
    if (error.config) {
      const timer = activeTimers.get(error.config);
      if (timer) {
        clearTimeout(timer);
        activeTimers.delete(error.config);
      }
    }
    if (activeTimers.size === 0) {
      notifyColdStart(false);
    }

    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 401 Unauthorized handling: attempt silent token refresh once
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!refreshPromise && refreshTokenHandler) {
        refreshPromise = refreshTokenHandler().finally(() => {
          refreshPromise = null;
        });
      }

      if (refreshPromise) {
        const newAccessToken = await refreshPromise;
        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        }
      }
    }

    // Centralized error notification
    handleApiError(error);
    return Promise.reject(error);
  }
);

/**
 * Pre-signed S3 Direct Upload Helper
 * Directly uploads the binary file to AWS S3 using the pre-signed URL returned
 * from the /product/upload-url endpoint.
 * Strictly avoids attaching backend Authorization or application headers.
 */
export async function uploadToS3(
  uploadUrl: string,
  file: File,
  contentTypeOrOnProgress?: string | ((percent: number) => void),
  onProgress?: (percent: number) => void
): Promise<void> {
  const resolvedContentType =
    typeof contentTypeOrOnProgress === 'string'
      ? contentTypeOrOnProgress
      : (file.type || 'image/jpeg');
  const progressCallback =
    typeof contentTypeOrOnProgress === 'function' ? contentTypeOrOnProgress : onProgress;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', resolvedContentType);

    // If presigned URL signed cache-control, attach the signed Cache-Control header
    if (uploadUrl.toLowerCase().includes('cache-control')) {
      xhr.setRequestHeader('Cache-Control', 'public, max-age=31536000');
    }

    if (xhr.upload && progressCallback) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          progressCallback(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(
          new Error(
            `S3 upload failed with HTTP ${xhr.status}: ${xhr.statusText || 'Upload rejected'}`
          )
        );
      }
    };

    xhr.onerror = () => {
      reject(
        new Error(
          'Network or CORS error uploading directly to S3. Please verify bucket CORS or connection.'
        )
      );
    };

    xhr.send(file);
  });
}
