import {
  createRouter,
  createRootRoute,
  createRoute,
  Outlet,
  Link
} from '@tanstack/react-router'
import { Moon, Sun, Monitor } from 'lucide-react'
import { ThemeProvider, useTheme } from '@/components/theme-provider'
import { AppSidebar } from '@/components/app-sidebar'
import { NavActions } from '@/components/nav-actions'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { TabContainer } from '@/components/tab-container'
import { useConnectionStore } from '@/stores'
import { cn } from '@/lib/utils'

// Root Layout
function RootLayout() {
  const activeConnection = useConnectionStore((s) => s.getActiveConnection())

  return (
    <ThemeProvider defaultTheme="dark" storageKey="data-peek-theme">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="titlebar-drag-region flex h-14 shrink-0 items-center gap-2 border-b border-border/40 bg-background/80 backdrop-blur-xl">
            <div className="flex flex-1 items-center gap-2 px-3">
              <SidebarTrigger className="titlebar-no-drag" />
              <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
              <span className="text-sm font-medium text-muted-foreground">data-peek</span>
              {activeConnection && (
                <>
                  <Separator
                    orientation="vertical"
                    className="mx-2 data-[orientation=vertical]:h-4"
                  />
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`size-1.5 rounded-full ${activeConnection.isConnected ? 'bg-green-500' : 'bg-yellow-500'}`}
                    />
                    <span className="text-sm text-foreground">{activeConnection.name}</span>
                  </div>
                </>
              )}
            </div>
            <div className="titlebar-no-drag ml-auto px-3">
              <NavActions />
            </div>
          </header>

          <Outlet />
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  )
}

// Theme Option Component
function ThemeOption({
  value,
  label,
  icon: Icon,
  currentTheme,
  onSelect
}: {
  value: 'light' | 'dark' | 'system'
  label: string
  icon: typeof Sun
  currentTheme: string
  onSelect: (theme: 'light' | 'dark' | 'system') => void
}) {
  const isSelected = currentTheme === value

  return (
    <button
      onClick={() => onSelect(value)}
      className={cn(
        'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all',
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border/50 hover:border-border hover:bg-muted/50'
      )}
    >
      <div
        className={cn(
          'flex size-12 items-center justify-center rounded-full',
          isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        )}
      >
        <Icon className="size-6" />
      </div>
      <span className={cn('text-sm font-medium', isSelected && 'text-primary')}>{label}</span>
    </button>
  )
}

// Settings Page
function SettingsPage() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex flex-1 flex-col p-6 overflow-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
          ← Back
        </Link>
        <h1 className="text-2xl font-semibold">Settings</h1>
      </div>
      <div className="space-y-6 max-w-2xl">
        {/* Appearance */}
        <div className="rounded-lg border border-border/50 bg-card p-4">
          <h2 className="text-lg font-medium mb-2">Appearance</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Choose your preferred theme for the application.
          </p>
          <div className="grid grid-cols-3 gap-3">
            <ThemeOption
              value="light"
              label="Light"
              icon={Sun}
              currentTheme={theme}
              onSelect={setTheme}
            />
            <ThemeOption
              value="dark"
              label="Dark"
              icon={Moon}
              currentTheme={theme}
              onSelect={setTheme}
            />
            <ThemeOption
              value="system"
              label="System"
              icon={Monitor}
              currentTheme={theme}
              onSelect={setTheme}
            />
          </div>
        </div>

        {/* Connections */}
        <div className="rounded-lg border border-border/50 bg-card p-4">
          <h2 className="text-lg font-medium mb-2">Connections</h2>
          <p className="text-sm text-muted-foreground">
            Manage your database connections and credentials.
          </p>
        </div>

        {/* Editor */}
        <div className="rounded-lg border border-border/50 bg-card p-4">
          <h2 className="text-lg font-medium mb-2">Editor</h2>
          <p className="text-sm text-muted-foreground">
            Customize the query editor appearance and behavior.
          </p>
        </div>
      </div>
    </div>
  )
}

// Create routes
const rootRoute = createRootRoute({
  component: RootLayout
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: TabContainer
})

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage
})

// Create route tree
const routeTree = rootRoute.addChildren([indexRoute, settingsRoute])

// Create router
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  // Use memory history for Electron (no URL bar)
  history: undefined
})

// Type declaration for router
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
