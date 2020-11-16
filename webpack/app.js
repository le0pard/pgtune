import './init'
import React from 'react'
import ReactDom from 'react-dom'
import Root from './root'
import {APP_THEMES_LIGHT, APP_THEMES_DARK} from 'reducers/settings/constants'
import LocalStorage from 'lib/localStorage'
import {initializeStore} from './redux/store'
import {initServiceWorker} from './swWindow'
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

const prepareStoreData = () => {
  let theme = LocalStorage.getItem('theme')

  if (!theme) {
    if (window.matchMedia('(prefers-color-scheme: dark)')?.matches) {
      theme = APP_THEMES_DARK
    }
  }

  return {
    settings: {
      theme: theme || APP_THEMES_LIGHT
    }
  }
}
// init store and start app
const appRoot = document.getElementById('app-root')
const store = initializeStore(prepareStoreData())
renderApp(Root, appRoot, store)
