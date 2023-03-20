import React from 'react'
import AppLayout from './pages/app'
import Dashboard from './pages/dashboard'
import AboutPage from './pages/about'

// routes
export const routes = [{
  element: <AppLayout />,
  children: [
    {
      path: '/',
      element: <Dashboard />
    },
    {
      path: '/about',
      element: <AboutPage />
    },
    {
      path: '/about.html',
      element: <AboutPage />
    }
  ]
}]
