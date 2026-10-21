import { useCallback, useEffect, useState } from 'react'
import { initServiceWorker, skipWaitingMessageAndReload } from './swWindow'

/**
 * Registers service worker and reports, when its new version is waiting to be activated
 * @returns {{ isNewVersionAvailable: boolean, update: () => void }}
 */
export const useServiceWorkerUpdate = () => {
  const [isNewVersionAvailable, setIsNewVersionAvailable] = useState(false)

  useEffect(() => {
    initServiceWorker(() => setIsNewVersionAvailable(true))
  }, [])

  // activates new version and reloads the page
  const update = useCallback(() => {
    setIsNewVersionAvailable(false)
    skipWaitingMessageAndReload()
  }, [])

  return { isNewVersionAvailable, update }
}
