import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/App'
import '@/index.css'
import { Auth0Provider } from '@auth0/auth0-react'
import { getConfig } from './config'

const onRedirectCallback = () => {
  // Do nothing
}

const config = getConfig()

const providerConfig = {
  domain: config.domain,
  clientId: config.clientId,
  onRedirectCallback,
  authorizationParams: {
    redirect_uri: window.location.origin,
    ...(config.audience ? { audience: config.audience } : null)
  }
}

const container = document.getElementById('root') as HTMLDivElement
const root = createRoot(container)
root.render(
  <StrictMode>
    <Auth0Provider {...providerConfig}>
      <App />
    </Auth0Provider>
  </StrictMode>
)
