import { BrowserRouter } from 'react-router-dom'
import '@/index.css'
import { useAuth0 } from '@auth0/auth0-react'
import Loading from '@/components/Loading'
import { Route, Routes } from 'react-router-dom'
import { appRoutes } from './constants.js'
import Home from '@/views/Home.js'
import NotFound from '@/views/NotFound.js'
import SecretSharingDemo from './views/SecretSharingDemo.js'
import Vault from './views/Vault.js'

const App = () => {
  const { isLoading, error } = useAuth0()

  if (error) {
    return <div>Oops... {error.message}</div>
  }

  if (isLoading) {
    return <Loading />
  }

  return (
    <BrowserRouter basename="/">
      <Routes>
        <Route path={appRoutes.home}>
          <Route index path={appRoutes.home} element={<Home />} />
          <Route
            path={appRoutes.secretSharingDemo}
            element={<SecretSharingDemo />}
          />
          <Route path={appRoutes.vault} element={<Vault />} />
          <Route path={appRoutes.notFound} element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
