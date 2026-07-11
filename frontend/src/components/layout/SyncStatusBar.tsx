import { WifiOff, RefreshCw, CheckCircle2 } from "lucide-react"
import { useOfflineSync } from "@/contexts/OfflineContext"
import { useState, useEffect } from "react"

export function SyncStatusBar() {
  const { isOnline, pendingItems, forceSync } = useOfflineSync()
  const [isSyncing, setIsSyncing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSync = async () => {
    if (!isOnline || pendingItems === 0) return;
    setIsSyncing(true)
    await forceSync()
    setIsSyncing(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  // Auto-sync visual feedback if it happens automatically
  useEffect(() => {
    if (isOnline && pendingItems > 0 && !isSyncing) {
      handleSync()
    }
  }, [isOnline])

  if (isOnline && pendingItems === 0 && !showSuccess) {
    return null; // Don't show anything if everything is fine
  }

  return (
    <div className={`w-full py-1.5 px-4 flex items-center justify-center text-xs font-medium transition-colors ${
      !isOnline ? 'bg-orange-500 text-white' : 
      showSuccess ? 'bg-emerald-500 text-white' : 
      'bg-blue-500 text-white'
    }`}>
      
      {!isOnline ? (
        <div className="flex items-center space-x-2">
          <WifiOff className="w-3.5 h-3.5" />
          <span>You are offline. {pendingItems > 0 ? `${pendingItems} changes saved locally.` : 'App is running in offline mode.'}</span>
        </div>
      ) : showSuccess ? (
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>All offline changes have been synchronized.</span>
        </div>
      ) : (
        <div className="flex items-center space-x-2 cursor-pointer" onClick={handleSync}>
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing data to server...' : `${pendingItems} pending items. Click to sync.`}</span>
        </div>
      )}
    </div>
  )
}
