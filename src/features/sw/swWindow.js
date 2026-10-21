import { Workbox, messageSW } from 'workbox-window'

let wb = null
let wbRegistration = null

export const skipWaitingMessageAndReload = () => {
  wb.addEventListener('controlling', () => window.location.reload())

  if (wbRegistration && wbRegistration.waiting) {
    // Send a message to the waiting service worker,
    // instructing it to activate.
    messageSW(wbRegistration.waiting, { type: 'SKIP_WAITING' })
  }
}

/**
 * Registers service worker
 * @param {() => void} onNewVersion called, when new version is installed and waiting to be activated
 */
export const initServiceWorker = (onNewVersion) => {
  // service worker is built only for production (check with "yarn build && yarn preview")
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    wb = new Workbox('/sw.js')

    wb.addEventListener('waiting', onNewVersion)
    wb.addEventListener('externalwaiting', onNewVersion)

    // Register the service worker after event listeners have been added.
    wb.register().then((r) => {
      wbRegistration = r
    })
  }
}
