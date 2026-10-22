// Title and description of each page. Prerender writes them with link preview tags into
// html of the page (see prerender.jsx), app updates title, when page is changed without reload
export const SITE_URL = 'https://pgtune.leopard.in.ua'

export const PAGES_META = {
  '/': {
    title:
      'PGTune - calculate configuration for PostgreSQL based on the maximum performance for a given hardware configuration',
    description: 'PgTune - Tuning PostgreSQL config by your hardware'
  },
  '/about': {
    title: 'How it works - PGTune',
    description:
      'How PGTune suggests PostgreSQL settings: principles, choosing DB type and what to check before applying the configuration'
  }
}
