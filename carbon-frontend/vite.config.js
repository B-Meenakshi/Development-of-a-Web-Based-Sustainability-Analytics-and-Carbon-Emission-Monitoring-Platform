import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',

      injectRegister: 'auto',

      devOptions: {
        enabled: false,
      },

      manifest: {
        id: '/',
        name: 'CarbonTrack',
        short_name: 'CarbonTrack',

        description:
          'Track Today, Save Tomorrow - Monitor and reduce your carbon footprint.',

        start_url: '/',
        scope: '/',

        display: 'standalone',
        orientation: 'portrait',

        theme_color: '#238b57',
        background_color: '#f7fbf9',

        categories: [
          'lifestyle',
          'productivity',
          'health',
        ],

        lang: 'en',

        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },

      workbox: {
        cleanupOutdatedCaches: true,

        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2}',
        ],

        navigateFallback: 'index.html',

        runtimeCaching: [
          {
            urlPattern: /^\/api\/.*$/i,
            handler: 'NetworkFirst',

            options: {
              cacheName: 'carbontrack-api-cache',

              networkTimeoutSeconds: 10,

              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24,
              },

              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],

  // =========================================================
  // VITE DEVELOPMENT SERVER
  // =========================================================
  server: {
    host: '0.0.0.0',

    allowedHosts: [
      'outmost-juggle-profanity.ngrok-free.dev',
    ],

    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // =========================================================
  // VITE PREVIEW SERVER - PORT 4173
  // =========================================================
  preview: {
    host: '0.0.0.0',

    port: 4173,

    allowedHosts: [
      'outmost-juggle-profanity.ngrok-free.dev',
    ],

    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})