import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0'
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        productos: resolve(__dirname, 'productos.html'),
        nosotros: resolve(__dirname, 'nosotros.html'),
        contacto: resolve(__dirname, 'contacto.html'),
        servicios: resolve(__dirname, 'servicios.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
      }
    }
  }
});
