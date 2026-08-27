import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In dev, the client runs on :5173 and proxies /api to the Express server on :5000,
// so you don't need CORS or a VITE_API_URL locally.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
