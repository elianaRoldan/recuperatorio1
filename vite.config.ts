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
        servicios: resolve(__dirname, 'servicios.html'),
        productos: resolve(__dirname, 'productos.html'),
        detalle: resolve(__dirname, 'detalle.html'),
        nosotros: resolve(__dirname, 'nosotros.html'),
        galeria: resolve(__dirname, 'galeria.html'),
        blog: resolve(__dirname, 'blog.html'),
        contacto: resolve(__dirname, 'contacto.html'),
        login: resolve(__dirname, 'login.html'),
        registro: resolve(__dirname, 'registro.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
      }
    }
  }
});
