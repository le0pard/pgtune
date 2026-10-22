import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { build, defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import vituum from 'vituum'
import liquid from '@vituum/vite-plugin-liquid'
import preact from '@preact/preset-vite'

const alias = [
  { find: '@root', replacement: resolve(import.meta.dirname, 'src') },
  { find: '@app', replacement: resolve(import.meta.dirname, 'src/app') },
  { find: '@css', replacement: resolve(import.meta.dirname, 'src/css') },
  { find: '@common', replacement: resolve(import.meta.dirname, 'src/common') },
  { find: '@features', replacement: resolve(import.meta.dirname, 'src/features') },
  { find: '@hooks', replacement: resolve(import.meta.dirname, 'src/hooks') }
]

// pages, which are rendered to static html at build time
const PRERENDER_PAGES = [
  { url: '/', file: 'index.html' },
  { url: '/about', file: 'about.html' }
]
const ROOT_ELEMENT = '<div id="root"></div>'
const HEAD_PLACEHOLDER = /<!-- page head: [^>]*-->/

// Search engines and first paint get page content before javascript is loaded.
// Runs after html files are written and before service worker precache manifest is built
const prerender = () => {
  let outDir

  return {
    name: 'pgtune:prerender',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
    },
    async writeBundle() {
      const ssrOutDir = await mkdtemp(join(tmpdir(), 'pgtune-prerender-'))
      try {
        // all dependencies are bundled, so react libraries use preact/compat aliases
        await build({
          configFile: false,
          logLevel: 'warn',
          plugins: [preact()],
          resolve: { alias },
          ssr: { noExternal: true },
          build: {
            ssr: resolve(import.meta.dirname, 'src/prerender.jsx'),
            outDir: ssrOutDir,
            emptyOutDir: true,
            minify: false
          }
        })
        const { render, head } = await import(pathToFileURL(join(ssrOutDir, 'prerender.js')).href)

        for (const page of PRERENDER_PAGES) {
          const file = join(outDir, page.file)
          const html = await readFile(file, 'utf8')
          if (!html.includes(ROOT_ELEMENT) || !HEAD_PLACEHOLDER.test(html)) {
            throw new Error(`${ROOT_ELEMENT} or head placeholder is not found in ${file}`)
          }
          await writeFile(
            file,
            html
              .replace(HEAD_PLACEHOLDER, head(page.url))
              .replace(ROOT_ELEMENT, `<div id="root">${render(page.url)}</div>`)
          )
        }
      } finally {
        await rm(ssrOutDir, { recursive: true, force: true })
      }
    }
  }
}

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
    // also aliases react and react-dom to preact/compat (for formik and react hooks imports)
    preact(),
    prerender(),
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
    },
    // "yarn test:coverage", report is in coverage/index.html. Components are covered
    // by smoke tests (e2e), calculation logic must stay covered by unit tests
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/**/__tests__/**'],
      reporter: ['text', 'html'],
      thresholds: {
        'src/features/configuration/**': {
          statements: 95,
          branches: 95,
          functions: 95,
          lines: 95
        }
      }
    }
  },
  resolve: {
    alias
  }
})
