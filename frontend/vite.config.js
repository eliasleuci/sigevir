import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 4001,
    host: true, // Permitir acceso desde la red (útil para pruebas en mobile)
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
