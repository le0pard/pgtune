import { BrowserRouter as Router, Routes, Route } from 'react-router'
import AppLayout from '@app/AppLayout'
import AboutPage from '@app/pages/about'
import DashboardPage from '@app/pages/dashboard'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="about" element={<AboutPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
