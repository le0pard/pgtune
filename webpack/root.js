import React from 'react'
import PropTypes from 'prop-types'
import {Provider} from 'react-redux'
import {BrowserRouter as Router} from 'react-router-dom'
import AppWrapper from './appWrapper'

const Root = ({store}) => (
  <Provider store={store} key="provider">
    <Router>
      <AppWrapper />
    </Router>
  </Provider>
)

Root.propTypes = {
  store: PropTypes.object.isRequired
}

export default Root
