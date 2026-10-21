import { useConfiguration } from '@features/configuration/useConfiguration'
import InfoView from '@common/components/infoView'
import ConfigurationForm from '@common/components/configurationForm'
import ConfigurationView from '@common/components/configurationView'

import './configurator.css'

const Configurator = () => {
  const { isConfigured } = useConfiguration()

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
