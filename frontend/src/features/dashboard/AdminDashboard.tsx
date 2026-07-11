import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Users, Building2, TrendingUp, AlertOctagon } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { fetchDashboardStats } from "@/services/adminService"
import { getAllApplicationsApiV1AdminApplicationsGet } from "@/client"
import { useState } from "react"
import { ViewDocumentsModal } from "@/components/ui/ViewDocumentsModal"
import { FileText, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"

const COLORS = ['#10b981', '#f59e0b', '#f97316', '#ef4444']

export function AdminDashboard() {
  const { data: stats, isLoading, error } = useQuery<any>({
    queryKey: ['adminDashboardStats'],
    queryFn: fetchDashboardStats,
    refetchInterval: 5000
  })

  const { data: appsResponse } = useQuery({
    queryKey: ['adminApplications'],
    queryFn: async () => {
      const { data } = await getAllApplicationsApiV1AdminApplicationsGet()
      return data || []
    },
    refetchInterval: 10000
  })

  const [viewingDocsAppId, setViewingDocsAppId] = useState<string | null>(null)

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

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount/10000000).toFixed(2)} Cr`
    if (amount >= 100000) return `₹${(amount/100000).toFixed(2)} L`
    return `₹${amount.toLocaleString()}`
  }

  const growthData = stats.growth_data?.length > 0 ? stats.growth_data : [
    { name: 'Jan', applications: 0, disbursed: 0 }
  ]
  
  const riskData = stats.risk_data?.length > 0 ? stats.risk_data : [
    { name: 'No Data', value: 1 }
  ]

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Overview</h1>
        <p className="text-muted-foreground mt-2">System-wide platform analytics and risk distribution.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shops</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_shops}</div>
            <p className="text-xs text-muted-foreground">Registered on platform</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_applications}</div>
            <p className="text-xs text-muted-foreground">Loan applications</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Disbursed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.total_disbursed)}</div>
            <p className="text-xs text-muted-foreground">Approved amount</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Flagged</CardTitle>
            <AlertOctagon className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.high_risk_flagged}</div>
            <p className="text-xs text-muted-foreground">Requires manual review</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Platform Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDisb" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" tickLine={false} axisLine={false} />
                  <YAxis className="text-xs" tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }} />
                  <Area type="monotone" dataKey="applications" stroke="#3b82f6" fillOpacity={1} fill="url(#colorApps)" />
                  <Area type="monotone" dataKey="disbursed" stroke="#10b981" fillOpacity={1} fill="url(#colorDisb)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {riskData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">ID</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 rounded-tr-lg text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(appsResponse as any[])?.slice(0, 10).map((app: any, idx: number) => (
                    <tr key={app.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-mono">{app.id.substring(0, 8)}</td>
                      <td className="px-4 py-3 font-medium">₹{app.requested_amount?.toLocaleString() || 0}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold capitalize">
                          {app.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {app.created_at ? new Date(app.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setViewingDocsAppId(app.id)}
                            className="h-8 text-xs text-indigo-500 border-indigo-500/20 hover:bg-indigo-500/10"
                          >
                            <FileText className="w-3.5 h-3.5 mr-1" />
                            Uploads
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => window.open(`/officer/applications/${app.id}/report`, "_blank")}
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Report
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!appsResponse || (appsResponse as any[]).length === 0) && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        No applications found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Documents Modal */}
      {viewingDocsAppId && (
        <ViewDocumentsModal 
          applicationId={viewingDocsAppId} 
          isOpen={!!viewingDocsAppId} 
          onClose={() => setViewingDocsAppId(null)} 
        />
      )}
    </div>
  )
}
