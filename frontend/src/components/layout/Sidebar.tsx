import { Link, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Store,
  FileText,
  Activity,
  Settings,
  LogOut,
  Bell,
  Menu
} from "lucide-react"

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  basePath?: string
}

export function Sidebar({ isOpen, setIsOpen, basePath = "/admin" }: SidebarProps) {
  const { user, logout } = useAuth()
  const location = useLocation()

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: `${basePath}`, roles: ["admin", "loan_officer"] },
    { icon: Store, label: "Shops", href: `${basePath}/shops`, roles: ["admin", "loan_officer"] },
    { icon: FileText, label: "Applications", href: `${basePath}/applications`, roles: ["admin", "loan_officer"] },
    { icon: Users, label: "Users", href: `${basePath}/users`, roles: ["admin", "loan_officer"] },
    { icon: Users, label: "Demo Requests", href: `${basePath}/demo-requests`, roles: ["admin"] },
    { icon: Activity, label: "Audit Logs", href: `${basePath}/audit-logs`, roles: ["admin"] },
    { icon: Bell, label: "Notifications", href: `${basePath}/notifications`, roles: ["admin", "loan_officer"] },
    { icon: Settings, label: "Settings", href: `${basePath}/settings`, roles: ["admin", "loan_officer"] },
  ]

  const filteredNav = navItems.filter(item => item.roles.includes(user?.role || ""))

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-screen bg-card border-r w-64 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="h-16 flex items-center px-6 border-b shrink-0">
          <Link to={basePath} className="flex items-center space-x-2 font-bold text-xl tracking-tight text-primary">
            <span className="bg-primary text-primary-foreground w-8 h-8 rounded-lg flex items-center justify-center">V</span>
            <span>VisionKirana</span>
          </Link>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3 p-2 rounded-lg bg-muted/50">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {user?.full_name?.charAt(0) || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{user?.full_name}</p>
              <p className="text-xs text-muted-foreground capitalize truncate">{user?.role?.replace("_", " ")}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {filteredNav.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t mt-auto">
          <button
            onClick={logout}
            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
