import App from './pages/app'
import Dashboard from './pages/dashboard'
import AboutPage from './pages/about'

// routes
export const routes = [{
  component: App,
  routes: [
    {
      path: '/',
      exact: true,
      component: Dashboard
    },
    {
      path: '/about',
      exact: true,
      component: AboutPage
    }
  ]
}]
