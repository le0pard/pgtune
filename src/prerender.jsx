import { renderToString } from 'preact-render-to-string'
import { PAGES_META, SITE_URL } from '@app/pageMeta'
import App from './App.jsx'

// Renders page html at build time (see prerender plugin in vite.config.js).
// Router reads current url from global location, so it is stubbed for the render
export const render = (url) => {
  const previousLocation = globalThis.location
  globalThis.location = new URL(url, 'http://localhost')

  try {
    return renderToString(<App />)
  } finally {
    globalThis.location = previousLocation
  }
}

const escapeHtml = (text) =>
  text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// head tags of the page: title, description, canonical url (pages with url params are
// the same page) and link preview for messengers and social networks
export const head = (url) => {
  const title = escapeHtml(PAGES_META[url].title)
  const description = escapeHtml(PAGES_META[url].description)
  const pageUrl = `${SITE_URL}${url}`

  return [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<link rel="canonical" href="${pageUrl}" />`,
    '<meta property="og:type" content="website" />',
    '<meta property="og:site_name" content="PGTune" />',
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${pageUrl}" />`,
    `<meta property="og:image" content="${SITE_URL}/icon-512x512.png" />`,
    '<meta name="twitter:card" content="summary" />'
  ].join('\n    ')
}
