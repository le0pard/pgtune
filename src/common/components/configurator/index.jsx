import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectIsConfigured, resetConfiguration } from '@features/configuration/configurationSlice'
import InfoView from '@common/components/infoView'
import ConfigurationForm from '@common/components/configurationForm'
import ConfigurationView from '@common/components/configurationView'

import './configurator.css'

const Configurator = () => {
  const dispatch = useDispatch()
  const isConfigured = useSelector(selectIsConfigured)

  useEffect(() => {
    return () => dispatch(resetConfiguration())
  }, [dispatch])

  return (
    <div className="configurator">
      <div className="configurator-form-wrapper">
        <h4 className="configurator-form-subtitle">Parameters of your system</h4>
        <ConfigurationForm />
      </div>
      <div className="configurator-result-wrapper">
        {isConfigured ? <ConfigurationView /> : <InfoView />}
      </div>
    </div>
  )
}

export default Configurator
