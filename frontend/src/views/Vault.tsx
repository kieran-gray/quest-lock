import { useAuth0, withAuthenticationRequired } from '@auth0/auth0-react'
import { useEffect, useState } from 'react'
import AppShell from '@/components/AppShell'
import QuestLoader from '@/components/QuestLoader'

type Quest = {
  id: string
  title: string
  description: string
  completed: boolean
}

type VaultEntry = {
  id: string
  label: string
  createdAt: string
  quests: Quest[]
}

const Vault = () => {
  const [vaultEntries, setVaultEntries] = useState<VaultEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    async function fetchVault() {
      try {
        setLoading(true)
        const token = await getAccessTokenSilently();
        const res = await fetch('http://localhost:8000/api/v1/lock/123' , {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!res.ok) {
          throw new Error('Failed to fetch vault entries')
        }
        const data = await res.json()
        setVaultEntries(data)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchVault()
  }, [])

  return (
    <AppShell>
      <div className="bg-shire-light min-h-screen px-6 py-12 font-body text-shire-dark">
        <h1 className="mb-8 font-heading text-4xl text-center">Your Vault</h1>

        {loading && <QuestLoader />}
        {error && (
          <p className="text-red-600 text-center font-semibold">{error}</p>
        )}

        {!loading && !error && vaultEntries.length === 0 && (
          <p className="text-center text-lg">No locked passwords yet.</p>
        )}

        <div className="space-y-8">
          {vaultEntries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-xl bg-white p-6 shadow-lg border border-shire-stone"
            >
              <h2 className="font-heading text-2xl mb-2">{entry.label}</h2>
              <p className="text-sm text-shire-bark mb-4">
                Created: {new Date(entry.createdAt).toLocaleDateString()}
              </p>

              <ul className="space-y-3">
                {entry.quests.map((quest) => (
                  <li
                    key={quest.id}
                    className={`p-4 rounded-lg border ${
                      quest.completed
                        ? 'bg-green-100 border-green-300 text-green-800'
                        : 'bg-yellow-50 border-yellow-300'
                    }`}
                  >
                    <h3 className="font-semibold text-lg">{quest.title}</h3>
                    <p className="text-sm">{quest.description}</p>
                    <p className="text-xs mt-1">
                      Status: {quest.completed ? 'Completed' : 'Incomplete'}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  )
}

export default withAuthenticationRequired(Vault, {
  onRedirecting: () => <QuestLoader />
})