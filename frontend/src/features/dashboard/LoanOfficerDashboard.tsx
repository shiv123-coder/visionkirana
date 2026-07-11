import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Clock, CheckCircle, FileText, Activity } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { fetchDashboardStats } from "@/services/adminService"
import { useNavigate } from "react-router-dom"

const queueData = [
  { name: 'Mon', pending: 24, reviewed: 18 },
  { name: 'Tue', pending: 13, reviewed: 28 },
  { name: 'Wed', pending: 35, reviewed: 15 },
  { name: 'Thu', pending: 18, reviewed: 22 },
  { name: 'Fri', pending: 29, reviewed: 30 },
]

export function LoanOfficerDashboard() {
  const navigate = useNavigate()
  const { data: stats, isLoading, error } = useQuery<any>({
    queryKey: ['adminDashboardStats'],
    queryFn: fetchDashboardStats,
    refetchInterval: 5000
  })

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8 flex items-center justify-center min-h-[500px]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          Failed to load dashboard statistics.
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Officer Workspace</h1>
        <p className="text-muted-foreground mt-2">Manage your application queue and review AI risk assessments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Queue</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending_queue || 0}</div>
            <p className="text-xs text-muted-foreground">Applications await review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved This Week</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved_this_week || 0}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Processed</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_applications || 0}</div>
            <p className="text-xs text-muted-foreground">Since launch</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missing Documents</CardTitle>
            <FileText className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.missing_documents || 0}</div>
            <p className="text-xs text-muted-foreground">Require follow up</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Queue Volume</CardTitle>
            <CardDescription>Daily pending vs reviewed applications.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={queueData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }} cursor={{fill: 'transparent'}}/>
                  <Legend />
                  <Bar dataKey="pending" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  <Bar dataKey="reviewed" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Priority Action</CardTitle>
            <CardDescription>Applications needing immediate review.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.priority_actions && stats.priority_actions.length > 0 ? (
                stats.priority_actions.map((app: any, i: number) => (
                  <div 
                    key={i} 
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/officer/applications/${app.id}/report`)}
                  >
                    <div>
                      <p className="font-medium text-sm">App #{app.id.substring(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">{app.risk_category || "High Risk"}</p>
                    </div>
                    <div className="text-xs font-medium px-2 py-1 bg-red-100 text-red-700 rounded-full">
                      Review
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-4 text-muted-foreground text-sm">
                  No pending high-risk applications.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
