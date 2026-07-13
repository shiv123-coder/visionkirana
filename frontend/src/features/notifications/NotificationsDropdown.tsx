import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Bell, Check, Clock, ShieldCheck, FileText, Store, Info, AlertCircle, Loader2, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { fetchAdminNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteAdminNotification } from "@/services/adminService"
import { fetchUserNotifications, markUserNotificationAsRead, markAllUserNotificationsAsRead, deleteUserNotification } from "@/services/userService"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export function NotificationsDropdown() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const isAdminOrOfficer = user?.role === 'admin' || user?.role === 'loan_officer'

  // Fetch notifications from the backend
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications", user?.role],
    queryFn: () => isAdminOrOfficer ? fetchAdminNotifications() : fetchUserNotifications(),
    enabled: !!user,
    refetchInterval: 30000 // Refetch every 30 seconds to simulate realtime
  })

  // Mark single as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => isAdminOrOfficer ? markNotificationAsRead(id) : markUserNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.role] })
    }
  })

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => isAdminOrOfficer ? markAllNotificationsAsRead() : markAllUserNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.role] })
    }
  })

  // Delete single notification mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => isAdminOrOfficer ? deleteAdminNotification(id) : deleteUserNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.role] })
    }
  })

  const unreadCount = (notifications as any[])?.filter((n: any) => !n.read).length || 0

  const handleNotificationClick = (notif: any) => {
    if (!notif.read) {
      markAsReadMutation.mutate(notif.id)
    }
    
    // Professional navigation action based on type
    setIsOpen(false)
    const basePath = user?.role === 'admin' ? '/admin' : user?.role === 'loan_officer' ? '/officer' : ''
    
    if (notif.title?.includes("Demo Request")) {
      navigate(`${basePath}/demo-requests`)
    } else if (notif.type === "new_shop_registered") {
      navigate(`${basePath}/shops`)
    } else if (notif.title?.includes("Loan Application") || notif.type.includes("analysis")) {
      navigate("/dashboard") // Shop owner goes to their dashboard to see loan updates
    } else {
      navigate(basePath ? `${basePath}/notifications` : `/dashboard`)
    }
  }

  const getIcon = (type: string) => {
    switch(type) {
      case "new_shop_registered": return <Store className="text-blue-500 w-4 h-4" />
      case "evidence_uploaded": return <FileText className="text-emerald-500 w-4 h-4" />
      case "analysis_started": return <Clock className="text-orange-500 w-4 h-4" />
      case "analysis_completed": return <ShieldCheck className="text-green-500 w-4 h-4" />
      case "info": return <Info className="text-blue-500 w-4 h-4" />
      case "alert": return <AlertCircle className="text-red-500 w-4 h-4" />
      case "success": return <Check className="text-green-500 w-4 h-4" />
      default: return <Bell className="text-muted-foreground w-4 h-4" />
    }
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full border-2 border-background"></span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-card rounded-xl shadow-lg border overflow-hidden z-50">
            <div className="p-3 border-b flex items-center justify-between bg-muted/30">
              <h3 className="font-semibold text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                  className="text-xs text-primary hover:underline flex items-center disabled:opacity-50"
                >
                  {markAllAsReadMutation.isPending ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" /> 
                  ) : (
                    <Check className="w-3 h-3 mr-1" /> 
                  )}
                  Mark all read
                </button>
              )}
            </div>
            
            <div className="max-h-[350px] overflow-y-auto">
              {isLoading ? (
                <div className="p-4 flex justify-center text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : (notifications as any[]).length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No notifications
                </div>
              ) : (
                (notifications as any[]).slice(0, 10).map((notif: any) => {
                  const isRead = notif.read
                  return (
                    <div 
                      key={notif.id} 
                      className={cn(
                        "p-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors flex items-start space-x-3 cursor-pointer group relative",
                        !isRead ? "bg-primary/5" : ""
                      )}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <div className="mt-0.5 bg-background border rounded-full p-1.5 shadow-sm group-hover:scale-110 transition-transform shrink-0">
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0 pr-8">
                        <p className={cn("text-sm truncate pr-2", !isRead ? "font-semibold" : "font-medium")}>
                          {notif.title}
                        </p>
                        <p className={cn("text-xs line-clamp-2 mt-0.5", !isRead ? "text-foreground/80" : "text-muted-foreground")}>
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {notif.time && notif.time !== "Just now" ? new Date(notif.time).toLocaleString() : "Just now"}
                        </p>
                      </div>
                      {!isRead && <div className="w-2 h-2 bg-primary rounded-full absolute right-3 top-4 shrink-0 group-hover:hidden" />}
                      
                      {/* Action Buttons (visible on hover) */}
                      <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-1 bg-card/80 backdrop-blur-sm rounded-md p-1 shadow-sm border">
                        {!isRead && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsReadMutation.mutate(notif.id);
                            }}
                            disabled={markAsReadMutation.isPending}
                            title="Mark as read"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMutation.mutate(notif.id);
                          }}
                          disabled={deleteMutation.isPending}
                          title="Delete notification"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
            
            {isAdminOrOfficer && (
              <div className="p-2 border-t bg-muted/20 text-center">
                <Link 
                  to={user?.role === 'admin' ? '/admin/notifications' : '/officer/notifications'}
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-primary font-medium hover:underline inline-block w-full py-1"
                >
                  View all notifications
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
