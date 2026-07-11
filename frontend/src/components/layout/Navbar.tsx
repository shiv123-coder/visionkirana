import { useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "../ThemeToggle"
import { SyncStatusBar } from "./SyncStatusBar"
import { useAuth } from "@/contexts/AuthContext"
import { User, LogOut, LayoutDashboard, Shield } from "lucide-react"

export function Navbar() {
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SyncStatusBar />
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to={user ? (user.role === 'admin' ? '/admin' : user.role === 'loan_officer' ? '/officer' : '/dashboard') : '/'} className="flex items-center space-x-2">
          {/* Mock Logo */}
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-xl">V</span>
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            VisionKirana
          </span>
        </Link>
        
        {!user && (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#how-it-works" className="transition-colors hover:text-primary text-muted-foreground">How it Works</a>
            <a href="#intelligence" className="transition-colors hover:text-primary text-muted-foreground">Intelligence</a>
            <a href="#features" className="transition-colors hover:text-primary text-muted-foreground">Features</a>
          </nav>
        )}

        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          {user ? (
            <div className="relative" ref={menuRef}>
              <Button 
                variant="ghost" 
                className="relative h-10 w-10 rounded-full bg-gradient-to-tr from-primary/20 to-indigo-500/20 hover:from-primary/30 hover:to-indigo-500/30 border border-primary/20 ring-offset-background transition-all hover:ring-2 hover:ring-primary/40 focus:outline-none"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <span className="text-primary font-bold text-sm">{user.full_name?.charAt(0) || 'U'}</span>
              </Button>
              
              {isMenuOpen && (
                <div className="absolute right-0 mt-3 w-72 rounded-2xl border border-border/50 bg-background/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
                  <div className="p-4 bg-muted/20">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg ring-2 ring-primary/20">
                        {user.full_name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <p className="font-semibold text-sm truncate">{user.full_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <Link 
                      to={user.role === 'admin' ? '/admin' : user.role === 'loan_officer' ? '/officer' : '/dashboard'}
                      className="flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all hover:bg-primary/10 hover:text-primary group"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LayoutDashboard className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span>Dashboard</span>
                    </Link>
                    
                    {(user.role === 'admin' || user.role === 'loan_officer') && (
                      <Link 
                        to={user.role === 'admin' ? '/admin/settings' : '/officer/settings'} 
                        className="flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all hover:bg-primary/10 hover:text-primary group mt-1"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Shield className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span>{user.role === 'admin' ? 'Admin Settings' : 'Officer Settings'}</span>
                      </Link>
                    )}
                  </div>
                  
                  <div className="h-px bg-border/50" />
                  
                  <div className="p-2">
                    <div 
                      className="flex cursor-pointer items-center rounded-xl px-3 py-2.5 text-sm font-medium text-destructive transition-all hover:bg-destructive/10 group"
                      onClick={() => {
                        setIsMenuOpen(false)
                        logout()
                      }}
                    >
                      <LogOut className="mr-3 h-4 w-4 group-hover:scale-110 transition-transform" />
                      <span>Log out</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:inline-flex">
              <Link to="/login">
                <Button variant="premium">Sign In</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
