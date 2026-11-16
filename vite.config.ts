import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const backendTarget = 'https://grahaksensemono.onrender.com';
const proxyConfig = {
  target: backendTarget,
  changeOrigin: true,
  secure: false,
  headers: {
    origin: backendTarget,
    referer: `${backendTarget}/`,
  },
  // If the browser is requesting an HTML document (SPA page refresh or navigation),
  // serve index.html rather than forwarding to the backend API.
  bypass: (req: any) => {
    if (req.headers.accept?.includes('text/html')) {
      return '/index.html';
    }
  },
  configure: (proxy: any) => {
    proxy.on('proxyReq', (proxyReq: any) => {
      proxyReq.setHeader('origin', backendTarget);
      proxyReq.setHeader('referer', `${backendTarget}/`);
      proxyReq.setHeader('host', 'grahaksensemono.onrender.com');
    });
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/auth': proxyConfig,
      '/Auth': proxyConfig,
      '/public': proxyConfig,
      '/product': proxyConfig,
      '/cart': proxyConfig,
      '/seller': proxyConfig,
      '/user': proxyConfig,
      '/activity': proxyConfig,
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          query: ['@tanstack/react-query', 'axios', 'zustand'],
          recharts: ['recharts'],
          icons: ['lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
});
