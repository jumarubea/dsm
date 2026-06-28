import { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(() => {});

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const toast = useCallback((message, tone = 'default') => {
    const id = (idRef.current += 1);
    setToasts((list) => [...list, { id, message, tone }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3200);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toaster">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast ${t.tone === 'ok' ? 'ok' : t.tone === 'err' ? 'err' : ''}`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext);
