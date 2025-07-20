import SecretSharer from './SecretSharer'

function Home() {
  return (
    <div className="relative overflow-hidden bg-white">
      <div className="h-screen sm:pb-40 sm:pt-24 lg:pb-48 lg:pt-40">
        <div className="relative mx-auto max-w-7xl px-4 sm:static sm:px-6 lg:px-8">
          <div>
            <SecretSharer />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
