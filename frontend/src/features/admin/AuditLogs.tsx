import { useQuery } from "@tanstack/react-query"
import { fetchAuditLogs } from "@/services/adminService"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, ShieldAlert, ArrowRight } from "lucide-react"

export function AuditLogs() {
  const { data: logsData, isLoading, error } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: () => fetchAuditLogs()
  })

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-destructive">
        Failed to load audit logs.
      </div>
    )
  }

  const logs = logsData?.logs || []

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <Activity className="w-8 h-8 mr-3 text-primary" />
          System Audit Logs
        </h1>
        <p className="text-muted-foreground mt-2">Track all critical actions across the VisionKirana platform.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No audit logs found.
            </div>
          ) : (
            <div className="relative border-l border-muted ml-3 space-y-8 pb-4">
              {logs.map((log: any) => (
                <div key={log.id} className="relative pl-6">
                  {/* Timeline dot */}
                  <span className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background"></span>
                  
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{log.user_id}</span>
                        <span className="text-muted-foreground text-sm">({log.role})</span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        <span className="font-medium text-primary">{log.action}</span>
                      </div>
                      <div className="mt-1 flex items-center space-x-2">
                        <span className="text-xs bg-muted px-2 py-0.5 rounded uppercase font-medium tracking-wide">
                          {log.module}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          IP: {log.ip_address}
                        </span>
                      </div>
                      
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="mt-3 text-xs bg-muted/30 p-3 rounded-md border border-muted font-mono overflow-x-auto">
                          <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-2 sm:mt-0 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
