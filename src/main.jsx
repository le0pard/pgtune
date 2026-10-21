import '@css/app.css'

import { StrictMode } from 'react'
import { render } from 'preact'
import { onDomReady } from '@common/utils/onDomReady'
import App from './App.jsx'

const start = () => {
  const rootElement = document.getElementById('root')

  // Preact render (not hydrate) reuses prerendered html and updates it to current state
  // (url params, theme, etc.). React compatible createRoot().render() would remove it first
  render(
    <StrictMode>
      <App />
    </StrictMode>,
    rootElement
  )
  document.documentElement.classList.remove('render-pending')
}

onDomReady(start)
