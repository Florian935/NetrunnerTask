import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Netrunner Tasks',
        short_name: 'Netrunner',
        description:
          'Gestionnaire de tâches et d’habitudes déguisé en jeu de rôle cyberpunk.',
        lang: 'fr',
        theme_color: '#6b0028',
        background_color: '#070a14',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff,woff2}'],
      },
      devOptions: {
        // Le service worker n'est actif qu'en build/preview (test hors-ligne
        // via `npm run build` puis `npm run preview`).
        enabled: false,
      },
    }),
  ],
})
