import AppShell from '@/components/AppShell'
import SecretSharer from '@/components/SecretSharer'

function SecretSharingDemo() {
  return (
    <AppShell>
      <div className="bg-white">
        <SecretSharer />
        <section className="bg-shire-stone py-20">
          <div className="mx-auto max-w-4xl px-6">
            <div className="mb-12 text-center">
              <h2 className="font-heading text-4xl text-shire-dark">
                Your Security is the Heart of Our Quest
              </h2>
              <p className="mt-2 text-lg text-gray-600">
                We designed Quest-Lock with a zero-knowledge promise. Here’s how
                it works.
              </p>
            </div>

            <div className="grid gap-8 text-center md:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
                <div className="mb-4 flex justify-center">
                  <svg
                    className="size-12 text-shire-pine"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    ></path>
                  </svg>
                </div>
                <h3 className="mb-2 font-heading text-xl">On-Device Trust</h3>
                <p className="text-gray-700">
                  Your master password is created and split into 10 shares{' '}
                  <strong>entirely on your device</strong>. We never see it,
                  transmit it, or store it.
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
                <div className="mb-4 flex justify-center">
                  <svg
                    className="size-12 text-shire-pine"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    ></path>
                  </svg>
                </div>
                <h3 className="mb-2 font-heading text-xl">
                  Two Halves of a Map
                </h3>
                <p className="text-gray-700">
                  You hold 5 shares locally, and we hold 5 on our server.
                  Neither party has enough to reconstruct the password alone,
                  ensuring security through separation.
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
                <div className="mb-4 flex justify-center">
                  <svg
                    className="size-12 text-shire-pine"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    ></path>
                  </svg>
                </div>
                <h3 className="mb-2 font-heading text-xl">You Hold the Keys</h3>
                <p className="text-gray-700">
                  Your password can only be rebuilt after{' '}
                  <strong>you physically complete your quests</strong> and
                  combine the server shares with your local ones.
                </p>
              </div>
            </div>

            <div className="mt-16 rounded-r-lg border-l-4 border-red-600 bg-red-50 p-6">
              <div className="flex">
                <div className="shrink-0">
                  <svg
                    className="size-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    ></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="font-heading text-xl text-red-800">
                    A Solemn Responsibility
                  </h3>
                  <p className="mt-2 text-red-700">
                    It is extremely important that you{' '}
                    <strong>securely store your 5 local shares.</strong> If you
                    lose them, your password—and access to your account—will be
                    lost forever. We cannot recover them for you.
                  </p>
                  <p className="mt-3 text-sm text-red-600">
                    <strong>Recommendation:</strong> Back them up in an
                    encrypted note, a secure cloud drive, or print them and
                    store them physically in a safe place.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  )
}

export default SecretSharingDemo
