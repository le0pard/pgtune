import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { createLogger } from 'redux-logger'

import { listenerMiddleware } from './listenerMiddleware'
import configurationReducer from '@features/configuration/configurationSlice'
import settingsReducer from '@features/settings/settingsSlice'
import swReducer from '@features/sw/swSlice'

const isDevelopment = process.env.NODE_ENV === 'development'

export const configureAppStore = (preloadedState = {}) => {
  const store = configureStore({
    preloadedState,
    reducer: {
      configuration: configurationReducer,
      settings: settingsReducer,
      sw: swReducer
    },
    devTools: isDevelopment,
    middleware: (getDefaultMiddleware) => {
      let middlewares = getDefaultMiddleware().prepend(listenerMiddleware.middleware)

      if (isDevelopment) {
        middlewares = middlewares.concat(
          createLogger({
            duration: true,
            timestamp: true,
            diff: true,
            collapsed: true
          })
        )
      }

      return middlewares
    }
  })

  // enable listener behavior for the store
  setupListeners(store.dispatch)

  return store
}
