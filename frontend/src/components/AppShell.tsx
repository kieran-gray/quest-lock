import NavbarPage from './ui/navbar/navbar'

interface AppShellProps {
  children?: React.ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <>
      <NavbarPage />
      {children}
      <footer className="py-10 text-center font-ui text-sm text-shire-bark">
        © 2025 Quest-Lock — For intentional digital living
      </footer>
    </>
  )
}
