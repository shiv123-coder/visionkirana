import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

interface SyncDB extends DBSchema {
  offline_requests: {
    key: number;
    value: {
      id?: number;
      url: string;
      method: string;
      headers: any;
      body: any;
      timestamp: number;
    };
    indexes: { 'by-date': number };
  };
}

let dbPromise: Promise<IDBPDatabase<SyncDB>> | null = null;

export const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<SyncDB>('vision-kirana-sync', 1, {
      upgrade(db) {
        const store = db.createObjectStore('offline_requests', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('by-date', 'timestamp');
      },
    });
  }
  return dbPromise;
};

export const enqueueRequest = async (url: string, method: string, headers: any, body: any) => {
  const db = await initDB();
  await db.add('offline_requests', {
    url,
    method,
    headers,
    body,
    timestamp: Date.now(),
  });
  console.log(`[SyncEngine] Request to ${url} queued offline.`);
};

export const getPendingQueueCount = async (): Promise<number> => {
  try {
    const db = await initDB();
    return await db.count('offline_requests');
  } catch (error) {
    return 0;
  }
};

export const processQueue = async (): Promise<void> => {
  if (!navigator.onLine) return;

  const db = await initDB();
  const tx = db.transaction('offline_requests', 'readwrite');
  const store = tx.objectStore('offline_requests');
  const requests = await store.getAll();

  if (requests.length === 0) return;

  console.log(`[SyncEngine] Processing ${requests.length} queued requests...`);

  for (const req of requests) {
    try {
      const response = await fetch(req.url, {
        method: req.method,
        headers: req.headers,
        body: JSON.stringify(req.body)
      });

      if (response.ok || response.status >= 400) {
        // If success or a bad request (don't retry client errors forever)
        const deleteTx = db.transaction('offline_requests', 'readwrite');
        await deleteTx.objectStore('offline_requests').delete(req.id!);
        await deleteTx.done;
        console.log(`[SyncEngine] Request ${req.id} processed successfully.`);
      }
    } catch (error) {
      console.error(`[SyncEngine] Failed to process request ${req.id}, will retry later.`, error);
      // Stop processing the rest to maintain order and avoid hammering while network is still flaky
      break; 
    }
  }
};
