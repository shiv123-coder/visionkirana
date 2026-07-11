import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Bell, CheckCircle2, AlertCircle, Info, Loader2, Trash2, Check } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchAdminNotifications, markAllNotificationsAsRead, markNotificationAsRead, deleteAdminNotification } from "@/services/adminService"
import { Button } from "@/components/ui/button"

export function AdminNotifications() {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading, error } = useQuery({
    queryKey: ['adminNotifications'],
    queryFn: () => fetchAdminNotifications()
  })

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminNotifications'] })
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminNotifications'] })
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminNotification,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminNotifications'] })
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default: return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl flex justify-center mt-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <p className="text-destructive text-center">Failed to load notifications.</p>
      </div>
    )
  }

  const unreadCount = notifications?.filter((n: any) => !n.read).length || 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <Bell className="w-8 h-8 mr-3 text-primary" />
          Notifications
        </h1>
        <p className="text-muted-foreground mt-2">Manage your alerts and system notifications.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Alerts</CardTitle>
              <CardDescription>
                {unreadCount > 0 ? `You have ${unreadCount} unread messages.` : 'All caught up!'}
              </CardDescription>
            </div>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                className="text-sm text-primary hover:underline font-medium p-0 h-auto"
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
              >
                {markAllReadMutation.isPending && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
                Mark all as read
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!notifications || notifications.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No notifications yet.</p>
          ) : (
            notifications.map((notification: any) => (
              <div 
                key={notification.id} 
                className={`flex p-4 border rounded-lg transition-colors hover:bg-muted/50 ${notification.read ? 'bg-transparent' : 'bg-primary/5 border-primary/20'}`}
              >
                <div className="mr-4 mt-0.5">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <p className={`text-sm font-medium leading-none ${notification.read ? 'text-foreground' : 'text-primary'}`}>
                      {notification.title}
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(notification.time).toLocaleString()}
                      </span>
                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"
                            onClick={() => markReadMutation.mutate(notification.id)}
                            disabled={markReadMutation.isPending}
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => deleteMutation.mutate(notification.id)}
                          disabled={deleteMutation.isPending}
                          title="Delete notification"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground pt-1">
                    {notification.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
