import { AuthProvider } from './contexts/AuthContext.jsx';
import { OfflineProvider } from './contexts/OfflineContext.jsx';
import { ToastProvider } from './contexts/ToastContext.jsx';
import { AppRouter } from './routes/AppRouter.jsx';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <OfflineProvider>
          <AppRouter />
        </OfflineProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
