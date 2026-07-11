import { Outlet, Navigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { Sidebar } from "./Sidebar"
import { NotificationsDropdown } from "@/features/notifications/NotificationsDropdown"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Menu } from "lucide-react"
import { useAppStore } from "@/store/useAppStore"

interface PortalLayoutProps {
  allowedRoles: string[]
  basePath: string
}

export function PortalLayout({ allowedRoles, basePath }: PortalLayoutProps) {
  const { user, isLoading } = useAuth()
  const { sidebarOpen, setSidebarOpen } = useAppStore()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    )
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} basePath={basePath} />
      
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen transition-all duration-300">
        {/* Top Header */}
        <header className="h-16 bg-background/80 backdrop-blur-md border-b flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 mr-2 rounded-md hover:bg-muted text-muted-foreground"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold tracking-tight hidden sm:block">
              {user.role === "admin" ? "Admin Portal" : "Officer Portal"}
            </h2>
          </div>
          
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <NotificationsDropdown />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
