import React from 'react'
import PropTypes from 'prop-types'
import {Provider} from 'react-redux'
import {HashRouter} from 'react-router-dom'
import {renderRoutes} from 'react-router-config'
import {routes} from './routes'

const Root = ({store}) => (
  <Provider store={store} key="provider">
    <HashRouter>
      {renderRoutes(routes)}
    </HashRouter>
  </Provider>
)

Root.propTypes = {
  store: PropTypes.object.isRequired
}

export default Root
