import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchAdminApplications } from "@/services/adminService"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export function AdminApplicationsList() {
  const [page, setPage] = useState(0)
  const limit = 50

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminApplications', page],
    queryFn: () => fetchAdminApplications(page * limit, limit),
    refetchInterval: 5000
  })
  const applications = (data as any[]) || []

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
        Failed to load applications.
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <FileText className="w-8 h-8 mr-3 text-primary" />
          Loan Applications
        </h1>
        <p className="text-muted-foreground mt-2">Manage and review all incoming loan applications.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Applications Directory</CardTitle>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No applications submitted yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Requested Amount</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Risk Category</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app: any) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">₹{app.requested_amount?.toLocaleString()}</TableCell>
                      <TableCell>{app.purpose}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          app.status === 'approved' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20' :
                          app.status === 'rejected' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' :
                          'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20'
                        }`}>
                          {app.status?.replace("_", " ").toUpperCase() || "PENDING"}
                        </span>
                      </TableCell>
                      <TableCell>{app.risk_category || "Unassessed"}</TableCell>
                      <TableCell className="text-right">
                        <Link to={`/applications/${app.id}/report`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" /> View Report
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex items-center px-4 py-2 border rounded-md disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Previous
            </button>
            <span className="text-sm text-muted-foreground">Page {page + 1}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!applications || applications.length < limit}
              className="flex items-center px-4 py-2 border rounded-md disabled:opacity-50"
            >
              Next <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
