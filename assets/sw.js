import {clientsClaim} from 'workbox-core'
import {precacheAndRoute} from 'workbox-precaching/precacheAndRoute'
import {cleanupOutdatedCaches} from 'workbox-precaching/cleanupOutdatedCaches'

const sha256 = (message) => {
  // encode as UTF-8
  const msgBuffer = new TextEncoder().encode(message)

  // hash the message
  return crypto.subtle.digest('SHA-256', msgBuffer).then((hashBuffer) => {
    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    // convert bytes to hex string
    const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('')
    return hashHex
  })
}

const cachedAssets = self.__WB_MANIFEST

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

clientsClaim()
cleanupOutdatedCaches()

sha256(JSON.stringify(cachedAssets.sort())).then((rev) => {
  precacheAndRoute([
    {url: '/index.html', revision: `${rev}-v1`},
    {url: '/about.html', revision: `${rev}-v1`},
    {url: '/manifest.webmanifest', revision: `${rev}-v1`}
  ])
})

precacheAndRoute(cachedAssets)
