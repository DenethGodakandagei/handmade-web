import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'
import vitePathGuard from './plugins/vitePathGuard.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  cacheDir: './.cache',
  plugins: [
    vitePathGuard(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    fs: {
      strict: true,
      deny: ['.env', '.env.*', '*.{pem,crt}'],
    },
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com https://accounts.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: http://localhost:4000 https://res.cloudinary.com https://images.unsplash.com https://lh3.googleusercontent.com; connect-src 'self' http://localhost:4000 ws://localhost:4000 ws://localhost:3000 https://api.stripe.com https://accounts.google.com https://get.geojs.io https://open.er-api.com; frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://accounts.google.com; form-action 'self' https://accounts.google.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none';",
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    },
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    }
  },
  preview: {
    port: 3000,
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' https://js.stripe.com https://accounts.google.com; style-src 'self' https://fonts.googleapis.com https://accounts.google.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: http://localhost:4000 https://res.cloudinary.com https://images.unsplash.com https://lh3.googleusercontent.com; connect-src 'self' http://localhost:4000 ws://localhost:4000 ws://localhost:3000 https://api.stripe.com https://accounts.google.com https://get.geojs.io https://open.er-api.com; frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://accounts.google.com; form-action 'self' https://accounts.google.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none';",
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    },
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    }
  }

});
