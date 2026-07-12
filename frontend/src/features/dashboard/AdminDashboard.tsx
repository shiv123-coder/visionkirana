import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/ThemeToggle"
import { 
  Building2, Users, TrendingUp, AlertOctagon, LayoutDashboard, 
  Settings, Search, Bell, Activity, ShieldCheck, MapPin
} from "lucide-react"
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts'
import { useQuery } from "@tanstack/react-query"
import { fetchDashboardStats } from "@/services/adminService"
import { getAllApplicationsApiV1AdminApplicationsGet } from "@/client"
import { useAuth } from "@/contexts/AuthContext"

// Mock Data for Sparklines
const sparklineData1 = [{v: 10},{v: 15},{v: 12},{v: 25},{v: 18},{v: 30},{v: 28}]
const sparklineData2 = [{v: 5},{v: 10},{v: 8},{v: 15},{v: 12},{v: 20},{v: 25}]
const sparklineData3 = [{v: 20},{v: 18},{v: 22},{v: 15},{v: 25},{v: 22},{v: 28}]
const sparklineData4 = [{v: 30},{v: 25},{v: 35},{v: 40},{v: 38},{v: 45},{v: 50}]

const mainChartData = [
  { name: 'Jan', value: 200000 },
  { name: 'Feb', value: 450000 },
  { name: 'Mar', value: 300000 },
  { name: 'Apr', value: 800000 },
  { name: 'May', value: 650000 },
  { name: 'Jun', value: 1200000 },
  { name: 'Jul', value: 1100000 },
  { name: 'Aug', value: 1800000 },
]

export function AdminDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  
  const { data: stats, isLoading, error } = useQuery<any>({
    queryKey: ['adminDashboardStats'],
    queryFn: fetchDashboardStats,
    refetchInterval: 10000
  })

  const { data: appsResponse } = useQuery({
    queryKey: ['adminApplications'],
    queryFn: async () => {
      const { data } = await getAllApplicationsApiV1AdminApplicationsGet()
      return data || []
    },
    refetchInterval: 15000
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-3 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <AlertOctagon className="w-6 h-6 text-red-600" />
        </div>
        <p className="text-lg font-semibold text-foreground mb-2">Error loading dashboard</p>
        <p className="text-muted-foreground text-sm">Failed to load statistics.</p>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount/10000000).toFixed(2)} Cr`
    if (amount >= 100000) return `₹${(amount/100000).toFixed(2)} L`
    return `₹${amount.toLocaleString()}`
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
            <Button variant="secondary" className="w-full justify-start h-10 font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400">
              <LayoutDashboard className="w-4 h-4 mr-3" /> Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start h-10 font-medium text-muted-foreground hover:text-foreground" onClick={() => navigate('/admin/shops')}>
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
            <h1 className="text-2xl font-bold text-foreground hidden sm:block">Admin Overview</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search platform..." 
                className="w-64 pl-9 h-9 bg-muted/50 border-transparent focus-visible:border-indigo-500 rounded-full" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
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
          
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">System Analytics</h2>
          </div>

          {/* ─── KPI Cards ─── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Total Shops", val: stats.total_shops, icon: Building2, sparkline: sparklineData1, change: "+12.4%" },
              { title: "Total Applications", val: stats.total_applications, icon: Activity, sparkline: sparklineData2, change: "+8.2%" },
              { title: "Total Disbursed", val: formatCurrency(stats.total_disbursed), icon: TrendingUp, sparkline: sparklineData3, change: "+3.9%" },
              { title: "Risk Alerts", val: stats.high_risk_shops || 0, icon: AlertOctagon, sparkline: sparklineData4, change: "-1.2%" },
            ].map((kpi, i) => (
              <Card key={i} className="bg-background border-border shadow-sm rounded-xl overflow-hidden">
                <CardContent className="p-5 relative pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium text-foreground">{kpi.title}</p>
                    <div className="p-1.5 rounded-md bg-muted text-muted-foreground">
                      <kpi.icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-1">{kpi.val}</h3>
                  <div className={`text-xs font-medium mb-4 ${kpi.title === "Risk Alerts" ? 'text-emerald-600' : 'text-emerald-600'}`}>
                    {kpi.change} <span className="text-muted-foreground font-normal">vs last month</span>
                  </div>
                  <div className="h-12 w-full absolute bottom-0 left-0 right-0 opacity-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={kpi.sparkline}>
                        <Line type="monotone" dataKey="v" stroke={kpi.title === "Risk Alerts" ? "#ef4444" : "#4f46e5"} strokeWidth={2} dot={false} isAnimationActive={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ─── Chart & Side Panel ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Area Chart */}
            <Card className="lg:col-span-2 bg-background border-border shadow-sm rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold">Disbursement Overview (YTD)</CardTitle>
                <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-md border border-border">
                  <Button variant="ghost" size="sm" className="h-7 text-xs bg-white dark:bg-slate-800 shadow-sm rounded">Area Chart</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[280px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mainChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} className="text-xs text-muted-foreground" dy={10} />
                      <YAxis tickLine={false} axisLine={false} className="text-xs text-muted-foreground" tickFormatter={(val) => `₹${val/1000}k`} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Disbursed']}
                      />
                      <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Platform Activity side panel */}
            <Card className="bg-background border-border shadow-sm rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 mt-2">
                {appsResponse?.filter((app: any) => app.id.toString().includes(searchQuery) || (app.status || "").toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5).map((app: any) => (
                  <div key={app.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                      <Activity className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground line-clamp-1">App #{app.id} - {app.status}</p>
                      <p className="text-xs text-muted-foreground">₹{app.requested_amount?.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

        </div>
      </main>
    </div>
  )
}
