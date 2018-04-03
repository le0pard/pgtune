import React from 'react'
import PropTypes from 'prop-types'
import GithubCorner from 'containers/githubCorner'
import AppUpdate from 'containers/appUpdate'
import ThemeSwitcher from 'containers/themeSwitcher'
import classnames from 'classnames'
import {matchPath} from 'react-router'
import {Link} from 'react-router-dom'
import {renderRoutes} from 'react-router-config'

import './app.sass'

export default class AppLayout extends React.Component {
  static propTypes = {
    route: PropTypes.shape({
      routes: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.array
      ]).isRequired
    }).isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired
    }).isRequired
  }

  isActive(path) {
    const {location: {pathname}} = this.props
    return matchPath(pathname, {
      path,
      exact: true,
      strict: false
    })
  }

  renderNavigation() {
    return (
      <nav className="app__navigation" role="navigation">
        <div
          className={classnames('app__navigation__item', {
            'app__navigation__item--active': this.isActive('/')
          })}>
          {this.isActive('/') ?
            <div className="app__navigation__active-item">Home</div> :
            <Link className="app__navigation__link" to="/">Home</Link>}
        </div>
        <div
          className={classnames('app__navigation__big-item', {
            'app__navigation__item--active': this.isActive('/about')
          })}>
          {this.isActive('/about') ?
            <div className="app__navigation__active-item">How it works</div> :
            <Link className="app__navigation__link" to="/about">How it works</Link>}
        </div>
        <div className="app__navigation__item">
          <ThemeSwitcher className="app__navigation__link" />
        </div>
      </nav>
    )
  }

  render() {
    const {route} = this.props

    return (
      <div className="app">
        <GithubCorner />
        <main className="app__main" role="main">
          {this.renderNavigation()}
          <AppUpdate />
          {renderRoutes(route.routes)}
        </main>
      </div>
    )
  }
}
