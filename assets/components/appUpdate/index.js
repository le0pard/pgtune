import React from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {updating} from 'reducers/sw'
import {skipWaitingMessageAndReload} from 'swWindow'

import './app-update.css'

const AppUpdate = () => {
  const dispatch = useDispatch()
  const isNewVersionAvailable = useSelector(({sw}) => sw.isNewVersionAvailable)

  const reloadPage = (e) => {
    e.preventDefault()

    dispatch(updating())
    skipWaitingMessageAndReload()
  }

  if (!isNewVersionAvailable) {
    return null
  }

  return (
    <div className="app-update">
      <h4 className="app-update__title">
        New version of application is available.
      </h4>
      <div className="app-update__link-wrapper">
        <a
          href="#"
          onClick={reloadPage}>
          Update application
        </a>
      </div>
    </div>
  )
}

export default AppUpdate
