import { useEffect } from 'react'
import GithubCorner from '@common/components/githubCorner'
import AppUpdate from '@common/components/appUpdate'
import ThemeSwitcher from '@common/components/themeSwitcher'
import classnames from 'classnames'
import { useLocation } from 'preact-iso/router'
import { PAGES_META } from '@app/pageMeta'

import './app-layout.css'

/**
 * Page layout with navigation, links are handled by preact-iso LocationProvider
 * @param {{ children: import('react').ReactNode }} props
 */
const AppLayout = ({ children }) => {
  const location = useLocation()
  const isActive = (path) => location.path === path

  // prerendered page has its title, it is updated, when page is changed without reload
  useEffect(() => {
    if (PAGES_META[location.path]) {
      document.title = PAGES_META[location.path].title
    }
  }, [location.path])

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
              <a className="app__navigation__link" href="/">
                Home
              </a>
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
              <a className="app__navigation__link" href="/about">
                How it works
              </a>
            )}
          </div>
          <div className="app__navigation__item">
            <ThemeSwitcher className="app__navigation__link" />
          </div>
        </nav>

        <AppUpdate />

        {children}
      </main>
    </div>
  )
}

export default AppLayout
