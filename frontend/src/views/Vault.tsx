import Loading from '@/components/Loading'
import { withAuthenticationRequired } from '@auth0/auth0-react'
import AppShell from '@/components/AppShell'

export const Vault = () => {
  return (
    <AppShell>
      <div className="bg-white">
        <h1>This is a private vault, it requires auth</h1>
      </div>
    </AppShell>
  )
}

export default withAuthenticationRequired(Vault, {
  onRedirecting: () => <Loading />
})
