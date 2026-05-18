import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'], // Solo incluimos lo que tienes actualmente
      devOptions: {
        enabled: true // ¡Vital para poder probar la PWA mientras usas npm run dev!
      },
      manifest: {
        name: 'AccesiMap CL',
        short_name: 'AccesiMap',
        description: 'Mapa de accesibilidad e infraestructura para Santiago',
        theme_color: '#2E7D32',
        background_color: '#FAFAFA',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
