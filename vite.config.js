import { resolve } from 'path'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import vituum from 'vituum'
import liquid from '@vituum/vite-plugin-liquid'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    cssCodeSplit: false,
    sourcemap: true
  },
  server: {
    host: process.env.VITE_HOST || 'localhost',
    port: process.env.VITE_PORT || 5173
  },
  plugins: [
    vituum(),
    liquid({
      root: './src'
    }),
    react(),
    VitePWA({
      injectRegister: null,
      strategies: 'injectManifest',
      registerType: 'prompt',
      srcDir: 'src',
      filename: 'sw.js',
      base: '/',
      scope: '/',
      includeAssets: [
        'favicon.svg',
        'favicon.ico',
        'icon-192x192.png',
        'icon-512x512.png',
        'maskable_icon.png',
        'about.html'
      ],
      injectManifest: {
        globPatterns: ['**/*.{css,js,html,png,svg,ico}']
      },
      devOptions: {
        enabled: true,
        type: 'module'
      },
      manifest: {
        name: 'PGTune',
        short_name: 'PGTune',
        description: 'PgTune - Tuning PostgreSQL config by your hardware',
        display: 'standalone',
        start_url: '/',
        theme_color: '#fdf6e3',
        background_color: '#fdf6e3',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/maskable_icon.png',
            sizes: '1024x1024',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@root': resolve(__dirname, 'src'),
      '@app': resolve(__dirname, 'src/app'),
      '@css': resolve(__dirname, 'src/css'),
      '@common': resolve(__dirname, 'src/common'),
      '@features': resolve(__dirname, 'src/features'),
      '@hooks': resolve(__dirname, 'src/hooks')
    }
  }
})
