import { renderToString } from 'preact-render-to-string'
import { Provider } from 'react-redux'
import { configureAppStore } from '@app/store'
import App from './App.jsx'

// Renders page html at build time (see prerender plugin in vite.config.js).
// Router reads current url from global location, so it is stubbed for the render
export const render = (url) => {
  const previousLocation = globalThis.location
  globalThis.location = new URL(url, 'http://localhost')

  try {
    return renderToString(
      <Provider store={configureAppStore()}>
        <App />
      </Provider>
    )
  } finally {
    globalThis.location = previousLocation
  }
}
