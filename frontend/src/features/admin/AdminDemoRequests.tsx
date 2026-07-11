import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchAdminDemoRequests, updateAdminDemoRequestStatus, deleteAdminDemoRequest } from "@/services/adminService"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, ChevronLeft, ChevronRight, Check, X, Loader2, Trash2 } from "lucide-react"

export function AdminDemoRequests() {
  const [page, setPage] = useState(0)
  const limit = 50
  const queryClient = useQueryClient()

  const { data: requests, isLoading, error } = useQuery({
    queryKey: ['adminDemoRequests', page],
    queryFn: () => fetchAdminDemoRequests(page * limit, limit)
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => updateAdminDemoRequestStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDemoRequests'] })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminDemoRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDemoRequests'] })
    }
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
        Failed to load demo requests.
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded text-xs font-medium">Approved</span>
      case "rejected":
        return <span className="px-2 py-1 bg-red-500/10 text-red-500 rounded text-xs font-medium">Rejected</span>
      default:
        return <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded text-xs font-medium">Pending</span>
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <Users className="w-8 h-8 mr-3 text-primary" />
          Demo Requests
        </h1>
        <p className="text-muted-foreground mt-2">Manage incoming API access and demo requests.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Requests Directory</CardTitle>
        </CardHeader>
        <CardContent>
          {(requests as any[])?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No demo requests found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Use Case</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(requests as any[])?.map((req: any) => (
                    <TableRow key={req.id}>
                      <TableCell className="whitespace-nowrap text-xs">
                        {req.created_at ? new Date(req.created_at).toLocaleDateString() : 'Unknown'}
                      </TableCell>
                      <TableCell className="font-medium">{req.first_name} {req.last_name}</TableCell>
                      <TableCell>{req.company}</TableCell>
                      <TableCell>{req.work_email}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={req.use_case}>
                        {req.use_case}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(req.status || 'pending')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {(!req.status || req.status === 'pending') && (
                            <>
                              <button 
                                className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded transition-colors disabled:opacity-50"
                                title="Approve Request"
                                disabled={updateStatusMutation.isPending}
                                onClick={() => updateStatusMutation.mutate({ id: req.id, status: 'approved' })}
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button 
                                className="p-1 text-orange-500 hover:bg-orange-500/10 rounded transition-colors disabled:opacity-50"
                                title="Reject Request"
                                disabled={updateStatusMutation.isPending}
                                onClick={() => updateStatusMutation.mutate({ id: req.id, status: 'rejected' })}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button 
                            className="p-1 text-destructive hover:bg-destructive/10 rounded transition-colors disabled:opacity-50 ml-2"
                            title="Delete Request"
                            disabled={deleteMutation.isPending}
                            onClick={() => deleteMutation.mutate(req.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
              disabled={!requests || (requests as any[]).length < limit}
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
