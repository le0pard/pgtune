import {Workbox, messageSW} from 'workbox-window'
import {readyToUpdated} from 'reducers/sw'

let wb = null
let wbRegistration = null

export const skipWaitingMessageAndReload = () => {
  wb.addEventListener('controlling', () => window.location.reload())

  if (wbRegistration && wbRegistration.waiting) {
    // Send a message to the waiting service worker,
    // instructing it to activate.
    // Note: for this to work, you have to add a message
    // listener in your service worker. See below.
    messageSW(wbRegistration.waiting, {type: 'SKIP_WAITING'})
  }
}

export const initServiceWorker = (store) => {
  if ('serviceWorker' in navigator) {
    wb = new Workbox('/sw.js')

    const showUpdatedInfo = () => store.dispatch(readyToUpdated())

    wb.addEventListener('waiting', showUpdatedInfo)
    wb.addEventListener('externalwaiting', showUpdatedInfo)

    // Register the service worker after event listeners have been added.
    wb.register().then((r) => {
      wbRegistration = r
    })
  }
}
