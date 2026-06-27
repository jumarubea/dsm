import { Navigate, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext.jsx';

export const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const { t } = useTranslation();
  if (loading) return <div className="center muted">{t('common.loading')}</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
};
