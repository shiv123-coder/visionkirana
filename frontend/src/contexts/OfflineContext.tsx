import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getPendingQueueCount, processQueue } from '@/lib/syncEngine';

interface OfflineContextType {
  isOnline: boolean;
  pendingItems: number;
  forceSync: () => Promise<void>;
  refreshQueueCount: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingItems, setPendingItems] = useState(0);

  const refreshQueueCount = useCallback(async () => {
    const count = await getPendingQueueCount();
    setPendingItems(count);
  }, []);

  const forceSync = useCallback(async () => {
    if (isOnline) {
      await processQueue();
      await refreshQueueCount();
    }
  }, [isOnline, refreshQueueCount]);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      await forceSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial queue check
    refreshQueueCount();
    // Try to sync on mount if online
    if (navigator.onLine) {
      forceSync();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [forceSync, refreshQueueCount]);

  // Expose context
  return (
    <OfflineContext.Provider value={{ isOnline, pendingItems, forceSync, refreshQueueCount }}>
      {children}
    </OfflineContext.Provider>
  );
}

export const useOfflineSync = () => {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOfflineSync must be used within an OfflineProvider');
  }
  return context;
};
