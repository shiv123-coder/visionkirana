import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Bell, Check, Clock, ShieldCheck, FileText, Store, Info, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { fetchAdminNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/services/adminService"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"

export function NotificationsDropdown() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Fetch notifications from the backend
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["adminNotifications"],
    queryFn: () => fetchAdminNotifications(),
    enabled: !!user,
    refetchInterval: 30000 // Refetch every 30 seconds to simulate realtime
  })

  // Mark single as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminNotifications"] })
    }
  })

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminNotifications"] })
    }
  })

  const unreadCount = (notifications as any[])?.filter((n: any) => !n.read).length || 0

  const handleNotificationClick = (notif: any) => {
    if (!notif.read) {
      markAsReadMutation.mutate(notif.id)
    }
    
    // Professional navigation action based on type
    setIsOpen(false)
    const basePath = user?.role === 'admin' ? '/admin' : '/officer'
    
    if (notif.type === "info" || notif.title.includes("Demo Request")) {
      navigate(`${basePath}/demo-requests`)
    } else if (notif.type === "new_shop_registered") {
      navigate(`${basePath}/shops`)
    } else {
      navigate(`${basePath}/notifications`)
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
                        "p-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors flex items-start space-x-3 cursor-pointer group",
                        !isRead ? "bg-primary/5" : ""
                      )}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <div className="mt-0.5 bg-background border rounded-full p-1.5 shadow-sm group-hover:scale-110 transition-transform">
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm truncate", !isRead ? "font-semibold" : "font-medium")}>
                          {notif.title}
                        </p>
                        <p className={cn("text-xs line-clamp-2 mt-0.5", !isRead ? "text-foreground/80" : "text-muted-foreground")}>
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {notif.time && notif.time !== "Just now" ? new Date(notif.time).toLocaleString() : "Just now"}
                        </p>
                      </div>
                      {!isRead && <div className="w-2 h-2 bg-primary rounded-full mt-1.5 shrink-0" />}
                    </div>
                  )
                })
              )}
            </div>
            
            <div className="p-2 border-t bg-muted/20 text-center">
              <Link 
                to={user?.role === 'admin' ? '/admin/notifications' : '/officer/notifications'}
                onClick={() => setIsOpen(false)}
                className="text-xs text-primary font-medium hover:underline inline-block w-full py-1"
              >
                View all notifications
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
