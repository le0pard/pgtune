import './init'
import React from 'react'
import ReactDom from 'react-dom'
import Root from './root'
import {APP_THEMES_LIGHT} from 'reducers/settings/constants'
import LocalStorage from 'lib/localStorage'
import {initializeStore} from './redux/store'
import {initServiceWorker} from './sw'
// render app
const renderApp = (Component, appRoot, store) => {
  initServiceWorker(store)

  ReactDom.render(
    <Component store={store} />,
    appRoot, () => {
      // need to make this for feature tests - application ready for testing
      window.__isAppReady = true
    })
}

const prepareStoreData = () => ({
  settings: {
    theme: LocalStorage.getItem('theme') || APP_THEMES_LIGHT
  }
})
// init store and start app
const appRoot = document.getElementById('app-root')
const store = initializeStore(prepareStoreData())
renderApp(Root, appRoot, store)
