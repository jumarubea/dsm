import { api } from '../api/client.js';
import { drainQueue } from './queue.js';

// Replay one queued write. Resolves (→ removed) on success or on a 409
// (idempotent replay = already applied). A non-409 4xx can never apply as-is, so
// we drop it and surface it rather than blocking the queue forever. Network/5xx
// errors throw → the item stays queued for the next attempt.
const sendItem = async (item) => {
  try {
    await api.request({
      url: item.endpoint,
      method: item.method,
      data: item.body,
      headers: { 'Idempotency-Key': item.id },
      skipIdempotency: true,
    });
  } catch (err) {
    const status = err?.response?.status;
    if (status === 409) return;
    if (status >= 400 && status < 500) {
      window.dispatchEvent(new CustomEvent('dsm:sync-failed', { detail: { item, status } }));
      return;
    }
    throw err;
  }
};

let running = false;
export const syncQueue = async () => {
  if (running) return;
  running = true;
  try {
    await drainQueue(sendItem);
  } finally {
    running = false;
  }
};

/** Wire automatic sync: on reconnect, and once now if already online. */
export const initSync = () => {
  window.addEventListener('online', () => {
    syncQueue().catch(() => {});
  });
  if (navigator.onLine) syncQueue().catch(() => {});
};
