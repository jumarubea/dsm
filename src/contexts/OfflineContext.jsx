import { createContext, useContext, useEffect, useState } from 'react';
import { getQueueCount } from '../offline/queue.js';

const OfflineContext = createContext({ isOnline: true, queueCount: 0 });

export const OfflineProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [queueCount, setQueueCount] = useState(0);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    const onQueue = (e) => setQueueCount(e.detail ?? 0);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    window.addEventListener('dsm:queue-changed', onQueue);
    getQueueCount().catch(() => {});
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('dsm:queue-changed', onQueue);
    };
  }, []);

  return (
    <OfflineContext.Provider value={{ isOnline, queueCount }}>{children}</OfflineContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useOffline = () => useContext(OfflineContext);
