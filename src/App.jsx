import { LocationProvider, Router, Route } from 'preact-iso/router'
import AppLayout from '@app/AppLayout'
import AboutPage from '@app/pages/about'
import DashboardPage from '@app/pages/dashboard'
import SettingsProvider from '@features/settings/SettingsProvider'

const App = () => {
  return (
    <LocationProvider>
      <SettingsProvider>
        <AppLayout>
          <Router>
            <Route path="/" component={DashboardPage} />
            <Route path="/about" component={AboutPage} />
          </Router>
        </AppLayout>
      </SettingsProvider>
    </LocationProvider>
  )
}

export default App
