import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { fetchAdminShops } from "@/services/adminService"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/ThemeToggle"
import { useAuth } from "@/contexts/AuthContext"
import { 
  Building2, Users, LayoutDashboard, Settings, Search, Bell, 
  Activity, ShieldCheck, MapPin, ChevronLeft, ChevronRight, CheckCircle2, XCircle
} from "lucide-react"

export function AdminShopsList() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [page, setPage] = useState(0)
  const limit = 50

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminShops', page],
    queryFn: () => fetchAdminShops(page * limit, limit),
    refetchInterval: 5000
  })
  const shops = (data as any[]) || []

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-3 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <XCircle className="w-6 h-6 text-red-600" />
        </div>
        <p className="text-lg font-semibold text-foreground mb-2">Error loading shops</p>
        <p className="text-muted-foreground text-sm">Failed to load the directory.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-muted/30">
      
      {/* ─── Sidebar ─── */}
      <aside className="w-[240px] bg-background border-r border-border hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
              V
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">VisionKirana</span>
          </div>
        </div>
        <div className="px-4 py-2 flex-1">
          <nav className="space-y-1">
            <Button variant="ghost" className="w-full justify-start h-10 font-medium text-muted-foreground hover:text-foreground" onClick={() => navigate('/admin')}>
              <LayoutDashboard className="w-4 h-4 mr-3" /> Dashboard
            </Button>
            <Button variant="secondary" className="w-full justify-start h-10 font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400">
              <Building2 className="w-4 h-4 mr-3" /> All Shops
            </Button>
            <Button variant="ghost" className="w-full justify-start h-10 font-medium text-muted-foreground hover:text-foreground" onClick={() => navigate('/admin/applications')}>
              <Activity className="w-4 h-4 mr-3" /> Applications
            </Button>
            <Button variant="ghost" className="w-full justify-start h-10 font-medium text-muted-foreground hover:text-foreground" onClick={() => navigate('/admin/users')}>
              <Users className="w-4 h-4 mr-3" /> Users Directory
            </Button>
            <Button variant="ghost" className="w-full justify-start h-10 font-medium text-muted-foreground hover:text-foreground" onClick={() => navigate('/admin/audit-logs')}>
              <ShieldCheck className="w-4 h-4 mr-3" /> Audit Logs
            </Button>
            <Button variant="ghost" className="w-full justify-start h-10 font-medium text-muted-foreground hover:text-foreground mt-4">
              <Settings className="w-4 h-4 mr-3" /> System Settings
            </Button>
          </nav>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <header className="h-16 bg-background border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-foreground hidden sm:block">Shops Directory</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search shops..." className="w-64 pl-9 h-9 bg-muted/50 border-transparent focus-visible:border-indigo-500 rounded-full" />
            </div>
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="relative rounded-full text-muted-foreground">
              <Bell className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <span className="text-sm font-medium text-foreground hidden sm:block">{user?.displayName || "Admin User"}</span>
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-sm font-semibold">
                AD
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
          <Card className="bg-background border-border shadow-sm rounded-xl overflow-hidden">
            <div className="p-5 flex justify-between items-center border-b border-border">
              <h3 className="text-base font-semibold text-foreground">Registered Shops</h3>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Shop Name</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>GPS Location</TableHead>
                    <TableHead className="text-right">Monthly Sales</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border">
                  {shops.map((shop: any) => (
                    <TableRow key={shop.id} className="hover:bg-muted/10 transition-colors">
                      <TableCell className="font-medium text-foreground">{shop.shop_name || shop.name}</TableCell>
                      <TableCell className="text-muted-foreground">{shop.owner_name}</TableCell>
                      <TableCell className="text-muted-foreground">{shop.category}</TableCell>
                      <TableCell className="text-muted-foreground">{shop.city}</TableCell>
                      <TableCell>
                        {shop.latitude && shop.longitude ? (
                          <div className="flex items-center text-emerald-600 dark:text-emerald-500 text-xs font-medium bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-md border border-emerald-200 dark:border-emerald-800/50 w-max">
                            <MapPin className="w-3 h-3 mr-1" />
                            {shop.latitude.toFixed(4)}, {shop.longitude.toFixed(4)}
                          </div>
                        ) : (
                          <div className="flex items-center text-muted-foreground text-xs font-medium bg-muted px-2 py-1 rounded-md w-max">
                            <MapPin className="w-3 h-3 mr-1 opacity-50" />
                            No Data
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium text-foreground">₹{shop.monthly_sales?.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  {shops.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        No shops registered yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex items-center justify-between p-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-2" /> Previous
              </Button>
              <span className="text-sm text-muted-foreground">Page {page + 1}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={!shops || shops.length < limit}
              >
                Next <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
