import React from 'react'
import PropTypes from 'prop-types'
import GithubCorner from 'components/githubCorner'
import AppUpdate from 'components/appUpdate'
import ThemeSwitcher from 'components/themeSwitcher'
import classnames from 'classnames'
import {matchPath} from 'react-router'
import {Link} from 'react-router-dom'
import {renderRoutes} from 'react-router-config'

import './app.sass'

const AppLayout = ({location: {pathname}, route}) => {
  const isActive = (path) => (
    matchPath(pathname, {
      path,
      exact: true,
      strict: false
    })
  )

  return (
    <div className="app">
      <GithubCorner />
      <main className="app__main" role="main">

        <nav className="app__navigation" role="navigation">
          <div
            className={classnames('app__navigation__item', {
              'app__navigation__item--active': isActive('/')
            })}>
            {isActive('/') ?
              <div className="app__navigation__active-item">Home</div> :
              <Link className="app__navigation__link" to="/">Home</Link>}
          </div>
          <div
            className={classnames('app__navigation__big-item', {
              'app__navigation__item--active': isActive('/about')
            })}>
            {isActive('/about') ?
              <div className="app__navigation__active-item">How it works</div> :
              <Link className="app__navigation__link" to="/about">How it works</Link>}
          </div>
          <div className="app__navigation__item">
            <ThemeSwitcher className="app__navigation__link" />
          </div>
        </nav>

        <AppUpdate />

        {renderRoutes(route.routes)}
      </main>
    </div>
  )
}

AppLayout.propTypes = {
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

export default AppLayout
