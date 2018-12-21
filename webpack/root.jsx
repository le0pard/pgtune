import React from 'react'
import PropTypes from 'prop-types'
import {Provider} from 'react-redux'
import {HashRouter} from 'react-router-dom'
import {renderRoutes} from 'react-router-config'
import {routes} from './routes'

export default class Root extends React.Component {
  static propTypes = {
    store: PropTypes.object.isRequired
  }

  render() {
    const {store} = this.props

    return (
      <Provider store={store} key="provider">
        <HashRouter>
          {renderRoutes(routes)}
        </HashRouter>
      </Provider>
    )
  }
}
