import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updating, selectIsNewVersionAvailableSw } from '@features/sw/swSlice'

import './app-update.css'

const AppUpdate = () => {
  const dispatch = useDispatch()
  const isNewVersionAvailable = useSelector(selectIsNewVersionAvailableSw)

  const reloadPage = () => dispatch(updating())

  if (!isNewVersionAvailable) {
    return null
  }

  return (
    <div className="app-update">
      <h4 className="app-update__title">New version of application is available.</h4>
      <div className="app-update__button-wrapper">
        <button className="app-update__button" onClick={reloadPage}>
          Update application
        </button>
      </div>
    </div>
  )
}

export default AppUpdate
