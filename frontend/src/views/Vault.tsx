import { useAuth0, withAuthenticationRequired } from '@auth0/auth0-react'
import { useEffect, useState } from 'react'
import AppShell from '@/components/AppShell'
import QuestLoader from '@/components/QuestLoader'
import { MapPin, Clock, User, DollarSign, Lock, Unlock, Shield, Sword, Trophy, Plus, ChevronRight, Calendar, Mail, Coins } from 'lucide-react'

// TODO these will go in a client
type QuestDTO = {
  id: string
  lock_id: string
  share: string | null
  quest_type: string
  status: string
  data: Record<string, string>
}

type LockDTO = {
  id: string
  label: string | null
  total_shares: number
  threshold: number
  quests: QuestDTO[]
}

const QuestTypeInfo = {
  GEO: {
    icon: MapPin,
    title: 'Geographic Quest',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  TIME: {
    icon: Clock,
    title: 'Time-Delayed Quest',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  FRIEND: {
    icon: User,
    title: 'Trusted Guardian Quest',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  PAYWALL: {
    icon: DollarSign,
    title: 'Financial Commitment Quest',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  }
}

// Helper function to determine the color of the quest status
const getStatusColor = (status: string) => {
  switch (status.toUpperCase()) {
    case 'COMPLETE':
      return 'text-green-600 bg-green-100 border-green-300'
    case 'IN_PROGRESS':
      return 'text-yellow-600 bg-yellow-100 border-yellow-300'
    case 'INCOMPLETE':
    default:
      return 'text-red-600 bg-red-100 border-red-300'
  }
}

const getStatusIcon = (status: string) => {
  switch (status.toUpperCase()) {
    case 'COMPLETE':
      return Trophy
    case 'IN_PROGRESS':
      return Sword
    case 'INCOMPLETE':
    default:
      return Shield
  }
}

const formatQuestData = (quest: QuestDTO) => {
  const data = quest.data
  switch (quest.quest_type.toUpperCase()) {
    case 'GEO':
      return data.location_name || 'Unknown Location'
    case 'TIME':
      if (data.release_date) {
        return new Date(data.release_date).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
      return 'Time Lock'
    case 'FRIEND':
      return data.friend_name || data.friend_email || 'Trusted Guardian'
    case 'PAYWALL':
      return data.amount ? `£${parseFloat(data.amount).toFixed(2)}` : 'Payment Required'
    default:
      return 'Quest Details'
  }
}

const Vault = () => {
  const [locks, setLocks] = useState<LockDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedLock, setExpandedLock] = useState<string | null>(null)
  const { getAccessTokenSilently } = useAuth0()
  const apiBaseUrl = import.meta.env.VITE_API_URL

  useEffect(() => {
    async function fetchVaultLocks() {
      try {
        setLoading(true)
        setError(null)
        const token = await getAccessTokenSilently()
        const res = await fetch(`${apiBaseUrl}/api/v1/lock-query/`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!res.ok) {
          const errorResponse = await res.text()
          throw new Error(
            `Failed to fetch vault entries: ${res.status} ${res.statusText}. ${errorResponse}`
          )
        }

        const data: LockDTO[] = await res.json()
        setLocks(data)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchVaultLocks()
  }, [getAccessTokenSilently])

  const handleCreateNewLock = () => {
    // Navigate to lock creation - replace with your routing solution
    window.location.href = '/lock'
  }

  const handleAttemptQuest = (questId: string) => {
    // Navigate to quest attempt page - implement based on your routing
    window.location.href = `/quest/${questId}`
  }

  const completedQuestsCount = (lock: LockDTO) =>
    lock.quests.filter((q) => q.status.toUpperCase() === 'COMPLETE').length

  const canUnlock = (lock: LockDTO) =>
    completedQuestsCount(lock) >= lock.threshold

  const getProgressPercentage = (lock: LockDTO) =>
    Math.round((completedQuestsCount(lock) / lock.threshold) * 100)

  const toggleLockExpansion = (lockId: string) => {
    setExpandedLock(expandedLock === lockId ? null : lockId)
  }

  if (loading) {
    return <QuestLoader />
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-shire-light px-6 py-12 font-body text-shire-dark">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <h1 className="mb-4 font-heading text-4xl text-shire-dark">
              The Vault of Trials
            </h1>
            <p className="text-lg text-shire-bark max-w-2xl mx-auto">
              Here lie your sealed accounts, guarded by the quests you have forged. Complete your trials to reclaim what was once yours.
            </p>
          </div>

          <div className="mb-8 text-center">
            <button
              onClick={handleCreateNewLock}
              className="inline-flex items-center space-x-2 rounded-full bg-shire-sun px-6 py-3 font-ui text-lg text-shire-dark shadow-lg transition hover:bg-shire-bark hover:text-shire-light"
            >
              <Plus className="h-5 w-5" />
              <span>Forge New Lock</span>
            </button>
          </div>

          {error && (
            <div className="mb-8 rounded-lg border-2 border-red-400 bg-red-50 p-6 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Shield className="h-6 w-6 text-red-600" />
                <strong className="font-bold text-red-700">The Vault Speaks of Trouble:</strong>
              </div>
              <span className="text-red-600">{error}</span>
            </div>
          )}

          {!loading && !error && locks.length === 0 && (
            <div className="rounded-xl bg-shire-stone p-12 text-center shadow-lg border-2 border-shire-bark/20">
              <Lock className="h-16 w-16 mx-auto mb-6 text-shire-bark opacity-50" />
              <h2 className="font-heading text-2xl text-shire-dark mb-4">Your Vault Awaits</h2>
              <p className="text-xl text-shire-bark mb-2">The chamber echoes with emptiness.</p>
              <p className="text-lg text-shire-dark mb-6">
                No locks guard these halls yet. Begin your first quest to seal away temptation.
              </p>
              <button
                onClick={handleCreateNewLock}
                className="inline-flex items-center space-x-2 rounded-full bg-shire-moss px-8 py-4 font-ui text-xl text-shire-dark shadow-lg hover:bg-shire-bark hover:text-shire-light transition-colors"
              >
                <Plus className="h-6 w-6" />
                <span>Begin Your First Quest</span>
              </button>
            </div>
          )}

          <div className="space-y-6">
            {locks.map((lock) => {
              const isExpanded = expandedLock === lock.id
              const progress = getProgressPercentage(lock)
              const unlockable = canUnlock(lock)
              
              return (
                <div
                  key={lock.id}
                  className={`rounded-xl border-2 shadow-lg transition-all ${
                    unlockable 
                      ? 'border-shire-moss bg-gradient-to-r from-shire-moss/10 to-shire-sun/10' 
                      : 'border-shire-bark/20 bg-shire-stone'
                  }`}
                >
                  <div 
                    className="p-6 cursor-pointer hover:bg-shire-light/50 transition-colors rounded-t-xl"
                    onClick={() => toggleLockExpansion(lock.id)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        {unlockable ? (
                          <Unlock className="h-8 w-8 text-shire-moss" />
                        ) : (
                          <Lock className="h-8 w-8 text-shire-bark" />
                        )}
                        <div>
                          <h2 className="font-heading text-2xl text-shire-dark">
                            {lock.label || `The Sealed Realm #${lock.id.slice(-4)}`}
                          </h2>
                          <p className="text-shire-bark">
                            {unlockable ? 'Ready for Liberation' : 'Sealed by Ancient Magic'}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`h-6 w-6 text-shire-bark transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-white/50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Trophy className="h-5 w-5 text-shire-bark" />
                          <span className="font-semibold text-shire-dark">Progress</span>
                        </div>
                        <div className="text-2xl font-bold text-shire-dark">
                          {completedQuestsCount(lock)} of {lock.threshold}
                        </div>
                        <div className="text-sm text-shire-bark">Shares Recovered</div>
                      </div>

                      <div className="bg-white/50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Shield className="h-5 w-5 text-shire-bark" />
                          <span className="font-semibold text-shire-dark">Total Quests</span>
                        </div>
                        <div className="text-2xl font-bold text-shire-dark">
                          {lock.quests.length}
                        </div>
                        <div className="text-sm text-shire-bark">Trials Designed</div>
                      </div>

                      <div className="bg-white/50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Sword className="h-5 w-5 text-shire-bark" />
                          <span className="font-semibold text-shire-dark">Status</span>
                        </div>
                        <div className={`text-lg font-bold ${unlockable ? 'text-green-600' : 'text-shire-bark'}`}>
                          {unlockable ? 'UNLOCKABLE' : 'SEALED'}
                        </div>
                        <div className="text-sm text-shire-bark">{progress}% Complete</div>
                      </div>
                    </div>

                    <div className="w-full bg-shire-light rounded-full h-3 mb-2">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${
                          unlockable 
                            ? 'bg-gradient-to-r from-shire-moss to-shire-sun' 
                            : 'bg-gradient-to-r from-shire-bark to-shire-stone'
                        }`}
                        style={{width: `${progress}%`}}
                      ></div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-shire-bark/20 p-6 bg-white/20">
                      <h3 className="mb-4 text-lg font-semibold text-shire-dark flex items-center space-x-2">
                        <Sword className="h-5 w-5" />
                        <span>Your Trials</span>
                      </h3>
                      
                      <div className="grid gap-4">
                        {lock.quests.map((quest) => {
                          const questInfo = QuestTypeInfo[quest.quest_type.toUpperCase() as keyof typeof QuestTypeInfo]
                          const Icon = questInfo?.icon || Shield
                          const StatusIcon = getStatusIcon(quest.status)
                          
                          return (
                            <div
                              key={quest.id}
                              className={`rounded-lg border-2 p-4 transition-all ${
                                quest.status.toUpperCase() === 'COMPLETE'
                                  ? questInfo?.bgColor + ' ' + questInfo?.borderColor
                                  : 'bg-white border-gray-200 hover:border-shire-sun'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-2">
                                    <Icon className={`h-6 w-6 ${questInfo?.color || 'text-shire-bark'}`} />
                                    <StatusIcon className="h-5 w-5 text-shire-bark" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-shire-dark">
                                      {questInfo?.title || 'Unknown Quest'}
                                    </h4>
                                    <p className="text-shire-bark">
                                      {formatQuestData(quest)}
                                    </p>
                                    <div className="flex items-center space-x-4 mt-2 text-xs text-shire-bark">
                                      {quest.quest_type.toUpperCase() === 'GEO' && quest.data.proximity_range && (
                                        <span className="flex items-center space-x-1">
                                          <MapPin className="h-3 w-3" />
                                          <span>±{quest.data.proximity_range}m</span>
                                        </span>
                                      )}
                                      {quest.quest_type.toUpperCase() === 'TIME' && quest.data.release_date && (
                                        <span className="flex items-center space-x-1">
                                          <Calendar className="h-3 w-3" />
                                          <span>Releases: {new Date(quest.data.release_date).toLocaleDateString()}</span>
                                        </span>
                                      )}
                                      {quest.quest_type.toUpperCase() === 'FRIEND' && quest.data.friend_email && (
                                        <span className="flex items-center space-x-1">
                                          <Mail className="h-3 w-3" />
                                          <span>{quest.data.friend_email}</span>
                                        </span>
                                      )}
                                      {quest.quest_type.toUpperCase() === 'PAYWALL' && quest.data.charity && (
                                        <span className="flex items-center space-x-1">
                                          <Coins className="h-3 w-3" />
                                          <span>To: {quest.data.charity}</span>
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(quest.status)}`}>
                                    {quest.status.toUpperCase()}
                                  </span>
                                  {quest.status.toUpperCase() !== 'COMPLETE' && (
                                    <button
                                      onClick={() => handleAttemptQuest(quest.id)}
                                      className="px-4 py-2 bg-shire-sun text-shire-dark rounded-lg font-semibold hover:bg-shire-bark hover:text-shire-light transition-colors"
                                    >
                                      Attempt
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {unlockable && (
                        <div className="mt-6 p-4 bg-gradient-to-r from-shire-moss/20 to-shire-sun/20 rounded-lg border-2 border-shire-moss">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Unlock className="h-6 w-6 text-shire-moss" />
                              <div>
                                <h4 className="font-semibold text-shire-dark">Quest Complete!</h4>
                                <p className="text-shire-bark">You have gathered enough shares to unlock this account.</p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                // Handle unlock logic
                                alert('Unlock functionality would be implemented here')
                              }}
                              className="px-6 py-3 bg-shire-moss text-shire-dark rounded-full font-semibold hover:bg-shire-bark hover:text-shire-light transition-colors shadow-lg"
                            >
                              Unlock Account
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </AppShell>
  )
}

export default withAuthenticationRequired(Vault, {
  onRedirecting: () => <QuestLoader />
})
