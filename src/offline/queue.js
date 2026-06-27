import { getDb } from './db.js';

const emitCount = async () => {
  const db = await getDb();
  const count = await db.count('sync_queue');
  window.dispatchEvent(new CustomEvent('dsm:queue-changed', { detail: count }));
  return count;
};

/**
 * Queue a write for later sync. `item.id` MUST be the idempotency key so the
 * server dedupes a replay. `item.tenant_id` is included per the offline rules.
 */
export const enqueueWrite = async (item) => {
  const db = await getDb();
  await db.put('sync_queue', { timestamp: Date.now(), retries: 0, ...item });
  return emitCount();
};

/** Drain the queue on reconnect. `send(item)` performs the actual request. */
export const drainQueue = async (send) => {
  const db = await getDb();
  const items = await db.getAll('sync_queue');
  for (const item of items) {
    try {
      await send(item);
      await db.delete('sync_queue', item.id);
    } catch {
      // Leave it queued for the next drain.
    }
  }
  return emitCount();
};
