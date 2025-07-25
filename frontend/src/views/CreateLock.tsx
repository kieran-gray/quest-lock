import { useAuth0, withAuthenticationRequired } from '@auth0/auth0-react'
import AppShell from '@/components/AppShell'
import QuestLoader from '@/components/QuestLoader'
import { useState } from 'react'
import { createShares, generateSecret } from '@/utils/secrets'
import { ChevronDown, ChevronUp, MapPin, Clock, User, DollarSign, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type QuestType = 'GEO' | 'TIME' | 'FRIEND' | 'PAYWALL'

interface Quest {
  quest_type: QuestType
  data: Record<string, string>
  share: string
  id: string
}

const QuestTypeInfo = {
  GEO: {
    icon: MapPin,
    title: 'Geographic Quest',
    description: 'Lock a share behind a real-world location. You must physically travel there and provide proof.',
    color: 'text-green-700'
  },
  TIME: {
    icon: Clock,
    title: 'Time-Delayed Quest',
    description: 'Lock a share behind time itself. The share will only be released after your chosen date.',
    color: 'text-blue-700'
  },
  FRIEND: {
    icon: User,
    title: 'Trusted Guardian Quest',
    description: 'Entrust a share to a friend or family member. They hold the key to your return.',
    color: 'text-purple-700'
  },
  PAYWALL: {
    icon: DollarSign,
    title: 'Financial Commitment Quest',
    description: 'Lock a share behind a monetary commitment. Pay the price of your past habits.',
    color: 'text-orange-700'
  }
}

export const CreateLock = () => {
  const [label, setLabel] = useState('')
  const [quests, setQuests] = useState<Quest[]>([])
  const [password, setPassword] = useState('')
  const [isPasswordGenerated, setIsPasswordGenerated] = useState(false)
  const [expandedQuest, setExpandedQuest] = useState<string | null>(null)
  const { getAccessTokenSilently } = useAuth0()
  const navigate = useNavigate()

  const addQuest = (type: QuestType) => {
    if (quests.length < 5) {
      const newQuest = {
        quest_type: type,
        data: {},
        share: '',
        id: Math.random().toString(36).substr(2, 9)
      }
      setQuests([...quests, newQuest])
      setExpandedQuest(newQuest.id)
    }
  }

  const removeQuest = (questId: string) => {
    setQuests(quests.filter(q => q.id !== questId))
    if (expandedQuest === questId) {
      setExpandedQuest(null)
    }
  }

  const updateQuestData = (questId: string, data: Record<string, string>) => {
    setQuests(quests.map(quest => 
      quest.id === questId ? { ...quest, data } : quest
    ))
  }

  const toggleQuestExpansion = (questId: string) => {
    setExpandedQuest(expandedQuest === questId ? null : questId)
  }

  const handleGeneratePassword = () => {
    if (quests.length > 0) {
      const newPassword = generateSecret()
      setPassword(newPassword)
      setIsPasswordGenerated(true)
    } else {
      alert('Please add at least one quest before generating your password.')
    }
  }

  const handleCreateLock = async () => {
    if (!isPasswordGenerated) {
      alert('Please generate the password first.')
      return
    }

    for (const quest of quests) {
      if (quest.quest_type === 'GEO' && (!quest.data.location_name || !quest.data.latitude || !quest.data.longitude)) {
        alert('Please complete all geographic quest details.')
        return
      }
      if (quest.quest_type === 'TIME' && !quest.data.release_date) {
        alert('Please set the release date for all time-based quests.')
        return
      }
      if (quest.quest_type === 'FRIEND' && !quest.data.friend_email) {
        alert('Please provide contact information for all guardian quests.')
        return
      }
      if (quest.quest_type === 'PAYWALL' && !quest.data.amount) {
        alert('Please set the amount for all financial commitment quests.')
        return
      }
    }

    const shares = createShares(password, 10, 6)
    const userShares: string[] = shares.slice(0, 5)
    const serverShares: string[] = shares.slice(5)

    const transmitQuests: Quest[] = quests.map((quest, index) => {
      return {
        ...quest,
        share: btoa(serverShares[index])
      }
    })

    const createLockRequest = {
      label: label || 'My Locked Account',
      total_shares: 10,
      threshold: 6,
      quests: transmitQuests
    }

    try {
      const token = await getAccessTokenSilently()
      const response = await fetch('http://localhost:8000/api/v1/lock/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(createLockRequest)
      })

      if (response.ok) {
        alert('Lock created successfully! Your quest begins now.')
        navigate('/vault')
      } else {
        const errorData = await response.json()
        alert(
          `Failed to create lock: ${errorData.message || response.statusText}`
        )
      }
    } catch (error) {
      console.error('Error creating lock:', error)
      alert(
        'An error occurred while creating the lock. See the console for more details.'
      )
    }
  }

  const renderQuestDetails = (quest: Quest) => {
    const { icon: Icon, title, description, color } = QuestTypeInfo[quest.quest_type]
    const isExpanded = expandedQuest === quest.id

    return (
      <div key={quest.id} className="rounded-lg bg-shire-light border-2 border-shire-bark shadow-md">
        <div 
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-shire-stone transition-colors"
          onClick={() => toggleQuestExpansion(quest.id)}
        >
          <div className="flex items-center space-x-3">
            <Icon className={`h-6 w-6 ${color}`} />
            <div>
              <h3 className="font-heading text-lg text-shire-dark">{title}</h3>
              <p className="text-sm text-shire-bark">{description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                removeQuest(quest.id)
              }}
              className="p-1 text-red-600 hover:bg-red-100 rounded"
            >
              <X className="h-5 w-5" />
            </button>
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </div>

        {isExpanded && (
          <div className="border-t border-shire-bark p-6 bg-white">
            {quest.quest_type === 'GEO' && (
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-yellow-800">
                        <strong>⚠️ Here Be Dragons!</strong> Choose your location wisely. You must physically journey there to reclaim this share. Consider accessibility, travel costs, and seasonal conditions.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-shire-bark mb-2">
                    Location Name *
                  </label>
                  <input
                    type="text"
                    value={quest.data.location_name || ''}
                    onChange={(e) => updateQuestData(quest.id, { ...quest.data, location_name: e.target.value })}
                    placeholder="e.g., Stonehenge, Big Ben, Your childhood home"
                    className="w-full p-3 border border-shire-bark rounded-md focus:ring-2 focus:ring-shire-sun focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-shire-bark mb-2">
                      Latitude *
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={quest.data.latitude || ''}
                      onChange={(e) => updateQuestData(quest.id, { ...quest.data, latitude: e.target.value })}
                      placeholder="51.1789"
                      className="w-full p-3 border border-shire-bark rounded-md focus:ring-2 focus:ring-shire-sun focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-shire-bark mb-2">
                      Longitude *
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={quest.data.longitude || ''}
                      onChange={(e) => updateQuestData(quest.id, { ...quest.data, longitude: e.target.value })}
                      placeholder="-1.8262"
                      className="w-full p-3 border border-shire-bark rounded-md focus:ring-2 focus:ring-shire-sun focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="bg-shire-stone p-4 rounded-lg">
                  <h4 className="font-semibold text-shire-dark mb-2">📍 Interactive Map (Coming Soon)</h4>
                  <div className="h-64 bg-gray-200 rounded border-2 border-dashed border-gray-400 flex items-center justify-center">
                    <div className="text-center text-gray-600">
                      <MapPin className="h-12 w-12 mx-auto mb-2" />
                      <p>Map component will be integrated here</p>
                      <p className="text-sm">Click to set coordinates visually</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-shire-bark mb-2">
                    Proximity Range (meters)
                  </label>
                  <input
                    type="number"
                    value={quest.data.proximity_range || '100'}
                    onChange={(e) => updateQuestData(quest.id, { ...quest.data, proximity_range: e.target.value })}
                    className="w-full p-3 border border-shire-bark rounded-md focus:ring-2 focus:ring-shire-sun focus:border-transparent"
                    min="10"
                    max="1000"
                  />
                  <p className="text-xs text-shire-bark mt-1">How close you need to be to the location (10-1000 meters)</p>
                </div>
              </div>
            )}

            {quest.quest_type === 'TIME' && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-blue-800">
                        <strong>⏰ The Passage of Time</strong> This share will remain locked until your chosen moment. Time flows for no one - choose wisely, for you cannot hasten its release.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-shire-bark mb-2">
                    Release Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={quest.data.release_date || ''}
                    onChange={(e) => updateQuestData(quest.id, { ...quest.data, release_date: e.target.value })}
                    className="w-full p-3 border border-shire-bark rounded-md focus:ring-2 focus:ring-shire-sun focus:border-transparent"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <p className="text-xs text-shire-bark mt-1">The earliest moment this share can be claimed</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-shire-bark mb-2">
                    Quest Description
                  </label>
                  <textarea
                    value={quest.data.description || ''}
                    onChange={(e) => updateQuestData(quest.id, { ...quest.data, description: e.target.value })}
                    placeholder="e.g., After 30 days of reflection, After my birthday, When the project is complete..."
                    className="w-full p-3 border border-shire-bark rounded-md focus:ring-2 focus:ring-shire-sun focus:border-transparent"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {quest.quest_type === 'FRIEND' && (
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 border-l-4 border-purple-400 rounded">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-purple-800">
                        <strong>🤝 The Fellowship</strong> Choose your guardian wisely. They will hold a key to your return and must be someone you trust completely. This quest requires their consent and participation.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-shire-bark mb-2">
                    Guardian's Name *
                  </label>
                  <input
                    type="text"
                    value={quest.data.friend_name || ''}
                    onChange={(e) => updateQuestData(quest.id, { ...quest.data, friend_name: e.target.value })}
                    placeholder="Their full name"
                    className="w-full p-3 border border-shire-bark rounded-md focus:ring-2 focus:ring-shire-sun focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-shire-bark mb-2">
                    Guardian's Email *
                  </label>
                  <input
                    type="email"
                    value={quest.data.friend_email || ''}
                    onChange={(e) => updateQuestData(quest.id, { ...quest.data, friend_email: e.target.value })}
                    placeholder="their.email@example.com"
                    className="w-full p-3 border border-shire-bark rounded-md focus:ring-2 focus:ring-shire-sun focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-shire-bark mb-2">
                    Message to Guardian
                  </label>
                  <textarea
                    value={quest.data.message || ''}
                    onChange={(e) => updateQuestData(quest.id, { ...quest.data, message: e.target.value })}
                    placeholder="Explain why you're entrusting them with this responsibility..."
                    className="w-full p-3 border border-shire-bark rounded-md focus:ring-2 focus:ring-shire-sun focus:border-transparent"
                    rows={4}
                  />
                </div>
              </div>
            )}

            {quest.quest_type === 'PAYWALL' && (
              <div className="space-y-4">
                <div className="p-4 bg-orange-50 border-l-4 border-orange-400 rounded">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-orange-800">
                        <strong>💰 The Price of Return</strong> Set a financial commitment that reflects the true cost of your digital habits. This payment will be required to unlock this share.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-shire-bark mb-2">
                    Amount (GBP) *
                  </label>
                  <input
                    type="number"
                    value={quest.data.amount || ''}
                    onChange={(e) => updateQuestData(quest.id, { ...quest.data, amount: e.target.value })}
                    placeholder="50.00"
                    className="w-full p-3 border border-shire-bark rounded-md focus:ring-2 focus:ring-shire-sun focus:border-transparent"
                    min="1"
                    step="0.01"
                  />
                  <p className="text-xs text-shire-bark mt-1">The amount you must pay to unlock this share</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-shire-bark mb-2">
                    Charity Recipient (Optional)
                  </label>
                  <input
                    type="text"
                    value={quest.data.charity || ''}
                    onChange={(e) => updateQuestData(quest.id, { ...quest.data, charity: e.target.value })}
                    placeholder="e.g., Mind, Oxfam, Local Food Bank"
                    className="w-full p-3 border border-shire-bark rounded-md focus:ring-2 focus:ring-shire-sun focus:border-transparent"
                  />
                  <p className="text-xs text-shire-bark mt-1">If specified, payment will go to this charity instead of being lost</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-shire-bark mb-2">
                    Purpose/Reminder
                  </label>
                  <textarea
                    value={quest.data.purpose || ''}
                    onChange={(e) => updateQuestData(quest.id, { ...quest.data, purpose: e.target.value })}
                    placeholder="e.g., The cost of mindless scrolling, Investment in my future self..."
                    className="w-full p-3 border border-shire-bark rounded-md focus:ring-2 focus:ring-shire-sun focus:border-transparent"
                    rows={3}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-shire-light font-body text-shire-dark">
        <div className="container mx-auto px-6 py-12">
          <div className="mb-8 text-center">
            <h1 className="mb-4 font-heading text-4xl text-shire-dark">
              Forge Your Quest-Lock
            </h1>
            <p className="text-lg text-shire-bark max-w-2xl mx-auto">
              Design the trials that will guard your return. Choose wisely, for these quests will determine the path back to your digital realm.
            </p>
          </div>

          <div className="space-y-8 rounded-lg bg-shire-stone p-8 shadow-md">
            <div>
              <label
                htmlFor="lock-label"
                className="mb-2 block text-lg font-semibold text-shire-bark"
              >
                Quest Name (Optional)
              </label>
              <input
                id="lock-label"
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g., The Instagram Exile, Twitter Sabbatical, Digital Detox Challenge"
                className="w-full rounded-md bg-white p-3 border border-shire-bark focus:ring-2 focus:ring-shire-sun focus:border-transparent"
              />
            </div>

            <div>
              <h2 className="mb-4 font-heading text-2xl flex items-center">
                <span className="bg-shire-sun text-shire-dark rounded-full w-8 h-8 flex items-center justify-center mr-3 font-bold">1</span>
                Design Your Trials (up to 5)
              </h2>
              
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-800">
                      <strong>⚠️ Warning:</strong> Each quest represents a real barrier to accessing your account. Choose carefully - these are not mere suggestions but actual requirements you must fulfill to regain access. Consider your future self's motivation and capabilities.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(QuestTypeInfo).map(([type, info]) => {
                  const Icon = info.icon
                  return (
                    <button
                      key={type}
                      onClick={() => addQuest(type as QuestType)}
                      className="p-4 border-2 border-shire-bark rounded-lg bg-white hover:bg-shire-sun hover:border-shire-sun transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
                      disabled={quests.length >= 5}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className={`h-6 w-6 ${info.color} flex-shrink-0 mt-1`} />
                        <div>
                          <h3 className="font-semibold text-shire-dark">{info.title}</h3>
                          <p className="text-sm text-shire-bark mt-1">{info.description}</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="space-y-4">
                {quests.map(renderQuestDetails)}
                {quests.length === 0 && (
                  <div className="text-center py-12 text-shire-bark">
                    <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>No quests designed yet. Add your first trial above.</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="mb-4 font-heading text-2xl flex items-center">
                <span className="bg-shire-sun text-shire-dark rounded-full w-8 h-8 flex items-center justify-center mr-3 font-bold">2</span>
                Forge the Secret Key
              </h2>
              {!isPasswordGenerated ? (
                <div className="space-y-4">
                  <p className="text-shire-bark">
                    This will generate a unique, unbreakable password for your social media account. Once created, this password will be split into mystical shares - some for you to guard, others locked behind your chosen quests.
                  </p>
                  <button
                    onClick={handleGeneratePassword}
                    className="rounded-full bg-shire-sun px-6 py-3 font-ui text-lg text-shire-dark shadow-lg hover:bg-shire-bark hover:text-shire-light transition-colors"
                  >
                    Generate the Secret Key
                  </button>
                </div>
              ) : (
                <div className="rounded-lg bg-shire-light p-6 border-2 border-shire-moss">
                  <p className="text-shire-bark mb-3 font-semibold">Your secret key has been forged:</p>
                  <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-lg mb-4 border">
                    {password}
                  </div>
                  <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded">
                    <p className="text-sm text-red-800">
                      <strong>🔥 This is your only chance!</strong> Copy this password immediately and use it to change your social media password. Once you create the lock, this key will be scattered to the winds - split into shares that can only be reunited through completing your quests.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h2 className="mb-4 font-heading text-2xl flex items-center">
                <span className="bg-shire-sun text-shire-dark rounded-full w-8 h-8 flex items-center justify-center mr-3 font-bold">3</span>
                Seal Your Fate
              </h2>
              <div className="space-y-4">
                <p className="text-shire-bark">
                  Ready to commit to your quest? This action will lock your password shares behind the trials you've designed. There is no going back - only forward through the challenges you've set.
                </p>
                <button
                  onClick={handleCreateLock}
                  disabled={!isPasswordGenerated || quests.length === 0}
                  className="rounded-full bg-shire-moss px-8 py-4 font-ui text-xl text-shire-dark shadow-lg hover:bg-shire-bark hover:text-shire-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cast into the Vault
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

export default withAuthenticationRequired(CreateLock, {
  onRedirecting: () => <QuestLoader />
})