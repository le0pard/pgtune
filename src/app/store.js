import { configureStore, createDynamicMiddleware } from '@reduxjs/toolkit'

import { listenerMiddleware } from './listenerMiddleware'
import settingsReducer from '@features/settings/settingsSlice'
import swReducer from '@features/sw/swSlice'

const isDevelopment = import.meta.env.DEV

export const configureAppStore = (preloadedState = {}) => {
  const dynamicMiddleware = createDynamicMiddleware()

  const store = configureStore({
    preloadedState,
    reducer: {
      settings: settingsReducer,
      sw: swReducer
    },
    devTools: isDevelopment,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .prepend(listenerMiddleware.middleware)
        .concat(dynamicMiddleware.middleware)
  })

  if (isDevelopment) {
    // loaded on demand, so logger is not included in production bundle
    import('redux-logger').then(({ createLogger }) => {
      dynamicMiddleware.addMiddleware(
        createLogger({
          duration: true,
          timestamp: true,
          diff: true,
          collapsed: true
        })
      )
    })
  }

  return store
}
