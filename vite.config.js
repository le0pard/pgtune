import { resolve } from 'path'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import vituum from 'vituum'
import liquid from '@vituum/vite-plugin-liquid'
import preact from '@preact/preset-vite'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    cssCodeSplit: false,
    sourcemap: true,
    minify: 'terser'
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
    // also aliases react and react-dom to preact/compat (for react-redux and formik)
    preact(),
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
  test: {
    // describe, it and expect are available without import (as in Jest)
    globals: true,
    include: ['src/**/__tests__/**/*.test.{js,jsx}'],
    env: {
      TZ: 'UTC' // normalize timezone for tests
    }
  },
  resolve: {
    alias: [
      { find: '@root', replacement: resolve(import.meta.dirname, 'src') },
      { find: '@app', replacement: resolve(import.meta.dirname, 'src/app') },
      { find: '@css', replacement: resolve(import.meta.dirname, 'src/css') },
      { find: '@common', replacement: resolve(import.meta.dirname, 'src/common') },
      { find: '@features', replacement: resolve(import.meta.dirname, 'src/features') },
      { find: '@hooks', replacement: resolve(import.meta.dirname, 'src/hooks') }
    ]
  }
})
