import { useServiceWorkerUpdate } from '@features/sw/useServiceWorkerUpdate'

import './app-update.css'

const AppUpdate = () => {
  const { isNewVersionAvailable, update } = useServiceWorkerUpdate()

  // status region is always rendered, so screen readers announce notice, when it appears
  return (
    <div role="status">
      {isNewVersionAvailable && (
        <div className="app-update">
          <p className="app-update__title">New version of application is available.</p>
          <div className="app-update__button-wrapper">
            <button className="app-update__button" onClick={update}>
              Update application
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AppUpdate
