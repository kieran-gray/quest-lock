import { Link } from 'react-router-dom'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList
} from '@/components/ui/navigation-menu'
import { NavigationMenuProps } from '@radix-ui/react-navigation-menu'
import { useAuth0 } from '@auth0/auth0-react'

export default function NavMenu(props: NavigationMenuProps) {
  const { isAuthenticated } = useAuth0()

  return (
    <NavigationMenu {...props}>
      <NavigationMenuList className="gap-6 space-x-0 font-body data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start">
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link to="/">Home</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link to="/shamir-secret-sharing">Secret Sharing Demo</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        {isAuthenticated && (
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link to="/vault">Your Vault</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
