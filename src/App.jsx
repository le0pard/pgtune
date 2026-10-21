import { LocationProvider, Router, Route } from 'preact-iso/router'
import AppLayout from '@app/AppLayout'
import AboutPage from '@app/pages/about'
import DashboardPage from '@app/pages/dashboard'

const App = () => {
  return (
    <LocationProvider>
      <AppLayout>
        <Router>
          <Route path="/" component={DashboardPage} />
          <Route path="/about" component={AboutPage} />
        </Router>
      </AppLayout>
    </LocationProvider>
  )
}

export default App
