import GithubCorner from '@common/components/githubCorner'
import AppUpdate from '@common/components/appUpdate'
import ThemeSwitcher from '@common/components/themeSwitcher'
import classnames from 'classnames'
import { matchPath } from 'react-router'
import { Link, useLocation, Outlet } from 'react-router'

import './app-layout.css'

const AppLayout = () => {
  const location = useLocation()
  const isActive = (path) => matchPath(path, location.pathname)

  return (
    <div className="app">
      <GithubCorner />
      <main className="app__main">
        <nav className="app__navigation" aria-label="Main">
          <div
            className={classnames('app__navigation__item', {
              'app__navigation__item--active': isActive('/')
            })}
          >
            {isActive('/') ? (
              <div className="app__navigation__active-item" aria-current="page">
                Home
              </div>
            ) : (
              <Link className="app__navigation__link" to="/">
                Home
              </Link>
            )}
          </div>
          <div
            className={classnames('app__navigation__big-item', {
              'app__navigation__item--active': isActive('/about')
            })}
          >
            {isActive('/about') ? (
              <div className="app__navigation__active-item" aria-current="page">
                How it works
              </div>
            ) : (
              <Link className="app__navigation__link" to="/about">
                How it works
              </Link>
            )}
          </div>
          <div className="app__navigation__item">
            <ThemeSwitcher className="app__navigation__link" />
          </div>
        </nav>

        <AppUpdate />

        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
