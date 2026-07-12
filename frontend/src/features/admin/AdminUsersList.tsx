import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchAdminUsers, updateUserRole, createUser, updateUserStatus, resetUserPassword } from "@/services/adminService"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Users, ChevronLeft, ChevronRight, Loader2, Search, Plus, KeyRound, ShieldAlert, Power } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export function AdminUsersList() {
  const { user: currentUser } = useAuth()
  const [page, setPage] = useState(0)
  const limit = 50
  const queryClient = useQueryClient()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  
  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState<string | null>(null) // user_id
  const [resetPasswordValue, setResetPasswordValue] = useState("")
  
  // Create user form state
  const [newUser, setNewUser] = useState({ email: "", full_name: "", password: "", role: "loan_officer" })

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminUsers', page],
    queryFn: () => fetchAdminUsers(page * limit, limit),
    refetchInterval: 5000
  })
  const users = (data as any[]) || []

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string, role: string }) => updateUserRole(userId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
  })

  const createMutation = useMutation({
    mutationFn: (payload: any) => createUser(payload),
    onSuccess: () => {
      setShowCreateModal(false)
      setNewUser({ email: "", full_name: "", password: "", role: "loan_officer" })
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
    }
  })

  const statusMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string, isActive: boolean }) => updateUserStatus(userId, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
  })

  const resetMutation = useMutation({
    mutationFn: ({ userId, newPassword }: { userId: string, newPassword: string }) => resetUserPassword(userId, newPassword),
    onSuccess: () => {
      setShowResetModal(null)
      setResetPasswordValue("")
    }
  })

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Hide admin users from loan officers
      if (currentUser?.role === 'loan_officer' && user.role === 'admin') {
        return false;
      }
      
      const matchesSearch = user.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            user.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    })
  }, [users, searchQuery, roleFilter, currentUser])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-destructive">
        Failed to load users.
      </div>
    )
  }

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(newUser)
  }

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (showResetModal) {
      resetMutation.mutate({ userId: showResetModal, newPassword: resetPasswordValue })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Users className="w-8 h-8 mr-3 text-primary" />
            IAM Directory
          </h1>
          <p className="text-muted-foreground mt-2">Manage all registered users, roles, and access across the platform.</p>
        </div>
        {currentUser?.role === 'admin' && (
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" /> Create User
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <CardTitle>User Accounts</CardTitle>
            <div className="flex flex-1 w-full sm:w-auto sm:justify-end gap-2">
              <div className="relative max-w-sm w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search email or name..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                {currentUser?.role !== 'loan_officer' && <option value="admin">Admins</option>}
                <option value="loan_officer">Loan Officers</option>
                <option value="shop_owner">Shop Owners</option>
                <option value="user">Standard Users</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found matching your filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    {currentUser?.role === 'admin' && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user: any) => (
                    <TableRow key={user.uid || user.id} className={!user.is_active && user.is_active !== undefined ? "opacity-60" : ""}>
                      <TableCell>
                        <div className="font-medium">{user.full_name || "Unknown"}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </TableCell>
                      <TableCell>
                        {currentUser?.role === 'admin' ? (
                          <select 
                            value={user.role || 'user'}
                            onChange={(e) => roleMutation.mutate({ userId: user.uid, role: e.target.value })}
                            disabled={roleMutation.isPending || (!user.is_active && user.is_active !== undefined)}
                            className={`px-2 py-1.5 rounded-md text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 border transition-colors cursor-pointer disabled:opacity-50 ${
                              user.role === 'admin' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 hover:bg-purple-500/20' :
                              user.role === 'loan_officer' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/20' :
                              user.role === 'shop_owner' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' :
                              'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20 hover:bg-slate-500/20'
                            }`}
                          >
                            <option value="user">USER</option>
                            <option value="shop_owner">SHOP OWNER</option>
                            <option value="loan_officer">LOAN OFFICER</option>
                            <option value="admin">ADMIN</option>
                          </select>
                        ) : (
                          <Badge variant="outline" className={`
                            ${user.role === 'admin' ? 'text-purple-600 border-purple-500/20' :
                              user.role === 'loan_officer' ? 'text-blue-600 border-blue-500/20' :
                              user.role === 'shop_owner' ? 'text-emerald-600 border-emerald-500/20' :
                              'text-slate-600 border-slate-500/20'}
                          `}>
                            {user.role?.replace("_", " ").toUpperCase() || "USER"}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {(user.is_active === undefined || user.is_active) ? (
                          <Badge variant="default" className="bg-emerald-500">Active</Badge>
                        ) : (
                          <Badge variant="destructive">Suspended</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                      </TableCell>
                      {currentUser?.role === 'admin' && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setShowResetModal(user.uid)}
                              title="Reset Password"
                            >
                              <KeyRound className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant={(user.is_active === undefined || user.is_active) ? "outline" : "default"} 
                              className={(user.is_active === undefined || user.is_active) ? "text-destructive hover:text-destructive" : "bg-emerald-600 hover:bg-emerald-700"}
                              size="sm"
                              onClick={() => statusMutation.mutate({ userId: user.uid, isActive: !(user.is_active === undefined || user.is_active) })}
                              disabled={statusMutation.isPending && statusMutation.variables?.userId === user.uid}
                              title={(user.is_active === undefined || user.is_active) ? "Deactivate Account" : "Activate Account"}
                            >
                              {statusMutation.isPending && statusMutation.variables?.userId === user.uid ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Power className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Previous
            </Button>
            <span className="text-sm text-muted-foreground">Page {page + 1}</span>
            <Button
              variant="outline"
              onClick={() => setPage(p => p + 1)}
              disabled={!users || users.length < limit}
            >
              Next <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <form onSubmit={handleCreateUser}>
              <CardHeader>
                <CardTitle>Create New User</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input 
                    required 
                    value={newUser.full_name} 
                    onChange={e => setNewUser({...newUser, full_name: e.target.value})} 
                    placeholder="John Doe" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <Input 
                    required 
                    type="email" 
                    value={newUser.email} 
                    onChange={e => setNewUser({...newUser, email: e.target.value})} 
                    placeholder="john@example.com" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Temporary Password</label>
                  <Input 
                    required 
                    type="password" 
                    value={newUser.password} 
                    onChange={e => setNewUser({...newUser, password: e.target.value})} 
                    placeholder="Min 6 characters" 
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">System Role</label>
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  >
                    <option value="admin">Admin</option>
                    <option value="loan_officer">Loan Officer</option>
                    <option value="shop_owner">Shop Owner</option>
                  </select>
                </div>
                {createMutation.isError && (
                  <p className="text-sm text-destructive mt-2">{createMutation.error?.message}</p>
                )}
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Create Account
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm">
            <form onSubmit={handleResetPassword}>
              <CardHeader>
                <CardTitle className="flex items-center text-destructive">
                  <ShieldAlert className="w-5 h-5 mr-2" />
                  Force Password Reset
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  This will immediately change the user's password and override their current credentials.
                </p>
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Password</label>
                  <Input 
                    required 
                    type="password" 
                    value={resetPasswordValue} 
                    onChange={e => setResetPasswordValue(e.target.value)} 
                    placeholder="Enter new password" 
                    minLength={6}
                  />
                </div>
                {resetMutation.isError && (
                  <p className="text-sm text-destructive mt-2">{resetMutation.error?.message}</p>
                )}
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => {setShowResetModal(null); setResetPasswordValue("")}}>Cancel</Button>
                  <Button type="submit" variant="destructive" disabled={resetMutation.isPending}>
                    {resetMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Reset Password
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
