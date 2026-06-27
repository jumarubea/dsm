import { AuthProvider } from './contexts/AuthContext.jsx';
import { OfflineProvider } from './contexts/OfflineContext.jsx';
import { AppRouter } from './routes/AppRouter.jsx';

export default function App() {
  return (
    <AuthProvider>
      <OfflineProvider>
        <AppRouter />
      </OfflineProvider>
    </AuthProvider>
  );
}
