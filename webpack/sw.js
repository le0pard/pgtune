import runtime from 'offline-plugin/runtime'
import {
  updating,
  updated,
  failed
} from 'reducers/sw'

export const initServiceWorker = (store) => {
  runtime.install({
    onUpdating: () => store.dispatch(updating()),
    onUpdateReady: () => {
      // Tells to new SW to take control immediately
      runtime.applyUpdate()
    },
    onUpdated: () => store.dispatch(updated()),
    onUpdateFailed: () => store.dispatch(failed())
  })
}
