import { useServiceWorkerUpdate } from '@features/sw/useServiceWorkerUpdate'

import './app-update.css'

const AppUpdate = () => {
  const { isNewVersionAvailable, update } = useServiceWorkerUpdate()

  if (!isNewVersionAvailable) {
    return null
  }

  return (
    <div className="app-update">
      <h4 className="app-update__title">New version of application is available.</h4>
      <div className="app-update__button-wrapper">
        <button className="app-update__button" onClick={update}>
          Update application
        </button>
      </div>
    </div>
  )
}

export default AppUpdate
