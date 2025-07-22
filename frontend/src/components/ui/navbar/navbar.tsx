import { Button } from '@/components/ui/button'
import logo from './QuestLockHeaderLogo.png'
import NavMenu from './nav-menu'
import { NavigationSheet } from './navigation-sheet'
import { useAuth0 } from '@auth0/auth0-react'

const NavbarPage = () => {
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0()

  const logoutWithRedirect = () =>
    logout({
      logoutParams: {
        returnTo: 'https://quest-lock.com' // TODO
      }
    })

  return (
    <>
      <nav className="fixed inset-x-4 top-6 z-50 mx-auto h-20 max-w-screen-xl rounded-full border bg-background dark:border-slate-700/70">
        <div className="mx-auto flex h-full items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <img src={logo} className="size-16" />
            <span className="hidden font-heading text-2xl text-foreground sm:inline">
              Quest-Lock
            </span>
          </div>
          <NavMenu className="hidden md:block" />

          <div className="flex items-center gap-3">
            {!isAuthenticated && (
              <>
                <Button
                  variant="outline"
                  className="hidden rounded-full font-ui hover:brightness-90 sm:inline-flex"
                  onClick={() => loginWithRedirect()}
                >
                  Sign In
                </Button>
                <Button
                  className="rounded-full bg-shire-sun text-shire-dark hover:bg-shire-bark hover:text-shire-light"
                  onClick={() => loginWithRedirect()}
                >
                  Get Started
                </Button>
              </>
            )}
            {isAuthenticated && (
              <Button
                variant="outline"
                className="hidden rounded-full font-ui hover:brightness-90 sm:inline-flex"
                onClick={() => logoutWithRedirect()}
              >
                Sign Out
              </Button>
            )}
            <div className="md:hidden">
              <NavigationSheet />
            </div>
          </div>
        </div>
      </nav>
      <div className="h-32 bg-white"></div>
    </>
  )
}

export default NavbarPage
