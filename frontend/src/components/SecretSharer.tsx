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

  const generateSecret = () => {
    let password = ''
    for (let i = 0; i < SECRET_LENGTH; i++) {
      const choice = random(0, 3)
      if (choice === 0) {
        password += randomLower()
      } else if (choice === 1) {
        password += randomUpper()
      } else if (choice === 2) {
        password += randomSymbol()
      } else if (choice === 3) {
        password += random(0, 9)
      } else {
        i--
      }
    }
    setSecret(password)
  }
  const random = (min = 0, max = 1) => {
    return Math.floor(Math.random() * (max + 1 - min) + min)
  }

  const randomLower = () => {
    return String.fromCharCode(random(97, 122))
  }

  const randomUpper = () => {
    return String.fromCharCode(random(65, 90))
  }

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
    if (!secrets || shares.length === 0) {
      setError('No shares available')
      return
    }

    let sharesToUse: string[] = []

    if (useManual) {
      const manualSharesList = manualShares
        .split('\n')
        .map((share) => share.trim())
        .filter((share) => share.length > 0)

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
    <div className="mx-auto max-w-4xl bg-white p-6">
      <h1 className="mb-6 text-3xl font-bold text-gray-800">
        Shamir Secret Sharing
      </h1>

      {error && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="mb-6 rounded-lg bg-white p-4 shadow">
        <h3 className="mb-2 font-medium">How it works:</h3>
        <p className="text-sm text-gray-600">
          This demo uses Shamir&apos;s Secret Sharing to split a secret into
          multiple shares. Any {threshold} shares out of the {numShares} total
          can reconstruct the original secret, but fewer than {threshold} shares
          reveal no information about the secret.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">Create Secret Shares</h2>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Secret:
              </label>
              <Input disabled type="password" placeholder={secret} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button onClick={() => navigator.clipboard.writeText(secret)}>
                copy
              </Button>
              <Button onClick={generateSecret}>Generate Secret</Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Total Shares:
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
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Threshold:
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

            <button
              onClick={createShares}
              className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-gray-300"
            >
              Create Shares
            </button>
          </div>

          {shares.length > 0 && (
            <div className="mt-4">
              <h3 className="mb-2 font-medium">Generated Shares:</h3>
              <div className="max-h-40 overflow-y-auto">
                {shares.map((share, index) => (
                  <div
                    key={index}
                    className="mb-1 break-all rounded bg-gray-100 p-2 font-mono text-xs"
                  >
                    Share {index + 1}: {share}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">Reconstruct Secret</h2>

          <div className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="mb-2 font-medium">From Generated Shares</h3>
              <p className="mb-3 text-sm text-gray-600">
                Using {threshold} out of {shares.length} generated shares to
                reconstruct the secret.
              </p>

              <button
                onClick={() => combineShares(false)}
                disabled={shares.length === 0}
                className="w-full rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:bg-gray-300"
              >
                Reconstruct from Generated Shares
              </button>
            </div>

            <div>
              <h3 className="mb-2 font-medium">From Manual Shares</h3>
              <p className="mb-3 text-sm text-gray-600">
                Enter shares manually (one per line):
              </p>

              <textarea
                value={manualShares}
                onChange={(e) => setManualShares(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-xs"
                rows={6}
                placeholder="Paste shares here, one per line..."
              />

              <button
                onClick={() => combineShares(true)}
                disabled={!manualShares.trim()}
                className="mt-3 w-full rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600 disabled:bg-gray-300"
              >
                Reconstruct from Manual Shares
              </button>
            </div>

            {reconstructed && (
              <div className="mt-4">
                <h3 className="mb-2 font-medium">Results:</h3>
                <div className="space-y-2">
                  <div className="rounded bg-gray-100 p-3">
                    <strong>Reconstructed Secret:</strong> {reconstructed}
                  </div>
                  {shares.length > 0 && (
                    <>
                      <div className="rounded bg-gray-100 p-3">
                        <strong>Original:</strong> {secret}
                      </div>
                      <div
                        className={`rounded p-3 ${
                          secret === reconstructed
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        <strong>Match:</strong>{' '}
                        {secret === reconstructed ? '✓ Success!' : '✗ Failed'}
                      </div>
                    </>
                  )}
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
