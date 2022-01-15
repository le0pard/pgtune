import {routes} from './routes'
import {useRoutes} from 'react-router-dom'

const AppWrapper = () => {
  const element = useRoutes(routes)
  return element
}

export default AppWrapper
