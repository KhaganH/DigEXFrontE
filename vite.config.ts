import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:1111',
        changeOrigin: true,
        secure: false,
      },
      '/checkout/process': {
        target: 'http://localhost:1111',
        changeOrigin: true,
        secure: false,
      },
      '/cart/api': {
        target: 'http://localhost:1111',
        changeOrigin: true,
        secure: false,
      },
      '/oauth2': {
        target: 'http://localhost:1111',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
