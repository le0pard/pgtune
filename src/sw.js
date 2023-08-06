import { clientsClaim } from 'workbox-core'
import { precacheAndRoute } from 'workbox-precaching/precacheAndRoute'
import { cleanupOutdatedCaches } from 'workbox-precaching/cleanupOutdatedCaches'

const cachedAssets = self.__WB_MANIFEST

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

clientsClaim()
cleanupOutdatedCaches()

precacheAndRoute(cachedAssets)
