import { openDB } from 'idb';

/** IndexedDB handle. The sync_queue store holds offline writes (keyed by idempotency key). */
export const getDb = () =>
  openDB('dsm', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('sync_queue')) {
        db.createObjectStore('sync_queue', { keyPath: 'id' });
      }
    },
  });
