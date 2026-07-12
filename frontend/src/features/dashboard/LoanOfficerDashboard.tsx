import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/ThemeToggle"
import { 
  Clock, CheckCircle, FileText, Activity, LayoutDashboard, 
  Settings, Search, Bell, SearchCheck, MapPin
} from "lucide-react"
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts'
import { useQuery } from "@tanstack/react-query"
import { fetchDashboardStats } from "@/services/adminService"
import { useAuth } from "@/contexts/AuthContext"

// Mock Data for Sparklines
const sparklineData1 = [{v: 30},{v: 25},{v: 35},{v: 40},{v: 38},{v: 45},{v: 50}]
const sparklineData2 = [{v: 10},{v: 15},{v: 12},{v: 25},{v: 18},{v: 30},{v: 28}]
const sparklineData3 = [{v: 5},{v: 10},{v: 8},{v: 15},{v: 12},{v: 20},{v: 25}]
const sparklineData4 = [{v: 20},{v: 18},{v: 22},{v: 15},{v: 25},{v: 22},{v: 28}]

const mainChartData = [
  { name: 'Mon', pending: 24, reviewed: 18 },
  { name: 'Tue', pending: 13, reviewed: 28 },
  { name: 'Wed', pending: 35, reviewed: 15 },
  { name: 'Thu', pending: 18, reviewed: 22 },
  { name: 'Fri', pending: 29, reviewed: 30 },
]

export function LoanOfficerDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  
  const { data: stats, isLoading, error } = useQuery<any>({
    queryKey: ['adminDashboardStats'],
    queryFn: fetchDashboardStats,
    refetchInterval: 10000
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
          <Clock className="w-6 h-6 text-red-600" />
        </div>
        <p className="text-lg font-semibold text-foreground mb-2">Error loading dashboard</p>
        <p className="text-muted-foreground text-sm">Failed to load statistics.</p>
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
            <Button variant="secondary" className="w-full justify-start h-10 font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400">
              <LayoutDashboard className="w-4 h-4 mr-3" /> Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start h-10 font-medium text-muted-foreground hover:text-foreground" onClick={() => navigate('/admin/applications')}>
              <SearchCheck className="w-4 h-4 mr-3" /> Review Queue
            </Button>
            <Button variant="ghost" className="w-full justify-start h-10 font-medium text-muted-foreground hover:text-foreground mt-4">
              <Settings className="w-4 h-4 mr-3" /> Settings
            </Button>
          </nav>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <header className="h-16 bg-background border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-foreground hidden sm:block">Officer Workspace</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search applications..." 
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
              <span className="text-sm font-medium text-foreground hidden sm:block">{user?.displayName || "Loan Officer"}</span>
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-sm font-semibold">
                LO
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
          
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Queue Overview</h2>
          </div>

          {/* ─── KPI Cards ─── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Pending Queue", val: stats.pending_queue || 0, icon: Clock, sparkline: sparklineData1, change: "+5" },
              { title: "Approved (Week)", val: stats.approved_this_week || 0, icon: CheckCircle, sparkline: sparklineData2, change: "+20%" },
              { title: "Total Processed", val: stats.total_applications || 0, icon: Activity, sparkline: sparklineData3, change: "+12%" },
              { title: "Missing Docs", val: stats.missing_documents || 0, icon: FileText, sparkline: sparklineData4, change: "-3" },
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
                  <div className={`text-xs font-medium mb-4 ${kpi.title.includes("Pending") || kpi.title.includes("Missing") ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {kpi.change} <span className="text-muted-foreground font-normal">vs last week</span>
                  </div>
                  <div className="h-12 w-full absolute bottom-0 left-0 right-0 opacity-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={kpi.sparkline}>
                        <Line type="monotone" dataKey="v" stroke={kpi.title.includes("Missing") ? "#ef4444" : "#4f46e5"} strokeWidth={2} dot={false} isAnimationActive={false} />
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
                <CardTitle className="text-base font-semibold">Queue Volume (This Week)</CardTitle>
                <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-md border border-border">
                  <Button variant="ghost" size="sm" className="h-7 text-xs bg-white dark:bg-slate-800 shadow-sm rounded">Area Chart</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[280px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mainChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorReviewed" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} className="text-xs text-muted-foreground" dy={10} />
                      <YAxis tickLine={false} axisLine={false} className="text-xs text-muted-foreground" />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Area type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorPending)" />
                      <Area type="monotone" dataKey="reviewed" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorReviewed)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions side panel */}
            <Card className="bg-background border-border shadow-sm rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Priority Reviews</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 mt-2">
                <p className="text-sm text-muted-foreground mb-4">You have 5 high-priority applications waiting in queue.</p>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => navigate('/admin/applications')}>
                  Go to Queue
                </Button>
              </CardContent>
            </Card>
          </div>

        </div>
      </main>
    </div>
  )
}
