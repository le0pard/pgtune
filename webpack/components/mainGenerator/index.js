import React, {useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {isReadyForConfiguration} from 'selectors/configuration'
import {resetConfiguration} from 'reducers/configuration'
import InfoView from 'components/infoView'
import ConfigurationForm from 'containers/configurationForm'
import ConfigurationView from 'containers/configurationView'

import './main-generator.sass'

const MainGenerator = () => {
  const dispatch = useDispatch()
  const readyForConfig = useSelector(isReadyForConfiguration)

  useEffect(() => {
    return () => dispatch(resetConfiguration())
  }, [dispatch])

  return (
    <div className="main-generator">
      <div className="main-generator-form-wrapper">
        <h4 className="main-generator-form-subtitle">
          Parameters of your system
        </h4>
        <ConfigurationForm />
      </div>
      <div className="main-generator-result-wrapper">
        {!readyForConfig && <InfoView />}
        {readyForConfig && <ConfigurationView />}
      </div>
    </div>
  )
}

export default MainGenerator
