import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://biometric.integrationlayer.com', // Asegúrate de usar HTTPS
        changeOrigin: true,
        secure: false, // Desactiva la verificación SSL si es necesario
        rewrite: (path) => path.replace(/^\/api/, ''), // Reescribir la ruta
      },
    },
  },
});
