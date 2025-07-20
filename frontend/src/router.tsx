import { Route, Routes } from 'react-router-dom'
import { appRoutes } from './constants.js'
import Home from '@/components/Home.js'
import NotFound from '@/components/NotFound.js'

export default function Router() {
  return (
    <Routes>
      <Route path={appRoutes.home}>
        <Route index path={appRoutes.home} element={<Home />} />
        <Route path={appRoutes.notFound} element={<NotFound />} />
      </Route>
    </Routes>
  )
}
