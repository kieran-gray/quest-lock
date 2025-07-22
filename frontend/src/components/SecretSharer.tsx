import React, { useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'

const secrets = (window as any).secrets
const SECRET_LENGTH = 32

const SecretSharer: React.FC = () => {
  const [error, setError] = useState<string | null>(null)
  const [secret, setSecret] = useState('MySecretPassword123')
  const [numShares, setNumShares] = useState(5)
  const [threshold, setThreshold] = useState(3)
  const [shares, setShares] = useState<string[]>([])
  const [manualShares, setManualShares] = useState<string>('')
  const [reconstructed, setReconstructed] = useState<string>('')
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const generateSecret = () => {
    let password = ''
    for (let i = 0; i < SECRET_LENGTH; i++) {
      const choice = random(0, 3)
      if (choice === 0) password += randomLower()
      else if (choice === 1) password += randomUpper()
      else if (choice === 2) password += randomSymbol()
      else if (choice === 3) password += random(0, 9)
      else i--
    }
    setSecret(password)
  }

  const random = (min = 0, max = 1) =>
    Math.floor(Math.random() * (max + 1 - min) + min)
  const randomLower = () => String.fromCharCode(random(97, 122))
  const randomUpper = () => String.fromCharCode(random(65, 90))
  const randomSymbol = () => {
    const symbols = "~*$%@#^&!?*'-=/,.{}()[]<>"
    return symbols[random(0, symbols.length - 1)]
  }

  const createShares = () => {
    try {
      const secretHex = secrets.str2hex(secret)
      const newShares = secrets.share(secretHex, numShares, threshold)
      setShares(newShares)
      setError(null)
    } catch (err) {
      setError(
        `Failed to create shares: ${
          err instanceof Error ? err.message : String(err)
        }`
      )
      console.error(err)
    }
  }

  const combineShares = (useManual = false) => {
    let sharesToUse: string[] = []

    if (useManual) {
      const manualSharesList = manualShares
        .split('\n')
        .map((share) => share.trim())
        .filter(Boolean)
      if (manualSharesList.length === 0) {
        setError('No manual shares entered')
        return
      }
      sharesToUse = manualSharesList
    } else {
      if (shares.length === 0) {
        setError('No shares available')
        return
      }
      sharesToUse = shares.slice(0, threshold)
    }

    try {
      const reconstructedHex = secrets.combine(sharesToUse)
      const reconstructedSecret = secrets.hex2str(reconstructedHex)
      setReconstructed(reconstructedSecret)
      setError(null)
    } catch (err) {
      setError(
        `Failed to combine shares: ${
          err instanceof Error ? err.message : String(err)
        }`
      )
      console.error(err)
    }
  }

  return (
    <div className="bg-shire-light px-6 py-12 font-body text-shire-dark">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-center font-heading text-4xl">How It Works</h1>
        <p className="mx-auto mb-10 max-w-3xl text-center text-lg">
          Quest-Lock uses <strong>Shamir’s Secret Sharing</strong> to lock your
          password behind multiple pieces. To recover your password, you must
          collect a minimum number of shares—each hidden behind a real-world
          quest.
        </p>

        {error && (
          <div className="mb-6 rounded border border-red-300 bg-red-100 p-4 text-red-800">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="grid gap-10 md:grid-cols-2">
          {/* Create Shares */}
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 font-heading text-2xl">Create Secret Shares</h2>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-semibold">Secret</label>
              <Input disabled type="password" placeholder={secret} />
            </div>

            <div className="mb-4 grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="hover:bg-shire-moss"
                onClick={() => navigator.clipboard.writeText(secret)}
              >
                Copy
              </Button>
              <Button
                className="bg-shire-pine hover:bg-shire-bark"
                onClick={generateSecret}
              >
                Generate Secret
              </Button>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-semibold">
                  Total Shares
                </label>
                <input
                  type="number"
                  value={numShares}
                  onChange={(e) => setNumShares(parseInt(e.target.value))}
                  min="2"
                  max="255"
                  className="w-full rounded border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold">
                  Threshold
                </label>
                <input
                  type="number"
                  value={threshold}
                  onChange={(e) => setThreshold(parseInt(e.target.value))}
                  min="2"
                  max={numShares}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                />
              </div>
            </div>

            <Button
              className="w-full bg-shire-pine text-white hover:bg-shire-bark"
              onClick={createShares}
            >
              Create Shares
            </Button>

            {shares.map((share, index) => (
              <div
                key={index}
                className={`mb-1 cursor-pointer break-all rounded p-2 font-mono text-xs transition ${
                  copiedIndex === index
                    ? 'bg-green-100 text-green-800'
                    : 'bg-shire-stone hover:bg-shire-moss'
                }`}
                title="Click to copy"
                onClick={() => {
                  navigator.clipboard.writeText(share)
                  setCopiedIndex(index)
                  setTimeout(() => setCopiedIndex(null), 1000)
                }}
              >
                Share {index + 1}:{' '}
                {copiedIndex === index ? <em>Copied!</em> : share}
              </div>
            ))}
          </div>

          {/* Reconstruct Secret */}
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 font-heading text-2xl">
              Reconstruct the Secret
            </h2>

            <div className="mb-6">
              <h3 className="mb-2 font-semibold">From Generated Shares</h3>
              <Button
                disabled={shares.length === 0}
                onClick={() => combineShares(false)}
                className="w-full bg-shire-moss text-shire-dark hover:bg-shire-pine"
              >
                Reconstruct from Generated Shares
              </Button>
            </div>

            <div className="mb-6">
              <h3 className="mb-2 font-semibold">From Manual Shares</h3>
              <textarea
                value={manualShares}
                onChange={(e) => setManualShares(e.target.value)}
                rows={5}
                className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-xs"
                placeholder="Paste shares here, one per line..."
              />
              <Button
                disabled={!manualShares.trim()}
                onClick={() => combineShares(true)}
                className="mt-3 w-full bg-shire-sun text-shire-dark hover:bg-shire-bark hover:text-shire-light"
              >
                Reconstruct from Manual Shares
              </Button>
            </div>

            {reconstructed && (
              <div className="mt-6 space-y-3">
                <div className="rounded bg-shire-stone p-3">
                  <strong>Reconstructed Secret:</strong> {reconstructed}
                </div>
                <div
                  className={`rounded p-3 font-semibold ${
                    secret === reconstructed
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  Match: {secret === reconstructed ? '✓ Success!' : '✗ Failed'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SecretSharer
